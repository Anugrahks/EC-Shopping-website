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
        <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 text-sm font-bold text-emerald-700">
            <span className="text-xl">🥬</span>
            <span className="hidden md:inline">EC Shopping</span>
          </Link>
          <div className="flex-1 sm:flex hidden items-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9 pr-3"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearch(e); }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/cart" className="relative p-2 rounded-full hover:bg-slate-100">
              <ShoppingCart className="h-5 w-5 text-emerald-700" />
              {totalItems > 0 && <Badge className="absolute -top-1 -right-1 h-4 w-4 text-[10px]">{totalItems}</Badge>}
            </Link>
            <button
              className="rounded-full border border-emerald-600 p-2 text-emerald-700 sm:hidden"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="hidden sm:flex gap-2">
              <Link to="/login" className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white">Login</Link>
              <Link to="/login" className="rounded-full border border-emerald-600 px-3 py-1 text-xs font-medium text-emerald-600">Register</Link>
            </div>
          </div>
        </div>

        <div className="sm:hidden px-4 pb-2">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-9 pr-3"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
            <Link to="/" className="block py-2 text-sm">Home</Link>
            <Link to="/products" className="block py-2 text-sm">Shop</Link>
            <Link to="/about" className="block py-2 text-sm">About</Link>
            <Link to="/login" className="block py-2 text-sm">Login / Register</Link>
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
