import { useState } from "react";
import { Link } from "react-router-dom";
import { optimizeImage } from "../utils/imageOptimizer";
import { ArrowRight, Sparkles } from "lucide-react";

function CategoryCard({ cat, idx, totalCats }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const catSlug = cat.slug || cat._id || `cat-${idx}`;
  const imgUrl =
    cat.image?.url ||
    cat.image ||
    "/banners/pakistani-festive-lawn.jpg";
  const originalIndex = (idx % totalCats) + 1;
  const displayIdx = String(originalIndex).padStart(2, "0");

  return (
    <div className="w-[260px] sm:w-[310px] md:w-[350px] flex-shrink-0 group">
      <Link
        to={`/products?category=${catSlug}`}
        className="block relative aspect-[3/4.2] overflow-hidden bg-[#161612] rounded-sm shadow-md transition-all duration-500 cursor-pointer border border-[#27261e]"
      >
        {/* ── LUXURY GOLDEN SHIMMER SKELETON LOADER (Visible while image is loading) ── */}
        {!imageLoaded && (
          <div className="absolute inset-0 z-0 bg-[#161612] shimmer-effect flex flex-col justify-between p-6">
            <div className="flex items-center justify-between">
              <div className="h-5 w-24 bg-[#2e2c24] rounded-xs animate-pulse" />
              <div className="w-6 h-6 rounded-full bg-[#2e2c24] animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="h-3 w-28 bg-[#2e2c24] rounded-xs animate-pulse" />
              <div className="h-6 w-44 bg-[#2e2c24] rounded-xs animate-pulse" />
              <div className="pt-3 border-t border-[#2e2c24] flex items-center justify-between">
                <div className="h-3 w-20 bg-[#2e2c24] rounded-xs animate-pulse" />
                <div className="w-7 h-7 rounded-full bg-[#2e2c24] animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Category Model Photography */}
        <img
          src={optimizeImage(imgUrl, { width: 800 })}
          alt={cat.name}
          draggable="false"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover object-top transition-all duration-700 ease-out group-hover:scale-108 pointer-events-none ${
            imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-102"
          }`}
        />

        {/* High Fashion Gradient Wash */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/40 to-black/15 group-hover:from-black/95 transition-colors duration-500 pointer-events-none" />

        {/* Top Badge & Chapter */}
        <div className="absolute top-5 inset-x-5 flex items-center justify-between z-10 pointer-events-none">
          <span className="font-mono text-[10px] font-semibold tracking-[0.25em] text-[#d4af37] bg-black/70 border border-[#d4af37]/30 px-2.5 py-1 backdrop-blur-xs rounded-xs uppercase">
            CHAPTER {displayIdx}
          </span>
          <span className="w-6 h-6 rounded-full bg-white/10 backdrop-blur-xs flex items-center justify-center text-white/80 group-hover:bg-[#c5a059] group-hover:text-black transition-all duration-300">
            <Sparkles size={11} />
          </span>
        </div>

        {/* Bottom Content Container */}
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7 flex flex-col justify-end text-white z-10 pointer-events-none">
          <span className="text-[10px] font-sans font-semibold tracking-[0.25em] text-[#d4af37] uppercase mb-1.5 block">
            {cat.subtitle || "PAKISTANI ATELIER"}
          </span>

          <h3 className="font-serif text-2xl sm:text-3xl font-medium text-white tracking-tight leading-snug group-hover:text-[#d4af37] transition-colors duration-300">
            {cat.name}
          </h3>

          {/* Interactive Bottom Bar */}
          <div className="pt-3.5 flex items-center justify-between border-t border-white/20 mt-3.5">
            <span className="text-[11px] font-sans font-semibold tracking-wider text-white/90 group-hover:text-white transition-colors">
              Shop Collection
            </span>
            <div className="w-8 h-8 rounded-full bg-white/15 group-hover:bg-[#c5a059] group-hover:text-[#0e0e0c] flex items-center justify-center transition-all duration-300">
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function CategorySwipeSection({ categories = [] }) {
  if (!categories || categories.length === 0) return null;

  // Duplicate items to ensure a seamless, infinite marquee loop
  const loopCategories = [...categories, ...categories, ...categories];

  return (
    <section className="py-20 sm:py-28 bg-[#fafaf8] relative overflow-hidden select-none border-b border-[#eae7dc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        {/* Section Header: High Fashion Editorial */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
              <span className="text-[10.5px] font-sans font-semibold tracking-[0.3em] text-[#9c7830] uppercase">
                INFINITE ATELIER ARCHIVE
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#0e0e0c] tracking-tight leading-[1.08] font-medium">
              Explore By Category
            </h2>
            <p className="text-sm text-[#66655c] mt-3 font-light leading-relaxed">
              Curated festive silhouettes crafted in pure 80g raw silk, delicate organza drapes, and heritage Pakistani embroidered lawn.
            </p>
          </div>

          {/* Action: View All Capsules */}
          <div className="flex items-center gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#0e0e0c] bg-transparent hover:bg-[#0e0e0c] text-[#0e0e0c] hover:text-white text-xs font-sans font-semibold tracking-[0.2em] uppercase transition-all duration-300"
            >
              <span>All Capsules</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Infinite Continuous Swipe Track: Never stops, smooth continuous flow */}
      <div className="relative w-full overflow-hidden group">
        {/* Soft edge fades for editorial aesthetic */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-r from-[#fafaf8] to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-l from-[#fafaf8] to-transparent z-20 pointer-events-none" />

        <div
          className="animate-category-stream flex gap-6 sm:gap-8 px-4 [animation-duration:36s] group-hover:[animation-play-state:paused]"
        >
          {loopCategories.map((cat, idx) => (
            <CategoryCard
              key={`${cat.slug || cat._id || "cat"}-${idx}`}
              cat={cat}
              idx={idx}
              totalCats={categories.length}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

