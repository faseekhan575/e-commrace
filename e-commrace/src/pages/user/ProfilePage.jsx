import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { fetchProfile, logoutUser, clearSession } from "../../store/authSlice";
import axios from "../../axiosConfig";
import toast from "react-hot-toast";
import {
  User, Camera, Save, Eye, EyeOff, Lock, MapPin,
  Package, Heart, LogOut, CheckCircle2, ShieldCheck, Mail, Phone
} from "lucide-react";
import BrandLoader from "../../components/BrandLoader";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, role } = useSelector((s) => s.auth);

  const [form, setForm] = useState({
    fullname: "",
    username: "",
    email: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPass, setUpdatingPass] = useState(false);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setForm({
        fullname: user.fullname || "",
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      await axios.patch("/api/v2/user/profile/update", form);
      toast.success("Profile information updated successfully");
      dispatch(fetchProfile());
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      toast.error("Please fill in both current and new password");
      return;
    }

    setUpdatingPass(true);
    try {
      await axios.patch("/api/v2/user/password", passwordForm);
      toast.success("Security password changed successfully");
      setPasswordForm({ oldPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Password change failed");
    } finally {
      setUpdatingPass(false);
    }
  };

  const handleLogout = async () => {
    try { await dispatch(logoutUser()).unwrap(); toast.success("Signed out successfully"); navigate("/"); }
    catch (error) { toast.error(typeof error === "string" ? error : "Could not sign out"); }
  };
  const [avatarBusy, setAvatarBusy] = useState(false);
  const uploadAvatar = async (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) return toast.error("Choose a JPEG, PNG or WebP image under 5 MB.");
    setAvatarBusy(true);
    try { const body = new FormData(); body.append("avatar", file); await axios.patch("/api/v2/user/avatar", body); await dispatch(fetchProfile()).unwrap(); toast.success("Profile image updated"); }
    catch (error) { toast.error(error.response?.data?.message || "Could not upload image"); }
    finally { setAvatarBusy(false); event.target.value = ""; }
  };
  const deleteAccount = async () => {
    if (!window.confirm("Permanently delete your account? This action cannot be undone.")) return;
    try { await axios.delete("/api/v2/user/delete"); dispatch(clearSession()); navigate("/", { replace: true }); toast.success("Account deleted"); }
    catch (error) { toast.error(error.response?.data?.message || "Could not delete your account"); }
  };

  if (loading && !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#fafaf8]">
        <BrandLoader size="lg" text="CLOTHING DEN" subtitle="LOADING ACCOUNT PROFILE..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#78786a] mb-6">
          <Link to="/" className="hover:text-black">Home</Link>
          <span>/</span>
          <span className="text-[#141410] font-semibold">Account Profile</span>
        </div>

        {/* Page Title */}
        <div className="border-b border-[#e8e8e0] pb-6 mb-8 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#141410]">
              Personal Account
            </h1>
            <p className="text-xs text-[#78786a] font-mono mt-1">
              Manage your personal information, security credentials, and preferences
            </p>
          </div>
          {(role === "admin" || role === "superadmin") && (
            <Link
              to="/admin"
              className="px-4 py-2 bg-purple-100 text-purple-800 text-xs font-bold uppercase tracking-wider rounded hover:bg-purple-200 transition-colors"
            >
              ⚡ Open Admin Portal
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Navigation Card (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white border border-[#e8e8e0] rounded-sm p-6 shadow-xs text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-[#141410] text-white flex items-center justify-center mx-auto text-2xl font-bold font-mono shadow-md">
                {user?.avatar?.url ? <img src={user.avatar.url} alt="Your profile" className="w-full h-full object-cover rounded-full" /> : user?.fullname?.charAt(0)?.toUpperCase() || "C"}
              </div>

              <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-stone-500"><Camera size={14} />{avatarBusy ? "Uploading..." : "Change photo"}<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={avatarBusy} onChange={uploadAvatar} /></label>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#141410]">
                  {user?.fullname || "Valued Client"}
                </h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{user?.email}</p>
                <span className="inline-block mt-2 px-2.5 py-0.5 bg-[#f4f4ee] rounded text-[10px] font-mono font-bold uppercase tracking-wider text-gray-700">
                  {role || "Customer Member"}
                </span>
              </div>

              <div className="pt-4 border-t border-[#f0f0ea] space-y-2 text-left">
                <Link
                  to="/orders"
                  className="flex items-center justify-between p-2.5 rounded hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Package size={15} /> Order History & Dispatches
                  </span>
                  <span>→</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 p-2.5 rounded hover:bg-rose-50 text-xs font-semibold text-rose-600 transition-colors text-left"
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </div>

            <div className="bg-[#141410] text-[#f5f5f0] rounded-sm p-5 space-y-2">
              <h4 className="font-serif text-base font-bold text-[#d4af37]">VIP Concierge Access</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Need bespoke tailoring, bulk wedding orders, or custom measurements? Our concierge is ready to assist you.
              </p>
              <div className="pt-2">
                <a
                  href="https://wa.me/923000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-emerald-400 hover:underline"
                >
                  💬 Chat on WhatsApp (+92 300 0000000) →
                </a>
              </div>
            </div>
          </div>

          {/* Right Forms (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. Personal Information Form */}
            <form onSubmit={handleProfileUpdate} className="bg-white border border-[#e8e8e0] rounded-sm p-6 shadow-xs space-y-5">
              <div className="pb-3 border-b border-[#e8e8e0] flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold text-[#141410] flex items-center gap-2">
                  <User size={18} className="text-[#d4af37]" /> Personal Information
                </h3>
                <span className="text-[11px] font-mono text-gray-400">Account Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.fullname}
                    onChange={(e) => setForm({ ...form, fullname: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#fafaf8] border border-[#e8e8e0] rounded text-xs text-[#141410] outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#fafaf8] border border-[#e8e8e0] rounded text-xs text-[#141410] outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#fafaf8] border border-[#e8e8e0] rounded text-xs text-[#141410] outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full px-3 py-2.5 bg-[#fafaf8] border border-[#e8e8e0] rounded text-xs font-mono text-[#141410] outline-none focus:border-black"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updatingProfile}
                className="px-6 py-3 bg-[#141410] hover:bg-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-sm transition-colors shadow-xs flex items-center gap-2"
              >
                <Save size={14} />
                <span>{updatingProfile ? "Updating Details..." : "Save Changes"}</span>
              </button>
            </form>

            {/* 2. Security & Password Update Form */}
            <form onSubmit={handlePasswordChange} className="bg-white border border-[#e8e8e0] rounded-sm p-6 shadow-xs space-y-5">
              <div className="pb-3 border-b border-[#e8e8e0] flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold text-[#141410] flex items-center gap-2">
                  <Lock size={18} className="text-[#d4af37]" /> Security & Password
                </h3>
                <span className="text-[11px] font-mono text-gray-400">Credentials</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showOldPass ? "text" : "password"}
                      value={passwordForm.oldPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 bg-[#fafaf8] border border-[#e8e8e0] rounded text-xs outline-none focus:border-black pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPass(!showOldPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                    >
                      {showOldPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 bg-[#fafaf8] border border-[#e8e8e0] rounded text-xs outline-none focus:border-black pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                    >
                      {showNewPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={updatingPass}
                className="px-6 py-3 bg-white border border-[#141410] text-[#141410] hover:bg-gray-50 text-xs font-bold uppercase tracking-[0.2em] rounded-sm transition-colors flex items-center gap-2"
              >
                <Lock size={14} />
                <span>{updatingPass ? "Updating Password..." : "Change Password"}</span>
              </button>
            </form>
          </div>
        </div>
        <div className="mt-10 border-t border-stone-200 pt-6 flex items-center justify-between gap-4"><p className="text-xs text-stone-500">Permanently remove your account and personal profile.</p><button onClick={deleteAccount} className="text-xs text-red-700 underline">Delete account</button></div>
      </div>
    </div>
  );
}