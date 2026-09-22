import { useRef } from "react";
import { Link } from "react-router-dom";
import { optimizeImage } from "../utils/imageOptimizer";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Flame,
  ArrowUpRight,
} from "lucide-react";

export default function CategorySwipeSection({ categories = [] }) {
  const containerRef = useRef(null);

  const scroll = (direction) => {
    if (!containerRef.current) return;
    const offset = direction === "left" ? -380 : 380;
    containerRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-14 sm:py-20 bg-[#fafaf8] relative overflow-hidden border-b border-[#e8e8e0] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-[0.25em] text-[#d4af37] uppercase mb-1.5">
              <Sparkles size={14} />
              <span>Signature Collections</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#141410] tracking-tight">
              Curated Wardrobe Categories
            </h2>
            <p className="text-xs sm:text-sm text-[#4b5563] mt-2 max-w-lg">
              Explore our handcrafted silhouettes and exclusive pret edits tailored with pure organic fabrics.
            </p>
          </div>

          {/* Clean Controls: Left/Right Chevrons & Directory Link */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full border border-gray-300 bg-white hover:bg-[#141410] hover:text-white flex items-center justify-center transition-all shadow-xs active:scale-95"
              aria-label="Previous categories"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full border border-gray-300 bg-white hover:bg-[#141410] hover:text-white flex items-center justify-center transition-all shadow-xs active:scale-95"
              aria-label="Next categories"
            >
              <ChevronRight size={18} />
            </button>

            <Link
              to="/products"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#141410] hover:bg-[#d4af37] text-white hover:text-black font-bold text-xs uppercase tracking-wider rounded-sm transition-colors shadow-sm ml-1"
            >
              <span>View All ({categories.length})</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Swipeable Category Track */}
      <div
        ref={containerRef}
        className="flex gap-5 overflow-x-auto pb-6 pt-2 scrollbar-none px-4 sm:px-8 max-w-7xl mx-auto scroll-smooth"
      >
        {categories.map((cat, idx) => {
          const catSlug = cat.slug || cat._id || `cat-${idx}`;
          const imgUrl =
            cat.image?.url ||
            cat.image ||
            "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=85";
          const displayIdx = idx + 1;

          return (
            <div
              key={cat._id || catSlug}
              className="w-[270px] sm:w-[300px] md:w-[330px] flex-shrink-0 group"
            >
              <Link
                to={`/products?category=${catSlug}`}
                draggable="false"
                className="block relative aspect-[3/4.4] overflow-hidden rounded-2xl bg-[#141410] border border-[#e8e8e0] group-hover:border-[#d4af37] shadow-sm hover:shadow-2xl transition-all duration-500 transform group-hover:-translate-y-1"
              >
                {/* Category Photoshoot Photo */}
                <img
                  src={optimizeImage(imgUrl, { width: 640 })}
                  alt={cat.name}
                  draggable="false"
                  loading="lazy"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none"
                />

                {/* Vignette Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent group-hover:from-black/95 transition-colors duration-500" />

                {/* Top Floating Chips */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                  <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/20 text-[#d4af37] font-mono text-[9px] font-bold uppercase tracking-widest rounded-full">
                    {cat.eyebrow || `COLLECTION 0${displayIdx}`}
                  </span>
                  {cat.isHot && (
                    <span className="px-2 py-0.5 bg-amber-500 text-white font-mono text-[9px] font-bold rounded-full shadow-sm flex items-center gap-1">
                      <Flame size={10} /> HOT DROP
                    </span>
                  )}
                </div>

                {/* Bottom Content & Interactive Explore CTA */}
                <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end text-white z-10">
                  <p className="text-[11px] font-mono text-[#d4af37] uppercase tracking-wider mb-1">
                    {cat.subtitle || "Eastern Pret & Luxury Lawn"}
                  </p>

                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight group-hover:text-[#d4af37] transition-colors">
                    {cat.name}
                  </h3>

                  <p className="text-xs text-gray-300 mt-1.5 line-clamp-2 font-light opacity-90 leading-relaxed">
                    {cat.description ||
                      "Handcrafted signature eastern silhouettes tailored with pure organic fabrics."}
                  </p>

                  <div className="pt-4 flex items-center justify-between border-t border-white/15 mt-3">
                    <span className="text-[11px] font-mono text-gray-300">
                      Explore Collection
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-[#d4af37] group-hover:translate-x-1 transition-transform">
                      <span>Browse</span>
                      <ArrowUpRight size={14} />
                    </div>
                  </div>
                </div>

                {/* Gold Foil Border Glow */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#d4af37]/60 pointer-events-none transition-colors duration-500" />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
