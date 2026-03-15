import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Search, Menu, X, User, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart-context";
import { useMember } from "@/lib/member-context";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { totalItems } = useCart();
  const { member, isMember, memberName, logoutMember, customer, logoutCustomer } = useMember();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-sm font-bold text-emerald-700">
            <span className="text-xl">🥬</span>
            <span className="hidden sm:inline">GreenCart</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-muted-foreground">{isMember ? `Hi ${memberName}` : customer ? `Welcome back` : "Guest"}</span>
            <Link to="/cart" className="relative">
              <ShoppingCart className="h-5 w-5 text-emerald-700" />
              {totalItems > 0 && <Badge className="absolute -top-1 -right-1 h-4 w-4 text-[10px]">{totalItems}</Badge>}
            </Link>
            <button className="sm:hidden" onClick={() => setMobileMenuOpen((v) => !v)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-3 space-y-2 sm:hidden">
            <Link to="/" className="block py-2 text-sm">Home</Link>
            <Link to="/products" className="block py-2 text-sm">Shop</Link>
            <Link to="/about" className="block py-2 text-sm">About</Link>
            <Link to="/login" className="block py-2 text-sm">Login</Link>
          </div>
        )}
      </nav>
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 sm:hidden">
        <div className="flex justify-around px-4 py-2 text-center text-xs text-slate-600">
          <Link to="/" className="flex flex-col items-center gap-1 text-emerald-700"><span className="text-base">🏠</span>Home</Link>
          <Link to="/products" className="flex flex-col items-center gap-1"><span className="text-base">🛍️</span>Shop</Link>
          <Link to="/cart" className="flex flex-col items-center gap-1"><span className="text-base">🛒</span>Cart</Link>
          <Link to="/about" className="flex flex-col items-center gap-1"><span className="text-base">📄</span>About</Link>
        </div>
      </div>
    </>
  );
}
