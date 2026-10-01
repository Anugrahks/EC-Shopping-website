import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { HeroBanner } from "@/components/HeroBanner";
import { TodayOffers } from "@/components/TodayOffers";
import { FeaturedCategories } from "@/components/FeaturedCategories";
import { PopularProducts } from "@/components/PopularProducts";
import { DiscountBanner } from "@/components/DiscountBanner";
import { AllProducts } from "@/components/AllProducts";
import { Testimonials } from "@/components/Testimonials";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { useMember } from "@/lib/member-context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const GUEST_PROMPT_DISMISSED_KEY = "gc_guest_prompt_dismissed";

const Index = () => {
  const navigate = useNavigate();
  const { customer, isMember } = useMember();
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  useEffect(() => {
    if (
      customer ||
      isMember ||
      localStorage.getItem("gc_customer_session") ||
      localStorage.getItem("gc_member_session") ||
      sessionStorage.getItem(GUEST_PROMPT_DISMISSED_KEY) === "true"
    ) return;
    setLoginPromptOpen(true);
  }, [customer, isMember]);

  const continueAsGuest = () => {
    sessionStorage.setItem(GUEST_PROMPT_DISMISSED_KEY, "true");
    setLoginPromptOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Dialog open={loginPromptOpen} onOpenChange={(open) => { if (!open) continueAsGuest(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Welcome to EC SHOPPING</DialogTitle>
            <DialogDescription>Sign in or register to save your delivery details and place an order. You can also continue browsing as a guest.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:flex-row-reverse sm:justify-start">
            <Button onClick={() => { setLoginPromptOpen(false); navigate("/login"); }}>Login / Register</Button>
            <Button type="button" variant="outline" onClick={continueAsGuest}>Continue as Guest</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <SEOHead title="EC SHOPPING - Fresh Grocery Delivery India" description="Shop fresh fruits, vegetables, meat, fish, snacks and daily essentials from EC SHOPPING in Panniyur, Kannur. Convenient doorstep delivery with cash on delivery." />
      <Navbar />
      <main id="main-content">
        <HeroBanner />
        <TodayOffers />
        <FeaturedCategories />
        <PopularProducts />
        <DiscountBanner />
        <AllProducts />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
