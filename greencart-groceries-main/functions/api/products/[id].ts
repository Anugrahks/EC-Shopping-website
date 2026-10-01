import { readProducts } from "../../lib/catalog.js";

export async function onRequestGet({ params, env = {} }) {
  const products = await readProducts(env);
  const product = products.find((p) => p.id === params.id);
  if (!product) {
    return new Response(JSON.stringify({ message: "Product not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", "X-Catalog-Storage": env.CATALOG ? "configured" : "missing", "Cache-Control": "no-store" },
    });
  }
  return new Response(JSON.stringify(product), {
    status: 200,
    headers: { "Content-Type": "application/json", "X-Catalog-Storage": env.CATALOG ? "configured" : "missing", "Cache-Control": "no-store" },
  });
}
