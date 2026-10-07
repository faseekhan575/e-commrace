import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, fetchCategories, fetchHotProducts } from "../../store/productsSlice";
import { fetchActiveBanners } from "../../store/bannerSlice";
import { fetchActiveSpotlights } from "../../store/spotlightSlice";
import { addToCart } from "../../store/cartSlice";
import ProductCard from "../../components/ProductCard";
import CategorySwipeSection from "../../components/CategorySwipeSection";
import LuxuryMarqueeRibbon from "../../components/LuxuryMarqueeRibbon";
import { CLOTHING_PRODUCTS, CLOTHING_CATEGORIES } from "../../data/clothingData";
import { DEFAULT_BANNERS } from "../../data/bannerData";
import { optimizeImage } from "../../utils/imageOptimizer";
import {
  ArrowRight, Sparkles, ChevronLeft, ChevronRight,
  Truck, ShieldCheck, RotateCcw,
  Lock, Check, Layers, Scissors, ShoppingBag, Eye
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

  // Priority to our high-res Pakistani suit model default banners if server has none or defaults
  const activeBanners = useMemo(() => {
    if (banners && banners.length > 0 && banners[0]?.image?.url?.includes("pakistani")) {
      return banners.filter((b) => b.isActive !== false && b.active !== false);
    }
    return DEFAULT_BANNERS;
  }, [banners]);

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
    eyebrow: "ROYAL LAHORE ATELIER '26",
    title: "Handcrafted Raw Silk Kurta with Organza Dupatta",
    description: "Tailored from pure 80-gram raw silk with intricate antique kora-dabka neckline hand embroidery, paired with a laser-cut organza dupatta with scalloped zardozi borders.",
    price: 12500,
    currency: "PKR",
    dispatchBadge: "✓ Ready to Dispatch in 24h via TCS",
    hotspot: { text: "Hand-Embroidered Zari Neckline", posX: 36, posY: 32 },
    image: { url: "/categories/pakistani-raw-silk.jpg" },
    primaryCta: { text: "ADD COMPLETE ENSEMBLE TO BAG", link: "/products" },
    secondaryCta: { text: "VIEW FULL LOOKBOOK", link: "/products?category=luxury-pret" },
  };

  const spotlightImg = spotlight?.image?.url || spotlight?.image || "/categories/pakistani-raw-silk.jpg";

  const handleSpotlightAddToCart = () => {
    const featuredProduct = products.find((p) => p._id === "66ce381a9f1b2c0000000004") || products[0];
    dispatch(
      addToCart({
        product: featuredProduct,
        productId: featuredProduct._id,
        quantity: 1,
        size: "M",
        color: featuredProduct.color || "Maroon",
      })
    );
    toast.success("Added Complete Royal Ensemble to your bag", {
      icon: "👑",
      style: { background: "#0e0e0c", color: "#fff", fontSize: "12px" },
    });
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setNewsletterSubscribed(true);
    toast.success("Welcome to the Atelier Circle. Privilege code CLOTHINGDEN10 activated!", {
      icon: "✨",
      style: { background: "#0e0e0c", color: "#fff", fontSize: "12px" },
    });
  };

  return (
    <div className="bg-[#fafaf8] text-[#0e0e0c] overflow-hidden selection:bg-[#0e0e0c] selection:text-white">

      {/* ─────────────────────────────────────────────────────────────
          1. GRAND HAUTE COUTURE HERO BANNER (PAKISTANI SUIT MODELS)
          Full-viewport cinematic photography, interactive preview deck,
          regal serif typography, dual luxury CTAs
          ───────────────────────────────────────────────────────────── */}
      <section className="relative h-[88vh] sm:h-[92vh] min-h-[640px] max-h-[1020px] w-full bg-[#0d0d0b] overflow-hidden select-none">
        {activeBanners.map((slide, idx) => {
          const imgUrl = slide.image?.url || slide.image || "/banners/pakistani-festive-lawn.jpg";
          const isCurrent = idx === heroSlide;

          return (
            <div
              key={slide._id || slide.id || idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isCurrent ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
              }`}
            >
              {/* Pakistani Model Background with Subtle Cinematic Ken Burns */}
              <img
                src={optimizeImage(imgUrl, { width: 1920 })}
                alt={slide.title || "Pakistani Luxury Suit Model"}
                fetchPriority={idx === 0 ? "high" : "auto"}
                className={`w-full h-full object-cover object-top sm:object-center transition-transform duration-10000 ease-out ${
                  isCurrent ? "scale-105" : "scale-100"
                }`}
              />

              {/* Dual Filmic Vignette: Keeps Pakistani Embroidery Vibrant & Text Pristine */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(13,13,11,0.3) 0%, rgba(13,13,11,0.2) 40%, rgba(13,13,11,0.85) 100%), linear-gradient(90deg, rgba(13,13,11,0.85) 0%, rgba(13,13,11,0.4) 50%, transparent 100%)",
                }}
              />

              {/* Content Box */}
              <div className="absolute inset-0 max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-end pb-20 sm:pb-28 z-20">
                <div className="max-w-2xl space-y-4 sm:space-y-6">
                  
                  {/* Whispering Atelier Crest Tag */}
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-[1px] bg-[#c5a059]" />
                    <span className="text-[10px] sm:text-[11px] font-sans font-semibold tracking-[0.32em] uppercase text-[#d4af37]">
                      {slide.badge || slide.tagline || "ROYAL ATELIER EDIT '26"}
                    </span>
                  </div>

                  {/* Majestic Headline */}
                  <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white font-normal tracking-tight leading-[1.0] text-balance">
                    {slide.title}
                  </h1>

                  {/* Poetic Supporting Copy */}
                  <p className="text-xs sm:text-sm md:text-base text-[#e5e3dc] font-light max-w-xl leading-relaxed font-sans opacity-90">
                    {slide.subtitle || "A royal symphony of intricate gold zari necklines, pure cambric weaves, and delicate organza dupattas hand-tailored for effortless grace."}
                  </p>

                  {/* Floating Garment Craftsmanship Pill */}
                  <div className="hidden sm:inline-flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/15 text-white/90 text-[11px] font-sans tracking-wide">
                    <span className="text-[#c5a059] font-mono">✦</span>
                    <span>Fabric: <strong>{slide.fabric || "Pure Embroidered Lawn"}</strong></span>
                    <span className="opacity-40">•</span>
                    <span>Origin: <strong>{slide.origin || "Lahore Atelier"}</strong></span>
                  </div>

                  {/* Dual Luxury Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center gap-3.5">
                    <Link
                      to={slide.ctaLink || "/products"}
                      className="px-8 py-4 bg-white hover:bg-[#c5a059] text-[#0e0e0c] hover:text-white font-sans font-bold text-[11px] sm:text-xs uppercase tracking-[0.24em] transition-all duration-300 shadow-2xl flex items-center gap-2.5 group"
                    >
                      <ShoppingBag size={14} />
                      <span>{slide.ctaText || "Shop Collection"}</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                      to="/products?category=luxury-pret"
                      className="px-7 py-4 border border-white/40 hover:border-white text-white font-sans font-semibold text-[11px] sm:text-xs uppercase tracking-[0.22em] transition-all duration-300 hover:bg-white/10 backdrop-blur-xs flex items-center gap-2"
                    >
                      <Eye size={14} />
                      <span>Explore Lookbook</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Right-Side Interactive Slide Deck (Miniature Pakistani Suit Model Cards) */}
        <div className="absolute bottom-8 right-6 sm:right-12 z-30 flex flex-col items-end gap-4">
          
          {/* Interactive Slide Preview Cards for Instant Click */}
          <div className="hidden md:flex items-center gap-3 bg-black/50 backdrop-blur-md p-2 rounded-xs border border-white/10">
            {activeBanners.map((b, i) => {
              const miniImg = b.image?.url || b.image || "/banners/pakistani-festive-lawn.jpg";
              const isActive = i === heroSlide;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setHeroSlide(i)}
                  className={`flex items-center gap-2.5 p-1.5 transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-white/15 border border-[#c5a059] shadow-lg"
                      : "opacity-60 hover:opacity-100 border border-transparent"
                  }`}
                >
                  <img
                    src={miniImg}
                    alt={b.title}
                    className="w-10 h-10 object-cover object-top rounded-xs"
                  />
                  <div className="text-left pr-2">
                    <span className="font-mono text-[9px] text-[#c5a059] block tracking-widest">
                      0{i + 1}
                    </span>
                    <span className="text-[10px] font-sans font-medium text-white line-clamp-1 max-w-[90px]">
                      {b.title?.split(" ")[0]} Edit
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Minimal Controls & Counter */}
          <div className="flex items-center gap-4">
            <div className="font-mono text-xs text-white/80 tracking-widest">
              <span className="text-white font-bold">0{heroSlide + 1}</span>
              <span className="mx-1.5 opacity-40">/</span>
              <span className="opacity-60">0{activeBanners.length}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setHeroSlide((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)}
                className="w-9 h-9 rounded-full border border-white/20 bg-black/40 hover:bg-white hover:text-black text-white backdrop-blur-md flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95"
                aria-label="Previous Slide"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setHeroSlide((prev) => (prev + 1) % activeBanners.length)}
                className="w-9 h-9 rounded-full border border-white/20 bg-black/40 hover:bg-white hover:text-black text-white backdrop-blur-md flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95"
                aria-label="Next Slide"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. UNDERSTATED LUXURY MARQUEE RIBBON
          Gold starbursts, refined rhythm, zero carnival colors
          ───────────────────────────────────────────────────────────── */}
      <LuxuryMarqueeRibbon />

      {/* ─────────────────────────────────────────────────────────────
          3. EXPLORE BY CATEGORY: INFINITE CONTINUOUS SWIPE STREAM
          Unlimited auto-swiping marquee, never stops, pause on hover,
          every single card is 100% clickable with Pakistani suit models!
          ───────────────────────────────────────────────────────────── */}
      <CategorySwipeSection categories={categories} />

      {/* ─────────────────────────────────────────────────────────────
          4. BRAND NEW: THE GRAND DUAL LOOKBOOK EDIT (HIGH-FASHION SPLIT)
          Two high-contrast editorial campaign banners side-by-side
          ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-white border-b border-[#eae7dc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-[11px] font-sans font-semibold tracking-[0.28em] text-[#9c7830] uppercase block mb-2.5">
                EDITORIAL HIGHLIGHTS
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-[#0e0e0c] tracking-tight leading-[1.08] font-medium">
                The Festive & Bridal Chapters
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#66655c] max-w-md font-light leading-relaxed">
              Explore our two signature design pillars: vibrant daylight festive lawn and regal candlelight evening velvet formals.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Card 1: Festive Lawn (7 Cols) */}
            <div className="lg:col-span-7 relative aspect-[4/3] sm:aspect-[16/10] overflow-hidden group bg-[#111] shadow-lg">
              <img
                src="/banners/pakistani-festive-lawn.jpg"
                alt="Pakistani Festive Lawn Model"
                className="w-full h-full object-cover object-top transition-transform duration-1000 ease-out group-hover:scale-106"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              
              <div className="absolute top-6 left-6 z-10">
                <span className="text-[10px] font-mono tracking-widest uppercase bg-white/90 text-black px-3 py-1 font-bold">
                  CHAPTER 01 • SUMMER LAWN
                </span>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10 text-white z-10 flex flex-col justify-end space-y-3">
                <span className="text-[11px] font-sans font-medium tracking-[0.24em] text-[#d4af37] uppercase">
                  UNSTITCHED & READY TO WEAR
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl text-white font-normal leading-tight">
                  Festive Embroidered Lawn Suits
                </h3>
                <p className="text-xs sm:text-sm text-[#e5e3dc] max-w-lg font-light leading-relaxed">
                  Pure cambric shirts featuring intricate floral threadwork, laser-cut schiffli daman, and digitally printed tissue silk dupattas.
                </p>
                <div className="pt-2 flex items-center justify-between">
                  <span className="font-serif text-lg text-white">Starting from PKR 7,600</span>
                  <Link
                    to="/products?category=festive-collection"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-[#c5a059] text-black hover:text-white font-sans font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300"
                  >
                    <span>Shop Lawn Edit</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 2: Velvet Formals (5 Cols) */}
            <div className="lg:col-span-5 relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto overflow-hidden group bg-[#111] shadow-lg">
              <img
                src="/banners/pakistani-velvet-couture.jpg"
                alt="Pakistani Velvet Couture Model"
                className="w-full h-full object-cover object-top transition-transform duration-1000 ease-out group-hover:scale-106"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
              
              <div className="absolute top-6 left-6 z-10">
                <span className="text-[10px] font-mono tracking-widest uppercase bg-[#c5a059] text-black px-3 py-1 font-bold">
                  CHAPTER 02 • ROYAL VELVET
                </span>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10 text-white z-10 flex flex-col justify-end space-y-3">
                <span className="text-[11px] font-sans font-medium tracking-[0.24em] text-[#d4af37] uppercase">
                  BRIDAL & FORMAL PRET
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl text-white font-normal leading-tight">
                  Crimson Velvet & Raw Silk Formals
                </h3>
                <p className="text-xs sm:text-sm text-[#e5e3dc] font-light leading-relaxed">
                  Micro-velvet 9000 enriched with hand-worked dabka tilla, antique kora neckline, and scalloped tissue borders.
                </p>
                <div className="pt-2 flex items-center justify-between">
                  <span className="font-serif text-lg text-white">Starting from PKR 10,990</span>
                  <Link
                    to="/products?category=luxury-pret"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#c5a059] hover:bg-white text-black font-sans font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300"
                  >
                    <span>Explore Formals</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. SIGNATURE CREATIONS & NEW DROPS (INTERACTIVE PRODUCT SHOWCASE)
          Editorial headline, capsule filter tabs, clean fashion cards
          ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-[#fafaf8] border-b border-[#eae7dc]">
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
                      : "bg-[#eae8df] text-[#55534b] hover:bg-[#dedcd1] hover:text-[#0e0e0c]"
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
          6. THE ATELIER LOOKBOOK SPOTLIGHT (`/api/v11/spotlight`)
          High-fashion split composition, pulsing interactive hotspot,
          poetic craftsmanship storytelling & instant checkout trigger
          ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-[#fafaf8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0e0e0c] text-white overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch shadow-2xl border border-[#22221c]">
            
            {/* Left: Dramatic Portrait Photography with Hotspot Pin */}
            <div className="lg:col-span-6 relative aspect-[3/4] lg:aspect-auto min-h-[480px] lg:min-h-[660px] overflow-hidden bg-black group">
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
                  top: `${spotlight?.hotspot?.posY ?? 32}%`,
                }}
                onClick={() => setHotspotActive((prev) => !prev)}
              >
                {/* Pulsing concentric ring */}
                <span className="absolute -inset-2 rounded-full bg-[#c5a059]/40 animate-ping" />
                <button
                  type="button"
                  className="relative w-9 h-9 rounded-full bg-white/95 text-[#0e0e0c] flex items-center justify-center shadow-2xl border border-white/60 hover:scale-110 transition-transform"
                  aria-label="View Garment Details"
                >
                  <Sparkles size={15} className="text-[#c5a059]" />
                </button>

                {/* Hotspot Floating Tooltip */}
                {hotspotActive && (
                  <div className="absolute left-11 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md text-[#0e0e0c] px-4 py-2.5 shadow-2xl whitespace-nowrap border border-[#eae7dc] animate-in fade-in duration-300">
                    <p className="text-[10px] font-sans font-semibold tracking-widest uppercase text-[#9c7830]">
                      PAKISTANI CRAFTSMANSHIP
                    </p>
                    <p className="text-xs font-serif font-bold text-[#0e0e0c]">
                      {spotlight?.hotspot?.text || "Hand-Embroidered Zari Neckline"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Editorial Craftsmanship Narrative */}
            <div className="lg:col-span-6 p-8 sm:p-14 lg:p-16 flex flex-col justify-center space-y-7">
              <div className="space-y-3">
                <span className="text-[11px] font-sans font-semibold tracking-[0.3em] uppercase text-[#c5a059] block">
                  {spotlight?.eyebrow || "ROYAL LAHORE ATELIER '26"}
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-[1.08] text-white">
                  {spotlight?.title || "Handcrafted Raw Silk Kurta with Organza Dupatta"}
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-[#b8b5ab] font-light leading-relaxed">
                {spotlight?.description || "Tailored from pure 80-gram raw silk with intricate antique kora-dabka neckline hand embroidery, paired with a laser-cut organza dupatta with scalloped zardozi borders."}
              </p>

              {/* Artisanal Heritage Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/10">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono tracking-widest text-[#c5a059] uppercase block">FABRIC</span>
                  <p className="text-xs text-white font-medium">80g Pure Raw Silk</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono tracking-widest text-[#c5a059] uppercase block">TECHNIQUE</span>
                  <p className="text-xs text-white font-medium">Antique Kora-Dabka Zari</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono tracking-widest text-[#c5a059] uppercase block">DUPATTA</span>
                  <p className="text-xs text-white font-medium">Scalloped Organza</p>
                </div>
              </div>

              {/* Price & Dispatch Assurance */}
              <div className="flex flex-wrap items-baseline gap-4 py-3 border-y border-white/10">
                <span className="font-serif text-3xl sm:text-4xl font-normal text-white">
                  {spotlight?.currency || "PKR"} {Number(spotlight?.price || 12500).toLocaleString()}
                </span>
                <span className="text-[11px] font-sans text-emerald-300 font-medium tracking-wider uppercase bg-emerald-950/60 px-3 py-1 border border-emerald-500/20">
                  {spotlight?.dispatchBadge || "✓ Ready to Dispatch in 24h via TCS"}
                </span>
              </div>

              {/* Direct CTAs */}
              <div className="pt-2 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={handleSpotlightAddToCart}
                  className="px-8 py-4 bg-[#c5a059] hover:bg-white text-[#0e0e0c] font-sans font-bold text-xs uppercase tracking-[0.22em] transition-all duration-300 shadow-xl cursor-pointer flex items-center gap-2"
                >
                  <ShoppingBag size={14} />
                  <span>{spotlight?.primaryCta?.text || "Add Ensemble to Bag"}</span>
                </button>
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
          7. THE FABRIC & CRAFTSMANSHIP HERITAGE (BRAND STORY / IDENTITY)
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
                We select exclusively 80-gram pure raw silk, combed Egyptian lawn, and breathable Swiss voile that drape naturally with majestic poise.
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
          8. LIMITED FESTIVE EDITIONS (BEST SELLERS)
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
          9. SEEN IN CLOTHING DEN (EDITORIAL COMMUNITY LOOKBOOK)
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
                img: "/banners/pakistani-festive-lawn.jpg",
                city: "Lahore",
                tag: "Festive Lawn '26",
              },
              {
                img: "/categories/pakistani-raw-silk.jpg",
                city: "Karachi",
                tag: "Raw Silk Kurta",
              },
              {
                img: "/banners/pakistani-velvet-couture.jpg",
                city: "Islamabad",
                tag: "Velvet Couture",
              },
              {
                img: "/banners/pakistani-festive-pret.jpg",
                city: "Dubai",
                tag: "Schiffli Silk",
              },
              {
                img: "/categories/pakistani-pastel-lawn.jpg",
                city: "London",
                tag: "Pastel Lawn Set",
              },
              {
                img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=85",
                city: "Toronto",
                tag: "Silk Pret",
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
          10. THE ATELIER ASSURANCES (BENEFITS & TRUST)
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
                  Nationwide Express TCS
                </h4>
                <p className="text-[11px] text-[#737168] leading-relaxed">
                  Complimentary express shipping across Pakistan on orders above PKR 5,000.
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
                  100% Authentic Fabric
                </h4>
                <p className="text-[11px] text-[#737168] leading-relaxed">
                  Pure combed lawn, 80g raw silk, and artisanal hand-finished zardozi.
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
                  Cash on Delivery (COD), PayFast, EasyPaisa, JazzCash & Visa/MasterCard.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          11. VIP ATELIER CIRCLE (NEWSLETTER / COMMUNITY)
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