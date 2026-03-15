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
      <header className="bg-[#0f6f42] text-white sticky top-0 z-50">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-2 px-4 py-3">
          <div className="flex items-center gap-2 text-xl font-bold">
            <span className="text-2xl">🥬</span>
            <span>VegShop</span>
          </div>

          <div className="hidden lg:flex flex-1 justify-center px-2">
            <form onSubmit={handleSearch} className="relative w-full max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search groceries..."
                className="pl-10 pr-3 py-2 rounded-full bg-white text-slate-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/cart" className="relative p-2 rounded-full bg-white text-emerald-700">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && <Badge className="absolute -top-1 -right-1 h-4 w-4">{totalItems}</Badge>}
            </Link>
            <div className="hidden lg:flex gap-2">
              <Link to="/login" className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700">Login</Link>
              <Link to="/login" className="rounded-full border border-white px-3 py-1 text-xs font-semibold text-white">Register</Link>
            </div>
            <button className="lg:hidden rounded-full border border-white p-2" onClick={() => setMobileMenuOpen((v) => !v)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          <div className="lg:hidden w-full mt-2">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search groceries..."
                className="pl-10 pr-3 py-2 rounded-full bg-white text-slate-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden w-full mt-2 bg-white text-slate-800 rounded-xl p-3 text-sm">
              <Link to="/" className="block py-2">Home</Link>
              <Link to="/products" className="block py-2">Shop</Link>
              <Link to="/about" className="block py-2">About</Link>
              <Link to="/login" className="block py-2">Login / Register</Link>
            </div>
          )}
        </div>
      </header>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 lg:hidden">
        <div className="flex justify-around px-4 py-2 text-xs text-slate-700">
          <Link to="/" className="flex flex-col items-center gap-1 text-emerald-700"><span className="text-base">🏠</span>Home</Link>
          <Link to="/products" className="flex flex-col items-center gap-1"><span className="text-base">🛍️</span>Shop</Link>
          <Link to="/cart" className="flex flex-col items-center gap-1"><span className="text-base">🛒</span>Cart</Link>
          <Link to="/about" className="flex flex-col items-center gap-1"><span className="text-base">📄</span>About</Link>
        </div>
      </div>
    </>
  );
}
