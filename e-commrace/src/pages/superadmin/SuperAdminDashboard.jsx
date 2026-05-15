import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "../../axiosConfig";
import toast from "react-hot-toast";
import {
  Users, Shield, Package, TrendingUp, Crown, ShoppingCart,
  ArrowUpRight, AlertTriangle, BarChart2, Activity
} from "lucide-react";

const gold = "#f9c938";

const STATUS_COLORS = {
  pending: "#f59e0b", processing: "#3b82f6",
  shipped: "#8b5cf6", delivered: "#10b981", cancelled: "#ef4444",
};

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="relative bg-[#080808] border border-[#1a1a1a] rounded-2xl p-4 sm:p-5 hover:border-[#f9c938]/30 transition-all duration-300 group overflow-hidden">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at top right, ${color}06, transparent 70%)` }} />
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}15`, border: `1px solid ${color}25` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <ArrowUpRight size={13} className="text-[#333] group-hover:text-[#f9c938] transition-colors mt-1" />
      </div>
      <p className="text-xl sm:text-2xl font-bold text-white mb-0.5 leading-tight">{value}</p>
      <p className="text-[10px] text-[#525252] uppercase tracking-widest">{label}</p>
      {sub && <p className="text-[10px] mt-1.5" style={{ color }}>{sub}</p>}
    </div>
  );
}

