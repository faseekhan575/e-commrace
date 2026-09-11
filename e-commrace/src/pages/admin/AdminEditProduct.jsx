import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { updateProduct, fetchProduct, fetchCategories } from "../../store/productsSlice";
import { errorMessage } from "../../services/api";
import { optimizeImage } from "../../utils/imageOptimizer";
import {
  Upload, Plus, ChevronRight, CheckCircle,
  ArrowLeft, ShieldAlert, Flame, Star, Eye,
  Trash2, Image as ImageIcon, Sparkles, Check
} from "lucide-react";
import toast from "react-hot-toast";
import ProductMetadataFields from "./ProductMetadataFields";
import ProductOperations from "./ProductOperations";

const STEPS = ["Details & Category", "Pricing & Size Curve", "Photoshoot & Hover Studio", "Review & Save"];

export default function AdminEditProduct() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { categories, current: serverProduct } = useSelector((st) => st.products);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [managedProduct, setManagedProduct] = useState(null);
  const [errors, setErrors] = useState({});

  const [gallery, setGallery] = useState([]);
  const [isSimulatingHover, setIsSimulatingHover] = useState(false);
  const fileRef = useRef();

  const [form, setForm] = useState({
    title: "",
    sku: "", costPrice: "", piecesCount: "1", customBadge: "", dispatchBadge: "",
    fabric: "Printed | Cambric",
    stitching: "Stitched",
    category: "",
    price: "",
    discountPrice: "",
    stock: "25",
    color: "Lilac & White",
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "",
    tags: ["cambric", "floral", "pret", "summer"],
    isHot: false,
    isFeatured: true,
    isActive: true,
  });

  const populateData = (p) => {
    if (!p) return;
    setManagedProduct(p);
    setForm({
      title: p.title || "",
      sku: p.sku || "", costPrice: p.costPrice ?? "", piecesCount: p.piecesCount ?? String(parseInt(p.productTypeTag, 10) || 1), customBadge: p.customBadge || "", dispatchBadge: p.dispatchBadge || "",
      fabric: p.fabric || "Printed | Cambric",
      stitching: p.stitchingType ? p.stitchingType === "unstitched" ? "Unstitched" : "Stitched" : p.stitching || (p.tags?.includes("unstitched") ? "Unstitched" : "Stitched"),
      category: p.category?._id || p.category || (categories[0]?._id || ""),
      price: p.price || "",
      discountPrice: p.discountPrice || "",
      stock: p.stock !== undefined ? String(p.stock) : "25",
      color: p.color || "Lilac & White",
      sizes: p.sizes && p.sizes.length > 0 ? p.sizes : ["XS", "S", "M", "L", "XL"],
      description: p.description || "",
      tags: p.tags || ["cambric", "floral", "pret", "summer"],
      isHot: p.isHot || false,
      isFeatured: p.isFeatured !== false,
      isActive: p.isActive !== false,
    });

    const imgs = [];
    if (p.images && p.images.length > 0) {
      p.images.forEach((img, idx) => {
        imgs.push({
          id: `img-exist-${idx}`,
          url: img.url || img,
          file: null,
        });
      });
    } else if (p.image?.url || p.image) {
      imgs.push({
        id: "img-exist-0",
        url: p.image?.url || p.image,
        file: null,
      });
    }

    if (imgs.length === 0) {
      imgs.push({
        id: "img-init-1",
        url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80",
        file: null,
      });
    }
    setGallery(imgs);
  };

  useEffect(() => {
    dispatch(fetchCategories());
    if (id) {
      dispatch(fetchProduct(id))
        .unwrap()
        .then((p) => {
          populateData(p);
        })
        .catch((error) => setFetchError(errorMessage(error)))
        .finally(() => setFetching(false));
    }
  }, [dispatch, id]);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const toggleSize = (sz) => {
    if (form.sizes.includes(sz)) {
      set("sizes", form.sizes.filter((s) => s !== sz));
    } else {
      set("sizes", [...form.sizes, sz]);
    }
  };

  const handleMultipleFiles = (files) => {
    const validFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (validFiles.length === 0) {
      toast.error("Please select valid photo files (PNG, JPG, WEBP)");
      return;
    }

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setGallery((prev) => [
          ...prev,
          {
            id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            url: e.target.result,
            file,
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
    setErrors((errs) => ({ ...errs, image: "" }));
    toast.success(`Added ${validFiles.length} photoshoot photo${validFiles.length > 1 ? "s" : ""}!`);
  };

  const setAsCover = (index) => {
    if (index === 0) return;
    setGallery((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return copy;
    });
    toast.success("⭐ Set as Primary Cover Photo (Customer View)");
  };

  const setAsHover = (index) => {
    if (index === 1) return;
    setGallery((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      if (copy.length >= 1) {
        copy.splice(1, 0, item);
      } else {
        copy.push(item);
      }
      return copy;
    });
    toast.success("✨ Set as Hover Reveal Angle (Customer Hover View)");
  };

  const removePhoto = (index) => {
    if (gallery.length <= 1) {
      toast.error("Product must have at least 1 photoshoot photo");
      return;
    }
    setGallery((prev) => prev.filter((_, i) => i !== index));
    toast.success("Photo removed");
  };

  const validateStep = (targetStep = step) => {
    const e = {};
    if (targetStep === 0) {
      if (!form.title.trim()) e.title = "Apparel title is required";
      if (!form.description.trim()) e.description = "Fabric description is required";
      if (!form.category) e.category = "Please select or create a category";
      if (form.costPrice !== "" && (!Number.isFinite(Number(form.costPrice)) || Number(form.costPrice) < 0)) e.costPrice = "Cost price must be zero or more";
      if (!Number.isInteger(Number(form.piecesCount)) || Number(form.piecesCount) < 1) e.piecesCount = "Enter a whole number of pieces";
    }
    if (targetStep === 1) {
      if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = "Valid price in PKR required";
      if (form.stock === "" || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) e.stock = "Valid stock count required";
      if (form.discountPrice && Number(form.discountPrice) >= Number(form.price))
        e.discountPrice = "Discount price must be less than regular price";
      if (!form.sizes || form.sizes.length === 0) e.sizes = "Please select at least one size";
    }
    if (targetStep === 2) {
      if (gallery.length === 0) e.image = "Please upload at least one photo";
    }
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error(Object.values(e)[0]);
      return false;
    }
    return true;
  };

  const nextStep = () => { if (validateStep(step)) setStep((s) => Math.min(s + 1, 3)); };
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    for (const section of [0, 1, 2]) { if (!validateStep(section)) { setStep(section); return; } }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title.trim());
      for (const key of ["sku", "costPrice", "piecesCount", "customBadge", "dispatchBadge"]) if (form[key] !== "" && form[key] != null) fd.append(key, form[key]);
      fd.append("fabric", form.fabric);
      fd.append("stitching", form.stitching);
      fd.append("stitchingType", form.stitching.toLowerCase());
      fd.append("fabricType", form.fabric);
      fd.append("description", form.description.trim());
      fd.append("price", Number(form.price));
      if (form.discountPrice) fd.append("discountPrice", Number(form.discountPrice));
      fd.append("stock", Number(form.stock));
      fd.append("category", form.category);
      fd.append("isHot", form.isHot);
      fd.append("isFeatured", form.isFeatured);
      fd.append("isActive", form.isActive);
      if (form.sizes.length > 0) fd.append("sizes", form.sizes.join(","));
      fd.append("tags", [...form.tags.filter((tag) => !["stitched", "unstitched"].includes(tag.toLowerCase())), form.stitching.toLowerCase()].join(","));
      fd.append("productTypeTag", `${form.piecesCount || 1} Piece`);

      gallery.filter((g) => g.file).forEach((g) => fd.append("image", g.file));
      const urlImages = gallery.filter((g) => !g.file && g.url).map((g) => g.url);
      if (urlImages.length > 0) {
        fd.append("imageUrls", JSON.stringify(urlImages));
        if (gallery.filter((g) => g.file).length === 0) fd.append("image", urlImages[0]);
      }

      await dispatch(updateProduct({ id, formData: fd })).unwrap();
      toast.success("Product changes saved");
      navigate(`/admin/products?category=${form.category}`);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const selectedCategoryObj = categories.find((c) => c._id === form.category);

  if (fetchError) return <div className="p-8 bg-white border rounded-xl" role="alert"><p>{fetchError}</p><Link to="/admin/products" className="underline">Back to products</Link></div>;

  if (fetching) {
    return (
      <div className="p-12 text-center text-slate-500 font-mono text-xs">
        <Sparkles size={24} className="mx-auto mb-2 text-indigo-600 animate-spin" />
        Loading apparel details...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Header Bar */}
      <div className="mb-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button onClick={() => navigate("/admin/products")} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 mb-2 font-medium">
            <ArrowLeft size={14} /> Back to Catalog
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Edit Apparel: {form.title || "Product"}</h1>
          <p className="text-xs text-slate-500 mt-1">Update wardrobe category, retail price, photoshoot angles, and homepage showcases</p>
        </div>
        {selectedCategoryObj && (
          <div className="px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-left flex-shrink-0">
            <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 block">Assigned Category</span>
            <span className="text-xs font-bold text-slate-900">{selectedCategoryObj.name}</span>
          </div>
        )}
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-4 gap-2 mb-8">
        {STEPS.map((label, idx) => (
          <div
            key={label}
            onClick={() => idx < step && setStep(idx)}
            className={`p-3.5 rounded-xl border text-center transition-all ${
              idx === step
                ? "bg-slate-900 border-slate-900 text-white font-bold shadow-md"
                : idx < step
                ? "bg-white border-slate-300 text-indigo-600 cursor-pointer font-semibold"
                : "bg-slate-100 border-slate-200 text-slate-400"
            }`}
          >
            <p className="text-[11px] font-mono uppercase tracking-wider">{idx + 1}. {label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        {/* ── Step 0: Design & Category ── */}
        {step === 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">1. Design, Category & Fabric</h2>
              <span className="text-xs text-slate-500 font-mono">Step 1 of 4</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Target Wardrobe Category *</label>
                <Link to="/admin/categories" target="_blank" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                  <Plus size={12} /> Create New
                </Link>
              </div>
              <select
                aria-label="category" value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 text-xs font-semibold outline-none focus:border-indigo-500 transition-all"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Apparel Title *</label>
              <input
                type="text"
                aria-label="title" value={form.title}
                onChange={(e) => set("title", e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 text-xs font-medium outline-none focus:border-indigo-500"
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Fabric Type</label>
                <select
                  aria-label="fabric" value={form.fabric}
                  onChange={(e) => set("fabric", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 text-xs font-medium outline-none"
                >
                  {["Printed | Cambric", "Embroidered | Luxury Lawn", "Jacquard | 2 Piece", "Luxury Pret | Raw Silk", "Chiffon | Festive Edit", "Pure Cotton | Pret"].map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Stitching Type</label>
                <select
                  value={form.stitching}
                  onChange={(e) => set("stitching", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 text-xs font-medium outline-none"
                >
                  {["Stitched", "Unstitched"].map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Detailed Description *</label>
              <textarea
                rows={3}
                aria-label="description" value={form.description}
                onChange={(e) => set("description", e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 text-xs font-medium outline-none focus:border-indigo-500"
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
            </div>

            {/* Showcase & Storefront Visibility Controls */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-500">
                Storefront Showcases & Visibility
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Top Selling (Section 2) Switch */}
                <div
                  onClick={() => set("isHot", !form.isHot)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                    form.isHot
                      ? "bg-amber-50 border-amber-300 text-amber-900 shadow-xs"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    form.isHot ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-400"
                  }`}>
                    <Flame size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Top Selling (Sec 2)</p>
                    <p className="text-[10px] text-slate-500 font-mono">{form.isHot ? "✓ Featured on Section 2" : "Not in Section 2"}</p>
                  </div>
                </div>

                {/* 2. Featured Showcase Switch */}
                <div
                  onClick={() => set("isFeatured", !form.isFeatured)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                    form.isFeatured
                      ? "bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    form.isFeatured ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                  }`}>
                    <Star size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Featured Outfit</p>
                    <p className="text-[10px] text-slate-500 font-mono">{form.isFeatured ? "✓ Star badge active" : "Normal display"}</p>
                  </div>
                </div>

                {/* 3. Active Visibility Switch */}
                <div
                  onClick={() => set("isActive", !form.isActive)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                    form.isActive
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs"
                      : "bg-rose-50 border-rose-300 text-rose-900 shadow-xs"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    form.isActive ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                  }`}>
                    <Eye size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Storefront Status</p>
                    <p className="text-[10px] font-mono">{form.isActive ? "✓ Public & Visible" : "✕ Hidden / Draft"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 1: Pricing & Size Curve ── */}
        {step === 0 && <ProductMetadataFields form={form} set={set} />}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">2. Pricing, Inventory & Size Curve</h2>
              <span className="text-xs text-slate-500 font-mono">Step 2 of 4</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Retail Price (PKR) *</label>
                <input
                  type="number"
                  aria-label="price" value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-mono font-bold outline-none"
                />
                {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Discount Price</label>
                <input
                  type="number"
                  aria-label="discountPrice" value={form.discountPrice}
                  onChange={(e) => set("discountPrice", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-mono font-bold outline-none"
                />
                {errors.discountPrice && <p className="text-xs text-red-500 mt-1">{errors.discountPrice}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Stock *</label>
                <input
                  type="number"
                  aria-label="stock" value={form.stock}
                  onChange={(e) => set("stock", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-mono font-bold outline-none"
                />
                {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Available Size Curve *</label>
              <div className="flex gap-2 flex-wrap">
                {["XS", "S", "M", "L", "XL", "XXL", "Free Size"].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => toggleSize(sz)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      form.sizes.includes(sz)
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    {sz} {form.sizes.includes(sz) ? "✓" : ""}
                  </button>
                ))}
              </div>
              {errors.sizes && <p className="text-xs text-red-500 mt-1">{errors.sizes}</p>}
            </div>
          </div>
        )}

        {/* ── Step 2: Multi-Angle Photoshoot & Hover Studio ── */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">3. Multi-Angle Photoshoot & Hover Studio</h2>
                <p className="text-xs text-slate-500 mt-0.5">Select photo files. Photo #1 is the default; Photo #2 is hover revealed.</p>
              </div>
              <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full text-xs font-mono font-bold">
                {gallery.length} Photos
              </span>
            </div>

            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-indigo-300 hover:border-indigo-600 bg-indigo-50/40 p-8 rounded-3xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
            >
              <div className="w-14 h-14 rounded-2xl bg-white shadow-md text-indigo-600 flex items-center justify-center mb-3">
                <Upload size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Click to Select More Photos</h3>
              <p className="text-xs text-slate-500">Select image files (PNG, JPG, WEBP) to upload</p>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) handleMultipleFiles(e.target.files);
                }}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              <div className="lg:col-span-7 space-y-3">
                <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
                  {gallery.map((img, idx) => (
                    <div
                      key={img.id || idx}
                      className={`flex items-center gap-3.5 p-3 rounded-2xl border ${
                        idx === 0
                          ? "bg-amber-50/70 border-amber-300"
                          : idx === 1
                          ? "bg-indigo-50/70 border-indigo-300"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-slate-300">
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {idx === 0 ? "⭐ Primary Cover" : idx === 1 ? "✨ Hover Reveal Angle" : `Detail Angle #${idx + 1}`}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {idx === 0 ? "Shows first to all customers" : idx === 1 ? "Appears when hovering on card" : "Product gallery page"}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => setAsCover(idx)}
                            className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-[9px] font-bold"
                          >
                            ⭐ Set Cover
                          </button>
                        )}
                        {idx !== 1 && (
                          <button
                            type="button"
                            onClick={() => setAsHover(idx)}
                            className="px-2 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-900 rounded-lg text-[9px] font-bold"
                          >
                            ✨ Set Hover
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[9px] font-bold"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="w-full bg-slate-50 border border-slate-200 p-4 rounded-3xl text-center">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono uppercase font-bold text-slate-600">Hover Angle Test</span>
                    <button
                      type="button"
                      onClick={() => setIsSimulatingHover(!isSimulatingHover)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                        isSimulatingHover ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-white text-slate-700 border-slate-200"
                      }`}
                    >
                      {isSimulatingHover ? "Hover Reveal Active" : "Click to Simulate Hover"}
                    </button>
                  </div>
                  <div
                    onMouseEnter={() => setIsSimulatingHover(true)}
                    onMouseLeave={() => setIsSimulatingHover(false)}
                    className="mt-4 relative max-w-[180px] mx-auto aspect-[3/4.2] rounded-2xl overflow-hidden border border-slate-300 bg-slate-100 shadow-sm cursor-pointer"
                  >
                    <img
                      src={(isSimulatingHover && gallery.length > 1) ? gallery[1]?.url : gallery[0]?.url}
                      alt="Hover Simulation"
                      className="w-full h-full object-cover transition-transform duration-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-2">Move mouse over card above to preview hover swap</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Review & Save ── */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">4. Review Changes & Save</h2>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-20 rounded-xl overflow-hidden bg-black flex-shrink-0">
                  <img src={gallery[0]?.url} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{form.title}</h3>
                  <p className="text-xs text-slate-500 font-mono">
                    PKR {Number(form.discountPrice || form.price).toLocaleString()} • {form.fabric} • {form.stock} units
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {form.isHot && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold rounded text-[10px]">
                        🔥 Section 2 (Top Selling)
                      </span>
                    )}
                    {form.isFeatured && (
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-900 font-bold rounded text-[10px]">
                        ⭐ Featured
                      </span>
                    )}
                    <span className={`px-2 py-0.5 font-bold rounded text-[10px] ${
                      form.isActive ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"
                    }`}>
                      {form.isActive ? "✓ Public" : "✕ Hidden"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 0}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-40"
          >
            Back
          </button>
          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              Continue <ChevronRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="flex items-center gap-2 px-8 py-3 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase rounded-xl transition-all shadow-md"
            >
              {loading ? "Saving Changes..." : <><CheckCircle size={15} /> Save Changes Live</>}
            </button>
          )}
        </div>
      </div>
      <ProductOperations product={managedProduct} onUpdated={(product) => {
        setManagedProduct(product);
        setForm((current) => ({ ...current, stock: String(product.stock ?? 0) }));
        setGallery((product.images || []).map((image, index) => ({ id: `img-exist-${index}`, url: image.url, file: null })));
      }} />
    </div>
  );
}