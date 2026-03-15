import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useMember } from "@/lib/member-context";
import { products as initialProducts, categories as initialCategories, Product } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2, Plus, Package, LayoutDashboard, ShoppingBag, Tag, Image as ImageIcon, User, Trash } from "lucide-react";
import { toast } from "sonner";

const ORDERS_KEY = "gc_orders";
const CATEGORIES_KEY = "gc_categories";

type SavedOrder = {
  id: string;
  name: string;
  total: number;
  date: string;
  items: Array<{ productName: string; quantity: number; amount: number }>;
};

const Admin = () => {
  const { members, addMember, removeMember } = useMember();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [newMemberNumber, setNewMemberNumber] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newCategory, setNewCategory] = useState({ name: "", icon: "", image: "" });
  const [productsList, setProductsList] = useState<Product[]>(initialProducts);
  const [categoriesList, setCategoriesList] = useState(initialCategories);
  const [orders, setOrders] = useState<SavedOrder[]>([]);

  useEffect(() => {
    const storedOrders = localStorage.getItem(ORDERS_KEY);
    if (storedOrders) {
      try {
        setOrders(JSON.parse(storedOrders));
      } catch {
        setOrders([]);
      }
    }
    const storedCategories = localStorage.getItem(CATEGORIES_KEY);
    if (storedCategories) {
      try {
        setCategoriesList(JSON.parse(storedCategories));
      } catch {
        setCategoriesList(initialCategories);
      }
    }
  }, []);

  const refreshOrders = () => {
    const stored = localStorage.getItem(ORDERS_KEY);
    if (stored) {
      try {
        setOrders(JSON.parse(stored));
      } catch {
        setOrders([]);
      }
    } else {
      setOrders([]);
    }
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
    setProductsList((prev) => prev.map((p) => (p.id === id ? { ...p, isTodayOffer: !p.isTodayOffer } : p)));
    toast.success("Offer updated");
  };

  const deleteProduct = (id: string) => {
    setProductsList((prev) => prev.filter((p) => p.id !== id));
    toast.success("Product deleted");
  };

  const stats = [
    { label: "Products", value: productsList.length, icon: Package },
    { label: "Categories", value: categoriesList.length, icon: Tag },
    { label: "Today's Offers", value: productsList.filter((p) => p.isTodayOffer).length, icon: ShoppingBag },
    { label: "Members", value: members.length, icon: User },
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Card className="p-8 w-full max-w-sm space-y-4">
            <h2 className="text-2xl font-bold text-center">Admin Login</h2>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter admin password" />
            </div>
            <Button className="w-full" onClick={() => {
              if (password === "admin123") {
                setIsLoggedIn(true);
                toast.success("Welcome, Admin!");
              } else {
                toast.error("Invalid password");
              }
            }}>Login</Button>
            <p className="text-xs text-muted-foreground text-center">Demo password: admin123</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
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

        <Tabs defaultValue="products">
          <TabsList className="mb-6">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="banners">Banners</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Manage Products</h2>
                <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Add Product</Button>
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
                        </td>
                        <td className="p-3 hidden md:table-cell">{p.stock}</td>
                        <td className="p-3">
                          <Switch checked={p.isTodayOffer || false} onCheckedChange={() => toggleOffer(p.id)} />
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-3 w-3" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteProduct(p.id)}><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-2 md:items-end justify-between">
                <div>
                  <h2 className="text-xl font-bold">Manage Categories</h2>
                  <p className="text-sm text-muted-foreground">Add new categories and they appear on the home page.</p>
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
                      setCategoriesList((prev) => {
                        const next = [...prev, cat];
                        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(next));
                        return next;
                      });
                      setNewCategory({ name: "", icon: "", image: "" });
                      toast.success("Category added");
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
                      <div className="mt-2 text-xs text-muted-foreground">
                        Items: {order.items.length} · {order.items.map((i) => `${i.productName}×${i.quantity}`).join(", ")}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
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

          <TabsContent value="banners">
            <Card className="p-8 text-center text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Banner management will be available with Lovable Cloud.</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
