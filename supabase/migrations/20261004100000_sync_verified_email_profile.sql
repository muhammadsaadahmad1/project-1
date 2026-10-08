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
    coalesce(new.phone, new.raw_user_meta_data ->> 'phone', ''),
    'user',
    new.email_confirmed_at is not null,
    new.phone_confirmed_at is not null
  )
  on conflict (id) do update set
    email = excluded.email,
    phone = excluded.phone,
    email_verified = excluded.email_verified,
    phone_verified = excluded.phone_verified;
  return new;
end;
$$;

update public.profiles as profile
set email = coalesce(auth_user.email, ''),
    phone = coalesce(auth_user.phone, auth_user.raw_user_meta_data ->> 'phone', ''),
    email_verified = auth_user.email_confirmed_at is not null,
    phone_verified = auth_user.phone_confirmed_at is not null
from auth.users as auth_user
where profile.id = auth_user.id;
