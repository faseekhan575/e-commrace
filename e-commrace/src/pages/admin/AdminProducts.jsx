import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, fetchCategories, deleteProduct } from "../../store/productsSlice";
import { Link } from "react-router-dom";
import axios from "../../axiosConfig";
import toast from "react-hot-toast";
import { Plus, Edit, Trash2, Search, Package } from "lucide-react";

export default function AdminProducts() {
  const dispatch = useDispatch();
  const { list: products, categories, loading } = useSelector((s) => s.products);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 50 }));
    dispatch(fetchCategories());
  }, [dispatch]);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || p.category?._id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await dispatch(deleteProduct(productToDelete._id));
      toast.success("Product deleted successfully");
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (err) {
      toast.error("Failed to delete product");
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl font-700 text-white">Products</h1>
          <p className="text-[#787878]">{filteredProducts.length} items</p>
        </div>

        <Link
          to="/admin/products/create"
          className="flex items-center gap-3 bg-[#e8b520] hover:bg-[#d4a017] text-black px-6 py-3 rounded-2xl font-semibold transition-colors"
        >
          <Plus size={20} />
          Add New Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-3xl p-6 mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#787878]" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111] border border-[#1e1e1e] pl-12 py-3.5 rounded-2xl text-white placeholder:text-[#525252] focus:border-[#e8b520] outline-none"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-[#111] border border-[#1e1e1e] px-5 py-3.5 rounded-2xl text-white focus:border-[#e8b520] outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e1e1e]">
                <th className="px-6 py-5 text-left text-xs font-medium text-[#787878] uppercase tracking-wider">Product</th>
                <th className="px-6 py-5 text-left text-xs font-medium text-[#787878] uppercase tracking-wider">Category</th>
                <th className="px-6 py-5 text-left text-xs font-medium text-[#787878] uppercase tracking-wider">Price</th>
                <th className="px-6 py-5 text-left text-xs font-medium text-[#787878] uppercase tracking-wider">Stock</th>
                <th className="px-6 py-5 text-left text-xs font-medium text-[#787878] uppercase tracking-wider">Status</th>
                <th className="px-6 py-5 text-right text-xs font-medium text-[#787878] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e]">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-[#111] transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <img
                        src={product.images?.[0]?.url}
                        alt={product.title}
                        className="w-12 h-12 object-cover rounded-xl"
                      />
                      <div>
                        <p className="text-white font-medium line-clamp-1">{product.title}</p>
                        <p className="text-xs text-[#525252]">ID: {product._id.slice(-8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-white">
                    {product.category?.name || "Uncategorized"}
                  </td>
                  <td className="px-6 py-5">
                    <div>
                      <p className="text-white font-semibold">
                        ₨ {(product.discountPrice || product.price).toLocaleString()}
                      </p>
                      {product.discountPrice && (
                        <p className="text-xs text-red-500 line-through">
                          ₨ {product.price.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      product.stock > 10 ? "bg-green-500/10 text-green-400" :
                      product.stock > 0 ? "bg-yellow-500/10 text-yellow-400" : "bg-red-500/10 text-red-400"
                    }`}>
                      {product.stock} left
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-4 py-1 rounded-full text-xs font-medium ${
                      product.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                    }`}>
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        to={`/admin/products/${product._id}/edit`}
                        className="p-2 hover:bg-[#1e1e1e] rounded-xl text-[#e8b520] hover:text-white transition-colors"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(product)}
                        className="p-2 hover:bg-[#1e1e1e] rounded-xl text-red-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <Package size={60} className="mx-auto text-[#333] mb-4" />
            <p className="text-white text-xl">No products found</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-3xl p-8 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-2">Delete Product?</h3>
            <p className="text-[#787878]">
              Are you sure you want to delete <span className="text-white">"{productToDelete?.title}"</span>? 
              This action cannot be undone.
            </p>
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3.5 border border-[#1e1e1e] rounded-2xl text-white hover:bg-[#1e1e1e]"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 rounded-2xl text-white font-medium"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}