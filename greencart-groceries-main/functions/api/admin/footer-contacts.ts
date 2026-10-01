import { isAdminRequest } from "../../lib/admin-auth.js";
import { CONTACTS_KEY, json, validContacts, writeCatalogValue } from "../../lib/catalog.js";

export async function onRequestPut({ request, env }) {
  if (!(await isAdminRequest(request, env))) return json({ success: false, message: "Admin sign-in expired. Please sign in again." }, 401);
  try {
    const contacts = await request.json();
    if (!validContacts(contacts)) return json({ success: false, message: "Add up to 12 contact entries with a label and value." }, 400);
    return await writeCatalogValue(env, CONTACTS_KEY, contacts);
  } catch {
    return json({ success: false, message: "Could not save the shared footer contact details." }, 400);
  }
}