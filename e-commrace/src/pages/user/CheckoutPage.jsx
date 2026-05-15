import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../../store/cartSlice";
import axios from "../../axiosConfig";
import toast from "react-hot-toast";
import { ArrowLeft, MapPin, CreditCard, Truck } from "lucide-react";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);

  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "Lahore",
    country: "Pakistan",
    zip: "54000",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);

  const subtotal = items.reduce((sum, item) => {
    const price = item.product?.discountPrice || item.product?.price || item.price;
    return sum + price * item.quantity;
  }, 0);

  useEffect(() => {
    if (items.length === 0) navigate("/cart");
  }, [items, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shippingAddress.street?.trim()) {
      toast.error("Street address is required");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/v6/order/place", {
        shippingAddress,
        paymentMethod,
      });

      toast.success("Order placed successfully!");
      dispatch(clearCart());
      navigate("/orders");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-10">
        <button 
          onClick={() => navigate("/cart")} 
          className="text-[#78786a] hover:text-[#1a1a14] transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="font-display text-4xl font-700 text-[#1a1a14]">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side - Shipping & Payment */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Shipping Address */}
            <div className="bg-white border border-[#e8e8e0] rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <MapPin size={24} className="text-[#1a1a14]" />
                <h2 className="font-display text-2xl font-700 text-[#1a1a14]">Shipping Address</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-[#78786a] uppercase tracking-wider">
                    Street Address
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl border border-[#e8e8e0] focus:border-[#1a1a14] outline-none text-sm"
                    placeholder="House number, street name, area"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-[#78786a] uppercase tracking-wider">City</label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl border border-[#e8e8e0] focus:border-[#1a1a14] outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-[#78786a] uppercase tracking-wider">ZIP Code</label>
                    <input
                      type="text"
                      value={shippingAddress.zip}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl border border-[#e8e8e0] focus:border-[#1a1a14] outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5 text-[#78786a] uppercase tracking-wider">Country</label>
                  <input
                    type="text"
                    value={shippingAddress.country}
                    disabled
                    className="w-full px-4 py-3.5 rounded-xl border border-[#e8e8e0] bg-[#f5f5f0] text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-[#e8e8e0] rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard size={24} className="text-[#1a1a14]" />
                <h2 className="font-display text-2xl font-700 text-[#1a1a14]">Payment Method</h2>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {[
                  { value: "cod", label: "Cash on Delivery", icon: Truck },
                  { value: "card", label: "Credit / Debit Card" },
                  { value: "jazzcash", label: "JazzCash" },
                  { value: "easypaisa", label: "EasyPaisa" },
                ].map((pm) => (
                  <label
                    key={pm.value}
                    className={`flex items-center gap-4 px-5 py-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === pm.value
                        ? "border-[#1a1a14] bg-[#f8f8f5]"
                        : "border-[#e8e8e0] hover:border-[#d4d4c8]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === pm.value}
                      onChange={() => setPaymentMethod(pm.value)}
                      className="accent-[#1a1a14]"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{pm.label}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-[#1a1a14] hover:bg-[#3c3c30] text-white font-semibold text-lg transition-all disabled:opacity-70 mt-4"
            >
              {loading ? "Processing Order..." : `Pay ₨ ${subtotal.toLocaleString()} & Place Order`}
            </button>
          </form>
        </div>

        {/* Right Side - Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-[#e8e8e0] rounded-2xl p-8 sticky top-8">
            <h3 className="font-display text-2xl font-700 mb-6">Order Summary</h3>

            <div className="space-y-6 max-h-[480px] overflow-y-auto pr-2">
              {items.map((item) => {
                const p = item.product;
                const price = p?.discountPrice || p?.price || 0;
                return (
                  <div key={p?._id} className="flex gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#f5f5f0] flex-shrink-0">
                      {p?.images?.[0]?.url && (
                        <img src={p.images[0].url} alt={p.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium leading-tight line-clamp-2">{p?.title}</p>
                      <p className="text-sm text-[#78786a] mt-1">Qty: {item.quantity}</p>
                      <p className="font-semibold mt-2">₨ {(price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-[#e8e8e0] mt-8 pt-6">
              <div className="flex justify-between text-xl font-semibold">
                <span>Total</span>
                <span>₨ {subtotal.toLocaleString()}</span>
              </div>
              <p className="text-green-600 text-sm mt-1">✓ Free Shipping</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}