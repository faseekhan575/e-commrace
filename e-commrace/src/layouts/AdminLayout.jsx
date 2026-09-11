import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../store/authSlice";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Sparkles,
  LogOut, Menu, X, ChevronRight, Store, ExternalLink,
  Tag, Bell, PlusCircle, User, Download, Smartphone,
  CheckCircle, Volume2, Layers, Star
} from "lucide-react";
import BrandLogo from "../components/BrandLogo";
import { useCommerceRealtime } from "../components/CommerceRealtime";
import toast from "react-hot-toast";
import {

  requestPushPermission,
  showPushNotification,
  isRunningStandalone,
} from "../utils/pwaNotifications";

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDesktop, setIsDesktop] = useState(true);
  const { notifications, clearNotifications, connected: socketConnected } = useCommerceRealtime();
  const [notifOpen, setNotifOpen] = useState(false);


  // PWA State
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isStandaloneApp, setIsStandaloneApp] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(
    typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted"
  );

  useEffect(() => {
    setIsStandaloneApp(isRunningStandalone());

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

  // Capture PWA beforeinstallprompt event (exclusive to admin portal)
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallPWA = async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      if (outcome === "accepted") {
        toast.success("Clothing Den Admin App Installed!");
        setDeferredInstallPrompt(null);
      }
      setShowInstallModal(false);
    } else {
      setShowInstallModal(true);
    }
  };

  const handleEnablePush = async () => {
    const granted = await requestPushPermission();
    setPushEnabled(granted);
    if (granted) {
      toast.success("Order push notifications enabled!");
      showPushNotification("Clothing Den Notifications Active", {
        body: "You will receive real-time push alerts whenever new orders arrive.",
      });
    } else {
      toast.error("Please allow notifications in your browser settings.");
    }
  };

  const handleLogout = async () => {
    const result = await dispatch(logoutUser());
    if (logoutUser.rejected.match(result)) toast.error("Signed out locally. The server could not confirm sign-out.");
    navigate("/");
  };

  const navSections = [
    {
      label: "Workspace",
      items: [
        { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
      ],
    },
    {
      label: "Catalog & content",
      items: [
        { to: "/admin/categories", label: "Categories", icon: Tag },
        { to: "/admin/products", label: "Products & inventory", icon: Package },
        { to: "/admin/spotlight", label: "Editorial spotlights", icon: Sparkles },
        { to: "/admin/banners", label: "Hero banners", icon: Layers },
        { to: "/admin/products/create", label: "Add product", icon: PlusCircle },
      ],
    },
    {
      label: "Fulfillment & Orders",
      items: [
        { to: "/admin/orders", label: "Orders & fulfillment", icon: ShoppingCart },
      ],
    },
    {
      label: "Store CRM",
      items: [
        { to: "/admin/users", label: "Customers", icon: Users },
        { to: "/admin/reviews", label: "Reviews & ratings", icon: Star },
        { to: "/admin/profile", label: "Admin Profile", icon: User },
      ],
    },
  ];

  const isActive = (to, exact) =>
    exact ? location.pathname === to : location.pathname === to || (to !== "/admin" && location.pathname.startsWith(to));

  return (
    <div className="min-h-screen text-slate-900 flex bg-[#f8fafc] font-sans selection:bg-slate-900 selection:text-white">

      {/* Mobile overlay */}
      {!isDesktop && sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* â”€â”€ Sidebar (Clean Crisp White Luxury Style) â”€â”€ */}
      <aside
        className="fixed top-0 left-0 h-full z-50 flex flex-col bg-white border-r border-slate-200 shadow-sm transition-transform duration-300"
        style={{
          width: 260,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <Link to="/admin" className="flex items-center">
            <BrandLogo variant="horizontal" theme="light" size={32} showTagline={true} />
          </Link>
          {!isDesktop && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* User Identity pill */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center font-bold text-xs text-white uppercase flex-shrink-0 shadow-sm">
              {user?.fullname ? user.fullname[0] : "A"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.fullname || "Store Master Admin"}</p>
              <span className="inline-block text-[9px] font-mono uppercase px-1.5 py-0.2 bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded">
                Master Admin
              </span>
            </div>
          </div>
          <div className={`w-2 h-2 rounded-full ${socketConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} title={socketConnected ? "Real-time Sockets Connected" : "Sockets Disconnected"} />
        </div>

        {/* â”€â”€ Admin PWA Quick Action Card â”€â”€ */}
        <div className="px-3 pt-3">
          {isStandaloneApp ? (
            <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-[11px] font-mono font-medium">
              <CheckCircle size={14} className="text-emerald-600 flex-shrink-0" />
              <span>Native App Active</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleInstallPWA}
              className="w-full flex items-center justify-between px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 transition-all group shadow-xs"
            >
              <div className="flex items-center gap-2">
                <Smartphone size={15} className="text-amber-700 group-hover:scale-110 transition-transform" />
                <span>Install Seller App</span>
              </div>
              <Download size={13} className="text-amber-700" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
          {navSections.map((sec) => (
            <div key={sec.label}>
              <p className="px-3 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-600 mb-2 font-bold">
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
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all group ${
                        active
                          ? "bg-slate-900 text-white font-bold shadow-md shadow-slate-900/10"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon size={16} className={active ? "text-amber-400" : "text-slate-500 group-hover:text-slate-900"} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {active && <ChevronRight size={14} className="text-slate-400" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-slate-100 space-y-1.5">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Store size={15} className="text-slate-500" />
            <span>View Storefront</span>
            <ExternalLink size={12} className="ml-auto opacity-50" />
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* â”€â”€ Main Workspace â”€â”€ */}
      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-300"
        style={{ marginLeft: isDesktop && sidebarOpen ? 260 : 0 }}
      >
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center gap-4 px-6 py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Menu size={18} />
          </button>

          {/* Storefront Button */}
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200 transition-colors"
          >
            <Store size={14} className="text-slate-600" />
            <span className="hidden sm:inline">Live Storefront</span>
            <ExternalLink size={11} className="text-slate-600" />
          </Link>

          {/* Socket Connection Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-mono">
            <span className={`w-1.5 h-1.5 rounded-full ${socketConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
            <span className={socketConnected ? "text-emerald-700 font-semibold" : "text-red-600"}>
              {socketConnected ? "Live updates connected" : "Reconnecting updates..."}
            </span>
          </div>

          <div className="flex-1" />

          {/* Push Notification Enabler Pill */}
          {!pushEnabled && (
            <button
              onClick={handleEnablePush}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-all"
              title="Click to enable desktop order push alerts"
            >
              <Volume2 size={14} className="text-emerald-600" />
              <span>Enable Push Alerts</span>
            </button>
          )}

          {/* Categories Quick Flow Link */}
          <Link
            to="/admin/categories"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-all"
          >
            <Tag size={14} />
            <span>Categories</span>
          </Link>

          {/* Real-time Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 relative transition-colors"
              title="Real-Time Admin Notifications"
            >
              <Bell size={18} />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {notifications.length}
                </span>
              )}
            </button>

            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 p-3 max-h-96 overflow-y-auto animate-in zoom-in-95 text-slate-900">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Live Store Notifications
                  </span>
                  <button
                    onClick={clearNotifications}
                    className="text-[10px] text-slate-600 hover:text-slate-900 font-mono"
                  >
                    Clear All
                  </button>
                </div>
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-600 py-4 text-center font-mono">No new alerts</p>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((n) => (
                      <Link
                        key={n.id}
                        to={n.link}
                        onClick={() => setNotifOpen(false)}
                        className="block p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-bold text-slate-900">{n.title}</span>
                          <span className="text-[9px] font-mono text-slate-600">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2">{n.detail}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

          {/* User Avatar */}
          <Link
            to="/admin/profile"
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {user?.fullname ? user.fullname[0] : "A"}
            </div>
          </Link>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* PWA Install Modal (if triggered manually) */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-slate-900 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mb-4">
              <Smartphone size={24} />
            </div>
            <h3 className="text-lg font-serif font-bold text-slate-900 mb-1">
              Install Clothing Den Seller Portal
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-5">
              Install as a standalone app on your desktop or mobile home screen with instant push notifications, order chimes, and 1-click dispatch waybills.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowInstallModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Later
              </button>
              <button
                type="button"
                onClick={handleInstallPWA}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-md"
              >
                Install Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
