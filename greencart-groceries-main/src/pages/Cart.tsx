import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart } from "@/lib/cart-context";
import { useMember } from "@/lib/member-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { optimizeUnsplashImage } from "@/lib/image-url";
import { getCartItemPrice, getCartLineId, MINIMUM_ORDER_TOTAL } from "@/lib/product-variants";

const Cart = () => {
  const { items, updateQuantity, removeFromCart } = useCart();
  const { isMember } = useMember();
  const vipTotal = items.reduce((sum, item) => sum + getCartItemPrice(item, isMember) * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main id="main-content" className="container mx-auto px-4 py-20 text-center space-y-4">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <p className="text-muted-foreground">Add some fresh products to get started!</p>
          <Button asChild><Link to="/products">Shop Now</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content" className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const { product, quantity, variant } = item;
              const lineId = getCartLineId(item);
              const unit = variant?.unit ?? product.unit;
              const unitPrice = getCartItemPrice(item, isMember);
              return <Card key={lineId} className="p-4 flex gap-4">
                <img src={optimizeUnsplashImage(product.image, 160, 160)} alt={product.name} width="160" height="160" className="w-20 h-20 object-cover rounded-lg" />
                <div className="flex-1 space-y-1">
                  <h2 className="font-semibold">{product.name}</h2>
                  <p className="text-sm text-muted-foreground">{unit}</p>
                  <p className="font-bold text-primary">₹{unitPrice}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button onClick={() => removeFromCart(lineId)} className="text-muted-foreground hover:text-destructive" aria-label={`Remove ${product.name} ${unit} from cart`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" aria-label={`Decrease ${product.name} ${unit} quantity`} onClick={() => updateQuantity(lineId, quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8" aria-label={`Increase ${product.name} ${unit} quantity`} onClick={() => updateQuantity(lineId, quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>;
            })}
          </div>
          <Card className="p-6 h-fit space-y-4">
            <h2 className="text-lg font-bold">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{vipTotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="text-primary font-medium">Free</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="text-muted-foreground">VIP Discount</span>
                <span className="text-green-600">{isMember ? "Applied" : "Not applied"}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">₹{vipTotal}</span>
              </div>
            </div>
            {vipTotal < MINIMUM_ORDER_TOTAL && <p className="text-sm font-medium text-amber-800" role="status">Add ₹{(MINIMUM_ORDER_TOTAL - vipTotal).toFixed(2)} more to place an online order. Minimum order: ₹{MINIMUM_ORDER_TOTAL}.</p>}
            {vipTotal >= MINIMUM_ORDER_TOTAL ? (
              <Button asChild className="w-full rounded-full" size="lg"><Link to="/checkout">Proceed to Checkout</Link></Button>
            ) : (
              <Button className="w-full rounded-full" size="lg" disabled>Minimum order ₹{MINIMUM_ORDER_TOTAL}</Button>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
