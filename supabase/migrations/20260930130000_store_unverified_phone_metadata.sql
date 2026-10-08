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
    false,
    false
  )
  on conflict (id) do update set
    email = excluded.email,
    phone = excluded.phone,
    email_verified = false,
    phone_verified = false;
  return new;
end;
$$;
