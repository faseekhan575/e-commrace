import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../store/authSlice";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Sparkles,
  LogOut, Menu, X, ChevronRight, Store, ExternalLink,
  Shield, Tag, Bell, PlusCircle, User, Activity, AlertTriangle, MessageSquare, UserCheck
} from "lucide-react";
import BrandLogo from "../components/BrandLogo";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDesktop, setIsDesktop] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    const check = () => {
      const d = window.innerWidth >= 1024;
      setIsDesktop(d);
      setSidebarOpen(d);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!isDesktop) setSidebarOpen(false);
  }, [location.pathname, isDesktop]);

  // Real-Time Socket Listener Suite
  useEffect(() => {
    let socket = null;
    try {
      const socketUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
      socket = io(socketUrl, { withCredentials: true });

      socket.on("connect", () => {
        setSocketConnected(true);
        socket.emit("join_admin_room");
      });

      socket.on("disconnect", () => {
        setSocketConnected(false);
      });

      // 1. New Order Placement
      socket.on("new_order", (data) => {
        const notif = {
          id: `ord-${Date.now()}`,
          type: "order",
          title: "New Apparel Order Placed",
          detail: `PKR ${data.totalAmount?.toLocaleString()} by ${data.customerName || "Customer"}`,
          link: `/admin/orders`,
          time: new Date().toLocaleTimeString(),
        };
        setNotifications((p) => [notif, ...p].slice(0, 30));
        toast.custom(
          <div className="bg-[#0c0818] border border-[#7c3aed] text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top">
            <Sparkles size={18} className="text-[#d4af37]" />
            <div>
              <p className="text-[10px] font-mono text-[#a78bfa] uppercase tracking-wider font-bold">New Order Received 🛍️</p>
              <p className="text-xs font-bold text-white">PKR {data.totalAmount?.toLocaleString()} • {data.customerName || "Customer"}</p>
            </div>
          </div>,
          { duration: 5000 }
        );
      });

      // 2. Low Stock Warning
      socket.on("low_stock", (data) => {
        const notif = {
          id: `stk-${Date.now()}`,
          type: "stock",
          title: "Low Inventory Alert",
          detail: `${data.title} is down to ${data.stock} units!`,
          link: `/admin/products`,
          time: new Date().toLocaleTimeString(),
        };
        setNotifications((p) => [notif, ...p].slice(0, 30));
        toast.error(`⚠️ Low Stock Alert: "${data.title}" has only ${data.stock} units left!`, {
          style: { background: "#1c120c", color: "#f97316", border: "1px solid #f97316", fontSize: "12px" }
        });
      });

      // 3. Customer Review
      socket.on("new_review", (data) => {
        const notif = {
          id: `rev-${Date.now()}`,
          type: "review",
          title: `New ${data.rating}★ Customer Review`,
          detail: `"${data.comment}" — ${data.customerName || "Verified Buyer"}`,
          link: `/admin/products`,
          time: new Date().toLocaleTimeString(),
        };
        setNotifications((p) => [notif, ...p].slice(0, 30));
        toast.success(`⭐ New ${data.rating}★ Review from ${data.customerName || "Customer"}!`, {
          style: { background: "#0c0818", color: "#facc15", border: "1px solid #eab308", fontSize: "12px" }
        });
      });

      // 4. New Customer Registration
      socket.on("new_user_registered", (data) => {
        const notif = {
          id: `usr-${Date.now()}`,
          type: "user",
          title: "New Customer Joined",
          detail: `${data.fullname} (${data.email}) registered`,
          link: `/admin/users`,
          time: new Date().toLocaleTimeString(),
        };
        setNotifications((p) => [notif, ...p].slice(0, 30));
        toast(`👤 New Shopper: ${data.fullname}`, {
          icon: "✨",
          style: { background: "#0c0818", color: "#c4b5fd", border: "1px solid #7c3aed", fontSize: "12px" }
        });
      });

      return () => {
        socket.disconnect();
      };
    } catch (e) {
      console.warn("Socket init error:", e);
    }
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/");
  };

  const navSections = [
    {
      label: "Analytics & Overview",
      items: [
        { to: "/admin", label: "Seller Dashboard", icon: LayoutDashboard, exact: true },
      ],
    },
    {
      label: "Apparel Management",
      items: [
        { to: "/admin/products", label: "All Products", icon: Package },
        { to: "/admin/products/create", label: "Add New Product", icon: PlusCircle },
        { to: "/admin/banners", label: "Hero & Promo Banners", icon: Sparkles },
        { to: "/admin/categories", label: "Collections & Categories", icon: Tag },
      ],
    },
    {
      label: "Orders & Fulfillment",
      items: [
        { to: "/admin/orders", label: "Orders & Invoices", icon: ShoppingCart },
      ],
    },
    {
      label: "Administration",
      items: [
        { to: "/admin/users", label: "Customers & Staff CRM", icon: Users },
        { to: "/admin/profile", label: "Admin Profile", icon: User },
      ],
    },
  ];

  const isActive = (to, exact) =>
    exact ? location.pathname === to : location.pathname === to || (to !== "/admin" && location.pathname.startsWith(to));

  return (
    <div className="min-h-screen text-white flex bg-[#06040f] font-sans selection:bg-[#7c3aed] selection:text-white">

      {/* Mobile overlay */}
      {!isDesktop && sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar (Daraz Seller Center Style) ── */}
      <aside
        className="fixed top-0 left-0 h-full z-50 flex flex-col bg-[#0c0818] border-r border-[#1c162e] transition-transform duration-300"
        style={{
          width: 250,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1c162e]">
          <Link to="/admin" className="flex items-center">
            <BrandLogo variant="horizontal" theme="dark" size={32} showTagline={true} />
          </Link>
          {!isDesktop && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#160f28]"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* User Identity pill */}
        <div className="px-5 py-3 bg-[#110d20] border-b border-[#1c162e] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#7c3aed] flex items-center justify-center font-bold text-xs text-white uppercase flex-shrink-0">
              {user?.fullname ? user.fullname[0] : "A"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.fullname || "Clothing Den Admin"}</p>
              <span className="inline-block text-[9px] font-mono uppercase px-1.5 py-0.2 bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30 rounded">
                Master Admin
              </span>
            </div>
          </div>
          <div className={`w-2 h-2 rounded-full ${socketConnected ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} title={socketConnected ? "Real-time Sockets Connected" : "Sockets Disconnected"} />
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
          {navSections.map((sec) => (
            <div key={sec.label}>
              <p className="px-3 text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500 mb-2 font-bold">
                {sec.label}
              </p>
              <div className="space-y-1">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.to, item.exact);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                        active
                          ? "bg-gradient-to-r from-[#7c3aed] to-[#5b21b6] text-white shadow-lg shadow-[#7c3aed]/20 font-bold"
                          : "text-gray-400 hover:text-white hover:bg-[#160f28]"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon size={16} className={active ? "text-white" : "text-gray-400 group-hover:text-white"} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {active && <ChevronRight size={14} className="text-white/60" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-[#1c162e] space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-[#160f28] transition-colors"
          >
            <Store size={15} className="text-[#a78bfa]" />
            <span>Storefront View</span>
            <ExternalLink size={12} className="ml-auto opacity-50" />
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-950/30 transition-colors"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Workspace ── */}
      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-300"
        style={{ marginLeft: isDesktop && sidebarOpen ? 250 : 0 }}
      >
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center gap-4 px-5 py-3.5 bg-[#0c0818]/90 backdrop-blur-md border-b border-[#1c162e]">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl text-gray-400 hover:bg-[#160f28] transition-colors"
          >
            <Menu size={18} />
          </button>

          {/* Storefront Button */}
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#7c3aed]/20 text-[#c4b5fd] border border-[#7c3aed]/30 hover:bg-[#7c3aed]/30 transition-colors"
          >
            <Store size={14} />
            <span>View Live Clothing Store</span>
            <ExternalLink size={11} />
          </Link>

          {/* Socket Connection Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#110d20] border border-[#2e2646] text-[10px] font-mono">
            <span className={`w-1.5 h-1.5 rounded-full ${socketConnected ? "bg-emerald-400" : "bg-red-400"}`} />
            <span className={socketConnected ? "text-emerald-300" : "text-red-300"}>
              {socketConnected ? "Live Sockets Connected" : "Connecting..."}
            </span>
          </div>

          <div className="flex-1" />

          {/* Hero Banners Quick Link */}
          <Link
            to="/admin/banners"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 hover:bg-[#d4af37]/25 transition-all"
          >
            <Sparkles size={14} />
            <span>Banner Studio</span>
          </Link>

          {/* Real-time Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2 rounded-xl text-gray-400 hover:bg-[#160f28] relative transition-colors"
              title="Real-Time Admin Notifications"
            >
              <Bell size={18} />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#7c3aed] text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {notifications.length}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#0c0818] border border-[#2e2646] shadow-2xl z-50 p-3 max-h-96 overflow-y-auto animate-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-[#2e2646] mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#a78bfa] font-bold">
                      Live Notification Feed
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={() => setNotifications([])}
                      className="text-[10px] text-gray-400 hover:text-white"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 space-y-1">
                    <Bell size={24} className="mx-auto opacity-30" />
                    <p className="text-xs">No live notifications yet</p>
                    <p className="text-[10px] text-gray-600">Orders, reviews & stock alerts will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {notifications.map((n) => (
                      <Link
                        key={n.id}
                        to={n.link || "/admin"}
                        onClick={() => setNotifOpen(false)}
                        className="block p-2.5 rounded-xl bg-[#110d20] hover:bg-[#1a1430] border border-[#2e2646] transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono uppercase font-bold text-[#a78bfa]">
                            {n.title}
                          </span>
                          <span className="text-[9px] text-gray-500 font-mono">{n.time}</span>
                        </div>
                        <p className="text-xs text-white font-medium">{n.detail}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}