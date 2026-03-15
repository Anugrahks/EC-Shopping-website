import { useEffect, useState } from "react";
import { products } from "@/lib/data";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";

const CATEGORIES_KEY = "gc_categories";

export function AllProducts() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(CATEGORIES_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCategories(parsed.map((c: any) => c.name ?? c));
          return;
        }
      } catch {
        // ignore
      }
    }
    setCategories([...new Set(products.map((p) => p.category))]);
  }, []);

  const allCategories = ["All", ...categories];
  const filtered = activeCategory === "All"
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <section className="container mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold text-foreground mb-6">All Products</h2>
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
        {allCategories.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? "default" : "outline"}
            size="sm"
            className="rounded-full shrink-0"
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
