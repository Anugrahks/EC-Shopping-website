import type { CartItem, Product, ProductVariant } from "@/lib/data";

const getWeightVariants = (product: Product): ProductVariant[] => {
  const match = product.unit.trim().match(/^(\d+(?:\.\d+)?)\s*(kg|g|l|ml)$/i);
  if (!match) return [];

  const quantity = Number(match[1]);
  const unit = match[2].toLowerCase();
  const baseAmount = quantity * (unit === "kg" || unit === "l" ? 1000 : 1);
  const baseUnit = unit === "kg" || unit === "g" ? "g" : "ml";
  const packSizes = [100, 200, 300, 500, 1000].filter((size) => size < baseAmount);

  return packSizes.map((size) => {
    const ratio = size / baseAmount;
    const grams = Number((product.price * ratio).toFixed(2));
    const discountPrice = product.discountPrice === undefined
      ? undefined
      : Number((product.discountPrice * ratio).toFixed(2));
    return {
      id: `auto-${size}${baseUnit}`,
      unit: `${size >= 1000 ? `${size / 1000} ${baseUnit === "g" ? "kg" : "L"}` : `${size} ${baseUnit}`}`,
      price: grams,
      discountPrice,
      stock: Math.floor(product.stock / ratio),
    };
  });
};

export const getProductVariants = (product: Product): ProductVariant[] => {
  const variants = new Map<string, ProductVariant>();
  const addVariant = (variant: ProductVariant) => variants.set(variant.unit.trim().toLocaleLowerCase(), variant);

  addVariant({ id: "default", unit: product.unit, price: product.price, discountPrice: product.discountPrice, stock: product.stock });
  getWeightVariants(product).forEach(addVariant);
  product.variants?.forEach(addVariant);
  return [...variants.values()];
};

export const getCartLineId = (item: CartItem) =>
  `${item.product.id}:${item.variant?.id ?? "default"}`;

export const getCartItemPrice = (item: CartItem, isMember = false) => {
  const variant = item.variant;
  const basePrice = variant?.discountPrice || variant?.price || item.product.discountPrice || item.product.price;
  return isMember && item.product.isTodayOffer ? Math.round(basePrice * 0.9) : basePrice;
};

export const MINIMUM_ORDER_TOTAL = 500;