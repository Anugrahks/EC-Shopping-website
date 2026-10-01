import { CONTACTS_KEY, readContacts } from "../lib/catalog.js";

export async function onRequestGet({ env = {} }) {
  const initialized = env.CATALOG ? (await env.CATALOG.get(CONTACTS_KEY)) !== null : false;
  return Response.json(await readContacts(env), {
    headers: {
      "X-Catalog-Initialized": String(initialized),
      "X-Catalog-Storage": env.CATALOG ? "configured" : "missing",
      "Cache-Control": "no-store",
    },
  });
}