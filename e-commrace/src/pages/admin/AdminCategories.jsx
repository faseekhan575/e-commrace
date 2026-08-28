import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../../store/productsSlice";
import { CLOTHING_CATEGORIES } from "../../data/clothingData";
import axios from "../../axiosConfig";
import toast from "react-hot-toast";
import { Plus, Edit, Trash2, Image, Sparkles } from "lucide-react";

export default function AdminCategories() {
  const dispatch = useDispatch();
  const { categories: serverCategories } = useSelector((s) => s.products);

  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({ name: "", slug: "", subtitle: "", imageUrl: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (serverCategories && serverCategories.length > 0) {
      setCategories(serverCategories);
    } else {
      setCategories(CLOTHING_CATEGORIES);
    }
  }, [serverCategories]);

  const openModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setForm({
        name: cat.name,
        slug: cat.slug || "",
        subtitle: cat.subtitle || "",
        imageUrl: cat.image?.url || "",
      });
    } else {
      setEditingCategory(null);
      setForm({ name: "", slug: "", subtitle: "", imageUrl: "" });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Category name required");
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        setCategories((prev) =>
          prev.map((c) =>
            c._id === editingCategory._id
              ? { ...c, name: form.name, slug: form.slug, subtitle: form.subtitle, image: { url: form.imageUrl || c.image?.url } }
              : c
          )
        );
        toast.success("Category updated successfully");
      } else {
        const newCat = {
          _id: `cat-${Date.now()}`,
          name: form.name,
          slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
          subtitle: form.subtitle || "New Collection",
          image: { url: form.imageUrl || "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80" },
        };
        setCategories((prev) => [newCat, ...prev]);
        toast.success("New apparel collection created!");
      }
      setShowModal(false);
    } catch (err) {
      toast.error("Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this fashion collection?")) return;
    setCategories((prev) => prev.filter((c) => c._id !== id));
    toast.success("Category deleted");
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Fashion Collections & Categories
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Organize Ready to Wear, Unstitched Lawn, Luxury Pret, and Seasonal Edits
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-[#d4af37] hover:bg-white text-black px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg transition-colors"
        >
          <Plus size={16} /> New Collection
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div key={cat._id} className="bg-[#0c0818] border border-[#22183a] rounded-2xl overflow-hidden group shadow-lg">
            <div className="aspect-[4/3] relative overflow-hidden bg-gray-900">
              <img
                src={cat.image?.url || "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80"}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => openModal(cat)}
                  className="p-2 bg-black/60 hover:bg-[#7c3aed] text-white rounded-lg transition-colors"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="p-2 bg-black/60 hover:bg-rose-600 text-white rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h3 className="font-bold text-base">{cat.name}</h3>
                <p className="text-[11px] text-gray-300 font-sans">{cat.subtitle || "Pret & Unstitched"}</p>
              </div>
            </div>
            <div className="p-3 bg-[#110d20] flex items-center justify-between text-[11px] font-mono text-gray-400">
              <span>/{cat.slug || cat.name.toLowerCase()}</span>
              <span className="text-[#a78bfa]">Active</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0c0818] border border-[#2e2646] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4">
              {editingCategory ? "Edit Apparel Collection" : "Create New Apparel Collection"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-mono uppercase mb-1">Collection Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Ready to Wear, Luxury Pret, Festive Lawn"
                  className="w-full bg-[#110d20] border border-[#2e2646] p-3 rounded-xl text-white outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-mono uppercase mb-1">Subtitle / Tagline</label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="e.g. 2-Piece & 3-Piece Lawn"
                  className="w-full bg-[#110d20] border border-[#2e2646] p-3 rounded-xl text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-mono uppercase mb-1">Banner Image URL</label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#110d20] border border-[#2e2646] p-3 rounded-xl text-white outline-none font-mono"
                />
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
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-[#7c3aed] text-white rounded-xl font-bold hover:bg-[#6d28d9]"
                >
                  {submitting ? "Saving..." : "Save Collection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}