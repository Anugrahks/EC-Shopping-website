import { Product } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import { useMember } from "@/lib/member-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { slugify } from "@/lib/slug";
import { optimizeUnsplashImage } from "@/lib/image-url";

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
      <Link to={`/product/${slugify(product.category)}/${slugify(product.name)}`} className="relative block h-24 sm:h-36 md:h-44 overflow-hidden" aria-label={`View ${product.name}`}>
        <img
          src={optimizeUnsplashImage(product.image, 400, 400)}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-orange-700 text-white text-xs font-semibold px-2 py-1 rounded-md">{discount}% OFF</span>
        )}
      </Link>
      <div className="space-y-1 p-2 sm:p-3">
        <p className="truncate text-[10px] font-medium text-emerald-700 sm:text-xs">{product.category}</p>
        <Link to={`/product/${slugify(product.category)}/${slugify(product.name)}`}>
          <h3 className="line-clamp-2 text-xs font-semibold text-slate-900 sm:text-sm">{product.name}</h3>
        </Link>
        <div className="flex items-center justify-between gap-1 text-[10px] text-slate-500 sm:text-xs">
          <span>{product.unit}</span>
          <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />{product.rating}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div>
            <div className="text-xs font-bold text-emerald-700 sm:text-sm">₹{isMember && product.isTodayOffer ? vipPrice : basePrice}</div>
            {product.discountPrice && <div className="text-xs line-through text-slate-500">₹{product.price}</div>}
          </div>
          <button
            onClick={(e) => { e.preventDefault(); addToCart(product); }}
            disabled={product.stock <= 0}
            aria-label={product.stock > 0 ? `Add ${product.name} to cart` : `${product.name} is out of stock`}
            title={product.stock > 0 ? "Add to cart" : "Out of stock"}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 sm:h-8 sm:w-8"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
