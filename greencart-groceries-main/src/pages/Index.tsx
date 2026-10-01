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
