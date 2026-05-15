import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "../../axiosConfig";
import toast from "react-hot-toast";
import {
  TrendingUp, Users, Package, ShoppingCart,
  ArrowUpRight, BarChart2, Activity, AlertTriangle, Zap
} from "lucide-react";

const STATUS_COLORS = {
  pending: "#fbbf24", processing: "#60a5fa",
  shipped: "#a78bfa", delivered: "#34d399", cancelled: "#f87171",
};

/* ── Skeleton helpers ── */
function Skel({ className = "" }) {
  return <div className={`adm-skel ${className}`} />;
}

function StatSkeleton() {
  return (
    <div className="p-card rounded-2xl p-4 sm:p-5 space-y-3">
      <div className="flex items-start justify-between">
        <Skel className="w-9 h-9 rounded-xl" />
        <Skel className="w-4 h-4 rounded" />
      </div>
      <Skel className="h-7 w-24 rounded-lg" />
      <Skel className="h-3 w-20 rounded" />
      <Skel className="h-3 w-28 rounded" />
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Skel className="w-8 h-8 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skel className="h-3 w-3/4 rounded" />
        <Skel className="h-2.5 w-1/2 rounded" />
      </div>
      <div className="text-right space-y-2">
        <Skel className="h-3 w-16 rounded" />
        <Skel className="h-4 w-14 rounded-full" />
      </div>
    </div>
  );
}

