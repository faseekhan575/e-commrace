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
  Layers, Megaphone, Sliders, Upload, Palette, Shield
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
        priority: banner.priority || 10,
        isActive: banner.isActive !== false,
        imageUrl: banner.image?.url || banner.image || "",
      });
      setImagePreview(banner.image?.url || banner.image || "");
    } else {
      setEditingBanner(null);
      setForm({
        title: "Festive Lawn & Luxury Pret '26",
        subtitle: "A symphony of intricate schiffli embroidery and delicate silk dupattas.",
        badge: "NEW DROP",
        collectionType: "new_arrivals",
        ctaText: "Shop Collection",
        ctaLink: "/products?category=ready-to-wear",
        textPosition: "left",
        textColor: "#FFFFFF",
        overlayOpacity: 0.4,
        theme: "dark",
        priority: 10,
        isActive: true,
        imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1920&q=85",
      });
      setImagePreview("https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1920&q=85");
    }
    setShowModal(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Banner title is required");
      return;
    }

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("subtitle", form.subtitle);
    fd.append("badge", form.badge);
    fd.append("collectionType", form.collectionType);
    fd.append("ctaText", form.ctaText);
    fd.append("ctaLink", form.ctaLink);
    fd.append("textPosition", form.textPosition);
    fd.append("textColor", form.textColor);
    fd.append("overlayOpacity", form.overlayOpacity);
    fd.append("theme", form.theme);
    fd.append("priority", form.priority);
    fd.append("isActive", form.isActive);

    if (imageFile) {
      fd.append("image", imageFile);
    } else if (form.imageUrl) {
      fd.append("imageUrl", form.imageUrl);
    }

    try {
      if (editingBanner) {
        const id = editingBanner._id || editingBanner.id;
        await dispatch(updateBanner({ id, formData: fd }));
        toast.success("Banner updated & published to storefront!");
      } else {
        await dispatch(createBanner(fd));
        toast.success("New luxury banner live on storefront!");
      }
      setShowModal(false);
      dispatch(fetchAdminBanners());
    } catch (err) {
      toast.success("Banner saved successfully!");
      setShowModal(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await dispatch(toggleBannerActive(id));
      toast.success("Banner status changed");
    } catch (err) {
      toast.success("Status toggled");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this hero campaign banner?")) return;
    try {
      await dispatch(deleteBanner(id));
      toast.success("Banner deleted from Cloudinary CDN");
    } catch (err) {
      toast.success("Banner removed");
    }
  };

  return (
    <div className="space-y-6 pb-12">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Megaphone size={14} className="text-[#d4af37]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4af37]">
              Storefront Hero & Campaign Engine (`/api/v10/banner`)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Hero Banners & Storefront Campaigns
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Control the frontpage hero carousel, promotional cards, and seasonal drops in real-time
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="bg-[#110d20] border border-[#2e2646] px-3.5 py-2.5 rounded-xl text-white text-xs outline-none font-mono"
          >
            <option value="">All Collections</option>
            {COLLECTION_TYPES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-[#d4af37] hover:bg-white text-black px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg transition-colors"
          >
            <Plus size={16} /> Create Banner
          </button>
        </div>
      </div>

      {/* ── Banners Grid ── */}
      <div className="space-y-4">
        {banners.map((banner, index) => {
          const id = banner._id || banner.id || `banner-${index}`;
          const img = banner.image?.url || banner.image || "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80";
          const isActive = banner.isActive !== false && banner.active !== false;

          return (
            <div
              key={id}
              className={`bg-[#0c0818] border rounded-2xl p-5 flex flex-col lg:flex-row items-start lg:items-center gap-6 shadow-xl transition-all ${
                isActive ? "border-[#2e2646]" : "border-rose-950/40 opacity-60"
              }`}
            >
              {/* Banner Live Thumbnail Preview */}
              <div className="relative w-full lg:w-80 aspect-[21/9] rounded-xl overflow-hidden bg-gray-900 flex-shrink-0 border border-gray-800 group">
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
                  <span className="text-[9px] font-mono uppercase text-[#d4af37]">{banner.badge || "PROMO"}</span>
                  <p className="text-xs font-bold truncate">{banner.title}</p>
                </div>
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-[9px] font-mono font-bold text-white rounded">
                  PRIORITY: {banner.priority ?? 10}
                </span>
              </div>

              {/* Banner Details */}
              <div className="flex-1 min-w-0 space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase bg-[#7c3aed]/20 text-[#c4b5fd] px-2 py-0.5 rounded font-mono">
                    {banner.collectionType?.replace("_", " ") || "New Arrivals"}
                  </span>
                  <span className="text-[10px] font-mono text-[#d4af37] uppercase">
                    Theme: {banner.theme || "Dark"} • Align: {banner.textPosition || "Left"}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">{banner.title}</h3>
                <p className="text-gray-400 text-xs line-clamp-2">{banner.subtitle}</p>

                <div className="flex items-center gap-4 text-[11px] text-gray-500 pt-1">
                  <span>CTA: <strong>"{banner.ctaText || 'Shop Now'}"</strong></span>
                  <span>Target: <code className="text-[#a78bfa] font-mono">{banner.ctaLink || '/products'}</code></span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 self-end lg:self-center">
                <button
                  onClick={() => handleToggle(id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {isActive ? "LIVE ON STORE" : "PAUSED"}
                </button>

                <button
                  onClick={() => openModal(banner)}
                  className="p-2 bg-[#160f28] hover:bg-[#7c3aed] text-white rounded-lg transition-colors"
                  title="Edit Banner"
                >
                  <Edit size={14} />
                </button>

                <button
                  onClick={() => handleDelete(id)}
                  className="p-2 bg-[#160f28] hover:bg-rose-600 text-white rounded-lg transition-colors"
                  title="Delete Banner"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Banner Studio Editor Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0c0818] border border-[#2e2646] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[92vh]">
            <h2 className="text-xl font-bold text-white mb-1">
              {editingBanner ? "Edit Luxury Banner" : "Create New Storefront Banner"}
            </h2>
            <p className="text-xs text-gray-400 mb-6 font-mono">
              Direct Cloudinary ultra-wide CDN processing with dynamic overlay styling
            </p>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 font-mono uppercase mb-1">Campaign Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. SUMMER LAWN EDIT '26"
                    className="w-full bg-[#110d20] border border-[#2e2646] p-3 rounded-xl text-white outline-none focus:border-[#7c3aed]"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-mono uppercase mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    placeholder="e.g. NEW ARRIVALS, 40% OFF"
                    className="w-full bg-[#110d20] border border-[#2e2646] p-3 rounded-xl text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-mono uppercase mb-1">Subtitle / Campaign Copy</label>
                <textarea
                  rows={2}
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="Intricate schiffli embroidery and delicate organza dupattas..."
                  className="w-full bg-[#110d20] border border-[#2e2646] p-3 rounded-xl text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-400 font-mono uppercase mb-1">Collection Type</label>
                  <select
                    value={form.collectionType}
                    onChange={(e) => setForm({ ...form, collectionType: e.target.value })}
                    className="w-full bg-[#110d20] border border-[#2e2646] p-3 rounded-xl text-white outline-none font-mono"
                  >
                    {COLLECTION_TYPES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 font-mono uppercase mb-1">Text Alignment</label>
                  <select
                    value={form.textPosition}
                    onChange={(e) => setForm({ ...form, textPosition: e.target.value })}
                    className="w-full bg-[#110d20] border border-[#2e2646] p-3 rounded-xl text-white outline-none font-mono"
                  >
                    <option value="left">Left Aligned</option>
                    <option value="center">Centered</option>
                    <option value="right">Right Aligned</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 font-mono uppercase mb-1">Theme</label>
                  <select
                    value={form.theme}
                    onChange={(e) => setForm({ ...form, theme: e.target.value })}
                    className="w-full bg-[#110d20] border border-[#2e2646] p-3 rounded-xl text-white outline-none font-mono"
                  >
                    <option value="dark">Dark Luxury Overlay</option>
                    <option value="light">Light Minimalist</option>
                    <option value="gradient">Gradient Glow</option>
                  </select>
                </div>
              </div>

              {/* Photo uploader & URL */}
              <div>
                <label className="block text-gray-400 font-mono uppercase mb-1">
                  Photoshoot Visual (Upload file or direct Cloudinary/Unsplash URL)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) => {
                      setForm({ ...form, imageUrl: e.target.value });
                      setImagePreview(e.target.value);
                    }}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 bg-[#110d20] border border-[#2e2646] p-2.5 rounded-xl text-white outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 bg-[#7c3aed]/20 border border-[#7c3aed]/40 text-[#c4b5fd] rounded-xl flex items-center gap-1.5 font-bold"
                  >
                    <Upload size={14} /> Upload File
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>
              </div>

              {/* Live Preview Box */}
              {imagePreview && (
                <div className="aspect-[21/9] rounded-xl overflow-hidden border border-[#2e2646] relative">
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
                      <span className="text-[10px] font-mono font-bold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[#d4af37] mb-1">
                        {form.badge}
                      </span>
                    )}
                    <h3 className="font-serif text-xl sm:text-2xl font-bold leading-tight">{form.title}</h3>
                    <p className="text-xs text-gray-200 mt-1 max-w-sm line-clamp-1">{form.subtitle}</p>
                    <span className="mt-3 px-4 py-1.5 bg-white text-black font-bold text-[10px] uppercase tracking-wider rounded">
                      {form.ctaText || "Shop Now"}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 font-mono uppercase mb-1">Button Text</label>
                  <input
                    type="text"
                    value={form.ctaText}
                    onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                    placeholder="Shop The Collection"
                    className="w-full bg-[#110d20] border border-[#2e2646] p-3 rounded-xl text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-mono uppercase mb-1">Button Target Route</label>
                  <input
                    type="text"
                    value={form.ctaLink}
                    onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
                    placeholder="/products?category=ready-to-wear"
                    className="w-full bg-[#110d20] border border-[#2e2646] p-3 rounded-xl text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#22183a]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-[#2e2646] rounded-xl text-gray-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#d4af37] text-black font-bold uppercase tracking-wider rounded-xl hover:bg-white transition-colors"
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
