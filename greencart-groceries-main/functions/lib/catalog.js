import { categories as defaultCategories, products as defaultProducts } from "../api/data.ts";

export const PRODUCTS_KEY = "catalog:products";
export const CATEGORIES_KEY = "catalog:categories";
export const BANNERS_KEY = "catalog:today-offers-banners";
export const CONTACTS_KEY = "catalog:footer-contacts";

const json = (body, status = 200) => Response.json(body, { status });

export async function readProducts(env = {}) {
  if (!env.CATALOG) return defaultProducts;
  return await env.CATALOG.get(PRODUCTS_KEY, "json") ?? defaultProducts;
}

export async function readCategories(env = {}) {
  if (!env.CATALOG) return defaultCategories;
  return await env.CATALOG.get(CATEGORIES_KEY, "json") ?? defaultCategories;
}

export async function readBanners(env = {}) {
  if (!env.CATALOG) return [];
  return await env.CATALOG.get(BANNERS_KEY, "json") ?? [];
}

export async function readContacts(env = {}) {
  if (!env.CATALOG) return null;
  return await env.CATALOG.get(CONTACTS_KEY, "json") ?? null;
}

export async function writeCatalogValue(env, key, value) {
  if (!env.CATALOG) {
    return json({ success: false, message: "Shared catalog storage is not configured. Set the CATALOG KV binding in Cloudflare Pages." }, 503);
  }
  await env.CATALOG.put(key, JSON.stringify(value));
  return json({ success: true });
}

export function validProducts(value) {
  return Array.isArray(value) && value.length <= 2000 && value.every((product) =>
    product && typeof product.id === "string" && product.id.length > 0 && product.id.length <= 120 &&
    typeof product.name === "string" && product.name.trim().length > 0 && product.name.length <= 200 &&
    typeof product.category === "string" && Number.isFinite(product.price) && product.price >= 0 &&
    Number.isInteger(product.stock) && product.stock >= 0 && typeof product.unit === "string" &&
    Array.isArray(product.variants ?? []) && (product.variants ?? []).every((variant) =>
      variant && typeof variant.id === "string" && typeof variant.unit === "string" &&
      Number.isFinite(variant.price) && variant.price >= 0 && Number.isInteger(variant.stock) && variant.stock >= 0
    )
  );
}

export function validCategories(value) {
  return Array.isArray(value) && value.length <= 200 && value.every((category) =>
    category && typeof category.id === "string" && typeof category.name === "string" && category.name.trim().length > 0 &&
    typeof category.icon === "string" && typeof category.image === "string"
  );
}

export function validBanners(value) {
  if (!Array.isArray(value) || value.length > 10 || !value.every((banner) =>
    banner && typeof banner.id === "string" && banner.id.length <= 120 &&
    typeof banner.image === "string" && banner.image.startsWith("data:image/") &&
    typeof banner.title === "string" && banner.title.length <= 160 &&
    typeof banner.subtitle === "string" && banner.subtitle.length <= 300 &&
    typeof banner.enabled === "boolean"
  )) return false;

  const totalBytes = new TextEncoder().encode(JSON.stringify(value)).length;
  return totalBytes <= 20 * 1024 * 1024;
}

export function validContacts(value) {
  return Array.isArray(value) && value.length <= 12 && value.every((contact) =>
    contact && typeof contact.id === "string" && contact.id.length > 0 && contact.id.length <= 120 &&
    typeof contact.label === "string" && contact.label.trim().length > 0 && contact.label.length <= 80 &&
    typeof contact.value === "string" && contact.value.trim().length > 0 && contact.value.length <= 300 &&
    typeof contact.icon === "string" && contact.icon.length <= 16
  );
}

export { json };