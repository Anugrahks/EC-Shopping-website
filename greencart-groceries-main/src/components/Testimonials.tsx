import { testimonials } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

export function Testimonials() {
  return (
    <section className="container mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold text-foreground mb-6">Client Testimonials</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <Card key={t.id} className="p-6 space-y-4 bg-card">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < t.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground italic">"{t.text}"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {t.avatar}
              </div>
              <span className="font-medium text-sm">{t.name}</span>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
