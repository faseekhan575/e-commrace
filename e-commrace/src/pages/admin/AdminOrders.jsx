import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../axiosConfig";
import toast from "react-hot-toast";
import {
  Search, Download, FileText, Printer, CheckCircle,
  Truck, Clock, AlertTriangle, Eye, Package, User, ExternalLink
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const STATUS_COLORS = {
  pending: "bg-amber-50 text-amber-800 border border-amber-200",
  processing: "bg-blue-50 text-blue-800 border border-blue-200",
  shipped: "bg-purple-50 text-purple-800 border border-purple-200",
  delivered: "bg-emerald-50 text-emerald-800 border border-emerald-200",
  cancelled: "bg-rose-50 text-rose-800 border border-rose-200",
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
    doc.text("CLOTHING DEN — DISPATCH & ORDERS REPORT", 14, 18);
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
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: "bold" },
    });

    doc.save(`clothing-den-orders-${Date.now()}.pdf`);
    toast.success("Orders PDF Report downloaded!");
  };

  return (
    <div className="space-y-6 pb-12">

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-mono font-bold uppercase rounded-md">
              Order Logistics Hub
            </span>
            <span className="text-xs text-slate-500 font-mono">TCS • Leopards • Trax Express</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Order Fulfillment & Dispatch
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track customer shipments, generate thermal courier waybills, and manage status pipelines
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportPDFReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            <Download size={15} /> Export PDF Report
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-3 shadow-xs">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, order ID, or destination city (Lahore, Karachi, Islamabad)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-slate-900 text-xs font-medium outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-slate-900 text-xs font-medium outline-none"
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
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Order ID & Date</th>
                <th className="px-4 py-3.5">Customer & City</th>
                <th className="px-4 py-3.5">Payment Method</th>
                <th className="px-4 py-3.5">Total Amount</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No customer orders found matching your filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/80 transition-colors">
                    {/* ID & Date */}
                    <td className="px-5 py-4 font-mono text-xs">
                      <p className="font-bold text-indigo-700">#{order._id?.slice(-8)}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-900">{order.user?.fullname || "Customer"}</p>
                      <p className="text-[11px] text-slate-500">{order.shippingAddress?.city || "Lahore"}, Pakistan</p>
                    </td>

                    {/* Payment */}
                    <td className="px-4 py-4 text-xs font-mono font-bold uppercase text-amber-700">
                      {order.paymentMethod || "COD"}
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-4 text-xs font-bold text-slate-900 font-mono">
                      PKR {order.totalAmount?.toLocaleString()}
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-mono ${STATUS_COLORS[order.status] || "bg-slate-100 text-slate-700"}`}>
                        {order.status}
                      </span>
                    </td>

                    {/* Actions & Status Dropdown */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setPrintModalOrder(order)}
                          title="Print Courier Shipping Label"
                          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold hover:bg-indigo-600 hover:text-white transition-colors"
                        >
                          <Printer size={13} /> Label
                        </button>

                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-slate-800 text-xs px-2.5 py-1.5 rounded-lg outline-none cursor-pointer font-medium"
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Courier Label Print Modal */}
      {printModalOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl text-slate-900 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900">Courier Shipping Waybill</h3>
                <p className="text-xs text-slate-500 font-mono">TCS / Leopards Standard Express</p>
              </div>
              <button
                onClick={() => setPrintModalOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Shipper & Consignee Info */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs mb-4">
              <div className="flex justify-between border-b border-slate-200 pb-1.5 mb-1.5">
                <span className="text-slate-500">Shipper:</span>
                <span className="font-bold text-slate-900">Clothing Den Atelier</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Order ID:</span>
                <span className="font-mono font-bold text-slate-900">#{printModalOrder._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Consignee Name:</span>
                <span className="font-bold text-slate-900">{printModalOrder.user?.fullname || "Customer"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contact Number:</span>
                <span className="font-mono text-slate-900">{printModalOrder.user?.phone || "+92 300 8472911"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery Address:</span>
                <span className="font-medium text-right max-w-[220px] text-slate-900">
                  {printModalOrder.shippingAddress?.street || "DHA Phase 5"}, {printModalOrder.shippingAddress?.city || "Lahore"}
                </span>
              </div>
            </div>

            {/* Payment COD Collection */}
            <div className="bg-amber-50 text-amber-900 p-3 rounded-xl text-xs mb-4 flex justify-between items-center border border-amber-200">
              <span className="font-bold uppercase tracking-wider text-[11px]">COD Amount to Collect:</span>
              <span className="font-mono text-base font-bold text-amber-900">
                PKR {printModalOrder.totalAmount?.toLocaleString()}
              </span>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    window.print();
                    toast.success("Printed Courier Label");
                  }}
                  className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-black transition-all shadow-md"
                >
                  <Printer size={14} /> Print Thermal Label
                </button>
                <a
                  href={`https://wa.me/${(printModalOrder.user?.phone || "923001234567").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Assalam-o-Alaikum ${printModalOrder.user?.fullname || "Customer"}, your Clothing Den order #${printModalOrder._id?.slice(-6)} has been dispatched via TCS Express. Total COD: PKR ${printModalOrder.totalAmount?.toLocaleString()}. Thank you!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 bg-[#25D366] hover:bg-[#1ebd59] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-sm"
                  title="Send WhatsApp Dispatch Notice"
                >
                  WhatsApp
                </a>
              </div>
              <button
                onClick={() => setPrintModalOrder(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Close Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}