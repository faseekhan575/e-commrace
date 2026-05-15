import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { updateProduct, fetchProduct, fetchCategories } from "../../store/productsSlice";
import {
  Upload, X, Plus, Tag, Package, DollarSign,
  Hash, FileText, Image, ChevronRight, CheckCircle, AlertCircle, Layers, ArrowLeft
} from "lucide-react";
import toast from "react-hot-toast";

const STEPS = ["Details", "Pricing", "Media", "Review"];

export default function AdminEditProduct() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories, current: product } = useSelector((s) => s.products);
  const { role } = useSelector((s) => s.auth);
  const basePath = role === "superadmin" ? "/superadmin" : "/admin";

  const accent = role === "superadmin" ? "#f9c938" : "#e8b520";
  const accentLight = role === "superadmin" ? "#f9c93815" : "#e8b52015";
  const accentBorder = role === "superadmin" ? "#f9c93830" : "#e8b52030";

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [tagInput, setTagInput] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState({});
  const fileRef = useRef();

  const [form, setForm] = useState({
    title: "", description: "", price: "",
    discountPrice: "", stock: "", category: "", tags: [],
  });

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProduct(id)).finally(() => setFetching(false));
  }, [dispatch, id]);

  // Pre-fill form when product loads
  useEffect(() => {
    if (product && product._id === id) {
      setForm({
        title: product.title || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        discountPrice: product.discountPrice?.toString() || "",
        stock: product.stock?.toString() || "",
        category: product.category?._id || product.category || "",
        tags: product.tags || [],
      });
      if (product.images?.[0]?.url) setImagePreview(product.images[0].url);
    }
  }, [product, id]);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (!t || form.tags.includes(t)) { setTagInput(""); return; }
    set("tags", [...form.tags, t]);
    setTagInput("");
  };

  const removeTag = (tag) => set("tags", form.tags.filter((t) => t !== tag));

  const handleImage = (file) => {
    if (!file || !file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.title.trim()) e.title = "Title is required";
      if (!form.description.trim()) e.description = "Description is required";
      if (!form.category) e.category = "Category is required";
    }
    if (step === 1) {
      if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = "Valid price is required";
      if (!form.stock || isNaN(form.stock) || Number(form.stock) < 0) e.stock = "Valid stock is required";
      if (form.discountPrice && Number(form.discountPrice) >= Number(form.price)) e.discountPrice = "Discount must be less than price";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => { if (validateStep()) setStep((s) => Math.min(s + 1, 3)); };
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("price", form.price);
      if (form.discountPrice) fd.append("discountPrice", form.discountPrice);
      fd.append("stock", form.stock);
      fd.append("category", form.category);
      if (form.tags.length > 0) fd.append("tags", form.tags.join(","));
      if (imageFile) fd.append("image", imageFile); // only send if changed

      const res = await dispatch(updateProduct({ id, formData: fd }));
      if (updateProduct.fulfilled.match(res)) {
        toast.success("Product updated successfully!");
        navigate(`${basePath}/products`);
      } else {
        toast.error(res.payload || "Failed to update product");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inp = `w-full px-4 py-3 rounded-xl border bg-[#111] text-white text-sm outline-none transition-all duration-200 placeholder:text-[#444]`;
  const discount = form.price && form.discountPrice
    ? Math.round(((Number(form.price) - Number(form.discountPrice)) / Number(form.price)) * 100)
    : null;

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: accent }} />
          <span className="text-white text-sm">Loading product...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-body pb-20">
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => navigate(`${basePath}/products`)}
          className="flex items-center gap-1.5 text-xs mb-4 hover:text-white transition-colors"
          style={{ color: "#525252" }}>
          <ArrowLeft size={13} /> Back to Products
        </button>
        <div className="flex items-center gap-2 text-xs font-mono mb-4" style={{ color: "#525252" }}>
          <span>Products</span>
          <ChevronRight size={12} />
          <span style={{ color: accent }}>Edit Product</span>
        </div>
        <h1 className="font-display text-3xl font-700 text-white">Edit Product</h1>
        <p className="text-sm text-[#525252] mt-1">Update the product details below.</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-0 mb-10">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 cursor-pointer"
                style={{
                  backgroundColor: i < step ? accent : i === step ? accentLight : "transparent",
                  borderColor: i <= step ? accent : "#1e1e1e",
                  color: i < step ? "#000" : i === step ? accent : "#525252",
                }}
                onClick={() => i < step && setStep(i)}
              >
                {i < step ? <CheckCircle size={16} /> : i + 1}
              </div>
              <span className="text-[10px] mt-1.5 font-mono uppercase tracking-widest"
                style={{ color: i === step ? accent : i < step ? "#787878" : "#333" }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-[1px] mx-2 mb-4 transition-all duration-500"
                style={{ backgroundColor: i < step ? accent : "#1e1e1e" }} />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-2xl overflow-hidden">

        {/* STEP 0 — Details */}
        {step === 0 && (
          <div className="p-8 space-y-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} style={{ color: accent }} />
              <h2 className="font-semibold text-white">Product Details</h2>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest mb-2" style={{ color: "#525252" }}>
                Product Title <span className="text-red-500">*</span>
              </label>
              <input value={form.title} onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. iPhone 15 Pro Max" className={inp}
                style={{ borderColor: errors.title ? "#ef4444" : form.title ? accent : "#1e1e1e" }} />
              {errors.title && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={11} />{errors.title}</p>}
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest mb-2" style={{ color: "#525252" }}>
                Description <span className="text-red-500">*</span>
              </label>
              <textarea rows={5} value={form.description} onChange={(e) => set("description", e.target.value)}
                placeholder="Describe the product..." className={`${inp} resize-none`}
                style={{ borderColor: errors.description ? "#ef4444" : form.description ? accent : "#1e1e1e" }} />
              <div className="flex justify-between mt-1">
                {errors.description ? <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.description}</p> : <span />}
                <span className="text-xs text-[#333]">{form.description.length} chars</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest mb-2" style={{ color: "#525252" }}>
                Category <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {categories.map((cat) => (
                  <button key={cat._id} type="button" onClick={() => set("category", cat._id)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200"
                    style={{
                      backgroundColor: form.category === cat._id ? accentLight : "transparent",
                      borderColor: form.category === cat._id ? accent : "#1e1e1e",
                      color: form.category === cat._id ? accent : "#787878",
                    }}>
                    {cat.image?.url && <img src={cat.image.url} className="w-5 h-5 rounded object-cover" alt="" />}
                    <span className="truncate">{cat.name}</span>
                    {form.category === cat._id && <CheckCircle size={13} className="ml-auto flex-shrink-0" />}
                  </button>
                ))}
              </div>
              {errors.category && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={11} />{errors.category}</p>}
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest mb-2" style={{ color: "#525252" }}>Tags</label>
              <div className="flex gap-2">
                <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  placeholder="Type a tag and press Enter" className={`${inp} flex-1`}
                  style={{ borderColor: "#1e1e1e" }} />
                <button type="button" onClick={addTag} className="px-4 py-3 rounded-xl border text-sm font-medium"
                  style={{ borderColor: accent, color: accent, backgroundColor: accentLight }}>
                  <Plus size={16} />
                </button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
                      style={{ backgroundColor: accentLight, borderColor: accentBorder, color: accent }}>
                      <Tag size={10} />{tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-red-400 ml-0.5"><X size={11} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 1 — Pricing */}
        {step === 1 && (
          <div className="p-8 space-y-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={16} style={{ color: accent }} />
              <h2 className="font-semibold text-white">Pricing & Stock</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest mb-2" style={{ color: "#525252" }}>
                  Original Price (₨) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-mono" style={{ color: "#525252" }}>₨</span>
                  <input type="number" min="0" value={form.price} onChange={(e) => set("price", e.target.value)}
                    placeholder="250000" className={`${inp} pl-9`}
                    style={{ borderColor: errors.price ? "#ef4444" : form.price ? accent : "#1e1e1e" }} />
                </div>
                {errors.price && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={11} />{errors.price}</p>}
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest mb-2" style={{ color: "#525252" }}>
                  Discount Price (₨) <span className="text-[#333]">optional</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-mono" style={{ color: "#525252" }}>₨</span>
                  <input type="number" min="0" value={form.discountPrice} onChange={(e) => set("discountPrice", e.target.value)}
                    placeholder="230000" className={`${inp} pl-9`}
                    style={{ borderColor: errors.discountPrice ? "#ef4444" : form.discountPrice ? accent : "#1e1e1e" }} />
                </div>
                {errors.discountPrice && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={11} />{errors.discountPrice}</p>}
                {discount && !errors.discountPrice && (
                  <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: accent }}><CheckCircle size={11} />{discount}% discount applied</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest mb-2" style={{ color: "#525252" }}>
                  Stock Quantity <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash size={14} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#525252" }} />
                  <input type="number" min="0" value={form.stock} onChange={(e) => set("stock", e.target.value)}
                    placeholder="10" className={`${inp} pl-9`}
                    style={{ borderColor: errors.stock ? "#ef4444" : form.stock ? accent : "#1e1e1e" }} />
                </div>
                {errors.stock && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={11} />{errors.stock}</p>}
              </div>
            </div>
            {form.price && (
              <div className="rounded-2xl border p-5" style={{ borderColor: accentBorder, backgroundColor: accentLight }}>
                <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: accent }}>Price Preview</p>
                <div className="flex items-center gap-4 flex-wrap">
                  {form.discountPrice && Number(form.discountPrice) < Number(form.price) ? (
                    <>
                      <span className="font-display text-3xl font-700 text-white">₨ {Number(form.discountPrice).toLocaleString()}</span>
                      <span className="text-lg text-[#525252] line-through">₨ {Number(form.price).toLocaleString()}</span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold text-black" style={{ backgroundColor: accent }}>-{discount}% OFF</span>
                    </>
                  ) : (
                    <span className="font-display text-3xl font-700 text-white">₨ {Number(form.price).toLocaleString()}</span>
                  )}
                </div>
                {form.stock && <p className="text-xs text-[#787878] mt-3 flex items-center gap-1.5"><Layers size={11} />{form.stock} units in stock</p>}
              </div>
            )}
          </div>
        )}

        {/* STEP 2 — Media */}
        {step === 2 && (
          <div className="p-8 animate-fade-in">
            <div className="flex items-center gap-2 mb-6">
              <Image size={16} style={{ color: accent }} />
              <h2 className="font-semibold text-white">Product Image</h2>
              <span className="text-xs text-[#525252] ml-2">(leave unchanged to keep current image)</span>
            </div>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleImage(f); }}
              onClick={() => !imagePreview && fileRef.current?.click()}
              className="relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden"
              style={{
                borderColor: dragOver ? accent : imagePreview ? accent : "#1e1e1e",
                backgroundColor: dragOver ? accentLight : "transparent",
                minHeight: "340px",
              }}>
              {imagePreview ? (
                <div className="relative w-full h-full">
                  <img src={imagePreview} alt="preview" className="w-full h-80 object-contain p-4" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button type="button" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold text-black" style={{ backgroundColor: accent }}>
                      Change Image
                    </button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setImagePreview(null); setImageFile(null); }}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#1e1e1e] hover:bg-[#333]">
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-80 gap-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center border"
                    style={{ borderColor: accentBorder, backgroundColor: accentLight }}>
                    <Upload size={26} style={{ color: accent }} />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-medium mb-1">Drop new image or click to upload</p>
                    <p className="text-xs text-[#525252]">PNG, JPG, WEBP — leave empty to keep current</p>
                  </div>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImage(f); }} />
            {imageFile && (
              <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: accent }}>
                <CheckCircle size={13} /> New image selected
              </div>
            )}
            {!imageFile && imagePreview && (
              <div className="mt-3 flex items-center gap-2 text-xs text-[#525252]">
                <CheckCircle size={13} /> Using existing image
              </div>
            )}
          </div>
        )}

        {/* STEP 3 — Review */}
        {step === 3 && (
          <div className="p-8 animate-fade-in">
            <div className="flex items-center gap-2 mb-6">
              <Package size={16} style={{ color: accent }} />
              <h2 className="font-semibold text-white">Review & Save</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {imagePreview && (
                <div className="rounded-2xl overflow-hidden border border-[#1e1e1e] aspect-square">
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: "#525252" }}>Title</p>
                  <p className="text-white font-semibold text-lg">{form.title}</p>
                </div>
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: "#525252" }}>Category</p>
                  <p className="text-white text-sm">{categories.find((c) => c._id === form.category)?.name || "—"}</p>
                </div>
                <div className="flex items-baseline gap-3">
                  {form.discountPrice && Number(form.discountPrice) < Number(form.price) ? (
                    <>
                      <span className="font-display text-2xl font-700 text-white">₨ {Number(form.discountPrice).toLocaleString()}</span>
                      <span className="text-[#525252] line-through text-sm">₨ {Number(form.price).toLocaleString()}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full text-black" style={{ backgroundColor: accent }}>-{discount}%</span>
                    </>
                  ) : (
                    <span className="font-display text-2xl font-700 text-white">₨ {Number(form.price || 0).toLocaleString()}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${Number(form.stock) > 0 ? "bg-green-500" : "bg-red-500"}`} />
                  <span className="text-sm text-[#787878]">{form.stock} units in stock</span>
                </div>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-full text-xs border"
                        style={{ borderColor: accentBorder, color: accent, backgroundColor: accentLight }}>#{tag}</span>
                    ))}
                  </div>
                )}
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: "#525252" }}>Description</p>
                  <p className="text-[#787878] text-sm leading-relaxed line-clamp-4">{form.description}</p>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-[#1e1e1e] flex items-center justify-between">
              <p className="text-xs text-[#525252]">Review changes before saving.</p>
              <button onClick={handleSubmit} disabled={loading}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50"
                style={{ backgroundColor: accent, color: "#000" }}>
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Saving...</>
                ) : (
                  <><CheckCircle size={16} />Save Changes</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Nav Buttons */}
        {step < 3 && (
          <div className="px-8 pb-8 flex justify-between items-center border-t border-[#1e1e1e] pt-6">
            <button onClick={prevStep} disabled={step === 0}
              className="px-6 py-2.5 rounded-xl border text-sm font-medium transition-all disabled:opacity-30"
              style={{ borderColor: "#1e1e1e", color: "#787878" }}>
              Back
            </button>
            <div className="flex items-center gap-2">
              {STEPS.map((_, i) => (
                <div key={i} className="h-1.5 rounded-full transition-all duration-300"
                  style={{ backgroundColor: i === step ? accent : i < step ? "#525252" : "#1e1e1e", width: i === step ? "20px" : "6px" }} />
              ))}
            </div>
            <button onClick={nextStep}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: accent, color: "#000" }}>
              Continue <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}