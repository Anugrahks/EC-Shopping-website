import { testimonials } from "./data.ts";

export async function onRequestGet() {
  return new Response(JSON.stringify(testimonials), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
