import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProduct } from "../../store/productsSlice";
import { addToCart } from "../../store/cartSlice";
import axios from "../../axiosConfig";
import { 
  ShoppingBag, Star, ChevronLeft, ChevronRight, 
  Minus, Plus, Heart, Eye, Package, Truck, Upload, X 
} from "lucide-react";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { current: product, loading } = useSelector((s) => s.products);
  const { isAuthenticated } = useSelector((s) => s.auth);

  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewImages, setReviewImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    dispatch(fetchProduct(id));
    axios.get(`/api/v7/review/${id}`).then((r) => setReviews(r.data.data)).catch(() => {});
  }, [dispatch, id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add to cart");
      navigate("/login");
      return;
    }
    const res = await dispatch(addToCart({ productId: id, quantity: qty }));
    if (addToCart.fulfilled.match(res)) toast.success("Added to cart!");
    else toast.error(res.payload || "Failed");
  };

  const handleReviewImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + reviewImages.length > 3) {
      toast.error("Maximum 3 images allowed");
      return;
    }
    setReviewImages(prev => [...prev, ...files]);
  };

  const removeReviewImage = (index) => {
    setReviewImages(prev => prev.filter((_, i) => i !== index));
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

    reviewImages.forEach((file) => {
      fd.append("images", file);
    });

    try {
      const res = await axios.post(`/api/v7/review/${id}/add`, fd);
      setReviews((prev) => [res.data.data, ...prev]);
      setReviewForm({ rating: 5, comment: "" });
      setReviewImages([]);
      toast.success("Review submitted successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) 
    : null;

  if (loading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
        <div className="aspect-square bg-[#f0f0e8] rounded-3xl" />
        <div className="space-y-4 pt-6">
          <div className="h-4 bg-[#f0f0e8] rounded w-1/4" />
          <div className="h-8 bg-[#f0f0e8] rounded w-2/3" />
          <div className="h-6 bg-[#f0f0e8] rounded w-1/3" />
        </div>
      </div>
    );
  }

  const images = product.images || [];
  const price = product.discountPrice || product.price;
  const discount = product.discountPrice && product.discountPrice < product.price
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery - Premium */}
        <div>
          <div className="relative aspect-square bg-[#f5f5f0] rounded-3xl overflow-hidden mb-6 shadow-xl">
            {images[activeImg]?.url ? (
              <img 
                src={images[activeImg].url} 
                alt={product.title} 
                className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag size={80} className="text-[#d4d4c8]" />
              </div>
            )}

            {images.length > 1 && (
              <>
                <button 
                  onClick={() => setActiveImg((prev) => (prev - 1 + images.length) % images.length)}
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-lg flex items-center justify-center shadow-xl hover:bg-white transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={() => setActiveImg((prev) => (prev + 1) % images.length)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-lg flex items-center justify-center shadow-xl hover:bg-white transition-all"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            <button 
              onClick={() => setLiked(!liked)}
              className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/90 backdrop-blur-lg flex items-center justify-center shadow-xl hover:bg-white transition-all"
            >
              <Heart size={22} className={liked ? "fill-red-500 text-red-500" : "text-[#1a1a14]"} />
            </button>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all snap-start ${
                    i === activeImg ? "border-[#1a1a14] scale-105" : "border-transparent hover:border-[#d4d4c8]"
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="lg:pt-4">
          <p className="text-xs font-mono text-[#a8a898] uppercase tracking-[2px] mb-2">{product.category?.name}</p>
          
          <h1 className="font-display text-4xl font-700 leading-tight text-[#1a1a14] mb-4">
            {product.title}
          </h1>

          {/* Rating */}
          {avgRating && (
            <div className="flex items-center gap-3 mb-6">
              <div className="flex">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={18} className={s <= Math.round(avgRating) ? "text-[#e8b520] fill-[#e8b520]" : "text-[#e8e8e0]"} />
                ))}
              </div>
              <span className="text-lg font-semibold text-[#1a1a14]">{avgRating}</span>
              <span className="text-[#a8a898]">({reviews.length} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-4 mb-8">
            <span className="font-display text-5xl font-700 text-[#1a1a14]">₨ {price.toLocaleString()}</span>
            {discount && (
              <>
                <span className="text-2xl text-[#a8a898] line-through">₨ {product.price.toLocaleString()}</span>
                <span className="bg-[#1a1a14] text-white text-sm font-bold px-4 py-2 rounded-2xl">-{discount}% OFF</span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-3 mb-8">
            <div className={`w-3 h-3 rounded-full ${product.stock > 5 ? "bg-green-500" : product.stock > 0 ? "bg-yellow-500" : "bg-red-500"}`} />
            <span className="font-medium">
              {product.stock > 0 ? `${product.stock} pieces available` : "Out of Stock"}
            </span>
          </div>

          {/* Description */}
          <p className="text-[#555] leading-relaxed text-[17px] mb-10">{product.description}</p>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              {product.tags.map((tag, i) => (
                <span key={i} className="px-5 py-2 bg-[#f5f5f0] text-xs rounded-full border border-[#e8e8e0] text-[#555]">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Add to Cart */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-[#e8e8e0] rounded-2xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-14 h-14 flex items-center justify-center hover:bg-[#f5f5f0] active:bg-[#ebebe0] transition-colors">
                  <Minus size={20} />
                </button>
                <span className="w-16 text-center text-xl font-semibold">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="w-14 h-14 flex items-center justify-center hover:bg-[#f5f5f0] active:bg-[#ebebe0] transition-colors">
                  <Plus size={20} />
                </button>
              </div>

              <button 
                onClick={handleAddToCart}
                className="flex-1 h-14 bg-[#1a1a14] hover:bg-black text-white rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.985]"
              >
                <ShoppingBag size={22} /> Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section - Beautiful */}
      <div className="mt-24">
        <h2 className="font-display text-4xl font-700 text-[#1a1a14] mb-10">Customer Reviews</h2>

        {/* Write Review */}
        {isAuthenticated && (
          <div className="bg-white border border-[#e8e8e0] rounded-3xl p-10 mb-12">
            <h3 className="text-2xl font-semibold mb-6">Write a Review</h3>
            
            <div className="flex gap-2 mb-6">
              {[1,2,3,4,5].map((s) => (
                <button key={s} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: s })}>
                  <Star size={32} className={s <= reviewForm.rating ? "text-[#e8b520] fill-[#e8b520]" : "text-[#e8e8e0]"} />
                </button>
              ))}
            </div>

            <textarea
              rows={4}
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              placeholder="What did you think about this product?"
              className="w-full px-6 py-5 rounded-2xl border border-[#e8e8e0] focus:border-[#1a1a14] outline-none text-lg resize-none"
            />

            {/* Image Upload */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-3 text-[#555]">Add Photos (Max 3)</label>
              <div className="flex gap-4 flex-wrap">
                {reviewImages.map((file, i) => (
                  <div key={i} className="relative w-24 h-24 border rounded-2xl overflow-hidden">
                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removeReviewImage(i)} className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1">
                      <X size={14} />
                    </button>
                  </div>
                ))}

                {reviewImages.length < 3 && (
                  <label className="w-24 h-24 border-2 border-dashed border-[#e8e8e0] hover:border-[#1a1a14] rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors">
                    <Upload size={28} className="text-[#a8a898]" />
                    <span className="text-xs text-[#a8a898] mt-1">Upload</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleReviewImageSelect} />
                  </label>
                )}
              </div>
            </div>

            <button 
              onClick={handleReview}
              disabled={submitting || !reviewForm.comment.trim()}
              className="mt-8 px-10 py-4 bg-[#1a1a14] text-white rounded-2xl font-semibold hover:bg-black transition-all disabled:opacity-50"
            >
              {submitting ? "Submitting Review..." : "Post Review"}
            </button>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <p className="text-center text-[#78786a] py-16 text-lg">No reviews yet. Be the first to review this product.</p>
        ) : (
          <div className="space-y-8">
            {reviews.map((r) => (
              <div key={r._id} className="bg-white border border-[#e8e8e0] rounded-3xl p-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    {r.user?.avatar?.url ? (
                      <img src={r.user.avatar.url} className="w-12 h-12 rounded-2xl object-cover" alt="" />
                    ) : (
                      <div className="w-12 h-12 bg-[#f5f5f0] rounded-2xl flex items-center justify-center text-xl font-semibold">
                        {r.user?.fullname?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-semibold">{r.user?.fullname}</p>
                      <span className="text-xs text-[#a8a898]">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex mt-1 mb-3">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} size={16} className={s <= r.rating ? "text-[#e8b520] fill-[#e8b520]" : "text-[#e8e8e0]"} />
                      ))}
                    </div>
                    <p className="text-[#555] leading-relaxed">{r.comment}</p>

                    {r.images?.length > 0 && (
                      <div className="flex gap-3 mt-6">
                        {r.images.map((img, i) => (
                          <img key={i} src={img.url} alt="review" className="w-20 h-20 object-cover rounded-2xl" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}