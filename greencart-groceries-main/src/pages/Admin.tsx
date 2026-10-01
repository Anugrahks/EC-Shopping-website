import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useMember } from "@/lib/member-context";
import { products as initialProducts, categories as initialCategories, Product, ProductVariant } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2, Plus, Package, LayoutDashboard, ShoppingBag, Tag, Image as ImageIcon, User, Trash } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { TODAY_OFFERS_BANNER_KEY, getTodayOffersBanners, type TodayOffersBanner } from "@/lib/today-offers-banner";
import { getOrderReport, type OrderStatus } from "@/lib/order-report";
import { slugify } from "@/lib/slug";
import { getProductVariants } from "@/lib/product-variants";
import { FOOTER_CONTACTS_STORAGE_KEY, getFooterContacts, type FooterContact } from "@/lib/footer-contacts";

const ORDERS_KEY = "gc_orders";
const CATEGORIES_KEY = "gc_categories";
const PRODUCTS_KEY = "gc_products";

type SavedOrder = {
  id: string;
  name: string;
  phone?: string;
  deliveryAddress?: string;
  total: number;
  date: string;
  createdAt?: string;
  status?: OrderStatus;
  deliveryLocation?: { latitude: number; longitude: number; accuracy: number } | null;
  items: Array<{ productName: string; quantity: number; amount: number }>;
};

type ProductVariantFormRow = {
  id: string;
  unit: string;
  price: string;
  discountPrice: string;
  stock: string;
};

async function saveSharedCatalogWithToken(endpoint: string, value: unknown, token: string) {
  const response = await fetch(endpoint, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(value),
  });
  const result = await response.json();
  if (!response.ok || !result.success) throw new Error(result.message || "Could not save shared changes.");
}

