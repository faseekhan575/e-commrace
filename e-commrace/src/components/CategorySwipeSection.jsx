import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { optimizeImage } from "../utils/imageOptimizer";
import {
  ChevronLeft, ChevronRight, ArrowRight, Sparkles,
  Flame, ArrowUpRight, Play, Pause, Compass
} from "lucide-react";

export default function CategorySwipeSection({ categories = [] }) {
  const containerRef = useRef(null);
  const animFrameId = useRef(null);
  const isHoveredRef = useRef(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollStartRef = useRef(0);
  const lastXRef = useRef(0);
  const velocityRef = useRef(0);

  const [isPaused, setIsPaused] = useState(false);
  const [activeCategoryName, setActiveCategoryName] = useState("");

  // Create a 3x repeated list for seamless infinite circular wrapping
  const repeatedCategories = categories.length > 0
    ? [...categories, ...categories, ...categories]
    : [];

  // Continuous floating auto-movement loop using requestAnimationFrame
  useEffect(() => {
    let animId;
    const loop = () => {
      const el = containerRef.current;
      if (el && !isDraggingRef.current && !isHoveredRef.current && !isPaused) {
        // Single set width calculation: 1/3 of total scrollWidth
        const singleSetWidth = el.scrollWidth / 3;

        // Glide speed in px per frame (~60fps = 40px/sec)
        el.scrollLeft += 0.8;

        // When we've scrolled past the first set, seamlessly reset without visual jump
        if (el.scrollLeft >= singleSetWidth * 2) {
          el.scrollLeft -= singleSetWidth;
        } else if (el.scrollLeft <= 5) {
          el.scrollLeft += singleSetWidth;
        }
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isPaused]);

  // Initialize scroll position in the middle set for seamless bidirectional scrolling
  useEffect(() => {
    const el = containerRef.current;
    if (el && categories.length > 0) {
      const singleSetWidth = el.scrollWidth / 3;
      el.scrollLeft = singleSetWidth;
    }
  }, [categories.length]);

  // ── Drag & Touch Handlers with Inertia ──
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    startXRef.current = e.pageX;
    lastXRef.current = e.pageX;
    scrollStartRef.current = containerRef.current.scrollLeft;
    velocityRef.current = 0;
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    e.preventDefault();
    const currentX = e.pageX;
    const dx = currentX - startXRef.current;
    velocityRef.current = currentX - lastXRef.current;
    lastXRef.current = currentX;
    containerRef.current.scrollLeft = scrollStartRef.current - dx;

    // Boundary wrap check during manual drag
    const el = containerRef.current;
    const singleSetWidth = el.scrollWidth / 3;
    if (el.scrollLeft >= singleSetWidth * 2) {
      el.scrollLeft -= singleSetWidth;
      scrollStartRef.current -= singleSetWidth;
    } else if (el.scrollLeft <= singleSetWidth * 0.5) {
      el.scrollLeft += singleSetWidth;
      scrollStartRef.current += singleSetWidth;
    }
  };

  const handleMouseUpOrLeave = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
    }
  };

  // Touch device swipe handlers
  const handleTouchStart = (e) => {
    isDraggingRef.current = true;
    const touch = e.touches[0];
    startXRef.current = touch.pageX;
    lastXRef.current = touch.pageX;
    scrollStartRef.current = containerRef.current.scrollLeft;
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const touch = e.touches[0];
    const currentX = touch.pageX;
    const dx = currentX - startXRef.current;
    containerRef.current.scrollLeft = scrollStartRef.current - dx;

    const el = containerRef.current;
    const singleSetWidth = el.scrollWidth / 3;
    if (el.scrollLeft >= singleSetWidth * 2) {
      el.scrollLeft -= singleSetWidth;
      scrollStartRef.current -= singleSetWidth;
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  // Manual Nudge with arrow buttons
  const nudgeScroll = (direction) => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const offset = direction === "left" ? -340 : 340;
    el.scrollBy({ left: offset, behavior: "smooth" });
  };

  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 bg-[#fafaf8] relative overflow-hidden border-b border-[#e8e8e0] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section Header with Real-Time Floating Controls ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 bg-[#141410] text-[#d4af37] text-[10px] font-mono font-bold uppercase tracking-widest rounded-sm flex items-center gap-1.5 shadow-xs">
                <Sparkles size={11} className="text-[#d4af37]" /> Infinite Auto-Gliding Atelier
              </span>
              <span className="text-xs text-[#78786a] font-mono">
                {categories.length} Luxury Collections
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141410] tracking-tight">
              Curated Wardrobe Categories
            </h2>
            <p className="text-xs sm:text-sm text-[#78786a] mt-2 max-w-lg">
              Drag left or right, or let our endless haute couture loop glide effortlessly.
            </p>
          </div>

          {/* Controls: Play/Pause, Arrow Nudge & Complete Directory Link */}
          <div className="flex items-center gap-3">
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className={`px-3 py-2 rounded-full border text-xs font-mono flex items-center gap-2 transition-all shadow-xs ${
                !isPaused
                  ? "bg-[#141410] text-[#d4af37] border-[#141410]"
                  : "bg-white text-gray-700 border-gray-300 hover:text-black"
              }`}
              title={isPaused ? "Resume auto-gliding" : "Pause auto-gliding"}
            >
              {!isPaused ? <Pause size={13} /> : <Play size={13} />}
              <span className="text-[10px] uppercase font-bold tracking-wider">
                {!isPaused ? "Gliding Active" : "Paused"}
              </span>
            </button>

            {/* Left Chevron */}
            <button
              type="button"
              onClick={() => nudgeScroll("left")}
              className="w-10 h-10 rounded-full border border-gray-300 bg-white hover:bg-[#141410] hover:text-white flex items-center justify-center transition-all shadow-xs hover:scale-105"
              aria-label="Previous categories"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Right Chevron */}
            <button
              type="button"
              onClick={() => nudgeScroll("right")}
              className="w-10 h-10 rounded-full border border-gray-300 bg-white hover:bg-[#141410] hover:text-white flex items-center justify-center transition-all shadow-xs hover:scale-105"
              aria-label="Next categories"
            >
              <ChevronRight size={18} />
            </button>

            <Link
              to="/products"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#141410] hover:bg-[#d4af37] text-white hover:text-black font-bold text-xs uppercase tracking-wider rounded-sm transition-colors shadow-sm ml-1"
            >
              <span>All ({categories.length})</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

      </div>

      {/* ── Endless Infinite Swiping & Drag Track ── */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={() => {
          isHoveredRef.current = false;
          handleMouseUpOrLeave();
        }}
        onMouseEnter={() => {
          isHoveredRef.current = true;
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex gap-5 overflow-x-auto pb-6 pt-2 scrollbar-none cursor-grab active:cursor-grabbing px-4 sm:px-8 w-full"
        style={{ scrollBehavior: "auto" }}
      >
        {repeatedCategories.map((cat, idx) => {
          const catSlug = cat.slug || cat._id || `cat-${idx}`;
          const imgUrl = cat.image?.url || cat.image || "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=85";
          const displayIdx = (idx % categories.length) + 1;

          return (
            <div
              key={`${cat._id || catSlug}-${idx}`}
              className="w-[270px] sm:w-[300px] md:w-[330px] flex-shrink-0 group"
              onMouseEnter={() => setActiveCategoryName(cat.name)}
            >
              <Link
                to={`/products?category=${catSlug}`}
                draggable="false"
                className="block relative aspect-[3/4.4] overflow-hidden rounded-2xl bg-[#141410] border border-[#e8e8e0] group-hover:border-[#d4af37] shadow-sm hover:shadow-2xl transition-all duration-500 transform group-hover:-translate-y-1"
              >
                {/* 4K Category Photoshoot Photo */}
                <img
                  src={optimizeImage(imgUrl, { width: 640 })}
                  alt={cat.name}
                  draggable="false"
                  loading="lazy"
                  className="w-full h-full object-cover object-top group-hover:scale-108 transition-transform duration-700 ease-out pointer-events-none"
                />

                {/* Vignette Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent group-hover:from-black/95 transition-colors duration-500" />

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
                    {cat.description || "Handcrafted signature eastern silhouettes tailored with pure organic fabrics."}
                  </p>

                  <div className="pt-4 flex items-center justify-between border-t border-white/15 mt-3">
                    <span className="text-[11px] font-mono text-gray-300">
                      10 Garments in Collection
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-[#d4af37] group-hover:translate-x-1 transition-transform">
                      <span>Explore</span>
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

      {/* ── Footer Floating Helper ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Infinite Loop Active • <strong>Hover</strong> to pause • <strong>Drag / Swipe</strong> horizontally</span>
        </div>
        <div className="text-[11px] text-gray-400">
          Showing All {categories.length} Official Collections
        </div>
      </div>
    </section>
  );
}
