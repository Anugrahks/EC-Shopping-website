import { describe, expect, it } from "vitest";
import { isAdminRequest, createAdminToken } from "../../functions/lib/admin-auth.js";
import { BANNERS_KEY, CATEGORIES_KEY, CONTACTS_KEY, PRODUCTS_KEY, readBanners, readCategories, readContacts, readProducts, validBanners, validContacts, writeCatalogValue } from "../../functions/lib/catalog.js";

describe("shared Cloudflare catalog", () => {
  it("falls back to the bundled catalog when KV is not configured", async () => {
    expect(await readProducts()).toEqual(expect.arrayContaining([expect.objectContaining({ id: "1" })]));
    expect(await readCategories()).toEqual(expect.arrayContaining([expect.objectContaining({ name: "Fruits" })]));
  });

  it("reads and writes products and categories using the shared KV namespace", async () => {
    const stored = new Map<string, string>();
    const env = {
      CATALOG: {
        async get(key: string, type?: string) {
          const value = stored.get(key);
          return value === undefined ? null : type === "json" ? JSON.parse(value) : value;
        },
        async put(key: string, value: string) {
          stored.set(key, value);
        },
      },
    };
    const products = [{ id: "new-1", name: "Garden Snack", category: "Snacks", price: 25, stock: 10, unit: "1 pack", variants: [] }];
    const categories = [{ id: "snacks", name: "Snacks", icon: "🍿", image: "" }];
    const banners = [{ id: "daily-deals", image: "data:image/webp;base64,Zm9v", title: "Today's offers", subtitle: "Fresh deals", enabled: true }];
    const contacts = [{ id: "phone", label: "Phone", value: "+91 98765 43210", icon: "📞" }];

    expect((await writeCatalogValue(env, PRODUCTS_KEY, products)).status).toBe(200);
    expect((await writeCatalogValue(env, CATEGORIES_KEY, categories)).status).toBe(200);
    expect((await writeCatalogValue(env, BANNERS_KEY, banners)).status).toBe(200);
    expect((await writeCatalogValue(env, CONTACTS_KEY, contacts)).status).toBe(200);
    expect(await readProducts(env)).toEqual(products);
    expect(await readCategories(env)).toEqual(categories);
    expect(await readBanners(env)).toEqual(banners);
    expect(await readContacts(env)).toEqual(contacts);
  });

  it("only accepts image banners and limits their total shared size", () => {
    expect(validBanners([{ id: "1", image: "data:image/webp;base64,YQ==", title: "Deal", subtitle: "Today", enabled: true }])).toBe(true);
    expect(validBanners([{ id: "1", image: "https://example.com/banner.jpg", title: "Deal", subtitle: "Today", enabled: true }])).toBe(false);
    expect(validBanners(Array.from({ length: 11 }, (_, index) => ({ id: String(index), image: "data:image/webp;base64,YQ==", title: "Deal", subtitle: "Today", enabled: true })))).toBe(false);
  });

  it("validates editable footer contact entries", () => {
    expect(validContacts([{ id: "phone", label: "Phone", value: "+91 1234567890", icon: "📞" }])).toBe(true);
    expect(validContacts([{ id: "phone", label: "", value: "123", icon: "📞" }])).toBe(false);
    expect(validContacts(Array.from({ length: 13 }, (_, index) => ({ id: String(index), label: "Contact", value: "Details", icon: "•" })))).toBe(false);
  });

  it("requires an authenticated server-issued admin token", async () => {
    const secret = "test-only-admin-secret";
    const token = await createAdminToken(secret);
    const valid = new Request("https://shop.example/api/admin/products", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const invalid = new Request("https://shop.example/api/admin/products", {
      headers: { Authorization: "Bearer invalid.token.value" },
    });

    expect(await isAdminRequest(valid, { ADMIN_PASSWORD: secret })).toBe(true);
    expect(await isAdminRequest(valid, { ADMIN_PASSWORD: "different-secret" })).toBe(false);
    expect(await isAdminRequest(invalid, { ADMIN_PASSWORD: secret })).toBe(false);
  });
});