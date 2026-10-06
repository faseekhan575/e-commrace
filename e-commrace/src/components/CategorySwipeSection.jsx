import { useRef } from "react";
import { Link } from "react-router-dom";
import { optimizeImage } from "../utils/imageOptimizer";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

export default function CategorySwipeSection({ categories = [] }) {
  const containerRef = useRef(null);

  const scroll = (direction) => {
    if (!containerRef.current) return;
    const offset = direction === "left" ? -400 : 400;
    containerRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-20 sm:py-28 bg-[#fafaf8] relative overflow-hidden select-none border-b border-[#eae7dc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header: Editorial & Vibrant */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <span className="text-[11px] font-sans font-semibold tracking-[0.28em] text-[#9c7830] uppercase block mb-2.5">
              CURATED CAPSULES
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#0e0e0c] tracking-tight leading-[1.08] font-medium">
              Explore By Category
            </h2>
            <p className="text-sm text-[#66655c] mt-3 font-light leading-relaxed">
              Archival silhouettes tailored in artisanal combed cambric, airy festive lawn, and hand-finished raw silk.
            </p>
          </div>

          {/* Clean Editorial Navigation Controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="w-11 h-11 rounded-full border border-[#d6d3c8] bg-white hover:bg-[#0e0e0c] hover:text-white text-[#0e0e0c] flex items-center justify-center transition-all duration-300 shadow-xs active:scale-95 cursor-pointer"
              aria-label="Previous categories"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={() => scroll("right")}
              className="w-11 h-11 rounded-full border border-[#d6d3c8] bg-white hover:bg-[#0e0e0c] hover:text-white text-[#0e0e0c] flex items-center justify-center transition-all duration-300 shadow-xs active:scale-95 cursor-pointer"
              aria-label="Next categories"
            >
              <ChevronRight size={18} />
            </button>

            <Link
              to="/products"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-3 border border-[#0e0e0c] bg-transparent hover:bg-[#0e0e0c] text-[#0e0e0c] hover:text-white text-xs font-sans font-semibold tracking-[0.2em] uppercase transition-all duration-300 ml-2"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Swipeable Category Track */}
      <div
        ref={containerRef}
        className="flex gap-6 overflow-x-auto pb-4 scrollbar-none px-4 sm:px-8 max-w-7xl mx-auto scroll-smooth"
      >
        {categories.map((cat, idx) => {
          const catSlug = cat.slug || cat._id || `cat-${idx}`;
          const imgUrl =
            cat.image?.url ||
            cat.image ||
            "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=85";
          const displayIdx = String(idx + 1).padStart(2, "0");

          return (
            <div
              key={cat._id || catSlug}
              className="w-[280px] sm:w-[320px] md:w-[360px] flex-shrink-0 group"
            >
              <Link
                to={`/products?category=${catSlug}`}
                draggable="false"
                className="block relative aspect-[3/4.3] overflow-hidden bg-[#141410] shadow-sm transition-all duration-500"
              >
                {/* Category Photography with Smooth Zoom */}
                <img
                  src={optimizeImage(imgUrl, { width: 800 })}
                  alt={cat.name}
                  draggable="false"
                  loading="lazy"
                  className="w-full h-full object-cover object-top transition-transform duration-1000 ease-out group-hover:scale-108 pointer-events-none"
                />

                {/* Elegant Vignette Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10 group-hover:from-black/90 transition-colors duration-500" />

                {/* Top Numbering */}
                <div className="absolute top-5 left-5 z-10">
                  <span className="font-mono text-[11px] font-medium tracking-widest text-white/80 uppercase">
                    CHAPTER {displayIdx}
                  </span>
                </div>

                {/* Bottom Content */}
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7 flex flex-col justify-end text-white z-10">
                  <span className="text-[10px] font-sans font-medium tracking-[0.24em] text-[#d4af37] uppercase mb-1.5">
                    {cat.subtitle || "SIGNATURE ATELIER"}
                  </span>

                  <h3 className="font-serif text-2xl sm:text-3xl font-normal text-white tracking-tight leading-tight group-hover:text-[#d4af37] transition-colors duration-300">
                    {cat.name}
                  </h3>

                  <div className="pt-3 flex items-center justify-between border-t border-white/20 mt-3.5">
                    <span className="text-[11px] font-sans tracking-wider text-white/70">
                      Explore Collection
                    </span>
                    <div className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-[#c5a059] group-hover:text-[#0e0e0c] flex items-center justify-center transition-all duration-300">
                      <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}

