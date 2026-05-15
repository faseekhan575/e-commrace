import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { updateQuantity, removeFromCart } from "../../store/cartSlice";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((s) => s.cart);

  const subtotal = items.reduce((sum, item) => {
    const p = item.product;
    const price = p?.discountPrice || p?.price || item.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const handleQty = async (productId, quantity) => {
    if (!productId || quantity < 1) return;
    const res = await dispatch(updateQuantity({ productId, quantity }));
    if (!updateQuantity.fulfilled.match(res)) toast.error(res.payload || "Update failed");
  };

  const handleRemove = async (productId) => {
    if (!productId) return;
    const res = await dispatch(removeFromCart(productId));
    if (removeFromCart.fulfilled.match(res)) toast.success("Removed from cart");
    else toast.error(res.payload || "Failed");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <ShoppingBag size={60} className="text-[#d4d4c8] mb-6" />
        <h2 className="font-display text-2xl font-700 text-[#1a1a14] mb-2">Your cart is empty</h2>
        <p className="text-sm text-[#78786a] mb-8">Looks like you haven't added anything yet.</p>
        <Link to="/products" className="px-8 py-3 rounded-full bg-[#1a1a14] text-white text-sm font-semibold hover:bg-[#3c3c30] transition-colors">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <p className="text-xs font-mono text-[#a8a898] uppercase tracking-widest mb-2">Your</p>
        <h1 className="font-display text-4xl font-700 text-[#1a1a14]">Cart ({items.length})</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const p = item.product;
            const productId = p?._id;
            const price = p?.discountPrice || p?.price || item.price || 0;

            return (
              <div key={productId || item._id} className="flex gap-4 bg-white border border-[#e8e8e0] rounded-2xl p-4">
                {/* Image */}
                <Link to={`/products/${productId}`} className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-[#f5f5f0]">
                    {p?.images?.[0]?.url
                      ? <img src={p.images[0].url} alt={p.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={28} className="text-[#d4d4c8]" /></div>
                    }
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${productId}`}>
                    <h3 className="font-medium text-sm text-[#1a1a14] leading-snug mb-1 hover:underline line-clamp-2">
                      {p?.title || "Product"}
                    </h3>
                  </Link>
                  <p className="text-xs text-[#78786a] mb-3">{p?.category?.name || ""}</p>

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    {/* Qty controls */}
                    <div className="flex items-center border border-[#e8e8e0] rounded-xl overflow-hidden">
                      <button
                        onClick={() => handleQty(productId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-[#f5f5f0] transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQty(productId, item.quantity + 1)}
                        disabled={item.quantity >= (p?.stock ?? 99)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-[#f5f5f0] transition-colors disabled:opacity-40">
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Price + remove */}
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-sm text-[#1a1a14]">
                        ₨ {(price * item.quantity).toLocaleString()}
                      </span>
                      <button onClick={() => handleRemove(productId)}
                        className="p-1.5 text-[#a8a898] hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div>
          <div className="bg-white border border-[#e8e8e0] rounded-2xl p-6 sticky top-24">
            <h2 className="font-semibold text-[#1a1a14] mb-6">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-[#78786a]">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-medium text-[#1a1a14]">₨ {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#78786a]">Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="border-t border-[#e8e8e0] pt-3 flex justify-between font-semibold text-[#1a1a14]">
                <span>Total</span>
                <span>₨ {subtotal.toLocaleString()}</span>
              </div>
            </div>
            <button onClick={() => navigate("/checkout")}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#1a1a14] hover:bg-[#3c3c30] text-white font-semibold text-sm transition-colors group">
              Checkout <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <Link to="/products" className="block text-center text-xs text-[#78786a] hover:text-[#1a1a14] mt-4 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}