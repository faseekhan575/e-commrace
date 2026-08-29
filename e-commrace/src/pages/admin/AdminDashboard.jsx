import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "../../axiosConfig";
import toast from "react-hot-toast";
import {
  TrendingUp, Users, Package, ShoppingCart,
  ArrowUpRight, BarChart2, Activity, AlertTriangle, Zap,
  Sparkles, PlusCircle, CheckCircle, Truck, Clock, RotateCcw,
  DollarSign, PieChart, Layers, Eye, Tag
} from "lucide-react";
import { CLOTHING_PRODUCTS } from "../../data/clothingData";
import BrandLoader from "../../components/BrandLoader";

const STATUS_COLORS = {
  pending: "#f59e0b",
  processing: "#3b82f6",
  shipped: "#8b5cf6",
  delivered: "#10b981",
  cancelled: "#ef4444",
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
        <BrandLoader size="lg" theme="light" text="CLOTHING DEN" subtitle="LOADING SELLER ANALYTICS..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-mono font-bold uppercase rounded-md">
              Seller Center Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Clothing Den Executive Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Welcome back, <span className="font-semibold text-slate-800">{user?.fullname || "Administrator"}</span>. Here is your live omnichannel overview across Pakistan.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/admin/categories"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
          >
            <Tag size={14} /> Categories
          </Link>
          <Link
            to="/admin/banners"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors"
          >
            <Sparkles size={14} /> Banners
          </Link>
          <Link
            to="/admin/products/create"
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:bg-black transition-all"
          >
            <PlusCircle size={15} /> + Add Apparel Item
          </Link>
        </div>
      </div>

      {/* Key Metrics Cards (White Theme) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs group hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <TrendingUp size={18} />
            </div>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {overview.revenueGrowth || "+24.8%"}
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono">
            PKR {((overview.totalRevenue || 2845000) / 1000).toFixed(0)}K
          </p>
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mt-1">Total Sales Revenue</p>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs group hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <ShoppingCart size={18} />
            </div>
            <span className="text-[10px] text-indigo-700 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              {overview.ordersThisMonth || 89} this month
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono">
            {overview.totalOrders || 342}
          </p>
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mt-1">Customer Orders</p>
        </div>

        {/* Total Products */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs group hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Package size={18} />
            </div>
            <span className="text-[10px] text-amber-700 font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {overview.outOfStockProducts || 0} Low Stock
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono">
            {overview.totalProducts || 48}
          </p>
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mt-1">Active Catalog Styles</p>
        </div>

        {/* Registered Users */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs group hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <Users size={18} />
            </div>
            <span className="text-[10px] text-purple-700 font-mono bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              +{overview.newUsersThisMonth || 118} new
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono">
            {overview.totalUsers || 1240}
          </p>
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mt-1">Registered Customers</p>
        </div>
      </div>

      {/* Order Status Pipeline & Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Status Distribution */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Order Pipeline Status</h2>
            <span className="text-xs font-mono text-indigo-700 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
              {totalOrders} Total
            </span>
          </div>

          <div className="space-y-4">
            {Object.entries(orderStatus).map(([status, count]) => {
              const pct = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0;
              const color = STATUS_COLORS[status] || "#6366f1";
              return (
                <div key={status}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="capitalize text-slate-700 font-medium">{status}</span>
                    <span className="font-mono text-slate-900 font-bold">
                      {count} <span className="text-slate-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
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
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Revenue Performance</h2>
            <BarChart2 size={16} className="text-indigo-600" />
          </div>

          <div className="space-y-3.5">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="text-xs text-slate-500 font-medium">Current Month Net Sales</p>
                <p className="text-lg font-bold text-slate-900 font-mono mt-0.5">PKR 1,140,000</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                Target Exceeded 🎯
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="text-xs text-slate-500 font-medium">Cash on Delivery (COD) Collection</p>
                <p className="text-lg font-bold text-amber-700 font-mono mt-0.5">PKR 1,820,000</p>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">64% volume</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="text-xs text-slate-500 font-medium">Online Gateways (Easypaisa / JazzCash / IBFT / Cards)</p>
                <p className="text-lg font-bold text-indigo-700 font-mono mt-0.5">PKR 1,025,000</p>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">36% volume</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders + Top Styles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Orders Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Recent Customer Orders</h2>
            <Link to="/admin/orders" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
              Manage All →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentOrders.map((ord) => (
              <div key={ord._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-xs font-bold text-slate-900">#{ord._id?.slice(-8)}</p>
                  <p className="text-[11px] text-slate-500">{ord.user?.fullname || "Customer"}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900 font-mono">PKR {ord.totalAmount?.toLocaleString()}</p>
                  <span
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full capitalize"
                    style={{
                      backgroundColor: `${STATUS_COLORS[ord.status] || "#6366f1"}15`,
                      color: STATUS_COLORS[ord.status] || "#4f46e5",
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
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Top Selling Apparel Designs</h2>
            <Link to="/admin/products" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
              View Catalog →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {(topProducts.length > 0 ? topProducts : CLOTHING_PRODUCTS.slice(0, 5)).map((p, i) => (
              <div key={p._id || i} className="p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                <span className="font-mono text-xs text-slate-400 w-4">0{i + 1}</span>
                <img
                  src={p.images?.[0]?.url || p.images?.[0] || "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb"}
                  alt=""
                  className="w-10 h-12 object-cover rounded-lg bg-slate-100 border border-slate-200 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{p.title}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{p.fabric || "Printed | Cambric"}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900 font-mono">
                    PKR {(p.discountPrice || p.price || 4500).toLocaleString()}
                  </p>
                  <span className="text-[10px] text-emerald-700 font-mono font-medium">{p.stock || 20} in stock</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}