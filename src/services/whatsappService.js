// WhatsApp Business API Integration & Message Generator for AURA PARFUMS

/**
 * Format order details into a luxury WhatsApp Business message template
 */
export const formatWhatsAppOrderMessage = (order, businessName = "AURA PARFUMS") => {
  const itemsText = order.items.map((item, idx) => {
    return `${idx + 1}. *${item.productName}* (${item.size})\n   Qty: ${item.quantity} × $${item.price} = *$${item.quantity * item.price}*`;
  }).join("\n\n");

  const addressText = typeof order.customer.address === "object" 
    ? `${order.customer.address.street || ""}, ${order.customer.address.city || ""}, ${order.customer.address.country || ""}`
    : order.customer.address;

  return `✨ *NEW BOUTIQUE ORDER: #${order.id}* ✨
──────────────────────────
🏛️ *Boutique:* ${businessName}
📅 *Date:* ${new Date(order.createdAt).toLocaleString()}
💳 *Payment:* ${order.paymentMethod} (${order.paymentStatus.toUpperCase()})

👤 *CUSTOMER DOSSIER:*
• Name: ${order.customer.name}
• Phone: ${order.customer.phone}
• Email: ${order.customer.email}
• Shipping Address: ${addressText}
${order.customer.notes ? `• Special Concierge Notes: _"${order.customer.notes}"_` : ""}

🛍️ *ORDERED CREATIONS:*
${itemsText}

──────────────────────────
💰 *Subtotal:* $${order.subtotal}
🚚 *Courier Shipping:* ${order.shipping === 0 ? "Complimentary" : `$${order.shipping}`}
💎 *TOTAL PAYABLE:* *$${order.total}*
──────────────────────────

⚡ *MOBILE ADMIN ACTIONS:*
To accept or update this order directly from WhatsApp, reply with:
• "ACCEPT ${order.id}"
• "PREPARE ${order.id}"
• "SHIP ${order.id}"
• "REJECT ${order.id}"`;
};

/**
 * Generate a WhatsApp deep-link URL for Mobile or Web dispatch
 */
export const generateWhatsAppLink = (phoneNumber, message) => {
  // Clean phone number (remove non-digits, ensure country code)
  const cleaned = phoneNumber.replace(/[^0-9]/g, "");
  const encodedMsg = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${cleaned}&text=${encodedMsg}`;
};

/**
 * Format customer status update notification message
 */
export const formatCustomerStatusMessage = (order, newStatus) => {
  const statusHeadlines = {
    confirmed: "✅ *Order Confirmed by Boutique Master Perfumer*",
    preparing: "🧪 *Artisanal Preparation & Velvet Packaging Underway*",
    shipped: "📦 *Dispatched with Luxury Courier Tracking*",
    rejected: "❌ *Order Status Update: Unable to Fulfill*",
  };

  const headline = statusHeadlines[newStatus] || `📢 *Order Status Update: ${newStatus.toUpperCase()}*`;

  return `${headline}
──────────────────────────
Dear ${order.customer.name},

Your order *#${order.id}* at *AURA PARFUMS* is now: *${newStatus.toUpperCase()}*.

🛍️ *Summary:* ${order.items.map(i => `${i.productName} (${i.size}) x${i.quantity}`).join(", ")}
💎 *Total:* $${order.total}

Thank you for choosing AURA PARFUMS. Our concierge team is at your disposal for any bespoke requests.`;
};

/**
 * Standardized JSON Payload for WhatsApp Cloud API (Graph API) webhook / automation
 */
export const createWhatsAppCloudApiPayload = (recipientPhone, templateName = "order_confirmation", orderData) => {
  return {
    messaging_product: "whatsapp",
    to: recipientPhone.replace(/[^0-9]/g, ""),
    type: "template",
    template: {
      name: templateName,
      language: { code: "en_US" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: orderData.customer.name },
            { type: "text", text: orderData.id },
            { type: "text", text: `$${orderData.total}` },
            { type: "text", text: orderData.items.map(i => i.productName).join(", ") }
          ]
        },
        {
          type: "button",
          sub_type: "quick_reply",
          index: "0",
          parameters: [{ type: "payload", payload: `CONFIRM_${orderData.id}` }]
        }
      ]
    }
  };
};
