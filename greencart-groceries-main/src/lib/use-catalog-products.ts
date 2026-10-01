import { useEffect, useState } from "react";
import { products as defaultProducts, type Product } from "@/lib/data";

export const PRODUCTS_STORAGE_KEY = "gc_products";

export function getCatalogProducts(): Product[] {
  try {
    const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!saved) return defaultProducts;
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed as Product[] : defaultProducts;
  } catch {
    return defaultProducts;
  }
}

export function useCatalogProducts() {
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(getCatalogProducts);

  useEffect(() => {
    const syncProducts = (event: StorageEvent) => {
      if (event.key === PRODUCTS_STORAGE_KEY || event.key === null) {
        setCatalogProducts(getCatalogProducts());
      }
    };
    window.addEventListener("storage", syncProducts);
    return () => window.removeEventListener("storage", syncProducts);
  }, []);

  return catalogProducts;
}