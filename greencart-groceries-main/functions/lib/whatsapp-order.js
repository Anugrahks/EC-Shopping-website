const json = (body, status) => ({ body, status });
const MINIMUM_ORDER_TOTAL = 500;

const normalizePhoneNumber = (value = "") => value.replace(/\D/g, "");

export async function sendWhatsAppOrder(order, env = {}, fetchRequest = fetch) {
  if (!order || !Array.isArray(order.items) || order.items.length === 0 || order.items.length > 10) {
    return json({ success: false, message: "Your cart is empty or contains too many items." }, 400);
  }

  const customerName = typeof order.customerName === "string" ? order.customerName.trim() : "";
  const customerPhone = typeof order.customerPhone === "string" ? order.customerPhone.trim() : "";
  const deliveryAddress = typeof order.deliveryAddress === "string" ? order.deliveryAddress.trim() : "";
  const total = Number(order.total);
  const validItems = order.items.every((item) =>
    typeof item?.productName === "string" && item.productName.trim().length > 0 &&
    item.productName.length <= 120 && Number.isInteger(item.quantity) &&
    item.quantity > 0 && Number.isFinite(item.amount) && item.amount >= 0
  );

  if (!customerName || customerName.length > 120 || !customerPhone || customerPhone.length > 30 ||
      !deliveryAddress || deliveryAddress.length > 500 || !Number.isFinite(total) || total < 0 || !validItems) {
    return json({ success: false, message: "Please check your delivery details and cart, then try again." }, 400);
  }

  if (total < MINIMUM_ORDER_TOTAL) {
    return json({
      success: false,
      message: `Online orders require a minimum total of ₹${MINIMUM_ORDER_TOTAL}.`,
    }, 400);
  }

  const recipient = normalizePhoneNumber(env.WHATSAPP_ADMIN_PHONE_NUMBER);
  if (!env.WHATSAPP_ACCESS_TOKEN || !env.WHATSAPP_PHONE_NUMBER_ID || recipient.length < 8 || recipient.length > 15) {
    return json({
      success: false,
      message: "Online order notifications are not configured yet. Please contact the shop to place your order.",
    }, 503);
  }

  const orderId = `order_${crypto.randomUUID()}`;
  const itemSummary = order.items
    .map((item) => `• ${item.productName.trim()} × ${item.quantity} — ₹${item.amount}`)
    .join("\n");
  const location = order.deliveryLocation && Number.isFinite(order.deliveryLocation.latitude) && Number.isFinite(order.deliveryLocation.longitude)
    ? `\nMap: https://www.google.com/maps?q=${order.deliveryLocation.latitude},${order.deliveryLocation.longitude}`
    : "";
  const message = [
    `New order ${orderId}`,
    `Customer: ${customerName}`,
    `Phone: ${customerPhone}`,
    `Address: ${deliveryAddress}`,
    `Items:\n${itemSummary}`,
    `Total: ₹${total}`,
    `Payment: Cash on Delivery`,
    `Order time: ${new Date().toISOString()}`,
    location,
  ].filter(Boolean).join("\n").slice(0, 1024);

  const apiVersion = env.WHATSAPP_GRAPH_API_VERSION || "v23.0";
  const templateName = env.WHATSAPP_ORDER_TEMPLATE_NAME || "new_order_notification";
  const templateLanguage = env.WHATSAPP_TEMPLATE_LANGUAGE || "en_US";

  try {
    const response = await fetchRequest(`https://graph.facebook.com/${apiVersion}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipient,
        type: "template",
        template: {
          name: templateName,
          language: { code: templateLanguage },
          components: [{ type: "body", parameters: [{ type: "text", text: message }] }],
        },
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("WhatsApp order notification failed:", response.status, details);
      return json({ success: false, message: "We could not send your order to the shop. Please try again." }, 502);
    }

    return json({ success: true, orderId }, 200);
  } catch (error) {
    console.error("WhatsApp order notification request failed:", error);
    return json({ success: false, message: "We could not contact the shop. Please try again." }, 502);
  }
}