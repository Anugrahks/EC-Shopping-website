import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CartItem, Product, ProductVariant } from "./data";
import { getCartLineId, getCartItemPrice } from "./product-variants";
import { toast } from "sonner";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, variant?: ProductVariant) => void;
  removeFromCart: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = "gc_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) as CartItem[] : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((product: Product, variant?: ProductVariant) => {
    const stock = variant?.stock ?? product.stock;
    const unit = variant?.unit ?? product.unit;
    if (stock <= 0) {
      toast.error(`${product.name} is out of stock`);
      return;
    }
    const selectedLineId = getCartLineId({ product, quantity: 1, variant });
    setItems((prev) => {
      const existing = prev.find((i) => getCartLineId(i) === selectedLineId);
      if (existing && existing.quantity >= stock) {
        toast.error(`Only ${stock} ${unit} available`);
        return prev;
      }
      if (existing) {
        return prev.map((i) =>
          getCartLineId(i) === selectedLineId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, variant, quantity: 1 }];
    });
    toast.success(`${product.name} (${unit}) added to cart`);
  }, []);

  const removeFromCart = useCallback((lineId: string) => {
    setItems((prev) => prev.filter((i) => getCartLineId(i) !== lineId));
  }, []);

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => getCartLineId(i) !== lineId));
      return;
    }
    setItems((prev) => prev.map((item) => getCartLineId(item) === lineId
      ? { ...item, quantity: Math.min(quantity, item.variant?.stock ?? item.product.stock) }
      : item));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + getCartItemPrice(item) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
