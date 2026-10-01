import { Link } from "react-router-dom";
import { useFooterContacts } from "@/lib/footer-contacts";

export function Footer() {
  const contacts = useFooterContacts();

  const getContactHref = (contact: { label: string; value: string }) => {
    const label = contact.label.toLowerCase();
    if (label.includes("email")) return `mailto:${contact.value}`;
    if (label.includes("phone") || label.includes("call")) return `tel:${contact.value.replace(/[^+\d]/g, "")}`;
    return undefined;
  };

  return (
    <footer className="bg-foreground text-background mt-10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥬</span>
              <span className="text-xl font-bold">EC SHOPPING</span>
            </div>
            <p className="text-sm opacity-70">
              Fresh grocery delivery at your doorstep. Quality products at best prices.
            </p>
          </div>
          <div className="space-y-3">
            <h2 className="font-semibold">Quick Links</h2>
            <div className="flex flex-col gap-2 text-sm opacity-70">
              <Link to="/" className="hover:opacity-100">Home</Link>
              <Link to="/products" className="hover:opacity-100">Shop</Link>
              <Link to="/about" className="hover:opacity-100">About Us</Link>
              <Link to="/cart" className="hover:opacity-100">Cart</Link>
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="font-semibold">Categories</h2>
            <div className="flex flex-col gap-2 text-sm opacity-70">
              <Link to="/products?category=Fruits" className="hover:opacity-100">Fruits</Link>
              <Link to="/products?category=Vegetables" className="hover:opacity-100">Vegetables</Link>
              <Link to="/products?category=Grocery" className="hover:opacity-100">Grocery</Link>
              <Link to="/products?category=Meat+%26+Fish" className="hover:opacity-100">Meat & Fish</Link>
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="font-semibold">Contact Us</h2>
            <div className="flex flex-col gap-2 text-sm opacity-70">
              {contacts.map((contact) => {
                const href = getContactHref(contact);
                const content = <><span aria-hidden="true">{contact.icon || "•"}</span> <span>{contact.value}</span></>;
                return href
                  ? <a key={contact.id} href={href} className="flex items-start gap-2 hover:opacity-100"><span>{content}</span></a>
                  : <p key={contact.id} className="flex items-start gap-2"><span>{content}</span></p>;
              })}
            </div>
          </div>
        </div>
        <div className="border-t border-background/20 mt-8 pt-6 text-center text-sm opacity-60">
          © 2026 EC SHOPPING. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