function OrderStatusBar({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-[#787878] capitalize">{label}</span>
        <span className="text-xs font-mono text-white">{value} <span className="text-[#333]">({pct}%)</span></span>
      </div>
      <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function SuperAdminDashboard() {
  const { user } = useSelector((s) => s.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/v9/dashboard/stats")
      .then((r) => setStats(r.data.data))
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: gold }} />
          <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: gold }}>Loading</p>
        </div>
      </div>
    );
  }

  const { overview, orderStatus, recentOrders, topProducts } = stats;
  const totalOrders = Object.values(orderStatus || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="pb-6 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Crown size={13} style={{ color: gold }} />
            <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: gold }}>Super Admin</span>
          </div>
          <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-700 text-white leading-tight">
            Welcome, {user?.fullname?.split(" ")[0]}
          </h1>
          <p className="text-xs text-[#525252] mt-0.5">Full system control</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border flex-shrink-0"
          style={{ borderColor: `${gold}30`, backgroundColor: `${gold}08` }}>
          <Activity size={11} style={{ color: gold }} />
          <span className="text-[10px] font-mono" style={{ color: gold }}>LIVE</span>
        </div>
      </div>

      {/* Stat Cards — 2 col mobile, 4 col desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <StatCard label="Total Users" value={overview.totalUsers || 0} icon={Users} color="#38bdf8"
          sub={`+${overview.newUsersThisMonth || 0} this month`} />
        <StatCard label="Total Orders" value={overview.totalOrders || 0} icon={ShoppingCart} color="#a78bfa"
          sub={`${overview.ordersThisMonth || 0} this month`} />
        <StatCard label="Products" value={overview.totalProducts || 0} icon={Package} color={gold}
          sub={`${overview.outOfStockProducts || 0} out of stock`} />
        <StatCard
          label="Revenue"
          value={`₨${((overview.totalRevenue || 0) / 1000).toFixed(0)}K`}
          icon={TrendingUp} color="#10b981"
          sub={overview.revenueGrowth || null}
        />
      </div>

      {/* Quick Actions — 2x2 grid mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {[
          { to: "/superadmin/users", icon: Users, label: "Users", sub: `${overview.totalUsers || 0} total` },
          { to: "/superadmin/admins", icon: Shield, label: "Admins", sub: "Manage access" },
          { to: "/superadmin/products", icon: Package, label: "Products", sub: `${overview.totalProducts || 0} listed` },
          { to: "/superadmin/orders", icon: ShoppingCart, label: "Orders", sub: `${overview.ordersThisMonth || 0} this month` },
        ].map(({ to, icon: Icon, label, sub }) => (
          <Link key={to} to={to}
            className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-3 sm:p-4 hover:border-[#f9c938]/40 transition-all group">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5"
              style={{ backgroundColor: `${gold}10`, border: `1px solid ${gold}20` }}>
              <Icon size={14} style={{ color: gold }} />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#f9c938] transition-colors leading-tight">{label}</p>
            <p className="text-[10px] text-[#525252] mt-0.5">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Revenue + Order Status — stack on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white text-sm">Revenue</h2>
            <BarChart2 size={14} style={{ color: gold }} />
          </div>
          <div className="space-y-3">
            {[
              { label: "This Month", value: overview.revenueThisMonth || 0, color: gold },
              { label: "Last Month", value: overview.revenueLastMonth || 0, color: "#525252" },
              { label: "Total All Time", value: overview.totalRevenue || 0, color: "#10b981" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between py-2.5 border-b border-[#111] last:border-0">
                <span className="text-xs text-[#787878]">{label}</span>
                <span className="font-bold text-xs sm:text-sm" style={{ color }}>₨ {value.toLocaleString()}</span>
              </div>
            ))}
            {overview.revenueGrowth && (
              <div className="flex items-center gap-2 pt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-xs text-green-400">Growth: {overview.revenueGrowth}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white text-sm">Order Status</h2>
            <span className="text-[10px] font-mono text-[#525252]">{totalOrders} total</span>
          </div>
          {Object.entries(orderStatus || {}).map(([key, val]) => (
            <OrderStatusBar key={key} label={key} value={val} total={totalOrders} color={STATUS_COLORS[key] || gold} />
          ))}
        </div>
      </div>

      {/* Recent Orders + Top Products — stack on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Recent Orders */}
        <div className="bg-[#080808] border border-[#1a1a1a] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a]">
            <h2 className="font-semibold text-white text-sm">Recent Orders</h2>
            <Link to="/superadmin/orders" className="text-[10px] font-mono hover:text-white transition-colors" style={{ color: gold }}>
              View all →
            </Link>
          </div>
          <div className="divide-y divide-[#111]">
            {(recentOrders || []).slice(0, 5).map((order) => (
              <div key={order._id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#0d0d0d] transition-colors">
                {order.user?.avatar?.url
                  ? <img src={order.user.avatar.url} className="w-7 h-7 rounded-full object-cover flex-shrink-0 border border-[#1a1a1a]" alt="" />
                  : <div className="w-7 h-7 rounded-full bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                      <Users size={11} className="text-[#525252]" />
                    </div>
                }
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{order.user?.fullname || "User"}</p>
                  <p className="text-[10px] text-[#525252]">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold" style={{ color: gold }}>₨ {order.totalAmount?.toLocaleString()}</p>
                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full capitalize"
                    style={{ backgroundColor: `${STATUS_COLORS[order.status]}15`, color: STATUS_COLORS[order.status] || "#fff" }}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {(!recentOrders || recentOrders.length === 0) && (
              <p className="text-xs text-[#525252] text-center py-8">No recent orders</p>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-[#080808] border border-[#1a1a1a] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a]">
            <h2 className="font-semibold text-white text-sm">Top Products</h2>
            <Link to="/superadmin/products" className="text-[10px] font-mono hover:text-white transition-colors" style={{ color: gold }}>
              View all →
            </Link>
          </div>
          <div className="divide-y divide-[#111]">
            {(topProducts || []).slice(0, 5).map((p, i) => (
              <div key={p._id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#0d0d0d] transition-colors">
                <span className="text-[10px] font-mono w-4 flex-shrink-0" style={{ color: i === 0 ? gold : "#333" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="w-7 h-7 rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                  {p.images?.[0]?.url
                    ? <img src={p.images[0].url} className="w-full h-full object-cover" alt="" />
                    : <Package size={11} className="m-auto mt-1 text-[#525252]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{p.title}</p>
                  <p className="text-[10px] text-[#525252]">{p.analytics?.purchased || 0} sold</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-white">₨ {(p.discountPrice || p.price)?.toLocaleString()}</p>
                  {p.stock <= 5 && <p className="text-[9px] text-red-400">{p.stock} left</p>}
                </div>
              </div>
            ))}
            {(!topProducts || topProducts.length === 0) && (
              <p className="text-xs text-[#525252] text-center py-8">No products data</p>
            )}
          </div>
        </div>
      </div>

      {/* Out of stock warning */}
      {overview.outOfStockProducts > 0 && (
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border"
          style={{ backgroundColor: "#ef444408", borderColor: "#ef444425" }}>
          <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
          <p className="text-xs text-red-400">
            <span className="font-bold">{overview.outOfStockProducts}</span> products out of stock.{" "}
            <Link to="/superadmin/products" className="underline hover:text-red-300">Fix now →</Link>
          </p>
        </div>
      )}
    </div>
  );
}