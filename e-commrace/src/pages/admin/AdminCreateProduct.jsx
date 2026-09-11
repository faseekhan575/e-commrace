import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { createProduct, fetchCategories } from "../../store/productsSlice";
import {
  Upload, Plus, ChevronRight, CheckCircle,
  ArrowLeft, ShieldAlert, Flame, Star, Eye
} from "lucide-react";
import toast from "react-hot-toast";
import ProductMetadataFields from "./ProductMetadataFields";

const STEPS = ["Details & Category", "Pricing & Size Curve", "Photoshoot & Hover Studio", "Review & Publish"];

export default function AdminCreateProduct() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { categories } = useSelector((st) => st.products);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});

  const [gallery, setGallery] = useState([]);
  const [isSimulatingHover, setIsSimulatingHover] = useState(false);
  const fileRef = useRef();

  const [form, setForm] = useState({
    title: "",
    sku: "", costPrice: "", piecesCount: "1", customBadge: "", dispatchBadge: "",
    fabric: "Cambric",
    stitching: "Stitched",
    category: searchParams.get("category") || "",
    price: "",
    discountPrice: "",
    stock: "25",
    color: "",
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "",
    tags: [],
    isHot: false,
    isFeatured: true,
    isActive: true,
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const urlCat = searchParams.get("category");
    if (urlCat) {
      setForm((f) => ({ ...f, category: urlCat }));
    } else if (categories && categories.length > 0 && !form.category) {
      setForm((f) => ({ ...f, category: categories[0]._id }));
    }
  }, [categories, searchParams]);

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

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (!t || form.tags.includes(t)) { setTagInput(""); return; }
    set("tags", [...form.tags, t]);
    setTagInput("");
  };
  const removeTag = (tag) => set("tags", form.tags.filter((t) => t !== tag));

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
      const res = await dispatch(createProduct(fd));
      if (createProduct.fulfilled.match(res)) {
        toast.success("Product published to category! 🎉");
        if (form.category) {
          navigate(`/admin/categories?selected=${form.category}`);
        } else {
          navigate("/admin/categories");
        }
      } else toast.error(res.payload || "Failed to create product");
    } catch (err) { toast.error("Failed to create product"); } finally { setLoading(false); }
  };

  const selectedCategoryObj = categories.find((c) => c._id === form.category || c.id === form.category);

  return (
    <div className="max-w-4xl mx-auto pb-16">
      <div className="mb-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => form.category ? navigate(`/admin/categories?selected=${form.category}`) : navigate("/admin/categories")}
            className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-900 mb-2 font-bold transition-colors"
          >
            <ArrowLeft size={14} /> Back to {selectedCategoryObj ? selectedCategoryObj.name : "Categories"} Studio
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Create Apparel & Photoshoot</h1>
          <p className="text-xs text-slate-500 mt-1">Organize under categories, set price & stock, and upload high-res photoshoot angles</p>
        </div>
        {selectedCategoryObj && (
          <div className="px-3.5 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-left flex-shrink-0">
            <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 block">Assigned Category</span>
            <span className="text-xs font-bold text-slate-900">{selectedCategoryObj.name}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2 mb-8">
        {STEPS.map((label, idx) => (
          <div key={label} onClick={() => idx < step && setStep(idx)} className={`p-3.5 rounded-xl border text-center transition-all ${idx === step ? "bg-slate-900 border-slate-900 text-white font-bold shadow-md" : idx < step ? "bg-white border-slate-300 text-indigo-600 cursor-pointer font-semibold" : "bg-slate-100 border-slate-200 text-slate-400"}`}>
            <p className="text-[11px] font-mono uppercase tracking-wider">{idx + 1}. {label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        {step === 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3"><h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">1. Design, Category & Fabric</h2><span className="text-xs text-slate-500 font-mono">Step 1 of 4</span></div>
            <div>
              <div className="flex items-center justify-between mb-1.5"><label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Target Wardrobe Category *</label><Link to="/admin/categories" target="_blank" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"><Plus size={12} /> Create New</Link></div>
              {categories.length === 0 ? <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3"><ShieldAlert size={20} className="text-amber-600" /><p className="text-xs text-amber-800 font-medium">No categories found! Create one first.</p></div> : <select aria-label="category" value={form.category} onChange={(e) => set("category", e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 text-xs font-semibold outline-none focus:border-indigo-500 transition-all">{categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select>}
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Apparel Title *</label>
              <input type="text" aria-label="title" value={form.title} onChange={(e) => set("title", e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 text-xs font-medium outline-none focus:border-indigo-500" />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Fabric Type</label><select aria-label="fabric" value={form.fabric} onChange={(e) => set("fabric", e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 text-xs font-medium outline-none">{["Printed | Cambric", "Embroidered | Luxury Lawn", "Jacquard | 2 Piece", "Luxury Pret | Raw Silk", "Chiffon | Festive Edit", "Pure Cotton | Pret"].map(o => <option key={o} value={o}>{o}</option>)}</select></div>
              <div><label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Stitching Type</label><select value={form.stitching} onChange={(e) => set("stitching", e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 text-xs font-medium outline-none">{["Stitched", "Unstitched"].map(o => <option key={o} value={o}>{o}</option>)}</select></div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Detailed Description *</label>
              <textarea rows={3} aria-label="description" value={form.description} onChange={(e) => set("description", e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 text-xs font-medium outline-none focus:border-indigo-500" />
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
        {step === 0 && <ProductMetadataFields form={form} set={set} />}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3"><h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">2. Pricing, Inventory & Size Curve</h2><span className="text-xs text-slate-500 font-mono">Step 2 of 4</span></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Retail Price (PKR) *</label><input type="number" aria-label="price" value={form.price} onChange={(e) => set("price", e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-mono font-bold outline-none" />{errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}</div>
              <div><label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Discount Price</label><input type="number" aria-label="discountPrice" value={form.discountPrice} onChange={(e) => set("discountPrice", e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-mono font-bold outline-none" />{errors.discountPrice && <p className="text-xs text-red-500 mt-1">{errors.discountPrice}</p>}</div>
              <div><label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Stock *</label><input type="number" aria-label="stock" value={form.stock} onChange={(e) => set("stock", e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-mono font-bold outline-none" />{errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock}</p>}</div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Available Size Curve *</label>
              <div className="flex gap-2 flex-wrap">{["XS", "S", "M", "L", "XL", "XXL", "Free Size"].map((sz) => <button key={sz} type="button" onClick={() => toggleSize(sz)} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${form.sizes.includes(sz) ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 text-slate-600 border-slate-200"}`}>{sz} {form.sizes.includes(sz) ? "✓" : ""}</button>)}</div>
              {errors.sizes && <p className="text-xs text-red-500 mt-1">{errors.sizes}</p>}
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3"><div><h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">3. Multi-Angle Photoshoot & Hover Studio</h2><p className="text-xs text-slate-500 mt-0.5">Select photo files. Photo #1 is the default; Photo #2 is hover revealed.</p></div><span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full text-xs font-mono font-bold">{gallery.length} Photos</span></div>
            <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-indigo-300 hover:border-indigo-600 bg-indigo-50/40 p-8 rounded-3xl flex flex-col items-center justify-center text-center cursor-pointer"><div className="w-14 h-14 rounded-2xl bg-white shadow-md text-indigo-600 flex items-center justify-center mb-3"><Upload size={24} /></div><h3 className="text-sm font-bold text-slate-900">Click to Select Photos</h3><p className="text-xs text-slate-500">Select image files (PNG, JPG, WEBP)</p><input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.length) handleMultipleFiles(e.target.files); }} /></div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              <div className="lg:col-span-7 space-y-3">
                <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">{gallery.map((img, idx) => <div key={img.id || idx} className={`flex items-center gap-3.5 p-3 rounded-2xl border ${idx === 0 ? "bg-amber-50/70 border-amber-300" : idx === 1 ? "bg-indigo-50/70 border-indigo-300" : "bg-slate-50 border-slate-200"}`}><div className="relative w-16 h-20 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-slate-300"><img src={img.url} alt="" className="w-full h-full object-cover" /></div><div className="flex-1"><p className="text-[11px] text-slate-500">{idx === 0 ? "Default cover" : idx === 1 ? "Hover reveal" : "Detail angle"}</p></div><div className="flex flex-col gap-1.5">{idx !== 0 && <button type="button" onClick={() => setAsCover(idx)} className="px-2 py-1 bg-amber-100 text-amber-900 rounded-lg text-[9px] font-bold">⭐ Cover</button>}{idx !== 1 && <button type="button" onClick={() => setAsHover(idx)} className="px-2 py-1 bg-indigo-100 text-indigo-900 rounded-lg text-[9px] font-bold">✨ Hover</button>}<button type="button" onClick={() => removePhoto(idx)} className="px-2 py-1 bg-red-50 text-red-600 rounded-lg text-[9px] font-bold">✕ Remove</button></div></div>)}</div>
              </div>
              <div className="lg:col-span-5"><div className="w-full bg-slate-50 border border-slate-200 p-4 rounded-3xl text-center"><button type="button" onClick={() => setIsSimulatingHover(!isSimulatingHover)} className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${isSimulatingHover ? "bg-emerald-100" : "bg-white"}`}>{isSimulatingHover ? "Hover Active" : "Toggle Hover"}</button><div onMouseEnter={() => setIsSimulatingHover(true)} onMouseLeave={() => setIsSimulatingHover(false)} className="mt-4 relative max-w-[180px] mx-auto aspect-[3/4.2] rounded-2xl overflow-hidden border border-slate-300 bg-slate-100 cursor-pointer"><img src={(isSimulatingHover && gallery.length > 1) ? gallery[1]?.url : gallery[0]?.url} className="w-full h-full object-cover" /></div></div></div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-6"><h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">4. Review & Publish</h2><p className="text-slate-600 text-sm">You are ready to publish <b>{form.title}</b>.</p></div>
        )}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
          <button type="button" onClick={prevStep} disabled={step === 0} className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">Back</button>
          {step < 3 ? <button type="button" onClick={nextStep} className="flex items-center gap-1.5 px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl">Continue <ChevronRight size={14} /></button> : <button type="button" disabled={loading} onClick={handleSubmit} className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white text-xs font-bold uppercase rounded-xl">{loading ? "Publishing..." : <><CheckCircle size={15} /> Publish</>}</button>}
        </div>
      </div>
    </div>
  );
}