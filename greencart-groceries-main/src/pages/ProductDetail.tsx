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
import { getCatalogProducts } from "@/lib/use-catalog-products";
import { optimizeUnsplashImage } from "@/lib/image-url";

const ProductDetail = () => {
  const { id, categorySlug, productSlug } = useParams();
  const { addToCart } = useCart();
  const { isMember } = useMember();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id && (!categorySlug || !productSlug)) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const savedProduct = getCatalogProducts().find((item) => id
          ? item.id === id
          : slugify(item.category) === categorySlug && slugify(item.name) === productSlug);
        if (savedProduct) {
          setProduct(savedProduct);
          return;
        }
        if (categorySlug && productSlug) {
          const res = await fetch("/api/products");
          if (!res.ok) throw new Error("Could not load products");
          const allProducts: Product[] = await res.json();
          setProduct(allProducts.find((item) => slugify(item.category) === categorySlug && slugify(item.name) === productSlug) || null);
        } else {
          const res = await fetch(`/api/products/${id}`);
          if (!res.ok) {
            setProduct(null);
            return;
          }
          setProduct(await res.json());
        }
      } catch (error) {
        console.error(error);
        setProduct(localProducts.find((item) => id
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

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;
  const basePrice = product.discountPrice || product.price;
  const vipPrice = product.isTodayOffer ? Math.round(basePrice * 0.9) : basePrice;

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
            price: product.discountPrice || product.price,
            availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: window.location.href,
          },
        }}
      />
      <Navbar />
      <main id="main-content" className="container mx-auto px-4 py-8">
        <Link to="/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </Link>
        <div className="grid md:grid-cols-2 gap-10">
          <div className="rounded-2xl overflow-hidden bg-muted/30 aspect-square">
            <img src={optimizeUnsplashImage(product.image, 800, 800)} alt={product.name} width="800" height="800" className="w-full h-full object-cover" />
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
              {product.discountPrice && (
                <>
                  <span className="text-xl line-through text-muted-foreground">₹{product.price}</span>
                  <span className="bg-secondary text-secondary-foreground text-sm font-bold px-2 py-1 rounded">{discount}% OFF</span>
                </>
              )}
            </div>
            {isMember && product.isTodayOffer && (
              <div className="text-sm text-success">VIP offer: ₹{vipPrice} (10% extra VIP savings)</div>
            )}
            <p className="text-muted-foreground">{product.description}</p>
            <p className="text-sm">Unit: <span className="font-medium">{product.unit}</span></p>
            <p className="text-sm">
              Stock: <span className={`font-medium ${product.stock > 0 ? "text-primary" : "text-destructive"}`}>
                {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
              </span>
            </p>
            <Button
              size="lg"
              className="rounded-full gap-2"
              onClick={() => addToCart(product)}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="h-5 w-5" /> Add to Cart
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
