import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const About = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="container mx-auto px-4 py-16 max-w-3xl space-y-6">
      <h1 className="text-4xl font-bold text-center">About Green Shop</h1>
      <p className="text-muted-foreground text-center text-lg">
        Your trusted online grocery store delivering fresh products to your doorstep across India.
      </p>
      <div className="grid sm:grid-cols-3 gap-6 py-8">
        {[
          { icon: "🥬", title: "Fresh Products", desc: "Sourced directly from farms" },
          { icon: "🚚", title: "Fast Delivery", desc: "Same day delivery available" },
          { icon: "💰", title: "Best Prices", desc: "Affordable prices with great deals" },
        ].map((item) => (
          <div key={item.title} className="text-center space-y-2 p-6 rounded-xl bg-card border">
            <span className="text-4xl">{item.icon}</span>
            <h3 className="font-bold">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
    <Footer />
  </div>
);

export default About;
