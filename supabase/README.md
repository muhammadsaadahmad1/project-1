# Supabase Setup

## Environment

Copy `.env.example` to `.env.local` and set:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

These are public browser credentials. Never expose a service-role key through a
`VITE_` variable or commit it. Optional catalog seeding uses `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` in a private shell environment only.

## Admin Authentication

Only administrators sign in through Supabase Auth. Public sign-up is disabled
in `supabase/config.toml`; also disable **Authentication → Sign In / Providers
→ Allow new users to sign up** in the hosted project. Create admin users
manually in Supabase and assign `profiles.role = 'admin'` as described below.

Supabase Auth email/SMTP is separate from guest order email and remains available
for administrator auth emails such as password recovery. Guest order confirmations
are sent through Resend by the `send-order-confirmation` Edge Function.

## Apply Database Migrations

Install the Supabase CLI, then link and update the project:

```sh
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Apply all migrations with `supabase db push`. The guest checkout migration
validates contact details in the database, limits order reads to admins, and
adds an inaccessible one-time-token table used by the email function.

## Add An Admin

In the Supabase dashboard, open **Authentication → Users** and add the user
with their email. Then run this in the SQL Editor, replacing the email:

```sql
update public.profiles
set role = 'admin'
where lower(email) = lower('admin@example.com');
```

The Supabase Auth user trigger creates the profile. The account can then sign in
at `/admin-login` and manage products, stock, and orders.

The initial schema also creates products, orders, reviews, and store settings.
The orders table is in the Supabase Realtime publication; its admin-only RLS
policy filters both queries and Realtime events.

The storefront and cart are public, and the cart persists in browser
`localStorage`. Guest checkout requires a delivery address and international-
format phone; email is optional. The database validates product, price, and
stock before creating an order. Anonymous clients cannot read orders.

The storefront no longer displays demo products when Supabase is configured
but its catalog is empty. To seed the included catalog and store settings,
provide `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to the private shell and
run `npm run supabase:seed`. The seed script writes products and settings only;
it does not create sample orders or reviews. Never put the service-role key in
a `VITE_` variable.

## Order Confirmation Email

1. Create and verify a sending domain in Resend, then create an API key.
2. Set Edge Function secrets; never put these in a `VITE_` variable:

    ```sh
    supabase secrets set RESEND_API_KEY=re_... ORDER_CONFIRMATION_FROM="AURA PARFUMS <orders@your-verified-domain.com>"
    ```

3. Deploy the function:

    ```sh
    supabase functions deploy send-order-confirmation
    ```

The client calls the function only after the order RPC succeeds. The function
consumes a random, one-time order token through a service-role-only database
RPC, then gets the recipient and order data from the database. Email failures
are logged and do not fail or roll back the order. No email means no token and
no function call.

## Test Checklist

- Guest order with a valid email: order succeeds and one confirmation is sent.
- Guest order without email: order succeeds without calling the email function.
- Invalid phone or missing address: client and database reject the order.
- Anonymous direct `select` from `public.orders`: denied / returns no rows.
- Admin sign-in: admin sees guest email, phone, and address; new orders appear live.
- Non-admin user: admin route and order reads remain denied.