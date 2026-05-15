// ForgotPasswordPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../axiosConfig";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("email"); // email | otp
  const [otp, setOtp] = useState("");

  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/v1/auth/forgot-password", { email });
      toast.success("OTP sent to your email");
      setStep("otp");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally { setLoading(false); }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/v1/auth/verify-reset-otp", { email, otp });
      toast.success("OTP verified! Set your new password.");
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally { setLoading(false); }
  };

  const inp = "w-full px-4 py-3 rounded-xl border border-[#e8e8e0] focus:border-[#1a1a14] text-sm outline-none transition-colors";

  return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border border-[#e8e8e0] rounded-2xl p-8 shadow-sm">
        <h1 className="font-display text-2xl font-700 text-[#1a1a14] mb-2">
          {step === "email" ? "Forgot Password" : "Enter OTP"}
        </h1>
        <p className="text-sm text-[#78786a] mb-8">
          {step === "email" ? "We'll send a reset code to your email." : `OTP sent to ${email}`}
        </p>

        {step === "email" ? (
          <form onSubmit={sendOtp} className="space-y-4">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" className={inp} />
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-[#1a1a14] hover:bg-[#3c3c30] text-white text-sm font-semibold transition-colors disabled:opacity-50">
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">
            <input type="text" maxLength={6} required value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-full px-4 py-4 text-center text-2xl tracking-[0.5em] font-mono rounded-xl border border-[#e8e8e0] focus:border-[#1a1a14] outline-none" />
            <button type="submit" disabled={loading || otp.length !== 6}
              className="w-full py-3 rounded-xl bg-[#1a1a14] hover:bg-[#3c3c30] text-white text-sm font-semibold transition-colors disabled:opacity-50">
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-[#78786a] hover:text-[#1a1a14] transition-colors">Back to login</Link>
        </div>
      </div>
    </div>
  );
}