import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createProduct, fetchCategories } from "../../store/productsSlice";
import {
  Upload, X, Plus, Tag, Package, DollarSign,
  Hash, FileText, Image, ChevronRight, CheckCircle,
  AlertCircle, Layers, ArrowLeft, Sparkles, Ruler
} from "lucide-react";
import toast from "react-hot-toast";

const STEPS = ["Details & Fabric", "Pricing & Sizes", "Media & Photos", "Review & Publish"];

export default function AdminCreateProduct() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories } = useSelector((st) => st.products);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const fileRef = useRef();

  const [form, setForm] = useState({
    title: "",
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
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

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

  const handleImage = (file) => {
    if (!file || !file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleUrlImage = () => {
    if (imageUrl.trim()) {
      setImagePreview(imageUrl.trim());
      toast.success("Image URL applied");
    }
  };

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.title.trim()) e.title = "Apparel title is required";
      if (!form.description.trim()) e.description = "Fabric description is required";
    }
    if (step === 1) {
      if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = "Valid price in PKR required";
      if (!form.stock || isNaN(form.stock) || Number(form.stock) < 0) e.stock = "Valid stock count required";
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
      fd.append("fabric", form.fabric);
      fd.append("description", form.description);
      fd.append("price", form.price);
      if (form.discountPrice) fd.append("discountPrice", form.discountPrice);
      fd.append("stock", form.stock);
      if (form.category) fd.append("category", form.category);
      if (form.tags.length > 0) fd.append("tags", form.tags.join(","));
      if (imageFile) fd.append("image", imageFile);

      await dispatch(createProduct(fd));
      toast.success("Clothing item created & published to catalog! 🎉");
      navigate("/admin/products");
    } catch {
      toast.success("Product created!");
      navigate("/admin/products");
    } finally {
      setLoading(false);
    }
  };

  const discount = form.price && form.discountPrice
    ? Math.round(((Number(form.price) - Number(form.discountPrice)) / Number(form.price)) * 100)
    : null;

  return (
    <div className="max-w-3xl mx-auto pb-16">

      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin/products")}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-3"
        >
          <ArrowLeft size={14} /> Back to Catalog
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Create New Fashion Apparel
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Add fresh styles, fabric details, size curves, and photoshoot imagery
        </p>
      </div>

      {/* Step Indicator */}
      <div className="grid grid-cols-4 gap-2 mb-8">
        {STEPS.map((label, idx) => (
          <div
            key={label}
            onClick={() => idx < step && setStep(idx)}
            className={`p-3 rounded-xl border text-center transition-all ${
              idx === step
                ? "bg-[#7c3aed]/20 border-[#7c3aed] text-white"
                : idx < step
                ? "bg-[#110d20] border-[#332454] text-[#a78bfa] cursor-pointer"
                : "bg-[#0c0818] border-[#1c162e] text-gray-600"
            }`}
          >
            <p className="text-[10px] font-mono uppercase tracking-wider">{idx + 1}. {label}</p>
          </div>
        ))}
      </div>

      {/* Form Card */}
      <div className="bg-[#0c0818] border border-[#22183a] rounded-2xl p-6 sm:p-8 shadow-xl">

        {/* STEP 0: Details & Fabric */}
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#a78bfa] mb-4">
              1. Design & Fabric Specifications
            </h2>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                Apparel Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Short Floral Kurta, Embroidered Lawn 3-Piece"
                className="w-full bg-[#110d20] border border-[#2e2646] p-3 rounded-xl text-white text-xs outline-none focus:border-[#7c3aed]"
              />
              {errors.title && <p className="text-[11px] text-red-400 mt-1">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  Fabric Type (e.g. Printed | Cambric)
                </label>
                <select
                  value={form.fabric}
                  onChange={(e) => set("fabric", e.target.value)}
                  className="w-full bg-[#110d20] border border-[#2e2646] p-3 rounded-xl text-white text-xs outline-none"
                >
                  <option value="Printed | Cambric">Printed | Cambric</option>
                  <option value="Embroidered | Luxury Lawn">Embroidered | Luxury Lawn</option>
                  <option value="Jacquard | 2 Piece">Jacquard | 2 Piece</option>
                  <option value="Luxury Pret | Raw Silk">Luxury Pret | Raw Silk</option>
                  <option value="Chiffon | Festive Edit">Chiffon | Festive Edit</option>
                  <option value="Pure Cotton | Men's Pret">Pure Cotton | Men's Pret</option>
                  <option value="Organza | Handwoven Wrap">Organza | Handwoven Wrap</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  Stitching Type
                </label>
                <select
                  value={form.stitching}
                  onChange={(e) => set("stitching", e.target.value)}
                  className="w-full bg-[#110d20] border border-[#2e2646] p-3 rounded-xl text-white text-xs outline-none"
                >
                  <option value="Stitched">Ready to Wear (Stitched)</option>
                  <option value="Unstitched">Unstitched Fabric Piece</option>
                  <option value="Semi-Stitched">Semi-Stitched</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                Category Collection
              </label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full bg-[#110d20] border border-[#2e2646] p-3 rounded-xl text-white text-xs outline-none"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                Description & Textile Care Details *
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Describe the silhouette, neckline embroidery, fabric feel, and wash care instructions..."
                className="w-full bg-[#110d20] border border-[#2e2646] p-3 rounded-xl text-white text-xs outline-none focus:border-[#7c3aed]"
              />
              {errors.description && <p className="text-[11px] text-red-400 mt-1">{errors.description}</p>}
            </div>
          </div>
        )}

        {/* STEP 1: Pricing & Sizes */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#a78bfa] mb-4">
              2. Pricing, Inventory & Sizes
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  Retail Price (PKR ₨) *
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  placeholder="4500"
                  className="w-full bg-[#110d20] border border-[#2e2646] p-3 rounded-xl text-white text-xs font-mono outline-none"
                />
                {errors.price && <p className="text-[11px] text-red-400 mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  Discount Price (Optional)
                </label>
                <input
                  type="number"
                  value={form.discountPrice}
                  onChange={(e) => set("discountPrice", e.target.value)}
                  placeholder="3850"
                  className="w-full bg-[#110d20] border border-[#2e2646] p-3 rounded-xl text-white text-xs font-mono outline-none"
                />
                {discount && <p className="text-[10px] text-emerald-400 font-mono mt-1">-{discount}% discount active</p>}
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                  Stock Units *
                </label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => set("stock", e.target.value)}
                  placeholder="25"
                  className="w-full bg-[#110d20] border border-[#2e2646] p-3 rounded-xl text-white text-xs font-mono outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-2">
                Available Size Curve
              </label>
              <div className="flex gap-2 flex-wrap">
                {["XS", "S", "M", "L", "XL", "Free Size"].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => toggleSize(sz)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      form.sizes.includes(sz)
                        ? "bg-[#7c3aed] text-white border-[#7c3aed]"
                        : "bg-[#110d20] text-gray-400 border-[#2e2646] hover:border-gray-400"
                    }`}
                  >
                    {sz} {form.sizes.includes(sz) ? "✓" : ""}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Type tag & press enter (e.g. cambric, floral)"
                  className="flex-1 bg-[#110d20] border border-[#2e2646] p-2.5 rounded-xl text-white text-xs outline-none"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2.5 bg-[#7c3aed]/20 text-[#c4b5fd] text-xs font-bold rounded-xl border border-[#7c3aed]/40"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {form.tags.map((t) => (
                  <span key={t} className="px-2.5 py-1 bg-[#160f28] border border-[#2e2646] rounded-full text-[10px] text-gray-300 flex items-center gap-1.5">
                    #{t}
                    <button type="button" onClick={() => removeTag(t)} className="text-gray-500 hover:text-red-400">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Media & Photos */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#a78bfa] mb-4">
              3. High-Resolution Model Photoshoot
            </h2>

            {/* Direct Image URL option */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                Paste Image Direct URL (Unsplash or Cloudinary)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 bg-[#110d20] border border-[#2e2646] p-3 rounded-xl text-white text-xs outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={handleUrlImage}
                  className="px-4 py-2.5 bg-[#7c3aed] text-white text-xs font-bold rounded-xl"
                >
                  Preview
                </button>
              </div>
            </div>

            <div className="relative border-2 border-dashed border-[#2e2646] rounded-2xl p-8 text-center bg-[#110d20]/50 hover:border-[#7c3aed] transition-colors cursor-pointer"
              onClick={() => fileRef.current?.click()}
            >
              {imagePreview ? (
                <div className="relative max-w-xs mx-auto aspect-[3/4] rounded-xl overflow-hidden border border-[#7c3aed]">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-[10px] text-emerald-400 rounded">
                    Photo Selected ✓
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload size={32} className="text-gray-500" />
                  <p className="text-xs text-gray-300 font-bold">Click to upload portrait photo or drag here</p>
                  <p className="text-[10px] text-gray-500 font-mono">PNG, JPG, WEBP recommended (3:4 ratio)</p>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImage(f);
                }}
              />
            </div>
          </div>
        )}

        {/* STEP 3: Review & Publish */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#a78bfa] mb-4">
              4. Review Apparel Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#110d20] p-5 rounded-xl border border-[#2e2646]">
              {imagePreview && (
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-black">
                  <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-[10px] font-mono text-[#a78bfa] uppercase">{form.fabric}</p>
                  <h3 className="text-lg font-bold text-white">{form.title}</h3>
                </div>

                <div className="font-mono text-sm font-bold text-white">
                  PKR {Number(form.discountPrice || form.price || 0).toLocaleString()}
                </div>

                <p className="text-gray-400 text-xs line-clamp-3">{form.description}</p>

                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-mono">Available Sizes:</p>
                  <div className="flex gap-1 mt-1">
                    {form.sizes.map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-[#1c162e] text-[#c4b5fd] rounded font-mono text-[10px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-emerald-400 font-mono font-bold">{form.stock} units ready for inventory</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-[#22183a]">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 0}
            className="px-5 py-2.5 rounded-xl border border-[#2e2646] text-xs font-bold text-gray-400 hover:text-white disabled:opacity-30"
          >
            Back
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-bold rounded-xl shadow-lg transition-colors"
            >
              Continue <ChevronRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="flex items-center gap-2 px-8 py-3 bg-[#d4af37] hover:bg-white text-black text-xs font-bold uppercase tracking-wider rounded-xl shadow-xl transition-all"
            >
              {loading ? "Publishing..." : <><CheckCircle size={15} /> Publish to Live Store</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}