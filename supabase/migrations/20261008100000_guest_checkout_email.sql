create table if not exists public.order_email_confirmations (
  order_id text primary key references public.orders (id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz
);

alter table public.order_email_confirmations enable row level security;
revoke all on public.order_email_confirmations from public, anon, authenticated;

drop policy if exists orders_owner_or_admin_read on public.orders;
drop policy if exists orders_admin_read on public.orders;
create policy orders_admin_read on public.orders
for select to authenticated using (public.is_admin());

revoke all on function public.place_order_atomic(jsonb) from public, anon, authenticated;

create or replace function public.place_guest_order(p_order_data jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  customer_name text;
  customer_email text;
  customer_phone text;
  customer_address text;
  order_payload jsonb;
  saved_order jsonb;
  confirmation_token text;
begin
  if jsonb_typeof(p_order_data -> 'customer') <> 'object' then
    raise exception 'Customer details are required';
  end if;

  customer_name := btrim(coalesce(p_order_data #>> '{customer,name}', ''));
  customer_email := lower(btrim(coalesce(p_order_data #>> '{customer,email}', '')));
  customer_phone := btrim(coalesce(p_order_data #>> '{customer,phone}', ''));
  customer_address := btrim(coalesce(p_order_data #>> '{customer,address}', ''));

  if customer_name = '' or length(customer_name) > 120 then
    raise exception 'A valid customer name is required';
  end if;
  if customer_address = '' or length(customer_address) > 1000 then
    raise exception 'A valid delivery address is required';
  end if;
  if customer_phone !~ '^[+][1-9][0-9]{7,14}$' then
    raise exception 'Phone must use international format';
  end if;
  if customer_email <> '' and customer_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+[.][A-Za-z]{2,}$' then
    raise exception 'A valid email address is required';
  end if;
  if length(customer_email) > 254 then
    raise exception 'Email address is too long';
  end if;

  order_payload := jsonb_set(
    jsonb_set(
      jsonb_set(p_order_data, '{customer,name}', to_jsonb(customer_name), true),
      '{customer,email}', to_jsonb(customer_email), true
    ),
    '{customer,address}', to_jsonb(customer_address), true
  );
  order_payload := jsonb_set(order_payload, '{customer,phone}', to_jsonb(customer_phone), true);

  saved_order := public.place_order_atomic(order_payload);

  if customer_email <> '' then
    confirmation_token := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
    insert into public.order_email_confirmations (order_id, token_hash, expires_at)
    values (
      saved_order ->> 'id',
      encode(digest(convert_to(confirmation_token, 'UTF8'), 'sha256'), 'hex'),
      now() + interval '1 day'
    );
    return saved_order || jsonb_build_object('emailConfirmationToken', confirmation_token);
  end if;

  return saved_order;
end;
$$;

revoke all on function public.place_guest_order(jsonb) from public;
grant execute on function public.place_guest_order(jsonb) to anon, authenticated;

create or replace function public.claim_order_confirmation(p_order_id text, p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  claimed_order_id text;
  saved_order jsonb;
begin
  if p_token is null or length(p_token) <> 64 then
    raise exception 'Confirmation unavailable' using errcode = '42501';
  end if;

  select confirmation.order_id into claimed_order_id
  from public.order_email_confirmations as confirmation
  where confirmation.order_id = p_order_id
    and confirmation.token_hash = encode(digest(convert_to(p_token, 'UTF8'), 'sha256'), 'hex')
    and confirmation.used_at is null
    and confirmation.expires_at > now()
  for update;

  if claimed_order_id is null then
    raise exception 'Confirmation unavailable' using errcode = '42501';
  end if;

  update public.order_email_confirmations
  set used_at = now()
  where order_id = claimed_order_id;

  select data into saved_order from public.orders where id = claimed_order_id;
  if saved_order is null or coalesce(saved_order #>> '{customer,email}', '') = '' then
    raise exception 'Confirmation unavailable' using errcode = '42501';
  end if;
  return saved_order;
end;
$$;

revoke all on function public.claim_order_confirmation(text, text) from public, anon, authenticated;
grant execute on function public.claim_order_confirmation(text, text) to service_role;

create or replace function public.submit_guest_review(p_review_data jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  review_id text := 'rev-' || replace(gen_random_uuid()::text, '-', '');
  product_id text := p_review_data ->> 'productId';
  reviewer_name text := btrim(coalesce(p_review_data ->> 'userName', ''));
  review_comment text := btrim(coalesce(p_review_data ->> 'comment', ''));
  review_title text := btrim(coalesce(p_review_data ->> 'title', ''));
  review_rating integer := coalesce((p_review_data ->> 'rating')::integer, 0);
  saved_review jsonb;
begin
  if product_id is null or not exists (select 1 from public.products where id = product_id) then
    raise exception 'Product not found';
  end if;
  if reviewer_name = '' or length(reviewer_name) > 80 then
    raise exception 'A valid reviewer name is required';
  end if;
  if review_rating not between 1 and 5 then
    raise exception 'Rating must be between 1 and 5';
  end if;
  if length(review_comment) < 3 or length(review_comment) > 3000 then
    raise exception 'Review comment length is invalid';
  end if;

  saved_review := jsonb_build_object(
    'id', review_id,
    'productId', product_id,
    'userId', null,
    'userName', reviewer_name,
    'userLocation', '',
    'rating', review_rating,
    'title', left(coalesce(nullif(review_title, ''), review_rating || '-Star Review'), 120),
    'comment', review_comment,
    'verifiedPurchase', false,
    'status', 'pending',
    'createdAt', now()
  );

  insert into public.reviews (id, product_id, user_id, status, data)
  values (review_id, product_id, null, 'pending', saved_review);

  return saved_review;
end;
$$;

revoke all on function public.submit_review(jsonb) from public, anon, authenticated;
revoke all on function public.submit_guest_review(jsonb) from public;
grant execute on function public.submit_guest_review(jsonb) to anon, authenticated;