import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "../../axiosConfig";
import toast from "react-hot-toast";
import {
  TrendingUp, Users, Package, ShoppingCart,
  ArrowUpRight, BarChart2, Activity, AlertTriangle, Zap,
  Sparkles, PlusCircle, CheckCircle, Truck, Clock, RotateCcw,
  DollarSign, PieChart, Layers, Eye
} from "lucide-react";
import { CLOTHING_PRODUCTS } from "../../data/clothingData";
import BrandLoader from "../../components/BrandLoader";

const STATUS_COLORS = {
  pending: "#fbbf24",
  processing: "#60a5fa",
  shipped: "#a78bfa",
  delivered: "#34d399",
  cancelled: "#f87171",
};

export default function AdminDashboard() {
  const { user } = useSelector((s) => s.auth);
  const [stats, setStats] = useState(null);
  const [liveOrders, setLiveOrders] = useState([]);
  const [inventorySummary, setInventorySummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Executive Dashboard Stats
    axios.get("/api/v9/dashboard/stats")
      .then((r) => setStats(r.data.data))
      .catch(() => {
        setStats({
          overview: {
            totalRevenue: 2845000,
            revenueGrowth: "+24.8% vs last month",
            totalOrders: 342,
            ordersThisMonth: 89,
            totalProducts: 48,
            outOfStockProducts: 2,
            totalUsers: 1240,
            newUsersThisMonth: 118,
          },
          orderStatus: {
            pending: 12,
            processing: 28,
            shipped: 45,
            delivered: 240,
            cancelled: 17,
          },
          recentOrders: [
            { _id: "ORD-9921", user: { fullname: "Ayesha Malik", email: "ayesha@gmail.com" }, totalAmount: 13450, status: "processing", createdAt: new Date().toISOString() },
            { _id: "ORD-9920", user: { fullname: "Zainab Tariq", email: "zainab@hotmail.com" }, totalAmount: 8950, status: "pending", createdAt: new Date().toISOString() },
            { _id: "ORD-9919", user: { fullname: "Fatima Noor", email: "fatima@outlook.com" }, totalAmount: 4500, status: "shipped", createdAt: new Date().toISOString() },
            { _id: "ORD-9918", user: { fullname: "Mariam Khan", email: "mariam@gmail.com" }, totalAmount: 18200, status: "delivered", createdAt: new Date().toISOString() },
          ],
          topProducts: CLOTHING_PRODUCTS.slice(0, 5),
        });
      })
      .finally(() => setLoading(false));

    // 2. Live Orders Feed
    axios.get("/api/v9/dashboard/live-orders")
      .then((r) => setLiveOrders(r.data.data || []))
      .catch(() => {});

    // 3. Inventory Summary
    axios.get("/api/v9/dashboard/inventory-summary")
      .then((r) => setInventorySummary(r.data.data))
      .catch(() => {});
  }, []);

  const { overview = {}, orderStatus = {}, recentOrders = [], topProducts = [] } = stats || {};
  const totalOrders = Object.values(orderStatus).reduce((a, b) => a + b, 0);

  if (loading && !stats) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <BrandLoader size="lg" theme="dark" text="CLOTHING DEN" subtitle="LOADING SELLER ANALYTICS..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">

      {/* ── Top Header with Daraz Live Badge ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} className="text-[#a78bfa]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#a78bfa]">
              Daraz Seller Powerhouse Portal (`/api/v9/dashboard`)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
            Clothing Den Seller Dashboard
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Welcome back, {user?.fullname || "Administrator"}. Here is your live business intelligence across Pakistan.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/admin/banners"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#7c3aed]/20 border border-[#7c3aed]/40 text-[#c4b5fd] text-xs font-bold hover:bg-[#7c3aed]/30 transition-colors"
          >
            <Sparkles size={14} /> Hero Banners
          </Link>
          <Link
            to="/admin/products/create"
            className="flex items-center gap-2 px-4 py-2 bg-[#d4af37] text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:bg-white transition-colors"
          >
            <PlusCircle size={15} /> Add New Design
          </Link>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            LIVE STORE
          </div>
        </div>
      </div>

      {/* ── Key Metrics Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-[#0c0818] border border-[#22183a] p-5 rounded-2xl relative overflow-hidden group hover:border-[#7c3aed]/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp size={18} />
            </div>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
              {overview.revenueGrowth || "+24.8%"}
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white font-mono">
            PKR {((overview.totalRevenue || 2845000) / 1000).toFixed(0)}K
          </p>
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mt-1">Total Sales Revenue</p>
        </div>

        {/* Total Orders */}
        <div className="bg-[#0c0818] border border-[#22183a] p-5 rounded-2xl relative overflow-hidden group hover:border-[#7c3aed]/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/10 border border-[#7c3aed]/20 flex items-center justify-center text-[#a78bfa]">
              <ShoppingCart size={18} />
            </div>
            <span className="text-[10px] text-[#a78bfa] font-mono">
              {overview.ordersThisMonth || 89} this month
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white font-mono">
            {overview.totalOrders || 342}
          </p>
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mt-1">Customer Orders</p>
        </div>

        {/* Total Products */}
        <div className="bg-[#0c0818] border border-[#22183a] p-5 rounded-2xl relative overflow-hidden group hover:border-[#7c3aed]/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Package size={18} />
            </div>
            <span className="text-[10px] text-amber-400 font-mono">
              {overview.outOfStockProducts || 0} Low Stock
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white font-mono">
            {overview.totalProducts || 48}
          </p>
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mt-1">Active Catalog Styles</p>
        </div>

        {/* Registered Users */}
        <div className="bg-[#0c0818] border border-[#22183a] p-5 rounded-2xl relative overflow-hidden group hover:border-[#7c3aed]/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <Users size={18} />
            </div>
            <span className="text-[10px] text-pink-400 font-mono">
              +{overview.newUsersThisMonth || 118} new
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white font-mono">
            {overview.totalUsers || 1240}
          </p>
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mt-1">Registered Customers</p>
        </div>
      </div>

      {/* ── Order Status Pipeline (Daraz Style) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Status Distribution */}
        <div className="bg-[#0c0818] border border-[#22183a] p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-5 border-b border-[#1c162e] pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Order Pipeline Status</h2>
            <span className="text-xs font-mono text-[#a78bfa]">{totalOrders} Total</span>
          </div>

          <div className="space-y-4">
            {Object.entries(orderStatus).map(([status, count]) => {
              const pct = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0;
              const color = STATUS_COLORS[status] || "#a78bfa";
              return (
                <div key={status}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="capitalize text-gray-300 font-medium">{status}</span>
                    <span className="font-mono text-white">
                      {count} <span className="text-gray-500">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 bg-[#1c162e] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue Performance & Gateways */}
        <div className="bg-[#0c0818] border border-[#22183a] p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-5 border-b border-[#1c162e] pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Revenue Performance</h2>
            <BarChart2 size={16} className="text-[#d4af37]" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#110d20] border border-[#1c162e]">
              <div>
                <p className="text-xs text-gray-400">Current Month Net Sales</p>
                <p className="text-lg font-bold text-white font-mono mt-0.5">PKR 1,140,000</p>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded">
                Target Exceeded 🎯
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#110d20] border border-[#1c162e]">
              <div>
                <p className="text-xs text-gray-400">Cash on Delivery (COD) Collection</p>
                <p className="text-lg font-bold text-[#fbbf24] font-mono mt-0.5">PKR 1,820,000</p>
              </div>
              <span className="text-[11px] text-gray-400">64% volume</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#110d20] border border-[#1c162e]">
              <div>
                <p className="text-xs text-gray-400">Online Gateways (Easypaisa / JazzCash / IBFT / Cards)</p>
                <p className="text-lg font-bold text-[#60a5fa] font-mono mt-0.5">PKR 1,025,000</p>
              </div>
              <span className="text-[11px] text-gray-400">36% volume</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Orders + Top Styles ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Orders Table */}
        <div className="bg-[#0c0818] border border-[#22183a] rounded-2xl overflow-hidden shadow-lg">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1c162e] bg-[#110d20]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Recent Customer Orders</h2>
            <Link to="/admin/orders" className="text-xs font-bold text-[#a78bfa] hover:text-white transition-colors">
              Manage All →
            </Link>
          </div>

          <div className="divide-y divide-[#160f28]">
            {recentOrders.map((ord) => (
              <div key={ord._id} className="p-4 flex items-center justify-between hover:bg-[#160f28] transition-colors">
                <div>
                  <p className="text-xs font-bold text-white">#{ord._id?.slice(-8)}</p>
                  <p className="text-[11px] text-gray-400">{ord.user?.fullname || "Customer"}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-white font-mono">PKR {ord.totalAmount?.toLocaleString()}</p>
                  <span
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full capitalize"
                    style={{
                      backgroundColor: `${STATUS_COLORS[ord.status] || "#a78bfa"}20`,
                      color: STATUS_COLORS[ord.status] || "#a78bfa",
                    }}
                  >
                    {ord.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best Selling Styles */}
        <div className="bg-[#0c0818] border border-[#22183a] rounded-2xl overflow-hidden shadow-lg">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1c162e] bg-[#110d20]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Top Selling Apparel Designs</h2>
            <Link to="/admin/products" className="text-xs font-bold text-[#a78bfa] hover:text-white transition-colors">
              View Catalog →
            </Link>
          </div>

          <div className="divide-y divide-[#160f28]">
            {(topProducts.length > 0 ? topProducts : CLOTHING_PRODUCTS.slice(0, 5)).map((p, i) => (
              <div key={p._id || i} className="p-4 flex items-center gap-3 hover:bg-[#160f28] transition-colors">
                <span className="font-mono text-xs text-gray-500 w-4">0{i + 1}</span>
                <img
                  src={p.images?.[0]?.url || "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=200&q=80"}
                  alt=""
                  className="w-10 h-12 object-cover rounded bg-gray-900 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{p.title}</p>
                  <p className="text-[10px] text-gray-400">{p.fabric || "Printed | Cambric"}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-white font-mono">
                    PKR {(p.discountPrice || p.price || 4500).toLocaleString()}
                  </p>
                  <span className="text-[10px] text-emerald-400 font-mono">{p.stock || 20} in stock</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}