import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "./store/authSlice";
import { fetchCart } from "./store/cartSlice";
import toast from "react-hot-toast";

// Layouts
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";
import SuperAdminLayout from "./layouts/SuperAdminLayout";

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

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import AdminCreateProduct from "./pages/admin/AdminCreateProduct";
import AdminEditProduct from "./pages/admin/AdminEditProduct"; // ← separate edit file

// SuperAdmin Pages
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import SuperAdminUsers from "./pages/superadmin/SuperAdminUsers";
import SuperAdminAdmins from "./pages/superadmin/SuperAdminAdmins";

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

function RequireSuperAdmin({ children }) {
  const { isAuthenticated, role } = useSelector((s) => s.auth);
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (role !== "superadmin") {
    toast.error("Access denied — Super Admin only");
    return <Navigate to="/" replace />;
  }
  return children;
}

function GuestOnly({ children }) {
  const { isAuthenticated, role } = useSelector((s) => s.auth);
  if (isAuthenticated) {
    if (role === "superadmin") return <Navigate to="/superadmin" replace />;
    if (role === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);

 useEffect(() => { if (!isAuthenticated) dispatch(fetchProfile()); }, [dispatch]);
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

        {/* User Routes */}
        <Route path="/" element={<UserLayout />}>
          <Route index                element={<HomePage />} />
          <Route path="products"      element={<ProductsPage />} />
          <Route path="products/:id"  element={<ProductDetailPage />} />
          <Route path="about"         element={<AboutPage />} />
          <Route path="contact"       element={<ContactPage />} />
          <Route path="cart"          element={<RequireAuth><CartPage /></RequireAuth>} />
          <Route path="checkout"      element={<RequireAuth><CheckoutPage /></RequireAuth>} />
          <Route path="orders"        element={<RequireAuth><OrdersPage /></RequireAuth>} />
          <Route path="profile"       element={<RequireAuth><ProfilePage /></RequireAuth>} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route index                             element={<AdminDashboard />} />
          <Route path="products"                   element={<AdminProducts />} />
          <Route path="products/create"            element={<AdminCreateProduct />} />
          <Route path="products/:id/edit"          element={<AdminEditProduct />} />  {/* ← edit route */}
          <Route path="orders"                     element={<AdminOrders />} />
          <Route path="orders/:id"                 element={<AdminOrderDetail />} />
          <Route path="categories"                 element={<AdminCategories />} />
          <Route path="store"                      element={<ProductsPage />} />
          <Route path="store/:id"                  element={<ProductDetailPage />} />
          <Route path="profile"                    element={<ProfilePage />} />
        </Route>

        {/* SuperAdmin Routes */}
        <Route path="/superadmin" element={<RequireSuperAdmin><SuperAdminLayout /></RequireSuperAdmin>}>
          <Route index                             element={<SuperAdminDashboard />} />
          <Route path="users"                      element={<SuperAdminUsers />} />
          <Route path="admins"                     element={<SuperAdminAdmins />} />
          <Route path="products"                   element={<AdminProducts />} />
          <Route path="products/create"            element={<AdminCreateProduct />} />
          <Route path="products/:id/edit"          element={<AdminEditProduct />} />  {/* ← same edit, role-aware */}
          <Route path="orders"                     element={<AdminOrders />} />
          <Route path="orders/:id"                 element={<AdminOrderDetail />} />
          <Route path="categories"                 element={<AdminCategories />} />
          <Route path="profile"                    element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}