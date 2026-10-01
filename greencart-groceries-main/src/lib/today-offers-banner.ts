import { useEffect, useState } from "react";

export const TODAY_OFFERS_BANNER_KEY = "gc_today_offers_banner";

export type TodayOffersBanner = {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  enabled: boolean;
};

export const DEFAULT_TODAY_OFFERS_BANNER: TodayOffersBanner = {
  id: "",
  image: "",
  title: "Today's Offers",
  subtitle: "Don't miss these amazing deals!",
  enabled: false,
};

export function getTodayOffersBanners(): TodayOffersBanner[] {
  try {
    const saved = localStorage.getItem(TODAY_OFFERS_BANNER_KEY);
    if (!saved) return [];
    const parsed: unknown = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      return parsed.map((banner, index) => ({
        ...DEFAULT_TODAY_OFFERS_BANNER,
        ...(banner as Partial<TodayOffersBanner>),
        id: (banner as Partial<TodayOffersBanner>).id || `banner-${index}`,
      })).slice(0, 10);
    }
    // Migrate the single-banner setting saved by earlier versions.
    if (parsed && typeof parsed === "object" && "image" in parsed) {
      const banner = parsed as Partial<TodayOffersBanner>;
      return [{ ...DEFAULT_TODAY_OFFERS_BANNER, ...banner, id: banner.id || "banner-legacy" }];
    }
    return [];
  } catch {
    return [];
  }
}

export function useTodayOffersBanners() {
  const [banners, setBanners] = useState<TodayOffersBanner[]>(getTodayOffersBanners);

  useEffect(() => {
    let active = true;
    const refreshBanners = async () => {
      try {
        const response = await fetch("/api/today-offers-banners", { cache: "no-store" });
        if (!response.ok || response.headers.get("X-Catalog-Storage") !== "configured") return;
        const remoteBanners = await response.json() as TodayOffersBanner[];
        if (!Array.isArray(remoteBanners) || !active) return;
        setBanners(remoteBanners);
        localStorage.setItem(TODAY_OFFERS_BANNER_KEY, JSON.stringify(remoteBanners));
      } catch {
        // Keep the cached banner visible if the network is temporarily unavailable.
      }
    };
    void refreshBanners();
    const timer = window.setInterval(() => void refreshBanners(), 30_000);
    const onFocus = () => void refreshBanners();
    const syncBanner = (event: StorageEvent) => {
      if (event.key === TODAY_OFFERS_BANNER_KEY || event.key === null) {
        void refreshBanners();
      }
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", syncBanner);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", syncBanner);
    };
  }, []);

  return banners;
}