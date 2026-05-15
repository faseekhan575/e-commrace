import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { logoutUser } from "../store/authSlice";
import { ShoppingBag, Menu, X, User, LogOut, Package, Home, Info, Phone, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

export default function UserLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, role } = useSelector((s) => s.auth);
  const { items } = useSelector((s) => s.cart);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success("Logged out");
    navigate("/");
  };

  const navLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/products", label: "Shop", icon: ShoppingBag },
    { to: "/about", label: "About", icon: Info },
    { to: "/contact", label: "Contact", icon: Phone },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#1a1a14] font-body flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#fafaf8]/90 backdrop-blur-md border-b border-[#e8e8e0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 relative flex items-end justify-center">
                <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-[#1a1a14] group-hover:border-b-[#78786a] transition-colors duration-300" />
              </div>
              <span className="font-display font-700 text-xl tracking-wider text-[#1a1a14]">VAULT</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`text-sm font-medium tracking-wide transition-colors duration-200 relative group ${
                    isActive(to) ? "text-[#1a1a14]" : "text-[#78786a] hover:text-[#1a1a14]"
                  }`}
                >
                  {label}
                  <span className={`absolute -bottom-1 left-0 h-[1px] bg-[#1a1a14] transition-all duration-300 ${isActive(to) ? "w-full" : "w-0 group-hover:w-full"}`} />
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Cart */}
              {isAuthenticated && (
                <Link to="/cart" className="relative p-2 hover:bg-[#f0f0e8] rounded-full transition-colors">
                  <ShoppingBag size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#1a1a14] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Auth */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#e8e8e0] hover:border-[#a8a898] transition-colors text-sm"
                  >
                    {user?.avatar?.url ? (
                      <img src={user.avatar.url} className="w-6 h-6 rounded-full object-cover" alt="" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-[#e8e8e0] flex items-center justify-center">
                        <User size={12} />
                      </div>
                    )}
                    <span className="font-medium hidden sm:block">{user?.fullname?.split(" ")[0]}</span>
                    <ChevronDown size={14} className={`transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-[#e8e8e0] rounded-xl shadow-lg py-1 z-50">
                      <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[#f5f5f0] transition-colors">
                        <User size={14} /> Profile
                      </Link>
                      <Link to="/orders" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[#f5f5f0] transition-colors">
                        <Package size={14} /> My Orders
                      </Link>
                      {(role === "admin" || role === "superadmin") && (
                        <Link
                          to={role === "superadmin" ? "/superadmin" : "/admin"}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[#f5f5f0] transition-colors text-amber-700 font-medium"
                        >
                          ⚙ Admin Panel
                        </Link>
                      )}
                      <hr className="my-1 border-[#e8e8e0]" />
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[#f5f5f0] transition-colors text-red-600">
                        <LogOut size={14} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="text-sm font-medium px-4 py-2 rounded-full border border-[#e8e8e0] hover:border-[#a8a898] transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="text-sm font-medium px-4 py-2 rounded-full bg-[#1a1a14] text-white hover:bg-[#3c3c30] transition-colors">
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile Menu */}
              <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2">
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden border-t border-[#e8e8e0] bg-[#fafaf8] px-4 py-4 flex flex-col gap-3">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 py-2 text-sm font-medium ${isActive(to) ? "text-[#1a1a14]" : "text-[#78786a]"}`}>
                <Icon size={16} /> {label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#141410] text-[#a8a898] mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[17px] border-b-white" />
                <span className="font-display font-700 text-xl text-white tracking-wider">VAULT</span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs">
                Premium products, curated for those who demand the best. Every item in Vault is selected with intention.
              </p>
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold mb-4 tracking-wider uppercase">Shop</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold mb-4 tracking-wider uppercase">Account</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/profile" className="hover:text-white transition-colors">Profile</Link></li>
                <li><Link to="/orders" className="hover:text-white transition-colors">Orders</Link></li>
                <li><Link to="/cart" className="hover:text-white transition-colors">Cart</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#3c3c30] mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
            <p>© 2026 Vault. All rights reserved.</p>
            <p>Built with precision.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}