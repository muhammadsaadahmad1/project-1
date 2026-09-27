# Supabase setup

1. Create a Supabase project and copy its Project URL and publishable (or anon)
   key into a local `.env.local` file using `.env.example` as a template.
2. Install the Supabase CLI, then link the project and apply the database schema:

   ```sh
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   ```

3. Start the Vite app with `npm run dev`. The admin panel reports whether the
   public Supabase client configuration is present.
4. Register the intended administrator through Supabase Auth, then grant that
   account access from the Supabase SQL editor:

   ```sql
   update public.profiles set is_admin = true where email = 'admin@example.com';
   ```

5. Optional: seed the existing demo catalog. Set `SUPABASE_URL` and
   `SUPABASE_SERVICE_ROLE_KEY` only in your private shell environment, then run
   `npm run supabase:seed`. Never prefix the service-role key with `VITE_`, put
   it in `.env.local` served to the browser, or commit it.

The migration creates profiles, products, orders, reviews, and settings tables,
RLS policies, and database functions for stock adjustment and atomic order
placement. Enable the products, reviews, and orders tables in the Supabase
Realtime publication if live updates are needed in the dashboard.