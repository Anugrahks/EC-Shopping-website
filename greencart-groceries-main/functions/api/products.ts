import { PRODUCTS_KEY, readProducts } from "../lib/catalog.js";

export async function onRequestGet({ env = {} }) {
  const initialized = env.CATALOG ? (await env.CATALOG.get(PRODUCTS_KEY)) !== null : false;
  return new Response(JSON.stringify(await readProducts(env)), {
    status: 200,
    headers: { "Content-Type": "application/json", "X-Catalog-Initialized": String(initialized), "X-Catalog-Storage": env.CATALOG ? "configured" : "missing", "Cache-Control": "no-store" },
  });
}
