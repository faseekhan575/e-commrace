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
            url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=85",
          },
        ];

  const primaryImage = optimizeImage(
    imageUrl(rawImages.find((image) => image.isDefault) || rawImages[0]) ||
      placeholderImage,
    { width: 800 }
  );
  const secondaryImage = optimizeImage(
    rawImages.find((image) => image.isHover)?.url ||
      rawImages[1]?.url ||
      rawImages[1] ||
      rawImages[0]?.url,
    { width: 800 }
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
          borderRadius: "8px",
          background: "#0e0e0c",
          color: "#fff",
          fontSize: "12px",
          letterSpacing: "0.05em",
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
      toast.success(`Added ${title} (${chosenSize}) to Bag`, {
        icon: "🛍️",
        style: {
          borderRadius: "8px",
          background: "#0e0e0c",
          color: "#fff",
          fontSize: "12px",
        },
      });
      if (typeof onOpenCart === "function") {
        onOpenCart();
      }
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const discountPercent =
    discountPrice && discountPrice < price
      ? Math.round(((price - discountPrice) / price) * 100)
      : null;

  return (
    <div
      className="group relative flex flex-col bg-white transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Editorial Aspect Ratio Container (3:4.2) */}
      <div className="relative aspect-[3/4.2] w-full overflow-hidden bg-[#f5f4ef] rounded-none">
        {/* Subtle shimmer placeholder */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-[#ebe9e1] animate-pulse" />
        )}

        <Link to={`/products/${id}`} className="block w-full h-full relative overflow-hidden">
          {/* Primary Product Image */}
          <img
            src={primaryImage}
            alt={title}
            loading={index < 4 ? "eager" : "lazy"}
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 ${
              isHovered && rawImages.length > 1 ? "opacity-0" : "opacity-100"
            } ${isOutOfStock ? "grayscale opacity-75" : ""}`}
          />

          {/* Secondary Hover Lookbook Image */}
          {rawImages.length > 1 && (
            <img
              src={secondaryImage}
              alt={`${title} alternate view`}
              loading="lazy"
              decoding="async"
              className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-700 ease-out group-hover:scale-105 ${
                isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
              } ${isOutOfStock ? "grayscale opacity-75" : ""}`}
            />
          )}
        </Link>

        {/* Vibrant Floating Status Tags (Top Left) */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start pointer-events-none">
          {discountPercent ? (
            <span className="bg-[#b91c1c] text-white text-[10px] font-mono font-extrabold tracking-wider uppercase px-2 py-0.5 shadow-md rounded-xs">
              -{discountPercent}% OFF
            </span>
          ) : product?.isHot ? (
            <span className="bg-[#d4af37] text-[#0e0e0c] text-[10px] font-sans font-extrabold tracking-[0.16em] uppercase px-2 py-0.5 shadow-md rounded-xs">
              ★ ICONIC
            </span>
          ) : null}

          {isOutOfStock ? (
            <span className="bg-[#1c1917] text-white text-[9px] font-sans font-bold tracking-[0.15em] uppercase px-2 py-0.5 shadow-sm rounded-xs">
              SOLD OUT
            </span>
          ) : stock <= 3 ? (
            <span className="bg-[#c2410c] text-white text-[9px] font-sans font-bold tracking-[0.15em] uppercase px-2 py-0.5 shadow-sm rounded-xs animate-pulse">
              LOW STOCK ({stock})
            </span>
          ) : null}
        </div>

        {/* Floating Minimal Wishlist Trigger (Top Right) */}
        <div className="absolute top-3 right-3 z-20">
          <button
            type="button"
            onClick={handleWishlist}
            aria-label="Save to Wishlist"
            className="w-8 h-8 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-[#141410] hover:text-[#c5a059] shadow-sm hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <Heart
              size={15}
              className={`transition-colors ${
                isSaved ? "fill-[#dc2626] text-[#dc2626]" : "text-[#141410]"
              }`}
            />
          </button>
        </div>

        {/* Sleek Slide-Up Quick Add Drawer with Direct Size Selector */}
        {!isOutOfStock && (
          <div
            className={`absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-all duration-300 z-20 ${
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
            }`}
          >
            <div className="flex flex-col gap-2">
              {/* Direct Size Pills for 1-Tap Purchase */}
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                <span className="text-[9px] font-sans font-semibold uppercase tracking-widest text-[#dcdad0] mr-1 hidden sm:inline">
                  SIZE:
                </span>
                {sizes.slice(0, 5).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={(e) => handleQuickAdd(e, sz)}
                    className="px-2 py-1 bg-white hover:bg-[#d4af37] hover:text-black text-[#0e0e0c] text-[10px] font-mono font-bold uppercase transition-colors rounded-xs shadow-xs cursor-pointer"
                    title={`Add size ${sz}`}
                  >
                    {sz}
                  </button>
                ))}
              </div>

              {/* General Quick Add Button */}
              <button
                type="button"
                onClick={handleQuickAdd}
                className="w-full py-2 bg-white hover:bg-[#d4af37] text-[#0e0e0c] hover:text-black text-[10px] font-sans font-extrabold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md rounded-xs"
              >
                <ShoppingBag size={13} />
                <span>QUICK ADD TO BAG</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Meta: Clean, Vibrant Fashion Typography */}
      <div className="pt-3 pb-2 px-1 flex flex-col flex-1 justify-between bg-white">
        <div>
          <p className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase text-[#8c897e] truncate mb-1">
            {fabric}
          </p>
          <Link
            to={`/products/${id}`}
            className="font-serif text-[14.5px] sm:text-[15.5px] font-bold text-[#0e0e0c] hover:text-[#9c7830] transition-colors line-clamp-1 leading-snug"
          >
            {title}
          </Link>
        </div>

        {/* Vibrant High-Contrast Pricing */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="text-sm sm:text-[15px] font-mono font-extrabold text-[#0e0e0c] tracking-tight">
            PKR {(discountPrice || price).toLocaleString()}
          </span>
          {discountPrice && discountPrice < price && (
            <>
              <span className="text-xs font-mono text-[#8c897e] line-through">
                PKR {price.toLocaleString()}
              </span>
              <span className="text-[9.5px] font-mono font-bold text-[#b91c1c] bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded-xs ml-auto">
                SAVE {discountPercent}%
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

