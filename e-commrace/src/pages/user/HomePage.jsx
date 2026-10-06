import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, fetchCategories, fetchHotProducts } from "../../store/productsSlice";
import { fetchActiveBanners } from "../../store/bannerSlice";
import { fetchActiveSpotlights } from "../../store/spotlightSlice";
import ProductCard from "../../components/ProductCard";
import CategorySwipeSection from "../../components/CategorySwipeSection";
import LuxuryMarqueeRibbon from "../../components/LuxuryMarqueeRibbon";
import { CLOTHING_PRODUCTS, CLOTHING_CATEGORIES } from "../../data/clothingData";
import { DEFAULT_BANNERS } from "../../data/bannerData";
import { optimizeImage } from "../../utils/imageOptimizer";
import {
  ArrowRight, Sparkles, ChevronLeft, ChevronRight,
  Truck, ShieldCheck, RotateCcw, Heart,
  ExternalLink, Lock, Check, Compass, Layers, Scissors
} from "lucide-react";
import toast from "react-hot-toast";

export default function HomePage() {
  const dispatch = useDispatch();
  const { list: serverProducts, hotList, categories: serverCategories } = useSelector((s) => s.products);
  const { activeList: banners } = useSelector((s) => s.banners);
  const { activeSpotlight } = useSelector((s) => s.spotlight);

  const [heroSlide, setHeroSlide] = useState(0);
  const [selectedBannerCollection] = useState("");
  const [activeCategoryTab, setActiveCategoryTab] = useState("all");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [hotspotActive, setHotspotActive] = useState(true);

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 24 }));
    dispatch(fetchHotProducts({ limit: 8, type: "both" }));
    dispatch(fetchCategories({ isFeatured: true }));
    dispatch(fetchActiveBanners(selectedBannerCollection));
    dispatch(fetchActiveSpotlights());
  }, [dispatch, selectedBannerCollection]);

  // Robust banners: use backend banners or fallback to high-res editorial defaults
  const rawBanners = banners && banners.length > 0 ? banners : DEFAULT_BANNERS;
  const activeBanners = rawBanners.filter((b) => b.isActive !== false && b.active !== false);

  // Hero carousel auto-timer (6.5s per slide)
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % activeBanners.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  // Products and categories with safe fallback
  const products = (serverProducts && serverProducts.length > 0) ? serverProducts : CLOTHING_PRODUCTS;
  const categories = (serverCategories && serverCategories.length > 0) ? serverCategories : CLOTHING_CATEGORIES;

  // Top selling products
  const topSellingProducts = useMemo(() => {
    if (hotList && hotList.length > 0) return hotList;
    const hotFiltered = products.filter((p) => p.isHot);
    if (hotFiltered.length > 0) return hotFiltered.slice(0, 8);
    return products.slice(0, 8);
  }, [hotList, products]);

  // Interactive tab filtering for the Signature Showcase
  const filteredShowcaseProducts = useMemo(() => {
    if (activeCategoryTab === "all") return products.slice(0, 8);
    return products.filter((p) => {
      const catName = (p.category?.name || p.fabric || "").toLowerCase();
      const catSlug = (p.category?.slug || "").toLowerCase();
      if (activeCategoryTab === "pret") {
        return catName.includes("ready") || catName.includes("pret") || catSlug.includes("ready");
      }
      if (activeCategoryTab === "lawn") {
        return catName.includes("lawn") || catName.includes("unstitched") || catSlug.includes("lawn");
      }
      if (activeCategoryTab === "silk") {
        return catName.includes("silk") || catName.includes("luxury") || catName.includes("formal");
      }
      return true;
    }).slice(0, 8);
  }, [products, activeCategoryTab]);

  // Spotlight outfit details with safe fallback
  const spotlight = activeSpotlight || {
    eyebrow: "FESTIVE EDITORIAL 2026",
    title: "Raw Silk Zari Kurta with Organza Dupatta",
    description: "Crafted from pure 80-gram raw silk with intricate antique kora-dabka neckline hand embroidery, paired with a laser-cut organza dupatta with scalloped borders.",
    price: 12500,
    currency: "PKR",
    dispatchBadge: "✓ Ready to Dispatch in 24h",
    hotspot: { text: "Shop The Model's Kurta", posX: 36, posY: 38 },
    image: { url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85" },
    primaryCta: { text: "SHOP THIS COMPLETE OUTFIT", link: "/products" },
    secondaryCta: { text: "VIEW FULL LOOKBOOK", link: "/products?category=luxury-pret" },
  };

  const spotlightImg = spotlight?.image?.url || spotlight?.image || "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85";

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setNewsletterSubscribed(true);
    toast.success("Welcome to the Atelier Circle. Check your email for your 10% privilege.", {
      icon: "✨",
      style: { background: "#0e0e0c", color: "#fff", fontSize: "12px" },
    });
  };

  return (
    <div className="bg-[#fafaf8] text-[#0e0e0c] overflow-hidden selection:bg-[#0e0e0c] selection:text-white">

      {/* ─────────────────────────────────────────────────────────────
          1. HIGH-IMPACT EDITORIAL HERO SECTION
          Cinematic photography, powerful typography, clean CTAs, no clutter
          ───────────────────────────────────────────────────────────── */}
      <section className="relative h-[86vh] sm:h-[90vh] min-h-[600px] max-h-[960px] w-full bg-[#0d0d0b] overflow-hidden select-none">
        {activeBanners.map((slide, idx) => {
          const imgUrl = slide.image?.url || slide.image || "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1920&q=85";
          const isCurrent = idx === heroSlide;

          return (
            <div
              key={slide._id || slide.id || idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isCurrent ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
              }`}
            >
              {/* Background Model Image with Cinematic Ken Burns Ease */}
              <img
                src={optimizeImage(imgUrl, { width: 1920 })}
                alt={slide.title || "Clothing Den Campaign"}
                fetchPriority={idx === 0 ? "high" : "auto"}
                className={`w-full h-full object-cover object-top sm:object-center transition-transform duration-10000 ease-out ${
                  isCurrent ? "scale-105" : "scale-100"
                }`}
              />

              {/* Dual Editorial Vignette: Soft Warm Wash Keeping Model Vibrant & Text Legible */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(13,13,11,0.25) 0%, rgba(13,13,11,0.3) 40%, rgba(13,13,11,0.85) 100%), linear-gradient(90deg, rgba(13,13,11,0.75) 0%, rgba(13,13,11,0.35) 45%, transparent 100%)",
                }}
              />

              {/* Hero Editorial Content Container */}
              <div className="absolute inset-0 max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-end pb-16 sm:pb-24 z-20">
                <div className="max-w-2xl space-y-4 sm:space-y-5">
                  
                  {/* Subtle Whispering Badge */}
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-[1px] bg-[#c5a059]" />
                    <span className="text-[10px] sm:text-[11px] font-sans font-semibold tracking-[0.3em] uppercase text-[#d4af37]">
                      {slide.badge || slide.tagline || "ATELIER SPRING / SUMMER '26"}
                    </span>
                  </div>

                  {/* Majestic Display Headline */}
                  <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white font-normal tracking-tight leading-[1.0] text-balance">
                    {slide.title}
                  </h1>

                  {/* Poignant Supporting Line (1-2 sentences max) */}
                  <p className="text-xs sm:text-sm md:text-base text-[#e5e3dc] font-light max-w-lg leading-relaxed font-sans opacity-90">
                    {slide.subtitle || "A symphony of intricate schiffli embroidery, pure cambric weaves, and delicate organza dupattas designed for effortless grace."}
                  </p>

                  {/* Dual Luxury Action Buttons */}
                  <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-3.5">
                    <Link
                      to={slide.ctaLink || "/products"}
                      className="px-8 py-3.5 sm:py-4 bg-white hover:bg-[#c5a059] text-[#0e0e0c] hover:text-white font-sans font-bold text-[11px] sm:text-xs uppercase tracking-[0.22em] transition-all duration-300 shadow-xl flex items-center gap-2 group"
                    >
                      <span>{slide.ctaText || "Shop Collection"}</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                      to="/products?category=luxury-pret"
                      className="px-7 py-3.5 sm:py-4 border border-white/40 hover:border-white text-white font-sans font-semibold text-[11px] sm:text-xs uppercase tracking-[0.22em] transition-all duration-300 hover:bg-white/10 backdrop-blur-xs"
                    >
                      <span>View Lookbook</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Minimalist Slide Navigation & Indicators */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-8 right-6 sm:right-12 z-30 flex items-center gap-6">
            
            {/* Editorial Slide Counter */}
            <div className="font-mono text-xs text-white/80 tracking-widest hidden sm:block">
              <span className="text-white font-bold">0{heroSlide + 1}</span>
              <span className="mx-1.5 opacity-40">/</span>
              <span className="opacity-60">0{activeBanners.length}</span>
            </div>

            {/* Slide Progress Tracks */}
            <div className="flex items-center gap-2">
              {activeBanners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroSlide(i)}
                  className={`h-0.5 transition-all duration-500 cursor-pointer ${
                    i === heroSlide ? "w-8 bg-[#c5a059]" : "w-3 bg-white/30 hover:bg-white/60"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Prev / Next Minimal Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setHeroSlide((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)}
                className="w-9 h-9 rounded-full border border-white/20 bg-black/30 hover:bg-white hover:text-black text-white backdrop-blur-md flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95"
                aria-label="Previous Slide"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setHeroSlide((prev) => (prev + 1) % activeBanners.length)}
                className="w-9 h-9 rounded-full border border-white/20 bg-black/30 hover:bg-white hover:text-black text-white backdrop-blur-md flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95"
                aria-label="Next Slide"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. UNDERSTATED LUXURY MARQUEE RIBBON
          Gold starbursts, refined rhythm, zero carnival colors
          ───────────────────────────────────────────────────────────── */}
      <LuxuryMarqueeRibbon />

      {/* ─────────────────────────────────────────────────────────────
          3. CURATED CAPSULE EDITS (SHOP BY CATEGORY)
          Editorial portrait tiles, generous breathing room, clean hover
          ───────────────────────────────────────────────────────────── */}
      <CategorySwipeSection categories={categories} />

      {/* ─────────────────────────────────────────────────────────────
          4. SIGNATURE CREATIONS & NEW DROPS (INTERACTIVE PRODUCT SHOWCASE)
          Editorial headline, capsule filter tabs, clean fashion cards
          ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-white border-b border-[#eae7dc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-[11px] font-sans font-semibold tracking-[0.28em] text-[#9c7830] uppercase block mb-2.5">
                ICONIC SILHOUETTES
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-[#0e0e0c] tracking-tight leading-[1.08] font-medium">
                New Arrivals & Signatures
              </h2>
            </div>

            {/* Interactive Capsule Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {[
                { id: "all", label: "All Outfits" },
                { id: "pret", label: "Ready to Wear" },
                { id: "lawn", label: "Festive Lawn" },
                { id: "silk", label: "Luxury Silks" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategoryTab(tab.id)}
                  className={`px-4 py-2 text-[11px] font-sans font-semibold tracking-[0.18em] uppercase transition-all duration-200 cursor-pointer ${
                    activeCategoryTab === tab.id
                      ? "bg-[#0e0e0c] text-white shadow-xs"
                      : "bg-[#f5f4ef] text-[#55534b] hover:bg-[#eae8df] hover:text-[#0e0e0c]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clean 4-Column Fashion Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {filteredShowcaseProducts.map((product, idx) => (
              <ProductCard key={product._id || idx} product={product} index={idx} />
            ))}
          </div>

          {/* Clean Editorial Footer Link */}
          <div className="text-center mt-14 sm:mt-18">
            <Link
              to="/products"
              className="inline-flex items-center gap-2.5 px-9 py-4 bg-[#0e0e0c] hover:bg-[#c5a059] text-white font-sans font-bold text-xs uppercase tracking-[0.22em] transition-all duration-300 shadow-md group"
            >
              <span>Explore Complete Collection</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. THE ATELIER LOOKBOOK SPOTLIGHT (`/api/v11/spotlight`)
          High-fashion split composition, pulsing interactive hotspot,
          poetic craftsmanship storytelling & instant checkout trigger
          ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-[#fafaf8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0e0e0c] text-white overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch shadow-2xl border border-[#22221c]">
            
            {/* Left: Dramatic Portrait Photography with Hotspot Pin */}
            <div className="lg:col-span-6 relative aspect-[3/4] lg:aspect-auto min-h-[460px] lg:min-h-[640px] overflow-hidden bg-black group">
              <img
                src={optimizeImage(spotlightImg, { width: 1400 })}
                alt={spotlight?.title || "Atelier Lookbook"}
                className="w-full h-full object-cover object-top transition-transform duration-1000 ease-out group-hover:scale-105"
              />

              {/* Gentle Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

              {/* Refined Interactive Hotspot Ring */}
              <div
                className="absolute z-20 cursor-pointer"
                style={{
                  left: `${spotlight?.hotspot?.posX ?? 36}%`,
                  top: `${spotlight?.hotspot?.posY ?? 38}%`,
                }}
                onClick={() => setHotspotActive((prev) => !prev)}
              >
                {/* Pulsing concentric ring */}
                <span className="absolute -inset-2 rounded-full bg-[#c5a059]/40 animate-ping" />
                <button
                  type="button"
                  className="relative w-8 h-8 rounded-full bg-white/95 text-[#0e0e0c] flex items-center justify-center shadow-2xl border border-white/60 hover:scale-110 transition-transform"
                  aria-label="View Garment Details"
                >
                  <Sparkles size={14} className="text-[#c5a059]" />
                </button>

                {/* Hotspot Floating Tooltip */}
                {hotspotActive && (
                  <div className="absolute left-10 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md text-[#0e0e0c] px-4 py-2.5 shadow-2xl whitespace-nowrap border border-[#eae7dc] animate-in fade-in duration-300">
                    <p className="text-[10px] font-sans font-semibold tracking-widest uppercase text-[#9c7830]">
                      FEATURED ATELIER PIECE
                    </p>
                    <p className="text-xs font-serif font-bold text-[#0e0e0c]">
                      {spotlight?.hotspot?.text || "Raw Silk Zari Kurta"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Editorial Craftsmanship Narrative */}
            <div className="lg:col-span-6 p-8 sm:p-14 lg:p-16 flex flex-col justify-center space-y-7">
              <div className="space-y-3">
                <span className="text-[11px] font-sans font-semibold tracking-[0.3em] uppercase text-[#c5a059] block">
                  {spotlight?.eyebrow || "FESTIVE EDITORIAL 2026"}
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-[1.08] text-white">
                  {spotlight?.title || "Raw Silk Zari Kurta with Organza Dupatta"}
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-[#b8b5ab] font-light leading-relaxed">
                {spotlight?.description || "Crafted from pure 80-gram raw silk with intricate antique kora-dabka neckline hand embroidery, paired with a laser-cut organza dupatta with scalloped borders."}
              </p>

              {/* Artisanal Heritage Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/10">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono tracking-widest text-[#c5a059] uppercase block">FABRIC</span>
                  <p className="text-xs text-white font-medium">80g Pure Raw Silk</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono tracking-widest text-[#c5a059] uppercase block">TECHNIQUE</span>
                  <p className="text-xs text-white font-medium">Hand Kora-Dabka Zari</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono tracking-widest text-[#c5a059] uppercase block">DUPATTA</span>
                  <p className="text-xs text-white font-medium">Laser Scalloped Organza</p>
                </div>
              </div>

              {/* Price & Dispatch Assurance */}
              <div className="flex flex-wrap items-baseline gap-4 py-3 border-y border-white/10">
                <span className="font-serif text-3xl sm:text-4xl font-normal text-white">
                  {spotlight?.currency || "PKR"} {Number(spotlight?.price || 12500).toLocaleString()}
                </span>
                <span className="text-[11px] font-sans text-emerald-300 font-medium tracking-wider uppercase bg-emerald-950/60 px-3 py-1 border border-emerald-500/20">
                  {spotlight?.dispatchBadge || "✓ Express Dispatch in 24 Hours"}
                </span>
              </div>

              {/* Direct CTAs */}
              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  to={spotlight?.primaryCta?.link || "/products"}
                  className="px-8 py-4 bg-[#c5a059] hover:bg-white text-[#0e0e0c] font-sans font-bold text-xs uppercase tracking-[0.22em] transition-all duration-300 shadow-xl"
                >
                  {spotlight?.primaryCta?.text || "Shop This Complete Outfit"}
                </Link>
                <Link
                  to={spotlight?.secondaryCta?.link || "/products?category=luxury-pret"}
                  className="px-7 py-4 border border-white/30 hover:border-white text-white font-sans font-semibold text-xs uppercase tracking-[0.22em] transition-all duration-300 hover:bg-white/10"
                >
                  {spotlight?.secondaryCta?.text || "View Full Lookbook"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. THE FABRIC & CRAFTSMANSHIP HERITAGE (BRAND STORY / IDENTITY)
          3 minimalist editorial pillars establishing luxury prestige
          ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-[#f5f4ef] border-b border-[#eae7dc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="text-[11px] font-sans font-semibold tracking-[0.3em] uppercase text-[#9c7830] block mb-2.5">
              THE ATELIER STANDARD
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#0e0e0c] font-medium tracking-tight">
              Honoring Pakistan&apos;s Textile Heritage
            </h2>
            <p className="text-sm text-[#66655c] mt-3 font-light leading-relaxed">
              Every Clothing Den creation is an ode to meticulous craftsmanship, rooted in the historic weaving and embroidery traditions of Lahore and Karachi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Pillar 1 */}
            <div className="space-y-4 p-8 bg-white border border-[#eae7dc] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="w-10 h-10 rounded-full bg-[#f5f4ef] flex items-center justify-center text-[#9c7830]">
                <Layers size={20} />
              </div>
              <span className="font-mono text-xs font-bold tracking-widest text-[#9c7830] uppercase block">
                01. MASTER WEAVES
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#0e0e0c]">
                Pure Egyptian Cambric & Silk
              </h3>
              <p className="text-xs sm:text-sm text-[#66655c] font-light leading-relaxed">
                We select exclusively 80-gram pure raw silk, combed Egyptian lawn, and breathable Swiss voile that breathe naturally in tropical warmth.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="space-y-4 p-8 bg-white border border-[#eae7dc] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="w-10 h-10 rounded-full bg-[#f5f4ef] flex items-center justify-center text-[#9c7830]">
                <Scissors size={20} />
              </div>
              <span className="font-mono text-xs font-bold tracking-widest text-[#9c7830] uppercase block">
                02. BESPOKE TAILORING
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#0e0e0c]">
                Architectural Modern Drape
              </h3>
              <p className="text-xs sm:text-sm text-[#66655c] font-light leading-relaxed">
                Patterns cut with couture precision. Finished with delicate French seams, bound necklines, and hand-tacked hemlines for enduring grace.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="space-y-4 p-8 bg-white border border-[#eae7dc] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="w-10 h-10 rounded-full bg-[#f5f4ef] flex items-center justify-center text-[#9c7830]">
                <Sparkles size={20} />
              </div>
              <span className="font-mono text-xs font-bold tracking-widest text-[#9c7830] uppercase block">
                03. ARTISANAL DETAIL
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#0e0e0c]">
                Generational Hand Zari
              </h3>
              <p className="text-xs sm:text-sm text-[#66655c] font-light leading-relaxed">
                Authentic kora-dabka, antique tilla, and delicate threadwork rendered by third-generation master craftsmen in our private atelier.
              </p>
            </div>

          </div>

          <div className="text-center mt-12">
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-xs font-sans font-bold tracking-[0.2em] uppercase text-[#0e0e0c] hover:text-[#c5a059] border-b border-[#0e0e0c] hover:border-[#c5a059] pb-1 transition-colors"
            >
              <span>Discover Our Heritage Atelier</span>
              <ArrowRight size={13} />
            </Link>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. LIMITED FESTIVE EDITIONS (BEST SELLERS)
          Clean 4-column presentation of top-rated outfits
          ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-white border-b border-[#eae7dc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-[11px] font-sans font-semibold tracking-[0.28em] text-[#9c7830] uppercase block mb-2.5">
                CURATED DEMAND
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-[#0e0e0c] tracking-tight leading-[1.08] font-medium">
                The Most-Coveted Pieces
              </h2>
            </div>

            <Link
              to="/products"
              className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#0e0e0c] hover:text-[#c5a059] flex items-center gap-1.5 transition-colors"
            >
              <span>Explore All ({products.length})</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {topSellingProducts.slice(0, 4).map((product, idx) => (
              <ProductCard key={product._id || `top-${idx}`} product={product} index={idx} />
            ))}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. SEEN IN CLOTHING DEN (EDITORIAL COMMUNITY LOOKBOOK)
          Minimalist, high-fashion styling showcase
          ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-[#fafaf8] border-b border-[#eae7dc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-[11px] font-sans font-semibold tracking-[0.28em] text-[#9c7830] uppercase block mb-2.5">
                #CLOTHINGDENWOMEN
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-[#0e0e0c] tracking-tight leading-[1.08] font-medium">
                Styled Across the World
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#66655c] max-w-sm font-light">
              Tag @clothingden on Instagram for an editorial feature in our seasonal lookbook.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[
              {
                img: products[0]?.images?.[0]?.url || "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=85",
                city: "Lahore",
                tag: "Raw Silk Kurta",
              },
              {
                img: products[1]?.images?.[0]?.url || "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=600&q=85",
                city: "Karachi",
                tag: "Festive Lawn '26",
              },
              {
                img: products[2]?.images?.[0]?.url || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=85",
                city: "Islamabad",
                tag: "Zari Formal Set",
              },
              {
                img: products[3]?.images?.[0]?.url || "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=85",
                city: "Dubai",
                tag: "Jacquard Co-Ord",
              },
              {
                img: products[4]?.images?.[0]?.url || "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=85",
                city: "London",
                tag: "Cambric Pret",
              },
              {
                img: products[5]?.images?.[0]?.url || "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=600&q=85",
                city: "Toronto",
                tag: "Organza Wrap",
              },
            ].map((item, idx) => (
              <div key={idx} className="relative aspect-[3/4] overflow-hidden group bg-[#0e0e0c]">
                <img
                  src={optimizeImage(item.img, { width: 500 })}
                  alt={`Seen in ${item.city}`}
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                />
                
                {/* Subtle Hover Reveal */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3.5 text-white">
                  <span className="text-[9px] font-mono tracking-widest text-[#d4af37] uppercase">{item.city}</span>
                  <p className="text-xs font-serif text-white font-medium">{item.tag}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. THE ATELIER ASSURANCES (BENEFITS & TRUST)
          Understated horizontal strip, no bulky repetitive cards
          ───────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-16 bg-white border-b border-[#eae7dc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#fafaf8] border border-[#eae7dc] flex items-center justify-center text-[#9c7830] flex-shrink-0">
                <Truck size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-[#0e0e0c]">
                  Nationwide Express
                </h4>
                <p className="text-[11px] text-[#737168] leading-relaxed">
                  Complimentary on all orders above PKR 5,000 via TCS.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#fafaf8] border border-[#eae7dc] flex items-center justify-center text-[#9c7830] flex-shrink-0">
                <RotateCcw size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-[#0e0e0c]">
                  7-Day Doorstep Exchange
                </h4>
                <p className="text-[11px] text-[#737168] leading-relaxed">
                  Effortless size swaps and styling exchanges nationwide.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#fafaf8] border border-[#eae7dc] flex items-center justify-center text-[#9c7830] flex-shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-[#0e0e0c]">
                  100% Authentic Textiles
                </h4>
                <p className="text-[11px] text-[#737168] leading-relaxed">
                  Pure combed lawn, raw silk, and artisanal finishes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#fafaf8] border border-[#eae7dc] flex items-center justify-center text-[#9c7830] flex-shrink-0">
                <Lock size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-[#0e0e0c]">
                  Encrypted Payments
                </h4>
                <p className="text-[11px] text-[#737168] leading-relaxed">
                  Cash on Delivery, PayFast, EasyPaisa, JazzCash & Cards.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          10. VIP ATELIER CIRCLE (NEWSLETTER / COMMUNITY)
          Clean luxury invitation with working code reward
          ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-[#0e0e0c] text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <span className="text-[11px] font-sans font-semibold tracking-[0.3em] uppercase text-[#c5a059] block">
            THE ATELIER CIRCLE
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-white">
            Join the Private Client List
          </h2>
          <p className="text-xs sm:text-sm text-[#b8b5ab] font-light max-w-lg mx-auto leading-relaxed">
            Receive private previews of limited lawn releases, bespoke atelier drops, and a complimentary 10% welcome privilege.
          </p>

          {newsletterSubscribed ? (
            <div className="p-4 bg-white/5 border border-emerald-500/40 text-emerald-300 text-xs font-sans max-w-md mx-auto flex items-center justify-center gap-2">
              <Check size={16} />
              <span>Privilege code activated: use <strong className="text-white font-mono">CLOTHINGDEN10</strong> at checkout.</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto pt-2">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                className="bg-white/5 border border-white/20 px-4 py-3.5 text-xs text-white placeholder-white/40 outline-none focus:border-[#c5a059] flex-1 transition-colors"
              />
              <button
                type="submit"
                className="px-8 py-3.5 bg-[#c5a059] hover:bg-white text-[#0e0e0c] font-sans font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer"
              >
                Join
              </button>
            </form>
          )}
        </div>
      </section>

    </div>
  );
}