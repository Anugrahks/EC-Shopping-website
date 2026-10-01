import { useEffect, useState } from "react";
import { ProductCard } from "./ProductCard";
import { Link } from "react-router-dom";
import { useCatalogProducts } from "@/lib/use-catalog-products";
import { useTodayOffersBanners } from "@/lib/today-offers-banner";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { optimizeUnsplashImage } from "@/lib/image-url";

export function TodayOffers() {
  const products = useCatalogProducts();
  const banners = useTodayOffersBanners().filter((banner) => banner.enabled && banner.image);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const offers = products.filter((p) => p.isTodayOffer);
  const showBanner = banners.length > 0;
  const banner = banners[activeBannerIndex % Math.max(banners.length, 1)];

  useEffect(() => {
    setActiveBannerIndex(0);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveBannerIndex((current) => (current + 1) % banners.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  const showPreviousBanner = () => setActiveBannerIndex((current) => (current - 1 + banners.length) % banners.length);
  const showNextBanner = () => setActiveBannerIndex((current) => (current + 1) % banners.length);
  if (offers.length === 0 && !showBanner) return null;

  return (
    <section className="bg-[#f0fdf4] py-8">
      <div className="container mx-auto px-4">
        {showBanner ? (
          <div className="relative mb-6 min-h-48 overflow-hidden rounded-2xl bg-emerald-900 sm:min-h-64" role="region" aria-roledescription="carousel" aria-label="Today's offers banners">
            <img src={optimizeUnsplashImage(banner.image, 1200, 600)} alt={banner.title || "Today's grocery offers"} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
            <div className="relative flex min-h-48 max-w-2xl flex-col items-start justify-center gap-3 p-6 text-white sm:min-h-64 sm:p-10">
              <h2 className="text-3xl font-bold sm:text-4xl">{banner.title || "Today's Offers"}</h2>
              <p className="text-sm sm:text-base">{banner.subtitle}</p>
              <Link to="/products?offers=true" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50">Shop today's offers</Link>
            </div>
            {banners.length > 1 && <>
              <div className="absolute right-4 top-4 flex gap-2">
                <button type="button" aria-label="Previous offer banner" onClick={showPreviousBanner} className="grid h-10 w-10 place-items-center rounded-full bg-black/45 text-white hover:bg-black/70"><ArrowLeft className="h-5 w-5" /></button>
                <button type="button" aria-label="Next offer banner" onClick={showNextBanner} className="grid h-10 w-10 place-items-center rounded-full bg-black/45 text-white hover:bg-black/70"><ArrowRight className="h-5 w-5" /></button>
              </div>
              <div className="absolute bottom-4 right-5 flex gap-2" aria-label="Choose offer banner">
                {banners.map((item, index) => <button key={item.id} type="button" aria-label={`Show offer banner ${index + 1}`} aria-current={activeBannerIndex === index} onClick={() => setActiveBannerIndex(index)} className={`h-2.5 rounded-full transition-all ${activeBannerIndex === index ? "w-7 bg-white" : "w-2.5 bg-white/60 hover:bg-white"}`} />)}
              </div>
            </>}
          </div>
        ) : (
          <div className="mb-4 flex items-end justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">🔥 Today's Offers</h2>
              <p className="text-sm text-slate-500">Don't miss these amazing deals!</p>
            </div>
            <Link to="/products?offers=true" className="rounded-full border border-emerald-500 text-emerald-700 px-3 py-1 text-xs font-semibold hover:bg-emerald-50">View All</Link>
          </div>
        )}
        {offers.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-4 lg:grid-cols-5">
            {offers.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : <p className="rounded-xl bg-white/70 p-6 text-center text-sm text-slate-600">Today's offers are coming soon. Please check back shortly.</p>}
      </div>
    </section>
  );
}
