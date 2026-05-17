import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, fetchCategories } from "../../store/productsSlice";
import { addToCart } from "../../store/cartSlice";
import { ArrowRight, ShoppingBag, Sparkles, Star, Zap } from "lucide-react";
import toast from "react-hot-toast";

/* ─── Google Fonts injected once ─── */
function InjectFonts() {
  useEffect(() => {
    if (document.getElementById("vault-fonts")) return;
    const link = document.createElement("link");
    link.id = "vault-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.textContent = `
      .vault-display { font-family: 'Cormorant Garamond', Georgia, serif; }
      .vault-body    { font-family: 'DM Sans', system-ui, sans-serif; }

      @keyframes vault-fade-up {
        from { opacity: 0; transform: translateY(28px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes vault-fade-in {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes ticker {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      @keyframes shimmer {
        0%   { background-position: -200% center; }
        100% { background-position: 200% center; }
      }

      .vault-a1 { animation: vault-fade-up .7s cubic-bezier(.22,1,.36,1) both; }
      .vault-a2 { animation: vault-fade-up .7s .15s cubic-bezier(.22,1,.36,1) both; }
      .vault-a3 { animation: vault-fade-up .7s .3s  cubic-bezier(.22,1,.36,1) both; }
      .vault-a4 { animation: vault-fade-up .7s .45s cubic-bezier(.22,1,.36,1) both; }
      .vault-a5 { animation: vault-fade-up .7s .6s  cubic-bezier(.22,1,.36,1) both; }

      .ticker-wrap { overflow: hidden; white-space: nowrap; }
      .ticker-inner { display: inline-flex; animation: ticker 28s linear infinite; }

      .card-img { transition: transform .65s cubic-bezier(.22,1,.36,1); }
      .card-root:hover .card-img { transform: scale(1.08); }

      .btn-primary {
        position: relative; overflow: hidden;
        background: #1a1a14; color: #fff;
        transition: transform .2s, box-shadow .2s;
      }
      .btn-primary::after {
        content:''; position:absolute; inset:0;
        background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,.13) 50%, transparent 70%);
        background-size: 200% 100%;
        opacity: 0;
        transition: opacity .3s;
      }
      .btn-primary:hover::after { opacity:1; animation: shimmer .6s linear; }
      .btn-primary:hover { transform:translateY(-2px); box-shadow:0 12px 32px rgba(26,26,20,.25); }
      .btn-primary:active { transform:translateY(0); }

      .stat-num {
        font-family: 'Cormorant Garamond', serif;
        font-size: clamp(2.2rem, 5vw, 3.5rem);
        font-weight: 700; line-height: 1;
        color: #1a1a14;
      }

      .section-label {
        font-family: 'DM Sans', sans-serif;
        font-size: .65rem; letter-spacing: .25em;
        text-transform: uppercase; color: #a8a898;
      }

      /* ── FIX: Show add button always on touch devices (no hover on mobile) ── */
      .product-add-btn {
        opacity: 0; transform: translateY(6px);
        transition: opacity .25s, transform .25s;
      }
      .card-root:hover .product-add-btn {
        opacity: 1; transform: translateY(0);
      }
      @media (hover: none) {
        .product-add-btn {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .cat-label {
        transform: translateY(4px);
        transition: transform .35s cubic-bezier(.22,1,.36,1);
      }
      .card-root:hover .cat-label { transform: translateY(0); }
      @media (hover: none) {
        .cat-label { transform: translateY(0); }
      }

      .badge-pill {
        background: rgba(255,255,255,.92);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }

      .skeleton { animation: pulse 1.6s ease-in-out infinite; background: #f0f0e8; }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }

      .divider-line {
        width:32px; height:1px; background:#1a1a14; display:inline-block; vertical-align:middle;
      }
    `;
    document.head.appendChild(style);
  }, []);
  return null;
}

/* ─── Marquee ticker ─── */
function Ticker() {
  const items = ["FREE SHIPPING ON ORDERS OVER ₨5,000", "NEW CURATED DROPS EVERY WEEK",
    "99% CUSTOMER SATISFACTION", "PREMIUM PRODUCTS · HONEST PRICES", "VAULT — ONLY THE FINEST"];
  const doubled = [...items, ...items];
  return (
    <div className="vault-body ticker-wrap bg-[#1a1a14] text-white py-3">
      <div className="ticker-inner">
        {doubled.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-5 px-8 text-[11px] tracking-[.18em]">
            {t} <span className="w-1 h-1 rounded-full bg-[#e8b520] inline-block flex-shrink-0" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Product Card ─── */
function ProductCard({ product, index = 0 }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error("Please login to add to cart"); return; }
    const res = await dispatch(addToCart({ productId: product._id }));
    if (addToCart.fulfilled.match(res)) toast.success("Added to cart");
    else toast.error(res.payload || "Failed to add");
  };

  const img = product.images?.[0]?.url;
  const discount = product.discountPrice && product.discountPrice < product.price
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : null;

  return (
    <Link
      to={`/products/${product._id}`}
      // FIX: replaced Cyrillic "е" in #ebebе3 → correct Latin #ebebe3
      className="card-root vault-body group block bg-white border border-[#ebebe3] rounded-2xl overflow-hidden hover:shadow-[0_20px_60px_rgba(26,26,20,.10)] transition-shadow duration-500"
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      {/* Image */}
      <div className="relative aspect-[3/2.6] bg-[#f8f8f5] overflow-hidden">
        {img ? (
          <img src={img} alt={product.title}
            className="card-img w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#f5f5f0]">
            <ShoppingBag size={36} className="text-[#d4d4c8]" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {discount && (
            <span className="badge-pill text-[#1a1a14] text-[10px] font-semibold px-2.5 py-1 rounded-full tracking-wide">
              −{discount}%
            </span>
          )}
        </div>

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/75 backdrop-blur-sm flex items-center justify-center">
            <span className="vault-body text-[10px] sm:text-xs font-semibold tracking-[.2em] text-[#78786a]">
              OUT OF STOCK
            </span>
          </div>
        )}

        {/* Quick add — always visible on mobile via @media(hover:none) CSS above */}
        <button onClick={handleAdd}
          className="product-add-btn absolute bottom-3 right-3 h-9 px-4 rounded-xl bg-[#1a1a14] text-white text-[11px] font-medium tracking-wide flex items-center gap-2">
          <ShoppingBag size={13} /> Add
        </button>
      </div>

      {/* Info */}
      <div className="p-4 sm:p-5">
        <p className="section-label mb-1 truncate">{product.category?.name}</p>
        <h3 className="vault-body text-[13.5px] sm:text-sm font-medium text-[#1a1a14] leading-snug mb-2.5 line-clamp-2">
          {product.title}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="vault-display text-xl sm:text-2xl font-semibold text-[#1a1a14] leading-none">
            ₨ {(product.discountPrice || product.price).toLocaleString()}
          </span>
          {discount && (
            <span className="vault-body text-xs text-[#b8b8a8] line-through">
              ₨ {product.price.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ─── Category Card ─── */
function CategoryCard({ cat }) {
  return (
    <Link
      to={`/products?category=${cat._id}`}
      // FIX: better aspect ratio on mobile — was too tall at aspect-[3/2.6]
      className="card-root group relative rounded-2xl overflow-hidden border border-[#e8e8e0] hover:border-[#ccccc0] aspect-[4/3] sm:aspect-[3/2.4] bg-white hover:shadow-[0_16px_48px_rgba(26,26,20,.12)] transition-all duration-500 active:scale-[0.98] block"
    >
      <div className="absolute inset-0">
        {cat.image?.url ? (
          <img src={cat.image.url} alt={cat.name}
            className="card-img w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[#f5f5f0] flex items-center justify-center">
            <ShoppingBag size={36} className="text-[#d4d4c8]" />
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 text-white">
        <h3 className="vault-display text-lg sm:text-xl font-semibold leading-tight">{cat.name}</h3>
        <p className="cat-label vault-body text-[11px] text-white/60 mt-0.5 tracking-widest uppercase">
          Explore →
        </p>
      </div>
    </Link>
  );
}

/* ─── Skeleton ─── */
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-[#e8e8e0]">
      <div className="aspect-[3/2.6] skeleton" />
      <div className="p-4 sm:p-5 space-y-2.5">
        <div className="h-2.5 skeleton rounded w-16" />
        <div className="h-4 skeleton rounded w-full" />
        <div className="h-4 skeleton rounded w-2/3" />
        <div className="h-6 skeleton rounded w-24 mt-1" />
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function HomePage() {
  const dispatch = useDispatch();
  const { list: products, categories, loading } = useSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 8 }));
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <div className="vault-body bg-[#fafaf8] overflow-x-hidden">
      <InjectFonts />
      <Ticker />

      {/* ══ HERO ══ */}
      <section className="relative min-h-[88vh] sm:min-h-[92vh] flex flex-col justify-center overflow-hidden bg-[#fafaf8]">

        {/* Background decorations */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -top-24 -right-24 w-[380px] h-[380px] sm:w-[560px] sm:h-[560px] lg:w-[700px] lg:h-[700px] rounded-full bg-[#e8e8e0]/35 blur-3xl" />
          <div className="absolute bottom-0 -left-16 w-[300px] h-[300px] sm:w-[440px] sm:h-[440px] rounded-full bg-[#f0ede3]/55 blur-3xl" />
          <div className="absolute inset-0 opacity-[.028]"
            style={{ backgroundImage: 'linear-gradient(#1a1a14 1px,transparent 1px),linear-gradient(90deg,#1a1a14 1px,transparent 1px)', backgroundSize: '64px 64px' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 w-full py-20 sm:py-28">
          <div className="max-w-2xl">

            {/* Pill badge */}
            <div className="vault-a1 inline-flex items-center gap-2.5 px-4 py-2 border border-[#e0e0d8] bg-white/80 backdrop-blur-sm rounded-full text-[11px] tracking-[.18em] text-[#78786a] mb-7 sm:mb-9">
              <Sparkles size={13} className="text-[#e8b520]" />
              NEW CURATED DROPS
            </div>

            {/* Headline */}
            <h1 className="vault-a2 vault-display font-bold text-[#1a1a14] leading-[.9] mb-5 sm:mb-7"
              style={{ fontSize: 'clamp(3.4rem, 9vw, 7.5rem)' }}>
              Every<br />
              <em className="not-italic text-[#6b6b5f]">piece.</em>
            </h1>
            <h2 className="vault-a2 vault-display font-light text-[#1a1a14] leading-[.9] mb-8 sm:mb-10 -mt-2"
              style={{ fontSize: 'clamp(2rem, 5.5vw, 4.5rem)', letterSpacing: '-0.01em' }}>
              Worth keeping.
            </h2>

            <p className="vault-a3 vault-body text-base sm:text-lg text-[#78786a] max-w-sm sm:max-w-md leading-relaxed mb-10 sm:mb-12">
              Vault curates only the finest. No filler — just products that genuinely deserve space in your life.
            </p>

            {/* CTAs — FIX: xs:flex-row doesn't exist in Tailwind, changed to sm:flex-row */}
            <div className="vault-a4 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link to="/products"
                className="btn-primary rounded-2xl px-7 sm:px-9 py-4 font-semibold text-[15px] inline-flex items-center justify-center gap-3 flex-shrink-0">
                Shop Collection <ArrowRight size={18} />
              </Link>
              <Link to="/about"
                className="vault-body rounded-2xl px-7 py-4 border border-[#e0e0d8] font-medium text-[15px] text-[#1a1a14] hover:border-[#b8b8a8] hover:bg-white transition-all text-center flex-shrink-0">
                Our Story
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="vault-a5 mt-16 sm:mt-0 sm:absolute sm:bottom-12 sm:left-auto sm:right-12 lg:right-16 flex gap-8 sm:gap-12">
            {[["10K+", "Products"], ["50K+", "Customers"], ["99%", "Satisfaction"]].map(([num, label]) => (
              <div key={label} className="flex flex-col items-start sm:items-center">
                <p className="stat-num">{num}</p>
                <p className="section-label mt-1.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom border */}
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#e0e0d8] to-transparent" />
      </section>

      {/* ══ CATEGORIES ══ */}
      {categories.length > 0 && (
        <section className="py-20 sm:py-28 px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10 sm:mb-14">
            <div>
              <p className="section-label mb-2">Discover</p>
              <h2 className="vault-display font-bold text-[#1a1a14] leading-none"
                style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}>
                Categories
              </h2>
            </div>
            <Link to="/products"
              className="vault-body text-[13px] font-medium text-[#1a1a14] flex items-center gap-1.5 hover:gap-3 transition-all duration-300 border-b border-[#1a1a14]/30 pb-px">
              Browse All <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-5">
            {categories.map((cat) => <CategoryCard key={cat._id} cat={cat} />)}
          </div>
        </section>
      )}

      {/* ══ FEATURED PRODUCTS ══ */}
      <section className="pb-20 sm:pb-28 px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto">

        <div className="flex items-end justify-between mb-10 sm:mb-14">
          <div>
            <p className="section-label mb-2">Handpicked</p>
            <h2 className="vault-display font-bold text-[#1a1a14] leading-none"
              style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}>
              Featured
            </h2>
          </div>
          <Link to="/products"
            className="vault-body text-[13px] font-medium text-[#1a1a14] flex items-center gap-1.5 hover:gap-3 transition-all duration-300 border-b border-[#1a1a14]/30 pb-px">
            View All <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {products.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
          </div>
        )}
      </section>

      {/* ══ CTA BANNER ══ */}
      <section className="mx-4 sm:mx-8 lg:mx-12 mb-20 sm:mb-28 rounded-3xl overflow-hidden bg-[#141410] relative">

        <div className="absolute inset-0 opacity-[.06]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="absolute -top-20 right-10 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#e8b520]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 px-7 sm:px-12 md:px-16 py-16 sm:py-20 md:py-24 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-10">
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/70 text-[10px] tracking-[.2em] mb-5">
              <Zap size={11} className="text-[#e8b520]" /> LIMITED TIME
            </div>
            <h2 className="vault-display text-white font-bold leading-[.92]"
              style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)' }}>
              Up to 40%<br />
              <span className="text-[#c8c8b8] font-light italic">off select items</span>
            </h2>
            <p className="vault-body mt-5 text-[#888878] text-base leading-relaxed max-w-sm">
              Premium products at exceptional prices — for a very limited time.
            </p>
          </div>

          <Link to="/products"
            className="vault-body flex-shrink-0 inline-flex items-center gap-3 px-8 sm:px-10 py-4 bg-white text-[#1a1a14] rounded-2xl font-semibold text-[15px] hover:bg-[#e8e8e0] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 self-start sm:self-auto">
            Shop the Sale <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}