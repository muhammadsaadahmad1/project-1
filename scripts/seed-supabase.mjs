import { createClient } from "@supabase/supabase-js";
import { APP_SETTINGS, INITIAL_ORDERS, INITIAL_PRODUCTS, INITIAL_REVIEWS } from "../src/data/initialProducts.js";

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

const reviews = INITIAL_REVIEWS.map(review => ({
  id: review.id,
  product_id: review.productId,
  user_id: null,
  status: review.status,
  data: review,
  created_at: review.createdAt
}));

const orders = INITIAL_ORDERS.map(order => ({
  id: order.id,
  user_id: null,
  status: order.status,
  payment_status: order.paymentStatus,
  data: order,
  created_at: order.createdAt
}));

const settings = { ...APP_SETTINGS };
delete settings.adminPasscode;

for (const [table, rows] of [["products", products], ["reviews", reviews], ["orders", orders]]) {
  const { error } = await supabase.from(table).upsert(rows);
  if (error) throw new Error(`Failed to seed ${table}: ${error.message}`);
  console.log(`Seeded ${rows.length} ${table}.`);
}

const { error } = await supabase.from("store_settings").upsert({ id: "main", data: settings });
if (error) throw new Error(`Failed to seed store settings: ${error.message}`);
console.log("Seeded store settings.");