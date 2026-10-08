alter table public.profiles
  add column if not exists role text not null default 'user',
  add column if not exists email_verified boolean not null default false,
  add column if not exists phone_verified boolean not null default false;

update public.profiles
set role = case when coalesce(is_admin, false) then 'admin' else 'user' end
where role not in ('user', 'admin') or (role = 'user' and coalesce(is_admin, false));

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('user', 'admin'));
alter table public.profiles drop column if exists is_admin;

create table if not exists public.admin_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  email text not null default '',
  phone text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz
);

create index if not exists admin_requests_pending_created_idx
  on public.admin_requests (created_at) where status = 'pending';

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create or replace function public.is_current_user_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin();
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id, email, display_name, phone, role, email_verified, phone_verified
  ) values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'display_name', ''),
    coalesce(new.phone, ''),
    'user',
    new.email_confirmed_at is not null,
    new.phone_confirmed_at is not null
  )
  on conflict (id) do update set
    email = excluded.email,
    phone = excluded.phone,
    email_verified = excluded.email_verified,
    phone_verified = excluded.phone_verified,
    display_name = case
      when public.profiles.display_name = '' then excluded.display_name
      else public.profiles.display_name
    end;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update of email, phone, email_confirmed_at, phone_confirmed_at on auth.users
for each row execute procedure public.handle_new_auth_user();

update public.profiles as profile
set email = coalesce(auth_user.email, ''),
    phone = coalesce(auth_user.phone, ''),
    email_verified = auth_user.email_confirmed_at is not null,
    phone_verified = auth_user.phone_confirmed_at is not null
from auth.users as auth_user
where profile.id = auth_user.id;

create or replace function public.create_admin_request_for_verified_contacts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role = 'user' and new.email_verified and new.phone_verified then
    insert into public.admin_requests (user_id, email, phone)
    values (new.id, coalesce(new.email, ''), coalesce(new.phone, ''))
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists profile_verified_contacts_admin_request on public.profiles;
create trigger profile_verified_contacts_admin_request
after insert or update of email_verified, phone_verified on public.profiles
for each row execute procedure public.create_admin_request_for_verified_contacts();

alter table public.profiles enable row level security;
drop policy if exists profiles_read_self_or_admin on public.profiles;
create policy profiles_read_self_or_admin on public.profiles
for select to authenticated
using (id = (select auth.uid()) or public.is_admin());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

revoke update on public.profiles from anon, authenticated;
grant update (display_name, address) on public.profiles to authenticated;
grant select on public.profiles to authenticated;

alter table public.admin_requests enable row level security;
drop policy if exists admin_requests_admin_read on public.admin_requests;
create policy admin_requests_admin_read on public.admin_requests
for select to authenticated using (public.is_admin());
revoke all on public.admin_requests from anon, authenticated;
revoke all on public.admin_requests from public;

create or replace function public.list_admin_requests()
returns table (
  id uuid,
  email text,
  phone text,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Access denied' using errcode = '42501';
  end if;

  return query
  select request.id, request.email, request.phone, request.created_at
  from public.admin_requests as request
  where request.status = 'pending'
  order by request.created_at asc;
end;
$$;

create or replace function public.review_admin_request(request_id uuid, decision text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_user_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Access denied' using errcode = '42501';
  end if;
  if decision is null or decision not in ('approved', 'rejected') then
    raise exception 'Invalid decision' using errcode = '22023';
  end if;

  update public.admin_requests
  set status = decision,
      reviewed_by = auth.uid(),
      reviewed_at = now()
  where id = request_id and status = 'pending'
  returning user_id into target_user_id;

  if target_user_id is null then
    raise exception 'Request unavailable' using errcode = 'P0002';
  end if;

  if decision = 'approved' then
    update public.profiles set role = 'admin' where id = target_user_id;
  end if;
end;
$$;

revoke all on function public.is_current_user_admin() from public, anon;
revoke all on function public.is_admin() from public, anon;
revoke all on function public.list_admin_requests() from public, anon;
revoke all on function public.review_admin_request(uuid, text) from public, anon;
grant execute on function public.is_current_user_admin() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin() to anon;
grant execute on function public.list_admin_requests() to authenticated;
grant execute on function public.review_admin_request(uuid, text) to authenticated;

comment on table public.admin_requests is 'Restricted review queue. Request rows are created only by the verified-profile database trigger.';