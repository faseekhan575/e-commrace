import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, fetchCategories, fetchHotProducts } from "../../store/productsSlice";
import { fetchActiveBanners } from "../../store/bannerSlice";
import { fetchActiveSpotlights } from "../../store/spotlightSlice";
import ProductCard from "../../components/ProductCard";
import { CLOTHING_PRODUCTS, CLOTHING_CATEGORIES } from "../../data/clothingData";
import { optimizeImage } from "../../utils/imageOptimizer";
import {
  ArrowRight, Sparkles, ChevronLeft, ChevronRight,
  Truck, ShieldCheck, RotateCcw, Heart, ShoppingBag,
  ExternalLink, Eye, Play, Star, Flame
} from "lucide-react";

export default function HomePage() {
  const dispatch = useDispatch();
  const { list: serverProducts, hotList, categories: serverCategories } = useSelector((s) => s.products);
  const { activeList: banners } = useSelector((s) => s.banners);
  const { activeSpotlight } = useSelector((s) => s.spotlight);

  const [heroSlide, setHeroSlide] = useState(0);
  const [selectedBannerCollection, setSelectedBannerCollection] = useState("");

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 20 }));
    dispatch(fetchHotProducts({ limit: 8, type: "both" }));
    dispatch(fetchCategories({ isFeatured: true }));
    dispatch(fetchActiveBanners(selectedBannerCollection));
    dispatch(fetchActiveSpotlights());
  }, [dispatch, selectedBannerCollection]);

  const activeBanners = banners.filter((b) => b.isActive !== false && b.active !== false);

  // Hero carousel auto-timer
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  // Live server products and categories from MongoDB backend
  const products = serverProducts || [];
  const categories = serverCategories || [];

  // Filter hot products: either explicitly marked isHot or top items
  const topSellingProducts = (hotList && hotList.length > 0)
    ? hotList
    : products.filter((p) => p.isHot).length > 0
    ? products.filter((p) => p.isHot).slice(0, 8)
    : products.slice(0, 8);

  const spotlightImg = activeSpotlight?.image?.url || activeSpotlight?.image || "";

  return (
    <div className="bg-[#fafaf8] overflow-hidden">

      {/* ── 1. Admin-Controlled Hero Banner Carousel (`/api/v10/banner`) ── */}
      <section className="relative h-[80vh] sm:h-[88vh] w-full bg-[#141410] overflow-hidden">
        {activeBanners.map((slide, idx) => {
          const imgUrl = slide.image?.url || slide.image || "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1920&q=85";
          const overlay = slide.overlayOpacity ?? 0.4;
          const align = slide.textPosition || "left";

          return (
            <div
              key={slide._id || slide.id || idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === heroSlide ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
              }`}
            >
              <img
                src={optimizeImage(imgUrl, { width: 1920 })}
                alt={slide.title}
                fetchPriority={idx === 0 ? "high" : "auto"}
                className="w-full h-full object-cover object-top sm:object-center transform scale-105 transition-transform duration-10000 ease-out"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to right, rgba(0,0,0,${Math.min(0.85, overlay + 0.35)}), rgba(0,0,0,${overlay}), transparent)`,
                }}
              />

              <div className={`absolute inset-0 max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-center z-20 ${
                align === "center" ? "items-center text-center" : align === "right" ? "items-end text-right" : "items-start text-left"
              }`}>
                <div className="max-w-xl space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
                  {slide.badge && (
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] uppercase text-[#d4af37] rounded-sm">
                      {slide.badge}
                    </span>
                  )}
                  <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.05]">
                    {slide.title}
                  </h1>
                  {slide.subtitle && (
                    <p className="text-sm sm:text-base text-gray-200 font-light max-w-md">
                      {slide.subtitle}
                    </p>
                  )}
                  <div className="pt-2">
                    <Link
                      to={slide.ctaLink || "/products"}
                      className="inline-flex items-center gap-2 px-7 py-3.5 bg-white hover:bg-[#d4af37] text-black font-bold text-xs uppercase tracking-[0.2em] rounded-sm transition-all hover:scale-105 shadow-xl"
                    >
                      <span>{slide.ctaText || "Shop Collection"}</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {activeBanners.length > 1 && (
          <>
            <button
              onClick={() => setHeroSlide((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-sm flex items-center justify-center transition-all border border-white/20"
              aria-label="Previous Slide"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={() => setHeroSlide((prev) => (prev + 1) % activeBanners.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-sm flex items-center justify-center transition-all border border-white/20"
              aria-label="Next Slide"
            >
              <ChevronRight size={22} />
            </button>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5">
              {activeBanners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroSlide(i)}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    i === heroSlide ? "w-8 bg-[#d4af37]" : "w-2 bg-white/40 hover:bg-white"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* ── 2. Visual Categories Grid (Section 1 in User Screenshots) ── */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#78786a] mb-2">
            The Atelier Collections
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141410] tracking-tight">
            Curated by Wardrobe Category
          </h2>
          <p className="text-xs sm:text-sm text-[#78786a] mt-3">
            From daily breathable cambrics to exquisite raw silk festive bridals
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.slice(0, 4).map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat.slug || cat._id}`}
              className="group block relative aspect-[3/4.2] overflow-hidden rounded-sm bg-[#f5f5f0] shadow-sm"
            >
              <img
                src={optimizeImage(cat.image?.url || "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80", { width: 600 })}
                alt={cat.name}
                loading="lazy"
                className="w-full h-full object-cover object-top group-hover:scale-108 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#d4af37] mb-1">
                  {cat.subtitle || "Pret & Unstitched"}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold leading-tight group-hover:underline">
                  {cat.name}
                </h3>
                <span className="text-[11px] uppercase tracking-wider text-white/90 mt-2 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore Designs <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 3. Top Selling / Top Rated Apparel (Section 2 in User Screenshots - Clean & No Fabric Buttons) ── */}
      <section className="py-16 sm:py-20 bg-white border-y border-[#e8e8e0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-[#f0f0ea]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame size={16} className="text-amber-600" />
                <span className="text-xs font-mono uppercase tracking-[0.25em] text-amber-700 font-bold">
                  Hot Deals & High Demand
                </span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141410] tracking-tight">
                Top Selling Apparel
              </h2>
            </div>

            <Link
              to="/products"
              className="text-xs font-bold uppercase tracking-[0.2em] text-[#141410] hover:text-[#d4af37] flex items-center gap-1 transition-colors"
            >
              <span>View All Outfits</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Portrait Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {topSellingProducts.map((product, idx) => (
              <ProductCard key={product._id || idx} product={product} index={idx} />
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#141410] hover:bg-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-sm shadow-md transition-all hover:scale-105"
            >
              <span>Explore Complete Collection</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. Dynamic Editorial Lookbook Spotlight (Section 3 in User Screenshots - `/api/v11/spotlight`) ── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#141410] text-white rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-center shadow-xl">
          
          {/* Left: Model Photo */}
          <div className="lg:col-span-6 relative aspect-[3/4] lg:aspect-auto lg:h-[600px] overflow-hidden bg-black">
            <img
              src={optimizeImage(spotlightImg, { width: 1200 })}
              alt={activeSpotlight?.title || "Model Lookbook"}
              className="w-full h-full object-cover object-top"
            />
            {/* Clickable Hotspot Badge */}
            <div
              className="absolute bg-white/95 backdrop-blur-md text-black px-3.5 py-1.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce"
              style={{
                left: `${activeSpotlight?.hotspot?.posX ?? 35}%`,
                top: `${activeSpotlight?.hotspot?.posY ?? 40}%`,
              }}
            >
              <Sparkles size={13} className="text-[#d4af37]" />
              <span>{activeSpotlight?.hotspot?.text || "✨ Shop The Model's Kurta"}</span>
            </div>
          </div>

          {/* Right: Lookbook Details & Fast Checkout */}
          <div className="lg:col-span-6 p-8 sm:p-14 space-y-6">
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#d4af37]">
              {activeSpotlight?.eyebrow || "FESTIVE EDITORIAL 2026"}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white">
              {activeSpotlight?.title || "Raw Silk Zari Kurta with Organza Dupatta"}
            </h2>
            <p className="text-xs sm:text-sm text-[#b0b0a0] leading-relaxed">
              {activeSpotlight?.description || "Crafted from pure 80-gram raw silk with intricate antique kora-dabka neckline hand embroidery, paired with a laser-cut organza dupatta with scalloped borders."}
            </p>

            <div className="flex items-baseline gap-4 py-2 border-y border-white/10">
              <span className="font-serif text-3xl font-bold text-[#d4af37]">
                {activeSpotlight?.currency || "PKR"} {Number(activeSpotlight?.price || 12500).toLocaleString()}
              </span>
              <span className="text-xs text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-500/20">
                {activeSpotlight?.dispatchBadge || "✓ Ready to Dispatch in 24h"}
              </span>
            </div>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to={activeSpotlight?.primaryCta?.link || "/products"}
                className="px-8 py-3.5 bg-[#d4af37] hover:bg-white text-black font-bold text-xs uppercase tracking-[0.2em] rounded-sm transition-all shadow-lg hover:scale-105"
              >
                {activeSpotlight?.primaryCta?.text || "Shop This Complete Outfit"}
              </Link>
              <Link
                to={activeSpotlight?.secondaryCta?.link || "/products?category=luxury-pret"}
                className="px-6 py-3.5 border border-white/30 text-white hover:border-white text-xs font-bold uppercase tracking-[0.2em] rounded-sm transition-all"
              >
                {activeSpotlight?.secondaryCta?.text || "View Full Lookbook"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Instagram Community Lookbook ── */}
      <section className="py-16 bg-[#f5f5f0] border-t border-[#e8e8e0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#78786a] mb-1">
            #ClothingDenWomen
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#141410] mb-8">
            Styled by You Across Pakistan
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=400&q=80",
            ].map((img, idx) => (
              <div key={idx} className="relative aspect-square overflow-hidden rounded-sm group">
                <img
                  src={optimizeImage(img, { width: 400 })}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Heart size={20} className="fill-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}