import { isAdminRequest } from "../../lib/admin-auth.js";
import { CATEGORIES_KEY, json, validCategories, writeCatalogValue } from "../../lib/catalog.js";

export async function onRequestPut({ request, env }) {
  if (!(await isAdminRequest(request, env))) return json({ success: false, message: "Admin sign-in expired. Please sign in again." }, 401);
  try {
    const categories = await request.json();
    if (!validCategories(categories)) return json({ success: false, message: "The category list is invalid." }, 400);
    return await writeCatalogValue(env, CATEGORIES_KEY, categories);
  } catch {
    return json({ success: false, message: "Could not save the shared category list." }, 400);
  }
}