import { BANNERS_KEY, readBanners } from "../lib/catalog.js";

export async function onRequestGet({ env = {} }) {
  const initialized = env.CATALOG ? (await env.CATALOG.get(BANNERS_KEY)) !== null : false;
  return Response.json(await readBanners(env), {
    headers: {
      "X-Catalog-Initialized": String(initialized),
      "X-Catalog-Storage": env.CATALOG ? "configured" : "missing",
      "Cache-Control": "no-store",
    },
  });
}