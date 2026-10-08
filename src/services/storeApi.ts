import type { Order, Product, Review, StoreSettings } from "../types/models";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

function requireSupabase() {
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase;
}

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

function mapProduct(row: { id: string; data: Product; created_at?: string }): Product {
  return { ...row.data, id: row.id, createdAt: row.data.createdAt || row.created_at || "" };
}

function mapRecord<T>(row: { data: T; id: string }): T {
  return { ...row.data, id: row.id };
}

export async function fetchProducts(): Promise<Product[]> {
  const client = requireSupabase();
  const { data, error } = await client.from("products").select("id, data, created_at").order("created_at", { ascending: false });
  throwIfError(error);
  return (data || []).map(mapProduct);
}

export async function fetchReviews(): Promise<Review[]> {
  const client = requireSupabase();
  const { data, error } = await client.from("reviews").select("id, data").order("created_at", { ascending: false });
  throwIfError(error);
  return (data || []).map(mapRecord<Review>);
}

export async function fetchOrders(): Promise<Order[]> {
  const client = requireSupabase();
  const { data, error } = await client.from("orders").select("id, data").order("created_at", { ascending: false });
  throwIfError(error);
  return (data || []).map(mapRecord<Order>);
}

export function subscribeStoreChanges(onChange: (table: string) => void, includeOrders = true): () => void {
  const client = requireSupabase();
  const channel = client.channel("store-data-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => onChange("products"))
    .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, () => onChange("reviews"));
  if (includeOrders) {
    channel.on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => onChange("orders"));
  }
  channel.subscribe();
  return () => { void client.removeChannel(channel); };
}

export async function addProduct(product: Product): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from("products").upsert({ id: product.id, data: product, created_at: product.createdAt || new Date().toISOString() });
  throwIfError(error);
}

export async function updateProduct(productId: string, fields: Partial<Product>): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.rpc("update_product_data", { p_product_id: productId, p_patch: fields });
  throwIfError(error);
}

export async function deleteProduct(productId: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from("products").delete().eq("id", productId);
  throwIfError(error);
}

export async function updateStock(productId: string, variationId: string, stock: number): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.rpc("set_product_stock", {
    p_product_id: productId,
    p_variation_id: variationId,
    p_stock: stock
  });
  throwIfError(error);
}

export async function placeOrder(order: Order): Promise<Order> {
  const client = requireSupabase();
  const { data, error } = await client.rpc("place_order_atomic", { p_order_data: order });
  throwIfError(error);
  return data as Order;
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.rpc("update_order_status", { p_order_id: orderId, p_status: status });
  throwIfError(error);
}

export async function addReview(review: Review): Promise<Review> {
  const client = requireSupabase();
  const { data, error } = await client.rpc("submit_review", { p_review_data: review });
  throwIfError(error);
  return data as Review;
}

export async function updateReviewStatus(reviewId: string, status: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.rpc("update_review_status", { p_review_id: reviewId, p_status: status });
  throwIfError(error);
}

export async function deleteReview(reviewId: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from("reviews").delete().eq("id", reviewId);
  throwIfError(error);
}

export async function fetchStoreSettings(): Promise<StoreSettings | null> {
  const client = requireSupabase();
  const { data, error } = await client.from("store_settings").select("data").eq("id", "main").maybeSingle();
  throwIfError(error);
  return data?.data || null;
}

export async function saveStoreSettings(settings: StoreSettings): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from("store_settings").upsert({ id: "main", data: settings });
  throwIfError(error);
}

export { isSupabaseConfigured };
