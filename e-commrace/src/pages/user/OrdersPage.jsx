import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "../../axiosConfig";
import { Package, Clock, Truck, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("/api/v6/order/my");
      setOrders(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "text-yellow-600 bg-yellow-100";
      case "processing": return "text-blue-600 bg-blue-100";
      case "shipped": return "text-purple-600 bg-purple-100";
      case "delivered": return "text-green-600 bg-green-100";
      case "cancelled": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="font-display text-4xl font-700 mb-10">My Orders</h1>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-[#e8e8e0] rounded-2xl p-6 animate-pulse">
              <div className="h-6 bg-[#f0f0e8] rounded w-1/3 mb-4" />
              <div className="h-4 bg-[#f0f0e8] rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl font-700 text-[#1a1a14] mb-10">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#e8e8e0] rounded-3xl">
          <Package size={60} className="mx-auto text-[#d4d4c8] mb-6" />
          <h3 className="text-2xl font-medium text-[#1a1a14] mb-2">No orders yet</h3>
          <p className="text-[#78786a]">When you place an order, it will appear here.</p>
          <Link
            to="/products"
            className="inline-block mt-6 px-8 py-3 bg-[#1a1a14] text-white rounded-full hover:bg-[#3c3c30]"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white border border-[#e8e8e0] rounded-2xl p-6 hover:shadow-sm transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs text-[#78786a] uppercase tracking-wider">Order ID</p>
                  <p className="font-mono text-sm font-medium text-[#1a1a14]">#{order._id.slice(-8)}</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <p className="text-sm text-[#78786a]">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#f5f5f0] flex-shrink-0">
                      {item.product?.images?.[0]?.url && (
                        <img
                          src={item.product.images[0].url}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#1a1a14] line-clamp-1">{item.product?.title}</p>
                      <p className="text-sm text-[#78786a]">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-right">₨ {(item.priceAtPurchase * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#e8e8e0] mt-6 pt-6 flex justify-between items-center">
                <div>
                  <p className="text-xs text-[#78786a]">Total Amount</p>
                  <p className="text-xl font-semibold text-[#1a1a14]">₨ {order.totalAmount.toLocaleString()}</p>
                </div>

                <Link
                  to={`/admin/orders/${order._id}`} // or create user order detail later
                  className="text-sm font-medium text-[#1a1a14] hover:underline flex items-center gap-1"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}