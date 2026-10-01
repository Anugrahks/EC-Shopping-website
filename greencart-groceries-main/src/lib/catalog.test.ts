import { describe, expect, it } from "vitest";
import { isAdminRequest, createAdminToken } from "../../functions/lib/admin-auth.js";
import { CATEGORIES_KEY, PRODUCTS_KEY, readCategories, readProducts, writeCatalogValue } from "../../functions/lib/catalog.js";

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

    expect((await writeCatalogValue(env, PRODUCTS_KEY, products)).status).toBe(200);
    expect((await writeCatalogValue(env, CATEGORIES_KEY, categories)).status).toBe(200);
    expect(await readProducts(env)).toEqual(products);
    expect(await readCategories(env)).toEqual(categories);
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