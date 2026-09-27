create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null default '',
  display_name text not null default '',
  phone text not null default '',
  address text not null default '',
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  user_id uuid references auth.users (id) on delete set null,
  status text not null default 'pending',
  payment_status text not null default 'pending',
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id text primary key,
  product_id text not null references public.products (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.store_settings (
  id text primary key check (id = 'main'),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_created_idx on public.orders (user_id, created_at desc);
create index if not exists reviews_product_status_idx on public.reviews (product_id, status);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and is_admin = true
  );
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_auth_user();

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.reviews enable row level security;
alter table public.store_settings enable row level security;

create policy "profiles_read_self_or_admin" on public.profiles
for select to authenticated using (id = (select auth.uid()) or public.is_admin());
create policy "profiles_update_self" on public.profiles
for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

revoke all on public.profiles, public.products, public.orders, public.reviews, public.store_settings from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name, phone, address) on public.profiles to authenticated;
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant select on public.orders to authenticated;
grant select on public.reviews to anon, authenticated;
grant insert, update, delete on public.reviews to authenticated;
grant select on public.store_settings to anon, authenticated;
grant insert, update on public.store_settings to authenticated;

create policy "products_public_read" on public.products
for select to anon, authenticated using (true);
create policy "products_admin_insert" on public.products
for insert to authenticated with check (public.is_admin());
create policy "products_admin_update" on public.products
for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "products_admin_delete" on public.products
for delete to authenticated using (public.is_admin());

create policy "orders_owner_or_admin_read" on public.orders
for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());
create policy "orders_admin_update" on public.orders
for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "reviews_public_approved_read" on public.reviews
for select to anon, authenticated using (status = 'approved' or user_id = (select auth.uid()) or public.is_admin());
create policy "reviews_customer_insert" on public.reviews
for insert to authenticated with check (user_id = (select auth.uid()) and status = 'pending');
create policy "reviews_admin_update" on public.reviews
for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "reviews_admin_delete" on public.reviews
for delete to authenticated using (public.is_admin());

