import { describe, expect, it } from "vitest";
import { sendWhatsAppOrder } from "../../functions/lib/whatsapp-order.js";

const validOrder = {
  customerName: "Amit Sharma",
  customerPhone: "9876543210",
  deliveryAddress: "12 Market Road, Bengaluru, 560001",
  total: 650,
  items: [{ productName: "Tomato", quantity: 2, amount: 160 }],
  deliveryLocation: { latitude: 12.9716, longitude: 77.5946 },
};

const credentials = {
  WHATSAPP_ADMIN_PHONE_NUMBER: "+91 98765 43210",
  WHATSAPP_PHONE_NUMBER_ID: "sender-id",
  WHATSAPP_ACCESS_TOKEN: "test-token",
};

describe("sendWhatsAppOrder", () => {
  it("sends an approved WhatsApp template to the admin from the backend", async () => {
    let sentRequest;
    const result = await sendWhatsAppOrder(validOrder, credentials, async (url, options) => {
      sentRequest = { url, options };
      return new Response("{}", { status: 200 });
    });

    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
    expect(sentRequest.url).toBe("https://graph.facebook.com/v23.0/sender-id/messages");
    expect(sentRequest.options.headers.Authorization).toBe("Bearer test-token");
    const payload = JSON.parse(sentRequest.options.body);
    expect(payload.to).toBe("919876543210");
    expect(payload.type).toBe("template");
    expect(payload.template.components[0].parameters[0].text).toContain("Amit Sharma");
    expect(payload.template.components[0].parameters[0].text).toContain("12.9716,77.5946");
  });

  it("does not report success or call WhatsApp until credentials are configured", async () => {
    let called = false;
    const result = await sendWhatsAppOrder(validOrder, {}, async () => {
      called = true;
      return new Response("{}", { status: 200 });
    });

    expect(result.status).toBe(503);
    expect(result.body.success).toBe(false);
    expect(called).toBe(false);
  });

  it("rejects invalid order details before contacting WhatsApp", async () => {
    const result = await sendWhatsAppOrder({ ...validOrder, items: [] }, credentials);

    expect(result.status).toBe(400);
    expect(result.body.success).toBe(false);
  });
});
