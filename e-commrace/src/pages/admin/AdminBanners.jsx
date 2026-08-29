import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminBanners, createBanner, updateBanner,
  toggleBannerActive, deleteBanner
} from "../../store/bannerSlice";
import { optimizeImage } from "../../utils/imageOptimizer";
import {
  Plus, Edit, Trash2, Image as ImageIcon, Sparkles,
  Eye, Check, ArrowUp, ArrowDown, ExternalLink,
  Layers, Megaphone, Sliders, Upload, Palette, Shield, X
} from "lucide-react";
import toast from "react-hot-toast";

const COLLECTION_TYPES = [
  { value: "new_arrivals", label: "New Arrivals '26" },
  { value: "summer_collection", label: "Summer Lawn Collection" },
  { value: "monthly_drop", label: "Monthly Couture Drop" },
  { value: "winter_collection", label: "Winter Velvet & Cambric" },
  { value: "flash_sale", label: "Flash Sale & Special Offers" },
  { value: "featured_hero", label: "Main Brand Hero Banner" },
  { value: "custom", label: "Custom Campaign" },
];

export default function AdminBanners() {
  const dispatch = useDispatch();
  const { adminList: banners, loading } = useSelector((s) => s.banners);

  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    badge: "NEW ARRIVALS",
    collectionType: "new_arrivals",
    ctaText: "Shop The Collection",
    ctaLink: "/products?category=ready-to-wear",
    textPosition: "left",
    textColor: "#FFFFFF",
    overlayOpacity: 0.4,
    theme: "dark",
    priority: 10,
    isActive: true,
    imageUrl: "",
  });

  useEffect(() => {
    dispatch(fetchAdminBanners({ collectionType: selectedFilter }));
  }, [dispatch, selectedFilter]);

  const openModal = (banner = null) => {
    setImageFile(null);
    if (banner) {
      setEditingBanner(banner);
      setForm({
        title: banner.title || "",
        subtitle: banner.subtitle || "",
        badge: banner.badge || "NEW ARRIVALS",
        collectionType: banner.collectionType || "new_arrivals",
        ctaText: banner.ctaText || "Shop Now",
        ctaLink: banner.ctaLink || "/products",
        textPosition: banner.textPosition || "left",
        textColor: banner.textColor || "#FFFFFF",
        overlayOpacity: banner.overlayOpacity ?? 0.4,
        theme: banner.theme || "dark",
        priority: banner.priority ?? 10,
        isActive: banner.isActive !== false,
        imageUrl: banner.image?.url || banner.image || "",
      });
      setImagePreview(banner.image?.url || banner.image || "");
    } else {
      setEditingBanner(null);
      setForm({
        title: "",
        subtitle: "",
        badge: "NEW ARRIVALS",
        collectionType: "new_arrivals",
        ctaText: "Shop The Collection",
        ctaLink: "/products?category=ready-to-wear",
        textPosition: "left",
        textColor: "#FFFFFF",
        overlayOpacity: 0.4,
        theme: "dark",
        priority: 10,
        isActive: true,
        imageUrl: "",
      });
      setImagePreview("https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80");
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

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Banner title is required");
      return;
    }

    try {
      const fd = new FormData();
      Object.keys(form).forEach((k) => {
        if (k !== "imageUrl") fd.append(k, form[k]);
      });
      if (imageFile) {
        fd.append("image", imageFile);
      } else if (form.imageUrl) {
        fd.append("imageUrl", form.imageUrl);
      }

      if (editingBanner) {
        await dispatch(updateBanner({ id: editingBanner._id || editingBanner.id, formData: fd }));
        toast.success("Hero Banner updated successfully! ✨");
      } else {
        await dispatch(createBanner(fd));
        toast.success("New Hero Banner created & live! 🎉");
      }
      setShowModal(false);
      dispatch(fetchAdminBanners({ collectionType: selectedFilter }));
    } catch {
      toast.error("Failed to save banner");
    }
  };

  const handleToggle = async (id) => {
    try {
      await dispatch(toggleBannerActive(id));
      toast.success("Banner visibility status updated!");
    } catch {
      toast.error("Failed to toggle banner");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this promotional banner?")) return;
    try {
      await dispatch(deleteBanner(id));
      toast.success("Banner deleted successfully");
    } catch {
      toast.error("Failed to delete banner");
    }
  };

  return (
    <div className="space-y-6 pb-12">

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-mono font-bold uppercase rounded-md">
              Hero & Campaign Manager
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Storefront Banners & Campaigns
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage high-converting hero sliders, seasonal edits, and promotional campaign banners
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-slate-900 text-xs outline-none font-medium"
          >
            <option value="">All Campaigns</option>
            {COLLECTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={16} /> + New Banner
          </button>
        </div>
      </div>

      {/* Banners Grid */}
      <div className="space-y-4">
        {banners.map((banner, index) => {
          const id = banner._id || banner.id || `banner-${index}`;
          const img = banner.image?.url || banner.image || "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80";
          const isActive = banner.isActive !== false && banner.active !== false;

          return (
            <div
              key={id}
              className={`bg-white border rounded-2xl p-5 flex flex-col lg:flex-row items-start lg:items-center gap-6 shadow-xs hover:shadow-md transition-all ${
                isActive ? "border-slate-200 hover:border-indigo-300" : "border-rose-200 bg-rose-50/20 opacity-70"
              }`}
            >
              {/* Banner Live Thumbnail Preview */}
              <div className="relative w-full lg:w-80 aspect-[21/9] rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200 group">
                <img
                  src={optimizeImage(img, { width: 600 })}
                  alt={banner.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div
                  className="absolute inset-0 flex flex-col justify-end p-3"
                  style={{
                    backgroundColor: `rgba(0,0,0,${banner.overlayOpacity ?? 0.4})`,
                    color: banner.textColor || "#FFF",
                  }}
                >
                  <span className="text-[9px] font-mono uppercase text-amber-300 font-bold">{banner.badge || "PROMO"}</span>
                  <p className="text-xs font-bold truncate text-white">{banner.title}</p>
                </div>
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-[9px] font-mono font-bold text-white rounded">
                  PRIORITY: {banner.priority ?? 10}
                </span>
              </div>

              {/* Banner Details */}
              <div className="flex-1 min-w-0 space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-mono">
                    {banner.collectionType?.replace("_", " ") || "New Arrivals"}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    Theme: {banner.theme || "Dark"} • Align: {banner.textPosition || "Left"}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">{banner.title}</h3>
                <p className="text-slate-500 text-xs line-clamp-2">{banner.subtitle}</p>

                <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                  <span>CTA: <strong className="text-slate-800">"{banner.ctaText || 'Shop Now'}"</strong></span>
                  <span>Target: <code className="text-indigo-600 font-mono">{banner.ctaLink || '/products'}</code></span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 self-end lg:self-center">
                <button
                  onClick={() => handleToggle(id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors border ${
                    isActive
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-rose-50 text-rose-800 border-rose-200"
                  }`}
                >
                  {isActive ? "LIVE ON STORE" : "PAUSED"}
                </button>

                <button
                  onClick={() => openModal(banner)}
                  className="p-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-lg transition-colors border border-slate-200"
                  title="Edit Banner"
                >
                  <Edit size={14} />
                </button>

                <button
                  onClick={() => handleDelete(id)}
                  className="p-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 rounded-lg transition-colors border border-slate-200"
                  title="Delete Banner"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Banner Studio Editor Modal (White Theme) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[92vh] text-slate-900 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingBanner ? "Edit Luxury Banner" : "Create New Storefront Banner"}
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Direct ultra-wide CDN banner processing with dynamic overlay styling
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Campaign Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. SUMMER LAWN EDIT '26"
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    placeholder="e.g. NEW ARRIVALS, 40% OFF"
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase mb-1">Subtitle / Campaign Copy</label>
                <textarea
                  rows={2}
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="Intricate schiffli embroidery and delicate organza dupattas..."
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 outline-none"
                />
              </div>

              {/* Photo Upload Box */}
              <div>
                <label className="block text-slate-700 font-bold uppercase mb-1">Banner Graphic Upload</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/40 p-4 rounded-xl flex items-center gap-4 cursor-pointer transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-600 flex-shrink-0">
                    <Upload size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {imageFile ? imageFile.name : "Click to select ultra-wide banner image"}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">PNG, JPG, WEBP (21:9 or 16:9 ratio recommended)</p>
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

              {/* Live Preview Box */}
              {imagePreview && (
                <div className="aspect-[21/9] rounded-xl overflow-hidden border border-slate-200 relative shadow-sm">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div
                    className={`absolute inset-0 p-6 flex flex-col justify-center ${
                      form.textPosition === "center" ? "items-center text-center" : form.textPosition === "right" ? "items-end text-right" : "items-start text-left"
                    }`}
                    style={{
                      backgroundColor: `rgba(0,0,0,${form.overlayOpacity})`,
                      color: form.textColor,
                    }}
                  >
                    {form.badge && (
                      <span className="text-[10px] font-mono font-bold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-amber-300 mb-1">
                        {form.badge}
                      </span>
                    )}
                    <h3 className="font-serif text-xl sm:text-2xl font-bold leading-tight text-white">{form.title}</h3>
                    <p className="text-xs text-slate-200 mt-1 max-w-sm line-clamp-1">{form.subtitle}</p>
                    <span className="mt-3 px-4 py-1.5 bg-white text-slate-900 font-bold text-[10px] uppercase tracking-wider rounded-lg shadow-sm">
                      {form.ctaText || "Shop Now"}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Button Text</label>
                  <input
                    type="text"
                    value={form.ctaText}
                    onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                    placeholder="Shop The Collection"
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Button Target Route</label>
                  <input
                    type="text"
                    value={form.ctaLink}
                    onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
                    placeholder="/products?category=ready-to-wear"
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 outline-none font-mono"
                  />
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
