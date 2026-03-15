import { products } from "@/lib/data";
import { ProductCard } from "./ProductCard";

export function TodayOffers() {
  const offers = products.filter((p) => p.isTodayOffer);
  if (offers.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">🔥 Today's Offers</h2>
          <p className="text-muted-foreground text-sm">Don't miss these amazing deals!</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {offers.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
