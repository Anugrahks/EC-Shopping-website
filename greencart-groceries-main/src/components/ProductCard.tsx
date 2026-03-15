import { Product } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import { useMember } from "@/lib/member-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { isMember } = useMember();
  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;
  const basePrice = product.discountPrice || product.price;
  const vipPrice = product.isTodayOffer ? Math.round(basePrice * 0.9) : basePrice;

  return (
    <Card className="overflow-hidden border border-slate-200 rounded-2xl hover:shadow-lg transition-shadow duration-200 bg-white">
      <Link to={`/product/${product.id}`} className="relative block h-36 md:h-44 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-md">{discount}% OFF</span>
        )}
      </Link>
      <div className="p-3 space-y-1">
        <p className="text-xs text-emerald-700 font-medium">{product.category}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-sm text-slate-900 line-clamp-2">{product.name}</h3>
        </Link>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{product.unit}</span>
          <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />{product.rating}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div>
            <div className="text-sm font-bold text-emerald-700">₹{isMember && product.isTodayOffer ? vipPrice : basePrice}</div>
            {product.discountPrice && <div className="text-xs line-through text-slate-400">₹{product.price}</div>}
          </div>
          <button
            onClick={(e) => { e.preventDefault(); addToCart(product); }}
            className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
