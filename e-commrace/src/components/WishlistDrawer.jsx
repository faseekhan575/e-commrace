import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../store/cartSlice";
import { removeFromWishlist, clearWishlist } from "../store/wishlistSlice";
import { optimizeImage } from "../utils/imageOptimizer";
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function WishlistDrawer({ isOpen, onClose, onOpenCart }) {
  const dispatch = useDispatch();
  const { items = [] } = useSelector((s) => s.wishlist);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleMoveToBag = async (item) => {
    const chosenSize = item.sizes?.[0] || "M";
    await dispatch(
      addToCart({
        productId: item._id || item.id,
        quantity: 1,
        product: item,
        size: chosenSize,
        stitching: "Stitched",
      })
    );
    toast.success(`Added ${item.title} (${chosenSize}) to Bag`, {
      icon: "🛍️",
      style: {
        borderRadius: "10px",
        background: "#1a1a14",
        color: "#fff",
        fontSize: "12px",
      },
    });
    if (onOpenCart) {
      onClose();
      onOpenCart();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-over Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col transform transition-transform ease-in-out duration-300">
          
          {/* Header */}
          <div className="p-5 border-b border-[#e8e8e0] flex items-center justify-between bg-[#fafaf8]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                <Heart size={16} className="fill-rose-600" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#141410]">
                  Saved Wishlist
                </h3>
                <p className="text-[11px] text-[#78786a] font-mono">
                  {items.length} {items.length === 1 ? "Piece" : "Pieces"} Saved
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {items.length > 0 && (
                <button
                  onClick={() => {
                    dispatch(clearWishlist());
                    toast.success("Wishlist cleared");
                  }}
                  className="text-[11px] font-semibold text-gray-500 hover:text-rose-600 transition-colors uppercase tracking-wider"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-[#78786a] hover:text-black hover:bg-gray-100 transition-colors"
                aria-label="Close wishlist"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#f0f0ea]">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-400 mb-4">
                  <Heart size={28} />
                </div>
                <h4 className="font-serif text-xl font-bold text-[#141410] mb-1">
                  Your Wishlist is Empty
                </h4>
                <p className="text-xs text-[#78786a] max-w-xs mb-6 leading-relaxed">
                  Save pieces you love by tapping the heart icon on any garment to revisit and shop anytime.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#141410] text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-black transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              items.map((item) => {
                const img = item.images?.[0]?.url || item.images?.[0] || "";
                const price = item.price || 0;
                const discountPrice = item.discountPrice;
                const activePrice = discountPrice || price;

                return (
                  <div
                    key={item._id || item.id}
                    className="py-4 flex gap-4 items-center group"
                  >
                    <Link
                      to={`/products/${item._id || item.id}`}
                      onClick={onClose}
                      className="w-20 aspect-[3/4] bg-gray-100 rounded overflow-hidden flex-shrink-0 relative"
                    >
                      <img
                        src={optimizeImage(img, { width: 160 })}
                        alt={item.title}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-[#78786a] truncate">
                        {item.fabric || "Apparel"}
                      </p>
                      <Link
                        to={`/products/${item._id || item.id}`}
                        onClick={onClose}
                        className="text-xs font-bold text-[#141410] hover:underline block truncate mb-1"
                      >
                        {item.title}
                      </Link>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-xs font-bold text-[#141410]">
                          PKR {activePrice.toLocaleString()}
                        </span>
                        {discountPrice && discountPrice < price && (
                          <span className="text-[10px] text-gray-400 line-through">
                            PKR {price.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleMoveToBag(item)}
                          className="px-3 py-1 bg-[#141410] text-white text-[10px] font-bold uppercase tracking-wider rounded-sm hover:bg-black transition-colors flex items-center gap-1"
                        >
                          <ShoppingBag size={11} /> Move to Bag
                        </button>
                        <button
                          onClick={() => {
                            dispatch(removeFromWishlist(item._id || item.id));
                            toast.success("Removed from Wishlist");
                          }}
                          className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-4 bg-[#fafaf8] border-t border-[#e8e8e0]">
              <Link
                to="/products"
                onClick={onClose}
                className="w-full py-3 bg-[#141410] text-white hover:bg-black text-xs font-bold uppercase tracking-[0.2em] rounded-sm flex items-center justify-center gap-2 transition-colors"
              >
                Continue Browsing Store <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
