// ============================================================
// RegisterPage.jsx — Premium Vault Registration
// ============================================================
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearError, setOtpPending } from "../../store/authSlice";
import { Eye, EyeOff, ArrowRight, Check, X } from "lucide-react";
import toast from "react-hot-toast";

/* ── Password strength util ── */
function getStrength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const S_LABEL = ["", "Weak", "Fair", "Good", "Strong", "Excellent"];
const S_COLOR = ["#e8e8e0", "#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981"];

/* ── Floating Label Input ── */
function FloatInput({ id, label, type = "text", value, onChange, required, children, error }) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;
  return (
    <div className="relative">
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
          required={required}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder=""
          className="w-full bg-transparent text-[#1a1a14] text-sm outline-none"
          style={{ padding: "26px 44px 10px 16px" }}
        />
        {children && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{children}</div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-[11px] text-red-500 flex items-center gap-1 px-1">
          <X size={10} /> {error}
        </p>
      )}
    </div>
  );
}

/* ── Inject Fonts ── */
function InjectFonts() {
  useEffect(() => {
    if (document.getElementById("vault-reg-fonts")) return;
    const l = document.createElement("link");
    l.id = "vault-reg-fonts";
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap";
    document.head.appendChild(l);
    const s = document.createElement("style");
    s.textContent = `
      .vr-display { font-family: 'Cormorant Garamond', Georgia, serif; }
      .vr-body { font-family: 'DM Sans', system-ui, sans-serif; }
      @keyframes vr-up { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      @keyframes vr-in { from { opacity:0; } to { opacity:1; } }
      @keyframes vr-line { from { width:0; } to { width:100%; } }
      .vr-a1 { animation: vr-up .55s cubic-bezier(.22,1,.36,1) both; }
      .vr-a2 { animation: vr-up .55s .08s cubic-bezier(.22,1,.36,1) both; }
      .vr-a3 { animation: vr-up .55s .16s cubic-bezier(.22,1,.36,1) both; }
      .vr-a4 { animation: vr-up .55s .24s cubic-bezier(.22,1,.36,1) both; }
      .vr-a5 { animation: vr-up .55s .32s cubic-bezier(.22,1,.36,1) both; }
      .vr-a6 { animation: vr-up .55s .40s cubic-bezier(.22,1,.36,1) both; }
      @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      .str-bar { transition: width .4s cubic-bezier(.22,1,.36,1), background-color .4s; }
    `;
    document.head.appendChild(s);
  }, []);
  return null;
}

