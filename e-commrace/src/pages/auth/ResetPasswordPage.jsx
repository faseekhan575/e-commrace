import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "../../axiosConfig";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (newPassword !== confirmation) { setError("Your passwords do not match."); return; }
    setLoading(true);
    try {
      await axios.post("/api/v1/auth/reset-password", { email: email.trim().toLowerCase(), otp, newPassword });
      toast.success("Password updated. Sign in with your new password.");
      navigate("/login", { replace: true });
    } catch (failure) { setError(failure.response?.data?.message || "Unable to reset your password. Please check your code."); }
    finally { setLoading(false); }
  };
  const input = "w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-stone-800 focus:ring-2 focus:ring-stone-100";
  return <div className="min-h-screen bg-[#fafaf8] grid place-items-center p-5">
    <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 sm:p-10 shadow-sm">
      <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-stone-100"><LockKeyhole size={24} /></div>
      <h1 className="mb-3 font-serif text-3xl text-stone-900">Create a new password</h1>
      <p className="mb-7 text-sm text-stone-500 leading-relaxed">Use the six-digit code from your email and choose a password of at least eight characters.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label htmlFor="password-email" className="mb-2 block text-xs font-medium text-stone-700">Email address</label><input id="password-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className={input} /></div>
        <div><label htmlFor="reset-code" className="mb-2 block text-xs font-medium text-stone-700">Reset code</label><input id="reset-code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} placeholder="000000" className={`${input} tracking-[0.35em] font-mono`} /></div>
        <div><label htmlFor="new-password" className="mb-2 block text-xs font-medium text-stone-700">New password</label><div className="relative"><input id="new-password" type={showPass ? "text" : "password"} autoComplete="new-password" required minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className={`${input} pr-12`} /><button type="button" aria-label={showPass ? "Hide password" : "Show password"} onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-500">{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
        <div><label htmlFor="confirm-password" className="mb-2 block text-xs font-medium text-stone-700">Confirm password</label><input id="confirm-password" type="password" autoComplete="new-password" required minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className={input} /></div>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}
        <button type="submit" disabled={loading || otp.length !== 6} className="w-full rounded-xl bg-stone-900 py-3.5 text-sm font-medium text-white transition-colors hover:bg-stone-700 disabled:opacity-50">{loading ? "Updating password..." : "Reset password"}</button>
      </form>
      <Link to="/forgot-password" className="mt-6 block text-center text-xs text-stone-500 underline underline-offset-4">Request a new reset code</Link>
    </div>
  </div>;
}

