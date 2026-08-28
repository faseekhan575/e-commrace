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

  // Combine products
  const allProducts = useMemo(() => {
    if (serverProducts && serverProducts.length > 0) {
      return serverProducts.map((p, idx) => ({
        ...p,
        fabric: p.fabric || CLOTHING_PRODUCTS[idx % CLOTHING_PRODUCTS.length].fabric,
        sizes: p.sizes || ["XS", "S", "M", "L", "XL"],
        images: p.images && p.images.length > 0 ? p.images : CLOTHING_PRODUCTS[idx % CLOTHING_PRODUCTS.length].images,
      }));
    }
    return CLOTHING_PRODUCTS;
  }, [serverProducts]);

  const categories = (serverCategories && serverCategories.length > 0)
    ? serverCategories
    : CLOTHING_CATEGORIES;

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

      // Category
      if (selectedCategory) {
        if (p.category?._id !== selectedCategory && p.category?.slug !== selectedCategory && !p.category?.name?.toLowerCase().includes(selectedCategory.toLowerCase())) {
          return false;
        }
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

        {/* ── Page Title & Breadcrumb ── */}
        <div className="border-b border-[#e8e8e0] pb-6 mb-8">
          <p className="text-xs text-[#78786a] uppercase tracking-[0.2em] mb-1.5">
            <Link to="/" className="hover:text-black">Home</Link> / <span className="text-[#1a1a14] font-bold">Women & Eastern Couture</span>
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141410] tracking-tight">
                {selectedCategory
                  ? categories.find((c) => c._id === selectedCategory || c.slug === selectedCategory)?.name || "Clothing Collection"
                  : "All Apparel & Collections"}
              </h1>
              <p className="text-xs text-[#78786a] mt-1">
                Showing {filteredProducts.length} curated luxury designs
              </p>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-[#e8e8e0] text-xs font-bold uppercase tracking-wider rounded"
              >
                <SlidersHorizontal size={14} /> Filters
              </button>

              <div className="flex items-center gap-2 bg-white border border-[#e8e8e0] rounded px-3 py-2">
                <ArrowUpDown size={14} className="text-[#78786a]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-[#141410] outline-none cursor-pointer"
                >
                  <option value="featured">Featured / Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
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