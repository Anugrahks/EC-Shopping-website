import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/data";
import { categories as localCategories, products as localProducts } from "@/lib/data";
import { slugify } from "@/lib/slug";
import { SEOHead } from "@/components/SEOHead";
import { getCatalogProducts } from "@/lib/use-catalog-products";

const Products = () => {
  const [searchParams] = useSearchParams();
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const categoryParam = searchParams.get("category") || "All";
  const searchParam = searchParams.get("search") || "";
  const offersOnly = searchParams.get("offers") === "true";
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const savedCatalog = localStorage.getItem("gc_products");
      if (savedCatalog) {
        try {
          const savedProducts: Product[] = JSON.parse(savedCatalog);
          if (Array.isArray(savedProducts)) {
            setProducts(savedProducts);
            setCategories(["All", ...new Set(savedProducts.map((product) => product.category))]);
            setLoading(false);
            return;
          }
        } catch {
          // Fall back to API/default catalog when local admin data is invalid.
        }
      }
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories"),
        ]);
        if (!productsRes.ok || !categoriesRes.ok) {
          throw new Error("Could not load data");
        }
        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        setProducts(Array.isArray(productsData) && productsData.length ? productsData : getCatalogProducts());
        setCategories(["All", ...categoriesData.map((c: { name: string }) => c.name)]);
      } catch (error) {
        console.error(error);
        setProducts(getCatalogProducts());
        setCategories(["All", ...localCategories.map((category) => category.name)]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const routeCategory = categorySlug
      ? categories.find((category) => slugify(category) === categorySlug)
      : categoryParam;
    setActiveCategory(routeCategory || "All");
  }, [categorySlug, categoryParam, categories]);

  const filtered = useMemo(() => {
    let result = products;
    if (activeCategory !== "All") {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (searchParam) {
      const q = searchParam.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }
    if (offersOnly) result = result.filter((product) => product.isTodayOffer);
    return result;
  }, [activeCategory, searchParam, offersOnly, products]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${offersOnly ? "Today's Grocery Offers" : activeCategory === "All" ? "Fresh Groceries" : `${activeCategory} Online`} | EC SHOPPING`}
        description={`Browse ${offersOnly ? "today's special grocery deals" : activeCategory === "All" ? "fresh groceries, fruits, vegetables and daily essentials" : `${activeCategory.toLowerCase()} at great prices`}. Order online from EC SHOPPING.`}
      />
      <Navbar />
      <main id="main-content" className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">
          {searchParam ? `Search: "${searchParam}"` : activeCategory === "All" ? "All Products" : activeCategory}
        </h1>
        {loading ? (
          <p className="text-muted-foreground">Loading products...</p>
        ) : (
          <>
            <p className="text-muted-foreground mb-6">{filtered.length} products found</p>

            <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"}
                  size="sm"
                  className="rounded-full shrink-0"
                  onClick={() => navigate(cat === "All" ? "/products" : `/category/${slugify(cat)}`)}
                >
                  {cat}
                </Button>
              ))}
            </div>

            {filtered.length > 0 && <section aria-label="Products">
              <h2 className="sr-only">Products</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>}

            {filtered.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-lg">No products found.</p>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Products;
