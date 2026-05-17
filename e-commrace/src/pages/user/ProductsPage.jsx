import { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { fetchProducts, fetchCategories } from "../../store/productsSlice";
import { addToCart } from "../../store/cartSlice";
import {
  Search,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

/* ─────────────────────────────────────────────
   Skeleton Card
───────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="rounded-xl sm:rounded-2xl border border-[#e8e8e0] overflow-hidden bg-white">
      <div className="aspect-square skeleton-shine" />
      <div className="p-3 sm:p-4 space-y-2">
        <div className="h-2.5 skeleton-shine rounded-full w-1/3" />
        <div className="h-3.5 skeleton-shine rounded-full w-3/4" />
        <div className="h-3.5 skeleton-shine rounded-full w-1/2" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Product Card
───────────────────────────────────────────── */
function ProductCard({ product, index }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please login to add to cart");
      return;
    }
    const res = await dispatch(addToCart({ productId: product._id }));
    if (addToCart.fulfilled.match(res)) toast.success("Added to cart");
    else toast.error(res.payload || "Failed");
  };

  const img = product.images?.[0]?.url;
  const discount =
    product.discountPrice && product.discountPrice < product.price
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : null;

  return (
    <Link
      to={`/products/${product._id}`}
      className="product-card group bg-white border border-[#e8e8e0] rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-lg hover:border-[#d4d4c8] transition-all duration-300"
      style={{ animationDelay: `${(index % 6) * 60}ms` }}
    >
      <div className="relative aspect-square bg-[#f5f5f0] overflow-hidden">
        {img ? (
          <img
            src={img}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag size={28} className="text-[#d4d4c8]" />
          </div>
        )}

        {discount && (
          <span className="absolute top-2 left-2 bg-[#1a1a14] text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
            -{discount}%
          </span>
        )}

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-[9px] sm:text-xs font-semibold text-[#78786a] uppercase tracking-widest">
              Out of Stock
            </span>
          </div>
        )}

        {/* FIX: Always visible on mobile, hover-only on desktop */}
        <button
          onClick={handleAdd}
          className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1a1a14] text-white flex items-center justify-center
            opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-y-2 sm:group-hover:translate-y-0
            transition-all duration-300 hover:bg-[#3c3c30] active:scale-90"
        >
          <ShoppingBag size={13} />
        </button>
      </div>

      <div className="p-3 sm:p-4">
        <p className="text-[10px] sm:text-xs text-[#78786a] mb-0.5 sm:mb-1 truncate">
          {product.category?.name}
        </p>
        <h3 className="font-medium text-[#1a1a14] text-xs sm:text-sm leading-snug mb-1.5 sm:mb-2 line-clamp-2">
          {product.title}
        </h3>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span className="font-semibold text-[#1a1a14] text-sm sm:text-base">
            ₨ {(product.discountPrice || product.price).toLocaleString()}
          </span>
          {product.discountPrice && product.discountPrice < product.price && (
            <span className="text-[10px] sm:text-xs text-[#a8a898] line-through">
              ₨ {product.price.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────
   Pagination
───────────────────────────────────────────── */
function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages = new Set([1, totalPages, page]);
    if (page > 1) pages.add(page - 1);
    if (page < totalPages) pages.add(page + 1);
    return [...pages].sort((a, b) => a - b);
  };

  const visible = getVisiblePages();

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-8 sm:mt-12">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="p-2 rounded-lg sm:rounded-xl border border-[#e8e8e0] hover:border-[#a8a898] disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white"
      >
        <ChevronLeft size={14} />
      </button>
      {visible.map((p, idx) => {
        const prev = visible[idx - 1];
        const showEllipsis = prev && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-1.5 sm:gap-2">
            {showEllipsis && (
              <span className="text-[#a8a898] text-sm px-0.5">…</span>
            )}
            <button
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium border transition-all duration-200 ${
                page === p
                  ? "bg-[#1a1a14] text-white border-[#1a1a14] scale-105"
                  : "border-[#e8e8e0] hover:border-[#a8a898] text-[#1a1a14] bg-white"
              }`}
            >
              {p}
            </button>
          </span>
        );
      })}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="p-2 rounded-lg sm:rounded-xl border border-[#e8e8e0] hover:border-[#a8a898] disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function ProductsPage() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { list, categories, total, totalPages, loading } = useSelector((s) => s.products);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [desktopPage, setDesktopPage] = useState(1);

  const [mobileProducts, setMobileProducts] = useState([]);
  const [mobilePage, setMobilePage] = useState(1);
  const [mobileLoading, setMobileLoading] = useState(false);
  const [mobileHasMore, setMobileHasMore] = useState(true);
  const [mobileTotal, setMobileTotal] = useState(0);

  const [showFilters, setShowFilters] = useState(false);

  // ── FIX 1: Read window.innerWidth immediately so mobile renders correctly from the start
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );

  const sentinelRef = useRef(null);
  const gridRef = useRef(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Desktop fetch
  useEffect(() => {
    if (!isMobile) {
      dispatch(fetchProducts({ page: desktopPage, limit: 12, category: selectedCategory, search }));
    }
  }, [dispatch, isMobile, desktopPage, selectedCategory, search]);

  // ── FIX 2: Reset mobile state when filters change
  useEffect(() => {
    if (isMobile) {
      setMobileProducts([]);
      setMobilePage(1);
      setMobileHasMore(true);
      setMobileTotal(0);
      isFetchingRef.current = false;
    }
  }, [isMobile, search, selectedCategory]);

  const fetchMobilePage = useCallback(
    async (pageNum) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setMobileLoading(true);
      try {
        const result = await dispatch(
          fetchProducts({ page: pageNum, limit: 6, category: selectedCategory, search })
        );
        if (fetchProducts.fulfilled.match(result)) {
          // ── FIX 3: Safely read payload — handle both flat and nested shapes
          const payload = result.payload;
          const newItems = payload?.list ?? payload?.products ?? [];
          const t = payload?.total ?? 0;
          const tp = payload?.totalPages ?? 1;

          setMobileProducts((prev) => (pageNum === 1 ? newItems : [...prev, ...newItems]));
          setMobileTotal(t);
          setMobileHasMore(pageNum < tp);
        }
      } finally {
        setMobileLoading(false);
        isFetchingRef.current = false;
      }
    },
    [dispatch, selectedCategory, search]
  );

  // ── FIX 4: Only fetch when mobilePage changes, not on every filter reset
  useEffect(() => {
    if (isMobile && mobilePage >= 1) {
      fetchMobilePage(mobilePage);
    }
  }, [isMobile, mobilePage]); // intentionally exclude fetchMobilePage to avoid double-fetch

  // Infinite scroll observer
  useEffect(() => {
    if (!isMobile) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          mobileHasMore &&
          !mobileLoading &&
          !isFetchingRef.current
        ) {
          setMobilePage((prev) => prev + 1);
        }
      },
      { rootMargin: "300px" }
    );
    const el = sentinelRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [isMobile, mobileHasMore, mobileLoading]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setDesktopPage(1);
  };

  const handleCategory = (id) => {
    setSelectedCategory(id === selectedCategory ? "" : id);
    setDesktopPage(1);
  };

  const handleDesktopPageChange = (newPage) => {
    setDesktopPage(newPage);
    if (gridRef.current) {
      const top = gridRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        .skeleton-shine {
          background: linear-gradient(90deg, #f0f0e8 25%, #e4e4dc 50%, #f0f0e8 75%);
          background-size: 600px 100%;
          animation: shimmer 1.4s ease-in-out infinite;
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .product-card { animation: fadeSlideUp 0.35s ease both; }
        @keyframes gridFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .grid-fade { animation: gridFade 0.3s ease; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 18px; height: 18px;
          border: 2px solid #e8e8e0;
          border-top-color: #1a1a14;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12">

        {/* Header */}
        <div className="mb-5 sm:mb-8">
          <p className="text-[10px] sm:text-xs font-mono text-[#a8a898] uppercase tracking-widest mb-1 sm:mb-2">
            Explore
          </p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1a1a14]">All Products</h1>
          <p className="text-xs sm:text-sm text-[#78786a] mt-1">
            {(isMobile ? mobileTotal : total) > 0
              ? `${isMobile ? mobileTotal : total} items available`
              : ""}
          </p>
        </div>

        {/* Search & Filter Row */}
        <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-8">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a898]" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search products..."
              className="w-full pl-9 sm:pl-11 pr-8 sm:pr-10 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-[#e8e8e0] focus:border-[#1a1a14] text-xs sm:text-sm outline-none transition-colors bg-white"
            />
            {search && (
              <button
                onClick={() => { setSearch(""); setDesktopPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8a898] hover:text-[#1a1a14]"
              >
                <X size={12} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-[#e8e8e0] bg-white text-xs sm:text-sm font-medium hover:border-[#a8a898] transition-colors whitespace-nowrap"
          >
            <SlidersHorizontal size={13} />
            <span>Filter</span>
            {selectedCategory && <span className="w-1.5 h-1.5 bg-[#1a1a14] rounded-full" />}
          </button>
        </div>

        {/* Category Pills */}
        {(showFilters || selectedCategory) && (
          <div className="flex flex-wrap gap-2 mb-5 sm:mb-8">
            <button
              onClick={() => handleCategory("")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-medium border transition-colors ${
                !selectedCategory
                  ? "bg-[#1a1a14] text-white border-[#1a1a14]"
                  : "border-[#e8e8e0] text-[#78786a] hover:border-[#a8a898]"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => handleCategory(cat._id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-medium border transition-colors ${
                  selectedCategory === cat._id
                    ? "bg-[#1a1a14] text-white border-[#1a1a14]"
                    : "border-[#e8e8e0] text-[#78786a] hover:border-[#a8a898]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* ════ MOBILE — Infinite Scroll ════ */}
        {isMobile && (
          <div ref={gridRef}>
            {mobileProducts.length === 0 && mobileLoading && (
              <div className="grid grid-cols-2 gap-3">
                {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {mobileProducts.length === 0 && !mobileLoading && (
              <div className="text-center py-20">
                <ShoppingBag size={40} className="mx-auto text-[#d4d4c8] mb-3" />
                <h3 className="text-xl font-bold text-[#1a1a14] mb-1">No products found</h3>
                <p className="text-[#78786a] text-sm">Try adjusting your search or filters.</p>
              </div>
            )}

            {mobileProducts.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {mobileProducts.map((p, i) => (
                  <ProductCard key={p._id} product={p} index={i} />
                ))}
                {mobileLoading &&
                  Array(2).fill(0).map((_, i) => <SkeletonCard key={`sk-${i}`} />)}
              </div>
            )}

            {mobileHasMore && !mobileLoading && (
              <div ref={sentinelRef} className="h-10 w-full mt-2" />
            )}

            {mobileLoading && mobileProducts.length > 0 && (
              <div className="flex justify-center mt-5 mb-2">
                <div className="spinner" />
              </div>
            )}

            {!mobileHasMore && mobileProducts.length > 0 && (
              <p className="text-center text-[10px] text-[#a8a898] mt-6 mb-3">
                You've seen all {mobileTotal} products ✓
              </p>
            )}
          </div>
        )}

        {/* ════ DESKTOP — Pagination ════ */}
        {!isMobile && (
          <div ref={gridRef}>
            {loading ? (
              <div className="grid grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {Array(12).fill(0).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : list.length === 0 ? (
              <div className="text-center py-24">
                <ShoppingBag size={48} className="mx-auto text-[#d4d4c8] mb-4" />
                <h3 className="text-2xl font-bold text-[#1a1a14] mb-2">No products found</h3>
                <p className="text-[#78786a] text-sm">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 grid-fade">
                {list.map((p, i) => (
                  <ProductCard key={p._id} product={p} index={i} />
                ))}
              </div>
            )}

            <Pagination
              page={desktopPage}
              totalPages={totalPages}
              onPageChange={handleDesktopPageChange}
            />
          </div>
        )}
      </div>
    </>
  );
}