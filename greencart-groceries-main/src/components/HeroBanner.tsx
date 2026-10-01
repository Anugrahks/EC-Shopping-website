import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { categories } from "@/lib/data";
import { slugify } from "@/lib/slug";
import { optimizeUnsplashImage } from "@/lib/image-url";

export function HeroBanner() {
  return (
    <section className="bg-[#f0fdf4] py-6">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-md">
          <div className="grid lg:grid-cols-2 gap-4 items-center">
            <div>
                            <div className="inline-flex flex-wrap items-center gap-2 mb-3 text-xs font-semibold">
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">EC Shopping Center</span>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">Claimed</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-slate-900 leading-tight">Fresh groceries, delivered to your door</h1>
              <div className="mt-1 text-slate-600 font-medium">3.6 • 7 Ratings • Panniyur, Kannur</div>
              <p className="mt-3 text-sm text-slate-600 max-w-xl">EC Shopping is a trusted grocery marketplace for fresh produce and daily essentials.</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild variant="default" className="rounded-full bg-emerald-600 text-white px-4 py-2 text-sm hover:bg-emerald-700"><Link to="/products">Shop Now</Link></Button>
                <Button asChild variant="outline" className="rounded-full border-emerald-700 text-emerald-700 px-4 py-2 text-sm"><Link to="/about">View More</Link></Button>
              </div>

              <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
                {categories.slice(0, 6).map((cat) => (
                  <Link key={cat.id} to={`/category/${slugify(cat.name)}`} className="rounded-full border border-emerald-200 px-2 py-1 text-xs text-emerald-700 font-medium text-center">{cat.name}</Link>
                ))}
              </div>
            </div>
            <div className="rounded-xl overflow-hidden">
              <img src={optimizeUnsplashImage("https://images.unsplash.com/photo-1466637574441-749b8f19452f", 600, 386)} alt="Fresh groceries" width="600" height="386" fetchPriority="high" className="w-full h-56 md:h-80 object-cover rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
