import { isAdminRequest } from "../../lib/admin-auth.js";
import { BANNERS_KEY, json, validBanners, writeCatalogValue } from "../../lib/catalog.js";

export async function onRequestPut({ request, env }) {
  if (!(await isAdminRequest(request, env))) return json({ success: false, message: "Admin sign-in expired. Please sign in again." }, 401);
  try {
    const banners = await request.json();
    if (!validBanners(banners)) return json({ success: false, message: "Banners are invalid or too large. Keep up to 10 images under 20 MB total." }, 400);
    return await writeCatalogValue(env, BANNERS_KEY, banners);
  } catch {
    return json({ success: false, message: "Could not save the shared offer banners." }, 400);
  }
}