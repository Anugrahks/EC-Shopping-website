import { useState } from "react";
import type { Product, ProductVariant } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import { useMember } from "@/lib/member-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { slugify } from "@/lib/slug";
import { optimizeUnsplashImage } from "@/lib/image-url";
import { getProductVariants } from "@/lib/product-variants";

export function ProductCard({ product }: { product: Product }) {
  const variants = getProductVariants(product);
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0].id);
  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId) ?? variants[0];
  const { addToCart } = useCart();
  const { isMember } = useMember();
  const discount = selectedVariant.discountPrice
    ? Math.round(((selectedVariant.price - selectedVariant.discountPrice) / selectedVariant.price) * 100)
    : 0;
  const basePrice = selectedVariant.discountPrice || selectedVariant.price;
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
        {variants.length > 1 && (
          <label className="block pt-1">
            <span className="sr-only">Choose size for {product.name}</span>
            <select
              value={selectedVariant.id}
              onChange={(event) => setSelectedVariantId(event.target.value)}
              className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-800"
            >
              {variants.map((variant) => (
                <option key={variant.id} value={variant.id} disabled={variant.stock <= 0}>
                  {variant.unit} — ₹{variant.discountPrice || variant.price}{variant.stock <= 0 ? " — Out of stock" : ""}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="flex items-center justify-between gap-1 text-[10px] text-slate-500 sm:text-xs">
          <span>{selectedVariant.unit}</span>
          <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />{product.rating}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div>
            <div className="text-xs font-bold text-emerald-700 sm:text-sm">₹{isMember && product.isTodayOffer ? vipPrice : basePrice}</div>
            {selectedVariant.discountPrice && <div className="text-xs line-through text-slate-500">₹{selectedVariant.price}</div>}
          </div>
          <button
            onClick={(e) => { e.preventDefault(); addToCart(product, selectedVariant.id === "default" ? undefined : selectedVariant); }}
            disabled={selectedVariant.stock <= 0}
            aria-label={selectedVariant.stock > 0 ? `Add ${product.name}, ${selectedVariant.unit}, to cart` : `${product.name} ${selectedVariant.unit} is out of stock`}
            title={selectedVariant.stock > 0 ? "Add to cart" : "Out of stock"}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 sm:h-8 sm:w-8"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
