import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../axiosConfig";
import toast from "react-hot-toast";
import { Search, Download, FileText } from "lucide-react";

// ── PDF helpers (jsPDF + jspdf-autotable) ──────────────────────────────────
// npm install jspdf jspdf-autotable
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BRAND = "VAULT";
const GOLD = [232, 181, 32];      // #e8b520
const DARK = [10, 10, 10];        // #0a0a0a
const GRAY = [30, 30, 30];        // #1e1e1e
const WHITE = [255, 255, 255];

// ── Shared PDF header / footer ─────────────────────────────────────────────
function addBrandedHeader(doc, title, subtitle) {
  const w = doc.internal.pageSize.getWidth();

  // Gold gradient bar (simulated with filled rect + lighter strip)
  doc.setFillColor(...GOLD);
  doc.rect(0, 0, w, 28, "F");
  doc.setFillColor(255, 210, 80);
  doc.rect(0, 24, w, 4, "F");

  // Brand name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...DARK);
  doc.text(BRAND, 14, 18);

  // Title (right-aligned)
  doc.setFontSize(11);
  doc.setTextColor(...DARK);
  doc.text(title, w - 14, 12, { align: "right" });
  doc.setFontSize(9);
  doc.text(subtitle, w - 14, 20, { align: "right" });

  return 36; // y cursor after header
}

function addBrandedFooter(doc) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  const pages = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFillColor(...GRAY);
    doc.rect(0, h - 12, w, 12, "F");
    doc.setFontSize(7);
    doc.setTextColor(...GOLD);
    doc.text(`${BRAND} — Confidential`, 14, h - 4);
    doc.setTextColor(120, 120, 120);
    doc.text(`Page ${i} of ${pages}`, w - 14, h - 4, { align: "right" });
  }
}

// ── Stat summary box ───────────────────────────────────────────────────────
function drawStatBoxes(doc, stats, y) {
  const w = doc.internal.pageSize.getWidth();
  const boxW = (w - 28 - 12) / 4;
  const labels = ["Total Orders", "Revenue", "Delivered", "Cancelled"];
  const values = stats;
  const colors = [GOLD, [72, 199, 142], [72, 199, 142], [255, 99, 99]];

  labels.forEach((label, i) => {
    const x = 14 + i * (boxW + 4);
    doc.setFillColor(...DARK);
    doc.roundedRect(x, y, boxW, 22, 3, 3, "F");
    doc.setDrawColor(...colors[i]);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, boxW, 22, 3, 3, "S");

    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(label, x + boxW / 2, y + 7, { align: "center" });

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors[i]);
    doc.text(String(values[i]), x + boxW / 2, y + 17, { align: "center" });
  });

  return y + 30;
}

// ── Bar chart (simple rects) ───────────────────────────────────────────────
function drawBarChart(doc, data, y) {
  const w = doc.internal.pageSize.getWidth();
  const chartW = w - 28;
  const chartH = 40;
  const barW = Math.min(18, chartW / data.length - 4);
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GOLD);
  doc.text("Orders by Status", 14, y);
  y += 4;

  // Axis
  doc.setDrawColor(...GRAY);
  doc.setLineWidth(0.3);
  doc.line(14, y + chartH, 14 + chartW, y + chartH);

  data.forEach((d, i) => {
    const barH = (d.value / maxVal) * chartH;
    const x = 14 + i * (chartW / data.length) + 4;
    const barY = y + chartH - barH;

    // Bar fill
    const pct = d.value / maxVal;
    doc.setFillColor(
      Math.round(GOLD[0] * pct + 40 * (1 - pct)),
      Math.round(GOLD[1] * pct + 40 * (1 - pct)),
      Math.round(GOLD[2] * pct + 40 * (1 - pct))
    );
    doc.rect(x, barY, barW, barH, "F");

    // Label
    doc.setFontSize(6);
    doc.setTextColor(120, 120, 120);
    doc.text(d.label, x + barW / 2, y + chartH + 5, { align: "center" });

    doc.setTextColor(...WHITE);
    if (barH > 6) doc.text(String(d.value), x + barW / 2, barY + 4, { align: "center" });
  });

  return y + chartH + 12;
}

