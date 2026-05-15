import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../axiosConfig";
import toast from "react-hot-toast";
import { Clock, Truck, CheckCircle, XCircle, Search } from "lucide-react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("/api/v6/order/all");
      setOrders(res.data.data.orders || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`/api/v6/order/${orderId}/status`, { status: newStatus });
      toast.success("Order status updated");
      fetchOrders(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.user?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-500/10 text-yellow-500",
      processing: "bg-blue-500/10 text-blue-500",
      shipped: "bg-purple-500/10 text-purple-500",
      delivered: "bg-green-500/10 text-green-500",
      cancelled: "bg-red-500/10 text-red-500",
    };
    return styles[status] || "bg-gray-500/10 text-gray-400";
  };

  if (loading) {
    return <div className="p-6 text-white">Loading orders...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl font-700 text-white">Orders</h1>
          <p className="text-[#787878]">{filteredOrders.length} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-3xl p-6 mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#787878]" size={20} />
          <input
            type="text"
            placeholder="Search by customer or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111] border border-[#1e1e1e] pl-12 py-3.5 rounded-2xl text-white placeholder:text-[#525252] focus:border-[#e8b520]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#111] border border-[#1e1e1e] px-6 py-3.5 rounded-2xl text-white focus:border-[#e8b520]"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e1e1e]">
                <th className="px-6 py-5 text-left text-xs font-medium text-[#787878] uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-5 text-left text-xs font-medium text-[#787878] uppercase tracking-wider">Customer</th>
                <th className="px-6 py-5 text-left text-xs font-medium text-[#787878] uppercase tracking-wider">Amount</th>
                <th className="px-6 py-5 text-left text-xs font-medium text-[#787878] uppercase tracking-wider">Status</th>
                <th className="px-6 py-5 text-left text-xs font-medium text-[#787878] uppercase tracking-wider">Date</th>
                <th className="px-6 py-5 text-right text-xs font-medium text-[#787878] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e]">
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-[#111] transition-colors">
                  <td className="px-6 py-5 font-mono text-white">
                    #{order._id.slice(-8)}
                  </td>
                  <td className="px-6 py-5">
                    <div>
                      <p className="text-white font-medium">{order.user?.fullname}</p>
                      <p className="text-xs text-[#787878]">{order.user?.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-white font-semibold">₨ {order.totalAmount.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-white text-sm">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        to={`/admin/orders/${order._id}`}
                        className="px-5 py-2 text-sm border border-[#1e1e1e] hover:border-[#e8b520] text-white rounded-2xl transition-colors"
                      >
                        View
                      </Link>

                      {order.status !== "delivered" && order.status !== "cancelled" && (
                        <select
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className="bg-[#111] border border-[#1e1e1e] px-4 py-2 rounded-2xl text-sm text-white"
                        >
                          <option value="">Update Status</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-20 text-[#787878]">
            No orders found
          </div>
        )}
      </div>
    </div>
  );
}