/* ── Stat Card ── */
function StatCard({ label, value, icon: Icon, color, sub, delay = 0 }) {
  return (
    <div className="p-card rounded-2xl p-4 sm:p-5 group overflow-hidden relative"
      style={{ animationDelay: `${delay}s` }}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${color}08, transparent 65%)` }} />
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <ArrowUpRight size={13} className="transition-colors mt-1" style={{ color: "var(--text3)" }} />
      </div>
      <p className="adm-syne font-bold text-xl sm:text-2xl leading-tight mb-0.5" style={{ color: "var(--text1)" }}>{value}</p>
      <p className="adm-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--text3)" }}>{label}</p>
      {sub && <p className="text-[11px] mt-1.5 font-medium" style={{ color }}>{sub}</p>}
    </div>
  );
}

/* ── Order Status Bar ── */
function StatusBar({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs capitalize" style={{ color: "var(--text2)" }}>{label}</span>
        <span className="adm-mono text-xs" style={{ color: "var(--text1)" }}>
          {value} <span style={{ color: "var(--text3)" }}>({pct}%)</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg3)" }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useSelector((s) => s.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/v9/dashboard/stats")
      .then((r) => setStats(r.data.data))
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  const { overview = {}, orderStatus = {}, recentOrders = [], topProducts = [] } = stats || {};
  const totalOrders = Object.values(orderStatus).reduce((a, b) => a + b, 0);

  return (
    <div className="pb-6 space-y-4 adm-syne">

      {/* Header */}
      <div className="flex items-center justify-between adm-a1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap size={12} style={{ color: "#a78bfa" }} />
            <span className="adm-mono text-[10px] uppercase tracking-widest" style={{ color: "#a78bfa" }}>Admin Panel</span>
          </div>
          <h1 className="adm-syne font-bold text-xl sm:text-2xl lg:text-3xl" style={{ color: "var(--text1)" }}>
            Welcome, {user?.fullname?.split(" ")[0] || "Admin"}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text3)" }}>Store management overview</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl flex-shrink-0"
          style={{ border: "1px solid var(--p-border)", background: "var(--p-soft)" }}>
          <div className="w-1.5 h-1.5 rounded-full live-dot" style={{ background: "#a78bfa" }} />
          <span className="adm-mono text-[10px]" style={{ color: "#a78bfa" }}>LIVE</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 adm-a2">
        {loading ? (
          <>
            <StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton />
          </>
        ) : (
          <>
            <StatCard label="Revenue" value={`₨${((overview.totalRevenue || 0) / 1000).toFixed(0)}K`}
              icon={TrendingUp} color="#34d399" sub={overview.revenueGrowth || null} delay={0} />
            <StatCard label="Orders" value={overview.totalOrders || 0}
              icon={ShoppingCart} color="#a78bfa" sub={`${overview.ordersThisMonth || 0} this month`} delay={.06} />
            <StatCard label="Products" value={overview.totalProducts || 0}
              icon={Package} color="#60a5fa" sub={`${overview.outOfStockProducts || 0} out of stock`} delay={.12} />
            <StatCard label="Users" value={overview.totalUsers || 0}
              icon={Users} color="#f472b6" sub={`+${overview.newUsersThisMonth || 0} this month`} delay={.18} />
          </>
        )}
      </div>

      {/* Revenue + Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 adm-a3">
        {/* Revenue */}
        <div className="p-card rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="adm-syne font-semibold text-sm" style={{ color: "var(--text1)" }}>Revenue Overview</h2>
            <BarChart2 size={14} style={{ color: "#a78bfa" }} />
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <Skel key={i} className="h-10 rounded-xl" />)}</div>
          ) : (
            <div className="space-y-0">
              {[
                { label: "This Month", value: overview.revenueThisMonth || 0, color: "#a78bfa" },
                { label: "Last Month", value: overview.revenueLastMonth || 0, color: "var(--text3)" },
                { label: "All Time", value: overview.totalRevenue || 0, color: "#34d399" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                  <span className="text-xs" style={{ color: "var(--text2)" }}>{label}</span>
                  <span className="adm-syne font-bold text-sm" style={{ color }}>₨ {value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Status */}
        <div className="p-card rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="adm-syne font-semibold text-sm" style={{ color: "var(--text1)" }}>Order Status</h2>
            <span className="adm-mono text-[10px]" style={{ color: "var(--text3)" }}>{totalOrders} total</span>
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <Skel key={i} className="h-6 rounded-lg" />)}</div>
          ) : (
            Object.entries(orderStatus).map(([k, v]) => (
              <StatusBar key={k} label={k} value={v} total={totalOrders} color={STATUS_COLORS[k] || "#a78bfa"} />
            ))
          )}
        </div>
      </div>

      {/* Recent Orders + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 adm-a4">
        {/* Recent Orders */}
        <div className="p-card rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="adm-syne font-semibold text-sm" style={{ color: "var(--text1)" }}>Recent Orders</h2>
            <Link to="/admin/orders" className="adm-mono text-[10px] uppercase tracking-widest transition-colors"
              style={{ color: "#a78bfa" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#c4b5fd"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#a78bfa"}>
              View all →
            </Link>
          </div>
          <div>
            {loading
              ? [...Array(5)].map((_, i) => <RowSkeleton key={i} />)
              : recentOrders.slice(0, 5).map((order) => (
                <div key={order._id} className="flex items-center gap-3 px-4 py-3 transition-colors"
                  style={{ borderBottom: "1px solid var(--border)" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg3)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  {order.user?.avatar?.url
                    ? <img src={order.user.avatar.url} className="w-8 h-8 rounded-xl object-cover flex-shrink-0" alt="" />
                    : <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center"
                        style={{ background: "var(--p-soft)", border: "1px solid var(--p-border)" }}>
                        <Users size={12} style={{ color: "#a78bfa" }} />
                      </div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: "var(--text1)" }}>{order.user?.fullname || "User"}</p>
                    <p className="adm-mono text-[10px]" style={{ color: "var(--text3)" }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="adm-syne text-xs font-bold" style={{ color: "#a78bfa" }}>
                      ₨ {order.totalAmount?.toLocaleString()}
                    </p>
                    <span className={`adm-mono text-[9px] font-medium px-2 py-0.5 rounded-full capitalize s-${order.status}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            {!loading && recentOrders.length === 0 && (
              <p className="text-xs text-center py-8" style={{ color: "var(--text3)" }}>No recent orders</p>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="p-card rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="adm-syne font-semibold text-sm" style={{ color: "var(--text1)" }}>Top Products</h2>
            <Link to="/admin/products" className="adm-mono text-[10px] uppercase tracking-widest transition-colors"
              style={{ color: "#a78bfa" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#c4b5fd"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#a78bfa"}>
              View all →
            </Link>
          </div>
          <div>
            {loading
              ? [...Array(5)].map((_, i) => <RowSkeleton key={i} />)
              : topProducts.slice(0, 5).map((p, i) => (
                <div key={p._id} className="flex items-center gap-3 px-4 py-3 transition-colors"
                  style={{ borderBottom: "1px solid var(--border)" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg3)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <span className="adm-mono w-5 text-[10px] flex-shrink-0 text-center"
                    style={{ color: i === 0 ? "#a78bfa" : "var(--text3)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0"
                    style={{ background: "var(--bg3)", border: "1px solid var(--border)" }}>
                    {p.images?.[0]?.url
                      ? <img src={p.images[0].url} className="w-full h-full object-cover" alt="" />
                      : <Package size={12} className="m-auto mt-2" style={{ color: "var(--text3)" }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: "var(--text1)" }}>{p.title}</p>
                    <p className="adm-mono text-[10px]" style={{ color: "var(--text3)" }}>{p.analytics?.purchased || 0} sold</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="adm-syne text-xs font-bold" style={{ color: "var(--text1)" }}>
                      ₨ {(p.discountPrice || p.price)?.toLocaleString()}
                    </p>
                    {p.stock <= 5 && <p className="adm-mono text-[9px]" style={{ color: "#f87171" }}>{p.stock} left</p>}
                  </div>
                </div>
              ))}
            {!loading && topProducts.length === 0 && (
              <p className="text-xs text-center py-8" style={{ color: "var(--text3)" }}>No data</p>
            )}
          </div>
        </div>
      </div>

      {/* Out of stock warning */}
      {!loading && overview.outOfStockProducts > 0 && (
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
          style={{ background: "#7f1d1d15", border: "1px solid #7f1d1d40" }}>
          <AlertTriangle size={14} className="flex-shrink-0" style={{ color: "#f87171" }} />
          <p className="text-xs" style={{ color: "#f87171" }}>
            <span className="font-bold">{overview.outOfStockProducts}</span> products are out of stock.{" "}
            <Link to="/admin/products" className="underline">Fix now →</Link>
          </p>
        </div>
      )}
    </div>
  );
}