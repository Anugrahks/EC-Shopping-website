import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-foreground text-background mt-10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥬</span>
              <span className="text-xl font-bold">Green Shop</span>
            </div>
            <p className="text-sm opacity-70">
              Fresh grocery delivery at your doorstep. Quality products at best prices.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm opacity-70">
              <Link to="/" className="hover:opacity-100">Home</Link>
              <Link to="/products" className="hover:opacity-100">Shop</Link>
              <Link to="/about" className="hover:opacity-100">About Us</Link>
              <Link to="/cart" className="hover:opacity-100">Cart</Link>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold">Categories</h4>
            <div className="flex flex-col gap-2 text-sm opacity-70">
              <Link to="/products?category=Fruits" className="hover:opacity-100">Fruits</Link>
              <Link to="/products?category=Vegetables" className="hover:opacity-100">Vegetables</Link>
              <Link to="/products?category=Grocery" className="hover:opacity-100">Grocery</Link>
              <Link to="/products?category=Meat+%26+Fish" className="hover:opacity-100">Meat & Fish</Link>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold">Contact Us</h4>
            <div className="flex flex-col gap-2 text-sm opacity-70">
              <p>📞 +91 98765 43210</p>
              <p>📧 support@greenshop.in</p>
              <p>📍 Mumbai, Maharashtra, India</p>
            </div>
          </div>
        </div>
        <div className="border-t border-background/20 mt-8 pt-6 text-center text-sm opacity-60">
          © 2026 Green Shop. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