const Admin = () => {
  const { members, addMember, removeMember, customerList } = useMember();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminToken, setAdminToken] = useState("");
  const [sharedCatalogReady, setSharedCatalogReady] = useState(true);
  const [sharedBannersReady, setSharedBannersReady] = useState(true);
  const [password, setPassword] = useState("");
  const [newMemberNumber, setNewMemberNumber] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newCategory, setNewCategory] = useState({ name: "", icon: "", image: "" });
  const [productsList, setProductsList] = useState<Product[]>(initialProducts);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({ name: "", category: "", price: "", discountPrice: "", stock: "", unit: "", variantOptions: [] as ProductVariantFormRow[], image: "", description: "" });
  const [categoriesList, setCategoriesList] = useState(initialCategories);
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [offersBanners, setOffersBanners] = useState<TodayOffersBanner[]>(getTodayOffersBanners);
  const [footerContacts, setFooterContacts] = useState<FooterContact[]>(getFooterContacts);

  useEffect(() => {
    const storedOrders = localStorage.getItem(ORDERS_KEY);
    if (storedOrders) {
      try {
        setOrders(JSON.parse(storedOrders));
      } catch {
        setOrders([]);
      }
    }
    let cancelled = false;
    const loadCatalog = async () => {
      try {
        const [productsResponse, categoriesResponse, bannersResponse, contactsResponse] = await Promise.all([
          fetch("/api/products", { cache: "no-store" }),
          fetch("/api/categories", { cache: "no-store" }),
          fetch("/api/today-offers-banners", { cache: "no-store" }),
          fetch("/api/footer-contacts", { cache: "no-store" }),
        ]);
        if (!productsResponse.ok || !categoriesResponse.ok) throw new Error("Could not load the shared catalog.");
        const [remoteProducts, remoteCategories] = await Promise.all([productsResponse.json(), categoriesResponse.json()]);
        const legacyProducts = localStorage.getItem(PRODUCTS_KEY);
        const legacyCategories = localStorage.getItem(CATEGORIES_KEY);
        const productsInitialized = productsResponse.headers.get("X-Catalog-Initialized") === "true";
        const categoriesInitialized = categoriesResponse.headers.get("X-Catalog-Initialized") === "true";
        setSharedCatalogReady(productsResponse.headers.get("X-Catalog-Storage") === "configured" && categoriesResponse.headers.get("X-Catalog-Storage") === "configured");
        setSharedBannersReady(bannersResponse.headers.get("X-Catalog-Storage") === "configured");
        if (contactsResponse.headers.get("X-Catalog-Storage") === "configured" && contactsResponse.headers.get("X-Catalog-Initialized") === "true") {
          const remoteContacts = await contactsResponse.json() as FooterContact[];
          if (Array.isArray(remoteContacts)) {
            setFooterContacts(remoteContacts);
            localStorage.setItem(FOOTER_CONTACTS_STORAGE_KEY, JSON.stringify(remoteContacts));
          }
        }
        const nextProducts = !productsInitialized && legacyProducts ? JSON.parse(legacyProducts) : remoteProducts;
        const nextCategories = !categoriesInitialized && legacyCategories ? JSON.parse(legacyCategories) : remoteCategories;
        if (cancelled) return;
        setProductsList(Array.isArray(nextProducts) ? nextProducts : initialProducts);
        setCategoriesList(Array.isArray(nextCategories) ? nextCategories : initialCategories);
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(nextProducts));
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(nextCategories));
        if (bannersResponse.ok && bannersResponse.headers.get("X-Catalog-Storage") === "configured" && bannersResponse.headers.get("X-Catalog-Initialized") === "true") {
          const remoteBanners = await bannersResponse.json() as TodayOffersBanner[];
          if (Array.isArray(remoteBanners)) {
            setOffersBanners(remoteBanners);
            localStorage.setItem(TODAY_OFFERS_BANNER_KEY, JSON.stringify(remoteBanners));
          }
        }
      } catch {
        if (cancelled) return;
        try {
          const savedProducts = localStorage.getItem(PRODUCTS_KEY);
          const savedCategories = localStorage.getItem(CATEGORIES_KEY);
          if (savedProducts) setProductsList(JSON.parse(savedProducts));
          if (savedCategories) setCategoriesList(JSON.parse(savedCategories));
        } catch {
          setProductsList(initialProducts);
          setCategoriesList(initialCategories);
        }
      }
    };
    void loadCatalog();
    return () => { cancelled = true; };
  }, []);

  const saveSharedCatalog = async (endpoint: string, value: unknown) => {
    try {
      await saveSharedCatalogWithToken(endpoint, value, adminToken);
    } catch (error) {
      if (error instanceof Error && error.message.includes("sign-in expired")) {
        setAdminToken("");
        setIsLoggedIn(false);
      }
      throw error;
    }
  };

  const handleAdminLogin = async () => {
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json();
      if (!response.ok || !result.success || typeof result.token !== "string") {
        throw new Error(result.message || "Admin sign-in failed.");
      }
      setAdminToken(result.token);
      setIsLoggedIn(true);
      setPassword("");
      try {
        const [productsResponse, categoriesResponse, bannersResponse, contactsResponse] = await Promise.all([
          fetch("/api/products", { cache: "no-store" }),
          fetch("/api/categories", { cache: "no-store" }),
          fetch("/api/today-offers-banners", { cache: "no-store" }),
          fetch("/api/footer-contacts", { cache: "no-store" }),
        ]);
        const catalogReady = productsResponse.headers.get("X-Catalog-Storage") === "configured" && categoriesResponse.headers.get("X-Catalog-Storage") === "configured";
        setSharedCatalogReady(catalogReady);
        const bannersReady = bannersResponse.headers.get("X-Catalog-Storage") === "configured";
        setSharedBannersReady(bannersReady);
        const [remoteProducts, remoteCategories, remoteBanners] = await Promise.all([productsResponse.json(), categoriesResponse.json(), bannersResponse.json()]) as [Product[], typeof initialCategories, TodayOffersBanner[]];
        if (catalogReady) {
          const productsInitialized = productsResponse.headers.get("X-Catalog-Initialized") === "true";
          const categoriesInitialized = categoriesResponse.headers.get("X-Catalog-Initialized") === "true";
          const bannersInitialized = bannersResponse.headers.get("X-Catalog-Initialized") === "true";
          const nextProducts = productsInitialized
            ? remoteProducts
            : JSON.parse(localStorage.getItem(PRODUCTS_KEY) || JSON.stringify(remoteProducts)) as Product[];
          const nextCategories = categoriesInitialized
            ? remoteCategories
            : JSON.parse(localStorage.getItem(CATEGORIES_KEY) || JSON.stringify(remoteCategories)) as typeof initialCategories;
          const nextBanners = bannersInitialized
            ? remoteBanners
            : getTodayOffersBanners();
          const contactsInitialized = contactsResponse.headers.get("X-Catalog-Initialized") === "true";
          const nextContacts = contactsInitialized
            ? await contactsResponse.json() as FooterContact[]
            : getFooterContacts();
          await Promise.all([
            saveSharedCatalogWithToken("/api/admin/products", nextProducts, result.token),
            saveSharedCatalogWithToken("/api/admin/categories", nextCategories, result.token),
            saveSharedCatalogWithToken("/api/admin/today-offers-banners", nextBanners, result.token),
            saveSharedCatalogWithToken("/api/admin/footer-contacts", nextContacts, result.token),
          ]);
          setProductsList(nextProducts);
          setCategoriesList(nextCategories);
          setOffersBanners(nextBanners);
          setFooterContacts(nextContacts);
          localStorage.setItem(PRODUCTS_KEY, JSON.stringify(nextProducts));
          localStorage.setItem(CATEGORIES_KEY, JSON.stringify(nextCategories));
          localStorage.setItem(TODAY_OFFERS_BANNER_KEY, JSON.stringify(nextBanners));
          localStorage.setItem(FOOTER_CONTACTS_STORAGE_KEY, JSON.stringify(nextContacts));
          toast.success("Signed in and synced this device's catalog, banners, and contacts across devices.");
        }
        if (!catalogReady) throw new Error("Cloudflare KV is not bound yet. Add a CATALOG KV binding and ADMIN_PASSWORD secret to enable sharing across devices.");
      } catch (error) {
        toast.warning(error instanceof Error ? error.message : "Signed in, but the shared catalog could not sync.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Admin sign-in failed.");
    }
  };

  const openProductDialog = (product?: Product) => {
    setEditingProductId(product?.id ?? null);
    const defaultCategory = categoriesList[0]?.name || "";
    setProductForm(product ? {
      name: product.name,
      category: product.category,
      price: String(product.price),
      discountPrice: product.discountPrice ? String(product.discountPrice) : "",
      stock: String(product.stock),
      unit: product.unit,
      variantOptions: (product.variants ?? []).map((variant) => ({
        id: variant.id,
        unit: variant.unit,
        price: String(variant.price),
        discountPrice: variant.discountPrice === undefined ? "" : String(variant.discountPrice),
        stock: String(variant.stock),
      })),
      image: product.image,
      description: product.description,
    } : { name: "", category: defaultCategory, price: "", discountPrice: "", stock: "", unit: "", variantOptions: [], image: "", description: "" });
    setProductDialogOpen(true);
  };

  const handleProductImageUpload = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be smaller than 10 MB");
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const maxDimension = 1280;
      const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(imageUrl);
        toast.error("Could not process this image");
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      setProductForm((previous) => ({ ...previous, image: canvas.toDataURL("image/webp", 0.82) }));
      URL.revokeObjectURL(imageUrl);
      toast.success("Product image uploaded");
    };
    image.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      toast.error("Could not open this image");
    };
    image.src = imageUrl;
  };

  const compressBannerImage = (file: File) => new Promise<string>((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const maxDimension = 1200;
      const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(imageUrl);
        reject(new Error("Could not process this banner image"));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const compressed = canvas.toDataURL("image/webp", 0.62);
      URL.revokeObjectURL(imageUrl);
      resolve(compressed);
    };
    image.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error(`Could not open ${file.name}`));
    };
    image.src = imageUrl;
  });

  const handleOffersBannerUpload = async (files?: FileList | null) => {
    if (!files?.length) return;
    const selected = Array.from(files);
    const remainingSlots = 10 - offersBanners.length;
    if (selected.length > remainingSlots) {
      toast.error(`You can upload up to 10 banners. ${remainingSlots} slot(s) remaining.`);
      return;
    }
    if (selected.some((file) => !file.type.startsWith("image/"))) {
      toast.error("Choose image files only");
      return;
    }
    if (selected.some((file) => file.size > 10 * 1024 * 1024)) {
      toast.error("Each banner image must be smaller than 10 MB");
      return;
    }

    try {
      const images = await Promise.all(selected.map(compressBannerImage));
      const added = images.map((image, index) => ({
        id: `${Date.now()}-${index}`,
        image,
        title: "Today's Offers",
        subtitle: "Don't miss these amazing deals!",
        enabled: true,
      }));
      setOffersBanners((current) => [...current, ...added]);
      toast.success(`${added.length} banner${added.length === 1 ? "" : "s"} uploaded. Save to publish.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not process banner images");
    }
  };

  const updateOffersBanner = (id: string, changes: Partial<TodayOffersBanner>) => {
    setOffersBanners((current) => current.map((banner) => banner.id === id ? { ...banner, ...changes } : banner));
  };

  const removeOffersBanner = (id: string) => {
    setOffersBanners((current) => current.filter((banner) => banner.id !== id));
  };

  const saveOffersBanner = async () => {
    try {
      await saveSharedCatalog("/api/admin/today-offers-banners", offersBanners);
      localStorage.setItem(TODAY_OFFERS_BANNER_KEY, JSON.stringify(offersBanners));
      toast.success("Offer banners saved and synced to all devices");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the banners. Try smaller images.");
    }
  };

  const clearOffersBanner = async () => {
    try {
      await saveSharedCatalog("/api/admin/today-offers-banners", []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove the shared banners.");
      return;
    }
    setOffersBanners([]);
    localStorage.removeItem(TODAY_OFFERS_BANNER_KEY);
    toast.success("Offers banner removed from every device");
  };

  const saveFooterContacts = async () => {
    const validContacts = footerContacts.filter((contact) => contact.label.trim() && contact.value.trim());
    if (validContacts.length !== footerContacts.length) {
      toast.error("Every contact needs both a label and a value.");
      return;
    }
    try {
      await saveSharedCatalog("/api/admin/footer-contacts", validContacts);
      setFooterContacts(validContacts);
      localStorage.setItem(FOOTER_CONTACTS_STORAGE_KEY, JSON.stringify(validContacts));
      toast.success("Footer contact details saved and synced to all devices.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the contact details.");
    }
  };

  const saveProduct = () => {
    const price = Number(productForm.price);
    const stock = Number(productForm.stock);
    if (!productForm.name.trim() || !productForm.category.trim() || !productForm.unit.trim()) {
      toast.error("Enter the product name, choose a category, and enter its main pack size.");
      return;
    }
    if (!productForm.price.trim() || !Number.isFinite(price) || price <= 0) {
      toast.error("Enter the regular price. It must be higher than the sale price (for example, regular ₹120 and sale ₹114).");
      document.getElementById("product-price")?.focus();
      return;
    }
    if (!productForm.stock.trim() || !Number.isInteger(stock) || stock < 0) {
      toast.error("Enter the stock quantity as a whole number, such as 10.");
      document.getElementById("product-stock")?.focus();
      return;
    }
    const discountPrice = productForm.discountPrice ? Number(productForm.discountPrice) : undefined;
    if (discountPrice !== undefined && (!Number.isFinite(discountPrice) || discountPrice <= 0 || discountPrice >= price)) {
      toast.error("Sale price must be greater than zero and below the regular price");
      return;
    }
    const variants: ProductVariant[] = [];
    for (const row of productForm.variantOptions) {
      const unitValue = row.unit.trim();
      const variantPrice = Number(row.price);
      const variantStock = Number(row.stock);
      const variantSalePrice = row.discountPrice.trim() ? Number(row.discountPrice) : undefined;
      if (!unitValue || !row.price || !row.stock || !Number.isFinite(variantPrice) || variantPrice <= 0 || !Number.isInteger(variantStock) || variantStock < 0 || (variantSalePrice !== undefined && (!Number.isFinite(variantSalePrice) || variantSalePrice <= 0 || variantSalePrice >= variantPrice))) {
        toast.error(`Complete the size, regular price, and stock for “${unitValue || "each pack"}”. Sale price is optional and must be lower than regular price.`);
        return;
      }
      const normalizedUnit = unitValue.toLocaleLowerCase();
      if (normalizedUnit === productForm.unit.trim().toLocaleLowerCase() || variants.some((variant) => variant.unit.toLocaleLowerCase() === normalizedUnit)) {
        toast.error(`Pack size “${unitValue}” is duplicated. Each pack size must be unique.`);
        return;
      }
      variants.push({ id: slugify(unitValue), unit: unitValue, price: variantPrice, discountPrice: variantSalePrice, stock: variantStock });
    }
    const product: Product = {
      id: editingProductId || `${Date.now()}`,
      name: productForm.name.trim(),
      category: productForm.category.trim(),
      price,
      discountPrice,
      stock,
      unit: productForm.unit.trim(),
      variants,
      image: productForm.image.trim() || "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&h=600&fit=crop",
      description: productForm.description.trim() || `${productForm.name.trim()} from EC SHOPPING.`,
      rating: editingProductId ? productsList.find((item) => item.id === editingProductId)?.rating || 4 : 4,
      isTodayOffer: editingProductId ? productsList.find((item) => item.id === editingProductId)?.isTodayOffer : false,
      isPopular: editingProductId ? productsList.find((item) => item.id === editingProductId)?.isPopular : false,
    };
    const updated = editingProductId
      ? productsList.map((item) => item.id === editingProductId ? product : item)
      : [...productsList, product];
    void saveSharedCatalog("/api/admin/products", updated).then(() => {
      setProductsList(updated);
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
      setProductDialogOpen(false);
      toast.success("Product saved and synced to all devices");
    }).catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not save the product."));
  };

  const refreshOrders = () => {
    const stored = localStorage.getItem(ORDERS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setOrders(parsed.map((order: SavedOrder) => ({
          ...order,
          status: order.status || "pending",
          createdAt: order.createdAt || new Date().toISOString(),
        })));
      } catch {
        setOrders([]);
      }
    } else {
      setOrders([]);
    }
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders((current) => {
      const next = current.map((order) => order.id === id ? { ...order, status } : order);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(next));
      return next;
    });
    toast.success(`Order marked as ${status}`);
  };

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === ORDERS_KEY) {
        refreshOrders();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggleOffer = (id: string) => {
    const updated = productsList.map((product) => product.id === id ? { ...product, isTodayOffer: !product.isTodayOffer } : product);
    void saveSharedCatalog("/api/admin/products", updated).then(() => {
      setProductsList(updated);
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
      toast.success("Offer updated and synced to all devices");
    }).catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not save the offer."));
  };

  const deleteProduct = (id: string) => {
    const updated = productsList.filter((product) => product.id !== id);
    void saveSharedCatalog("/api/admin/products", updated).then(() => {
      setProductsList(updated);
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
      toast.success("Product deleted from all devices");
    }).catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not delete the product."));
  };

  const stats = [
    { label: "Products", value: productsList.length, icon: Package },
    { label: "Categories", value: categoriesList.length, icon: Tag },
    { label: "Today's Offers", value: productsList.filter((p) => p.isTodayOffer).length, icon: ShoppingBag },
    { label: "Members", value: members.length, icon: User },
    { label: "Customers", value: customerList.length, icon: User },
  ];

  const orderReport = getOrderReport(orders);
  const receivedCount = orders.filter((order) => order.status === "received").length;
  const deliveredCount = orders.filter((order) => order.status === "delivered").length;
  const returnedCount = orders.filter((order) => order.status === "returned").length;
  const pendingCount = orders.filter((order) => !order.status || order.status === "pending").length;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <main id="main-content">
          <Card className="p-8 w-full max-w-sm space-y-4">
            <h1 className="text-2xl font-bold text-center">Admin Login</h1>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter admin password" onKeyDown={(event) => { if (event.key === "Enter") void handleAdminLogin(); }} />
            </div>
            <Button className="w-full" onClick={() => void handleAdminLogin()}>Login</Button>
          </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content" className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <Button variant="outline" onClick={() => setIsLoggedIn(false)}>Logout</Button>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon }) => (
            <Card key={label} className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            </Card>
          ))}
        </div>

        {!sharedCatalogReady && <Card className="mb-6 border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="font-semibold">Catalog changes are only saved on this device right now.</p>
          <p>To share products with phones, configure the Cloudflare Pages <strong>CATALOG</strong> KV binding and <strong>ADMIN_PASSWORD</strong> secret, then redeploy. Saving will show an error until shared storage is ready.</p>
        </Card>}

        <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingProductId ? "Edit Product" : "Add Product"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="product-name">Name *</Label><Input id="product-name" value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} /></div>
              <div className="space-y-2">
                <Label htmlFor="product-category">Category *</Label>
                <select
                  id="product-category"
                  value={productForm.category}
                  onChange={(event) => setProductForm({ ...productForm, category: event.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select a category</option>
                  {categoriesList.map((category) => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2"><Label htmlFor="product-price">Regular price (₹) *</Label><Input id="product-price" type="number" min="0.01" step="0.01" placeholder="120" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} /><p className="text-xs text-muted-foreground">Required. Must be higher than the sale price.</p></div>
              <div className="space-y-2"><Label htmlFor="product-sale-price">Sale price (₹, optional)</Label><Input id="product-sale-price" type="number" min="0.01" step="0.01" placeholder="114" value={productForm.discountPrice} onChange={(event) => setProductForm({ ...productForm, discountPrice: event.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="product-stock">Stock quantity *</Label><Input id="product-stock" type="number" min="0" step="1" placeholder="10" value={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })} /><p className="text-xs text-muted-foreground">Required. Enter a whole number.</p></div>
              <div className="space-y-2"><Label htmlFor="product-unit">Main pack size / unit *</Label><Input id="product-unit" placeholder="e.g. 1kg" value={productForm.unit} onChange={(event) => setProductForm({ ...productForm, unit: event.target.value })} /></div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Additional pack sizes (optional)</Label>
                <p className="text-xs text-muted-foreground">Enter a separate size, regular price, optional sale price, and stock for each pack. The main size above remains available too.</p>
                <div className="space-y-3">
                  {productForm.variantOptions.map((variant, index) => (
                    <div key={variant.id} className="grid grid-cols-2 gap-2 rounded-lg border p-3 sm:grid-cols-[1.2fr_1fr_1fr_0.8fr_auto] sm:items-end sm:p-2">
                      <div className="space-y-1"><Label htmlFor={`variant-size-${variant.id}`}>Size / unit</Label><Input id={`variant-size-${variant.id}`} placeholder="100 g" value={variant.unit} onChange={(event) => setProductForm((current) => ({ ...current, variantOptions: current.variantOptions.map((item, itemIndex) => itemIndex === index ? { ...item, unit: event.target.value } : item) }))} /></div>
                      <div className="space-y-1"><Label htmlFor={`variant-price-${variant.id}`}>Regular price (₹)</Label><Input id={`variant-price-${variant.id}`} type="number" min="0.01" step="0.01" placeholder="20" value={variant.price} onChange={(event) => setProductForm((current) => ({ ...current, variantOptions: current.variantOptions.map((item, itemIndex) => itemIndex === index ? { ...item, price: event.target.value } : item) }))} /></div>
                      <div className="space-y-1"><Label htmlFor={`variant-sale-${variant.id}`}>Sale price (₹)</Label><Input id={`variant-sale-${variant.id}`} type="number" min="0.01" step="0.01" placeholder="Optional" value={variant.discountPrice} onChange={(event) => setProductForm((current) => ({ ...current, variantOptions: current.variantOptions.map((item, itemIndex) => itemIndex === index ? { ...item, discountPrice: event.target.value } : item) }))} /></div>
                      <div className="space-y-1"><Label htmlFor={`variant-stock-${variant.id}`}>Stock</Label><Input id={`variant-stock-${variant.id}`} type="number" min="0" step="1" placeholder="40" value={variant.stock} onChange={(event) => setProductForm((current) => ({ ...current, variantOptions: current.variantOptions.map((item, itemIndex) => itemIndex === index ? { ...item, stock: event.target.value } : item) }))} /></div>
                      <Button type="button" variant="outline" className="col-span-2 sm:col-span-1" aria-label={`Remove pack size ${index + 1}`} onClick={() => setProductForm((current) => ({ ...current, variantOptions: current.variantOptions.filter((_, itemIndex) => itemIndex !== index) }))}><Trash2 className="h-4 w-4" /><span className="sm:hidden">Remove pack size</span></Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => setProductForm((current) => ({ ...current, variantOptions: [...current.variantOptions, { id: `variant-${Date.now()}`, unit: "", price: "", discountPrice: "", stock: "" }] }))}><Plus className="mr-1 h-4 w-4" /> Add pack size</Button>
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="product-image">Upload product image (optional)</Label>
                <Input id="product-image" type="file" accept="image/*" onChange={(event) => handleProductImageUpload(event.target.files?.[0])} className="cursor-pointer file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1 file:text-primary-foreground" />
                <p className="text-xs text-muted-foreground">Choose an image up to 10 MB. It will be resized and saved with this product.</p>
                {productForm.image && <img src={productForm.image} alt="Product image preview" className="h-32 w-32 rounded-lg border object-cover" />}
              </div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="product-description">Description (optional)</Label><Textarea id="product-description" value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setProductDialogOpen(false)}>Cancel</Button>
              <Button onClick={saveProduct}>{editingProductId ? "Save Changes" : "Add Product"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Tabs defaultValue="products">
          <TabsList className="mb-6">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="offers">Today's Offers</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="banners">Banners</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Manage Products</h2>
                <Button size="sm" className="gap-1" onClick={() => openProductDialog()}><Plus className="h-4 w-4" /> Add Product</Button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3">Product</th>
                      <th className="text-left p-3 hidden sm:table-cell">Category</th>
                      <th className="text-left p-3">Price</th>
                      <th className="text-left p-3 hidden md:table-cell">Stock</th>
                      <th className="text-left p-3">Offer</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsList.map((p) => (
                      <tr key={p.id} className="border-t">
                        <td className="p-3 flex items-center gap-2">
                          <img src={p.image} alt={p.name} className="w-8 h-8 rounded object-cover" />
                          <span className="font-medium">{p.name}</span>
                        </td>
                        <td className="p-3 hidden sm:table-cell"><Badge variant="secondary">{p.category}</Badge></td>
                        <td className="p-3">
                          ₹{p.discountPrice || p.price}
                          {p.discountPrice && <span className="text-muted-foreground line-through ml-1 text-xs">₹{p.price}</span>}
                          {getProductVariants(p).length > 1 ? <span className="ml-1 text-xs text-muted-foreground">+{getProductVariants(p).length - 1} sizes</span> : null}
                        </td>
                        <td className="p-3 hidden md:table-cell">{p.stock}</td>
                        <td className="p-3">
                          <Switch checked={p.isTodayOffer || false} onCheckedChange={() => toggleOffer(p.id)} />
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Edit ${p.name}`} onClick={() => openProductDialog(p)}><Pencil className="h-3 w-3" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" aria-label={`Delete ${p.name}`} onClick={() => deleteProduct(p.id)}><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="offers">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold">Manage Today's Offers</h2>
                <p className="text-sm text-muted-foreground">Turn products on or off in the home-page offers section. Edit a product to set its sale price.</p>
              </div>
              {productsList.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">Add products first to create today's offers.</Card>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {productsList.map((product) => (
                    <Card key={product.id} className="flex items-center gap-3 p-4">
                      <img src={product.image} alt={product.name} className="h-14 w-14 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.discountPrice ? `Offer price ₹${product.discountPrice} (was ₹${product.price})` : `Price ₹${product.price} · no sale price set`}
                        </p>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <Switch
                          checked={Boolean(product.isTodayOffer)}
                          onCheckedChange={() => toggleOffer(product.id)}
                          aria-label={`${product.isTodayOffer ? "Remove" : "Add"} ${product.name} ${product.isTodayOffer ? "from" : "to"} today's offers`}
                        />
                        <span className="text-[10px] text-muted-foreground">{product.isTodayOffer ? "Shown" : "Hidden"}</span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => openProductDialog(product)}>Edit</Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-2 md:items-end justify-between">
                <div>
                  <h2 className="text-xl font-bold">Manage Categories</h2>
                  <p className="text-sm text-muted-foreground">Add new categories and they sync to the home page on every device.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-auto">
                  <Input
                    placeholder="Category name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    placeholder="Icon"
                    value={newCategory.icon}
                    onChange={(e) => setNewCategory((prev) => ({ ...prev, icon: e.target.value }))}
                  />
                  <Input
                    placeholder="Image URL (optional)"
                    value={newCategory.image}
                    onChange={(e) => setNewCategory((prev) => ({ ...prev, image: e.target.value }))}
                  />
                  <Button
                    className="whitespace-nowrap"
                    onClick={() => {
                      if (!newCategory.name.trim()) {
                        toast.error("Category name is required");
                        return;
                      }
                      const cat = {
                        id: `${Date.now()}`,
                        name: newCategory.name.trim(),
                        icon: newCategory.icon.trim() || "🛍️",
                        image: newCategory.image.trim() || "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&h=200&fit=crop",
                      };
                      const next = [...categoriesList, cat];
                      void saveSharedCatalog("/api/admin/categories", next).then(() => {
                        setCategoriesList(next);
                        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(next));
                        setNewCategory({ name: "", icon: "", image: "" });
                        toast.success("Category added and synced to all devices");
                      }).catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not save the category."));
                    }}
                  >
                    Add Category
                  </Button>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 md:grid-cols-4 gap-4">
                {categoriesList.map((cat) => (
                  <Card key={cat.id} className="p-4 flex items-center gap-3">
                    <div className="w-12 h-12 grid place-items-center rounded-full bg-muted text-xl">{cat.icon}</div>
                    <div className="flex-1">
                      <p className="font-medium">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">{productsList.filter((p) => p.category === cat.name).length} products</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Recent Orders</h2>
                  <p className="text-sm text-muted-foreground">Orders created from checkout are stored in localStorage.</p>
                </div>
                <Button size="sm" onClick={refreshOrders}>Refresh</Button>
              </div>

              {orders.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No orders yet. Place an order from checkout to see it here.</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2 px-3 py-2 text-xs uppercase text-muted-foreground border-b font-semibold">
                    <div>Order ID</div>
                    <div>Customer</div>
                    <div>Date</div>
                    <div className="text-right">Total</div>
                  </div>
                  {orders.map((order) => (
                    <Card key={order.id} className="p-3">
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div className="font-medium">#{order.id.slice(-6)}</div>
                        <div>{order.name}</div>
                        <div>{order.date}</div>
                        <div className="text-right font-semibold">₹{order.total}</div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge variant={order.status === "delivered" ? "default" : order.status === "received" ? "secondary" : order.status === "returned" ? "destructive" : "outline"}>
                          {order.status || "pending"}
                        </Badge>
                        {order.status === "delivered" ? (
                          <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, "returned")}>Return</Button>
                        ) : order.status === "returned" ? (
                          <Button size="sm" variant="secondary" disabled>Returned</Button>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, "received")}>Received</Button>
                            <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, "delivered")}>Delivered</Button>
                          </>
                        )}
                      </div>

                      <div className="mt-2 text-xs text-muted-foreground">
                        Items: {order.items.length} · {order.items.map((i) => `${i.productName}×${i.quantity}`).join(", ")}
                      </div>
                      {(order.phone || order.deliveryAddress) && <div className="mt-2 rounded-md bg-muted/60 p-2 text-xs">
                        <p className="font-semibold text-foreground">Delivery details</p>
                        {order.phone && <p>Phone: {order.phone}</p>}
                        {order.deliveryAddress && <p>Address: {order.deliveryAddress}</p>}
                      </div>}
                      {order.deliveryLocation ? <div className="mt-2 rounded-md border border-primary/20 bg-primary/5 p-2 text-xs">
                        <p className="font-semibold text-foreground">Shared delivery location</p>
                        <p className="text-muted-foreground">{order.deliveryLocation.latitude.toFixed(6)}, {order.deliveryLocation.longitude.toFixed(6)} (accuracy ±{Math.round(order.deliveryLocation.accuracy)} m)</p>
                        <a
                          className="mt-1 inline-flex items-center gap-1 font-medium text-primary underline"
                          href={`https://www.google.com/maps?q=${order.deliveryLocation.latitude},${order.deliveryLocation.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                        >Open location in Google Maps</a>
                      </div> : <p className="mt-2 text-xs text-muted-foreground">No GPS location shared for this order. The delivery address is shown above if provided.</p>}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold">Sales Report</h2>
                <p className="text-sm text-muted-foreground">Track total sales and number of orders by period.</p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Today</p>
                  <p className="mt-2 text-2xl font-bold">₹{orderReport.day.total}</p>
                  <p className="text-xs text-muted-foreground">{orderReport.day.count} orders</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">This week</p>
                  <p className="mt-2 text-2xl font-bold">₹{orderReport.week.total}</p>
                  <p className="text-xs text-muted-foreground">{orderReport.week.count} orders</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">This month</p>
                  <p className="mt-2 text-2xl font-bold">₹{orderReport.month.total}</p>
                  <p className="text-xs text-muted-foreground">{orderReport.month.count} orders</p>
                </Card>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Total orders</p>
                  <p className="mt-2 text-2xl font-bold">{orders.length}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Received</p>
                  <p className="mt-2 text-2xl font-bold">{receivedCount}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Delivered</p>
                  <p className="mt-2 text-2xl font-bold">{deliveredCount}</p>
                </Card>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="mt-2 text-2xl font-bold">{pendingCount}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Returned</p>
                  <p className="mt-2 text-2xl font-bold">{returnedCount}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Total sales</p>
                  <p className="mt-2 text-2xl font-bold">₹{orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0)}</p>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="members">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Member Management</h2>
                  <p className="text-sm text-muted-foreground">Add members (number + name) for VIP offers.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-auto">
                  <Input
                    placeholder="Number"
                    value={newMemberNumber}
                    onChange={(e) => setNewMemberNumber(e.target.value)}
                  />
                  <Input
                    placeholder="Name"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      const added = addMember(newMemberNumber, newMemberName);
                      if (added) {
                        toast.success(`Added member ${newMemberName}`);
                        setNewMemberNumber("");
                        setNewMemberName("");
                      } else {
                        toast.error("Enter unique number and name");
                      }
                    }}
                  >
                    Add Member
                  </Button>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                {members.length === 0 ? (
                  <Card className="p-3 text-center text-muted-foreground">No members found.</Card>
                ) : (
                  members.map((member) => (
                    <Card key={member.number} className="p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.number}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-success">VIP</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => {
                            removeMember(member.number);
                            toast.success(`Removed member ${member.name}`);
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="customers">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold">Registered Customers</h2>
                <p className="text-sm text-muted-foreground">These registrations are saved in this browser. Customers who register on another device are not shared with this admin page yet.</p>
              </div>
              {customerList.length === 0 ? (
                <Card className="p-6 text-center text-muted-foreground">No customers registered in this browser yet.</Card>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {customerList.map((customer) => (
                    <Card key={customer.phone} className="space-y-2 p-4">
                      <p className="font-semibold">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.phone}</p>
                      <p className="text-sm text-muted-foreground">
                        {[customer.address, customer.city, customer.pincode].filter(Boolean).join(", ") || "No saved address"}
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="banners">
            <Card className="space-y-5 p-6">
              {!sharedBannersReady && <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
                <p className="font-semibold">Offer banners are currently saved only in this browser.</p>
                <p>Configure the Cloudflare <strong>CATALOG</strong> KV binding, then sign in and save the banners to show them on phones and other devices.</p>
              </div>}
              <div className="flex items-start gap-3">
                <ImageIcon className="mt-1 h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-xl font-bold">Homepage Today's Offers Banners</h2>
                  <p className="text-sm text-muted-foreground">Upload up to 10 banners. Enabled banners rotate above the daily offer products on the homepage.</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="offers-banner-image">Upload banners ({offersBanners.length}/10)</Label>
                <Input id="offers-banner-image" type="file" accept="image/*" multiple disabled={offersBanners.length >= 10} onChange={(event) => { void handleOffersBannerUpload(event.target.files); event.target.value = ""; }} className="cursor-pointer file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1 file:text-primary-foreground" />
                <p className="text-xs text-muted-foreground">Select multiple image files at once. Each file can be up to 10 MB and is compressed before saving to the shared catalog.</p>
              </div>
              {offersBanners.length > 0 ? <div className="space-y-4">
                {offersBanners.map((banner, index) => <div key={banner.id} className="space-y-3 rounded-xl border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">Banner {index + 1}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Switch id={`offers-banner-enabled-${banner.id}`} checked={banner.enabled} onCheckedChange={(enabled) => updateOffersBanner(banner.id, { enabled })} />
                        <Label htmlFor={`offers-banner-enabled-${banner.id}`} className="text-sm">Show</Label>
                      </div>
                      <Button type="button" variant="ghost" size="icon" className="text-destructive" aria-label={`Remove banner ${index + 1}`} onClick={() => removeOffersBanner(banner.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2"><Label htmlFor={`offers-banner-title-${banner.id}`}>Title</Label><Input id={`offers-banner-title-${banner.id}`} value={banner.title} onChange={(event) => updateOffersBanner(banner.id, { title: event.target.value })} /></div>
                    <div className="space-y-2"><Label htmlFor={`offers-banner-subtitle-${banner.id}`}>Message</Label><Input id={`offers-banner-subtitle-${banner.id}`} value={banner.subtitle} onChange={(event) => updateOffersBanner(banner.id, { subtitle: event.target.value })} /></div>
                  </div>
                  <div className="relative overflow-hidden rounded-xl border">
                    <img src={banner.image} alt={`Today's offers banner ${index + 1} preview`} className="h-40 w-full object-cover sm:h-52" />
                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/10 to-transparent p-5 text-white">
                      <p className="text-2xl font-bold">{banner.title || "Today's Offers"}</p>
                      <p>{banner.subtitle}</p>
                    </div>
                  </div>
                </div>)}
              </div> : <p className="rounded-lg bg-muted p-6 text-center text-sm text-muted-foreground">No offer banners uploaded yet.</p>}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
                <p className="text-sm text-muted-foreground">Only enabled banners appear on the homepage across devices after saving.</p>
                <div className="flex gap-2">
                  {offersBanners.length > 0 && <Button variant="outline" onClick={clearOffersBanner}>Remove all</Button>}
                  <Button onClick={saveOffersBanner}>Save Banners</Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card className="space-y-5 p-6">
              <div>
                <h2 className="text-xl font-bold">Footer Contact Details</h2>
                <p className="text-sm text-muted-foreground">Edit the phone, email, address, or add extra contact methods. Saved details appear in the footer on every device.</p>
              </div>
              {!sharedCatalogReady && <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
                Shared Cloudflare catalog storage is not configured, so contact changes cannot sync to phones yet.
              </div>}
              <div className="space-y-3">
                {footerContacts.map((contact, index) => (
                  <div key={contact.id} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[5rem_minmax(0,1fr)_minmax(0,2fr)_auto]">
                    <div className="space-y-1"><Label htmlFor={`contact-icon-${contact.id}`}>Icon</Label><Input id={`contact-icon-${contact.id}`} maxLength={16} value={contact.icon} onChange={(event) => setFooterContacts((current) => current.map((item) => item.id === contact.id ? { ...item, icon: event.target.value } : item))} /></div>
                    <div className="space-y-1"><Label htmlFor={`contact-label-${contact.id}`}>Label</Label><Input id={`contact-label-${contact.id}`} maxLength={80} value={contact.label} placeholder="Phone, Email, Address..." onChange={(event) => setFooterContacts((current) => current.map((item) => item.id === contact.id ? { ...item, label: event.target.value } : item))} /></div>
                    <div className="space-y-1"><Label htmlFor={`contact-value-${contact.id}`}>Details</Label><Input id={`contact-value-${contact.id}`} maxLength={300} value={contact.value} placeholder="Phone number, email, address, or link" onChange={(event) => setFooterContacts((current) => current.map((item) => item.id === contact.id ? { ...item, value: event.target.value } : item))} /></div>
                    <Button type="button" variant="outline" className="self-end" aria-label={`Remove contact ${index + 1}`} onClick={() => setFooterContacts((current) => current.filter((item) => item.id !== contact.id))}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                {footerContacts.length === 0 && <p className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">No footer contact details. Add some below.</p>}
              </div>
              <div className="flex flex-wrap justify-between gap-3 border-t pt-4">
                <Button type="button" variant="outline" disabled={footerContacts.length >= 12} onClick={() => setFooterContacts((current) => [...current, { id: `contact-${Date.now()}`, label: "", value: "", icon: "•" }])}><Plus className="mr-1 h-4 w-4" /> Add contact detail</Button>
                <Button type="button" onClick={() => void saveFooterContacts()}>Save Contact Details</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
