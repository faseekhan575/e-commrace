import { useEffect, useRef } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearSession, fetchProfile, sessionTokenRefreshed } from "./store/authSlice";
import { mergeGuestCart, resetCart } from "./store/cartSlice";
import { clearWishlist } from "./store/wishlistSlice";
import CommerceRealtime from "./components/CommerceRealtime";
import toast from "react-hot-toast";

// Layouts
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerifyOtpPage from "./pages/auth/VerifyOtpPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// User Pages
import HomePage from "./pages/user/HomePage";
import ProductsPage from "./pages/user/ProductsPage";
import ProductDetailPage from "./pages/user/ProductDetailPage";
import CartPage from "./pages/user/CartPage";
import CheckoutPage from "./pages/user/CheckoutPage";
import OrdersPage from "./pages/user/OrdersPage";
import ProfilePage from "./pages/user/ProfilePage";
import AboutPage from "./pages/user/AboutPage";
import ContactPage from "./pages/user/ContactPage";

// Unified Admin Pages (Packed with ALL SuperAdmin & Daraz capabilities)
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import AdminCreateProduct from "./pages/admin/AdminCreateProduct";
import AdminEditProduct from "./pages/admin/AdminEditProduct";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminSpotlight from "./pages/admin/AdminSpotlight";
import AdminReviews from "./pages/admin/AdminReviews";

// Transition
import PageTransition from "./components/PageTransition";

/* â”€â”€â”€ Guards â”€â”€â”€ */
function SessionLoading() {
  return <div className="min-h-[65vh] grid place-items-center bg-[#fafaf8]" role="status"><div className="flex items-center gap-3 text-sm text-stone-600"><span className="w-5 h-5 rounded-full border-2 border-stone-200 border-t-stone-700 animate-spin" />Checking your session...</div></div>;
}
function SessionError() {
  const dispatch = useDispatch();
  const error = useSelector((state) => state.auth.sessionError);
  return <div className="min-h-[65vh] grid place-items-center bg-[#fafaf8] p-6"><div className="max-w-sm text-center"><h1 className="font-serif text-2xl mb-3">We could not check your session</h1><p className="text-sm text-stone-600 mb-6">{error || "Please check your connection and try again."}</p><button onClick={() => dispatch(fetchProfile())} className="rounded-xl bg-stone-900 px-6 py-3 text-sm font-medium text-white">Try again</button></div></div>;
}
function RequireAuth({ children }) {
  const { isAuthenticated, initialized, sessionStatus } = useSelector((state) => state.auth);
  const location = useLocation();
  if (!initialized || sessionStatus === "checking") return <SessionLoading />;
  if (sessionStatus === "error" && !isAuthenticated) return <SessionError />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}
function RequireAdmin({ children }) {
  const { isAuthenticated, initialized, sessionStatus, role } = useSelector((state) => state.auth);
  const location = useLocation();
  if (!initialized || sessionStatus === "checking") return <SessionLoading />;
  if (sessionStatus === "error" && !isAuthenticated) return <SessionError />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (role !== "admin" && role !== "superadmin") return <Navigate to="/" replace />;
  return children;
}
function GuestOnly({ children }) {
  const { isAuthenticated, initialized, role } = useSelector((state) => state.auth);
  const location = useLocation();
  if (!initialized) return <SessionLoading />;
  if (isAuthenticated) {
    const from = location.state?.from;
    const returnPath = from?.pathname?.startsWith("/") && !from.pathname.startsWith("//") ? `${from.pathname}${from.search || ""}${from.hash || ""}` : "/";
    return <Navigate to={role === "admin" || role === "superadmin" ? "/admin" : returnPath.startsWith("/admin") ? "/" : returnPath} replace />;
  }
  return children;
}

