import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { verifyOtp, clearError } from "../../store/authSlice";
import toast from "react-hot-toast";

export default function VerifyOtpPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, otpEmail } = useSelector((s) => s.auth);
  const [otp, setOtp] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    if (!otpEmail) { toast.error("No email found. Please register again."); navigate("/register"); return; }
    const result = await dispatch(verifyOtp({ email: otpEmail, otp }));
    if (verifyOtp.fulfilled.match(result)) {
      toast.success("Account verified!");
      navigate("/");
    } else {
      toast.error(result.payload || "Invalid OTP");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border border-[#e8e8e0] rounded-2xl p-8 shadow-sm text-center">
        <div className="w-14 h-14 rounded-full bg-[#f5f5f0] flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">📬</span>
        </div>
        <h1 className="font-display text-2xl font-700 text-[#1a1a14] mb-2">Verify Email</h1>
        <p className="text-sm text-[#78786a] mb-8">
          We sent a 6-digit code to<br />
          <span className="font-medium text-[#1a1a14]">{otpEmail || "your email"}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text" maxLength={6} required value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="w-full px-4 py-4 text-center text-2xl tracking-[0.5em] font-mono rounded-xl border border-[#e8e8e0] focus:border-[#1a1a14] outline-none"
          />
          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <button type="submit" disabled={loading || otp.length !== 6}
            className="w-full py-3 rounded-xl bg-[#1a1a14] hover:bg-[#3c3c30] text-white text-sm font-semibold transition-colors disabled:opacity-50">
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}