import { CATEGORIES_KEY, readCategories } from "../lib/catalog.js";

export async function onRequestGet({ env = {} }) {
  const initialized = env.CATALOG ? (await env.CATALOG.get(CATEGORIES_KEY)) !== null : false;
  return new Response(JSON.stringify(await readCategories(env)), {
    status: 200,
    headers: { "Content-Type": "application/json", "X-Catalog-Initialized": String(initialized), "X-Catalog-Storage": env.CATALOG ? "configured" : "missing", "Cache-Control": "no-store" },
  });
}
