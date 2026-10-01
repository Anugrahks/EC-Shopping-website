import { useEffect, useState } from "react";

export type FooterContact = {
  id: string;
  label: string;
  value: string;
  icon: string;
};

export const FOOTER_CONTACTS_STORAGE_KEY = "gc_footer_contacts";

export const DEFAULT_FOOTER_CONTACTS: FooterContact[] = [
  { id: "phone", label: "Phone", value: "+91 98765 43210", icon: "📞" },
  { id: "email", label: "Email", value: "support@greenshop.in", icon: "📧" },
  { id: "address", label: "Address", value: "Poovam, Kannur, Kerala, India", icon: "📍" },
];

export function getFooterContacts(): FooterContact[] {
  try {
    const saved = localStorage.getItem(FOOTER_CONTACTS_STORAGE_KEY);
    if (!saved) return DEFAULT_FOOTER_CONTACTS;
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed as FooterContact[] : DEFAULT_FOOTER_CONTACTS;
  } catch {
    return DEFAULT_FOOTER_CONTACTS;
  }
}

export function useFooterContacts() {
  const [contacts, setContacts] = useState<FooterContact[]>(getFooterContacts);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch("/api/footer-contacts", { cache: "no-store" });
        if (!response.ok || response.headers.get("X-Catalog-Storage") !== "configured") return;
        const shared = await response.json() as FooterContact[] | null;
        if (!active) return;
        if (Array.isArray(shared)) {
          setContacts(shared);
          localStorage.setItem(FOOTER_CONTACTS_STORAGE_KEY, JSON.stringify(shared));
        } else {
          setContacts(DEFAULT_FOOTER_CONTACTS);
        }
      } catch {
        // Keep the last cached contact details available when offline.
      }
    };

    void refresh();
    const timer = window.setInterval(() => void refresh(), 30_000);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return contacts;
}
