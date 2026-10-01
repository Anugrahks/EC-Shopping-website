import { useEffect, useState } from "react";
import { categories as defaultCategories, products as defaultProducts, type Category, type Product } from "@/lib/data";

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
    let active = true;
    const refreshProducts = async () => {
      try {
        const response = await fetch("/api/products", { cache: "no-store" });
        if (!response.ok) return;
        const products = await response.json() as Product[];
        if (!Array.isArray(products) || !active) return;
        if (response.headers.get("X-Catalog-Storage") !== "configured") return;
        setCatalogProducts(products);
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
      } catch {
        // Keep the bundled or previously cached catalog available offline.
      }
    };
    void refreshProducts();
    const timer = window.setInterval(() => void refreshProducts(), 30_000);
    const onFocus = () => void refreshProducts();
    const syncProducts = (event: StorageEvent) => {
      if (event.key === PRODUCTS_STORAGE_KEY || event.key === null) {
        void refreshProducts();
      }
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", syncProducts);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", syncProducts);
    };
  }, []);

  return catalogProducts;
}

export const CATEGORIES_STORAGE_KEY = "gc_categories";

export function useCatalogCategories() {
  const [catalogCategories, setCatalogCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      return saved ? JSON.parse(saved) as Category[] : defaultCategories;
    } catch {
      return defaultCategories;
    }
  });

  useEffect(() => {
    let active = true;
    const refreshCategories = async () => {
      try {
        const response = await fetch("/api/categories", { cache: "no-store" });
        if (!response.ok) return;
        const categories = await response.json() as Category[];
        if (!Array.isArray(categories) || !active) return;
        if (response.headers.get("X-Catalog-Storage") !== "configured") return;
        setCatalogCategories(categories);
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
      } catch {
        // Keep the bundled or previously cached categories available offline.
      }
    };
    void refreshCategories();
    const timer = window.setInterval(() => void refreshCategories(), 30_000);
    const onFocus = () => void refreshCategories();
    const onStorage = (event: StorageEvent) => {
      if (event.key === CATEGORIES_STORAGE_KEY || event.key === null) void refreshCategories();
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return catalogCategories;
}