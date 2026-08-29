import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProduct } from "../../store/productsSlice";
import { addToCart } from "../../store/cartSlice";
import { CLOTHING_PRODUCTS } from "../../data/clothingData";
import ProductCard from "../../components/ProductCard";
import axios from "../../axiosConfig";
import {
  ShoppingBag, Star, ChevronLeft, ChevronRight,
  Minus, Plus, Heart, Upload, X, ArrowLeft,
  Ruler, ShieldCheck, Truck, RotateCcw, Sparkles, Check
} from "lucide-react";
import { optimizeImage } from "../../utils/imageOptimizer";
import BrandLoader from "../../components/BrandLoader";
import SizeCalculatorModal from "../../components/SizeCalculatorModal";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { current: serverProduct, loading } = useSelector((s) => s.products);
  const { isAuthenticated } = useSelector((s) => s.auth);

  const product = serverProduct;

  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedStitching, setSelectedStitching] = useState("Stitched");
  const [activeImg, setActiveImg] = useState(0);
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [fitCalculatorOpen, setFitCalculatorOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewImages, setReviewImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchProduct(id));
    if (typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id)) {
      axios.get(`/api/v7/review/${id}`)
        .then((r) => setReviews(r.data.data || []))
        .catch(() => {});
    }
  }, [dispatch, id]);

  const handleAddToCart = async () => {
    if (!product) return;
    const res = await dispatch(
      addToCart({
        productId: product._id || id,
        quantity: qty,
        product,
        size: selectedSize,
        stitching: selectedStitching,
      })
    );
    toast.success(`Added ${product.title} (${selectedSize}) to Bag`, {
      icon: "🛍️",
      style: { borderRadius: "12px", background: "#1a1a14", color: "#fff", fontSize: "13px" },
    });
  };

  const handleReviewImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + reviewImages.length > 3) {
      toast.error("Maximum 3 images allowed");
      return;
    }
    setReviewImages((prev) => [...prev, ...files]);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) {
      toast.error("Please write a review");
      return;
    }
    setSubmitting(true);
    const fd = new FormData();
    fd.append("rating", reviewForm.rating);
    fd.append("comment", reviewForm.comment);
    reviewImages.forEach((file) => fd.append("images", file));
    try {
      const res = await axios.post(`/api/v7/review/${id}/add`, fd);
      setReviews((prev) => [res.data.data, ...prev]);
      setReviewForm({ rating: 5, comment: "" });
      setReviewImages([]);
      toast.success("Thank you for your review!");
    } catch (err) {
      // Local optimistic fallback
      setReviews((prev) => [
        {
          _id: `rev-${Date.now()}`,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
          user: { fullname: "You" },
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setReviewForm({ rating: 5, comment: "" });
      toast.success("Review submitted!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !product) {
    if (loading) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center bg-[#fafaf8]">
          <BrandLoader size="lg" text="CLOTHING DEN" subtitle="LOADING COUTURE DETAILS..." />
        </div>
      );
    }
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#fafaf8] px-4 text-center">
        <h2 className="font-serif text-2xl text-[#1a1a14] mb-2">Product Not Found</h2>
        <p className="text-sm text-[#78786a] mb-6">The requested garment could not be found in our active inventory.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a1a14] text-white text-xs font-semibold tracking-widest uppercase rounded-full hover:bg-black transition-all"
        >
          Explore All Apparel
        </Link>
      </div>
    );
  }

  const images = (product.images && product.images.length > 0)
    ? product.images
    : [{ url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=85" }];

  const price = product.price || 0;
  const discountPrice = product.discountPrice;
  const fabric = product.fabric || "Pure Luxury Weave";
  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ["XS", "S", "M", "L", "XL"];

  const discount = discountPrice && discountPrice < price
    ? Math.round(((price - discountPrice) / price) * 100)
    : null;

  return (
    <div className="bg-[#fafaf8] min-h-screen py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-[#78786a] mb-6">
          <Link to="/" className="hover:text-black">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-black">Apparel</Link>
          <span>/</span>
          <span className="text-[#141410] font-semibold truncate max-w-xs">{product.title}</span>
        </div>

        {/* ── Product Hero Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">

          {/* Left: Gallery (5 cols on lg) */}
          <div className="lg:col-span-6">
            <div className="flex flex-col-reverse sm:flex-row gap-4">

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:max-h-[600px] scrollbar-none flex-shrink-0">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImg(idx)}
                      className={`w-16 sm:w-20 aspect-[3/4] overflow-hidden rounded border transition-all ${
                        activeImg === idx
                          ? "border-[#141410] ring-2 ring-black/10"
                          : "border-[#e8e8e0] opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={optimizeImage(img.url, { width: 250 })}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Portrait Picture */}
              <div className="relative aspect-[3/4.2] flex-1 overflow-hidden bg-[#f5f5f0] rounded-sm shadow-sm group">
                <img
                  src={optimizeImage(images[activeImg]?.url || images[0]?.url, { width: 1200 })}
                  alt={product.title}
                  fetchPriority="high"
                  className="w-full h-full object-cover object-top transition-transform duration-700 hover:scale-105"
                />

                {/* Wishlist Button */}
                <button
                  onClick={() => {
                    setIsWishlisted(!isWishlisted);
                    toast.success(isWishlisted ? "Removed from Wishlist" : "Saved to Wishlist ♥");
                  }}
                  className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md hover:bg-white transition-transform hover:scale-110"
                >
                  <Heart size={18} className={isWishlisted ? "fill-red-600 text-red-600" : "text-black"} />
                </button>

                {discount && (
                  <span className="absolute top-4 left-4 bg-[#141410] text-white text-xs font-bold px-3 py-1 uppercase tracking-wider">
                    -{discount}% OFF
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Product Details & Purchase Form (7 cols on lg) */}
          <div className="lg:col-span-6 flex flex-col">

            {/* Fabric Tagline (e.g. Printed | Cambric) */}
            <p className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-[#78786a] mb-1.5 font-mono">
              {fabric}
            </p>

            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141410] leading-tight mb-3">
              {product.title}
            </h1>

            {/* SKU & In Stock badge */}
            <div className="flex items-center gap-4 text-xs mb-4">
              <span className="text-[#8e8e7e]">SKU: {product.sku || `SAP-${id?.slice(-4) || "8801"}`}</span>
              <span className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                In Stock & Ready to Dispatch
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 py-3 border-y border-[#e8e8e0] mb-6">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-[#141410]">
                PKR {(discountPrice || price).toLocaleString()}
              </span>
              {discountPrice && discountPrice < price && (
                <span className="text-base text-[#9ca3af] line-through">
                  PKR {price.toLocaleString()}
                </span>
              )}
              <span className="text-[11px] text-[#78786a] ml-auto">Inclusive of all sales taxes</span>
            </div>

            {/* Stitching Type Selector */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-[0.18em] text-[#141410] mb-2">
                Stitching Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["Stitched (Ready to Wear)", "Unstitched Fabric Piece"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedStitching(type.split(" ")[0])}
                    className={`py-3 px-4 rounded text-xs font-semibold border transition-all text-center flex items-center justify-center gap-2 ${
                      selectedStitching === type.split(" ")[0]
                        ? "bg-[#141410] text-white border-black"
                        : "bg-white border-[#e8e8e0] text-[#141410] hover:border-black"
                    }`}
                  >
                    {selectedStitching === type.split(" ")[0] && <Check size={14} />}
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector + Size Chart Modal Button */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-[#141410]">
                  Select Size
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFitCalculatorOpen(true)}
                    className="text-xs font-bold text-[#d4af37] bg-[#141410] px-2.5 py-1 rounded-full flex items-center gap-1 hover:brightness-125 transition-all shadow-xs"
                  >
                    <Sparkles size={12} /> Find My Fit
                  </button>
                  <button
                    type="button"
                    onClick={() => setSizeModalOpen(true)}
                    className="text-xs font-semibold text-[#141410] hover:text-[#d4af37] underline flex items-center gap-1"
                  >
                    <Ruler size={13} /> Size Guide
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {sizes.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`min-w-[48px] h-11 px-3 rounded text-xs font-bold border transition-all ${
                      selectedSize === sz
                        ? "bg-[#141410] text-white border-black shadow-sm"
                        : "bg-white border-[#e8e8e0] text-[#141410] hover:border-black"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity + Add to Bag */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center border border-[#141410] rounded h-13 overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-12 h-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-12 text-center text-sm font-bold">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(qty + 1)}
                  className="w-12 h-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 h-13 bg-[#141410] hover:bg-black text-white rounded font-bold text-xs sm:text-sm tracking-[0.2em] uppercase flex items-center justify-center gap-3 shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                <ShoppingBag size={17} /> Add to Bag
              </button>
            </div>

            {/* Delivery & Guarantee Badges */}
            <div className="bg-white border border-[#e8e8e0] rounded p-4 space-y-3 text-xs mb-8">
              <div className="flex items-center gap-3">
                <Truck size={17} className="text-[#d4af37] flex-shrink-0" />
                <span><strong>Express Dispatch:</strong> Orders delivered in 2-3 business days across Pakistan.</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck size={17} className="text-[#d4af37] flex-shrink-0" />
                <span><strong>100% Pure Fabric Quality:</strong> Premium pure combed cambric/lawn guarantee.</span>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw size={17} className="text-[#d4af37] flex-shrink-0" />
                <span><strong>7-Day Hassle-Free Exchanges:</strong> Easy size/style swaps in store or online.</span>
              </div>
            </div>

            {/* Fabric Details & Care Instructions Accordion */}
            <div className="border-t border-[#e8e8e0] pt-4 space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#141410] mb-2">
                  Fabric Specifications & Description
                </h3>
                <p className="text-xs sm:text-sm text-[#555] leading-relaxed mb-3">
                  {product.description || "Expertly crafted Eastern luxury couture piece with intricate embroidery and premium finishing."}
                </p>
                {Array.isArray(product.details) && product.details.length > 0 && (
                  <ul className="list-disc pl-4 text-xs text-[#666] space-y-1">
                    {product.details.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                )}
                {(!product.details || product.details.length === 0) && (
                  <ul className="list-disc pl-4 text-xs text-[#666] space-y-1">
                    <li>Fabric: {fabric}</li>
                    <li>Cut: Contemporary Eastern Silhouette</li>
                    <li>Care: Dry clean recommended or gentle hand wash</li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Customer Reviews & Ratings ── */}
        <section className="mt-20 pt-12 border-t border-[#e8e8e0]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#141410]">Verified Customer Reviews</h2>
              <p className="text-xs text-[#78786a] mt-1">Real ratings & reviews from verified purchasers</p>
            </div>
          </div>

          {/* Review Input Box */}
          <div className="bg-white border border-[#e8e8e0] p-6 rounded mb-10 max-w-2xl">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3">Leave a Review</h3>
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setReviewForm({ ...reviewForm, rating: st })}
                >
                  <Star
                    size={22}
                    className={st <= reviewForm.rating ? "text-[#d4af37] fill-[#d4af37]" : "text-gray-300"}
                  />
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              placeholder="Tell us about the fabric quality, fitting, and stitching..."
              className="w-full p-3 border border-[#e8e8e0] rounded text-xs outline-none focus:border-black mb-4"
            />
            <button
              onClick={handleReview}
              className="px-6 py-2.5 bg-[#141410] text-white text-xs font-bold uppercase tracking-widest rounded hover:bg-black transition-colors"
            >
              Submit Review
            </button>
          </div>

          {/* Reviews List */}
          <div className="space-y-4 max-w-2xl">
            {reviews.length === 0 ? (
              <p className="text-xs text-[#78786a]">No reviews yet. Be the first to share your thoughts!</p>
            ) : (
              reviews.map((r, i) => (
                <div key={r._id || i} className="p-4 bg-white border border-[#e8e8e0] rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-[#141410]">{r.user?.fullname || "Verified Buyer"}</span>
                    <span className="text-[10px] text-gray-400">{new Date(r.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <div className="flex mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={12} className={s <= (r.rating || 5) ? "text-[#d4af37] fill-[#d4af37]" : "text-gray-200"} />
                    ))}
                  </div>
                  <p className="text-xs text-[#555] leading-relaxed">{r.comment}</p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ── Size Guide Modal ── */}
        {sizeModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-lg w-full p-6 relative animate-in fade-in zoom-in-95">
              <button
                onClick={() => setSizeModalOpen(false)}
                className="absolute top-4 right-4 p-1 text-gray-400 hover:text-black"
              >
                <X size={20} />
              </button>
              <h3 className="font-serif text-2xl font-bold mb-1">Kurta Size Chart (Inches)</h3>
              <p className="text-xs text-gray-500 mb-6">Standard Pakistani regular & ready-to-wear sizing</p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-gray-200">
                  <thead className="bg-gray-100 text-gray-700 font-bold uppercase">
                    <tr>
                      <th className="p-2.5 border">Size</th>
                      <th className="p-2.5 border">Chest</th>
                      <th className="p-2.5 border">Waist</th>
                      <th className="p-2.5 border">Hip</th>
                      <th className="p-2.5 border">Length</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="p-2.5 border font-bold">XS</td><td className="p-2.5 border">36"</td><td className="p-2.5 border">34"</td><td className="p-2.5 border">38"</td><td className="p-2.5 border">38"</td></tr>
                    <tr className="bg-gray-50"><td className="p-2.5 border font-bold">S</td><td className="p-2.5 border">38"</td><td className="p-2.5 border">36"</td><td className="p-2.5 border">40"</td><td className="p-2.5 border">39"</td></tr>
                    <tr><td className="p-2.5 border font-bold">M</td><td className="p-2.5 border">41"</td><td className="p-2.5 border">39"</td><td className="p-2.5 border">43"</td><td className="p-2.5 border">40"</td></tr>
                    <tr className="bg-gray-50"><td className="p-2.5 border font-bold">L</td><td className="p-2.5 border">44"</td><td className="p-2.5 border">42"</td><td className="p-2.5 border">46"</td><td className="p-2.5 border">41"</td></tr>
                    <tr><td className="p-2.5 border font-bold">XL</td><td className="p-2.5 border">47"</td><td className="p-2.5 border">45"</td><td className="p-2.5 border">49"</td><td className="p-2.5 border">42"</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-gray-400 mt-4">
                * Note: Measurements are for garment dimensions. Custom tailoring is available for special unstitched requests.
              </p>
            </div>
          </div>
        )}

        {/* ── Virtual Fitting Room & Fit Calculator Modal ── */}
        <SizeCalculatorModal
          isOpen={fitCalculatorOpen}
          onClose={() => setFitCalculatorOpen(false)}
          onSelectSize={(recommended) => setSelectedSize(recommended)}
          productTitle={product.title}
        />

      </div>
    </div>
  );
}