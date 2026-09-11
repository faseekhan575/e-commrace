import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Search, X, ArrowRight, Sparkles, Tag, TrendingUp } from "lucide-react";
import { optimizeImage } from "../utils/imageOptimizer";

const POPULAR_SEARCH_TAGS = [
  "Ready to Wear",
  "Lawn",
  "Kurta",
  "Luxury Pret",
  "Velvet",
  "Chiffon",
  "Cambric",
  "2-Piece",
  "Sale",
  "Floral",
];

export default function HeaderSearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const { list: allProducts = [], categories = [] } = useSelector((s) => s.products);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter matching categories and products in real-time
  const cleanQ = query.trim().toLowerCase();

  const matchingCategories = cleanQ
    ? categories.filter((c) => c.name?.toLowerCase().includes(cleanQ) || c.slug?.toLowerCase().includes(cleanQ)).slice(0, 4)
    : [];

  const matchingProducts = cleanQ
    ? allProducts
        .filter((p) => {
          return (
            p.title?.toLowerCase().includes(cleanQ) ||
            p.fabric?.toLowerCase().includes(cleanQ) ||
            p.category?.name?.toLowerCase().includes(cleanQ) ||
            p.tags?.some((t) => t.toLowerCase().includes(cleanQ))
          );
        })
        .slice(0, 6)
    : [];

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (cleanQ) {
      navigate(`/products?search=${encodeURIComponent(cleanQ)}`);
      onClose();
    }
  };

  const handleTagClick = (tag) => {
    navigate(`/products?search=${encodeURIComponent(tag)}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative min-h-screen px-4 pt-16 pb-20 sm:p-0 flex items-start justify-center">
        <div className="relative bg-white w-full max-w-3xl rounded-none sm:rounded-sm shadow-2xl overflow-hidden mt-6 sm:mt-16 z-10 border border-[#e8e8e0]">
          
          {/* Top Search Input Bar */}
          <form onSubmit={handleSearchSubmit} className="relative border-b border-[#e8e8e0] bg-[#fafaf8]">
            <div className="flex items-center px-6 py-4">
              <Search size={22} className="text-[#78786a] flex-shrink-0 mr-4" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by silhouette, fabric, color, lawn, pret..."
                className="w-full bg-transparent text-base sm:text-lg font-medium text-[#141410] placeholder-[#a8a898] outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1 text-gray-400 hover:text-black mr-2 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-gray-500 hover:text-black rounded border border-gray-200 transition-colors"
              >
                ESC
              </button>
            </div>
          </form>

          {/* Body: Suggestions & Results */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {!cleanQ ? (
              /* Popular Searches State */
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#78786a] mb-3">
                    <TrendingUp size={14} className="text-[#d4af37]" />
                    <span>Popular Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCH_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagClick(tag)}
                        className="px-3 py-1.5 rounded-full bg-[#f4f4ee] hover:bg-[#141410] hover:text-white text-xs font-semibold text-[#141410] transition-colors flex items-center gap-1.5"
                      >
                        <Tag size={11} className="opacity-60" />
                        <span>{tag}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Featured Collections Quick Links */}
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#78786a] mb-3">
                    <Sparkles size={14} className="text-[#d4af37]" />
                    <span>Browse By Collection</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {categories.slice(0, 4).map((cat) => (
                      <Link
                        key={cat._id || cat.slug}
                        to={`/products?category=${encodeURIComponent(cat.slug || cat._id)}`}
                        onClick={onClose}
                        className="p-3 bg-[#fafaf8] border border-[#e8e8e0] rounded-sm hover:border-[#141410] hover:bg-white transition-all group"
                      >
                        <p className="text-xs font-bold text-[#141410] group-hover:underline truncate">
                          {cat.name}
                        </p>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                          View Pieces →
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Live Results State */
              <div className="space-y-6">
                
                {/* Matching Categories Pill list */}
                {matchingCategories.length > 0 && (
                  <div>
                    <p className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#78786a] mb-2">
                      Matching Categories
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {matchingCategories.map((cat) => (
                        <Link
                          key={cat._id || cat.slug}
                          to={`/products?category=${encodeURIComponent(cat.slug || cat._id)}`}
                          onClick={onClose}
                          className="px-3 py-1 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 rounded-full text-xs font-bold transition-colors"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matching Products Grid */}
                {matchingProducts.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#78786a]">
                        Product Suggestions ({matchingProducts.length})
                      </p>
                      <button
                        onClick={handleSearchSubmit}
                        className="text-xs font-bold text-[#141410] hover:underline flex items-center gap-1"
                      >
                        View All Matches <ArrowRight size={12} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {matchingProducts.map((p) => {
                        const img = p.images?.[0]?.url || p.images?.[0] || "";
                        const price = p.discountPrice || p.price || 4500;

                        return (
                          <Link
                            key={p._id || p.id}
                            to={`/products/${p._id || p.id}`}
                            onClick={onClose}
                            className="group flex flex-col bg-[#fafaf8] p-2 rounded-sm border border-transparent hover:border-[#e8e8e0] hover:bg-white transition-all"
                          >
                            <div className="aspect-[3/4] w-full bg-gray-100 rounded-xs overflow-hidden mb-2">
                              <img
                                src={optimizeImage(img, { width: 300 })}
                                alt={p.title}
                                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                            <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500 truncate">
                              {p.fabric || "Apparel"}
                            </p>
                            <p className="text-xs font-bold text-[#141410] truncate group-hover:underline">
                              {p.title}
                            </p>
                            <p className="text-xs font-bold text-[#141410] mt-1 font-mono">
                              PKR {price.toLocaleString()}
                            </p>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      No direct results found for &ldquo;{query}&rdquo;
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      Try searching by fabric (e.g. Lawn, Cambric, Velvet) or broad categories (e.g. Kurtas, Pret).
                    </p>
                    <button
                      onClick={handleSearchSubmit}
                      className="px-6 py-2.5 bg-[#141410] text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-black transition-colors"
                    >
                      Search Entire Catalog for &ldquo;{query}&rdquo;
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-6 py-3 bg-[#fafaf8] border-t border-[#e8e8e0] flex items-center justify-between text-xs text-gray-500">
            <span>Press <strong className="font-mono text-black">Enter ↵</strong> to search all pieces</span>
            <button
              type="button"
              onClick={handleSearchSubmit}
              className="font-bold text-[#141410] hover:underline"
            >
              Browse All Products →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
