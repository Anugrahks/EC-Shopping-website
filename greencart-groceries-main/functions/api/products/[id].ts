import { products } from "../data.ts";

export async function onRequestGet({ params }) {
  const product = products.find((p) => p.id === params.id);
  if (!product) {
    return new Response(JSON.stringify({ message: "Product not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify(product), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
