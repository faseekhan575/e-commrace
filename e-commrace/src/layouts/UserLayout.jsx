import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useRef } from "react";
import { logoutUser } from "../store/authSlice";
import {
  ShoppingBag, User, Search, Menu, X, Heart,
  ShieldCheck, Truck, RotateCcw, Phone, Sparkles,
  ChevronDown, ArrowRight, ChevronRight, Check, SlidersHorizontal
} from "lucide-react";
import {
  EasypaisaLogo, JazzCashLogo, BankTransferLogos,
  CardLogos, GooglePayLogo, ApplePayLogo, CODLogo, SadaPayLogo
} from "../components/PaymentLogos";
import MegaMenu from "../components/MegaMenu";
import BrandLogo from "../components/BrandLogo";
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
  const megaMenuTimeoutRef = useRef(null);

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  // Rotate announcement ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % TOP_TICKER_MESSAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

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
    { key: "menswear", label: "Men's Kurta", url: "/products?category=mens-kurta" },
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
      <footer className="bg-[#141410] text-[#f5f5f0] pt-16 pb-8 border-t border-[#2a2a22]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Guarantee Badges Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-[#2e2e26] text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <Truck size={28} className="text-[#d4af37] flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-white">Nationwide Express Delivery</h4>
                <p className="text-xs text-[#a0a090] mt-0.5">Dispatched within 24-48 hours across all Pakistani cities.</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-4">
              <ShieldCheck size={28} className="text-[#d4af37] flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-white">100% Pure Fabric Authentic</h4>
                <p className="text-xs text-[#a0a090] mt-0.5">Finest combed Egyptian cotton, raw silk & swiss voiles.</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-4">
              <RotateCcw size={28} className="text-[#d4af37] flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-white">7-Day Hassle Free Returns</h4>
                <p className="text-xs text-[#a0a090] mt-0.5">Complimentary size and fabric exchange in-store or online.</p>
              </div>
            </div>
          </div>

          {/* 4 Footer Columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-[#2e2e26] text-xs">
            <div>
              <h5 className="font-serif text-sm font-bold uppercase tracking-[0.2em] text-[#d4af37] mb-4">
                Collections
              </h5>
              <ul className="space-y-2.5 text-[#b0b0a0]">
                <li><Link to="/products?category=ready-to-wear" className="hover:text-white transition-colors">Ready to Wear Pret</Link></li>
                <li><Link to="/products?category=unstitched-lawn" className="hover:text-white transition-colors">Unstitched Luxury Lawn</Link></li>
                <li><Link to="/products?category=luxury-pret" className="hover:text-white transition-colors">Festive Silk & Velvet</Link></li>
                <li><Link to="/products?category=mens-kurta" className="hover:text-white transition-colors">Men's Kurta & Waistcoats</Link></li>
                <li><Link to="/products" className="hover:text-white transition-colors">Signature Cambric Daily</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-serif text-sm font-bold uppercase tracking-[0.2em] text-[#d4af37] mb-4">
                Customer Care
              </h5>
              <ul className="space-y-2.5 text-[#b0b0a0]">
                <li><Link to="/contact" className="hover:text-white transition-colors">Order Tracking</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Shipping & Delivery Rates</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Exchanges & Return Policy</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Store Locator (Lahore, Karachi, Isb)</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Custom Tailoring Inquiries</Link></li>
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
                <li><Link to="/contact" className="hover:text-white transition-colors">Careers & Internships</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Corporate Gifting</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-serif text-sm font-bold uppercase tracking-[0.2em] text-[#d4af37] mb-4">
                Contact & VIP Club
              </h5>
              <p className="text-[#a0a090] text-xs leading-relaxed mb-4">
                Subscribe to Clothing Den for private invitations to seasonal drops and VIP previews.
              </p>
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-[#22221b] border border-[#3e3e32] px-3 py-2 rounded text-xs text-white outline-none focus:border-[#d4af37] flex-1"
                />
                <button className="px-3.5 py-2 bg-[#d4af37] text-black font-bold text-xs uppercase tracking-wider rounded hover:bg-white transition-colors">
                  Join
                </button>
              </div>
              <p className="text-[11px] text-[#8e8e7e]">UAN: +92 (042) 111-727-744</p>
            </div>
          </div>

          {/* ── Official Multi-Gateway Payment Logos Footer Section ── */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#8e8e7e]">
            <div>
              <p className="text-[11px] uppercase font-bold tracking-widest text-[#a0a090] mb-3 text-center md:text-left">
                Verified Multi-Channel Payment Partners
              </p>
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
              <p>© 2026 CLOTHING DEN RETAIL PVT LTD. All Rights Reserved.</p>
              <p className="text-gray-500 mt-1">Fashion That Speaks — Eastern Couture & Contemporary Silhouettes.</p>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}