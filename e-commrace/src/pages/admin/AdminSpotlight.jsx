import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminSpotlights,
  createSpotlight,
  updateSpotlight,
  toggleSpotlightActive,
  deleteSpotlight,
} from "../../store/spotlightSlice";
import { fetchProducts } from "../../store/productsSlice";
import { optimizeImage } from "../../utils/imageOptimizer";
import {
  Sparkles, Plus, Edit, Trash2, Upload, Eye, CheckCircle2,
  ExternalLink, Layers, ArrowRight, Tag, DollarSign, X, Flame
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSpotlight() {
  const dispatch = useDispatch();
  const { adminList: spotlights, loading } = useSelector((s) => s.spotlight);
  const { list: products } = useSelector((s) => s.products);

  const [showModal, setShowModal] = useState(false);
  const [editingSpotlight, setEditingSpotlight] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    eyebrow: "FESTIVE EDITORIAL 2026",
    title: "Raw Silk Zari Kurta with Organza Dupatta",
    description: "Crafted from pure 80-gram raw silk with intricate antique kora-dabka neckline hand embroidery, paired with a laser-cut organza dupatta with scalloped borders.",
    price: 12500,
    currency: "PKR",
    dispatchBadge: "✓ Ready to Dispatch in 24h",
    hotspotText: "✨ Shop The Model's Kurta",
    hotspotPosX: 35,
    hotspotPosY: 42,
    primaryCtaText: "SHOP THIS COMPLETE OUTFIT",
    primaryCtaLink: "/products",
    secondaryCtaText: "VIEW FULL LOOKBOOK",
    secondaryCtaLink: "/products?category=luxury-pret",
    linkedProductId: "",
    isActive: true,
  });

  useEffect(() => {
    dispatch(fetchAdminSpotlights());
    dispatch(fetchProducts({ page: 1, limit: 100 }));
  }, [dispatch]);

  const openModal = (spotlight = null) => {
    setImageFile(null);
    if (spotlight) {
      setEditingSpotlight(spotlight);
      setForm({
        eyebrow: spotlight.eyebrow || "FESTIVE EDITORIAL 2026",
        title: spotlight.title || "",
        description: spotlight.description || "",
        price: spotlight.price || 12500,
        currency: spotlight.currency || "PKR",
        dispatchBadge: spotlight.dispatchBadge || "✓ Ready to Dispatch in 24h",
        hotspotText: spotlight.hotspot?.text || "✨ Shop The Model's Kurta",
        hotspotPosX: spotlight.hotspot?.posX ?? 35,
        hotspotPosY: spotlight.hotspot?.posY ?? 42,
        primaryCtaText: spotlight.primaryCta?.text || "SHOP THIS COMPLETE OUTFIT",
        primaryCtaLink: spotlight.primaryCta?.link || "/products",
        secondaryCtaText: spotlight.secondaryCta?.text || "VIEW FULL LOOKBOOK",
        secondaryCtaLink: spotlight.secondaryCta?.link || "/products?category=luxury-pret",
        linkedProductId: spotlight.linkedProduct?._id || spotlight.linkedProduct || "",
        isActive: spotlight.isActive !== false,
      });
      setImagePreview(spotlight.image?.url || spotlight.image || "");
    } else {
      setEditingSpotlight(null);
      setForm({
        eyebrow: "FESTIVE EDITORIAL 2026",
        title: "Raw Silk Zari Kurta with Organza Dupatta",
        description: "Crafted from pure 80-gram raw silk with intricate antique kora-dabka neckline hand embroidery, paired with a laser-cut organza dupatta with scalloped borders.",
        price: 12500,
        currency: "PKR",
        dispatchBadge: "✓ Ready to Dispatch in 24h",
        hotspotText: "✨ Shop The Model's Kurta",
        hotspotPosX: 35,
        hotspotPosY: 42,
        primaryCtaText: "SHOP THIS COMPLETE OUTFIT",
        primaryCtaLink: "/products",
        secondaryCtaText: "VIEW FULL LOOKBOOK",
        secondaryCtaLink: "/products?category=luxury-pret",
        linkedProductId: "",
        isActive: true,
      });
      setImagePreview("https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85");
    }
    setShowModal(true);
  };

  const handleImageFile = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleLinkedProductChange = (productId) => {
    const selected = products.find((p) => p._id === productId);
    if (selected) {
      setForm((prev) => ({
        ...prev,
        linkedProductId: productId,
        title: selected.title || prev.title,
        price: selected.discountPrice || selected.price || prev.price,
        description: selected.description ? selected.description.slice(0, 180) + "..." : prev.description,
        primaryCtaLink: `/products/${selected._id}`,
      }));
      if (selected.images?.[0]?.url && !imageFile) {
        setImagePreview(selected.images[0].url);
      }
      toast.success(`Populated from "${selected.title}"`);
    } else {
      setForm((prev) => ({ ...prev, linkedProductId: "" }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Spotlight title is required");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("eyebrow", form.eyebrow);
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("price", Number(form.price));
      fd.append("currency", form.currency);
      fd.append("dispatchBadge", form.dispatchBadge);
      fd.append("hotspotText", form.hotspotText);
      fd.append("hotspotPosX", Number(form.hotspotPosX));
      fd.append("hotspotPosY", Number(form.hotspotPosY));
      fd.append("primaryCtaText", form.primaryCtaText);
      fd.append("primaryCtaLink", form.primaryCtaLink);
      fd.append("secondaryCtaText", form.secondaryCtaText);
      fd.append("secondaryCtaLink", form.secondaryCtaLink);
      fd.append("isActive", form.isActive);
      if (form.linkedProductId) fd.append("linkedProduct", form.linkedProductId);

      if (imageFile) {
        fd.append("image", imageFile);
      }

      if (editingSpotlight) {
        await dispatch(updateSpotlight({ id: editingSpotlight._id, formData: fd }));
        toast.success("Homepage Spotlight updated & live! ✨");
      } else {
        await dispatch(createSpotlight(fd));
        toast.success("New Editorial Spotlight published! 🎉");
      }
      setShowModal(false);
      dispatch(fetchAdminSpotlights());
    } catch {
      toast.error("Failed to save spotlight");
    }
  };

  const handleToggle = async (id) => {
    try {
      await dispatch(toggleSpotlightActive(id));
      toast.success("Spotlight status updated!");
    } catch {
      toast.error("Failed to toggle spotlight");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this editorial spotlight?")) return;
    try {
      await dispatch(deleteSpotlight(id));
      toast.success("Spotlight deleted");
    } catch {
      toast.error("Failed to delete spotlight");
    }
  };

  return (
    <div className="space-y-6 pb-12">

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-mono font-bold uppercase rounded-md">
              Homepage Section 3 Engine (`/api/v11/spotlight`)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Editorial Lookbook & Spotlight Manager
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Control the high-impact "Shop The Model's Look" photoshoot, pricing, dispatch badges, and direct CTA buttons
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
        >
          <Plus size={16} /> + New Spotlight
        </button>
      </div>

      {/* Spotlights Grid */}
      <div className="space-y-6">
        {spotlights.map((spotlight) => {
          const imgUrl = spotlight.image?.url || spotlight.image || "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85";
          const isActive = spotlight.isActive !== false;

          return (
            <div
              key={spotlight._id}
              className={`bg-white border rounded-2xl p-6 shadow-xs hover:shadow-md transition-all ${
                isActive ? "border-slate-200" : "border-rose-200 bg-rose-50/10 opacity-70"
              }`}
            >
              {/* Header inside card */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                    isActive ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-rose-50 text-rose-800 border-rose-200"
                  }`}>
                    {isActive ? "LIVE ON HOMEPAGE (SECTION 3)" : "INACTIVE / DRAFT"}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">#{spotlight._id?.slice(-8)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(spotlight._id)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                  >
                    {isActive ? "Pause Section" : "Set Active"}
                  </button>
                  <button
                    onClick={() => openModal(spotlight)}
                    className="p-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-lg transition-colors border border-indigo-200"
                    title="Edit Spotlight"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(spotlight._id)}
                    className="p-2 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white rounded-lg transition-colors border border-rose-200"
                    title="Delete Spotlight"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Exact 1:1 Live Preview of Homepage Section 3 */}
              <div className="bg-[#141410] text-white rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-lg">
                {/* Left: Model Photo */}
                <div className="lg:col-span-5 relative aspect-[3/4] lg:aspect-auto lg:h-[380px] overflow-hidden bg-black">
                  <img
                    src={optimizeImage(imgUrl, { width: 800 })}
                    alt={spotlight.title}
                    className="w-full h-full object-cover object-top"
                  />
                  {/* Clickable Hotspot Badge */}
                  <div
                    className="absolute bg-white/90 backdrop-blur-md text-black px-3.5 py-1.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-1.5"
                    style={{
                      left: `${spotlight.hotspot?.posX ?? 35}%`,
                      top: `${spotlight.hotspot?.posY ?? 40}%`,
                    }}
                  >
                    <Sparkles size={12} className="text-[#d4af37]" />
                    <span>{spotlight.hotspot?.text || "✨ Shop The Model's Kurta"}</span>
                  </div>
                </div>

                {/* Right: Lookbook Details & Fast Checkout */}
                <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-4">
                  <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#d4af37]">
                    {spotlight.eyebrow || "FESTIVE EDITORIAL 2026"}
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-tight text-white">
                    {spotlight.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {spotlight.description}
                  </p>

                  <div className="flex items-baseline gap-4 py-2 border-y border-white/10">
                    <span className="font-serif text-2xl font-bold text-[#d4af37]">
                      {spotlight.currency || "PKR"} {Number(spotlight.price || 12500).toLocaleString()}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-500/20">
                      {spotlight.dispatchBadge || "✓ Ready to Dispatch in 24h"}
                    </span>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-3">
                    <span className="px-6 py-2.5 bg-[#d4af37] text-black font-bold text-xs uppercase tracking-[0.15em] rounded shadow-md">
                      {spotlight.primaryCta?.text || "SHOP THIS COMPLETE OUTFIT"}
                    </span>
                    <span className="px-5 py-2.5 border border-white/30 text-white text-xs font-bold uppercase tracking-[0.15em] rounded">
                      {spotlight.secondaryCta?.text || "VIEW FULL LOOKBOOK"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Editor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[92vh] text-slate-900 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingSpotlight ? "Edit Editorial Spotlight" : "Create Homepage Spotlight (Section 3)"}
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Upload magazine photoshoot, customize lookbook copy, and link store products
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Autofill from Store Product */}
              <div className="bg-amber-50/60 border border-amber-200 p-3.5 rounded-xl">
                <label className="block text-amber-900 font-bold uppercase mb-1 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-700" />
                  Quick Autofill from Active Store Product (Optional)
                </label>
                <select
                  value={form.linkedProductId}
                  onChange={(e) => handleLinkedProductChange(e.target.value)}
                  className="w-full bg-white border border-amber-300 p-2.5 rounded-lg text-slate-900 font-medium outline-none"
                >
                  <option value="">-- Choose a product to auto-populate Title & Price --</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title} (PKR {(p.discountPrice || p.price)?.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Eyebrow Tag *</label>
                  <input
                    type="text"
                    required
                    value={form.eyebrow}
                    onChange={(e) => setForm({ ...form, eyebrow: e.target.value })}
                    placeholder="e.g. FESTIVE EDITORIAL 2026"
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 font-medium outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Spotlight Outfit Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Raw Silk Zari Kurta with Organza Dupatta"
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 font-medium outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase mb-1">Editorial Description Copy</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Crafted from pure 80-gram raw silk with intricate antique kora-dabka..."
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Outfit Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="12500"
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 font-mono font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Dispatch Badge</label>
                  <input
                    type="text"
                    value={form.dispatchBadge}
                    onChange={(e) => setForm({ ...form, dispatchBadge: e.target.value })}
                    placeholder="✓ Ready to Dispatch in 24h"
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Hotspot Pin Label</label>
                  <input
                    type="text"
                    value={form.hotspotText}
                    onChange={(e) => setForm({ ...form, hotspotText: e.target.value })}
                    placeholder="✨ Shop The Model's Kurta"
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Photoshoot Upload */}
              <div>
                <label className="block text-slate-700 font-bold uppercase mb-1">Lookbook Photoshoot Upload (Cloudinary CDN)</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/40 p-4 rounded-xl flex items-center gap-4 cursor-pointer transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-600 flex-shrink-0">
                    <Upload size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {imageFile ? imageFile.name : "Click to select model photoshoot image"}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">Portrait 3:4 or 4:5 ratio recommended</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleImageFile(e.target.files[0]);
                    }}
                  />
                </div>
              </div>

              {/* CTAs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Primary Button Text & Link</label>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={form.primaryCtaText}
                      onChange={(e) => setForm({ ...form, primaryCtaText: e.target.value })}
                      placeholder="SHOP THIS COMPLETE OUTFIT"
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900 outline-none"
                    />
                    <input
                      type="text"
                      value={form.primaryCtaLink}
                      onChange={(e) => setForm({ ...form, primaryCtaLink: e.target.value })}
                      placeholder="/products/66ce..."
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900 font-mono outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Secondary Button Text & Link</label>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={form.secondaryCtaText}
                      onChange={(e) => setForm({ ...form, secondaryCtaText: e.target.value })}
                      placeholder="VIEW FULL LOOKBOOK"
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900 outline-none"
                    />
                    <input
                      type="text"
                      value={form.secondaryCtaLink}
                      onChange={(e) => setForm({ ...form, secondaryCtaLink: e.target.value })}
                      placeholder="/products?category=luxury-pret"
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-900 font-mono outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-slate-900 text-white font-bold uppercase tracking-wider rounded-xl hover:bg-black transition-colors shadow-md"
                >
                  Save & Publish Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
