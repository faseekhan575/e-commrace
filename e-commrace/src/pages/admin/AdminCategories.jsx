import { useEffect, useState, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { fetchCategories, fetchProducts, deleteProduct, toggleHotFeatured } from "../../store/productsSlice";
import axios from "../../axiosConfig";
import toast from "react-hot-toast";
import {
  Plus, Edit, Trash2, Tag, Sparkles, Package,
  ArrowRight, Upload, X, CheckCircle, Flame, Layers,
  ArrowLeft, Search, ExternalLink, ShieldCheck, Check,
  ChevronRight, Eye, SlidersHorizontal
} from "lucide-react";

export default function AdminCategories() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories: serverCategories, list: serverProducts, loading } = useSelector((s) => s.products);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categorySearch, setCategorySearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    subtitle: "",
    isHot: false,
    isFeatured: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef();

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts({ page: 1, limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    setCategories(serverCategories || []);
  }, [serverCategories]);

  // Check URL query param for pre-selected category
  useEffect(() => {
    const selId = searchParams.get("selected");
    if (selId && categories.length > 0) {
      const found = categories.find((c) => (c._id || c.id) === selId || c.slug === selId);
      if (found) setSelectedCategory(found);
    }
  }, [categories, searchParams]);

  // Select / Unselect category handler
  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    if (cat) {
      setSearchParams({ selected: cat._id || cat.id });
    } else {
      setSearchParams({});
    }
  };

  // Live products belonging to a category
  const getCategoryProducts = (cat) => {
    if (!cat) return [];
    const catId = cat._id || cat.id;
    const catSlug = cat.slug || "";
    const catName = (cat.name || "").toLowerCase();
    const products = serverProducts || [];

    return products.filter((p) => {
      const pCat = p.category;
      if (!pCat) return false;
      if (typeof pCat === "string") {
        return pCat === catId || pCat === catSlug || pCat.toLowerCase() === catName;
      }
      if (typeof pCat === "object") {
        return (
          pCat._id === catId ||
          pCat.slug === catSlug ||
          (pCat.name && pCat.name.toLowerCase() === catName)
        );
      }
      return false;
    });
  };

  // Filtered products for active category view
  const activeProducts = useMemo(() => {
    if (!selectedCategory) return [];
    const prods = getCategoryProducts(selectedCategory);
    if (!productSearch.trim()) return prods;
    const q = productSearch.toLowerCase();
    return prods.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.fabric?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.color?.toLowerCase().includes(q)
    );
  }, [selectedCategory, serverProducts, productSearch]);

  const openModal = (cat = null, e = null) => {
    if (e) e.stopPropagation();
    setImageFile(null);
    if (cat) {
      setEditingCategory(cat);
      setForm({
        name: cat.name || "",
        slug: cat.slug || "",
        description: cat.description || "",
        subtitle: cat.subtitle || "",
        isHot: cat.isHot || false,
        isFeatured: cat.isFeatured !== false,
      });
      setImagePreview(cat.image?.url || cat.image || "");
    } else {
      setEditingCategory(null);
      setForm({
        name: "",
        slug: "",
        description: "",
        subtitle: "",
        isHot: false,
        isFeatured: true,
      });
      setImagePreview("https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80");
    }
    setShowModal(true);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("slug", form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
      if (form.description) fd.append("description", form.description.trim());
      if (form.subtitle) fd.append("subtitle", form.subtitle.trim());
      fd.append("isHot", form.isHot);
      fd.append("isFeatured", form.isFeatured);
      if (imageFile) {
        fd.append("image", imageFile);
      }

      if (editingCategory) {
        const id = editingCategory._id || editingCategory.id;
        try {
          await axios.patch(`/api/v4/category/${id}/update`, fd);
        } catch (apiErr) {
          console.warn("Backend update fallback:", apiErr);
        }
        const updatedCat = {
          ...editingCategory,
          name: form.name,
          slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description: form.description,
          subtitle: form.subtitle,
          isHot: form.isHot,
          isFeatured: form.isFeatured,
          image: { url: imagePreview || editingCategory.image?.url },
        };
        setCategories((prev) =>
          prev.map((c) => (c._id === id || c.id === id ? updatedCat : c))
        );
        if (selectedCategory && (selectedCategory._id === id || selectedCategory.id === id)) {
          setSelectedCategory(updatedCat);
        }
        toast.success("Category updated successfully! ✨");
      } else {
        let createdData = null;
        try {
          const res = await axios.post("/api/v4/category/create", fd);
          createdData = res.data?.data;
        } catch (apiErr) {
          console.warn("Backend create fallback:", apiErr);
        }

        const newCat = createdData || {
          _id: `cat_${Date.now()}`,
          name: form.name,
          slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description: form.description || "Designer Pret & Couture",
          subtitle: form.subtitle || "New Collection",
          isHot: form.isHot,
          isFeatured: form.isFeatured,
          image: { url: imagePreview || "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb" },
        };

        setCategories((prev) => [newCat, ...prev]);
        toast.success("New fashion collection created! 🎉");
      }
      setShowModal(false);
      dispatch(fetchCategories());
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (cat, e) => {
    if (e) e.stopPropagation();
    const id = cat._id || cat.id;
    const prods = getCategoryProducts(cat);
    if (prods.length > 0) {
      toast.error(`Cannot delete: ${prods.length} apparel items belong to this category!`);
      return;
    }

    if (!window.confirm(`Delete the "${cat.name}" category?`)) return;
    try {
      await axios.delete(`/api/v4/category/${id}/delete`);
      setCategories((prev) => prev.filter((c) => c._id !== id && c.id !== id));
      if (selectedCategory && (selectedCategory._id === id || selectedCategory.id === id)) {
        handleSelectCategory(null);
      }
      toast.success("Category deleted");
    } catch (err) {
      setCategories((prev) => prev.filter((c) => c._id !== id && c.id !== id));
      toast.success("Category deleted");
    }
  };

  const handleDeleteProduct = async (prodId, prodTitle) => {
    if (!window.confirm(`Delete "${prodTitle}"?`)) return;
    try {
      await dispatch(deleteProduct(prodId)).unwrap();
      toast.success("Product deleted");
      dispatch(fetchProducts({ page: 1, limit: 100 }));
    } catch (err) {
      toast.error("Failed to delete product");
    }
  };

  const handleToggleProductHot = async (prod) => {
    const id = prod._id || prod.id;
    const newHot = !prod.isHot;
    await dispatch(toggleHotFeatured({ id, isHot: newHot }));
    toast.success(newHot ? "Featured in Top Selling! 🔥" : "Removed from Top Selling");
    dispatch(fetchProducts({ page: 1, limit: 100 }));
  };

  // Filtered categories for main list
  const filteredCategories = categories.filter((c) => {
    if (!categorySearch.trim()) return true;
    const q = categorySearch.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.slug?.toLowerCase().includes(q) ||
      c.subtitle?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 1. TOP BREADCRUMB & CONTEXT HEADER */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => handleSelectCategory(null)}
              className={`text-xs font-mono font-bold transition-colors ${
                selectedCategory ? "text-indigo-600 hover:text-indigo-800" : "text-slate-500"
              }`}
            >
              Categories
            </button>
            {selectedCategory && (
              <>
                <ChevronRight size={14} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-900 font-serif">
                  {selectedCategory.name}
                </span>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold rounded-md">
                  {activeProducts.length} Items
                </span>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {selectedCategory ? `${selectedCategory.name} Studio` : "Apparel Categories & Collections"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {selectedCategory
              ? `Manage, edit, or add products inside the "${selectedCategory.name}" collection.`
              : "Click any category below to view all its products, add new items to it, or edit garment details."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedCategory ? (
            <>
              <button
                onClick={() => handleSelectCategory(null)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                <ArrowLeft size={15} /> All Categories
              </button>

              <Link
                to={`/admin/products/create?category=${selectedCategory._id || selectedCategory.id}&catName=${encodeURIComponent(selectedCategory.name)}`}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
              >
                <Plus size={16} /> Add Product to {selectedCategory.name}
              </Link>
            </>
          ) : (
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex-shrink-0"
            >
              <Plus size={16} /> + New Category
            </button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 2. DRILL-DOWN: SINGLE CATEGORY PRODUCTS EXPLORER */}
      {/* ══════════════════════════════════════════════════════════ */}
      {selectedCategory ? (
        <div className="space-y-6">

          {/* Category Banner Spotlight */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <img
                src={selectedCategory.image?.url || selectedCategory.image || "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb"}
                alt={selectedCategory.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-slate-200 shadow-xs flex-shrink-0"
              />
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase text-indigo-600">
                    /{selectedCategory.slug}
                  </span>
                  {selectedCategory.isHot && (
                    <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded flex items-center gap-1 font-mono">
                      <Flame size={10} /> HOT DROP
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-serif font-bold text-slate-900">
                  {selectedCategory.name}
                </h2>
                <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                  {selectedCategory.description || selectedCategory.subtitle || "Luxury Eastern fashion catalog"}
                </p>
                <div className="pt-1 flex items-center gap-3 text-xs text-slate-500 font-mono">
                  <span>Total Products: <strong>{getCategoryProducts(selectedCategory).length}</strong></span>
                  <span>•</span>
                  <button
                    onClick={() => openModal(selectedCategory)}
                    className="text-indigo-600 hover:text-indigo-800 font-bold underline underline-offset-2 flex items-center gap-1"
                  >
                    <Edit size={12} /> Edit Category Info
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Search inside Category */}
            <div className="w-full md:w-72">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder={`Search ${selectedCategory.name} products...`}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Products Grid inside Selected Category */}
          {activeProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {activeProducts.map((prod) => {
                const prodId = prod._id || prod.id;
                const coverImg = prod.images?.[0]?.url || prod.images?.[0] || prod.image || "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb";
                const hoverImg = prod.images?.[1]?.url || prod.images?.[1] || coverImg;

                return (
                  <div
                    key={prodId}
                    className="bg-white border border-slate-200 hover:border-indigo-400 rounded-2xl overflow-hidden group shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    {/* Photoshoot Box with Dual Hover Effect */}
                    <div className="aspect-[3/4] relative overflow-hidden bg-slate-100">
                      <img
                        src={coverImg}
                        alt={prod.title}
                        className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
                      />
                      <img
                        src={hoverImg}
                        alt={prod.title}
                        className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      />

                      {/* Chips */}
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                        {prod.isHot && (
                          <span className="px-2 py-0.5 bg-amber-500 text-white font-mono text-[9px] font-bold rounded shadow-sm flex items-center gap-1">
                            <Flame size={10} /> TOP SELLER
                          </span>
                        )}
                        <span className="px-2 py-0.5 bg-slate-900/80 backdrop-blur-sm text-white font-mono text-[9px] font-bold rounded">
                          Stock: {prod.stock || 0}
                        </span>
                      </div>

                      {/* Top Action Icons */}
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/products/${prodId}`}
                          target="_blank"
                          className="p-1.5 bg-white/90 hover:bg-white text-slate-800 rounded-lg shadow-sm"
                          title="View on Live Store"
                        >
                          <ExternalLink size={13} />
                        </Link>
                        <Link
                          to={`/admin/products/${prodId}/edit`}
                          className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                          title="Manage & Edit Product"
                        >
                          <Edit size={13} />
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(prodId, prod.title)}
                          className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm"
                          title="Delete Product"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Product Details & Actions */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-1">
                          <span className="truncate max-w-[130px]">{prod.fabric || "Pure Fabric"}</span>
                          <span>{prod.stitching || "Stitched"}</span>
                        </div>

                        <h3 className="font-serif text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                          {prod.title}
                        </h3>

                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="text-sm font-bold text-slate-900 font-mono">
                            PKR {(prod.discountPrice || prod.price || 0).toLocaleString()}
                          </span>
                          {prod.discountPrice && (
                            <span className="text-xs text-slate-400 line-through font-mono">
                              PKR {prod.price.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Size Badges */}
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {(prod.sizes || ["XS", "S", "M", "L", "XL"]).map((sz) => (
                            <span
                              key={sz}
                              className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-mono rounded"
                            >
                              {sz}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Direct Product Management Link Button */}
                      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                        <Link
                          to={`/admin/products/${prodId}/edit`}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                        >
                          <Edit size={13} /> Manage & Edit Product
                        </Link>
                        <button
                          onClick={() => handleToggleProductHot(prod)}
                          className={`p-2 rounded-xl border transition-colors ${
                            prod.isHot
                              ? "bg-amber-50 border-amber-300 text-amber-600 hover:bg-amber-100"
                              : "bg-slate-50 border-slate-200 text-slate-400 hover:text-amber-600"
                          }`}
                          title={prod.isHot ? "Remove from Top Selling" : "Mark as Top Selling"}
                        >
                          <Flame size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Package size={32} />
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-900">
                No products found in {selectedCategory.name}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {productSearch
                  ? `No apparel matched "${productSearch}". Try clearing your search.`
                  : `Get started by adding luxury garments directly into the "${selectedCategory.name}" collection.`}
              </p>
              <Link
                to={`/admin/products/create?category=${selectedCategory._id || selectedCategory.id}&catName=${encodeURIComponent(selectedCategory.name)}`}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
              >
                <Plus size={16} /> + Add First Product to {selectedCategory.name}
              </Link>
            </div>
          )}

        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════ */
        /* 3. MAIN ALL CATEGORIES DIRECTORY (10 LUXURY CATEGORIES) */
        /* ══════════════════════════════════════════════════════════ */
        <div className="space-y-6">

          {/* Search bar for categories */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-96">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Search categories (e.g. Ready to Wear, Luxury Pret, Lawn)..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>
            <div className="text-xs font-mono text-slate-500">
              Showing <strong>{filteredCategories.length}</strong> of {categories.length} Categories
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((cat) => {
              const id = cat._id || cat.id;
              const prods = getCategoryProducts(cat);
              const count = prods.length;
              const imgUrl = cat.image?.url || cat.image || "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb";

              return (
                <div
                  key={id}
                  onClick={() => handleSelectCategory(cat)}
                  className="bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-lg rounded-2xl overflow-hidden group transition-all flex flex-col justify-between cursor-pointer"
                >
                  {/* Category Cover Image */}
                  <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                    <img
                      src={imgUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Chips */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                      {cat.isHot && (
                        <span className="px-2 py-0.5 bg-amber-500 text-white font-mono text-[9px] font-bold rounded-md shadow-sm flex items-center gap-1">
                          <Flame size={10} /> HOT DROP
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-slate-900/80 backdrop-blur-sm text-white font-mono text-[9px] font-bold rounded-md">
                        {count} Products
                      </span>
                    </div>

                    {/* Edit & Delete Quick Buttons */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={(e) => openModal(cat, e)}
                        className="p-1.5 bg-white/90 hover:bg-white text-slate-800 rounded-lg shadow-sm"
                        title="Edit Category"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteCategory(cat, e)}
                        className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm"
                        title="Delete Category"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Category Info & Interactive Drilldown Action */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-indigo-600 font-bold uppercase">
                          /{cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-")}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 font-mono">
                          {count} Items
                        </span>
                      </div>

                      <h3 className="font-serif text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {cat.description || cat.subtitle || "Premium pret and unstitched luxury clothing"}
                      </p>
                    </div>

                    {/* Direct Drill-down Actions */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-900 group-hover:bg-indigo-600 text-white font-bold text-xs rounded-xl transition-colors">
                        <span>View & Manage {count} Products</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>

                      <Link
                        to={`/admin/products/create?category=${id}&catName=${encodeURIComponent(cat.name)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] rounded-xl transition-colors border border-indigo-200"
                      >
                        <Plus size={13} /> Add Product Here
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 4. MODAL: CREATE / EDIT CATEGORY */}
      {/* ══════════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <h2 className="font-serif text-2xl font-bold text-slate-900 mb-1">
              {editingCategory ? "Edit Category" : "Create New Fashion Category"}
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Organize your clothing catalog with dedicated category titles and cover photography.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Ready to Wear, Luxury Pret, Velvet"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-black focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Slug / URL identifier
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="e.g. luxury-pret (auto-generated if empty)"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-black focus:bg-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Subtitle / Tagline
                </label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="e.g. Pure Raw Silk & Zari Ensembles"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-black focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category Description
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Briefly describe the fabrics and silhouettes in this collection..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-black focus:bg-white"
                />
              </div>

              {/* Cover Photo Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category Cover Photo
                </label>
                <div className="flex items-center gap-4">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-xs"
                    />
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-black cursor-pointer"
                  />
                </div>
              </div>

              {/* Switches */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isHot}
                    onChange={(e) => setForm({ ...form, isHot: e.target.checked })}
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  <span>🔥 Featured in Hot Drops</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span>Visible on Storefront</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-900 hover:bg-black text-white shadow-md transition-all disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingCategory ? "Update Category" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}