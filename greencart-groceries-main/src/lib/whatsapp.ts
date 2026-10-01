export type WhatsAppDeliveryLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

export type WhatsAppOrderItem = {
  productName: string;
  quantity: number;
  amount: number;
};

export type OrderWhatsAppPayload = {
  companyPhone?: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  total: number;
  items: WhatsAppOrderItem[];
  deliveryLocation?: WhatsAppDeliveryLocation | null;
  date?: string;
};

export const normalizeWhatsAppNumber = (value?: string) => {
  const digits = (value ?? "").replace(/[^\d]/g, "").replace(/^00/, "");
  return digits;
};

export const getCompanyWhatsAppNumber = () => {
  const configured = normalizeWhatsAppNumber(
    typeof import.meta !== "undefined" ? import.meta.env.VITE_COMPANY_WHATSAPP_NUMBER : undefined,
  );

  return configured || "918078312105";
};

export const buildOrderWhatsAppLink = (payload: OrderWhatsAppPayload) => {
  const phone = normalizeWhatsAppNumber(payload.companyPhone) || getCompanyWhatsAppNumber();

  const itemSummary = payload.items.length
    ? payload.items.map((item) => `- ${item.productName} x${item.quantity} = ₹${item.amount}`).join("\n")
    : "- No items";

  const locationSummary = payload.deliveryLocation
    ? `Location: ${payload.deliveryLocation.latitude.toFixed(6)}, ${payload.deliveryLocation.longitude.toFixed(6)} (accuracy ±${Math.round(payload.deliveryLocation.accuracy ?? 0)} m)`
    : "Location: Not shared";

  const message = [
    "New order received",
    `Customer: ${payload.customerName}`,
    `Phone: ${payload.customerPhone}`,
    `Address: ${payload.deliveryAddress}`,
    `Items:\n${itemSummary}`,
    `Total: ₹${payload.total}`,
    locationSummary,
    payload.date ? `Order time: ${payload.date}` : undefined,
  ]
    .filter(Boolean)
    .join("\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};
