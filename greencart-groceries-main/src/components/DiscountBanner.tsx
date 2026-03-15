import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function DiscountBanner() {
  return (
    <section className="container mx-auto px-4 py-6">
      <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 text-primary-foreground">
        <div className="space-y-2 text-center md:text-left">
          <p className="text-sm font-medium opacity-90">Special Discount</p>
          <h2 className="text-3xl md:text-4xl font-bold">Get 30% Off</h2>
          <p className="opacity-80 max-w-sm">On fresh fruits & vegetables. Limited time offer for online orders only!</p>
        </div>
        <Button asChild size="lg" variant="secondary" className="rounded-full font-bold">
          <Link to="/products?category=Fruits">Shop Now</Link>
        </Button>
      </div>
    </section>
  );
}