// ── Generate FULL REPORT pdf ───────────────────────────────────────────────
function generateFullReportPDF(orders) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  let y = addBrandedHeader(doc, "Full Orders Report", now);

  // Stats
  const revenue = orders.reduce((s, o) => s + o.totalAmount, 0);
  const delivered = orders.filter((o) => o.status === "delivered").length;
  const cancelled = orders.filter((o) => o.status === "cancelled").length;
  const stats = [orders.length, `₨ ${revenue.toLocaleString()}`, delivered, cancelled];
  y = drawStatBoxes(doc, stats, y);

  // Chart data
  const statusGroups = ["pending", "processing", "shipped", "delivered", "cancelled"].map((s) => ({
    label: s.charAt(0).toUpperCase() + s.slice(1),
    value: orders.filter((o) => o.status === s).length,
  }));
  y = drawBarChart(doc, statusGroups, y);

  // Table
  autoTable(doc, {
    startY: y,
    head: [["Order ID", "Customer", "Email", "Amount (₨)", "Status", "Date"]],
    body: orders.map((o) => [
      `#${o._id.slice(-8)}`,
      o.user?.fullname || "—",
      o.user?.email || "—",
      o.totalAmount.toLocaleString(),
      o.status,
      new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    ]),
    styles: { fontSize: 8, textColor: WHITE, fillColor: DARK, cellPadding: 3 },
    headStyles: { fillColor: GOLD, textColor: DARK, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [15, 15, 15] },
    columnStyles: {
      3: { halign: "right" },
      4: { fontStyle: "bold" },
    },
    didDrawCell: (data) => {
      if (data.section === "body" && data.column.index === 4) {
        const status = data.cell.raw;
        const colors = {
          delivered: [72, 199, 142],
          cancelled: [255, 99, 99],
          pending: [232, 181, 32],
          processing: [99, 179, 237],
          shipped: [167, 139, 250],
        };
        if (colors[status]) {
          doc.setTextColor(...colors[status]);
          doc.setFont("helvetica", "bold");
          doc.text(status, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, { align: "center" });
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  addBrandedFooter(doc);
  doc.save(`vault-full-report-${Date.now()}.pdf`);
}

// ── Generate RECENT ORDERS pdf (last 10) ──────────────────────────────────
function generateRecentOrdersPDF(orders) {
  const recent = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  let y = addBrandedHeader(doc, "Recent Orders (Last 10)", now);

  autoTable(doc, {
    startY: y,
    head: [["Order ID", "Customer", "Amount (₨)", "Status", "Date"]],
    body: recent.map((o) => [
      `#${o._id.slice(-8)}`,
      o.user?.fullname || "—",
      o.totalAmount.toLocaleString(),
      o.status,
      new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    ]),
    styles: { fontSize: 9, textColor: WHITE, fillColor: DARK, cellPadding: 4 },
    headStyles: { fillColor: GOLD, textColor: DARK, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [15, 15, 15] },
    columnStyles: { 2: { halign: "right" } },
    margin: { left: 14, right: 14 },
  });

  addBrandedFooter(doc);
  doc.save(`vault-recent-orders-${Date.now()}.pdf`);
}

// ══════════════════════════════════════════════════════════════════════════
export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => { fetchOrders(); }, []);

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
      fetchOrders();
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

  if (loading) return <div className="p-6 text-white">Loading orders...</div>;

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl font-700 text-white">Orders</h1>
          <p className="text-[#787878]">{filteredOrders.length} total orders</p>
        </div>

        {/* ── Download Buttons ── */}
        <div className="flex gap-3">
          <button
            onClick={() => generateRecentOrdersPDF(orders)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#e8b520]/10 hover:bg-[#e8b520]/20 border border-[#e8b520]/40 text-[#e8b520] rounded-2xl text-sm font-medium transition-colors"
          >
            <FileText size={16} />
            Recent Orders PDF
          </button>
          <button
            onClick={() => generateFullReportPDF(orders)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#e8b520] hover:bg-[#e8b520]/90 text-black rounded-2xl text-sm font-bold transition-colors"
          >
            <Download size={16} />
            Full Report PDF
          </button>
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
                  <td className="px-6 py-5 font-mono text-white">#{order._id.slice(-8)}</td>
                  <td className="px-6 py-5">
                    <p className="text-white font-medium">{order.user?.fullname}</p>
                    <p className="text-xs text-[#787878]">{order.user?.email}</p>
                  </td>
                  <td className="px-6 py-5 text-white font-semibold">₨ {order.totalAmount.toLocaleString()}</td>
                  <td className="px-6 py-5">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-white text-sm">
                    {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
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
          <div className="text-center py-20 text-[#787878]">No orders found</div>
        )}
      </div>
    </div>
  );
}