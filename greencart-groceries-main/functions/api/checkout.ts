import { sendWhatsAppOrder } from "../lib/whatsapp-order.js";

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const result = await sendWhatsAppOrder(body, env);
    return Response.json(result.body, { status: result.status });
  } catch {
    return Response.json({ success: false, message: "Invalid order request." }, { status: 400 });
  }
}
