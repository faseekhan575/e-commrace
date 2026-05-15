import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "../../axiosConfig";
import toast from "react-hot-toast";
import { ArrowLeft, Package, User, MapPin, ChevronDown, Loader2 } from "lucide-react";

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["unpaid", "paid", "refunded"];

const STATUS_STYLES = {
  pending:    { bg: "#78350f22", color: "#fbbf24", border: "#78350f55" },
  processing: { bg: "#1e3a5f22", color: "#60a5fa", border: "#1e3a5f55" },
  shipped:    { bg: "#312e8122", color: "#a78bfa", border: "#312e8155" },
  delivered:  { bg: "#06401422", color: "#34d399", border: "#06401455" },
  cancelled:  { bg: "#7f1d1d22", color: "#f87171", border: "#7f1d1d55" },
  unpaid:     { bg: "#7f1d1d22", color: "#f87171", border: "#7f1d1d55" },
  paid:       { bg: "#06401422", color: "#34d399", border: "#06401455" },
  refunded:   { bg: "#1e3a5f22", color: "#60a5fa", border: "#1e3a5f55" },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || { bg: "var(--bg3)", color: "var(--text2)", border: "var(--border)" };
  return (
    <span className="adm-mono text-[10px] font-medium px-2.5 py-1 rounded-full capitalize"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {status}
    </span>
  );
}

function SelectDropdown({ value, options, onChange, disabled, label }) {
  return (
    <div>
      <label className="adm-mono block text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--text3)" }}>
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full px-4 py-3 pr-10 rounded-xl text-sm appearance-none transition-all cursor-pointer disabled:opacity-50"
          style={{
            background: "var(--bg1)",
            border: "1px solid var(--border)",
            color: "var(--text1)",
            outline: "none",
          }}
          onFocus={(e) => e.target.style.borderColor = "#7c3aed"}
          onBlur={(e) => e.target.style.borderColor = "var(--border)"}>
          {options.map((o) => <option key={o} value={o} style={{ background: "var(--bg1)" }}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text3)" }} />
      </div>
    </div>
  );
}

