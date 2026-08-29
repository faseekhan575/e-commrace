import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "../../axiosConfig";
import toast from "react-hot-toast";
import { ArrowLeft, Package, User, MapPin, ChevronDown, Loader2, CreditCard } from "lucide-react";

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["unpaid", "paid", "refunded"];

const STATUS_STYLES = {
  pending:    "bg-amber-50 text-amber-800 border border-amber-200",
  processing: "bg-blue-50 text-blue-800 border border-blue-200",
  shipped:    "bg-purple-50 text-purple-800 border border-purple-200",
  delivered:  "bg-emerald-50 text-emerald-800 border border-emerald-200",
  cancelled:  "bg-rose-50 text-rose-800 border border-rose-200",
  unpaid:     "bg-rose-50 text-rose-800 border border-rose-200",
  paid:       "bg-emerald-50 text-emerald-800 border border-emerald-200",
  refunded:   "bg-blue-50 text-blue-800 border border-blue-200",
};

function StatusBadge({ status }) {
  const badgeClass = STATUS_STYLES[status] || "bg-slate-100 text-slate-700 border border-slate-200";
  return (
    <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${badgeClass}`}>
      {status}
    </span>
  );
}

function SelectDropdown({ value, options, onChange, disabled, label }) {
  return (
    <div>
      <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 appearance-none cursor-pointer outline-none focus:border-indigo-500 focus:bg-white transition-all disabled:opacity-50"
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o.charAt(0).toUpperCase() + o.slice(1)}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
      </div>
    </div>
  );
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const updateOrder = async (key, value) => {
    setUpdating(true);
    try {
      await axios.patch(`/api/v6/order/${id}/status`, { [key]: value });
      toast.success(`${key === "status" ? "Order" : "Payment"} status updated`);
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="pb-12 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={() => navigate(`${basePath}/orders`)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Orders
        </button>
        {!loading && order && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-slate-900">
              #{order._id?.slice(-8).toUpperCase()}
            </span>
            <StatusBadge status={order.status} />
          </div>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-indigo-600" />
        </div>
      ) : !order ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center text-slate-500">
          Order not found.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-5">
            {/* Items */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100 bg-slate-50">
                <Package size={16} className="text-indigo-600" />
                <h2 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  Ordered Articles ({order.items?.length || 0})
                </h2>
              </div>
              <div className="divide-y divide-slate-100">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-5 items-center">
                    <div className="w-16 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200">
                      {item.product?.images?.[0]?.url && (
                        <img src={item.product.images[0].url} alt={item.product.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 mb-1">
                        {item.product?.title || "Luxury Couture Piece"}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono">
                        Qty: <span className="font-bold text-slate-800">{item.quantity}</span>
                        &nbsp;•&nbsp; PKR {item.priceAtPurchase?.toLocaleString()} each
                      </p>
                      <p className="font-bold font-mono text-sm text-indigo-700 mt-2">
                        PKR {(item.priceAtPurchase * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-4">
            {/* Summary */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100">
                Payment Summary
              </h3>
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-slate-500">Total Bill</span>
                <span className="text-lg font-bold font-mono text-slate-900">
                  PKR {order.totalAmount?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Payment Status</span>
                <StatusBadge status={order.paymentStatus} />
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Payment Method</span>
                <span className="font-bold font-mono uppercase text-slate-900">{order.paymentMethod || "COD"}</span>
              </div>
            </div>

            {/* Customer */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <User size={14} className="text-indigo-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Consignee Customer</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {order.user?.fullname?.[0] || "C"}
                </div>
                <div className="min-w-0 text-xs">
                  <p className="font-bold text-slate-900 truncate">{order.user?.fullname || "Customer"}</p>
                  <p className="text-slate-500 truncate">{order.user?.email}</p>
                  <p className="text-slate-500 font-mono mt-0.5">{order.user?.phone || "+92 300 1234567"}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <MapPin size={14} className="text-indigo-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Delivery Address</h3>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {order.shippingAddress?.street || "DHA Phase 6"}<br />
                {order.shippingAddress?.city || "Lahore"}, Pakistan<br />
                <span className="text-slate-400 font-mono">Postal Code: {order.shippingAddress?.zip || "54000"}</span>
              </p>
            </div>

            {/* Status controls */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Update Status</h3>
                {updating && <Loader2 size={13} className="animate-spin text-indigo-600" />}
              </div>
              <SelectDropdown
                label="Order Pipeline Status"
                value={order.status}
                options={ORDER_STATUSES}
                onChange={(v) => updateOrder("status", v)}
                disabled={updating}
              />
              <SelectDropdown
                label="Payment Gateway Status"
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