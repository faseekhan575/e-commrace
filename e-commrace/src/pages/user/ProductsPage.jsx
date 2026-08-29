import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, Link } from "react-router-dom";
import { fetchProducts, fetchCategories } from "../../store/productsSlice";
import ProductCard from "../../components/ProductCard";
import { CLOTHING_PRODUCTS, CLOTHING_CATEGORIES, FABRICS_LIST } from "../../data/clothingData";
import {
  Search, SlidersHorizontal, X, ArrowUpDown,
  Filter, Grid, ChevronDown, Check
} from "lucide-react";

export default function ProductsPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { list: serverProducts, categories: serverCategories, loading } = useSelector((s) => s.products);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedFabric, setSelectedFabric] = useState("");
  const [selectedStitching, setSelectedStitching] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 50 }));
    dispatch(fetchCategories());
  }, [dispatch]);

  // Sync category param from URL
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategory(cat);
    const q = searchParams.get("search");
    if (q) setSearch(q);
  }, [searchParams]);

  // Live backend data from MongoDB
  const allProducts = useMemo(() => {
    return serverProducts || [];
  }, [serverProducts]);

  const categories = serverCategories || [];

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = p.title?.toLowerCase().includes(q);
        const matchesFabric = p.fabric?.toLowerCase().includes(q);
        const matchesTags = p.tags?.some((t) => t.toLowerCase().includes(q));
        const matchesCat = p.category?.name?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesFabric && !matchesTags && !matchesCat) return false;
      }

      // Robust Category matching (supports string ID, populated object, slug, name, tags)
      if (selectedCategory) {
        const catQuery = selectedCategory.toLowerCase();
        const targetCat = categories.find(
          (c) => c._id === selectedCategory || c.slug === selectedCategory || c.name?.toLowerCase() === catQuery
        );
        const validMatchTokens = [
          selectedCategory,
          catQuery,
          ...(targetCat ? [targetCat._id, targetCat.slug?.toLowerCase(), targetCat.name?.toLowerCase()] : [])
        ].filter(Boolean);

        const pCat = p.category;
        const matchesCategory =
          // Direct string match
          (typeof pCat === "string" && (
            validMatchTokens.includes(pCat) ||
            validMatchTokens.includes(pCat.toLowerCase()) ||
            pCat.toLowerCase().includes(catQuery)
          )) ||
          // Populated object match
          (typeof pCat === "object" && pCat !== null && (
            validMatchTokens.includes(pCat._id) ||
            (pCat.slug && validMatchTokens.includes(pCat.slug.toLowerCase())) ||
            (pCat.name && validMatchTokens.includes(pCat.name.toLowerCase())) ||
            (pCat.name && pCat.name.toLowerCase().includes(catQuery))
          )) ||
          // Tags or fabric fallback matching
          (p.tags && p.tags.some((t) => validMatchTokens.includes(t.toLowerCase()))) ||
          (p.fabric && p.fabric.toLowerCase().includes(catQuery));

        if (!matchesCategory) return false;
      }

      // Fabric
      if (selectedFabric) {
        if (!p.fabric?.toLowerCase().includes(selectedFabric.toLowerCase()) && !p.tags?.includes(selectedFabric.toLowerCase())) {
          return false;
        }
      }

      // Stitching
      if (selectedStitching) {
        if (p.stitching !== selectedStitching && !p.stitching?.toLowerCase().includes(selectedStitching.toLowerCase())) {
          return false;
        }
      }

      // Size
      if (selectedSize) {
        if (!p.sizes?.includes(selectedSize)) return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.discountPrice || a.price;
      const priceB = b.discountPrice || b.price;
      if (sortBy === "price-low") return priceA - priceB;
      if (sortBy === "price-high") return priceB - priceA;
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      return 0; // featured
    });
  }, [allProducts, search, selectedCategory, selectedFabric, selectedStitching, selectedSize, sortBy]);

  const clearAllFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedFabric("");
    setSelectedStitching("");
    setSelectedSize("");
    setSortBy("featured");
    setSearchParams({});
  };

  return (
    <div className="bg-[#fafaf8] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Horizontal Category Navigation Tabs / Pills Bar ── */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#78786a]">
              Explore Collections & Edits
            </h2>
            {selectedCategory && (
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setSearchParams({});
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
              >
                Show All Collections <X size={12} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {/* All Collections Pill */}
            <button
              onClick={() => {
                setSelectedCategory("");
                setSearchParams({});
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                !selectedCategory
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50"
              }`}
            >
              All Collections ({allProducts.length})
            </button>

            {/* Individual Category Pills */}
            {categories.map((cat) => {
              const catId = cat._id || cat.slug;
              const isSelected = selectedCategory === cat._id || selectedCategory === cat.slug || selectedCategory === cat.name;
              const count = allProducts.filter((p) =>
                p.category?._id === cat._id || p.category?.slug === cat.slug || p.category?.name === cat.name
              ).length;

              return (
                <button
                  key={cat._id || cat.name}
                  onClick={() => {
                    const nextCat = isSelected ? "" : (cat._id || cat.slug);
                    setSelectedCategory(nextCat);
                    if (nextCat) setSearchParams({ category: nextCat });
                    else setSearchParams({});
                  }}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-200"
                      : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Main Layout: Sidebar Filters + Products Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

          {/* ── Left Sidebar Filters (Desktop + Mobile Modal) ── */}
          <aside
            className={`lg:block ${
              showFilters
                ? "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 flex justify-end"
                : "hidden"
            }`}
          >
            <div className={`bg-white lg:bg-transparent lg:border-0 border border-[#e8e8e0] p-6 lg:p-0 rounded-xl lg:rounded-none w-full max-w-xs lg:max-w-none h-full lg:h-auto overflow-y-auto ${
              showFilters ? "shadow-2xl" : ""
            }`}>
              {/* Header on mobile */}
              <div className="flex items-center justify-between lg:hidden mb-6 pb-3 border-b border-gray-100">
                <span className="font-bold text-sm uppercase tracking-wider">Refine By</span>
                <button onClick={() => setShowFilters(false)} className="p-1">
                  <X size={18} />
                </button>
              </div>

              {/* Search in sidebar */}
              <div className="mb-6">
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-[#78786a] mb-2">
                  Search Styles
                </label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a898]" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="E.g. Kurta, Lilac, Lawn..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#e8e8e0] rounded text-xs outline-none focus:border-black"
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6 pb-6 border-b border-[#e8e8e0]">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#141410] mb-3">
                  Category
                </h3>
                <div className="space-y-1.5 text-xs">
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={`w-full text-left py-1.5 px-2 rounded transition-colors flex items-center justify-between ${
                      !selectedCategory ? "bg-[#141410] text-white font-bold" : "text-[#78786a] hover:text-black hover:bg-gray-100"
                    }`}
                  >
                    <span>All Categories</span>
                    <span>{allProducts.length}</span>
                  </button>
                  {categories.map((c) => {
                    const count = allProducts.filter((p) => p.category?._id === c._id || p.category?.name === c.name).length;
                    return (
                      <button
                        key={c._id}
                        onClick={() => setSelectedCategory(selectedCategory === c._id ? "" : c._id)}
                        className={`w-full text-left py-1.5 px-2 rounded transition-colors flex items-center justify-between ${
                          selectedCategory === c._id ? "bg-[#141410] text-white font-bold" : "text-[#78786a] hover:text-black hover:bg-gray-100"
                        }`}
                      >
                        <span>{c.name}</span>
                        <span className="text-[10px] opacity-75">{count || 5}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fabric Type */}
              <div className="mb-6 pb-6 border-b border-[#e8e8e0]">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#141410] mb-3">
                  Fabric
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {FABRICS_LIST.map((fab) => (
                    <button
                      key={fab.tag}
                      onClick={() => setSelectedFabric(selectedFabric === fab.tag ? "" : fab.tag)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        selectedFabric === fab.tag
                          ? "bg-[#141410] text-white border-black font-bold"
                          : "border-[#e8e8e0] text-[#78786a] hover:border-black bg-white"
                      }`}
                    >
                      {fab.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stitching Type */}
              <div className="mb-6 pb-6 border-b border-[#e8e8e0]">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#141410] mb-3">
                  Stitching
                </h3>
                <div className="space-y-1.5 text-xs">
                  {["Stitched", "Unstitched"].map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2.5 py-1 text-[#555] cursor-pointer hover:text-black"
                    >
                      <input
                        type="radio"
                        name="stitching"
                        checked={selectedStitching === type}
                        onChange={() => setSelectedStitching(selectedStitching === type ? "" : type)}
                        className="accent-black"
                      />
                      <span>{type === "Stitched" ? "Ready to Wear (Stitched)" : "Unstitched Fabric Piece"}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              <div className="mb-6 pb-6 border-b border-[#e8e8e0]">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#141410] mb-3">
                  Size
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["XS", "S", "M", "L", "XL"].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(selectedSize === sz ? "" : sz)}
                      className={`w-9 h-9 rounded text-xs font-bold border transition-colors ${
                        selectedSize === sz
                          ? "bg-[#141410] text-white border-black"
                          : "bg-white border-[#e8e8e0] text-[#141410] hover:border-black"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear All Filters Button */}
              {(selectedCategory || selectedFabric || selectedStitching || selectedSize || search) && (
                <button
                  onClick={clearAllFilters}
                  className="w-full py-2.5 bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-wider rounded border border-rose-200 hover:bg-rose-100 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>

          {/* ── Right Products Grid ── */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="bg-white border border-[#e8e8e0] p-12 text-center rounded-sm">
                <div className="w-16 h-16 rounded-full bg-[#f5f5f0] flex items-center justify-center mx-auto mb-4 text-[#8e8e7e]">
                  <Search size={28} />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#141410] mb-2">No matching outfits found</h3>
                <p className="text-xs text-[#78786a] max-w-sm mx-auto mb-6">
                  Try clearing some filter criteria or searching for general fabrics like "Lawn", "Cambric", or "Silk".
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 bg-[#141410] text-white text-xs font-bold uppercase tracking-widest rounded"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product, idx) => (
                  <ProductCard key={product._id || idx} product={product} index={idx} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}