import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useRef } from "react";
import { logoutUser } from "../store/authSlice";
import { fetchCategories } from "../store/productsSlice";
import {
  ShoppingBag, User, Search, Menu, X, Heart,
  ShieldCheck, Truck, RotateCcw, Phone, Sparkles,
  ChevronDown, ArrowRight, ChevronRight, Check,
  Lock, Tag, FileText, BadgePercent, MessageSquare,
  HelpCircle, ExternalLink, Mail, MapPin, Clock
} from "lucide-react";
import {
  EasypaisaLogo, JazzCashLogo, BankTransferLogos,
  VisaLogo, MastercardLogo, CODLogo, SadaPayLogo, NayaPayLogo
} from "../components/PaymentLogos";
import MegaMenu from "../components/MegaMenu";
import BrandLogo from "../components/BrandLogo";
import AIStylistModal from "../components/AIStylistModal";
import FooterPolicyModal from "../components/FooterPolicyModal";
import CartDrawer from "../components/CartDrawer";
import WishlistDrawer from "../components/WishlistDrawer";
import HeaderSearchModal from "../components/HeaderSearchModal";
import toast from "react-hot-toast";

const TOP_TICKER_MESSAGES = [
  "✨ FREE NATIONWIDE EXPRESS SHIPPING ON ALL ORDERS ABOVE PKR 5,000",
  "🌸 NEW ARRIVALS: FESTIVE LAWN & LUXURY PRET COLLECTION '26 LIVE NOW",
  "💳 MULTI-PAYMENT: CASH ON DELIVERY, EASYPAISA, JAZZCASH, IBFT & CARDS ACCEPTED",
  "👗 7-DAY EASY SIZE & STYLE EXCHANGES ACROSS ALL OUTLETS IN PAKISTAN",
];

