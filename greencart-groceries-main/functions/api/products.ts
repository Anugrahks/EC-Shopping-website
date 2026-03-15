import { products } from "./data.ts";

export async function onRequestGet({ request }) {
  return new Response(JSON.stringify(products), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
