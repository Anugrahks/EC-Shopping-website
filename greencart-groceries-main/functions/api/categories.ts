import { categories } from "./data.ts";

export async function onRequestGet() {
  return new Response(JSON.stringify(categories), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
