import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../store/cartSlice";
import { toggleWishlistItem } from "../store/wishlistSlice";
import { Heart, ShoppingBag } from "lucide-react";
import { optimizeImage } from "../utils/imageOptimizer";
import toast from "react-hot-toast";
import {
  availableStock,
  errorMessage,
  imageUrl,
  placeholderImage,
  productColors,
  firstAvailableSize,
} from "../utils/commerce";

export default function ProductCard({ product, index = 0, onOpenCart }) {
  const dispatch = useDispatch();
  const { items: wishlistItems = [] } = useSelector((s) => s.wishlist);

  const id = product?._id || product?.id || `clothing-${index}`;
  const isSaved = wishlistItems.some(
    (item) => String(item._id || item.id) === String(id)
  );
  const title = product?.title || "Short Floral Kurta";
  const fabric =
    product?.fabric || product?.productTypeTag || "Printed | Cambric";
  const price = product?.price ?? 0;
  const discountPrice = product?.discountPrice;
  const stock = product?.stock !== undefined ? product.stock : 0;
  const isOutOfStock = stock <= 0;

  const rawImages =
    product?.images && product.images.length > 0
      ? product.images
      : [
          {
            url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80",
          },
        ];

  const primaryImage = optimizeImage(
    imageUrl(rawImages.find((image) => image.isDefault) || rawImages[0]) ||
      placeholderImage,
    { width: 700 }
  );
  const secondaryImage = optimizeImage(
    rawImages.find((image) => image.isHover)?.url ||
      rawImages[1]?.url ||
      rawImages[1] ||
      rawImages[0]?.url,
    { width: 700 }
  );

  const sizes =
    product?.sizes && product.sizes.length > 0
      ? product.sizes
      : ["XS", "S", "M", "L", "XL"];

  const [selectedSize] = useState(
    firstAvailableSize(product) || sizes[0] || ""
  );
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const willBeSaved = !isSaved;
    dispatch(toggleWishlistItem(product));
    toast.success(
      willBeSaved ? "Added to Wishlist" : "Removed from Wishlist",
      {
        icon: willBeSaved ? "❤️" : "🤍",
        style: {
          borderRadius: "10px",
          background: "#1a1a14",
          color: "#fff",
          fontSize: "12px",
        },
      }
    );
  };

  const handleQuickAdd = async (e, sz) => {
    e.preventDefault();
    e.stopPropagation();
    const chosenSize = sz || selectedSize || firstAvailableSize(product) || (sizes && sizes[0]) || "";
    if (sizes && sizes.length && availableStock(product, chosenSize) < 1) {
      const avail = firstAvailableSize(product);
      if (!avail) return toast.error("This item is currently out of stock.");
    }
    try {
      await dispatch(
        addToCart({
          productId: id,
          quantity: 1,
          product,
          size: chosenSize,
          stitching: product?.stitching || "Stitched",
        })
      ).unwrap();
      toast.success(`Added ${title} to Bag`, {
        icon: "🛍️",
        style: {
          borderRadius: "10px",
          background: "#1a1a14",
          color: "#fff",
          fontSize: "12px",
        },
      });
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const discountPercent =
    discountPrice && discountPrice < price
      ? Math.round(((price - discountPrice) / price) * 100)
      : null;

  return (
    <>
      <div
        className="group relative flex flex-col bg-white transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setShowSizePicker(false);
        }}
      >
        {/* Portrait Apparel Image Container (Aspect Ratio 3:4.2) */}
        <div className="relative aspect-[3/4.2] w-full overflow-hidden bg-[#f4f4f0] rounded-none sm:rounded-xs">
          {/* Skeleton Shimmer while image is loading */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-[#e5e7eb] via-[#f3f4f6] to-[#e5e7eb] bg-[length:200%_100%] animate-pulse" />
          )}

          <Link to={`/products/${id}`} className="block w-full h-full">
            <img
              src={isHovered && rawImages.length > 1 ? secondaryImage : primaryImage}
              alt={title}
              loading={index < 6 ? "eager" : "lazy"}
              decoding="async"
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 ${
                !imageLoaded ? "opacity-0" : "opacity-100"
              } ${isOutOfStock ? "grayscale opacity-75" : ""}`}
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
          </div>

          {/* Quick Add To Bag Overlay on Card Hover */}
          {!isOutOfStock && (
            <div
              className={`absolute bottom-0 left-0 right-0 p-2 sm:p-2.5 bg-gradient-to-t from-black/75 via-black/35 to-transparent transition-all duration-300 ${
                isHovered
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2 pointer-events-none"
              }`}
            >
              <button
                type="button"
                onClick={handleQuickAdd}
                className="w-full py-2 bg-white text-[#141410] hover:bg-[#141410] hover:text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] rounded-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <ShoppingBag size={12} />
                <span>Quick Add</span>
              </button>
            </div>
          )}
        </div>

        {/* Product Meta Details */}
        <div className="pt-3 pb-2 px-1 flex flex-col flex-1 justify-between">
          <div>
            <p className="text-[10px] sm:text-[11px] font-mono tracking-wider uppercase text-[#4b5563] font-semibold truncate mb-1">
              {fabric}
            </p>
            <Link
              to={`/products/${id}`}
              className="text-xs sm:text-sm font-semibold text-[#111827] hover:underline line-clamp-1 group-hover:text-black transition-colors"
            >
              {title}
            </Link>
          </div>

          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-xs sm:text-sm font-bold text-[#111827] font-mono">
              PKR {(discountPrice || price).toLocaleString()}
            </span>
            {discountPrice && discountPrice < price && (
              <span className="text-[10px] sm:text-xs text-gray-500 line-through font-mono">
                PKR {price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
