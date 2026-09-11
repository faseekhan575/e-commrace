import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { verifyOtp, clearError, setOtpPending } from "../../store/authSlice";
import axios from "../../axiosConfig";
import { Mail, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function VerifyOtpPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, otpEmail } = useSelector((state) => state.auth);
  const [email, setEmail] = useState(otpEmail || "");
  const [otp, setOtp] = useState("");
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);
  const handleSubmit = async (event) => {
    event.preventDefault();
    dispatch(clearError());
    dispatch(setOtpPending(email));
    const result = await dispatch(verifyOtp({ email, otp }));
    if (verifyOtp.fulfilled.match(result)) {
      toast.success("Your email is verified. Welcome!");
      const role = result.payload?.user?.role;
      const from = location.state?.from;
      const destination = from?.pathname?.startsWith("/") && !from.pathname.startsWith("//") && !from.pathname.startsWith("/admin") ? `${from.pathname}${from.search || ""}` : "/";
      navigate(role === "admin" || role === "superadmin" ? "/admin" : destination, { replace: true });
    }
  };
  const resend = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { toast.error("Enter your registration email first."); return; }
    setResending(true);
    try {
      await axios.post("/api/v1/auth/resend-otp", { email: email.trim().toLowerCase() });
      dispatch(setOtpPending(email));
      setCooldown(60);
      toast.success("A new verification code has been sent.");
    } catch (failure) { toast.error(failure.response?.data?.message || "Unable to resend your code."); }
    finally { setResending(false); }
  };
  const input = "w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-800 focus:ring-2 focus:ring-stone-100 outline-none text-sm";
  return <div className="min-h-screen bg-[#fafaf8] grid place-items-center p-5">
    <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 sm:p-10 shadow-sm">
      <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-stone-100"><Mail size={24} /></div>
      <p className="text-[10px] tracking-[0.22em] uppercase text-stone-500 mb-3">One final step</p>
      <h1 className="font-serif text-3xl text-stone-900 mb-3">Verify your email</h1>
      <p className="text-sm text-stone-500 mb-7 leading-relaxed">Enter the six-digit code from your inbox to activate your account.</p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div><label htmlFor="verification-email" className="block text-xs font-medium text-stone-700 mb-2">Email address</label><input id="verification-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className={input} /></div>
        <div><label htmlFor="verification-code" className="block text-xs font-medium text-stone-700 mb-2">Verification code</label><input id="verification-code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} placeholder="000000" className={`${input} text-center text-2xl tracking-[0.45em] font-mono`} /></div>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}
        <button type="submit" disabled={loading || resending || otp.length !== 6} className="w-full rounded-xl bg-stone-900 py-3.5 text-sm font-medium text-white transition-colors hover:bg-stone-700 disabled:opacity-50">{loading ? "Verifying..." : "Verify & continue"}</button>
      </form>
      <button type="button" onClick={resend} disabled={resending || loading || cooldown > 0} className="mt-5 w-full text-xs font-medium text-stone-600 underline underline-offset-4 disabled:opacity-40">{resending ? "Sending code..." : cooldown ? `Resend available in ${cooldown}s` : "Resend verification code"}</button>
      <Link to="/login" className="mt-7 flex items-center justify-center gap-2 text-xs text-stone-500"><ArrowLeft size={13} />Back to sign in</Link>
    </div>
  </div>;
}

