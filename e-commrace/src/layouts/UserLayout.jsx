import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useRef } from "react";
import { logoutUser } from "../store/authSlice";
import {
  ShoppingBag, User, Search, Menu, X, Heart,
  ShieldCheck, Truck, RotateCcw, Phone, Sparkles,
  ChevronDown, ArrowRight, ChevronRight, Check, SlidersHorizontal,
  Lock, Tag, FileText, BadgePercent
} from "lucide-react";
import {
  EasypaisaLogo, JazzCashLogo, BankTransferLogos,
  CardLogos, GooglePayLogo, ApplePayLogo, CODLogo, SadaPayLogo
} from "../components/PaymentLogos";
import { io } from "socket.io-client";
import MegaMenu from "../components/MegaMenu";
import BrandLogo from "../components/BrandLogo";
import AIStylistModal from "../components/AIStylistModal";
import FooterPolicyModal from "../components/FooterPolicyModal";
import toast from "react-hot-toast";

const TOP_TICKER_MESSAGES = [
  "✨ FREE NATIONWIDE EXPRESS SHIPPING ON ALL ORDERS ABOVE PKR 5,000",
  "🌸 NEW ARRIVALS: FESTIVE LAWN & LUXURY PRET COLLECTION '26 LIVE NOW",
  "💳 MULTI-PAYMENT: CASH ON DELIVERY, EASYPAISA, JAZZCASH, IBFT & GOOGLE PAY ACCEPTED",
  "👗 7-DAY EASY SIZE & STYLE EXCHANGES ACROSS ALL OUTLETS IN PAKISTAN",
];

