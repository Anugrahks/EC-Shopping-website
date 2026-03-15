import { useEffect, useState } from "react";
import { categories as defaultCategories } from "@/lib/data";
import { Link } from "react-router-dom";

const CATEGORIES_KEY = "gc_categories";

export function FeaturedCategories() {
  const [categories, setCategories] = useState(defaultCategories);

  useEffect(() => {
    const stored = localStorage.getItem(CATEGORIES_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCategories(parsed);
          return;
        }
      } catch {
        // ignore
      }
    }
    setCategories(defaultCategories);
  }, []);

  return (
    <section className="container mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold text-foreground mb-6">Featured Categories</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/products?category=${encodeURIComponent(cat.name)}`}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card hover:bg-accent border border-transparent hover:border-primary/20 transition-all group"
          >
            <div className="w-16 h-16 rounded-full overflow-hidden bg-muted text-2xl grid place-items-center">
              {cat.image ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" loading="lazy" /> : cat.icon}
            </div>
            <span className="text-xs font-medium text-center">{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
