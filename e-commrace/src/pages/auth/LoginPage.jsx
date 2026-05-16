// ============================================================
// LoginPage.jsx — Unified Vault Login (auto-detects role)
// ============================================================
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "../../store/authSlice";
import { Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

/* ── Role redirect map ── */
const ROLE_REDIRECT = {
  user:       "/",
  admin:      "/admin",
  superadmin: "/superadmin",
};

/* ── Inject Fonts (same as RegisterPage) ── */
function InjectFonts() {
  useEffect(() => {
    if (document.getElementById("vault-login-fonts")) return;
    const l = document.createElement("link");
    l.id = "vault-login-fonts";
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap";
    document.head.appendChild(l);
    const s = document.createElement("style");
    s.textContent = `
      .vl-display { font-family: 'Cormorant Garamond', Georgia, serif; }
      .vl-body    { font-family: 'DM Sans', system-ui, sans-serif; }
      @keyframes vl-up { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      .vl-a1 { animation: vl-up .55s cubic-bezier(.22,1,.36,1) both; }
      .vl-a2 { animation: vl-up .55s .08s cubic-bezier(.22,1,.36,1) both; }
      .vl-a3 { animation: vl-up .55s .16s cubic-bezier(.22,1,.36,1) both; }
      .vl-a4 { animation: vl-up .55s .24s cubic-bezier(.22,1,.36,1) both; }
      .vl-a5 { animation: vl-up .55s .32s cubic-bezier(.22,1,.36,1) both; }
    `;
    document.head.appendChild(s);
  }, []);
  return null;
}

/* ── Floating Label Input (same style as RegisterPage) ── */
function FloatInput({ id, label, type = "text", value, onChange, error, children }) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;
  return (
    <div>
      <div
        className="relative w-full rounded-2xl overflow-hidden transition-all duration-200"
        style={{
          border: `1.5px solid ${error ? "#ef4444" : focused ? "#1a1a14" : "#e0e0d8"}`,
          boxShadow: focused ? "0 0 0 3px rgba(26,26,20,.06)" : "none",
        }}
      >
        <label
          htmlFor={id}
          className="absolute left-4 pointer-events-none select-none transition-all duration-200 font-medium"
          style={{
            top: lifted ? "8px" : "50%",
            transform: lifted ? "none" : "translateY(-50%)",
            fontSize: lifted ? "10px" : "14px",
            letterSpacing: lifted ? "0.1em" : "0",
            textTransform: lifted ? "uppercase" : "none",
            color: lifted ? (focused ? "#1a1a14" : "#a8a898") : "#b0b0a0",
          }}
        >
          {label}
        </label>
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder=""
          required
          className="w-full bg-transparent text-[#1a1a14] text-sm outline-none"
          style={{ padding: "26px 44px 10px 16px" }}
        />
        {children && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{children}</div>
        )}
      </div>
      {error && <p className="mt-1.5 text-[11px] text-red-500 px-1">{error}</p>}
    </div>
  );
}

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [localError, setLocalError] = useState("");

  const validate = () => {
    const errs = {};
    if (!form.email.includes("@")) errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    dispatch(clearError());
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setFieldErrors({});

    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      const { role } = result.payload;
      const redirect = ROLE_REDIRECT[role] || "/";
      toast.success("Welcome back!");
      navigate(redirect);
    } else {
      setLocalError(result.payload || "Invalid credentials");
    }
  };

  const update = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    setLocalError("");
    if (fieldErrors[field]) setFieldErrors({ ...fieldErrors, [field]: "" });
  };

  return (
    <div className="vl-body min-h-screen bg-[#fafaf8] flex overflow-hidden">
      <InjectFonts />

      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-[42%] xl:w-[45%] relative flex-col justify-between p-12 bg-[#1a1a14] overflow-hidden flex-shrink-0">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        {/* Floating triangles */}
        {[0,1,2,3,4].map(i => (
          <div key={i} className="absolute pointer-events-none"
            style={{
              left: `${10+i*18}%`, top: `${15+(i%3)*22}%`,
              width: 0, height: 0,
              borderLeft: `${6+i*2}px solid transparent`,
              borderRight: `${6+i*2}px solid transparent`,
              borderBottom: `${10+i*4}px solid rgba(255,255,255,0.06)`,
              animation: `float ${3.5+i*0.7}s ease-in-out infinite`,
              animationDelay: `${i*0.5}s`,
            }} />
        ))}

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[17px] border-b-white" />
            <span className="vl-display text-white text-2xl font-bold tracking-[0.25em]">VAULT</span>
          </Link>
        </div>

        {/* Center quote */}
        <div className="relative z-10">
          <div className="w-8 h-px bg-white/30 mb-6" />
          <p className="vl-display text-white text-4xl xl:text-5xl font-light leading-[1.1] mb-4">
            Welcome<br />
            <em className="not-italic text-white/50">back</em><br />
            to Vault.
          </p>
          <p className="text-white/40 text-sm leading-relaxed max-w-xs">
            Sign in and we'll take you exactly where you belong — whether that's your cart, your dashboard, or your command center.
          </p>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 flex gap-8">
          {[["50K+","Members"],["99%","Satisfaction"],["10K+","Products"]].map(([n,l]) => (
            <div key={l}>
              <p className="vl-display text-white text-2xl font-bold">{n}</p>
              <p className="text-white/40 text-[11px] tracking-widest uppercase mt-0.5">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12 min-h-screen overflow-y-auto">
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="vl-a1 flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-[#1a1a14]" />
            <span className="vl-display text-[#1a1a14] text-lg font-bold tracking-[0.2em]">VAULT</span>
          </div>

          {/* Heading */}
          <div className="vl-a1 mb-8">
            <p className="text-[11px] tracking-[0.2em] uppercase text-[#a8a898] font-medium mb-2">Welcome Back</p>
            <h1 className="vl-display text-[#1a1a14] font-bold leading-none" style={{ fontSize: "clamp(2.2rem,5vw,3rem)" }}>
              Sign In
            </h1>
            <div className="w-8 h-[2px] bg-[#1a1a14] mt-3" />
            <p className="text-[13px] text-[#a8a898] mt-3 leading-relaxed">
              Your role is detected automatically — no need to choose.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Email */}
            <div className="vl-a2">
              <FloatInput
                id="email" label="Email Address" type="email"
                value={form.email} onChange={update("email")}
                error={fieldErrors.email}
              />
            </div>

            {/* Password */}
            <div className="vl-a3">
              <FloatInput
                id="password" label="Password"
                type={showPass ? "text" : "password"}
                value={form.password} onChange={update("password")}
                error={fieldErrors.password}
              >
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="p-1 text-[#a8a898] hover:text-[#1a1a14] transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </FloatInput>

              {/* Forgot password */}
              <div className="flex justify-end mt-1.5">
                <Link to="/forgot-password"
                  className="text-[11px] tracking-wide text-[#a8a898] hover:text-[#1a1a14] transition-colors underline-offset-2 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Error */}
            {localError && (
              <div className="vl-a4 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
                <p className="text-xs text-red-600">{localError}</p>
              </div>
            )}

            {/* Submit */}
            <div className="vl-a4 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="relative w-full py-4 rounded-2xl bg-[#1a1a14] text-white text-sm font-semibold overflow-hidden group disabled:opacity-60 transition-all duration-200 flex items-center justify-center gap-2.5"
                style={{ letterSpacing: "0.05em" }}
              >
                <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 bg-[#3c3c30] transition-transform duration-300 rounded-2xl" />
                <span className="relative flex items-center gap-2.5">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>

          {/* Register link */}
          <div className="vl-a5 mt-8 pt-6 border-t border-[#f0f0e8]">
            <p className="text-[13px] text-[#a8a898] text-center">
              No account?{" "}
              <Link to="/register" className="text-[#1a1a14] font-semibold hover:underline underline-offset-2">
                Create one
              </Link>
            </p>
          </div>

          {/* Back to store */}
          <div className="mt-4">
            <Link to="/" className="flex items-center gap-1.5 text-xs text-[#c0c0b8] hover:text-[#1a1a14] transition-colors">
              <ArrowLeft size={13} /> Back to store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}