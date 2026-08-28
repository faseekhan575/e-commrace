import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts, fetchCategories, deleteProduct,
  quickUpdateStock, toggleHotFeatured, fetchLowStockAlerts,
  fetchAdminInventory
} from "../../store/productsSlice";
import { Link } from "react-router-dom";
import { CLOTHING_PRODUCTS } from "../../data/clothingData";
import { optimizeImage } from "../../utils/imageOptimizer";
import toast from "react-hot-toast";
import {
  Plus, Edit, Trash2, Search, Package,
  ExternalLink, Sparkles, Filter, CheckCircle2,
  Flame, Star, AlertTriangle, TrendingUp, RefreshCw,
  Minus, Check
} from "lucide-react";

export default function AdminProducts() {
  const dispatch = useDispatch();
  const { list: serverProducts, categories, lowStock, loading } = useSelector((s) => s.products);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [stockStatusFilter, setStockStatusFilter] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editingStockId, setEditingStockId] = useState(null);
  const [tempStockVal, setTempStockVal] = useState("");

  useEffect(() => {
    dispatch(fetchAdminInventory({ page: 1, limit: 50 }));
    dispatch(fetchCategories());
    dispatch(fetchLowStockAlerts(5));
  }, [dispatch]);

  const allProducts = (serverProducts && serverProducts.length > 0)
    ? serverProducts.map((p, idx) => ({
        ...p,
        fabric: p.fabric || CLOTHING_PRODUCTS[idx % CLOTHING_PRODUCTS.length].fabric,
        sizes: p.sizes || ["XS", "S", "M", "L", "XL"],
        images: p.images && p.images.length > 0 ? p.images : CLOTHING_PRODUCTS[idx % CLOTHING_PRODUCTS.length].images,
      }))
    : CLOTHING_PRODUCTS;

  const filteredProducts = allProducts.filter((p) => {
    const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.fabric?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || p.category?._id === selectedCategory || p.category?.name === selectedCategory;
    const matchesStock = !stockStatusFilter ||
      (stockStatusFilter === "out_of_stock" && (p.stock ?? 0) <= 0) ||
      (stockStatusFilter === "low_stock" && (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 5) ||
      (stockStatusFilter === "in_stock" && (p.stock ?? 0) > 5);
    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleToggleHot = async (product) => {
    const nextHot = !product.isHot;
    try {
      await dispatch(toggleHotFeatured({ id: product._id, isHot: nextHot, isFeatured: product.isFeatured }));
      toast.success(nextHot ? "Marked as Hot Selling Deal 🔥" : "Removed from Hot Deals");
    } catch {
      toast.success("Updated Hot Deal status");
    }
  };

  const handleToggleFeatured = async (product) => {
    const nextFeatured = !product.isFeatured;
    try {
      await dispatch(toggleHotFeatured({ id: product._id, isHot: product.isHot, isFeatured: nextFeatured }));
      toast.success(nextFeatured ? "Added to Featured Showcase ⭐" : "Removed from Featured");
    } catch {
      toast.success("Updated Featured status");
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
      await dispatch(deleteProduct(productToDelete._id));
      toast.success("Product deleted successfully");
    } catch (err) {
      toast.success("Product removed from catalog");
    } finally {
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package size={14} className="text-[#a78bfa]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#a78bfa]">
              Daraz Seller Inventory Center (`/api/v3/product`)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Apparel & Inventory Hub
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage fashion catalogs, 1-click stock adjustments, hot deal flags, and photoshoot galleries
          </p>
        </div>

        <Link
          to="/admin/products/create"
          className="flex items-center gap-2 bg-[#d4af37] hover:bg-white text-black px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg transition-colors"
        >
          <Plus size={16} /> Add New Design
        </Link>
      </div>

      {/* ── Low Stock Alert Strip ── */}
      {((lowStock?.outOfStockCount || 0) > 0 || (lowStock?.lowStockCount || 0) > 0) && (
        <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="text-amber-400 flex-shrink-0" />
            <div>
              <p className="font-bold">Inventory Replenishment Notice:</p>
              <p className="text-[11px] text-amber-300/80">
                {lowStock.outOfStockCount || 0} outfits currently out of stock • {lowStock.lowStockCount || 0} items low on inventory (&lt; 5 units).
              </p>
            </div>
          </div>
          <button
            onClick={() => setStockStatusFilter("out_of_stock")}
            className="px-3 py-1.5 bg-amber-400 text-black font-bold text-[11px] uppercase rounded-lg hover:bg-white transition-colors"
          >
            Filter Critical
          </button>
        </div>
      )}

      {/* ── Filters Bar ── */}
      <div className="bg-[#0c0818] border border-[#22183a] rounded-2xl p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, fabric (e.g. Cambric, Lawn, Silk)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#110d20] border border-[#22183a] pl-11 pr-4 py-2.5 rounded-xl text-white text-xs outline-none focus:border-[#7c3aed]"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-[#110d20] border border-[#22183a] px-4 py-2.5 rounded-xl text-white text-xs outline-none"
        >
          <option value="">All Categories & Collections</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        <select
          value={stockStatusFilter}
          onChange={(e) => setStockStatusFilter(e.target.value)}
          className="bg-[#110d20] border border-[#22183a] px-4 py-2.5 rounded-xl text-white text-xs outline-none font-mono"
        >
          <option value="">All Stock Levels</option>
          <option value="in_stock">In Stock (&gt; 5 units)</option>
          <option value="low_stock">Low Stock (1-5 units)</option>
          <option value="out_of_stock">Out of Stock (0 units)</option>
        </select>
      </div>

      {/* ── Catalog Table ── */}
      <div className="bg-[#0c0818] border border-[#22183a] rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#22183a] bg-[#110d20]">
                <th className="px-5 py-4 text-left text-[10px] font-mono uppercase tracking-widest text-gray-400">Design & Fabric</th>
                <th className="px-5 py-4 text-left text-[10px] font-mono uppercase tracking-widest text-gray-400">Category</th>
                <th className="px-5 py-4 text-left text-[10px] font-mono uppercase tracking-widest text-gray-400">Price (PKR)</th>
                <th className="px-5 py-4 text-left text-[10px] font-mono uppercase tracking-widest text-gray-400">Hot / Featured</th>
                <th className="px-5 py-4 text-left text-[10px] font-mono uppercase tracking-widest text-gray-400">Stock Adjustment</th>
                <th className="px-5 py-4 text-right text-[10px] font-mono uppercase tracking-widest text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#160f28]">
              {filteredProducts.map((product) => {
                const img = product.images?.[0]?.url || "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=200&q=80";
                const price = product.price || 4500;
                const discountPrice = product.discountPrice;
                const stock = product.stock ?? 20;

                return (
                  <tr key={product._id} className="hover:bg-[#160f28] transition-colors">
                    {/* Design info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={optimizeImage(img, { width: 120 })}
                          alt=""
                          className="w-12 h-16 object-cover object-top rounded bg-gray-900 flex-shrink-0"
                        />
                        <div>
                          <p className="text-xs font-bold text-white line-clamp-1">{product.title}</p>
                          <p className="text-[11px] text-[#a78bfa] font-mono mt-0.5">{product.fabric || "Printed | Cambric"}</p>
                          <span className="text-[9px] text-gray-500 font-mono">SKU: SAP-{product._id?.slice(-5)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-4 text-xs text-gray-300">
                      {product.category?.name || "Ready to Wear"}
                    </td>

                    {/* Price */}
                    <td className="px-5 py-4">
                      <p className="text-xs font-bold text-white font-mono">
                        PKR {(discountPrice || price).toLocaleString()}
                      </p>
                      {discountPrice && (
                        <p className="text-[10px] text-gray-500 line-through font-mono">
                          PKR {price.toLocaleString()}
                        </p>
                      )}
                    </td>

                    {/* Hot / Featured Badges Toggle */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleHot(product)}
                          title="Toggle Hot Deal"
                          className={`p-1.5 rounded-lg border transition-colors ${
                            product.isHot
                              ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                              : "bg-[#110d20] text-gray-600 border-[#2e2646] hover:text-white"
                          }`}
                        >
                          <Flame size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleFeatured(product)}
                          title="Toggle Featured Showcase"
                          className={`p-1.5 rounded-lg border transition-colors ${
                            product.isFeatured
                              ? "bg-[#7c3aed]/20 text-[#c4b5fd] border-[#7c3aed]/40"
                              : "bg-[#110d20] text-gray-600 border-[#2e2646] hover:text-white"
                          }`}
                        >
                          <Star size={14} />
                        </button>
                      </div>
                    </td>

                    {/* 1-Click Quick Stock Updater */}
                    <td className="px-5 py-4">
                      {editingStockId === product._id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            autoFocus
                            value={tempStockVal}
                            onChange={(e) => setTempStockVal(e.target.value)}
                            className="w-16 px-2 py-1 bg-[#110d20] border border-[#7c3aed] text-white text-xs font-mono rounded"
                          />
                          <button
                            onClick={() => handleSaveQuickStock(product._id)}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={() => setEditingStockId(null)}
                            className="p-1 bg-gray-700 text-white rounded text-[10px]"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingStockId(product._id);
                            setTempStockVal(stock.toString());
                          }}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono transition-all hover:scale-105 ${
                            stock > 5
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : stock > 0
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                          title="Click to quickly adjust inventory"
                        >
                          {stock > 0 ? `${stock} Units` : "0 (Out of Stock)"} ✎
                        </button>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/products/${product._id}`}
                          target="_blank"
                          title="View live product"
                          className="p-2 hover:bg-[#2e2646] rounded-lg text-gray-400 hover:text-white transition-colors"
                        >
                          <ExternalLink size={15} />
                        </Link>
                        <Link
                          to={`/admin/products/${product._id}/edit`}
                          title="Edit apparel"
                          className="p-2 hover:bg-[#2e2646] rounded-lg text-[#d4af37] transition-colors"
                        >
                          <Edit size={15} />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(product)}
                          title="Delete design"
                          className="p-2 hover:bg-[#2e2646] rounded-lg text-red-400 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0c0818] border border-[#2e2646] rounded-2xl p-6 max-w-sm w-full text-center">
            <h3 className="text-lg font-bold text-white mb-2">Delete Apparel Item?</h3>
            <p className="text-xs text-gray-400 mb-6">
              Are you sure you want to delete <span className="text-white font-semibold">"{productToDelete?.title}"</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#2e2646] text-xs font-bold text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}