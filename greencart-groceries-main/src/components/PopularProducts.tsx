import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useCatalogProducts } from "@/lib/use-catalog-products";

export function PopularProducts() {
  const products = useCatalogProducts();
  const popular = products.filter((p) => p.isPopular);

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Popular Products</h2>
        <Button variant="outline" asChild>
          <Link to="/products">View All</Link>
        </Button>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {popular.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
