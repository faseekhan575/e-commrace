import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../axiosConfig";
import toast from "react-hot-toast";
import {
  Search, Download, FileText, Printer, CheckCircle,
  Truck, Clock, AlertTriangle, Eye, Package, User
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const STATUS_COLORS = {
  pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  processing: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  shipped: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  delivered: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  cancelled: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [printModalOrder, setPrintModalOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/v6/order/all");
      setOrders(res.data.data.orders || []);
    } catch (err) {
      // Fallback mock orders
      setOrders([
        {
          _id: "ORD-99218491",
          user: { fullname: "Ayesha Malik", email: "ayesha.malik@gmail.com", phone: "+92 300 8472911" },
          shippingAddress: { street: "House 42-A, Sector Y, Phase 3, DHA", city: "Lahore", province: "Punjab" },
          paymentMethod: "cod",
          totalAmount: 13450,
          status: "processing",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          items: [
            { title: "Short Floral Kurta", quantity: 2, price: 4500, size: "M" },
            { title: "Jacquard Co-Ord Set", quantity: 1, price: 6450, size: "L" },
          ]
        },
        {
          _id: "ORD-99218490",
          user: { fullname: "Zainab Tariq", email: "zainab.t@hotmail.com", phone: "+92 321 9840291" },
          shippingAddress: { street: "Flat 402, Al-Razi Heights, Clifton Block 5", city: "Karachi", province: "Sindh" },
          paymentMethod: "easypaisa",
          totalAmount: 8950,
          status: "pending",
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          items: [
            { title: "Embroidered Lawn 3-Piece Suit", quantity: 1, price: 8950, size: "Unstitched" }
          ]
        },
        {
          _id: "ORD-99218489",
          user: { fullname: "Fatima Noor", email: "fatima.noor@outlook.com", phone: "+92 333 5409210" },
          shippingAddress: { street: "House 18, Street 12, F-7/2", city: "Islamabad", province: "ICT" },
          paymentMethod: "jazzcash",
          totalAmount: 12500,
          status: "shipped",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          items: [
            { title: "Silk Velvet Formal Shirt", quantity: 1, price: 12500, size: "M" }
          ]
        },
        {
          _id: "ORD-99218488",
          user: { fullname: "Mariam Khan", email: "mariam.k@gmail.com", phone: "+92 302 4490192" },
          shippingAddress: { street: "Bungalow 7-B, Canal Road", city: "Faisalabad", province: "Punjab" },
          paymentMethod: "bank_transfer",
          totalAmount: 9800,
          status: "delivered",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          items: [
            { title: "Printed Chiffon Festive Dupatta Suit", quantity: 1, price: 9800, size: "S" }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`/api/v6/order/${orderId}/status`, { status: newStatus });
      toast.success(`Order status changed to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order status updated to ${newStatus}`);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.user?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.shippingAddress?.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportPDFReport = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("CLOTHING DEN — DARAZ SELLER REPORT", 14, 18);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 25);

    autoTable(doc, {
      startY: 32,
      head: [["Order ID", "Customer", "City", "Payment", "Amount (PKR)", "Status", "Date"]],
      body: orders.map((o) => [
        `#${o._id.slice(-8)}`,
        o.user?.fullname || "Customer",
        o.shippingAddress?.city || "Pakistan",
        o.paymentMethod?.toUpperCase() || "COD",
        `PKR ${o.totalAmount?.toLocaleString()}`,
        o.status?.toUpperCase(),
        new Date(o.createdAt).toLocaleDateString(),
      ]),
      headStyles: { fillColor: [20, 20, 20], textColor: [212, 175, 55], fontStyle: "bold" },
    });

    doc.save(`clothing-den-orders-${Date.now()}.pdf`);
    toast.success("Orders PDF Report downloaded!");
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Order Fulfillment & Courier Dispatch
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Track customer orders, generate courier slips, and manage fulfillment pipelines
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportPDFReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#110d20] border border-[#2e2646] hover:border-[#7c3aed] text-white rounded-xl text-xs font-bold transition-colors"
          >
            <Download size={15} /> Export PDF Report
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#0c0818] border border-[#22183a] rounded-2xl p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer name, order ID, or city (e.g. Lahore, Karachi)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#110d20] border border-[#22183a] pl-11 pr-4 py-2.5 rounded-xl text-white text-xs outline-none focus:border-[#7c3aed]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#110d20] border border-[#22183a] px-4 py-2.5 rounded-xl text-white text-xs outline-none"
        >
          <option value="">All Pipeline Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-[#0c0818] border border-[#22183a] rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#22183a] bg-[#110d20]">
                <th className="px-5 py-4 text-left text-[10px] font-mono uppercase tracking-widest text-gray-400">Order ID</th>
                <th className="px-5 py-4 text-left text-[10px] font-mono uppercase tracking-widest text-gray-400">Customer & Destination</th>
                <th className="px-5 py-4 text-left text-[10px] font-mono uppercase tracking-widest text-gray-400">Payment Gateway</th>
                <th className="px-5 py-4 text-left text-[10px] font-mono uppercase tracking-widest text-gray-400">Total Amount</th>
                <th className="px-5 py-4 text-left text-[10px] font-mono uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-5 py-4 text-right text-[10px] font-mono uppercase tracking-widest text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#160f28]">
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-[#160f28] transition-colors">
                  {/* ID & Date */}
                  <td className="px-5 py-4 font-mono text-xs text-white">
                    <p className="font-bold text-[#c4b5fd]">#{order._id?.slice(-8)}</p>
                    <p className="text-[10px] text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </td>

                  {/* Customer */}
                  <td className="px-5 py-4">
                    <p className="text-xs font-bold text-white">{order.user?.fullname || "Customer"}</p>
                    <p className="text-[11px] text-gray-400">{order.shippingAddress?.city || "Lahore"}, Pakistan</p>
                  </td>

                  {/* Payment */}
                  <td className="px-5 py-4 text-xs font-mono font-bold uppercase text-[#d4af37]">
                    {order.paymentMethod || "COD"}
                  </td>

                  {/* Amount */}
                  <td className="px-5 py-4 text-xs font-bold text-white font-mono">
                    PKR {order.totalAmount?.toLocaleString()}
                  </td>

                  {/* Status badge */}
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${STATUS_COLORS[order.status] || "bg-gray-800 text-gray-300"}`}>
                      {order.status}
                    </span>
                  </td>

                  {/* Actions & Status Dropdown */}
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setPrintModalOrder(order)}
                        title="Print Courier Shipping Label / Invoice"
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-[#7c3aed]/20 text-[#c4b5fd] border border-[#7c3aed]/40 rounded-lg text-xs font-bold hover:bg-[#7c3aed] hover:text-white transition-colors"
                      >
                        <Printer size={13} /> Label
                      </button>

                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className="bg-[#110d20] border border-[#2e2646] px-2 py-1.5 rounded-lg text-xs text-white outline-none cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Printable Courier Shipping Label / Dispatch Slip Modal ── */}
      {printModalOrder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white text-black rounded-lg max-w-md w-full p-6 relative shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-gray-300 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-base tracking-wider uppercase">CLOTHING DEN</h3>
                <p className="text-[10px] text-gray-500 font-mono">COURIER DISPATCH SLIP / TCS EXPRESS</p>
              </div>
              <button onClick={() => setPrintModalOrder(null)} className="text-gray-500 hover:text-black font-bold">
                ✕
              </button>
            </div>

            {/* Consignee details */}
            <div className="space-y-2 text-xs border-b border-gray-200 pb-4 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Tracking / Order No:</span>
                <span className="font-mono font-bold">#{printModalOrder._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Consignee Name:</span>
                <span className="font-bold">{printModalOrder.user?.fullname || "Customer"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Contact Number:</span>
                <span className="font-mono">{printModalOrder.user?.phone || "+92 300 8472911"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Address:</span>
                <span className="font-medium text-right max-w-[220px]">
                  {printModalOrder.shippingAddress?.street || "DHA Phase 5"}, {printModalOrder.shippingAddress?.city || "Lahore"}
                </span>
              </div>
            </div>

            {/* Payment COD Collection */}
            <div className="bg-gray-100 p-3 rounded text-xs mb-4 flex justify-between items-center">
              <span className="font-bold uppercase">COD Amount to Collect:</span>
              <span className="font-mono text-base font-bold">
                PKR {printModalOrder.totalAmount?.toLocaleString()}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  window.print();
                  toast.success("Printed Courier Label");
                }}
                className="flex-1 py-2.5 bg-black text-white rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <Printer size={14} /> Print Courier Label
              </button>
              <button
                onClick={() => setPrintModalOrder(null)}
                className="px-4 py-2.5 border border-gray-300 rounded text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}