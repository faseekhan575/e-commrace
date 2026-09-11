import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate, Link, useOutletContext } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProduct, fetchProducts } from "../../store/productsSlice";
import { addToCart } from "../../store/cartSlice";
import { toggleWishlistItem } from "../../store/wishlistSlice";
import ProductCard from "../../components/ProductCard";
import SizeCalculatorModal from "../../components/SizeCalculatorModal";
import BrandLoader from "../../components/BrandLoader";
import axios from "../../axiosConfig";
import {
  ShoppingBag, Star, ChevronLeft, ChevronRight,
  Minus, Plus, Heart, Upload, X, ArrowLeft, ArrowRight,
  Ruler, ShieldCheck, Truck, RotateCcw, Sparkles, Check,
  Share2, ZoomIn, Clock, Lock, MessageSquare, AlertCircle
} from "lucide-react";
import { optimizeImage } from "../../utils/imageOptimizer";
import { availableStock, errorMessage, productColors } from "../../utils/commerce";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const onOpenCart = outletContext?.onOpenCart;

  const { current: serverProduct, list: allProducts = [], currentLoading: loading, currentError } = useSelector((s) => s.products);
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  const product = serverProduct && String(serverProduct._id || serverProduct.id) === String(id) ? serverProduct : null;

  // Selected options
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedStitching, setSelectedStitching] = useState("Stitched");
  const [activeImg, setActiveImg] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewImages, setReviewImages] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [reviewError, setReviewError] = useState("");

  // Fetch product and related products
  useEffect(() => {
    const request = dispatch(fetchProduct(id));
    setReviews([]); setActiveImg(0); setQty(1);
    if (allProducts.length === 0) {
      dispatch(fetchProducts({ page: 1, limit: 12 }));
    }
    return () => request.abort();
  }, [dispatch, id]);

  useEffect(() => {
    const controller = new AbortController();
    setReviewError("");
    axios.get(`/api/v7/review/${id}`, { params: { page: reviewPage, limit: 10 }, signal: controller.signal }).then(({ data: response }) => {
      const data = response.data;
      setReviews(Array.isArray(data) ? data : data?.reviews || []);
      setReviewTotal(data?.total ?? data?.totalReviews ?? (Array.isArray(data) ? data.length : 0));
    }).catch((error) => { if (!controller.signal.aborted) setReviewError(errorMessage(error)); });
    return () => controller.abort();
  }, [id, reviewPage]);
  useEffect(() => { setReviewPage(1); }, [id]);
  const deleteReview = async (reviewId) => {
    if (!window.confirm("Delete your review?")) return;
    try { await axios.delete(`/api/v7/review/${reviewId}/delete`); setReviews((current) => current.filter((review) => review._id !== reviewId)); setReviewTotal((total) => Math.max(0, total - 1)); toast.success("Review deleted"); }
    catch (error) { toast.error(errorMessage(error)); }
  };

  const { items: wishlistItems = [] } = useSelector((s) => s.wishlist);
  const isSaved = wishlistItems.some(
    (item) => String(item._id || item.id) === String(id)
  );

  const handleToggleWishlist = () => {
    if (!product) return;
    dispatch(toggleWishlistItem(product));
    toast.success(isSaved ? "Removed from Wishlist" : "Added to Wishlist ♥", {
      icon: isSaved ? "🤍" : "❤️",
      style: { borderRadius: "10px", background: "#1a1a14", color: "#fff", fontSize: "12px" },
    });
  };

  // Set default active size when product loads
  useEffect(() => {
    setSelectedColor(productColors(product)[0] || "");
    if (product?.sizes && product.sizes.length > 0) {
      // Pick first in-stock size if sizeVariants exist
      if (product.sizeVariants && product.sizeVariants.length > 0) {
        const firstAvailable = product.sizeVariants.find((v) => v.isAvailable !== false && v.stock > 0);
        if (firstAvailable) {
          setSelectedSize(firstAvailable.size);
          return;
        }
      }
      setSelectedSize(product.sizes[0]);
    }
  }, [product]);

  // Handle Zoom lens
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleAddToCart = async (goToCheckout = false) => {
    if (!product) return;
    if (qty > availableStock(product, selectedSize)) { toast.error("This quantity is not available in your selected size."); return; }
    setAddingToCart(true);

    try {
      await dispatch(
        addToCart({
          productId: product._id || id,
          quantity: qty,
          product,
          size: selectedSize, color: selectedColor,
          stitching: selectedStitching,
        })
      ).unwrap();

      toast.success(`Added ${product.title} (${selectedSize}) to Bag`, {
        icon: "🛍️",
        style: { borderRadius: "10px", background: "#1a1a14", color: "#fff", fontSize: "13px" },
      });

      if (goToCheckout) {
        navigate("/checkout");
      } else if (onOpenCart) {
        onOpenCart();
      }
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setAddingToCart(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.title || "Clothing Den Apparel",
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard!");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (reviewForm.comment.trim().length < 10 || reviewForm.comment.length > 1000 || reviewImages.length > 3) {
      toast.error("Write 10 to 1000 characters and attach no more than three images");
      return;
    }

    setSubmittingReview(true);
    const fd = new FormData();
    fd.append("rating", reviewForm.rating);
    fd.append("comment", reviewForm.comment);
    reviewImages.forEach((file) => fd.append("images", file));

    try {
      const res = await axios.post(`/api/v7/review/${id}/add`, fd);
      if (res.data?.data) {
        setReviews((prev) => [{ ...res.data.data, user: res.data.data.user || user }, ...prev]);
        setReviewTotal((total) => total + 1);
      }
      setReviewForm({ rating: 5, comment: "" });
      setReviewImages([]);
      toast.success("Thank you for reviewing this garment!");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSubmittingReview(false);
    }
  };

  if ((loading || !currentError) && !product) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-[#fafaf8]">
        <BrandLoader size="lg" text="CLOTHING DEN" subtitle="LOADING COUTURE PIECE..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center bg-[#fafaf8] px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
          <AlertCircle size={28} />
        </div>
        <h2 className="font-serif text-3xl text-[#141410] mb-2 font-bold">Piece Unavailable</h2>
        <p className="text-sm text-[#78786a] max-w-sm mb-6 leading-relaxed">
          {currentError || "The requested garment is currently not listed or has been archived from active inventory."}
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#141410] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-black transition-all"
        >
          Explore Active Collections <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  const rawImages = product.images && product.images.length > 0
    ? product.images
    : [{ url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85" }];

  const price = product.price ?? 0;
  const discountPrice = product.discountPrice;
  const activePrice = discountPrice || price;
  const fabric = product.fabric || product.productTypeTag || "100% Pure Luxury Lawn";
  const stock = product.stock !== undefined ? product.stock : 0;
  const isOutOfStock = stock <= 0;

  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ["XS", "S", "M", "L", "XL"];

  const discountPercent = discountPrice && discountPrice < price
    ? Math.round(((price - discountPrice) / price) * 100)
    : null;

  // Check selected size specific variant stock
  const currentSizeVariant = product.sizeVariants?.find(
    (v) => v.size?.toUpperCase() === selectedSize?.toUpperCase()
  );
  const isSizeDisabled = currentSizeVariant && (currentSizeVariant.stock <= 0 || currentSizeVariant.isAvailable === false);

  // Related products from same category
  const relatedProducts = allProducts
    .filter((p) => (p._id || p.id) !== id)
    .slice(0, 4);

  return (
    <div className="bg-[#fafaf8] min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── Breadcrumb Navigation ── */}
        <div className="flex items-center gap-2 text-xs text-[#78786a] mb-6">
          <Link to="/" className="hover:text-black">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-black">Collections</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                to={`/products?category=${encodeURIComponent(product.category.slug || product.category._id || "")}`}
                className="hover:text-black"
              >
                {product.category.name || "Apparel"}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-[#141410] font-semibold truncate max-w-xs">{product.title}</span>
        </div>

        {/* ── Main Product Display Grid (Gallery Left + Buy Panel Right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* Left: Gallery (6 cols on lg) */}
          <div className="lg:col-span-6">
            <div className="flex flex-col-reverse sm:flex-row gap-4 sticky top-28">
              
              {/* Vertical Thumbnail Strip */}
              {rawImages.length > 1 && (
                <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto sm:max-h-[640px] scrollbar-none flex-shrink-0">
                  {rawImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImg(idx)}
                      className={`w-16 sm:w-20 aspect-[3/4.2] overflow-hidden rounded-xs border transition-all ${
                        activeImg === idx
                          ? "border-[#141410] ring-1 ring-black"
                          : "border-gray-200 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={optimizeImage(img.url || img, { width: 220 })}
                        alt=""
                        className="w-full h-full object-cover object-top"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Portrait Showcase with Zoom Lens */}
              <div
                className="relative aspect-[3/4.2] flex-1 overflow-hidden bg-[#f5f5f0] rounded-xs shadow-xs group cursor-crosshair select-none"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                <img
                  src={optimizeImage(rawImages[activeImg]?.url || rawImages[0]?.url || rawImages[0], { width: 1400 })}
                  alt={product.title}
                  fetchPriority="high"
                  className={`w-full h-full object-cover object-top transition-transform duration-300 ${
                    isZoomed ? "scale-150" : "scale-100"
                  }`}
                  style={
                    isZoomed
                      ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                      : undefined
                  }
                />

                {/* Badges */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 items-start pointer-events-none">
                  {discountPercent && (
                    <span className="bg-[#141410] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1">
                      -{discountPercent}% OFF
                    </span>
                  )}
                  {product.isHot && (
                    <span className="bg-[#d4af37] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1">
                      HOT SELLER
                    </span>
                  )}
                  {isOutOfStock && (
                    <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1">
                      SOLD OUT
                    </span>
                  )}
                </div>

                {/* Top Action Buttons (Wishlist + Share) */}
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                  <button
                    onClick={handleToggleWishlist}
                    className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md hover:bg-white transition-transform hover:scale-110 active:scale-95"
                    title={isSaved ? "Saved to Wishlist" : "Save to Wishlist"}
                  >
                    <Heart size={18} className={isSaved ? "fill-red-600 text-red-600" : "text-black"} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md hover:bg-white transition-transform hover:scale-110 active:scale-95 text-black"
                    title="Share Garment Link"
                  >
                    <Share2 size={16} />
                  </button>
                </div>

                {/* Mobile Image Counter indicator */}
                <div className="absolute bottom-3 right-3 z-10 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-[10px] text-white font-mono">
                  {activeImg + 1} / {rawImages.length}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Product Details & Purchase Form (6 cols on lg) */}
          <div className="lg:col-span-6 flex flex-col">
            
            {/* Fabric / Subtitle Tagline */}
            <p className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-[#78786a] mb-2">
              {fabric}
            </p>

            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141410] leading-tight mb-3">
              {product.title}
            </h1>

            {/* SKU & Real-time Live Stock Alert */}
            <div className="flex flex-wrap items-center gap-3 text-xs mb-5">
              <span className="text-[#8e8e7e] font-mono">
                SKU: {product.sku || `SAP-${String(id).slice(-4)}`}
              </span>
              <span>•</span>
              {isOutOfStock ? (
                <span className="flex items-center gap-1.5 text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded">
                  Currently Sold Out
                </span>
              ) : stock <= 5 ? (
                <span className="flex items-center gap-1.5 text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded">
                  <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
                  Low Stock — Only {stock} pieces remaining
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  In Stock — Dispatches within 24h via TCS
                </span>
              )}
            </div>

            {/* Price Box */}
            <div className="flex items-baseline gap-3 py-4 border-y border-[#e8e8e0] mb-6">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-[#141410]">
                PKR {activePrice.toLocaleString()}
              </span>
              {discountPrice && discountPrice < price && (
                <span className="text-base text-gray-400 line-through font-mono">
                  PKR {price.toLocaleString()}
                </span>
              )}
              {discountPercent && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded font-mono">
                  You Save PKR {(price - discountPrice).toLocaleString()} ({discountPercent}% OFF)
                </span>
              )}
            </div>

            {productColors(product).length > 0 && <label className="block mb-5 text-xs font-semibold">Color<select aria-label="Product color" className="block mt-2 w-full border border-stone-200 p-3" value={selectedColor} onChange={(event) => setSelectedColor(event.target.value)}>{productColors(product).map((color) => <option key={color}>{color}</option>)}</select></label>}
            {/* Size Selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs font-bold mb-2.5">
                <span className="uppercase tracking-wider text-[#141410]">
                  Select Size: <strong className="font-mono text-black">{selectedSize}</strong>
                </span>
                <button
                  onClick={() => setSizeModalOpen(true)}
                  className="text-[#141410] underline flex items-center gap-1 hover:text-[#d4af37] transition-colors"
                >
                  <Ruler size={13} /> Size Chart & Guide
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {sizes.map((sz) => {
                  const isSelected = selectedSize.toUpperCase() === sz.toUpperCase();
                  const varStock = product.sizeVariants?.find(
                    (v) => v.size?.toUpperCase() === sz.toUpperCase()
                  );
                  const isSizeOut = varStock && (varStock.stock <= 0 || varStock.isAvailable === false);

                  return (
                    <button
                      key={sz}
                      type="button"
                      disabled={isSizeOut}
                      onClick={() => setSelectedSize(sz)}
                      className={`min-w-[48px] h-11 px-4 rounded-xs text-xs font-bold font-mono transition-all border ${
                        isSelected
                          ? "bg-[#141410] text-white border-[#141410] ring-2 ring-black/10"
                          : isSizeOut
                          ? "bg-gray-100 text-gray-400 border-gray-200 line-through cursor-not-allowed"
                          : "bg-white text-[#141410] border-gray-300 hover:border-black"
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>

              {isSizeDisabled && (
                <p className="text-[11px] text-red-600 mt-2 flex items-center gap-1 font-mono">
                  <AlertCircle size={12} /> Size &ldquo;{selectedSize}&rdquo; is out of stock. Please choose another size.
                </p>
              )}
            </div>

            {/* Stitching Option (if applicable) */}
            <div className="mb-6">
              <span className="block text-xs font-bold uppercase tracking-wider text-[#141410] mb-2">
                Stitching Type
              </span>
              <div className="grid grid-cols-2 gap-3 max-w-xs">
                {["Stitched", "Unstitched"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStitching(st)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xs border transition-all ${
                      selectedStitching === st
                        ? "bg-[#141410] text-white border-[#141410]"
                        : "bg-white text-gray-700 border-gray-300 hover:border-black"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-[#141410]">Quantity</span>
              <div className="flex items-center border border-[#e8e8e0] rounded bg-white">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                >
                  <Minus size={14} />
                </button>
                <span className="w-12 text-center text-sm font-bold font-mono">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(stock, q + 1))}
                  disabled={qty >= stock}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Primary Action Buttons: Add to Bag + Buy Now */}
            <div className="space-y-3 mb-8">
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={isOutOfStock || isSizeDisabled || addingToCart}
                  onClick={() => handleAddToCart(false)}
                  className="flex-1 py-4 bg-[#141410] hover:bg-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-sm transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <ShoppingBag size={16} />
                  <span>{addingToCart ? "Adding to Bag..." : isOutOfStock ? "Sold Out" : "Add to Bag"}</span>
                </button>

                <button
                  type="button"
                  disabled={isOutOfStock || isSizeDisabled || addingToCart}
                  onClick={() => handleAddToCart(true)}
                  className="flex-1 py-4 bg-[#d4af37] hover:bg-[#bfa030] text-black text-xs font-bold uppercase tracking-[0.2em] rounded-sm transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles size={16} />
                  <span>Buy It Now</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className={`px-4 py-4 border rounded-sm transition-all flex items-center justify-center ${
                    isSaved
                      ? "bg-rose-50 border-rose-300 text-rose-600"
                      : "bg-white border-[#e8e8e0] text-gray-700 hover:border-black"
                  }`}
                  title={isSaved ? "Saved to Wishlist" : "Save to Wishlist"}
                >
                  <Heart size={18} className={isSaved ? "fill-rose-600 text-rose-600" : ""} />
                </button>
              </div>

              {/* Trust Value Badges Grid */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-white border border-[#e8e8e0] rounded-sm text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Truck size={15} className="text-[#d4af37] flex-shrink-0" />
                  <span>Free Shipping over PKR 5k</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw size={15} className="text-[#d4af37] flex-shrink-0" />
                  <span>7-Day Easy Exchange</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-[#d4af37] flex-shrink-0" />
                  <span>100% Original Fabric</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock size={15} className="text-[#d4af37] flex-shrink-0" />
                  <span>Cash on Delivery (COD)</span>
                </div>
              </div>
            </div>

            {/* ── Tabs / Accordions for Garment Details ── */}
            <div className="border-t border-[#e8e8e0] pt-6 space-y-4">
              <div className="flex border-b border-[#e8e8e0] text-xs font-bold uppercase tracking-wider overflow-x-auto scrollbar-none">
                {[
                  { key: "description", label: "Description & Silhouette" },
                  { key: "craftsmanship", label: "Fabric & Craft" },
                  { key: "shipping", label: "Delivery Timelines" },
                  { key: "reviews", label: `Reviews (${reviewTotal})` },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors ${
                      activeTab === tab.key
                        ? "border-[#141410] text-[#141410]"
                        : "border-transparent text-gray-500 hover:text-black"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="py-3 text-xs leading-relaxed text-gray-700">
                {activeTab === "description" && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-[#141410]">
                      {product.description || "Expertly tailored luxury pret featuring clean botanical patterns and refined finishes."}
                    </p>
                    {product.details && product.details.length > 0 && (
                      <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                        {product.details.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {activeTab === "craftsmanship" && (
                  <div className="space-y-2">
                    <p><strong>Fabric Weave:</strong> {fabric}</p>
                    <p><strong>Garment Fit:</strong> {product.fit || "Regular Fit"}</p>
                    <p><strong>Season Edit:</strong> {product.season || "All Season '26"}</p>
                    <p><strong>Care Instructions:</strong> {product.careInstructions || "Dry clean recommended for embellished formals. Cold hand wash for printed cambric."}</p>
                  </div>
                )}

                {activeTab === "shipping" && (
                  <div className="space-y-2">
                    <p><strong>Lahore, Karachi, Islamabad & Rawalpindi:</strong> 2 – 3 Business Days via TCS Express</p>
                    <p><strong>Other Nationwide Destinations:</strong> 3 – 5 Business Days via TCS / Leopard Courier</p>
                    <p><strong>Delivery Charges:</strong> Free on all orders above PKR 5,000. Flat PKR 250 on orders below.</p>
                    <p><strong>Payment Methods:</strong> Cash on Delivery (COD), JazzCash, Easypaisa, Bank Transfer / IBFT, Credit/Debit Cards.</p>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="space-y-6">
                    {reviewError && <p role="alert" className="text-xs text-red-700">{reviewError}</p>}
                    {/* Reviews List */}
                    {reviews.length === 0 ? (
                      <p className="text-gray-500 italic">No reviews yet. Be the first to share your experience with this design!</p>
                    ) : (
                      <div className="space-y-4 divide-y divide-gray-100">
                        {reviews.map((r, i) => (
                          <div key={r._id || i} className="pt-3 first:pt-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-[#141410]">{r.user?.fullname || "Verified Customer"}</span>
                              <div className="flex text-amber-500">
                                {[...Array(r.rating || 5)].map((_, s) => (
                                  <Star key={s} size={12} className="fill-amber-400" />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-600">{r.comment}</p>
                            <span className="text-[10px] text-gray-400 font-mono">
                              {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-PK") : "Review"}
                              {((r.user?._id || r.user) === user?._id || ["admin", "superadmin"].includes(user?.role)) && <button type="button" className="ml-3 underline text-red-600" onClick={() => deleteReview(r._id)}>Delete</button>}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs mt-4"><button className="underline disabled:opacity-30" disabled={reviewPage <= 1} onClick={() => setReviewPage((page) => page - 1)}>Previous reviews</button><span>Page {reviewPage}</span><button className="underline disabled:opacity-30" disabled={reviewPage * 10 >= reviewTotal} onClick={() => setReviewPage((page) => page + 1)}>More reviews</button></div>
                    {/* Write Review Form */}
                    {!isAuthenticated && <Link to="/login" state={{ from: { pathname: `/products/${id}` } }} className="block text-xs underline">Sign in to write a review</Link>}
                    <form onSubmit={handleReviewSubmit} className="p-4 bg-white border border-[#e8e8e0] rounded-sm space-y-3">
                      <h4 className="font-serif text-sm font-bold text-[#141410] uppercase tracking-wider">
                        Write a Review
                      </h4>
                      <div>
                        <span className="block text-[10px] text-gray-500 font-mono uppercase mb-1">Rating</span>
                        <select
                          value={reviewForm.rating}
                          onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                          className="px-3 py-1.5 bg-[#fafaf8] border border-[#e8e8e0] rounded text-xs outline-none"
                        >
                          <option value="5">⭐⭐⭐⭐⭐ (5/5) Exceptional</option>
                          <option value="4">⭐⭐⭐⭐ (4/5) Very Good</option>
                          <option value="3">⭐⭐⭐ (3/5) Average</option>
                        </select>
                      </div>
                      <div>
                        <textarea
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          placeholder="Share your thoughts on fit, fabric texture, stitching..."
                          rows={3}
                          className="w-full p-2.5 bg-[#fafaf8] border border-[#e8e8e0] rounded text-xs outline-none focus:border-black"
                        />
                      </div>
                      <label className="block text-xs text-stone-500">Review photos (up to three)<input className="block mt-2" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(event) => setReviewImages([...(event.target.files || [])])} /></label>
                      <button
                        type="submit"
                        disabled={submittingReview || !isAuthenticated}
                        className="px-4 py-2 bg-[#141410] text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-black transition-colors"
                      >
                        {submittingReview ? "Submitting..." : "Submit Review"}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Related Apparel Pieces ── */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-[#e8e8e0]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#78786a]">
                  Curated Suggestions
                </p>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#141410]">
                  You May Also Admire
                </h3>
              </div>
              <Link
                to="/products"
                className="text-xs font-bold text-[#141410] hover:underline flex items-center gap-1"
              >
                Explore All Pieces <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p, idx) => (
                <ProductCard key={p._id || p.id || idx} product={p} index={idx} onOpenCart={onOpenCart} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Size Guide Modal */}
      <SizeCalculatorModal
        isOpen={sizeModalOpen}
        onClose={() => setSizeModalOpen(false)}
      />

      {/* Sticky Mobile Add to Cart Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#e8e8e0] p-3 z-30 shadow-2xl flex items-center gap-3">
        <div className="w-12 h-14 bg-gray-100 rounded-xs overflow-hidden flex-shrink-0">
          <img
            src={optimizeImage(rawImages[0]?.url || rawImages[0], { width: 120 })}
            alt=""
            className="w-full h-full object-cover object-top"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-[#141410] truncate">{product.title}</p>
          <p className="text-xs font-bold font-mono text-[#141410]">
            PKR {activePrice.toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => handleAddToCart(false)}
          disabled={isOutOfStock || isSizeDisabled}
          className="px-5 py-3 bg-[#141410] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xs shadow-md disabled:opacity-50"
        >
          {isOutOfStock ? "Sold Out" : "Add to Bag"}
        </button>
      </div>
    </div>
  );
}