import { products } from "@/lib/data";
import { ProductCard } from "./ProductCard";

export function TodayOffers() {
  const offers = products.filter((p) => p.isTodayOffer);
  if (offers.length === 0) return null;

  return (
    <section className="bg-[#f0fdf4] py-8">
      <div className="container mx-auto px-4">
        <div className="mb-4 flex items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">🔥 Today's Offers</h2>
            <p className="text-sm text-slate-500">Don't miss these amazing deals!</p>
          </div>
          <button className="rounded-full border border-emerald-500 text-emerald-700 px-3 py-1 text-xs font-semibold">View All</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {offers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
