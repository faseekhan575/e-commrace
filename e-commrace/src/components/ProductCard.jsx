import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../store/cartSlice";
import { toggleWishlistItem } from "../store/wishlistSlice";
import { Heart, ShoppingBag, Eye, Check, Sparkles } from "lucide-react";
import { optimizeImage } from "../utils/imageOptimizer";
import QuickViewModal from "./QuickViewModal";
import toast from "react-hot-toast";
import { availableStock, errorMessage, imageUrl, placeholderImage, productColors, firstAvailableSize } from "../utils/commerce";

export default function ProductCard({ product, index = 0, onOpenCart }) {
  const dispatch = useDispatch();
  const { items: wishlistItems = [] } = useSelector((s) => s.wishlist);

  const id = product?._id || product?.id || `clothing-${index}`;
  const isSaved = wishlistItems.some(
    (item) => String(item._id || item.id) === String(id)
  );
  const title = product?.title || "Short Floral Kurta";
  const fabric = product?.fabric || product?.productTypeTag || "Printed | Cambric";
  const price = product?.price ?? 0;
  const discountPrice = product?.discountPrice;
  const stock = product?.stock !== undefined ? product.stock : 0;
  const isOutOfStock = stock <= 0;

  const rawImages = product?.images && product.images.length > 0
    ? product.images
    : [{ url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80" }];

  const primaryImage = optimizeImage(imageUrl(rawImages.find((image) => image.isDefault) || rawImages[0]) || placeholderImage, { width: 700 });
  const secondaryImage = optimizeImage(rawImages.find((image) => image.isHover)?.url || rawImages[1]?.url || rawImages[1] || rawImages[0]?.url, { width: 700 });

  const sizes = product?.sizes && product.sizes.length > 0
    ? product.sizes
    : ["XS", "S", "M", "L", "XL"];

  const [selectedSize, setSelectedSize] = useState(firstAvailableSize(product) || sizes[0] || "");
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const willBeSaved = !isSaved;
    dispatch(toggleWishlistItem(product));
    toast.success(willBeSaved ? "Added to Wishlist ♥" : "Removed from Wishlist", {
      icon: willBeSaved ? "❤️" : "🤍",
      style: { borderRadius: "10px", background: "#1a1a14", color: "#fff", fontSize: "12px" }
    });
  };

  const handleQuickAdd = async (e, sz) => {
    e.preventDefault();
    e.stopPropagation();
    if (productColors(product).length) { setQuickViewOpen(true); return; }
    const chosenSize = sz || selectedSize;
    if (availableStock(product, chosenSize) < 1) return toast.error("This size is currently unavailable.");
    try {
    await dispatch(addToCart({
      productId: id,
      quantity: 1,
      product,
      size: chosenSize,
      stitching: product?.stitching || "Stitched"
    })).unwrap();
    toast.success(`Added ${title} (${chosenSize}) to Bag`, {
      icon: "🛍️",
      style: { borderRadius: "10px", background: "#1a1a14", color: "#fff", fontSize: "12px" }
    });
    setShowSizePicker(false);
    if (onOpenCart) onOpenCart();
    } catch (error) { toast.error(errorMessage(error)); }
  };

  const discountPercent = discountPrice && discountPrice < price
    ? Math.round(((price - discountPrice) / price) * 100)
    : null;

  return (
    <>
      <div
        className="group relative flex flex-col bg-white transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setShowSizePicker(false); }}
      >
        {/* ── Portrait Apparel Image Container (Aspect Ratio 3:4.2) ── */}
        <div className="relative aspect-[3/4.2] w-full overflow-hidden bg-[#f4f4f0] rounded-none sm:rounded-xs">
          <Link to={`/products/${id}`} className="block w-full h-full">
            <img
              src={isHovered && rawImages.length > 1 ? secondaryImage : primaryImage}
              alt={title}
              loading={index < 4 ? "eager" : "lazy"}
              decoding="async"
              className={`w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 ${
                isOutOfStock ? "grayscale opacity-75" : ""
              }`}
            />
          </Link>

          {/* Badges Container */}
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
            {discountPercent && (
              <span className="bg-[#1a1a14] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                -{discountPercent}% OFF
              </span>
            )}
            {product?.isHot && (
              <span className="bg-[#d4af37] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                HOT SELLER
              </span>
            )}
            {isOutOfStock ? (
              <span className="bg-red-600 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                SOLD OUT
              </span>
            ) : stock <= 5 ? (
              <span className="bg-amber-600 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                ONLY {stock} LEFT
              </span>
            ) : null}
          </div>

          {/* Action Icons Right Top */}
          <div className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-1.5">
            {/* Wishlist Button */}
            <button
              type="button"
              onClick={handleWishlist}
              aria-label="Wishlist"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xs hover:bg-white hover:scale-110 active:scale-95 transition-all"
            >
              <Heart
                size={16}
                className={`transition-colors ${
                  isSaved
                    ? "fill-red-600 text-red-600"
                    : "text-[#1a1a14] hover:text-red-600"
                }`}
              />
            </button>

            {/* Quick View Button (Desktop) */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuickViewOpen(true);
              }}
              aria-label="Quick View"
              className="hidden sm:flex w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-sm items-center justify-center shadow-xs hover:bg-white hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100"
            >
              <Eye size={15} className="text-[#1a1a14]" />
            </button>
          </div>

          {/* Quick Add To Bag Overlay on Card Hover */}
          {!isOutOfStock && (
            <div className={`absolute bottom-0 left-0 right-0 p-2 sm:p-2.5 bg-gradient-to-t from-black/75 via-black/35 to-transparent transition-all duration-300 ${
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
            }`}>
              {showSizePicker ? (
                <div className="bg-white p-2 sm:p-2.5 rounded shadow-xl animate-in fade-in zoom-in-95 space-y-1.5">
                  <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    <span>Select Size to Add:</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setShowSizePicker(false); }}
                      className="text-gray-400 hover:text-black"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex gap-1 justify-center flex-wrap">
                    {sizes.map((sz) => {
                      const varStock = product?.sizeVariants?.find(
                        (v) => v.size?.toUpperCase() === sz?.toUpperCase()
                      );
                      const szDisabled = varStock && (varStock.stock <= 0 || varStock.isAvailable === false);

                      return (
                        <button
                          key={sz}
                          type="button"
                          disabled={szDisabled}
                          onClick={(e) => handleQuickAdd(e, sz)}
                          className={`min-w-[30px] h-7 px-1.5 text-[10px] font-bold rounded-xs transition-colors border ${
                            szDisabled
                              ? "bg-gray-100 text-gray-400 border-gray-200 line-through cursor-not-allowed"
                              : "bg-white text-[#141410] border-gray-300 hover:bg-[#141410] hover:text-white hover:border-black"
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowSizePicker(true);
                  }}
                  className="w-full py-2 bg-white text-[#141410] hover:bg-[#141410] hover:text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] rounded-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag size={12} />
                  <span>Quick Add</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Product Meta Details ── */}
        <div className="pt-3 pb-2 px-1 flex flex-col flex-1 justify-between">
          <div>
            <p className="text-[10px] sm:text-[11px] font-mono tracking-wider uppercase text-[#78786a] truncate mb-1">
              {fabric}
            </p>
            <Link
              to={`/products/${id}`}
              className="text-xs sm:text-sm font-semibold text-[#141410] hover:underline line-clamp-1 group-hover:text-black transition-colors"
            >
              {title}
            </Link>
          </div>

          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-xs sm:text-sm font-bold text-[#141410] font-mono">
              PKR {(discountPrice || price).toLocaleString()}
            </span>
            {discountPrice && discountPrice < price && (
              <span className="text-[10px] sm:text-xs text-gray-400 line-through font-mono">
                PKR {price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        onOpenCart={onOpenCart}
      />
    </>
  );
}
