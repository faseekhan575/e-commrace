import { Link } from "react-router-dom";
import { ArrowRight, Award, Shield, Truck, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-[#1a1a14] text-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-sm mb-6">
            Since 2025
          </div>
          <h1 className="font-display text-6xl md:text-7xl font-700 leading-none mb-6">
            Curated with<br />
            <span className="text-[#a8a898]">intention.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-[#a8a898]">
            Vault is more than a store — it's a carefully selected collection of products 
            that meet the highest standards of quality, design, and utility.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#78786a] mb-3">Our Story</p>
            <h2 className="font-display text-5xl font-700 leading-tight text-[#1a1a14] mb-8">
              Only the exceptional<br />makes the cut.
            </h2>
            <div className="prose text-[#78786a] text-[17px] leading-relaxed">
              <p>
                We believe in owning fewer things, but better things. Every product at Vault 
                is handpicked after rigorous testing for quality, durability, and design.
              </p>
              <p>
                No filler. No compromises. Just products that deliver real value and bring 
                quiet confidence to your daily life.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] bg-[#e8e8e0] rounded-3xl overflow-hidden">
              {/* You can replace with real image later */}
              <div className="w-full h-full bg-gradient-to-br from-[#1a1a14] to-[#3c3c30] flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="w-16 h-16 mx-auto mb-4 border border-white/30 rounded-2xl flex items-center justify-center">
                    <Award size={32} />
                  </div>
                  <p className="font-medium">Excellence in Every Detail</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white border-t border-b border-[#e8e8e0]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-mono uppercase tracking-widest text-center text-[#a8a898] mb-3">Our Values</p>
          <h2 className="font-display text-4xl font-700 text-center text-[#1a1a14] mb-12">What drives us</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "Quality First",
                desc: "We reject 90% of products that come our way. Only the best make it to Vault."
              },
              {
                icon: Award,
                title: "Timeless Design",
                desc: "Products that look as good in 10 years as they do today."
              },
              {
                icon: Truck,
                title: "Reliable Delivery",
                desc: "Fast, secure, and transparent shipping across Pakistan."
              },
              {
                icon: Users,
                title: "Customer Obsessed",
                desc: "Your satisfaction is non-negotiable. We stand behind every product."
              }
            ].map((value, i) => (
              <div key={i} className="bg-[#fafaf8] p-8 rounded-3xl group hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <value.icon size={28} className="text-[#1a1a14]" />
                </div>
                <h3 className="font-semibold text-xl mb-3">{value.title}</h3>
                <p className="text-[#78786a] leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#1a1a14] text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-5xl font-700 mb-6">Ready to own better?</h2>
          <p className="text-[#a8a898] text-lg mb-10">
            Join thousands who have upgraded their lifestyle with Vault.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-3 px-10 py-4 bg-white text-[#1a1a14] rounded-2xl font-semibold hover:bg-[#e8e8e0] transition-colors group"
          >
            Shop the Collection
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}