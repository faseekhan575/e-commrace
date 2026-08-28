import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "./store/authSlice";
import { fetchCart } from "./store/cartSlice";
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

// Transition
import PageTransition from "./components/PageTransition";

/* ─── Guards ─── */
function RequireAuth({ children }) {
  const { isAuthenticated } = useSelector((s) => s.auth);
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { isAuthenticated, role } = useSelector((s) => s.auth);
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (role !== "admin" && role !== "superadmin") {
    toast.error("Access denied — Admin only");
    return <Navigate to="/" replace />;
  }
  return children;
}

function GuestOnly({ children }) {
  const { isAuthenticated, role } = useSelector((s) => s.auth);
  if (isAuthenticated) {
    if (role === "admin" || role === "superadmin") return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!isAuthenticated && token) {
      dispatch(fetchProfile());
    }
  }, [dispatch, isAuthenticated]);
  useEffect(() => { if (isAuthenticated) dispatch(fetchCart()); }, [isAuthenticated, dispatch]);

  return (
    <>
      <PageTransition />
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
          <Route path="products/:id"  element={<ProductDetailPage />} />
          <Route path="about"         element={<AboutPage />} />
          <Route path="contact"       element={<ContactPage />} />
          <Route path="cart"          element={<CartPage />} />
          <Route path="checkout"      element={<CheckoutPage />} />
          <Route path="orders"        element={<RequireAuth><OrdersPage /></RequireAuth>} />
          <Route path="profile"       element={<RequireAuth><ProfilePage /></RequireAuth>} />
        </Route>

        {/* ── Single Unified Admin Portal (All Capabilities) ── */}
        <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route index                             element={<AdminDashboard />} />
          <Route path="products"                   element={<AdminProducts />} />
          <Route path="products/create"            element={<AdminCreateProduct />} />
          <Route path="products/:id/edit"          element={<AdminEditProduct />} />
          <Route path="banners"                    element={<AdminBanners />} />
          <Route path="orders"                     element={<AdminOrders />} />
          <Route path="orders/:id"                 element={<AdminOrderDetail />} />
          <Route path="categories"                 element={<AdminCategories />} />
          <Route path="users"                      element={<AdminUsers />} />
          <Route path="store"                      element={<ProductsPage />} />
          <Route path="store/:id"                  element={<ProductDetailPage />} />
          <Route path="profile"                    element={<ProfilePage />} />
        </Route>

        {/* Automatic redirect from any legacy /superadmin paths directly to /admin */}
        <Route path="/superadmin/*" element={<Navigate to="/admin" replace />} />
        <Route path="/superadmin"   element={<Navigate to="/admin" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}