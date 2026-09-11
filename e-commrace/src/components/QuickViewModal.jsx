import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../store/cartSlice";
import { toggleWishlistItem } from "../store/wishlistSlice";
import { optimizeImage } from "../utils/imageOptimizer";
import {
  X, Heart, ShoppingBag, Minus, Plus, ShieldCheck,
  Truck, ArrowRight, Check, Star
} from "lucide-react";
import toast from "react-hot-toast";
import { availableStock, errorMessage, imageUrl, placeholderImage, productColors, firstAvailableSize } from "../utils/commerce";

export default function QuickViewModal({ product, isOpen, onClose, onOpenCart }) {
  const dispatch = useDispatch();
  const { items: wishlistItems = [] } = useSelector((s) => s.wishlist);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");

  const isSaved = wishlistItems.some(
    (item) => String(item._id || item.id) === String(product?._id || product?.id)
  );

  useEffect(() => {
    if (product) {
      setActiveImg(0);
      setSelectedSize(firstAvailableSize(product));
      setSelectedColor(productColors(product)[0] || "");
      setQty(1);
    }
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const id = product._id || product.id;
  const rawImages = product.images && product.images.length > 0
    ? product.images
    : [{ url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80" }];

  const price = product.price || 0;
  const discountPrice = product.discountPrice;
  const activePrice = discountPrice || price;
  const discountPercent = discountPrice && discountPrice < price
    ? Math.round(((price - discountPrice) / price) * 100)
    : null;

  const sizes = product.sizes && product.sizes.length > 0
    ? product.sizes
    : ["XS", "S", "M", "L", "XL"];

  const handleWishlistToggle = () => {
    if (!product) return;
    const willBeSaved = !isSaved;
    dispatch(toggleWishlistItem(product));
    toast.success(willBeSaved ? "Saved to Wishlist ♥" : "Removed from Wishlist", {
      icon: willBeSaved ? "❤️" : "🤍",
      style: { borderRadius: "10px", background: "#1a1a14", color: "#fff", fontSize: "12px" },
    });
  };

  const handleAddToCart = async () => {
    if (qty > availableStock(product, selectedSize)) return toast.error("This quantity is unavailable in your selected size.");
    try {
    await dispatch(
      addToCart({
        productId: id,
        quantity: qty,
        product,
        size: selectedSize, color: selectedColor,
        stitching: product.stitching || "Stitched",
      })
    ).unwrap();
    toast.success(`Added ${product.title} (${selectedSize}) to Bag`, {
      icon: "🛍️",
      style: { borderRadius: "10px", background: "#1a1a14", color: "#fff", fontSize: "12px" }
    });
    onClose();
    if (onOpenCart) onOpenCart();
    } catch (error) { toast.error(errorMessage(error)); }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity"
      />

      <div className="min-h-screen px-4 py-8 flex items-center justify-center">
        <div className="relative bg-white w-full max-w-4xl rounded-sm shadow-2xl overflow-hidden z-10 border border-[#e8e8e0]">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
          >
            <X size={16} />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* Gallery Left */}
            <div className="bg-[#f5f5f0] p-4 flex flex-col items-center justify-center">
              <div className="relative aspect-[3/4] w-full max-w-sm rounded-sm overflow-hidden bg-white shadow-xs">
                <img
                  src={optimizeImage(rawImages[activeImg]?.url || rawImages[0]?.url, { width: 800 })}
                  alt={product.title}
                  className="w-full h-full object-cover object-top"
                />
                {discountPercent && (
                  <span className="absolute top-3 left-3 bg-[#141410] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1">
                    -{discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {rawImages.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto py-1 max-w-sm">
                  {rawImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImg(idx)}
                      className={`w-14 aspect-[3/4] rounded-xs overflow-hidden border transition-all ${
                        activeImg === idx
                          ? "border-[#141410] ring-1 ring-[#141410]"
                          : "border-gray-200 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={optimizeImage(img.url, { width: 120 })}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details Right */}
            <div className="p-6 md:p-8 flex flex-col justify-between">
              <div>
                <p className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#78786a] mb-1.5">
                  {product.fabric || product.category?.name || "Luxury Apparel"}
                </p>

                <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#141410] leading-tight mb-2">
                  {product.title}
                </h2>

                <div className="flex items-center gap-3 text-xs mb-4">
                  <span className="text-gray-400 font-mono">
                    SKU: {product.sku || `SAP-${String(id).slice(-4)}`}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    In Stock
                  </span>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 py-3 border-y border-[#e8e8e0] mb-5">
                  <span className="font-serif text-2xl md:text-3xl font-bold text-[#141410]">
                    PKR {activePrice.toLocaleString()}
                  </span>
                  {discountPrice && discountPrice < price && (
                    <span className="text-sm text-gray-400 line-through">
                      PKR {price.toLocaleString()}
                    </span>
                  )}
                  {discountPercent && (
                    <span className="text-xs font-bold text-emerald-700 font-mono">
                      (Save PKR {(price - discountPrice).toLocaleString()})
                    </span>
                  )}
                </div>

                {productColors(product).length > 0 && <label className="block mb-5 text-xs font-semibold">Color<select aria-label="Product color" className="block mt-2 w-full border border-stone-200 p-3" value={selectedColor} onChange={(event) => setSelectedColor(event.target.value)}>{productColors(product).map((color) => <option key={color}>{color}</option>)}</select></label>}
                {/* Size Selector */}
                <div className="mb-5">
                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                    <span className="uppercase tracking-wider text-gray-700">Select Size</span>
                    <span className="text-gray-500 font-mono">Chosen: {selectedSize}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((sz) => {
                      const isSelected = selectedSize === sz;
                      // Check variant stock if available
                      const varStock = product.sizeVariants?.find(
                        (v) => v.size?.toUpperCase() === sz?.toUpperCase()
                      );
                      const isOutOfStock = varStock && (varStock.stock <= 0 || varStock.isAvailable === false);

                      return (
                        <button
                          key={sz}
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => setSelectedSize(sz)}
                          className={`min-w-[42px] h-9 px-3 rounded-xs text-xs font-bold font-mono transition-all border ${
                            isSelected
                              ? "bg-[#141410] text-white border-[#141410]"
                              : isOutOfStock
                              ? "bg-gray-100 text-gray-400 border-gray-200 line-through cursor-not-allowed"
                              : "bg-white text-[#141410] border-gray-200 hover:border-black"
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Quantity</span>
                  <div className="flex items-center border border-[#e8e8e0] rounded bg-white">
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      disabled={qty <= 1}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-10 text-center text-xs font-bold font-mono">
                      {qty}
                    </span>
                    <button
                      type="button"
                      disabled={qty >= availableStock(product, selectedSize)}
                      onClick={() => setQty((q) => q + 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-[#e8e8e0]">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 py-3.5 bg-[#141410] hover:bg-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-sm transition-all flex items-center justify-center gap-2 shadow-md group"
                  >
                    <ShoppingBag size={15} />
                    <span>Add to Bag</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleWishlistToggle}
                    className={`w-12 h-12 rounded-sm border flex items-center justify-center transition-colors ${
                      isSaved
                        ? "bg-rose-50 border-rose-200 text-rose-600"
                        : "border-gray-200 hover:border-black text-gray-600"
                    }`}
                    title={isSaved ? "Remove from Wishlist" : "Save to Wishlist"}
                  >
                    <Heart size={18} className={isSaved ? "fill-rose-600" : ""} />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <Link
                    to={`/products/${id}`}
                    onClick={onClose}
                    className="text-xs font-bold text-[#141410] hover:underline flex items-center gap-1.5"
                  >
                    <span>View Full Garment Details</span>
                    <ArrowRight size={13} />
                  </Link>

                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <Truck size={12} className="text-[#d4af37]" /> Free Dispatch Over PKR 5,000
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
