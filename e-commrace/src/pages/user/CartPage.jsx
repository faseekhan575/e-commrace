import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { updateQuantity, removeFromCart } from "../../store/cartSlice";
import {
  Minus, Plus, Trash2, ShoppingBag, ArrowRight,
  ShieldCheck, Truck, Sparkles, Tag, CheckCircle2
} from "lucide-react";
import {
  EasypaisaLogo, JazzCashLogo, BankTransferLogos,
  CardLogos, GooglePayLogo, ApplePayLogo, CODLogo, SadaPayLogo
} from "../../components/PaymentLogos";
import toast from "react-hot-toast";

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((s) => s.cart);

  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");

  const subtotal = items.reduce((sum, item) => {
    const p = item.product;
    const price = p?.discountPrice || p?.price || item.price || 4500;
    return sum + price * item.quantity;
  }, 0);

  const FREE_SHIPPING_THRESHOLD = 5000;
  const progressToFreeShipping = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const discountAmount = Math.round((subtotal * appliedDiscount) / 100);
  const finalTotal = subtotal - discountAmount;

  const handleQty = async (productId, quantity) => {
    if (!productId || quantity < 1) return;
    const res = await dispatch(updateQuantity({ productId, quantity }));
    if (!updateQuantity.fulfilled.match(res)) toast.error(res.payload || "Update failed");
  };

  const handleRemove = async (productId) => {
    if (!productId) return;
    const res = await dispatch(removeFromCart(productId));
    if (removeFromCart.fulfilled.match(res)) toast.success("Item removed from bag");
    else toast.error(res.payload || "Failed");
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError("");
    const code = couponCode.trim().toUpperCase();
    if (code === "CLOTHINGDEN10" || code === "SAPPHIRE10") {
      setAppliedDiscount(10);
      toast.success("10% Clothing Den VIP discount applied!");
    } else if (code === "EID2026") {
      setAppliedDiscount(15);
      toast.success("15% Festive discount applied!");
    } else if (code === "FREESHIP") {
      toast.success("Free Express Shipping applied!");
    } else {
      setCouponError("Invalid promo code. Try 'CLOTHINGDEN10' or 'EID2026'");
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-[#f5f5f0] flex items-center justify-center mb-6">
          <ShoppingBag size={36} className="text-[#8e8e7e]" />
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#141410] mb-2">
          Your Shopping Bag is Empty
        </h2>
        <p className="text-xs sm:text-sm text-[#78786a] max-w-sm mb-8 leading-relaxed">
          Discover our latest Festive Lawn, Ready to Wear Kurtas, and signature Luxury Pret pieces.
        </p>
        <Link
          to="/products"
          className="px-8 py-3.5 bg-[#141410] text-white hover:bg-black text-xs font-bold uppercase tracking-[0.2em] rounded-sm shadow-md transition-all"
        >
          Explore New Arrivals
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#fafaf8] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Cart Header & Free Delivery Meter ── */}
        <div className="border-b border-[#e8e8e0] pb-6 mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#141410] mb-3">
            Shopping Bag ({items.length} {items.length === 1 ? "Item" : "Items"})
          </h1>

          {/* Free Shipping Progress Meter */}
          <div className="bg-white border border-[#e8e8e0] rounded p-4 max-w-2xl">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="flex items-center gap-1.5 text-[#141410]">
                <Truck size={15} className="text-[#d4af37]" />
                {amountNeeded === 0
                  ? "🎉 You have qualified for FREE Express Delivery across Pakistan!"
                  : `Add PKR ${amountNeeded.toLocaleString()} more to unlock FREE Delivery`}
              </span>
              <span className="text-[#d4af37] font-mono">{progressToFreeShipping}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#141410] rounded-full transition-all duration-500"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Cart Grid: Items (Left) & Summary (Right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left: Items List (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-4">
            {items.map((item) => {
              const p = item.product;
              const productId = p?._id;
              const price = p?.discountPrice || p?.price || item.price || 4500;
              const fabric = p?.fabric || "Printed | Cambric";
              const title = p?.title || "Short Floral Kurta";
              const imgUrl = p?.images?.[0]?.url || "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80";

              return (
                <div
                  key={productId || item._id}
                  className="bg-white border border-[#e8e8e0] rounded-sm p-4 sm:p-5 flex gap-4 sm:gap-6 items-start transition-shadow hover:shadow-sm"
                >
                  {/* Portrait Apparel Image */}
                  <Link to={`/products/${productId}`} className="w-20 sm:w-28 aspect-[3/4] bg-[#f5f5f0] overflow-hidden rounded-none sm:rounded-sm flex-shrink-0">
                    <img src={imgUrl} alt={title} className="w-full h-full object-cover object-top hover:scale-105 transition-transform" />
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[#78786a] font-mono uppercase tracking-wider mb-0.5">
                      {fabric}
                    </p>
                    <Link to={`/products/${productId}`} className="hover:underline">
                      <h3 className="font-semibold text-sm sm:text-base text-[#141410] leading-snug line-clamp-2 mb-2">
                        {title}
                      </h3>
                    </Link>

                    {/* Attributes */}
                    <div className="flex items-center gap-3 text-xs text-[#78786a] mb-4 flex-wrap">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-[11px] font-bold text-black">
                        Size: M
                      </span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-[11px] text-gray-700">
                        Stitched Pret
                      </span>
                    </div>

                    {/* Quantity Selector & Price */}
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center border border-gray-300 rounded overflow-hidden bg-white">
                        <button
                          onClick={() => handleQty(productId, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-9 text-center text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => handleQty(productId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-serif text-base sm:text-lg font-bold text-[#141410]">
                          PKR {(price * item.quantity).toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleRemove(productId)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Back to Shopping */}
            <div className="pt-2">
              <Link
                to="/products"
                className="text-xs font-bold uppercase tracking-wider text-[#141410] hover:text-[#d4af37] flex items-center gap-1.5"
              >
                ← Continue Browsing Collections
              </Link>
            </div>
          </div>

          {/* Right: Order Summary & Coupon (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6">

            {/* Coupon Code Input Box */}
            <div className="bg-white border border-[#e8e8e0] rounded-sm p-5">
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#141410] mb-3 flex items-center gap-1.5">
                <Tag size={14} className="text-[#d4af37]" /> Promotional Voucher
              </h3>
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Try CLOTHINGDEN10 or EID2026"
                  className="flex-1 px-3.5 py-2.5 border border-[#e8e8e0] rounded text-xs uppercase outline-none focus:border-black"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#141410] text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-black transition-colors"
                >
                  Apply
                </button>
              </form>
              {couponError && <p className="text-[11px] text-rose-600 mt-2">{couponError}</p>}
              {appliedDiscount > 0 && (
                <p className="text-[11px] text-emerald-700 font-semibold mt-2 flex items-center gap-1">
                  <CheckCircle2 size={13} /> {appliedDiscount}% Promo Discount Applied
                </p>
              )}
            </div>

            {/* Summary Box */}
            <div className="bg-white border border-[#e8e8e0] rounded-sm p-6 space-y-4">
              <h2 className="font-serif text-2xl font-bold text-[#141410] border-b border-[#e8e8e0] pb-3">
                Order Summary
              </h2>

              <div className="space-y-2.5 text-xs text-[#555]">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-black font-mono">PKR {subtotal.toLocaleString()}</span>
                </div>

                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Voucher Discount ({appliedDiscount}%)</span>
                    <span>- PKR {discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping (Nationwide Express)</span>
                  <span className="text-emerald-700 font-bold">
                    {subtotal >= FREE_SHIPPING_THRESHOLD ? "FREE" : "PKR 250"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span>Included</span>
                </div>
              </div>

              <div className="border-t border-[#e8e8e0] pt-4 flex justify-between items-baseline font-serif text-2xl font-bold text-[#141410]">
                <span>Total Amount</span>
                <span>PKR {finalTotal.toLocaleString()}</span>
              </div>

              {/* Proceed to Checkout Button */}
              <button
                onClick={() => navigate("/checkout")}
                className="w-full py-4 bg-[#141410] hover:bg-black text-white rounded-sm font-bold text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.01]"
              >
                Proceed to Checkout <ArrowRight size={15} />
              </button>

              {/* Payment Methods Ribbon */}
              <div className="pt-4 border-t border-gray-100 text-center">
                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-3">
                  Guaranteed Multi-Channel Checkout
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <CODLogo />
                  <EasypaisaLogo />
                  <JazzCashLogo />
                  <SadaPayLogo />
                  <CardLogos />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}