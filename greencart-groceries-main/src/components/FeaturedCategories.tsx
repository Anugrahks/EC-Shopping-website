import { categories } from "@/lib/data";
import { Link } from "react-router-dom";

export function FeaturedCategories() {
  return (
    <section className="container mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold text-foreground mb-6">Featured Categories</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/products?category=${encodeURIComponent(cat.name)}`}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card hover:bg-accent border border-transparent hover:border-primary/20 transition-all group"
          >
            <div className="w-16 h-16 rounded-full overflow-hidden bg-muted">
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" loading="lazy" />
            </div>
            <span className="text-xs font-medium text-center">{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