/* ── Requirement Row ── */
function Req({ met, label }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
        style={{ backgroundColor: met ? "#1a1a14" : "#f0f0e8", border: met ? "none" : "1.5px solid #e0e0d8" }}
      >
        {met && <Check size={9} color="#fff" strokeWidth={3} />}
      </div>
      <span className="text-[11px] transition-colors duration-300" style={{ color: met ? "#1a1a14" : "#b0b0a0" }}>
        {label}
      </span>
    </div>
  );
}

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [showPass, setShowPass] = useState(false);
  const [showReqs, setShowReqs] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", fullname: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});

  const strength = getStrength(form.password);
  const pw = form.password;

  const validate = () => {
    const errs = {};
    if (!form.fullname.trim()) errs.fullname = "Full name is required";
    if (!form.username.trim()) errs.username = "Username is required";
    else if (form.username.includes(" ")) errs.username = "No spaces allowed";
    if (!form.email.includes("@")) errs.email = "Enter a valid email";
    if (pw.length < 8) errs.password = "Password too short";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setFieldErrors({});
    dispatch(clearError());
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) {
      dispatch(setOtpPending(form.email));
      toast.success("OTP sent to your email!");
      navigate("/verify-otp");
    } else {
      toast.error(result.payload || "Registration failed");
    }
  };

  const update = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (fieldErrors[field]) setFieldErrors({ ...fieldErrors, [field]: "" });
  };

  return (
    <div className="vr-body min-h-screen bg-[#fafaf8] flex overflow-hidden">
      <InjectFonts />

      {/* ── Left decorative panel (hidden on mobile) ── */}
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
            <span className="vr-display text-white text-2xl font-bold tracking-[0.25em]">VAULT</span>
          </Link>
        </div>

        {/* Center quote */}
        <div className="relative z-10">
          <div className="w-8 h-px bg-white/30 mb-6" />
          <p className="vr-display text-white text-4xl xl:text-5xl font-light leading-[1.1] mb-4">
            Every<br />
            <em className="not-italic text-white/50">piece</em><br />
            curated.
          </p>
          <p className="text-white/40 text-sm leading-relaxed max-w-xs">
            Join thousands of discerning shoppers who trust Vault for premium, handpicked selections.
          </p>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 flex gap-8">
          {[["50K+","Members"],["99%","Satisfaction"],["10K+","Products"]].map(([n,l]) => (
            <div key={l}>
              <p className="vr-display text-white text-2xl font-bold">{n}</p>
              <p className="text-white/40 text-[11px] tracking-widest uppercase mt-0.5">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12 min-h-screen overflow-y-auto">
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="vr-a1 flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-[#1a1a14]" />
            <span className="vr-display text-[#1a1a14] text-lg font-bold tracking-[0.2em]">VAULT</span>
          </div>

          {/* Heading */}
          <div className="vr-a1 mb-8">
            <p className="text-[11px] tracking-[0.2em] uppercase text-[#a8a898] font-medium mb-2">New Member</p>
            <h1 className="vr-display text-[#1a1a14] font-bold leading-none" style={{ fontSize: "clamp(2.2rem,5vw,3rem)" }}>
              Create Account
            </h1>
            <div className="w-8 h-[2px] bg-[#1a1a14] mt-3" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Full Name */}
            <div className="vr-a2">
              <FloatInput id="fullname" label="Full Name" value={form.fullname} onChange={update("fullname")}
                required error={fieldErrors.fullname} />
            </div>

            {/* Username */}
            <div className="vr-a3">
              <FloatInput id="username" label="Username" value={form.username} onChange={update("username")}
                required error={fieldErrors.username} />
            </div>

            {/* Email */}
            <div className="vr-a3">
              <FloatInput id="email" label="Email Address" type="email" value={form.email}
                onChange={update("email")} required error={fieldErrors.email} />
            </div>

            {/* Password */}
            <div className="vr-a4">
              <FloatInput id="password" label="Password" type={showPass ? "text" : "password"}
                value={form.password} onChange={update("password")} required
                error={fieldErrors.password}
                onFocus={() => setShowReqs(true)}
              >
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="p-1 text-[#a8a898] hover:text-[#1a1a14] transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </FloatInput>

              {/* Strength bar */}
              {form.password.length > 0 && (
                <div className="mt-2.5 space-y-2 px-1">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-[#f0f0e8]">
                        <div className="str-bar h-full rounded-full"
                          style={{
                            width: strength >= i ? "100%" : "0%",
                            backgroundColor: S_COLOR[strength],
                          }} />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-medium transition-colors duration-300"
                      style={{ color: S_COLOR[strength] }}>{S_LABEL[strength]}</p>
                    <p className="text-[10px] text-[#c0c0b8]">{form.password.length} chars</p>
                  </div>
                </div>
              )}

              {/* Requirements checklist */}
              {(showReqs || form.password.length > 0) && (
                <div className="mt-3 grid grid-cols-2 gap-y-2 gap-x-3 px-1 py-3 rounded-xl bg-[#f8f8f5] border border-[#ebebе3]">
                  <Req met={pw.length >= 8} label="8+ characters" />
                  <Req met={/[A-Z]/.test(pw)} label="Uppercase letter" />
                  <Req met={/[0-9]/.test(pw)} label="Number" />
                  <Req met={/[^A-Za-z0-9]/.test(pw)} label="Special character" />
                </div>
              )}
            </div>

            {/* Server error */}
            {error && (
              <div className="vr-a5 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
                <X size={14} className="text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            {/* Submit */}
            <div className="vr-a5 pt-1">
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
                      Creating account…
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>

          {/* Sign in link */}
          <div className="vr-a6 mt-8 pt-6 border-t border-[#f0f0e8]">
            <p className="text-[13px] text-[#a8a898] text-center">
              Already a member?{" "}
              <Link to="/login" className="text-[#1a1a14] font-semibold hover:underline underline-offset-2">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}