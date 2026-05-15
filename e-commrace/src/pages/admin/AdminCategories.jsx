import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../../store/productsSlice";
import axios from "../../axiosConfig";
import toast from "react-hot-toast";
import { Plus, Edit, Trash2, Image } from "lucide-react";

export default function AdminCategories() {
  const dispatch = useDispatch();
  const { categories, loading } = useSelector((s) => s.products);

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({ name: "", slug: "", image: null });
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const resetForm = () => {
    setForm({ name: "", slug: "", image: null });
    setPreview(null);
    setEditingCategory(null);
  };

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setForm({
        name: category.name,
        slug: category.slug || "",
        image: null,
      });
      setPreview(category.image?.url);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      toast.error("Category name is required");
      return;
    }

    setSubmitting(true);
    const fd = new FormData();
    fd.append("name", form.name);
    if (form.slug) fd.append("slug", form.slug);
    if (form.image) fd.append("image", form.image);

    try {
      if (editingCategory) {
        await axios.patch(`/api/v4/category/${editingCategory._id}/update`, fd);
        toast.success("Category updated successfully");
      } else {
        await axios.post("/api/v4/category/create", fd);
        toast.success("Category created successfully");
      }
      dispatch(fetchCategories());
      setShowModal(false);
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await axios.delete(`/api/v4/category/${id}/delete`);
      toast.success("Category deleted");
      dispatch(fetchCategories());
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-4xl font-700 text-white">Categories</h1>
          <p className="text-[#787878]">{categories.length} total categories</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-3 bg-[#e8b520] hover:bg-[#d4a017] text-black px-6 py-3 rounded-2xl font-semibold transition-colors"
        >
          <Plus size={20} />
          New Category
        </button>
      </div>

      <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-3xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {categories.map((cat) => (
            <div key={cat._id} className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden group">
              <div className="h-48 relative">
                {cat.image?.url ? (
                  <img src={cat.image.url} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
                    <Image size={48} className="text-[#444]" />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => openModal(cat)}
                    className="p-2 bg-black/70 hover:bg-black rounded-xl text-white"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="p-2 bg-black/70 hover:bg-red-600 rounded-xl text-white"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-white font-semibold text-lg">{cat.name}</h3>
                <p className="text-xs text-[#666] font-mono">/{cat.slug}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-3xl w-full max-w-md p-8">
            <h2 className="text-2xl font-semibold text-white mb-6">
              {editingCategory ? "Edit Category" : "New Category"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm text-[#787878] mb-2">Category Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#111] border border-[#1e1e1e] rounded-2xl px-5 py-3.5 text-white focus:border-[#e8b520]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-[#787878] mb-2">Slug (optional)</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full bg-[#111] border border-[#1e1e1e] rounded-2xl px-5 py-3.5 text-white focus:border-[#e8b520]"
                  placeholder="electronics"
                />
              </div>

              <div>
                <label className="block text-sm text-[#787878] mb-2">Category Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setForm({ ...form, image: file });
                    if (file) setPreview(URL.createObjectURL(file));
                  }}
                  className="w-full text-white"
                />
                {preview && (
                  <img src={preview} alt="preview" className="mt-4 w-32 h-32 object-cover rounded-2xl" />
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 py-3.5 border border-[#1e1e1e] rounded-2xl text-white hover:bg-[#1e1e1e]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3.5 bg-[#e8b520] hover:bg-[#d4a017] text-black font-semibold rounded-2xl transition-colors disabled:opacity-70"
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