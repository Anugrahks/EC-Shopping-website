export async function onRequestPost({ request }) {
  try {
    const body = await request.json();
    const items = body.items || [];
    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ success: false, message: "Cart is empty" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const orderId = `order_${Date.now()}`;
    return new Response(JSON.stringify({ success: true, orderId }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: "Invalid payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
