import { isAdminRequest } from "../../lib/admin-auth.js";
import { json, PRODUCTS_KEY, validProducts, writeCatalogValue } from "../../lib/catalog.js";

export async function onRequestPut({ request, env }) {
  if (!(await isAdminRequest(request, env))) return json({ success: false, message: "Admin sign-in expired. Please sign in again." }, 401);
  try {
    const products = await request.json();
    if (!validProducts(products)) return json({ success: false, message: "The product catalog is invalid." }, 400);
    return await writeCatalogValue(env, PRODUCTS_KEY, products);
  } catch {
    return json({ success: false, message: "Could not save the shared product catalog." }, 400);
  }
}