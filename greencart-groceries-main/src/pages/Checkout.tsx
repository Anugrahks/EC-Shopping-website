import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useMember } from "@/lib/member-context";
import { CheckCircle, MapPin } from "lucide-react";
import type { CartItem } from "@/lib/data";

const ORDERS_KEY = "gc_orders";
type SharedLocation = { latitude: number; longitude: number; accuracy: number };

const Checkout = () => {
  const { items, clearCart } = useCart();
  const { isMember, memberName, customer } = useMember();
  const navigate = useNavigate();
  const [placed, setPlaced] = useState(false);
  const [savedOnThisDevice, setSavedOnThisDevice] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", pincode: "" });
  const [sharedLocation, setSharedLocation] = useState<SharedLocation | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!customer) return;
    setForm((current) => ({
      name: current.name || customer.name,
      phone: current.phone || customer.phone,
      address: current.address || customer.address,
      city: current.city || customer.city,
      pincode: current.pincode || customer.pincode,
    }));
  }, [customer]);

  const computeItemPrice = (item: CartItem) => {
    const base = item.product.discountPrice || item.product.price;
    return isMember && item.product.isTodayOffer ? Math.round(base * 0.9) * item.quantity : base * item.quantity;
  };

  const totalVipPrice = items.reduce((sum, item) => sum + computeItemPrice(item), 0);

  const saveOrder = (orderId: string, notificationStatus: "sent" | "local-only") => {
    const existing = localStorage.getItem(ORDERS_KEY);
    const orders = existing ? JSON.parse(existing) : [];
    const newOrder = {
      id: orderId,
      name: form.name,
      phone: form.phone,
      deliveryAddress: [form.address, form.city, form.pincode].filter(Boolean).join(", "),
      total: totalVipPrice,
      date: new Date().toLocaleString(),
      createdAt: new Date().toISOString(),
      status: "pending",
      notificationStatus,
      deliveryLocation: sharedLocation,
      items: items.map((item) => {
        const base = item.product.discountPrice || item.product.price;
        const amount = isMember && item.product.isTodayOffer
          ? Math.round(base * 0.9) * item.quantity
          : base * item.quantity;
        return { productName: item.product.name, quantity: item.quantity, amount };
      }),
    };
    localStorage.setItem(ORDERS_KEY, JSON.stringify([newOrder, ...orders]));
    return newOrder;
  };

  const shareCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location sharing is not supported by this browser");
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setSharedLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
        });
        setIsGettingLocation(false);
        toast.success("Delivery location added to this order");
      },
      (error) => {
        setIsGettingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error("Location permission was denied. You can enter your address manually.");
        } else if (error.code === error.TIMEOUT) {
          toast.error("Location request timed out. Please try again.");
        } else {
          toast.error("Could not get your location. Please enter your address manually.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.city || !form.pincode) {
      toast.error("Please fill all fields");
      return;
    }
    if (!/^\+?[\d\s()-]{8,15}$/.test(form.phone.trim())) {
      toast.error("Enter a valid phone number");
      return;
    }
    if (!/^\d{6}$/.test(form.pincode.trim())) {
      toast.error("Enter a valid 6-digit Indian pincode");
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const deliveryAddress = [form.address, form.city, form.pincode].filter(Boolean).join(", ");
      const orderResponse = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.name.trim(),
          customerPhone: form.phone.trim(),
          deliveryAddress,
          total: totalVipPrice,
          items: items.map((item) => {
            const base = item.product.discountPrice || item.product.price;
            const amount = isMember && item.product.isTodayOffer
              ? Math.round(base * 0.9) * item.quantity
              : base * item.quantity;
            return { productName: item.product.name, quantity: item.quantity, amount };
          }),
          deliveryLocation: sharedLocation,
        }),
      });
      const result = await orderResponse.json();
      if (
        orderResponse.status === 503 &&
        typeof result.message === "string" &&
        result.message.includes("not configured")
      ) {
        saveOrder(`local_${Date.now()}`, "local-only");
        setSavedOnThisDevice(true);
        setPlaced(true);
        clearCart();
        toast.warning("Order saved on this device, but the shop has not been notified.");
        return;
      }
      if (!orderResponse.ok || !result.success || typeof result.orderId !== "string") {
        throw new Error(result.message || "We could not send your order to the shop. Please try again.");
      }

      try {
        saveOrder(result.orderId, "sent");
      } catch {
        toast.error("Your order was sent to the shop, but could not be saved on this device.");
      }
      setPlaced(true);
      clearCart();
      toast.success("Order placed successfully! The shop has been notified.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not place your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (placed) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center space-y-4">
          <CheckCircle className="h-20 w-20 text-primary mx-auto" />
          <h1 className="text-3xl font-bold">{savedOnThisDevice ? "Order Saved on This Device" : "Order Placed!"}</h1>
          <p className="text-muted-foreground">
            {savedOnThisDevice
              ? "Your order is saved in this browser, but the shop has not received it. Please contact the shop to confirm your order."
              : `Your order has been placed successfully. You will pay ₹${totalVipPrice || 0} on delivery.`}
          </p>
          <Button onClick={() => navigate("/")} className="rounded-full">Continue Shopping</Button>
        </div>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-3">Checkout</h1>
        {isMember && (
          <div className="mb-4 rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-800">
            You have an EC Shopping Card ({memberName}). Enjoy VIP offers at checkout!
          </div>
        )}
        <div className="grid lg:grid-cols-3 gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-bold">Delivery Details</h2>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-emerald-950">Share delivery location</p>
                    <p className="text-xs text-muted-foreground">Optional. Your browser will ask permission; coordinates are saved with this order only.</p>
                  </div>
                  <Button type="button" variant="outline" className="gap-2" disabled={isGettingLocation} onClick={shareCurrentLocation}>
                    <MapPin className="h-4 w-4" />{isGettingLocation ? "Finding location…" : sharedLocation ? "Update location" : "Use my current location"}
                  </Button>
                </div>
                {sharedLocation && <p className="mt-3 text-xs text-emerald-900">
                  Location captured (±{Math.round(sharedLocation.accuracy)} m): {sharedLocation.latitude.toFixed(6)}, {sharedLocation.longitude.toFixed(6)}{" · "}
                  <a className="font-medium underline" href={`https://www.google.com/maps?q=${sharedLocation.latitude},${sharedLocation.longitude}`} target="_blank" rel="noreferrer">View on map</a>
                </p>}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input id="pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
                </div>
              </div>
            </Card>
            <Card className="p-6 space-y-3">
              <h2 className="text-lg font-bold">Payment Method</h2>
              <div className="flex items-center gap-3 p-4 border rounded-lg bg-accent/50">
                <div className="w-4 h-4 rounded-full border-4 border-primary" />
                <div>
                  <p className="font-medium">Cash on Delivery</p>
                  <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
                </div>
              </div>
            </Card>
            <Button type="submit" size="lg" className="w-full rounded-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending order…" : `Place Order — ₹${totalVipPrice}`}
            </Button>
          </form>
          <Card className="p-6 h-fit space-y-4">
            <h3 className="text-lg font-bold">Order Summary</h3>
            <div className="space-y-3">
              {items.map(({ product, quantity }) => {
                const base = product.discountPrice || product.price;
                const itemPrice = isMember && product.isTodayOffer ? Math.round(base * 0.9) : base;
                return (
                  <div key={product.id} className="flex justify-between text-sm">
                    <span>{product.name} × {quantity}</span>
                    <span>₹{itemPrice * quantity}</span>
                  </div>
                );
              })}
            </div>
            <div className="border-t pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary">₹{totalVipPrice}</span>
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