function Skel({ className = "" }) {
  return <div className={`adm-skel ${className}`} />;
}

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useSelector((s) => s.auth);
  const basePath = role === "superadmin" ? "/superadmin" : "/admin";

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`/api/v9/dashboard/order/${id}`);
      setOrder(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load order");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const updateOrder = async (key, value) => {
    setUpdating(true);
    try {
      await axios.patch(`/api/v6/order/${id}/status`, { [key]: value });
      toast.success(`${key === "status" ? "Order" : "Payment"} status updated`);
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally { setUpdating(false); }
  };

  return (
    <div className="adm-syne pb-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(`${basePath}/orders`)}
          className="flex items-center gap-1.5 text-xs transition-colors"
          style={{ color: "var(--text3)" }}
          onMouseEnter={(e) => e.currentTarget.style.color = "var(--text1)"}
          onMouseLeave={(e) => e.currentTarget.style.color = "var(--text3)"}>
          <ArrowLeft size={13} /> Back
        </button>
        {!loading && order && (
          <div className="flex items-center gap-2.5">
            <span className="adm-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--text3)" }}>
              #{order._id.slice(-8).toUpperCase()}
            </span>
            <StatusBadge status={order.status} />
          </div>
        )}
      </div>

      {loading ? (
        /* ── Skeleton ── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 space-y-4">
            <div className="p-card rounded-2xl p-5 space-y-4">
              <Skel className="h-5 w-32 rounded" />
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-4 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
                  <Skel className="w-20 h-20 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skel className="h-4 w-3/4 rounded" />
                    <Skel className="h-3 w-1/2 rounded" />
                    <Skel className="h-5 w-24 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-4 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-card rounded-2xl p-5 space-y-3">
                <Skel className="h-4 w-28 rounded" />
                <Skel className="h-3 w-full rounded" />
                <Skel className="h-3 w-3/4 rounded" />
              </div>
            ))}
          </div>
        </div>
      ) : !order ? (
        <p style={{ color: "#f87171" }}>Order not found.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main */}
          <div className="lg:col-span-8 space-y-4">
            {/* Items */}
            <div className="p-card rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
                <Package size={15} style={{ color: "#a78bfa" }} />
                <h2 className="adm-syne font-semibold text-sm" style={{ color: "var(--text1)" }}>
                  Order Items ({order.items?.length})
                </h2>
              </div>
              <div className="divide-y" style={{ "--tw-divide-opacity": 1 }}>
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-5">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0"
                      style={{ background: "var(--bg3)", border: "1px solid var(--border)" }}>
                      {item.product?.images?.[0]?.url && (
                        <img src={item.product.images[0].url} alt={item.product.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm leading-snug mb-1" style={{ color: "var(--text1)" }}>
                        {item.product?.title}
                      </h3>
                      <p className="text-xs" style={{ color: "var(--text3)" }}>
                        Qty: <span style={{ color: "var(--text2)" }}>{item.quantity}</span>
                        &nbsp;·&nbsp; ₨ {item.priceAtPurchase?.toLocaleString()} each
                      </p>
                      <p className="adm-syne font-bold text-base mt-2" style={{ color: "#a78bfa" }}>
                        ₨ {(item.priceAtPurchase * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary on mobile — shown inline below items */}
            <div className="lg:hidden p-card rounded-2xl p-5 space-y-3">
              <h3 className="adm-syne font-semibold text-sm" style={{ color: "var(--text1)" }}>Summary</h3>
              <div className="flex justify-between py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                <span className="text-xs" style={{ color: "var(--text2)" }}>Total</span>
                <span className="adm-syne font-bold text-lg" style={{ color: "#a78bfa" }}>
                  ₨ {order.totalAmount?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: "var(--text3)" }}>Payment</span>
                <StatusBadge status={order.paymentStatus} />
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: "var(--text3)" }}>Date</span>
                <span style={{ color: "var(--text2)" }}>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            {/* Summary — desktop */}
            <div className="p-card rounded-2xl p-5 hidden lg:block">
              <h3 className="adm-syne font-semibold text-sm mb-4" style={{ color: "var(--text1)" }}>Order Summary</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--text2)" }}>Total Amount</span>
                  <span className="adm-syne font-bold text-lg" style={{ color: "#a78bfa" }}>
                    ₨ {order.totalAmount?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text3)" }}>Payment</span>
                  <StatusBadge status={order.paymentStatus} />
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text3)" }}>Method</span>
                  <span className="capitalize" style={{ color: "var(--text2)" }}>{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text3)" }}>Date</span>
                  <span style={{ color: "var(--text2)" }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Customer */}
            <div className="p-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <User size={14} style={{ color: "#a78bfa" }} />
                <h3 className="adm-syne font-semibold text-sm" style={{ color: "var(--text1)" }}>Customer</h3>
              </div>
              <div className="flex items-center gap-3">
                {order.user?.avatar?.url
                  ? <img src={order.user.avatar.url} className="w-9 h-9 rounded-xl object-cover flex-shrink-0" alt="" />
                  : <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
                      style={{ background: "var(--p-soft)", border: "1px solid var(--p-border)" }}>
                      <User size={13} style={{ color: "#a78bfa" }} />
                    </div>
                }
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate" style={{ color: "var(--text1)" }}>{order.user?.fullname}</p>
                  <p className="text-xs truncate" style={{ color: "var(--text3)" }}>{order.user?.email}</p>
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div className="p-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={14} style={{ color: "#a78bfa" }} />
                <h3 className="adm-syne font-semibold text-sm" style={{ color: "var(--text1)" }}>Shipping</h3>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text2)" }}>
                {order.shippingAddress?.street}<br />
                {order.shippingAddress?.city}, {order.shippingAddress?.country}<br />
                <span style={{ color: "var(--text3)" }}>ZIP: {order.shippingAddress?.zip}</span>
              </p>
            </div>

            {/* Status controls */}
            <div className="p-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="adm-syne font-semibold text-sm" style={{ color: "var(--text1)" }}>Update Status</h3>
                {updating && <Loader2 size={13} className="animate-spin" style={{ color: "#a78bfa" }} />}
              </div>
              <SelectDropdown
                label="Order Status"
                value={order.status}
                options={ORDER_STATUSES}
                onChange={(v) => updateOrder("status", v)}
                disabled={updating}
              />
              <SelectDropdown
                label="Payment Status"
                value={order.paymentStatus}
                options={PAYMENT_STATUSES}
                onChange={(v) => updateOrder("paymentStatus", v)}
                disabled={updating}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}