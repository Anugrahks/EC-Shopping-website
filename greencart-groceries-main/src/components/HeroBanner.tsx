import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Truck } from "lucide-react";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-accent to-primary/5 mx-4 mt-6">
      <div className="container mx-auto px-6 py-12 md:py-20 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 space-y-5 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight text-foreground">
            Freshness that <span className="text-primary">inspires</span>
            <br />a healthy lifestyle.
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto md:mx-0">
            Experience grocery shopping with the highest quality, premium freshness. 
            Fresh and fast delivery right to your doorstep.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/products">Shop Now</Link>
            </Button>
            <div className="flex items-center gap-2 bg-card rounded-full px-4 py-2 shadow-sm">
              <Truck className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Fast Delivery</span>
            </div>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&h=400&fit=crop"
            alt="Fresh groceries"
            className="rounded-xl shadow-lg max-w-sm w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
