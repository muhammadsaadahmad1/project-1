import { createClient } from "@supabase/supabase-js";
import { APP_SETTINGS, INITIAL_PRODUCTS } from "../src/data/initialProducts.js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the shell before seeding.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const products = INITIAL_PRODUCTS.map(product => ({
  id: product.id,
  data: product,
  created_at: product.createdAt
}));

const settings = { ...APP_SETTINGS };
delete settings.adminPasscode;

const { error: productsError } = await supabase.from("products").upsert(products);
if (productsError) throw new Error(`Failed to seed products: ${productsError.message}`);
console.log(`Seeded ${products.length} products.`);

const { error: settingsError } = await supabase.from("store_settings").upsert({ id: "main", data: settings });
if (settingsError) throw new Error(`Failed to seed store settings: ${settingsError.message}`);
console.log("Seeded store settings.");