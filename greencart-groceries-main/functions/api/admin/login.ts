import { createAdminToken } from "../../lib/admin-auth.js";

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD) {
    return Response.json({ success: false, message: "Admin sign-in is not configured. Set ADMIN_PASSWORD in Cloudflare Pages." }, { status: 503 });
  }

  try {
    const body = await request.json();
    if (typeof body.password !== "string" || body.password !== env.ADMIN_PASSWORD) {
      return Response.json({ success: false, message: "Invalid admin password." }, { status: 401 });
    }
    return Response.json({ success: true, token: await createAdminToken(env.ADMIN_PASSWORD) });
  } catch {
    return Response.json({ success: false, message: "Invalid sign-in request." }, { status: 400 });
  }
}