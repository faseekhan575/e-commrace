import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../store/cartSlice";
import { Heart, ShoppingBag, Eye, Check, Sparkles } from "lucide-react";
import { optimizeImage } from "../utils/imageOptimizer";
import toast from "react-hot-toast";

export default function ProductCard({ product, index = 0 }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((s) => s.auth);

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || "M");
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const id = product._id || `clothing-${index}`;
  const title = product.title || "Short Floral Kurta";
  const fabric = product.fabric || "Printed | Cambric";
  const price = product.price || 4500;
  const discountPrice = product.discountPrice;
  const rawImages = product.images && product.images.length > 0
    ? product.images
    : [{ url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80" }];

  const primaryImage = optimizeImage(rawImages[0]?.url, { width: 700 });
  const secondaryImage = optimizeImage(rawImages[1]?.url || rawImages[0]?.url, { width: 700 });

  const sizes = product.sizes || ["XS", "S", "M", "L", "XL"];

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "Removed from Wishlist" : "Added to Wishlist ♥", {
      icon: isWishlisted ? "🤍" : "❤️",
      style: { borderRadius: "10px", background: "#1a1a14", color: "#fff", fontSize: "12px" }
    });
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await dispatch(addToCart({
      productId: id,
      quantity: 1,
      product,
      size: selectedSize,
      stitching: product?.stitching || "Stitched"
    }));
    toast.success(`Added ${title} (${selectedSize}) to Bag`, {
      icon: "🛍️",
      style: { borderRadius: "10px", background: "#1a1a14", color: "#fff", fontSize: "12px" }
    });
    setShowSizePicker(false);
  };

  const discountPercent = discountPrice && discountPrice < price
    ? Math.round(((price - discountPrice) / price) * 100)
    : null;

  return (
    <div
      className="group relative flex flex-col bg-white transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowSizePicker(false); }}
    >
      {/* ── Portrait Apparel Image (Sapphire / Reference Aspect Ratio) ── */}
      <div className="relative aspect-[3/4.2] w-full overflow-hidden bg-[#f4f4f0] rounded-none sm:rounded-xs">
        <Link to={`/products/${id}`} className="block w-full h-full">
          <img
            src={isHovered && rawImages.length > 1 ? secondaryImage : primaryImage}
            alt={title}
            loading={index < 4 ? "eager" : "lazy"}
            decoding="async"
            className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Discount Badge */}
        {discountPercent && (
          <div className="absolute top-2.5 left-2.5 z-10 bg-[#1a1a14] text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-none">
            -{discountPercent}% OFF
          </div>
        )}

        {/* Floating Heart Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlist}
          aria-label="Wishlist"
          className="absolute top-2.5 right-2.5 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white hover:scale-110 active:scale-95 transition-all"
        >
          <Heart
            size={16}
            className={`transition-colors ${
              isWishlisted
                ? "fill-red-600 text-red-600"
                : "text-[#1a1a14] hover:text-red-600"
            }`}
          />
        </button>

        {/* Quick Add Overlay on Hover */}
        <div className={`absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-300 ${
          isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}>
          {showSizePicker ? (
            <div className="bg-white p-2 rounded shadow-lg animate-in fade-in zoom-in-95 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-500">
                <span>Select Size:</span>
                <span className="text-black font-mono">{selectedSize}</span>
              </div>
              <div className="flex gap-1 justify-center">
                {sizes.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`w-7 h-7 rounded text-[10px] font-bold border transition-colors ${
                      selectedSize === sz
                        ? "bg-[#141410] text-white border-black"
                        : "bg-white border-gray-200 text-black hover:border-black"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleQuickAdd}
                className="w-full py-1.5 bg-[#141410] text-white text-[11px] font-bold uppercase tracking-widest rounded hover:bg-black transition-colors"
              >
                Confirm Add
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowSizePicker(true); }}
              className="w-full py-2.5 bg-white/95 backdrop-blur-md text-[#141410] hover:bg-black hover:text-white text-xs font-bold uppercase tracking-widest rounded-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              <ShoppingBag size={14} /> Quick Add
            </button>
          )}
        </div>
      </div>

      {/* ── Metadata Details (Matching User Reference Image) ── */}
      <div className="pt-3 pb-2 px-1 flex flex-col space-y-1">
        {/* Fabric Subtitle (e.g. Printed | Cambric) */}
        <p className="text-[11px] sm:text-xs font-medium tracking-[0.16em] uppercase text-[#78786a] font-mono line-clamp-1">
          {fabric}
        </p>

        {/* Product Title (e.g. Short Floral Kurta) */}
        <Link to={`/products/${id}`} className="group-hover:text-[#78786a] transition-colors">
          <h3 className="font-serif text-sm sm:text-base font-semibold text-[#141410] leading-snug line-clamp-1">
            {title}
          </h3>
        </Link>

        {/* Price in PKR */}
        <div className="flex items-center gap-2 pt-0.5">
          <span className="font-serif text-sm sm:text-base font-bold text-[#141410]">
            PKR {(discountPrice || price).toLocaleString()}
          </span>
          {discountPrice && discountPrice < price && (
            <span className="text-xs text-[#a0a090] line-through font-serif">
              PKR {price.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
