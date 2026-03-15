import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search } from "lucide-react";
import { categories } from "@/lib/data";
import { Link } from "react-router-dom";

export function HeroBanner() {
  const [query, setQuery] = useState("");

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-green-600 text-white mx-4 mt-4 shadow-lg">
      <div className="px-4 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Morning, Hannah</p>
            <p className="text-xs opacity-90">What would you buy today?</p>
          </div>
          <button className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center ring-1 ring-white/40">
            <span>👤</span>
          </button>
        </div>
        <div className="mt-3">
          <h1 className="text-2xl font-bold leading-tight">Enjoy The Special Offer Up To 30%</h1>
          <p className="text-xs opacity-90 mt-1">From 14th June, 2025</p>
        </div>

        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/80" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search vegetables, fruits and more"
            className="pl-10 pr-3 bg-white/10 text-white placeholder:text-white/70 border border-white/20"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2 overflow-x-auto pb-1">
          {categories.slice(0, 6).map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-2 text-xs font-medium"
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-4 border-t border-white/20 px-4 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Fresh Products</p>
            <p className="text-xs opacity-80">Best selected items for today</p>
          </div>
          <button className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
            <ShoppingCart className="h-3 w-3" /> View cart
          </button>
        </div>
      </div>
    </section>
  );
}
