import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { logoutUser } from "../store/authSlice";
import { io } from "socket.io-client";
import {
  LayoutDashboard, Package, ShoppingCart, Tag, Users, Shield,
  User, LogOut, Menu, X, Bell, ChevronRight, ExternalLink, Crown
} from "lucide-react";
import toast from "react-hot-toast";

const gold = "#f9c938";

export default function SuperAdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false); // default CLOSED on mobile
  const [isDesktop, setIsDesktop] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  // Detect desktop
  useEffect(() => {
    const check = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (!isDesktop) setSidebarOpen(false);
  }, [location.pathname, isDesktop]);

  useEffect(() => {
    const socket = io("https://e-commarce-v3jf.onrender.com");
    socket.emit("join_admin_room");
    socket.on("new_order", (data) => {
      setNotifications((prev) => [data, ...prev].slice(0, 20));
      toast.custom(
        <div className="bg-[#0a0a0a] border text-white px-5 py-3 rounded-lg shadow-2xl"
          style={{ borderColor: `${gold}40` }}>
          <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: gold }}>New Order</p>
          <p className="text-sm font-medium">₨ {data.totalAmount?.toLocaleString()}</p>
        </div>
      );
    });
    return () => socket.disconnect();
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/");
  };

  const navSections = [
    {
      label: "Overview",
      items: [{ to: "/superadmin", label: "Dashboard", icon: LayoutDashboard, exact: true }],
    },
    {
      label: "Management",
      items: [
        { to: "/superadmin/users", label: "All Users", icon: Users },
        { to: "/superadmin/admins", label: "Admins", icon: Shield },
      ],
    },
    {
      label: "Store",
      items: [
        { to: "/superadmin/products", label: "Products", icon: Package },
        { to: "/superadmin/categories", label: "Categories", icon: Tag },
        { to: "/superadmin/orders", label: "Orders", icon: ShoppingCart },
      ],
    },
    {
      label: "Account",
      items: [{ to: "/superadmin/profile", label: "Profile", icon: User }],
    },
  ];

  const isActive = (to, exact) =>
    exact ? location.pathname === to : location.pathname === to || (to !== "/superadmin" && location.pathname.startsWith(to));

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <Crown size={18} style={{ color: gold }} />
          <div>
            <span className="font-display font-700 text-base tracking-widest text-white">VAULT</span>
            <p className="text-[10px] tracking-widest uppercase font-mono mt-0.5" style={{ color: gold }}>Super Admin</p>
          </div>
        </div>
        {!isDesktop && (
          <button onClick={() => setSidebarOpen(false)} className="p-1.5 hover:bg-[#1a1a1a] rounded-lg text-[#525252] hover:text-white">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto space-y-4">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="text-[9px] font-mono text-[#333] uppercase tracking-[0.2em] px-3 mb-1">{section.label}</p>
            <div className="space-y-0.5">
              {section.items.map(({ to, label, icon: Icon, exact }) => {
                const active = isActive(to, exact);
                return (
                  <Link key={to} to={to}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group"
                    style={{
                      backgroundColor: active ? `${gold}12` : "transparent",
                      border: `1px solid ${active ? `${gold}25` : "transparent"}`,
                      color: active ? gold : "#525252",
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = "#525252"; }}
                  >
                    <Icon size={17} className="flex-shrink-0" />
                    <span className="text-sm font-medium">{label}</span>
                    {active && <ChevronRight size={13} className="ml-auto" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-[#1a1a1a] p-3">
        <div className="flex items-center gap-3">
          {user?.avatar?.url
            ? <img src={user.avatar.url} className="w-8 h-8 rounded-full object-cover border flex-shrink-0" style={{ borderColor: `${gold}30` }} alt="" />
            : <div className="w-8 h-8 rounded-full bg-[#111] border flex-shrink-0 flex items-center justify-center" style={{ borderColor: `${gold}30` }}>
                <Crown size={13} style={{ color: gold }} />
              </div>
          }
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.fullname}</p>
            <p className="text-[10px] uppercase tracking-widest font-mono" style={{ color: gold }}>superadmin</p>
          </div>
          <button onClick={handleLogout} className="p-1.5 hover:bg-[#1a1a1a] rounded-lg text-[#525252] hover:text-red-400 transition-colors">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#020202] text-white font-body flex">

      {/* Mobile overlay */}
      {!isDesktop && sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar — fixed on desktop, overlay on mobile */}
      <aside
        className="fixed top-0 left-0 h-full z-50 flex flex-col bg-[#080808] border-r border-[#1a1a1a] transition-transform duration-300"
        style={{
          width: "256px",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <SidebarContent />
      </aside>

      {/* Main — offset only on desktop when sidebar open */}
      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-300"
        style={{ marginLeft: isDesktop && sidebarOpen ? "256px" : "0" }}
      >
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 border-b border-[#1a1a1a]"
          style={{ backgroundColor: "rgba(8,8,8,0.9)", backdropFilter: "blur(12px)" }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-[#1a1a1a] rounded-xl text-[#525252] hover:text-white transition-colors flex-shrink-0">
            <Menu size={18} />
          </button>

          {/* Mobile logo */}
          {!isDesktop && (
            <div className="flex items-center gap-2">
              <Crown size={14} style={{ color: gold }} />
              <span className="font-display text-sm font-700 tracking-widest text-white">VAULT</span>
            </div>
          )}

          <div className="flex-1" />

          <Link to="/" className="hidden sm:flex items-center gap-1.5 text-xs text-[#525252] hover:text-white px-3 py-1.5 border border-[#1a1a1a] hover:border-[#333] rounded-lg transition-colors">
            <ExternalLink size={12} /> Store
          </Link>

          {/* Notifications */}
          <div className="relative">
            <button onClick={() => setNotifOpen(!notifOpen)} className="p-2 hover:bg-[#1a1a1a] rounded-xl relative transition-colors">
              <Bell size={17} className="text-[#525252]" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 text-black text-[9px] font-bold rounded-full flex items-center justify-center"
                  style={{ backgroundColor: gold }}>
                  {notifications.length > 9 ? "9+" : notifications.length}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#080808] border border-[#1a1a1a] rounded-2xl shadow-2xl z-50 max-h-72 overflow-y-auto">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a]">
                  <span className="text-xs font-mono uppercase tracking-widest" style={{ color: gold }}>Live Orders</span>
                  {notifications.length > 0 && (
                    <button onClick={() => setNotifications([])} className="text-[10px] text-[#525252] hover:text-white">Clear</button>
                  )}
                </div>
                {notifications.length === 0
                  ? <p className="text-xs text-[#525252] text-center py-8">No new orders</p>
                  : notifications.map((n, i) => (
                    <div key={i} className="px-4 py-3 border-b border-[#111] last:border-0 hover:bg-[#111]">
                      <p className="text-xs text-white font-medium">₨ {n.totalAmount?.toLocaleString()}</p>
                      <p className="text-[10px] text-[#525252] mt-0.5">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}