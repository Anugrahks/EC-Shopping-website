import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Search, Menu, X, MapPin, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart-context";
import { useMember } from "@/lib/member-context";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { totalItems } = useCart();
  const { member, isMember, memberName, logoutMember, customer, logoutCustomer } = useMember();
  const navigate = useNavigate();
  const isAdminPage = useLocation().pathname.startsWith("/admin");

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
          <Link to="/" className="flex items-center gap-2 text-xl font-bold" aria-label="EC Shopping home">
            <span className="text-2xl">🥬</span>
            <span>EC SHOPPING</span>
          </Link>

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
            {!isAdminPage && (
              <Link to="/cart" className="relative p-2 rounded-full bg-white text-emerald-700">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && <Badge className="absolute -top-1 -right-1 h-4 w-4">{totalItems}</Badge>}
              </Link>
            )}
            {customer && !isAdminPage ? (
              <div className="hidden lg:flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs">
                <span aria-label="Signed in customer">Hi, {customer.name}</span>
                <button
                  type="button"
                  className="rounded-full border border-white/50 p-1 hover:bg-white/15"
                  aria-label="Log out"
                  title="Log out"
                  onClick={() => { logoutCustomer(); toast.success("You have logged out"); }}
                ><LogOut className="h-3.5 w-3.5" /></button>
              </div>
            ) : !isAdminPage ? (
              <div className="hidden lg:flex gap-2">
                <Link to="/login" className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700">Login</Link>
                <Link to="/login" className="rounded-full border border-white px-3 py-1 text-xs font-semibold text-white">Register</Link>
              </div>
            ) : null}
            <button className="lg:hidden rounded-full border border-white p-2" aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((v) => !v)}>
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
              {customer && !isAdminPage && <div className="mb-2 border-b pb-2 text-emerald-800"><p className="font-semibold">Signed in as {customer.name}</p><p className="text-xs text-slate-500">{customer.phone}</p><p className="mt-1 flex items-start gap-1 text-xs text-slate-500"><MapPin className="mt-0.5 h-3 w-3 shrink-0" />{[customer.address, customer.city, customer.pincode].filter(Boolean).join(", ") || "No saved delivery address"}</p></div>}
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2">Home</Link>
              <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="block py-2">Shop</Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block py-2">About</Link>
              {customer ? <button type="button" onClick={() => { logoutCustomer(); setMobileMenuOpen(false); toast.success("You have logged out"); }} className="block py-2 text-left text-red-600">Log out</button> : <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2">Login / Register</Link>}
            </div>
          )}
        </div>
      </header>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 lg:hidden">
        <div className="flex justify-around px-4 py-2 text-xs text-slate-700">
          <Link to="/" className="flex flex-col items-center gap-1 text-emerald-700"><span className="text-base">🏠</span>Home</Link>
          <Link to="/products" className="flex flex-col items-center gap-1"><span className="text-base">🛍️</span>Shop</Link>
          {!isAdminPage && <Link to="/cart" className="flex flex-col items-center gap-1"><span className="text-base">🛒</span>Cart</Link>}
          <Link to="/about" className="flex flex-col items-center gap-1"><span className="text-base">📄</span>About</Link>
        </div>
      </div>
    </>
  );
}