export default function UserLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, user, role } = useSelector((s) => s.auth);
  const { items } = useSelector((s) => s.cart);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tickerIndex, setTickerIndex] = useState(0);
  const [activeMegaCategory, setActiveMegaCategory] = useState(null);
  const [activePolicy, setActivePolicy] = useState(null);
  const megaMenuTimeoutRef = useRef(null);

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  // Rotate announcement ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % TOP_TICKER_MESSAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Real-time live order updates for customer
  useEffect(() => {
    if (!user?._id) return;
    let socket = null;
    try {
      const socketUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
      socket = io(socketUrl, { withCredentials: true });
      socket.emit("join_user_room", user._id);
      socket.on("order_status_updated", (data) => {
        toast.success(
          `📦 Order Update: Your order #${data.orderId?.slice(-6) || ""} is now ${data.status?.toUpperCase()}!`,
          {
            duration: 6000,
            style: {
              background: "#141410",
              color: "#f5f5f0",
              border: "1px solid #d4af37",
              fontSize: "13px",
            },
          }
        );
      });
    } catch (e) {}

    return () => {
      if (socket) socket.disconnect();
    };
  }, [user?._id]);

  // Close menus on page route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchDrawerOpen(false);
    setActiveMegaCategory(null);
  }, [location.pathname]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchDrawerOpen(false);
      setSearchQuery("");
    }
  };

  const handleMouseEnterNav = (catKey) => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    setActiveMegaCategory(catKey);
  };

  const handleMouseLeaveNav = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setActiveMegaCategory(null);
    }, 150);
  };

  const navCategories = [
    { key: "ready-to-wear", label: "Ready to Wear", url: "/products?category=ready-to-wear", badge: "HOT" },
    { key: "unstitched", label: "Unstitched Lawn", url: "/products?category=unstitched-lawn", badge: "NEW" },
    { key: "luxury-pret", label: "Luxury Pret", url: "/products?category=luxury-pret" },
    { key: "festive-velvet", label: "Velvet & Festive", url: "/products?search=velvet", badge: "ROYAL" },
    { key: "special-offers", label: "Special Offers", url: "/products?search=sale", isSale: true },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf8] text-[#141410] font-sans selection:bg-[#141410] selection:text-white">

      {/* ── Top Announcement Ticker Bar ── */}
      <div className="bg-[#141410] text-[#f5f5f0] text-[11px] font-medium tracking-[0.2em] uppercase py-2 px-4 text-center overflow-hidden flex items-center justify-center relative z-50">
        <div className="animate-fade transition-all duration-500">
          {TOP_TICKER_MESSAGES[tickerIndex]}
        </div>
      </div>

      {/* ── Main Luxury Header ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e8e8e0] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-[#141410] hover:text-[#78786a] transition-colors"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            {/* Brand Logo */}
            <div className="flex items-center">
              <Link to="/" className="group flex items-center">
                <BrandLogo variant="horizontal" size={42} showTagline={true} />
              </Link>
            </div>

            {/* Desktop Navigation Links with Hover Mega-Menu */}
            <nav className="hidden lg:flex items-center space-x-7 h-full">
              {navCategories.map((cat) => (
                <div
                  key={cat.key}
                  onMouseEnter={() => handleMouseEnterNav(cat.key)}
                  onMouseLeave={handleMouseLeaveNav}
                  className="h-full flex items-center relative"
                >
                  <Link
                    to={cat.url}
                    className={`text-xs font-semibold uppercase tracking-[0.18em] transition-all flex items-center gap-1.5 py-2 ${
                      cat.isSale
                        ? "text-rose-600 font-bold hover:text-rose-800"
                        : "text-[#141410] hover:text-[#8e8e7e]"
                    }`}
                  >
                    <span>{cat.label}</span>
                    {cat.badge && (
                      <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded font-mono ${
                        cat.isSale ? "bg-rose-100 text-rose-700" : "bg-[#141410] text-white"
                      }`}>
                        {cat.badge}
                      </span>
                    )}
                    <ChevronDown size={11} className="opacity-50 group-hover:rotate-180 transition-transform" />
                  </Link>
                </div>
              ))}
            </nav>

            {/* Header Right Action Icons */}
            <div className="flex items-center space-x-4 sm:space-x-6">
              {/* Search Icon */}
              <button
                onClick={() => setSearchDrawerOpen(true)}
                className="p-1.5 text-[#141410] hover:text-[#78786a] transition-colors"
                title="Search Collection"
              >
                <Search size={20} />
              </button>

              {/* Wishlist Link */}
              <Link
                to="/products"
                className="hidden sm:block p-1.5 text-[#141410] hover:text-[#78786a] transition-colors"
                title="Wishlist"
              >
                <Heart size={20} />
              </Link>

              {/* User Account / Profile */}
              {isAuthenticated ? (
                <div className="relative group">
                  <Link
                    to={role === "admin" || role === "superadmin" ? "/admin" : "/profile"}
                    className="flex items-center gap-2 p-1.5 text-xs font-semibold uppercase tracking-wider text-[#141410] hover:text-[#78786a]"
                  >
                    <User size={20} />
                    <span className="hidden md:inline">{user?.fullname?.split(" ")[0] || "Account"}</span>
                  </Link>

                  {/* Dropdown menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-[#e8e8e0] rounded shadow-xl py-2 hidden group-hover:block z-50 animate-in fade-in">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-bold truncate">{user?.fullname}</p>
                      <p className="text-[10px] text-gray-500 font-mono capitalize">{role || "Customer"}</p>
                    </div>

                    {(role === "admin" || role === "superadmin") && (
                      <Link to="/admin" className="block px-4 py-2 text-xs font-bold text-[#7c3aed] hover:bg-gray-50">
                        ⚡ Seller Admin Portal
                      </Link>
                    )}

                    <Link to="/profile" className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50">
                      My Profile
                    </Link>
                    <Link to="/orders" className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50">
                      Order History & Tracking
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-gray-50 border-t border-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="p-1.5 text-xs font-semibold uppercase tracking-wider text-[#141410] hover:text-[#78786a] flex items-center gap-1.5"
                >
                  <User size={20} />
                  <span className="hidden md:inline">Sign In</span>
                </Link>
              )}

              {/* Shopping Bag Icon with counter badge */}
              <Link
                to="/cart"
                className="relative p-1.5 text-[#141410] hover:text-[#78786a] transition-colors"
                title="Shopping Bag"
              >
                <ShoppingBag size={21} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-[#141410] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-scale font-mono">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* ── Hover Mega Menu Content ── */}
        <div onMouseEnter={() => { if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current); }} onMouseLeave={handleMouseLeaveNav}>
          <MegaMenu activeCategory={activeMegaCategory} onClose={() => setActiveMegaCategory(null)} />
        </div>
      </header>

      {/* ── Fullscreen Search Drawer ── */}
      {searchDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center p-4 sm:p-8 animate-in fade-in">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 sm:p-8 shadow-2xl h-fit">
            <div className="flex items-center justify-between pb-4 border-b border-[#e8e8e0] mb-6">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#78786a]">Search Clothing Den Apparel</span>
              <button onClick={() => setSearchDrawerOpen(false)} className="p-1 text-gray-500 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="relative mb-6">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by fabric (Cambric, Lawn, Silk), color, or kurta..."
                className="w-full bg-[#f5f5f0] border border-[#e8e8e0] py-3.5 pl-12 pr-4 rounded-sm text-sm outline-none focus:border-[#141410]"
              />
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </form>

            {/* Popular Quick Searches */}
            <div className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Popular Eastern Searches</p>
              <div className="flex flex-wrap gap-2">
                {["Short Floral Kurta", "Printed Cambric", "Luxury Raw Silk", "Unstitched Festive Lawn", "2-Piece Co-Ords", "Lilac Pret", "Men's Giza Kurta"].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      navigate(`/products?search=${encodeURIComponent(term)}`);
                      setSearchDrawerOpen(false);
                    }}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-black hover:text-white rounded-full text-xs transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Sidebar Drawer ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 lg:hidden flex">
          <div className="bg-white w-4/5 max-w-sm h-full flex flex-col p-6 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                <BrandLogo variant="horizontal" size={34} showTagline={true} />
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-gray-500">
                <X size={20} />
              </button>
            </div>

            <nav className="space-y-4 flex-1">
              {navCategories.map((cat) => (
                <Link
                  key={cat.key}
                  to={cat.url}
                  className="block py-2 text-sm font-bold uppercase tracking-wider text-[#141410] hover:text-[#78786a] border-b border-gray-50"
                >
                  {cat.label}
                </Link>
              ))}
              <div className="pt-4 space-y-3 text-xs text-[#78786a]">
                <Link to="/about" className="block py-1 hover:text-black">Our Heritage & Craft</Link>
                <Link to="/contact" className="block py-1 hover:text-black">Store Locator & Support</Link>
                <Link to="/orders" className="block py-1 hover:text-black">Track Courier Parcel</Link>
              </div>
            </nav>

            <div className="pt-6 border-t border-gray-100">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full py-3 bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-wider rounded"
                >
                  Sign Out ({user?.fullname})
                </button>
              ) : (
                <Link
                  to="/login"
                  className="block w-full py-3 bg-[#141410] text-white text-center text-xs font-bold uppercase tracking-wider rounded"
                >
                  Customer Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Page Body ── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Comprehensive Pakistani Luxury Footer ── */}
      <footer className="bg-[#141410] text-[#f5f5f0] pt-16 pb-10 border-t border-[#2a2a22]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* 🌟 5-Pillar Interactive Luxury Trust & Policy Strip */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pb-12 border-b border-[#2e2e26]">
            {/* 1. Biker Express Delivery */}
            <button
              type="button"
              onClick={() => setActivePolicy("shipping")}
              className="p-4 bg-[#1c1c16] hover:bg-[#25251d] border border-[#2e2e26] hover:border-[#d4af37]/60 rounded-xl text-left transition-all group"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <Truck size={20} className="text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold font-mono bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                  4H RUSH
                </span>
              </div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-white">City Biker Fleet</h4>
              <p className="text-[11px] text-[#a0a090] mt-1 leading-snug">
                Same-day rider delivery in LHR, KHI & ISB. Nationwide 24–48h.
              </p>
            </button>

            {/* 2. Payment Security */}
            <button
              type="button"
              onClick={() => setActivePolicy("payment")}
              className="p-4 bg-[#1c1c16] hover:bg-[#25251d] border border-[#2e2e26] hover:border-[#d4af37]/60 rounded-xl text-left transition-all group"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <Lock size={20} className="text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                  256-BIT SSL
                </span>
              </div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-white">Secure Payments</h4>
              <p className="text-[11px] text-[#a0a090] mt-1 leading-snug">
                PCI-DSS Level 1. COD, Easypaisa, JazzCash & Cards.
              </p>
            </button>

            {/* 3. Privacy Protection */}
            <button
              type="button"
              onClick={() => setActivePolicy("privacy")}
              className="p-4 bg-[#1c1c16] hover:bg-[#25251d] border border-[#2e2e26] hover:border-[#d4af37]/60 rounded-xl text-left transition-all group"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <ShieldCheck size={20} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                  PROTECTED
                </span>
              </div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-white">Privacy Guarantee</h4>
              <p className="text-[11px] text-[#a0a090] mt-1 leading-snug">
                Zero data broker sharing. Encrypted customer contacts.
              </p>
            </button>

            {/* 4. Active Discount Vouchers */}
            <button
              type="button"
              onClick={() => setActivePolicy("vouchers")}
              className="p-4 bg-[#1c1c16] hover:bg-[#25251d] border border-[#2e2e26] hover:border-[#d4af37]/60 rounded-xl text-left transition-all group"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <Tag size={20} className="text-rose-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold font-mono bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded">
                  PROMOS
                </span>
              </div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-white">VIP Coupons</h4>
              <p className="text-[11px] text-[#a0a090] mt-1 leading-snug">
                Code <strong className="text-rose-300 font-mono">LUXURY10</strong> for 10% off + Festive vouchers.
              </p>
            </button>

            {/* 5. 7-Day Returns */}
            <button
              type="button"
              onClick={() => setActivePolicy("returns")}
              className="p-4 bg-[#1c1c16] hover:bg-[#25251d] border border-[#2e2e26] hover:border-[#d4af37]/60 rounded-xl text-left transition-all group col-span-2 md:col-span-1"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <RotateCcw size={20} className="text-[#d4af37] group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold font-mono bg-amber-500/20 text-[#d4af37] px-1.5 py-0.5 rounded">
                  7 DAYS
                </span>
              </div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-white">Doorstep Exchange</h4>
              <p className="text-[11px] text-[#a0a090] mt-1 leading-snug">
                Hassle-free size swaps via courier pickup at your door.
              </p>
            </button>
          </div>

          {/* 4 Footer Columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-[#2e2e26] text-xs">
            <div>
              <h5 className="font-serif text-sm font-bold uppercase tracking-[0.2em] text-[#d4af37] mb-4">
                Collections
              </h5>
              <ul className="space-y-2.5 text-[#b0b0a0]">
                <li><Link to="/products?category=ready-to-wear" className="hover:text-white transition-colors">Ready to Wear Pret</Link></li>
                <li><Link to="/products?category=unstitched-fabric" className="hover:text-white transition-colors">Unstitched Luxury Lawn</Link></li>
                <li><Link to="/products?category=luxury-pret" className="hover:text-white transition-colors">Raw Silk & Zari Ensembles</Link></li>
                <li><Link to="/products?category=festive-collection" className="hover:text-white transition-colors">Festive Collection 2026</Link></li>
                <li><Link to="/products?category=velvet-couture" className="hover:text-white transition-colors">Velvet & Shawls Couture</Link></li>
                <li><Link to="/products?category=bridal-trousseau" className="hover:text-white transition-colors">Bridal Trousseau Atelier</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-serif text-sm font-bold uppercase tracking-[0.2em] text-[#d4af37] mb-4">
                Policies & Protection
              </h5>
              <ul className="space-y-2.5 text-[#b0b0a0]">
                <li>
                  <button onClick={() => setActivePolicy("payment")} className="hover:text-[#d4af37] transition-colors text-left flex items-center gap-1.5">
                    <Lock size={12} className="text-amber-400" /> Payment Security & Multi-Gateways
                  </button>
                </li>
                <li>
                  <button onClick={() => setActivePolicy("privacy")} className="hover:text-[#d4af37] transition-colors text-left flex items-center gap-1.5">
                    <ShieldCheck size={12} className="text-emerald-400" /> Privacy & Consumer Data Rights
                  </button>
                </li>
                <li>
                  <button onClick={() => setActivePolicy("shipping")} className="hover:text-[#d4af37] transition-colors text-left flex items-center gap-1.5">
                    <Truck size={12} className="text-blue-400" /> Biker Fleet & Express Courier Shipping
                  </button>
                </li>
                <li>
                  <button onClick={() => setActivePolicy("vouchers")} className="hover:text-[#d4af37] transition-colors text-left flex items-center gap-1.5">
                    <Tag size={12} className="text-rose-400" /> Active Vouchers & Promo Rules
                  </button>
                </li>
                <li>
                  <button onClick={() => setActivePolicy("returns")} className="hover:text-[#d4af37] transition-colors text-left flex items-center gap-1.5">
                    <RotateCcw size={12} className="text-[#d4af37]" /> 7-Day Doorstep Exchange Policy
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-serif text-sm font-bold uppercase tracking-[0.2em] text-[#d4af37] mb-4">
                Our Atelier
              </h5>
              <ul className="space-y-2.5 text-[#b0b0a0]">
                <li><Link to="/about" className="hover:text-white transition-colors">About Clothing Den</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">Craftsmanship & Weaving</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">Sustainability & Pure Fibers</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Store Locator (Lahore, Karachi, Isb)</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Corporate & Bridal Gifting</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-serif text-sm font-bold uppercase tracking-[0.2em] text-[#d4af37] mb-4">
                VIP Concierge & Club
              </h5>
              <p className="text-[#a0a090] text-xs leading-relaxed mb-3">
                Subscribe for private invitations to seasonal lawn drops and exclusive discount codes.
              </p>
              <div className="p-3 bg-[#1c1c16] border border-[#2e2e26] rounded-lg mb-3">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-[#d4af37] font-bold">✨ Active Welcome Voucher:</span>
                  <span className="font-mono bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-bold">LUXURY10</span>
                </div>
                <p className="text-[10px] text-gray-400">Apply at checkout for flat 10% off your entire order!</p>
              </div>
              <p className="text-[11px] text-[#8e8e7e]">Customer Concierge: +92 (042) 111-727-744</p>
            </div>
          </div>

          {/* ── Official Multi-Gateway Payment Logos Footer Section ── */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#8e8e7e]">
            <div>
              <div className="flex items-center gap-2 mb-3 justify-center md:justify-start">
                <Lock size={13} className="text-[#d4af37]" />
                <p className="text-[11px] uppercase font-bold tracking-widest text-[#a0a090]">
                  Verified Multi-Channel Payment Partners (256-Bit SSL Encrypted)
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <CODLogo />
                <EasypaisaLogo />
                <JazzCashLogo />
                <BankTransferLogos />
                <CardLogos />
                <GooglePayLogo />
                <ApplePayLogo />
                <SadaPayLogo />
              </div>
            </div>

            <div className="text-center md:text-right text-[11px]">
              <p className="text-gray-300 font-semibold">© 2026 CLOTHING DEN RETAIL PVT LTD. All Rights Reserved.</p>
              <p className="text-gray-500 mt-1">Fashion That Speaks — Eastern Couture & Contemporary Silhouettes.</p>
            </div>
          </div>

        </div>
      </footer>

      {/* ── Interactive Footer Policy Document Modal ── */}
      <FooterPolicyModal policyType={activePolicy} onClose={() => setActivePolicy(null)} />

      {/* ── Floating AI Haute Couture Virtual Stylist ── */}
      <AIStylistModal />

    </div>
  );
}