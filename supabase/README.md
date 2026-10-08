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

## Auth Providers

Email confirmation is enabled for customer registration. In the Supabase
dashboard, open **Authentication → Email Templates → Confirm signup** and make
sure the message includes `{{ .Token }}` so the customer receives the six-digit
code entered on `/verify`. Email OTP length is six digits and the resend interval
is 30 seconds. Phone signup is not offered and phone confirmation is off.

For delivery to real customer addresses, configure a custom SMTP provider in
**Authentication → SMTP Settings**. Supabase's built-in mailer is for testing:
it only sends to pre-authorized project-team addresses and is rate-limited.
Check spam and the Auth logs if a code is still missing.

The auth config in `supabase/config.toml` matches the linked project. If the
email template is changed, make sure to retain the OTP token variable.

## Apply Database Migrations

Install the Supabase CLI, then link and update the project:

```sh
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

The full auth and access-control SQL is in
`supabase/migrations/20260930000000_auth_verification_admin_requests.sql`.
The following migration,
`supabase/migrations/20260930120000_pause_admin_request_trigger.sql`, drops
automatic admin-request creation and keeps contact verification flags false.
The latest migration,
`supabase/migrations/20260930130000_store_unverified_phone_metadata.sql`, stores
an optional phone from email signup as unverified profile data without asking
Supabase Auth to send an SMS. Apply all migrations with `supabase db push`.
`supabase/migrations/20261004100000_sync_verified_email_profile.sql` restores
profile verification-flag synchronization from Supabase Auth while leaving the
admin-request trigger paused.

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

## Test Checklist

- Visitors can browse the catalog and add items to the bag without an account.
- Checkout prompts guests to sign in or register; the bag remains intact and
   checkout resumes after signup/sign-in.
- Email-only registration sends a six-digit code; correct codes sign in and
   return the customer to their intended page.
- Incorrect codes show a generic error; resend is available after 30 seconds.
- A Supabase operator can manually create an Auth user, set `profiles.role` to
   `admin`, and the user can manage products, stock, and orders.
- Automatic admin requests stay disabled; verification flags are still tracked
   from Supabase Auth for later use.
- A regular account cannot access `/admin`; `/admin-login` shows the same
   generic denial for non-admin credentials.
- The storefront has no standalone Admin button; the small Admin link is only
   on the sign-in page.
- As a regular account, direct table access to `admin_requests` is denied and
   `list_admin_requests` returns an access-denied error.

The initial schema also creates products, orders, reviews, and store settings.
Enable the relevant tables in the Supabase Realtime publication if live updates
are needed in the dashboard.

The storefront and cart are public. If the Supabase `products` table is empty,
the app displays the included demo catalog for browsing and bag use. Seed the
matching catalog into Supabase before accepting live orders; checkout requires
sign-in and the database order function validates each product against the
Supabase catalog.