import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const escapeHtml = (value: unknown) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const fromAddress = Deno.env.get("ORDER_CONFIRMATION_FROM");
  if (!supabaseUrl || !serviceRoleKey || !resendApiKey || !fromAddress) {
    console.error("Order confirmation function is missing server configuration");
    return jsonResponse({ error: "Email service unavailable" }, 503);
  }

  let payload: { orderId?: unknown; token?: unknown };
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid request" }, 400);
  }

  const orderId = typeof payload.orderId === "string" ? payload.orderId : "";
  const token = typeof payload.token === "string" ? payload.token : "";
  if (!/^ORD-[A-F0-9]{10}$/.test(orderId) || !/^[a-f0-9]{64}$/.test(token)) {
    return jsonResponse({ error: "Invalid confirmation" }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: order, error: claimError } = await supabase.rpc("claim_order_confirmation", {
    p_order_id: orderId,
    p_token: token,
  });
  if (claimError || !order) return jsonResponse({ error: "Confirmation unavailable" }, 401);

  const customer = order.customer || {};
  const recipient = typeof customer.email === "string" ? customer.email.trim() : "";
  if (!recipient) return new Response(null, { status: 204, headers: corsHeaders });

  const items = Array.isArray(order.items) ? order.items : [];
  const itemText = items.map((item: Record<string, unknown>) =>
    `${item.productName || "Item"} (${item.size || ""}) x${Number(item.quantity) || 0}`
  ).join("\n");
  const itemHtml = items.map((item: Record<string, unknown>) =>
    `<li>${escapeHtml(item.productName)} (${escapeHtml(item.size)}) x${Number(item.quantity) || 0}</li>`
  ).join("");
  const address = String(customer.address || "");
  const phone = String(customer.phone || "");
  const total = String(order.total ?? "");
  const text = [
    `Thank you for your order ${order.id}.`,
    "",
    "Items:",
    itemText,
    "",
    `Total: $${total}`,
    `Delivery address: ${address}`,
    `Phone: ${phone}`,
  ].join("\n");
  const html = `<h1>Order ${escapeHtml(order.id)} confirmed</h1><p>Thank you for your order.</p><h2>Items</h2><ul>${itemHtml}</ul><p><strong>Total:</strong> $${escapeHtml(total)}</p><p><strong>Delivery address:</strong><br>${escapeHtml(address)}</p><p><strong>Phone:</strong> ${escapeHtml(phone)}</p>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [recipient],
        subject: `Order confirmation ${order.id}`,
        text,
        html,
      }),
    });
    if (!response.ok) {
      console.error("Resend rejected order confirmation", { orderId, status: response.status });
      return jsonResponse({ error: "Email delivery failed" }, 502);
    }
    return jsonResponse({ sent: true });
  } catch (error) {
    console.error("Order confirmation delivery failed", { orderId, error });
    return jsonResponse({ error: "Email delivery failed" }, 502);
  }
});