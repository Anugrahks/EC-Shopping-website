import { Product } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 bg-card">
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden aspect-square bg-muted/30">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-secondary text-secondary-foreground text-xs font-bold px-2 py-1 rounded-md">
            {discount}% OFF
          </span>
        )}
      </Link>
      <div className="p-3 space-y-2">
        <p className="text-xs text-muted-foreground">{product.category}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-sm leading-tight hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground">{product.unit}</p>
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs text-muted-foreground">{product.rating}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">
              ₹{product.discountPrice || product.price}
            </span>
            {product.discountPrice && (
              <span className="text-xs line-through text-muted-foreground">₹{product.price}</span>
            )}
          </div>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
