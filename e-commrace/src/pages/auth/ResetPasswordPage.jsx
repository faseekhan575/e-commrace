import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../../axiosConfig";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const [newPassword, setNewPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!email) { navigate("/forgot-password"); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/v1/auth/reset-password", { email, newPassword });
      toast.success("Password reset! Please login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border border-[#e8e8e0] rounded-2xl p-8 shadow-sm">
        <h1 className="font-display text-2xl font-700 text-[#1a1a14] mb-2">Reset Password</h1>
        <p className="text-sm text-[#78786a] mb-8">Enter your new password for <span className="font-medium text-[#1a1a14]">{email}</span></p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input type={showPass ? "text" : "password"} required minLength={8}
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 8 chars)"
              className="w-full px-4 py-3 pr-11 rounded-xl border border-[#e8e8e0] focus:border-[#1a1a14] text-sm outline-none transition-colors" />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78786a]">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl bg-[#1a1a14] hover:bg-[#3c3c30] text-white text-sm font-semibold transition-colors disabled:opacity-50">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}