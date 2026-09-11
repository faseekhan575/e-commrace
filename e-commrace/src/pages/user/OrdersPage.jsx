import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "../../axiosConfig";
import {
  Package, Clock, Truck, CheckCircle2, XCircle,
  AlertCircle, ArrowRight, ExternalLink, MapPin,
  FileText, ShieldCheck, ChevronRight
} from "lucide-react";
import { optimizeImage } from "../../utils/imageOptimizer";
import BrandLoader from "../../components/BrandLoader";
import toast from "react-hot-toast";
import { safeTrackingUrl } from "../../utils/commerce";

export default function OrdersPage() {
  const { orderId: selectedOrderId } = useParams();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setError("");
      const res = await axios.get(selectedOrderId ? `/api/v6/order/${selectedOrderId}` : "/api/v6/order/my");
      const data = res.data?.data;
      setOrders(selectedOrderId ? [data?.order || data].filter(Boolean) : Array.isArray(data) ? data : data?.orders || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchOrders();
    const refresh = () => fetchOrders();
    window.addEventListener("commerce:order_status_updated", refresh);
    window.addEventListener("commerce:reconnected", refresh);
    return () => { window.removeEventListener("commerce:order_status_updated", refresh); window.removeEventListener("commerce:reconnected", refresh); };
  }, [selectedOrderId]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you wish to cancel this pending order? Product stock will be returned to inventory.")) {
      return;
    }

    setCancellingId(orderId);
    try {
      await axios.patch(`/api/v6/order/${orderId}/cancel`);
      toast.success("Order cancelled successfully");
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return {
          bg: "bg-amber-50 text-amber-800 border-amber-200",
          icon: <Clock size={12} />,
          text: "Order Received (Pending)",
        };
      case "processing":
        return {
          bg: "bg-blue-50 text-blue-800 border-blue-200",
          icon: <Package size={12} />,
          text: "In Tailoring & Packaging",
        };
      case "shipped":
        return {
          bg: "bg-purple-50 text-purple-800 border-purple-200",
          icon: <Truck size={12} />,
          text: "Dispatched",
        };
      case "delivered":
        return {
          bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
          icon: <CheckCircle2 size={12} />,
          text: "Delivered",
        };
      case "cancelled":
        return {
          bg: "bg-rose-50 text-rose-800 border-rose-200",
          icon: <XCircle size={12} />,
          text: "Cancelled",
        };
      default:
        return {
          bg: "bg-gray-50 text-gray-800 border-gray-200",
          icon: <Clock size={12} />,
          text: status,
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#fafaf8]">
        <BrandLoader size="lg" text="CLOTHING DEN" subtitle="LOADING ORDER HISTORY..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#78786a] mb-6">
          <Link to="/" className="hover:text-black">Home</Link>
          <span>/</span>
          <span className="text-[#141410] font-semibold">Order History & Tracking</span>
        </div>

        {/* Page Title */}
        <div className="border-b border-[#e8e8e0] pb-6 mb-8 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#141410]">
              My Orders & Parcels
            </h1>
            <p className="text-xs text-[#78786a] font-mono mt-1">
              Track live courier dispatches across TCS Express, Leopard, and Trax
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold uppercase tracking-wider text-[#141410] hover:underline"
          >
            Explore New Drops →
          </Link>
        </div>

        {error && <div role="alert" className="mb-6 border border-red-200 bg-red-50 p-5 text-sm text-red-800">{error}<button onClick={fetchOrders} className="ml-4 underline">Retry</button></div>}
        {orders.length === 0 && !error ? (
          <div className="bg-white border border-[#e8e8e0] rounded-sm p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
              <Package size={28} />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#141410] mb-2">
              No Orders Found
            </h3>
            <p className="text-xs sm:text-sm text-[#78786a] max-w-sm mb-6 leading-relaxed">
              You haven&apos;t placed any couture orders yet. Discover our signature ready-to-wear kurtas and unstitched lawn collections.
            </p>
            <Link
              to="/products"
              className="px-8 py-3.5 bg-[#141410] text-white hover:bg-black rounded-sm text-xs font-bold uppercase tracking-[0.2em] shadow-md transition-all flex items-center gap-2"
            >
              <span>Explore Boutique</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusBadge = getStatusBadge(order.status || "pending");
              const orderId = order._id || "SAP-ORD";
              const dateStr = order.createdAt
                ? new Date(order.createdAt).toLocaleDateString("en-PK", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "Recent";

              return (
                <div
                  key={orderId}
                  className="bg-white border border-[#e8e8e0] rounded-sm p-5 sm:p-6 shadow-xs space-y-5 hover:border-black/30 transition-all"
                >
                  {/* Order Top Meta */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#f0f0ea] gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#141410] text-white flex items-center justify-center font-mono text-xs font-bold">
                        📦
                      </div>
                      <div>
                        <p className="font-mono text-xs font-bold text-[#141410]">
                          Order #{orderId.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-[11px] text-gray-400 font-mono">
                          Placed on {dateStr}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge.bg}`}>
                        {statusBadge.icon}
                        <span>{statusBadge.text}</span>
                      </span>

                      <span className="text-xs font-bold font-mono text-black px-2.5 py-1 bg-[#f4f4ee] rounded">
                        PKR {order.totalAmount?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Tracking & Courier Info (if dispatched) */}
                  <div className="p-3 bg-[#fafaf8] rounded text-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-gray-400 block">Courier Partner</span>
                      <strong className="text-black font-semibold">{order.courier || "Not assigned yet"}</strong>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-mono text-gray-400 block">Tracking Number</span>
                      <span className="font-mono font-bold text-[#141410]">
                        {order.trackingNumber || "Pending Courier Scan"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-mono text-gray-400 block">Destination City</span>
                      <span className="text-gray-700 font-medium">
                        {order.shippingAddress?.city || "Pakistan"}, {order.shippingAddress?.street || ""}
                      </span>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="space-y-3 divide-y divide-gray-100">
                    {order.items?.map((item, idx) => {
                      const p = item.product || {};
                      const img = p.images?.[0]?.url || p.images?.[0] || "";
                      const price = item.priceAtPurchase ?? p.discountPrice ?? p.price ?? 0;

                      return (
                        <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 aspect-[3/4] bg-gray-100 rounded-xs overflow-hidden flex-shrink-0">
                              <img
                                src={optimizeImage(img, { width: 120 })}
                                alt=""
                                className="w-full h-full object-cover object-top"
                              />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#141410] truncate max-w-sm">
                                {p.title || "Tailored Garment"}
                              </p>
                              <p className="text-[11px] text-gray-500 font-mono">
                                Size: <strong className="text-black">{item.size || "M"}</strong> • Quantity: {item.quantity}
                              </p>
                            </div>
                          </div>

                          <span className="text-xs font-bold font-mono text-[#141410]">
                            PKR {(price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {order.timeline?.length > 0 && <ol className="border-l border-stone-200 ml-2 pl-5 space-y-4 py-3">{order.timeline.map((entry, index) => <li key={entry._id || index} className="text-xs"><strong className="capitalize">{entry.status}</strong><p className="mt-1 text-stone-500">{entry.note}</p><time className="text-[10px] text-stone-400">{entry.timestamp ? new Date(entry.timestamp).toLocaleString() : ""}</time></li>)}</ol>}
                  <div className="flex flex-wrap gap-4 text-xs"><Link className="underline" to={selectedOrderId ? "/orders" : `/orders/${orderId}`}>{selectedOrderId ? "All orders" : "Order details"}</Link>{safeTrackingUrl(order.trackingUrl) && <a className="inline-flex items-center gap-1 text-green-700 underline" target="_blank" rel="noopener noreferrer" href={safeTrackingUrl(order.trackingUrl)}>Track with courier <ExternalLink size={12} /></a>}</div>
                  {/* Order Footer Actions */}
                  <div className="pt-3 border-t border-[#f0f0ea] flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-mono">
                      Payment: <strong className="uppercase text-black">{order.paymentMethod || "COD"}</strong> • Status: <strong className="capitalize text-black">{order.paymentStatus || "unpaid"}</strong>
                    </span>

                    {order.status === "pending" && (
                      <button
                        onClick={() => handleCancelOrder(orderId)}
                        disabled={cancellingId === orderId}
                        className="text-rose-600 hover:text-rose-800 font-bold underline transition-colors"
                      >
                        {cancellingId === orderId ? "Cancelling..." : "Cancel Order"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}