export default function UserLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, user, role } = useSelector((s) => s.auth);
  const { items } = useSelector((s) => s.cart);
  const { items: wishlistItems } = useSelector((s) => s.wishlist);
  const { categories: serverCategories } = useSelector((s) => s.products);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [wishlistDrawerOpen, setWishlistDrawerOpen] = useState(false);

  const [tickerIndex, setTickerIndex] = useState(0);
  const [activeMegaCategory, setActiveMegaCategory] = useState(null);
  const [activePolicy, setActivePolicy] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const megaMenuTimeoutRef = useRef(null);

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const wishlistCount = wishlistItems ? wishlistItems.length : 0;

  // Fetch categories on mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Rotate announcement ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % TOP_TICKER_MESSAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Close menus on page route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchModalOpen(false);
    setActiveMegaCategory(null);
  }, [location.pathname, location.search]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) { toast.error(typeof error === "string" ? error : "Could not log out. Please try again."); }
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

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setNewsletterSubscribed(true);
    toast.success("Welcome to Clothing Den VIP Club! Check email for 10% coupon.", {
      icon: "✨",
      style: { background: "#141410", color: "#fff", fontSize: "12px" },
    });
  };

  // Build dynamic navigation categories combining backend categories with signature edits
  const dynamicNavCategories = [
    { key: "products", label: "Products", url: "/products" },
    ...(serverCategories || []).slice(0, 4).map((category) => ({
      key: category.slug || category._id,
      label: category.name,
      url: `/products?category=${encodeURIComponent(category.slug || category._id)}`,
    })),
    { key: "special-offers", label: "Special Offers", url: "/products?sale=true", isSale: true },
  ];

  return (
    <div className={`${location.pathname !== "/" ? "store-secondary-layout" : ""} min-h-screen flex flex-col bg-[#fafaf8] text-[#141410] font-sans selection:bg-[#141410] selection:text-white`}>

      {/* ── Top Announcement Ticker Bar ── */}
      <div className="bg-[#141410] text-[#f5f5f0] text-[10px] sm:text-[11px] font-medium tracking-[0.2em] uppercase py-2 px-4 text-center overflow-hidden flex items-center justify-center relative z-40 border-b border-[#252520]">
        <div className="animate-in fade-in duration-500 truncate max-w-4xl">
          {TOP_TICKER_MESSAGES[tickerIndex]}
        </div>
      </div>

      {/* ── Main Luxury Header ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#e8e8e0] shadow-xs transition-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-[#141410] hover:text-[#78786a] transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu size={24} />
            </button>

            {/* Brand Logo */}
            <div className="storefront-brand flex items-center">
              <Link to="/" className="group flex items-center">
                <BrandLogo variant="horizontal" size={42} showTagline={true} />
              </Link>
            </div>

            {/* Desktop Navigation Links with Mega-Menu Trigger */}
            <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6 h-full">
              {dynamicNavCategories.map((cat) => (
                <div
                  key={cat.key}
                  onMouseEnter={() => handleMouseEnterNav(cat.key)}
                  onFocus={() => handleMouseEnterNav(cat.key)}
                  onKeyDown={(event) => { if (event.key === "Escape") setActiveMegaCategory(null); }}
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
            <div className="storefront-actions flex items-center space-x-3 sm:space-x-5">
              
              {/* Search Trigger Button */}
              <button
                onClick={() => setSearchModalOpen(true)}
                className="p-2 text-[#141410] hover:text-[#78786a] transition-colors rounded-full hover:bg-gray-100"
                title="Search Collection (Press /)"
                aria-label="Search Collection"
              >
                <Search size={20} />
              </button>

              {/* Wishlist Link with Live Badge */}
              <button
                onClick={() => setWishlistDrawerOpen(true)}
                className="relative p-2 text-[#141410] hover:text-[#78786a] transition-colors rounded-full hover:bg-gray-100"
                title="View Saved Wishlist"
                aria-label="Wishlist"
              >
                <Heart size={20} className={wishlistCount > 0 ? "text-rose-600 fill-rose-50" : ""} />
                {wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold font-mono flex items-center justify-center animate-in zoom-in-50">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* User Account / Profile */}
              {isAuthenticated ? (
                <div className="relative group">
                  <Link
                    to={role === "admin" || role === "superadmin" ? "/admin" : "/profile"}
                    className="flex items-center gap-1.5 p-1.5 text-xs font-semibold uppercase tracking-wider text-[#141410] hover:text-[#78786a] rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#141410] text-white flex items-center justify-center text-xs font-bold font-mono">
                      {user?.fullname?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <span className="hidden md:inline text-xs font-bold">
                      {user?.fullname?.split(" ")[0] || "Account"}
                    </span>
                    <ChevronDown size={12} className="opacity-60 hidden md:inline" />
                  </Link>

                  {/* Dropdown menu */}
                  <div className="absolute right-0 mt-1 w-52 bg-white border border-[#e8e8e0] rounded shadow-2xl py-2 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/50">
                      <p className="text-xs font-bold text-[#141410] truncate">{user?.fullname}</p>
                      <p className="text-[10px] text-gray-500 font-mono truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 bg-gray-200 text-[9px] font-mono font-bold uppercase rounded text-gray-700">
                        {role || "Customer"}
                      </span>
                    </div>

                    {(role === "admin" || role === "superadmin") && (
                      <Link to="/admin" className="block px-4 py-2 text-xs font-bold text-[#7c3aed] hover:bg-purple-50">
                        ⚡ Seller Admin Portal
                      </Link>
                    )}

                    <Link to="/profile" className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">
                      My Profile & Address Book
                    </Link>
                    <Link to="/orders" className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">
                      Order History & Tracking
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 border-t border-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="p-1.5 text-xs font-semibold uppercase tracking-wider text-[#141410] hover:text-[#78786a] flex items-center gap-1.5 rounded-sm hover:bg-gray-100 transition-colors"
                >
                  <User size={20} />
                  <span className="hidden md:inline">Sign In</span>
                </Link>
              )}

              {/* Shopping Bag Trigger with Live Counter & Slide-over Drawer */}
              <button
                onClick={() => setCartDrawerOpen(true)}
                className="relative p-2 text-[#141410] hover:text-[#78786a] transition-colors rounded-full hover:bg-gray-100"
                title="View Bag"
                aria-label="Shopping Bag"
              >
                <ShoppingBag size={21} />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[#141410] text-[#f5f5f0] text-[9px] font-bold font-mono flex items-center justify-center animate-in zoom-in-50">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mega Menu Dropdown */}
        <MegaMenu
          activeCategory={activeMegaCategory}
          onMouseEnter={() => {
            if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
          }}
          onMouseLeave={handleMouseLeaveNav}
        />
      </header>

      {/* ── Mobile Side Navigation Drawer ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden animate-in fade-in duration-200">
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          <div className="absolute inset-y-0 left-0 max-w-full flex pr-10">
            <div className="w-screen max-w-xs bg-white shadow-2xl flex flex-col justify-between">
              
              {/* Drawer Header */}
              <div className="p-4 border-b border-[#e8e8e0] flex items-center justify-between bg-[#fafaf8]">
                <BrandLogo variant="horizontal" size={32} showTagline={false} />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-gray-500 hover:text-black rounded-full"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Search */}
              <div className="p-4 border-b border-[#e8e8e0]">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSearchModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-[#f4f4ee] rounded text-xs text-gray-500 hover:text-black"
                >
                  <span className="flex items-center gap-2">
                    <Search size={15} /> Search styles, fabrics...
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-white px-1.5 py-0.5 rounded border border-gray-200">
                    Search
                  </span>
                </button>
              </div>

              {/* Drawer Links */}
              <div className="flex-1 overflow-y-auto p-4 divide-y divide-gray-100">
                <div className="space-y-1 pb-4">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#78786a] px-3 py-1">
                    Featured Collections
                  </p>
                  <Link
                    to="/products"
                    className="block px-3 py-2 rounded text-xs font-bold uppercase tracking-wider text-[#141410] hover:bg-gray-50"
                  >
                    All Collections ({serverCategories?.length || 5}+)
                  </Link>
                  {dynamicNavCategories.map((c) => (
                    <Link
                      key={c.key}
                      to={c.url}
                      className={`flex items-center justify-between px-3 py-2 rounded text-xs font-semibold uppercase tracking-wider ${
                        c.isSale ? "text-rose-600 font-bold" : "text-[#141410] hover:bg-gray-50"
                      }`}
                    >
                      <span>{c.label}</span>
                      {c.badge && (
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded font-mono ${
                          c.isSale ? "bg-rose-100 text-rose-700" : "bg-black text-white"
                        }`}>
                          {c.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>

                <div className="space-y-1 py-4">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#78786a] px-3 py-1">
                    Client Services
                  </p>
                  <Link
                    to="/orders"
                    className="block px-3 py-2 rounded text-xs text-gray-700 hover:bg-gray-50"
                  >
                    📦 Track My Order
                  </Link>
                  <Link
                    to="/about"
                    className="block px-3 py-2 rounded text-xs text-gray-700 hover:bg-gray-50"
                  >
                    🏛️ Heritage & Craftsmanship
                  </Link>
                  <Link
                    to="/contact"
                    className="block px-3 py-2 rounded text-xs text-gray-700 hover:bg-gray-50"
                  >
                    💬 Concierge & Boutiques
                  </Link>
                </div>
              </div>

              {/* Drawer Footer / Account */}
              <div className="p-4 bg-[#fafaf8] border-t border-[#e8e8e0]">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-[#141410]">
                      Signed in as <span className="font-mono">{user?.fullname}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to="/profile"
                        className="text-center py-2 bg-white border border-gray-200 text-xs font-bold uppercase tracking-wider rounded text-[#141410]"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="py-2 bg-rose-50 border border-rose-200 text-xs font-bold uppercase tracking-wider rounded text-rose-700"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      className="text-center py-2.5 bg-[#141410] text-white text-xs font-bold uppercase tracking-wider rounded"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="text-center py-2.5 bg-white border border-[#141410] text-[#141410] text-xs font-bold uppercase tracking-wider rounded"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Page Content Outlet ── */}
      <main className="flex-grow">
        <Outlet context={{ onOpenCart: () => setCartDrawerOpen(true) }} />
      </main>

      {/* ── Premium E-Commerce Footer ── */}
      <footer className="bg-[#141410] text-[#f5f5f0] border-t border-[#252520]">
        
        {/* 1. Value Pillars Strip */}
        <div className="border-b border-white/10 bg-[#191914]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#d4af37] flex-shrink-0">
                  <Truck size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Free Express Shipping
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Nationwide on orders over PKR 5,000 via TCS
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#d4af37] flex-shrink-0">
                  <RotateCcw size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    7-Day Easy Exchange
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Hassle-free size & design exchanges nationwide
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#d4af37] flex-shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    100% Authentic Fabric
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Pure luxury lawn, raw silk, and cambric
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#d4af37] flex-shrink-0">
                  <Lock size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Secure 256-Bit Checkout
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Cash on Delivery & instant digital payments
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Main Footer Links & Newsletter */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
            
            {/* Brand Intro & Newsletter (4 cols) */}
            <div className="lg:col-span-4 space-y-5">
              <Link to="/" className="inline-block">
                <BrandLogo variant="horizontal" size={44} showTagline={true} />
              </Link>
              <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
                Clothing Den celebrates Pakistan&apos;s rich textile heritage through artisanal craftsmanship, contemporary pret, and luxury unstitched lawn tailored for the modern silhouette.
              </p>

              {/* VIP Newsletter Join */}
              <div className="pt-2">
                <p className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#d4af37] mb-2 flex items-center gap-1.5">
                  <Sparkles size={13} /> Join The VIP Club
                </p>
                <p className="text-[11px] text-gray-400 mb-3">
                  Receive private access to seasonal lawn drops and a 10% coupon on your first order.
                </p>

                {newsletterSubscribed ? (
                  <div className="p-3 bg-white/10 rounded border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
                    <Check size={14} /> Subscribed! Use promo code <strong className="text-white">CLOTHINGDEN10</strong> at checkout.
                  </div>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="bg-white/5 border border-white/20 rounded text-xs px-3.5 py-2.5 text-white placeholder-gray-500 outline-none focus:border-[#d4af37] flex-1"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-[#d4af37] hover:bg-[#bfa030] text-black font-bold text-xs uppercase tracking-wider rounded transition-colors"
                    >
                      Join
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Collections Links (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-[#d4af37]">
                Collections
              </h4>
              <ul className="space-y-2.5 text-xs text-gray-400">
                <li>
                  <Link to="/products?category=ready-to-wear" className="hover:text-white transition-colors">
                    Ready to Wear Pret
                  </Link>
                </li>
                <li>
                  <Link to="/products?category=unstitched-lawn" className="hover:text-white transition-colors">
                    Unstitched Lawn &apos;26
                  </Link>
                </li>
                <li>
                  <Link to="/products?category=luxury-pret" className="hover:text-white transition-colors">
                    Luxury Formals & Silk
                  </Link>
                </li>
                <li>
                  <Link to="/products?search=velvet" className="hover:text-white transition-colors">
                    Velvet & Festive Edit
                  </Link>
                </li>
                <li>
                  <Link to="/products?search=sale" className="text-rose-400 hover:text-rose-300 transition-colors font-semibold">
                    Special Offers & Sale
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="hover:text-white transition-colors">
                    Explore All Apparel
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Care & Policies (3 cols) */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-[#d4af37]">
                Customer Experience
              </h4>
              <ul className="space-y-2.5 text-xs text-gray-400">
                <li>
                  <Link to="/orders" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <span>Track Your Order</span>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => setActivePolicy("exchange")}
                    className="hover:text-white transition-colors text-left"
                  >
                    Exchange & Return Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePolicy("shipping")}
                    className="hover:text-white transition-colors text-left"
                  >
                    Shipping & Delivery Timelines
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePolicy("terms")}
                    className="hover:text-white transition-colors text-left"
                  >
                    Terms & Privacy Policy
                  </button>
                </li>
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">
                    Our Craft & Heritage
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white transition-colors">
                    Store Locator & Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Flagship Boutiques & Concierge (3 cols) */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-[#d4af37]">
                Concierge Care
              </h4>
              <div className="space-y-3 text-xs text-gray-400">
                <div className="flex items-start gap-2.5">
                  <Phone size={14} className="text-[#d4af37] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-white font-medium">+92 42 111-256-844</span>
                    <p className="text-[10px] text-gray-500">Mon – Sat: 9:00 AM – 9:00 PM PKT</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Mail size={14} className="text-[#d4af37] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-white font-medium">concierge@clothingden.pk</span>
                    <p className="text-[10px] text-gray-500">24/7 Dedicated Client Support</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin size={14} className="text-[#d4af37] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-white font-medium">Flagship Emporium</span>
                    <p className="text-[10px] text-gray-500">M.M. Alam Road, Gulberg III, Lahore, Pakistan</p>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href="https://wa.me/923000000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] rounded-xs text-[11px] font-bold hover:bg-[#25D366]/30 transition-colors"
                  >
                    <span>💬 Chat on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Genuine Supported Payment Logos & Delivery Partners */}
        <div className="border-t border-white/10 py-6 bg-[#0f0f0c]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              
              {/* Payment Methods */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400">
                  Accepted Payments:
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <CODLogo className="h-7 scale-90" />
                  <EasypaisaLogo className="h-7 scale-90" />
                  <JazzCashLogo className="h-7 scale-90" />
                  <VisaLogo className="h-7 scale-90" />
                  <MastercardLogo className="h-7 scale-90" />
                  <SadaPayLogo className="h-7 scale-90" />
                </div>
              </div>

              {/* Delivery Couriers */}
              <div className="flex items-center gap-3 text-[11px] text-gray-400 font-mono">
                <span>Nationwide Logistics:</span>
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded">TCS</span>
                  <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded">Leopard</span>
                  <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded">Trax</span>
                  <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded">PostEx</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Copyright Bar */}
        <div className="border-t border-white/10 py-5 bg-[#0a0a08] text-[11px] text-gray-500 font-mono">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              © {new Date().getFullYear()} Clothing Den (Pvt.) Ltd. All Rights Reserved. Crafted with pride in Pakistan.
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActivePolicy("privacy")}
                className="hover:text-gray-300 transition-colors"
              >
                Privacy Policy
              </button>
              <span>•</span>
              <button
                onClick={() => setActivePolicy("terms")}
                className="hover:text-gray-300 transition-colors"
              >
                Terms of Service
              </button>
              <span>•</span>
              <button
                onClick={() => setActivePolicy("shipping")}
                className="hover:text-gray-300 transition-colors"
              >
                Delivery Guide
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
      />

      {/* Slide-over Wishlist Drawer */}
      <WishlistDrawer
        isOpen={wishlistDrawerOpen}
        onClose={() => setWishlistDrawerOpen(false)}
        onOpenCart={() => setCartDrawerOpen(true)}
      />

      {/* Header Smart Search Modal */}
      <HeaderSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />

      {/* Footer Policy Modal */}
      <FooterPolicyModal
        activePolicy={activePolicy}
        onClose={() => setActivePolicy(null)}
      />
    </div>
  );
}