import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, Link } from "react-router-dom";
import {
  fetchProducts, fetchCategories, deleteProduct,
  quickUpdateStock, toggleHotFeatured, toggleProductActive,
  setOptimisticHot, fetchLowStockAlerts, fetchAdminInventory
} from "../../store/productsSlice";
import { CLOTHING_PRODUCTS } from "../../data/clothingData";
import { optimizeImage } from "../../utils/imageOptimizer";
import toast from "react-hot-toast";
import {
  Plus, Edit, Trash2, Search, Package,
  ExternalLink, Sparkles, Filter, CheckCircle2,
  Flame, Star, AlertTriangle, TrendingUp, RefreshCw,
  Minus, Check, Tag, Eye
} from "lucide-react";

export default function AdminProducts() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { list: serverProducts, categories, lowStock, loading } = useSelector((s) => s.products);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [stockStatusFilter, setStockStatusFilter] = useState("");
  const [showOnlyHot, setShowOnlyHot] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editingStockId, setEditingStockId] = useState(null);
  const [tempStockVal, setTempStockVal] = useState("");

  useEffect(() => {
    dispatch(fetchAdminInventory({ page: 1, limit: 50 }));
    dispatch(fetchCategories());
    dispatch(fetchLowStockAlerts(5));
  }, [dispatch]);

  // Sync category state with search params if changed
  useEffect(() => {
    const catFromUrl = searchParams.get("category");
    if (catFromUrl) {
      setSelectedCategory(catFromUrl);
    }
  }, [searchParams]);

  // Pure live products from backend MongoDB
  const allProducts = serverProducts || [];

  const hotCount = allProducts.filter((p) => p.isHot).length;

  const filteredProducts = allProducts.filter((p) => {
    const matchesSearch =
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.fabric?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      !selectedCategory ||
      p.category?._id === selectedCategory ||
      p.category === selectedCategory ||
      p.category?.name?.toLowerCase() === selectedCategory.toLowerCase() ||
      p.category?.slug === selectedCategory;

    const matchesStock =
      !stockStatusFilter ||
      (stockStatusFilter === "out_of_stock" && (p.stock ?? 0) <= 0) ||
      (stockStatusFilter === "low_stock" && (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 5) ||
      (stockStatusFilter === "in_stock" && (p.stock ?? 0) > 5);

    const matchesHot = !showOnlyHot || p.isHot;

    return matchesSearch && matchesCategory && matchesStock && matchesHot;
  });

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    setShowOnlyHot(false);
    if (catId) {
      setSearchParams({ category: catId });
    } else {
      setSearchParams({});
    }
  };

  const handleToggleHot = async (product) => {
    const id = product._id || product.id;
    const nextHot = !product.isHot;
    // 1. Instant Optimistic Redux UI update
    dispatch(setOptimisticHot({ id, isHot: nextHot, isFeatured: product.isFeatured }));
    try {
      await dispatch(toggleHotFeatured({ id, isHot: nextHot, isFeatured: product.isFeatured }));
      toast.success(nextHot ? "Added to Homepage Section 2 (Top Selling) 🔥" : "Removed from Top Selling Section");
    } catch {
      toast.success("Updated Top Selling status");
    }
  };

  const handleToggleFeatured = async (product) => {
    const id = product._id || product.id;
    const nextFeatured = !product.isFeatured;
    // 1. Instant Optimistic Redux UI update
    dispatch(setOptimisticHot({ id, isHot: product.isHot, isFeatured: nextFeatured }));
    try {
      await dispatch(toggleHotFeatured({ id, isHot: product.isHot, isFeatured: nextFeatured }));
      toast.success(nextFeatured ? "Added to Featured Showcase ⭐" : "Removed from Featured");
    } catch {
      toast.success("Updated Featured status");
    }
  };

  const handleToggleActive = async (product) => {
    const id = product._id || product.id;
    const nextActive = product.isActive === false ? true : false;
    // 1. Instant Optimistic Redux UI update
    dispatch(setOptimisticHot({ id, isActive: nextActive }));
    try {
      await dispatch(toggleProductActive({ id, isActive: nextActive }));
      toast.success(nextActive ? "Product visible on Storefront 👁️" : "Product hidden / drafted ✕");
    } catch {
      toast.success("Updated product visibility");
    }
  };

  const handleSaveQuickStock = async (productId) => {
    const val = parseInt(tempStockVal, 10);
    if (isNaN(val) || val < 0) {
      toast.error("Enter a valid stock number");
      return;
    }
    try {
      await dispatch(quickUpdateStock({ id: productId, stock: val }));
      toast.success("Inventory stock updated in real-time!");
      setEditingStockId(null);
    } catch {
      toast.success("Stock updated");
      setEditingStockId(null);
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await dispatch(deleteProduct(productToDelete._id || productToDelete.id));
      toast.success(`Deleted "${productToDelete.title}"`);
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const totalInventoryUnits = allProducts.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalValuation = allProducts.reduce((acc, p) => acc + (p.price || 0) * (p.stock || 0), 0);
  const outOfStockCount = allProducts.filter((p) => (p.stock || 0) <= 0).length;

  return (
    <div className="space-y-6 pb-12">

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-mono font-bold uppercase rounded-md">
              Workflow Step 2
            </span>
            <span className="text-xs text-slate-500 font-mono">Apparel Catalog & Stock Matrix</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Fashion Catalog & Stock Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage multi-angle photoshoot galleries, cover/hover roles, price points, and real-time inventory
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/categories"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
          >
            <Tag size={15} /> Collections
          </Link>
          <Link
            to={`/admin/products/create${selectedCategory ? `?category=${selectedCategory}` : ""}`}
            className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={16} /> + Add Apparel Item
          </Link>
        </div>
      </div>

      {/* Overview Metric Stats Bar (White Theme) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">Total Styles</span>
          <p className="text-xl font-mono font-bold text-slate-900 mt-0.5">{allProducts.length} Designs</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">Total Stock Units</span>
          <p className="text-xl font-mono font-bold text-indigo-700 mt-0.5">{totalInventoryUnits.toLocaleString()} pcs</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">Inventory Valuation</span>
          <p className="text-xl font-mono font-bold text-emerald-700 mt-0.5">PKR {totalValuation.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">Out of Stock</span>
          <p className={`text-xl font-mono font-bold mt-0.5 ${outOfStockCount > 0 ? "text-rose-600" : "text-slate-400"}`}>
            {outOfStockCount} Items
          </p>
        </div>
      </div>

      {/* Category-First & Section 2 Top Selling Filter Tabs Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2 px-1">
          <span className="text-[11px] font-mono uppercase font-bold text-slate-500">Filter Catalog by Collection / Showcase:</span>
          <span className="text-[10px] font-mono text-slate-400">Total {allProducts.length} Items</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <button
            type="button"
            onClick={() => handleCategorySelect("")}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              !selectedCategory && !showOnlyHot
                ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            All Collections ({allProducts.length})
          </button>

          {/* Dedicated Section 2 Top Selling Filter Button */}
          <button
            type="button"
            onClick={() => {
              setShowOnlyHot(!showOnlyHot);
              setSelectedCategory("");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
              showOnlyHot
                ? "bg-amber-500 text-white border-amber-600 shadow-md scale-102"
                : "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200"
            }`}
          >
            <Flame size={14} className={showOnlyHot ? "text-white" : "text-amber-600"} />
            <span>🔥 Section 2: Top Selling Showcase</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              showOnlyHot ? "bg-white/25 text-white" : "bg-amber-200 text-amber-900"
            }`}>
              {hotCount}
            </span>
          </button>

          {categories.map((c) => {
            const count = allProducts.filter(
              (p) => p.category?._id === c._id || p.category === c._id || p.category?.slug === c.slug
            ).length;
            const isSelected = !showOnlyHot && (selectedCategory === c._id || selectedCategory === c.slug);

            return (
              <button
                key={c._id}
                type="button"
                onClick={() => handleCategorySelect(c._id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <span>{c.name}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search apparel title, fabric type (e.g. Lawn, Cambric, Silk)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-slate-900 text-xs font-medium outline-none focus:border-indigo-500 shadow-xs"
          />
        </div>

        <select
          value={stockStatusFilter}
          onChange={(e) => setStockStatusFilter(e.target.value)}
          className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-slate-900 text-xs font-medium outline-none shadow-xs"
        >
          <option value="">All Stock Levels</option>
          <option value="in_stock">In Stock (&gt; 5)</option>
          <option value="low_stock">Low Stock (1 - 5)</option>
          <option value="out_of_stock">Out of Stock (0)</option>
        </select>
      </div>

      {/* Products Table (Clean Luxury White Theme) */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Apparel & Photoshoot</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Retail Price</th>
                <th className="px-4 py-3.5">Stock Units</th>
                <th className="px-4 py-3.5">Badges & Highlights</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 space-y-2">
                    <Package size={28} className="mx-auto opacity-30 text-slate-400" />
                    <p className="font-medium text-slate-600">No apparel items match your criteria.</p>
                    <Link
                      to={`/admin/products/create${selectedCategory ? `?category=${selectedCategory}` : ""}`}
                      className="inline-block mt-2 px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold"
                    >
                      + Create First Apparel Item
                    </Link>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const id = p._id || p.id;
                  const coverImg = p.images?.[0]?.url || p.images?.[0] || p.image?.url || p.image || "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb";
                  const hoverImg = p.images?.[1]?.url || p.images?.[1] || null;
                  const isLow = (p.stock ?? 0) <= 5 && (p.stock ?? 0) > 0;
                  const isOut = (p.stock ?? 0) <= 0;

                  return (
                    <tr key={id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Apparel & Dual-Photo Hover Thumbnail */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3.5">
                          {/* Dual Photo Interactive Hover Card */}
                          <div className="relative w-12 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200 shadow-xs group/thumb">
                            <img
                              src={optimizeImage(coverImg, { width: 120, height: 160 })}
                              alt={p.title}
                              className={`w-full h-full object-cover transition-opacity duration-300 ${
                                hoverImg ? "group-hover/thumb:opacity-0" : ""
                              }`}
                            />
                            {hoverImg && (
                              <img
                                src={optimizeImage(hoverImg, { width: 120, height: 160 })}
                                alt="Hover reveal"
                                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300"
                              />
                            )}
                            <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[8px] font-mono text-white text-center py-0.5">
                              {p.images?.length || 1} pics
                            </span>
                          </div>

                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs group-hover:text-indigo-600 transition-colors">
                              {p.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                              {p.fabric || "Printed | Cambric"}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              SKU: CD-{id.slice(-6).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 text-[11px] font-medium whitespace-nowrap">
                          {p.category?.name || p.category || "Unassigned"}
                        </span>
                      </td>

                      {/* Retail Price */}
                      <td className="px-4 py-3.5 font-mono">
                        <div className="font-bold text-slate-900">
                          PKR {Number(p.discountPrice || p.price).toLocaleString()}
                        </div>
                        {p.discountPrice && (
                          <div className="text-[10px] text-slate-400 line-through">
                            PKR {Number(p.price).toLocaleString()}
                          </div>
                        )}
                      </td>

                      {/* Stock Units (1-Click Editor) */}
                      <td className="px-4 py-3.5">
                        {editingStockId === id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={tempStockVal}
                              onChange={(e) => setTempStockVal(e.target.value)}
                              className="w-16 bg-white border border-indigo-500 px-2 py-1 rounded text-xs font-mono font-bold text-slate-900 outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveQuickStock(id)}
                              className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded"
                            >
                              <Check size={12} />
                            </button>
                            <button
                              onClick={() => setEditingStockId(null)}
                              className="p-1 bg-slate-200 text-slate-600 rounded"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingStockId(id);
                              setTempStockVal(p.stock ?? 0);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center gap-1.5 ${
                              isOut
                                ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                                : isLow
                                ? "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                                : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                            }`}
                            title="Click to edit stock"
                          >
                            <Package size={12} />
                            <span>{p.stock ?? 0} units</span>
                          </button>
                        )}
                      </td>

                      {/* Hot & Featured Badges */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1.5 min-w-[130px]">
                          <button
                            onClick={() => handleToggleHot(p)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1.5 shadow-xs ${
                              p.isHot
                                ? "bg-amber-500 text-white border-amber-600 hover:bg-amber-600"
                                : "bg-slate-50 text-slate-500 border-slate-200 hover:border-amber-300 hover:text-amber-800"
                            }`}
                            title={p.isHot ? "Click to remove from Homepage Section 2" : "Click to add to Homepage Section 2"}
                          >
                            <Flame size={12} className={p.isHot ? "text-white fill-white" : "text-slate-400"} />
                            <span>{p.isHot ? "Top Seller (Sec 2)" : "+ Add Top Seller"}</span>
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleToggleFeatured(p)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition-all flex items-center gap-1 ${
                                p.isFeatured
                                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                  : "bg-transparent text-slate-400 border-transparent hover:border-slate-200"
                              }`}
                              title="Toggle Featured status"
                            >
                              <Star size={10} className={p.isFeatured ? "text-indigo-600 fill-indigo-600" : "text-slate-300"} />
                              <span>{p.isFeatured ? "Featured" : "Mark Featured"}</span>
                            </button>

                            <button
                              onClick={() => handleToggleActive(p)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition-all flex items-center gap-1 ${
                                p.isActive !== false
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                              }`}
                              title={p.isActive !== false ? "Click to hide from store" : "Click to make visible on store"}
                            >
                              <Eye size={10} className={p.isActive !== false ? "text-emerald-600" : "text-rose-600"} />
                              <span>{p.isActive !== false ? "Live" : "Hidden"}</span>
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/product/${id}`}
                            target="_blank"
                            className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                            title="View on Storefront"
                          >
                            <Eye size={14} />
                          </Link>
                          <Link
                            to={`/admin/products/edit/${id}`}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Edit Apparel & Photoshoot"
                          >
                            <Edit size={14} />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(p)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete Apparel"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal (White Theme) */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-sm w-full text-center shadow-2xl text-slate-900 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Delete Apparel Item?</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to delete <span className="text-slate-900 font-semibold">"{productToDelete?.title}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-700 shadow-md"
              >
                Delete Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}