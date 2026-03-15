import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { products as allProducts, categories as allCategories, Product } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2, Plus, Package, LayoutDashboard, ShoppingBag, Tag, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [productsList, setProductsList] = useState<Product[]>(allProducts);

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

  const toggleOffer = (id: string) => {
    setProductsList(prev => prev.map(p => p.id === id ? { ...p, isTodayOffer: !p.isTodayOffer } : p));
    toast.success("Offer updated");
  };

  const deleteProduct = (id: string) => {
    setProductsList(prev => prev.filter(p => p.id !== id));
    toast.success("Product deleted");
  };

  const stats = [
    { label: "Products", value: productsList.length, icon: Package },
    { label: "Categories", value: allCategories.length, icon: Tag },
    { label: "Today's Offers", value: productsList.filter(p => p.isTodayOffer).length, icon: ShoppingBag },
  ];

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
            <div className="grid sm:grid-cols-3 md:grid-cols-4 gap-4">
              {allCategories.map((cat) => (
                <Card key={cat.id} className="p-4 flex items-center gap-3">
                  <img src={cat.image} alt={cat.name} className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex-1">
                    <p className="font-medium">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{productsList.filter(p => p.category === cat.name).length} products</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-3 w-3" /></Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="p-8 text-center text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No orders yet. Orders will appear here when customers place them.</p>
              <p className="text-xs mt-2">Connect Lovable Cloud to enable real order tracking.</p>
            </Card>
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
