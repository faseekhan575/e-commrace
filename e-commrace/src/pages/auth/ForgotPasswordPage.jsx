import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../axiosConfig";
import { ArrowLeft, KeyRound } from "lucide-react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const sendOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const address = email.trim().toLowerCase();
    try {
      await axios.post("/api/v1/auth/forgot-password", { email: address });
      toast.success("Check your inbox for your reset code.");
      navigate("/reset-password", { state: { email: address } });
    } catch (failure) { setError(failure.response?.data?.message || "Unable to send the reset code. Please try again."); }
    finally { setLoading(false); }
  };
  return <div className="min-h-screen bg-[#fafaf8] grid place-items-center p-5">
    <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 sm:p-10 shadow-sm">
      <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-stone-100"><KeyRound size={24} /></div>
      <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-stone-500">Account recovery</p>
      <h1 className="mb-3 font-serif text-3xl text-stone-900">Forgot your password?</h1>
      <p className="mb-7 text-sm leading-relaxed text-stone-500">Enter your account email and we will send a code to reset your password.</p>
      <form onSubmit={sendOtp} className="space-y-5">
        <div><label htmlFor="reset-email" className="mb-2 block text-xs font-medium text-stone-700">Email address</label><input id="reset-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-stone-800 focus:ring-2 focus:ring-stone-100" /></div>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-xl bg-stone-900 py-3.5 text-sm font-medium text-white transition-colors hover:bg-stone-700 disabled:opacity-50">{loading ? "Sending code..." : "Send reset code"}</button>
      </form>
      <Link to="/login" className="mt-7 flex items-center justify-center gap-2 text-xs text-stone-500"><ArrowLeft size={13} />Back to sign in</Link>
    </div>
  </div>;
}