export default function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const userId = isAuthenticated ? (user?._id || user?.id) : null;
  const previousUserId = useRef(null);
  useEffect(() => {
    const expired = () => dispatch(clearSession());
    const refreshed = (event) => dispatch(sessionTokenRefreshed(event.detail?.token));
    const externalSessionChange = (event) => {
      if (event.key === "accessToken" && event.newValue === null) dispatch(clearSession());
      else if (event.key === "accessToken") dispatch(fetchProfile());
    };
    window.addEventListener("session:expired", expired);
    window.addEventListener("session:refreshed", refreshed);
    window.addEventListener("storage", externalSessionChange);
    dispatch(fetchProfile());
    return () => {
      window.removeEventListener("session:expired", expired);
      window.removeEventListener("session:refreshed", refreshed);
      window.removeEventListener("storage", externalSessionChange);
    };
  }, [dispatch]);
  useEffect(() => {
    if (previousUserId.current === userId) return;
    if (previousUserId.current) {
      dispatch(resetCart());
      dispatch(clearWishlist());
    }
    previousUserId.current = userId;
    if (userId) dispatch(mergeGuestCart()).unwrap().catch((error) => toast.error(typeof error === "string" ? error : "Your saved bag could not be loaded. Please retry from your bag."));
  }, [dispatch, userId]);
  return (
    <>
      <PageTransition />
      <CommerceRealtime>
      <Routes>
        {/* Auth */}
        <Route path="/login"           element={<GuestOnly><LoginPage /></GuestOnly>} />
        <Route path="/register"        element={<GuestOnly><RegisterPage /></GuestOnly>} />
        <Route path="/verify-otp"      element={<VerifyOtpPage />} />
        <Route path="/forgot-password" element={<GuestOnly><ForgotPasswordPage /></GuestOnly>} />
        <Route path="/reset-password"  element={<GuestOnly><ResetPasswordPage /></GuestOnly>} />

        {/* User Front-Store Routes */}
        <Route path="/" element={<UserLayout />}>
          <Route index                element={<HomePage />} />
          <Route path="products"      element={<ProductsPage />} />
          <Route path="product"       element={<Navigate to="/products" replace />} />
          <Route path="shop"          element={<Navigate to="/products" replace />} />
          <Route path="collections"   element={<Navigate to="/products" replace />} />
          <Route path="collection"    element={<Navigate to="/products" replace />} />
          <Route path="catalog"       element={<Navigate to="/products" replace />} />
          <Route path="products/:id"  element={<ProductDetailPage />} />
          <Route path="product/:id"   element={<ProductDetailPage />} />
          <Route path="about"         element={<AboutPage />} />
          <Route path="contact"       element={<ContactPage />} />
          <Route path="cart"          element={<CartPage />} />
          <Route path="checkout"      element={<CheckoutPage />} />
          <Route path="orders"        element={<RequireAuth><OrdersPage /></RequireAuth>} />
          <Route path="orders/:orderId" element={<RequireAuth><OrdersPage /></RequireAuth>} />
          <Route path="profile"       element={<RequireAuth><ProfilePage /></RequireAuth>} />
        </Route>

        {/* â”€â”€ Single Unified Admin Portal (All Capabilities) â”€â”€ */}
        <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route index                             element={<AdminDashboard />} />
          <Route path="products"                   element={<AdminProducts />} />
          <Route path="products/create"            element={<AdminCreateProduct />} />
          <Route path="products/:id/edit"          element={<AdminEditProduct />} />
          <Route path="products/edit/:id"          element={<AdminEditProduct />} />
          <Route path="banners"                    element={<AdminBanners />} />
          <Route path="spotlight"                  element={<AdminSpotlight />} />
          <Route path="orders"                     element={<AdminOrders />} />
          <Route path="orders/:id"                 element={<AdminOrderDetail />} />
          <Route path="categories"                 element={<AdminCategories />} />
          <Route path="users"                      element={<AdminUsers />} />
          <Route path="reviews"                    element={<AdminReviews />} />
          <Route path="store"                      element={<ProductsPage />} />
          <Route path="store/:id"                  element={<ProductDetailPage />} />
          <Route path="profile"                    element={<ProfilePage />} />
        </Route>

        {/* Automatic redirect from any legacy /superadmin paths directly to /admin */}
        <Route path="/superadmin/*" element={<Navigate to="/admin" replace />} />
        <Route path="/superadmin"   element={<Navigate to="/admin" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </CommerceRealtime>
    </>
  );
}