create policy "settings_public_read" on public.store_settings
for select to anon, authenticated using (true);
create policy "settings_admin_write" on public.store_settings
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.update_product_data(p_product_id text, p_patch jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  update public.products
  set data = data || p_patch, updated_at = now()
  where id = p_product_id;
  if not found then raise exception 'Product not found'; end if;
end;
$$;

create or replace function public.set_product_stock(p_product_id text, p_variation_id text, p_stock integer)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_data jsonb;
  updated_variations jsonb;
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  if p_stock < 0 then raise exception 'Stock cannot be negative'; end if;

  select data into current_data from public.products where id = p_product_id for update;
  if not found then raise exception 'Product not found'; end if;

  select jsonb_agg(
    case when coalesce(item ->> 'id', '') = p_variation_id or item ->> 'size' = p_variation_id
      then jsonb_set(item, '{stock}', to_jsonb(p_stock), true)
      else item
    end order by ordinal
  ) into updated_variations
  from jsonb_array_elements(coalesce(current_data -> 'variations', '[]'::jsonb)) with ordinality as variations(item, ordinal);

  if not exists (
    select 1 from jsonb_array_elements(coalesce(current_data -> 'variations', '[]'::jsonb)) item
    where coalesce(item ->> 'id', '') = p_variation_id or item ->> 'size' = p_variation_id
  ) then raise exception 'Product variation not found'; end if;

  update public.products
  set data = jsonb_set(current_data, '{variations}', coalesce(updated_variations, '[]'::jsonb), true), updated_at = now()
  where id = p_product_id;
end;
$$;

create or replace function public.place_order_atomic(p_order_data jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  order_item jsonb;
  product_data jsonb;
  variation_data jsonb;
  updated_variations jsonb;
  requested_quantity integer;
  unit_price numeric;
  computed_subtotal numeric := 0;
  shipping_threshold numeric := 150;
  computed_shipping numeric;
  order_id text;
  saved_order jsonb;
begin
  if jsonb_typeof(p_order_data -> 'items') <> 'array' or jsonb_array_length(p_order_data -> 'items') = 0 then
    raise exception 'Order must contain at least one item';
  end if;

  for order_item in select value from jsonb_array_elements(p_order_data -> 'items') loop
    requested_quantity := (order_item ->> 'quantity')::integer;
    if requested_quantity is null or requested_quantity < 1 then raise exception 'Invalid item quantity'; end if;

    select data into product_data
    from public.products
    where id = order_item ->> 'productId'
    for update;
    if not found then raise exception 'Product no longer exists'; end if;

    select value into variation_data
    from jsonb_array_elements(coalesce(product_data -> 'variations', '[]'::jsonb)) value
    where (order_item ->> 'variationId' is not null and value ->> 'id' = order_item ->> 'variationId')
       or (value ->> 'size' = order_item ->> 'size')
    limit 1;
    if variation_data is null then raise exception 'Selected variation is unavailable'; end if;
    if coalesce((variation_data ->> 'stock')::integer, 0) < requested_quantity then
      raise exception 'Insufficient stock for %', order_item ->> 'productName' using errcode = 'P0001';
    end if;
    if (variation_data ->> 'price')::numeric <> (order_item ->> 'price')::numeric then
      raise exception 'Product price changed; refresh the cart';
    end if;
    unit_price := (variation_data ->> 'price')::numeric;
    computed_subtotal := computed_subtotal + unit_price * requested_quantity;

    select jsonb_agg(
      case
        when (order_item ->> 'variationId' is not null and item ->> 'id' = order_item ->> 'variationId')
          or item ->> 'size' = order_item ->> 'size'
        then jsonb_set(item, '{stock}', to_jsonb((item ->> 'stock')::integer - requested_quantity), true)
        else item
      end order by ordinal
    ) into updated_variations
    from jsonb_array_elements(coalesce(product_data -> 'variations', '[]'::jsonb)) with ordinality as variations(item, ordinal);

    update public.products
    set data = jsonb_set(product_data, '{variations}', coalesce(updated_variations, '[]'::jsonb), true), updated_at = now()
    where id = order_item ->> 'productId';
  end loop;

  select coalesce((data ->> 'freeShippingThreshold')::numeric, 150)
  into shipping_threshold from public.store_settings where id = 'main';
  shipping_threshold := coalesce(shipping_threshold, 150);
  computed_shipping := case when computed_subtotal = 0 or computed_subtotal >= shipping_threshold then 0 else 15 end;

  order_id := 'ORD-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
  saved_order := p_order_data || jsonb_build_object(
    'id', order_id,
    'userId', auth.uid(),
    'subtotal', computed_subtotal,
    'shipping', computed_shipping,
    'total', computed_subtotal + computed_shipping,
    'status', 'pending',
    'paymentStatus', 'pending',
    'createdAt', now(),
    'whatsappNotified', false
  );

  insert into public.orders (id, user_id, status, payment_status, data)
  values (order_id, auth.uid(), 'pending', 'pending', saved_order);

  return saved_order;
end;
$$;

grant execute on function public.place_order_atomic(jsonb) to anon, authenticated;

grant execute on function public.update_product_data(text, jsonb) to authenticated;
grant execute on function public.set_product_stock(text, text, integer) to authenticated;

create or replace function public.update_order_status(p_order_id text, p_status text)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_order jsonb;
begin
  if not public.is_admin() then raise exception 'Admin access required' using errcode = '42501'; end if;
  if p_status not in ('pending', 'confirmed', 'preparing', 'shipped', 'rejected') then raise exception 'Invalid order status'; end if;
  select data into current_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'Order not found'; end if;
  update public.orders
  set status = p_status,
      data = current_order || jsonb_build_object('status', p_status, 'updatedAt', now()),
      updated_at = now()
  where id = p_order_id;
end;
$$;

grant execute on function public.update_order_status(text, text) to authenticated;

create or replace function public.update_review_status(p_review_id text, p_status text)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  review_data jsonb;
begin
  if not public.is_admin() then raise exception 'Admin access required' using errcode = '42501'; end if;
  if p_status not in ('pending', 'approved', 'rejected') then raise exception 'Invalid review status'; end if;
  select data into review_data from public.reviews where id = p_review_id for update;
  if not found then raise exception 'Review not found'; end if;
  update public.reviews set status = p_status, data = review_data || jsonb_build_object('status', p_status) where id = p_review_id;
end;
$$;

grant execute on function public.update_review_status(text, text) to authenticated;

create or replace function public.submit_review(p_review_data jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  review_id text;
  review_status text;
  saved_review jsonb;
  product_id text;
  product_data jsonb;
  rating_data jsonb;
begin
  if auth.uid() is null then raise exception 'Sign in is required to submit a review' using errcode = '42501'; end if;
  product_id := p_review_data ->> 'productId';
  if product_id is null or not exists (select 1 from public.products where id = product_id) then
    raise exception 'Product not found';
  end if;
  select data into product_data from public.products where id = product_id for update;
  if coalesce((p_review_data ->> 'rating')::integer, 0) not between 1 and 5 then
    raise exception 'Rating must be between 1 and 5';
  end if;

  review_id := coalesce(p_review_data ->> 'id', 'rev-' || replace(gen_random_uuid()::text, '-', ''));
  select case when coalesce((data ->> 'requireReviewModeration')::boolean, false) then 'pending' else 'approved' end
  into review_status from public.store_settings where id = 'main';
  review_status := coalesce(review_status, 'pending');
  saved_review := p_review_data || jsonb_build_object('id', review_id, 'userId', auth.uid(), 'status', review_status, 'createdAt', now());

  insert into public.reviews (id, product_id, user_id, status, data)
  values (review_id, product_id, auth.uid(), review_status, saved_review);

  if review_status = 'approved' then
    select jsonb_build_object(
      'average', round(avg((data ->> 'rating')::numeric), 1),
      'count', count(*)
    ) into rating_data
    from public.reviews
    where product_id = submit_review.product_id and status = 'approved';

    update public.products
    set data = jsonb_set(product_data, '{rating}', rating_data, true), updated_at = now()
    where id = product_id;
  end if;
  return saved_review;
end;
$$;

grant execute on function public.submit_review(jsonb) to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.products, public.orders, public.reviews;
    exception when duplicate_object then
      null;
    end;
  end if;
end;
$$;
