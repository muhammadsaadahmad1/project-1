import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { APP_SETTINGS, INITIAL_PRODUCTS, INITIAL_REVIEWS, INITIAL_ORDERS } from "../src/data/initialProducts.js";

if (!process.env.VITE_SUPABASE_URL && existsSync(".env.local")) {
  const envFile = readFileSync(".env.local", "utf8");
  for (const line of envFile.split(/\r?\n/)) {
    const match = line.match(/^\s*(VITE_SUPABASE_URL|VITE_SUPABASE_ANON_KEY)\s*=\s*(.*?)\s*$/);
    if (match) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
}

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

// Seed reviews
const reviews = INITIAL_REVIEWS.map(review => ({
  id: review.id,
  product_id: review.productId,
  status: review.status || "approved",
  data: review,
  created_at: review.createdAt
}));

const { error: reviewsError } = await supabase.from("reviews").upsert(reviews);
if (reviewsError) throw new Error(`Failed to seed reviews: ${reviewsError.message}`);
console.log(`Seeded ${reviews.length} reviews.`);

// Seed orders
const orders = INITIAL_ORDERS.map(order => ({
  id: order.id,
  status: order.status || "pending",
  payment_status: order.paymentStatus || "pending",
  data: order,
  created_at: order.createdAt
}));

const { error: ordersError } = await supabase.from("orders").upsert(orders);
if (ordersError) throw new Error(`Failed to seed orders: ${ordersError.message}`);
console.log(`Seeded ${orders.length} orders.`);