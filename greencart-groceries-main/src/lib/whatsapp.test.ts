import { describe, expect, it } from "vitest";
import { buildOrderWhatsAppLink } from "./whatsapp";

describe("buildOrderWhatsAppLink", () => {
  it("includes customer, address, and map coordinates in the WhatsApp message", () => {
    const link = buildOrderWhatsAppLink({
      companyPhone: "+91 98765 43210",
      customerName: "Amit Sharma",
      customerPhone: "9876543210",
      deliveryAddress: "12 Market Road, Bengaluru, 560001",
      total: 650,
      items: [
        { productName: "Tomato", quantity: 2, amount: 80 },
        { productName: "Rice", quantity: 1, amount: 490 },
      ],
      deliveryLocation: { latitude: 12.9716, longitude: 77.5946, accuracy: 25 },
    });

    expect(link).toContain("https://wa.me/");
    expect(link).toContain("9876543210");
    expect(link).toContain(encodeURIComponent("New order"));
    expect(link).toContain(encodeURIComponent("Amit Sharma"));
    expect(link).toContain(encodeURIComponent("12 Market Road, Bengaluru, 560001"));
    expect(link).toContain(encodeURIComponent("12.971600"));
    expect(link).toContain(encodeURIComponent("77.594600"));
  });
});
