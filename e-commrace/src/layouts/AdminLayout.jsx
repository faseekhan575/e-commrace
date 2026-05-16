import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { logoutUser } from "../store/authSlice";
import { io } from "socket.io-client";
import {
  LayoutDashboard, Package, ShoppingCart, Tag, Store, User,
  LogOut, Menu, X, Bell, ChevronRight, ExternalLink, Zap
} from "lucide-react";
import toast from "react-hot-toast";

/* ── inject fonts once ── */
function InjectFonts() {
  useEffect(() => {
    if (document.getElementById("admin-fonts")) return;
    const link = document.createElement("link");
    link.id = "admin-fonts";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.textContent = `
      :root {
        --p1: #7c3aed;
        --p2: #6d28d9;
        --p3: #5b21b6;
        --p-glow: rgba(124,58,237,0.18);
        --p-soft: rgba(124,58,237,0.10);
        --p-border: rgba(124,58,237,0.25);
        --bg0: #06040f;
        --bg1: #0c0818;
        --bg2: #110d20;
        --bg3: #160f28;
        --border: rgba(255,255,255,0.06);
        --text1: #f0eaff;
        --text2: #a090c0;
        --text3: #5a4a7a;
      }
      .adm-syne { font-family: 'Syne', system-ui, sans-serif; }
      .adm-mono { font-family: 'DM Mono', monospace; }

      @keyframes adm-slide-in  { from{opacity:0;transform:translateX(-18px)} to{opacity:1;transform:translateX(0)} }
      @keyframes adm-fade-up   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
      @keyframes adm-pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.75)} }

      .adm-a1{animation:adm-fade-up .5s .05s cubic-bezier(.22,1,.36,1) both}
      .adm-a2{animation:adm-fade-up .5s .12s cubic-bezier(.22,1,.36,1) both}
      .adm-a3{animation:adm-fade-up .5s .19s cubic-bezier(.22,1,.36,1) both}
      .adm-a4{animation:adm-fade-up .5s .26s cubic-bezier(.22,1,.36,1) both}

      .live-dot { animation: adm-pulse-dot 1.6s ease-in-out infinite; }

      /* sidebar link hover */
      .nav-link { transition: background .15s, color .15s, border-color .15s; }
      .nav-link:hover { background: var(--p-soft) !important; color: #c4b5fd !important; }

      /* scrollbar */
      .adm-scroll::-webkit-scrollbar { width: 3px; }
      .adm-scroll::-webkit-scrollbar-track { background: transparent; }
      .adm-scroll::-webkit-scrollbar-thumb { background: var(--p-border); border-radius: 99px; }

      /* purple glow card */
      .p-card {
        background: var(--bg2);
        border: 1px solid var(--border);
        transition: border-color .25s, box-shadow .25s;
      }
      .p-card:hover { border-color: var(--p-border); box-shadow: 0 0 0 1px var(--p-border), 0 8px 32px var(--p-glow); }

      /* input focus */
      .adm-input { background: var(--bg1); border: 1px solid var(--border); color: var(--text1); transition: border-color .2s; }
      .adm-input:focus { outline: none; border-color: var(--p1); box-shadow: 0 0 0 3px var(--p-soft); }
      .adm-input::placeholder { color: var(--text3); }

      /* btn primary */
      .adm-btn-primary { background: var(--p1); color: #fff; transition: background .2s, transform .15s, box-shadow .2s; }
      .adm-btn-primary:hover { background: var(--p2); transform: translateY(-1px); box-shadow: 0 6px 24px var(--p-glow); }
      .adm-btn-primary:active { transform: translateY(0); }
      .adm-btn-primary:disabled { opacity: .45; pointer-events: none; }

      /* skeleton */
      @keyframes adm-shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
      .adm-skel {
        background: linear-gradient(90deg, var(--bg2) 25%, var(--bg3) 50%, var(--bg2) 75%);
        background-size: 800px 100%;
        animation: adm-shimmer 1.4s infinite;
        border-radius: 8px;
      }

      /* status badges */
      .s-pending    { background:#78350f22; color:#fbbf24; border:1px solid #78350f55; }
      .s-processing { background:#1e3a5f22; color:#60a5fa; border:1px solid #1e3a5f55; }
      .s-shipped    { background:#312e8122; color:#a78bfa; border:1px solid #312e8155; }
      .s-delivered  { background:#06401422; color:#34d399; border:1px solid #06401455; }
      .s-cancelled  { background:#7f1d1d22; color:#f87171; border:1px solid #7f1d1d55; }
    `;
    document.head.appendChild(style);
  }, []);
  return null;
}

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role } = useSelector((s) => s.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

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

  useEffect(() => {
    const socket = io("https://e-commarce-v3jf.onrender.com");
    socket.emit("join_admin_room");
    socket.on("new_order", (data) => {
      setNotifications((p) => [data, ...p].slice(0, 20));
      toast.custom(
        <div style={{ background: "#0c0818", border: "1px solid rgba(124,58,237,.4)" }}
          className="text-white px-5 py-3 rounded-xl shadow-2xl">
          <p className="adm-mono text-xs uppercase tracking-widest mb-1" style={{ color: "#a78bfa" }}>New Order</p>
          <p className="adm-syne text-sm font-semibold">₨ {data.totalAmount?.toLocaleString()}</p>
        </div>
      );
    });
    return () => socket.disconnect();
  }, []);

  const handleLogout = async () => { await dispatch(logoutUser()); navigate("/"); };

  const navSections = [
    { label: "Overview", items: [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }] },
    {
      label: "Store",
      items: [
        { to: "/admin/products", label: "Products", icon: Package },
        { to: "/admin/categories", label: "Categories", icon: Tag },
        { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
      ],
    },
    {
      label: "Account",
      items: [
        { to: "/admin/store", label: "Browse Store", icon: Store },
        { to: "/admin/profile", label: "Profile", icon: User },
      ],
    },
  ];

  const isActive = (to, exact) =>
    exact ? location.pathname === to : location.pathname === to || (to !== "/admin" && location.pathname.startsWith(to));

  return (
    <div className="adm-syne min-h-screen text-white flex" style={{ background: "var(--bg0)" }}>
      <InjectFonts />

      {/* Mobile overlay */}
      {!isDesktop && sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className="fixed top-0 left-0 h-full z-50 flex flex-col adm-scroll overflow-y-auto"
        style={{
          width: 240,
          background: "var(--bg1)",
          borderRight: "1px solid var(--border)",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform .28s cubic-bezier(.22,1,.36,1)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--p1)" }}>
              <Zap size={14} fill="white" color="white" />
            </div>
            <div>
              <p className="adm-syne font-bold text-sm tracking-widest" style={{ color: "var(--text1)" }}>VAULT</p>
              <p className="adm-mono text-[9px] uppercase tracking-widest mt-px" style={{ color: "#a78bfa" }}>Admin Panel</p>
            </div>
          </div>
          {!isDesktop && (
            <button onClick={() => setSidebarOpen(false)} className="p-1" style={{ color: "var(--text3)" }}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-5">
          {navSections.map((sec) => (
            <div key={sec.label}>
              <p className="adm-mono px-3 mb-1.5" style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--text3)", textTransform: "uppercase" }}>
                {sec.label}
              </p>
              <div className="space-y-0.5">
                {sec.items.map(({ to, label, icon: Icon, exact }) => {
                  const active = isActive(to, exact);
                  return (
                    <Link key={to} to={to}
                      className="nav-link flex items-center gap-3 px-3 py-2.5 rounded-xl"
                      style={{
                        background: active ? "var(--p-soft)" : "transparent",
                        border: `1px solid ${active ? "var(--p-border)" : "transparent"}`,
                        color: active ? "#c4b5fd" : "var(--text2)",
                      }}>
                      <Icon size={16} className="flex-shrink-0" />
                      <span className="text-sm font-medium">{label}</span>
                      {active && <ChevronRight size={12} className="ml-auto" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3">
            {user?.avatar?.url
              ? <img src={user.avatar.url} className="w-8 h-8 rounded-xl object-cover flex-shrink-0" style={{ border: "1px solid var(--p-border)" }} alt="" />
              : <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: "var(--p-soft)", border: "1px solid var(--p-border)" }}>
                  <User size={13} style={{ color: "#a78bfa" }} />
                </div>
            }
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: "var(--text1)" }}>{user?.fullname}</p>
              <p className="adm-mono text-[9px] uppercase tracking-widest" style={{ color: "#a78bfa" }}>{role}</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--text3)" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#f87171"}
              onMouseLeave={(e) => e.currentTarget.style.color = "var(--text3)"}>
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300"
        style={{ marginLeft: isDesktop && sidebarOpen ? 240 : 0 }}>

        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3"
          style={{ background: "rgba(12,8,24,0.88)", backdropFilter: "blur(14px)", borderBottom: "1px solid var(--border)" }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl transition-colors flex-shrink-0"
            style={{ color: "var(--text2)" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg3)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
            <Menu size={18} />
          </button>

          {!isDesktop && (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "var(--p1)" }}>
                <Zap size={10} fill="white" color="white" />
              </div>
              <span className="adm-syne font-bold text-sm tracking-widest">VAULT</span>
            </div>
          )}

          <div className="flex-1" />

          <Link to="/"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-colors"
            style={{ color: "var(--text2)", border: "1px solid var(--border)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text1)"; e.currentTarget.style.borderColor = "var(--p-border)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text2)"; e.currentTarget.style.borderColor = "var(--border)"; }}>
            <ExternalLink size={12} /> Store
          </Link>

          {/* Notifications */}
          <div className="relative">
            <button onClick={() => setNotifOpen(!notifOpen)}
              className="p-2 rounded-xl relative transition-colors"
              style={{ color: "var(--text2)" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg3)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              <Bell size={17} />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
                  style={{ background: "var(--p1)" }}>
                  {notifications.length > 9 ? "9+" : notifications.length}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl z-50 max-h-72 overflow-y-auto adm-scroll"
                style={{ background: "var(--bg1)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                  <span className="adm-mono text-[10px] uppercase tracking-widest" style={{ color: "#a78bfa" }}>Live Orders</span>
                  {notifications.length > 0 && (
                    <button onClick={() => setNotifications([])} className="text-[10px]" style={{ color: "var(--text3)" }}>Clear</button>
                  )}
                </div>
                {notifications.length === 0
                  ? <p className="text-xs text-center py-8" style={{ color: "var(--text3)" }}>No new orders</p>
                  : notifications.map((n, i) => (
                    <div key={i} className="px-4 py-3 transition-colors" style={{ borderBottom: "1px solid var(--border)" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg3)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <p className="text-xs font-semibold" style={{ color: "var(--text1)" }}>₨ {n.totalAmount?.toLocaleString()}</p>
                      <p className="adm-mono text-[10px] mt-0.5" style={{ color: "var(--text3)" }}>{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}