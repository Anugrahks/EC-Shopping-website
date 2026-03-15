import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { useMember } from "@/lib/member-context";
import { Star, ShoppingCart, ArrowLeft } from "lucide-react";
import type { Product } from "@/lib/data";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) {
          setProduct(null);
          return;
        }
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-xl text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-xl text-muted-foreground">Product not found.</p>
          <Button asChild className="mt-4"><Link to="/products">Back to Shop</Link></Button>
        </div>
      </div>
    );
  }

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;
  const { isMember } = useMember();
  const basePrice = product.discountPrice || product.price;
  const vipPrice = product.isTodayOffer ? Math.round(basePrice * 0.9) : basePrice;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Link to="/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </Link>
        <div className="grid md:grid-cols-2 gap-10">
          <div className="rounded-2xl overflow-hidden bg-muted/30 aspect-square">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
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
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;
