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

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="EC SHOPPING - Fresh Grocery Delivery | Online Supermarket India" description="Shop fresh fruits, vegetables, and daily essentials at EC SHOPPING. Enjoy great prices and convenient grocery delivery to your doorstep." />
      <Navbar />
      <HeroBanner />
      <TodayOffers />
      <FeaturedCategories />
      <PopularProducts />
      <DiscountBanner />
      <AllProducts />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;
