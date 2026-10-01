import { useParams, Link, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { useMember } from "@/lib/member-context";
import { Star, ShoppingCart, ArrowLeft } from "lucide-react";
import type { Product } from "@/lib/data";
import { SEOHead } from "@/components/SEOHead";
import { slugify } from "@/lib/slug";
import { products as localProducts } from "@/lib/data";
import { getCatalogProducts, useCatalogProducts } from "@/lib/use-catalog-products";
import { optimizeUnsplashImage } from "@/lib/image-url";
import { getProductVariants } from "@/lib/product-variants";
import { ProductCard } from "@/components/ProductCard";

const ProductDetail = () => {
  const { id, categorySlug, productSlug } = useParams();
  const { addToCart } = useCart();
  const { isMember } = useMember();
  const catalogProducts = useCatalogProducts();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState("default");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id && (!categorySlug || !productSlug)) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        if (categorySlug && productSlug) {
          const res = await fetch("/api/products");
          if (!res.ok) throw new Error("Could not load products");
          const allProducts: Product[] = await res.json();
          if (res.headers.get("X-Catalog-Storage") !== "configured") {
            const localProduct = getCatalogProducts().find((item) => slugify(item.category) === categorySlug && slugify(item.name) === productSlug);
            setProduct(localProduct || null);
            return;
          }
          localStorage.setItem("gc_products", JSON.stringify(allProducts));
          setProduct(allProducts.find((item) => slugify(item.category) === categorySlug && slugify(item.name) === productSlug) || null);
        } else {
          const res = await fetch(`/api/products/${id}`);
          if (!res.ok) {
            setProduct(null);
            return;
          }
          const remoteProduct: Product = await res.json();
          if (res.headers.get("X-Catalog-Storage") !== "configured") {
            setProduct(getCatalogProducts().find((item) => item.id === id) || localProducts.find((item) => item.id === id) || null);
            return;
          }
          setProduct(remoteProduct);
        }
      } catch (error) {
        console.error(error);
        const savedProducts = getCatalogProducts();
        setProduct(savedProducts.find((item) => id
          ? item.id === id
          : slugify(item.category) === categorySlug && slugify(item.name) === productSlug) || localProducts.find((item) => id
            ? item.id === id
            : slugify(item.category) === categorySlug && slugify(item.name) === productSlug) || null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, categorySlug, productSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main id="main-content" className="container mx-auto px-4 py-20 text-center">
          <p className="text-xl text-muted-foreground">Loading product...</p>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main id="main-content" className="container mx-auto px-4 py-20 text-center">
          <p className="text-xl text-muted-foreground">Product not found.</p>
          <Button asChild className="mt-4"><Link to="/products">Back to Shop</Link></Button>
        </main>
      </div>
    );
  }

  if (id) {
    return <Navigate replace to={`/product/${slugify(product.category)}/${slugify(product.name)}`} />;
  }

  const variants = getProductVariants(product);
  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId) ?? variants[0];
  const discount = selectedVariant.discountPrice
    ? Math.round(((selectedVariant.price - selectedVariant.discountPrice) / selectedVariant.price) * 100)
    : 0;
  const basePrice = selectedVariant.discountPrice || selectedVariant.price;
  const vipPrice = product.isTodayOffer ? Math.round(basePrice * 0.9) : basePrice;
  const recommendationCatalog = catalogProducts.length > 1 ? catalogProducts : localProducts;
  const relatedProducts = recommendationCatalog
    .filter((item) => item.id !== product.id && item.category === product.category)
    .concat(recommendationCatalog.filter((item) => item.id !== product.id && item.category !== product.category))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${product.name} | Buy Online | EC SHOPPING`}
        description={`${product.description}. Buy ${product.name} online for ₹${product.discountPrice || product.price} at EC SHOPPING. Fresh groceries delivered to your doorstep.`}
        image={product.image}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          image: product.image,
          category: product.category,
          offers: {
            "@type": "Offer",
            priceCurrency: "INR",
            price: basePrice,
            availability: selectedVariant.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: window.location.href,
          },
        }}
      />
      <Navbar />
      <main id="main-content" className="container mx-auto px-4 py-8">
        <Link to="/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </Link>
        <div className="grid items-start gap-8 md:grid-cols-2 md:gap-10">
          <div className="flex h-56 items-center justify-center overflow-hidden rounded-2xl bg-white sm:h-64 md:h-80">
            <img src={optimizeUnsplashImage(product.image, 800, 800)} alt={product.name} width="800" height="800" className="h-full w-full object-contain" />
          </div>
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">{product.category}</p>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < Math.round(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({product.rating})</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">₹{isMember && product.isTodayOffer ? vipPrice : basePrice}</span>
              {selectedVariant.discountPrice && (
                <>
                  <span className="text-xl line-through text-muted-foreground">₹{selectedVariant.price}</span>
                  <span className="bg-secondary text-secondary-foreground text-sm font-bold px-2 py-1 rounded">{discount}% OFF</span>
                </>
              )}
            </div>
            {isMember && product.isTodayOffer && (
              <div className="text-sm text-success">VIP offer: ₹{vipPrice} (10% extra VIP savings)</div>
            )}
            <p className="text-muted-foreground">{product.description}</p>
            {variants.length > 1 && <div className="space-y-2">
              <label htmlFor="product-size" className="text-sm font-medium">Choose pack size</label>
              <select id="product-size" value={selectedVariant.id} onChange={(event) => setSelectedVariantId(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {variants.map((variant) => <option key={variant.id} value={variant.id} disabled={variant.stock <= 0}>{variant.unit} — ₹{variant.discountPrice || variant.price}{variant.stock <= 0 ? " (out of stock)" : ""}</option>)}
              </select>
            </div>}
            <p className="text-sm">Unit: <span className="font-medium">{selectedVariant.unit}</span></p>
            <p className="text-sm">
              Stock: <span className={`font-medium ${selectedVariant.stock > 0 ? "text-primary" : "text-destructive"}`}>
                {selectedVariant.stock > 0 ? `${selectedVariant.stock} available` : "Out of stock"}
              </span>
            </p>
            <Button
              size="lg"
              className="rounded-full gap-2"
              onClick={() => addToCart(product, selectedVariant.id === "default" ? undefined : selectedVariant)}
              disabled={selectedVariant.stock === 0}
            >
              <ShoppingCart className="h-5 w-5" /> Add to Cart
            </Button>
          </div>
        </div>
        {relatedProducts.length > 0 && <section className="mt-12 border-t border-border pt-8" aria-labelledby="related-products-heading">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h2 id="related-products-heading" className="text-2xl font-bold">Similar products</h2>
              <p className="mt-1 text-sm text-muted-foreground">More from {product.category}</p>
            </div>
            <Link to={`/category/${slugify(product.category)}`} className="shrink-0 text-sm font-medium text-primary hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {relatedProducts.map((relatedProduct) => <ProductCard key={relatedProduct.id} product={relatedProduct} />)}
          </div>
        </section>}
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
