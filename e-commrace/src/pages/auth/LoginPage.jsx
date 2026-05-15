// ============================================================
// LoginPage.jsx — Premium Vault Login
// ============================================================
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "../../store/authSlice";
import { Eye, EyeOff, User, Shield, Crown, ArrowLeft, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

/* ── Mode config ── */
const MODES = {
  user: {
    label: "Member", icon: User,
    accent: "#e8e8d8", accentRgb: "232,232,216",
    bg: "#0d0d0b",
    grid: "#ffffff",
    glow: "rgba(232,232,216,0.07)",
    description: "Welcome back",
    sub: "Your personal shopping space",
    allowedRoles: ["user"],
    redirect: "/",
    errorMessage: (role) =>
      role === "admin" ? "Admin account — switch to Admin tab." : "Super Admin account — switch to Super Admin tab.",
  },
  admin: {
    label: "Admin", icon: Shield,
    accent: "#a78bfa", accentRgb: "167,139,250",
    bg: "#07040f",
    grid: "#a78bfa",
    glow: "rgba(167,139,250,0.12)",
    description: "Admin Panel",
    sub: "Restricted — authorized only",
    allowedRoles: ["admin", "superadmin"],
    redirect: "/admin",
    errorMessage: () => "User account — switch to Member tab.",
  },
  superadmin: {
    label: "Super Admin", icon: Crown,
    accent: "#f9c938", accentRgb: "249,201,56",
    bg: "#020202",
    grid: "#f9c938",
    glow: "rgba(249,201,56,0.1)",
    description: "Super Admin Suite",
    sub: "Full system access — ultra restricted",
    allowedRoles: ["superadmin"],
    redirect: "/superadmin",
    errorMessage: (role) =>
      role === "admin" ? "Admin account — switch to Admin tab." : "User account — switch to Member tab.",
  },
};

/* ── Inject styles ── */
function InjectFonts() {
  useEffect(() => {
    if (document.getElementById("vault-login-fonts")) return;
    const l = document.createElement("link");
    l.id = "vault-login-fonts";
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap";
    document.head.appendChild(l);
    const s = document.createElement("style");
    s.textContent = `
      .vl-display { font-family: 'Cormorant Garamond', Georgia, serif; }
      .vl-mono    { font-family: 'DM Mono', 'Courier New', monospace; }
      .vl-body    { font-family: 'DM Sans', system-ui, sans-serif; }
      @keyframes vl-up   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      @keyframes vl-in   { from{opacity:0} to{opacity:1} }
      @keyframes vl-scan { 0%{top:-10%} 100%{top:110%} }
      @keyframes vl-pulse{ 0%,100%{opacity:.6} 50%{opacity:1} }
      .vl-a1 { animation: vl-up .5s cubic-bezier(.22,1,.36,1) both; }
      .vl-a2 { animation: vl-up .5s .07s cubic-bezier(.22,1,.36,1) both; }
      .vl-a3 { animation: vl-up .5s .14s cubic-bezier(.22,1,.36,1) both; }
      .vl-a4 { animation: vl-up .5s .21s cubic-bezier(.22,1,.36,1) both; }
      .vl-a5 { animation: vl-up .5s .28s cubic-bezier(.22,1,.36,1) both; }
      .vl-scan-line {
        position:absolute; left:0; right:0; height:1px;
        animation: vl-scan 4s ease-in-out infinite;
        opacity:.15;
      }
      .vl-input-wrap { position:relative; }
      .vl-input-wrap input { background:rgba(0,0,0,0.4); color:#fff; }
      .vl-input-wrap input::placeholder { color:transparent; }
      .vl-float-label {
        position:absolute; pointer-events:none; select:none;
        left:16px; transition: all .2s cubic-bezier(.22,1,.36,1);
        font-family:'DM Sans',system-ui,sans-serif;
      }
      .vl-input-wrap input:focus ~ .vl-float-label,
      .vl-input-wrap input:not(:placeholder-shown) ~ .vl-float-label {
        top: 9px; font-size: 10px; letter-spacing: .12em; text-transform: uppercase;
      }
      .vl-input-wrap input:not(:focus):placeholder-shown ~ .vl-float-label {
        top: 50%; transform: translateY(-50%); font-size: 13px; letter-spacing: 0; text-transform: none;
      }
      .vl-input-wrap input:focus ~ .vl-float-label { opacity:.9; }
      .vl-tab-active-line { transition: left .3s cubic-bezier(.22,1,.36,1), width .3s cubic-bezier(.22,1,.36,1); }
      @keyframes vl-mode-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      .vl-mode-content { animation: vl-mode-in .3s cubic-bezier(.22,1,.36,1) both; }
    `;
    document.head.appendChild(s);
  }, []);
  return null;
}

/* ── Floating Label Input ── */
function VLInput({ id, label, type, value, onChange, onFocus, onBlur, error, accent, children }) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || (value && value.length > 0);
  return (
    <div>
      <div className="vl-input-wrap" style={{ position: "relative" }}>
        <input
          id={id}
          type={type || "text"}
          value={value}
          placeholder=" "
          onChange={onChange}
          onFocus={() => { setFocused(true); onFocus?.(); }}
          onBlur={() => { setFocused(false); onBlur?.(); }}
          required
          style={{
            width: "100%",
            padding: lifted ? "24px 44px 10px 16px" : "17px 44px 17px 16px",
            borderRadius: "14px",
            border: `1px solid ${error ? "#ef444450" : focused ? `${accent}60` : "#1a1a1a"}`,
            outline: "none",
            fontSize: "13px",
            transition: "border-color .2s, padding .15s",
            boxShadow: focused ? `0 0 0 3px ${accent}10` : "none",
          }}
        />
        <label
          htmlFor={id}
          style={{
            position: "absolute",
            pointerEvents: "none",
            left: "16px",
            fontFamily: "'DM Sans', system-ui, sans-serif",
            transition: "all .2s cubic-bezier(.22,1,.36,1)",
            top: lifted ? "9px" : "50%",
            transform: lifted ? "none" : "translateY(-50%)",
            fontSize: lifted ? "10px" : "13px",
            letterSpacing: lifted ? ".1em" : "0",
            textTransform: lifted ? "uppercase" : "none",
            color: lifted ? (focused ? accent : "#444") : "#333",
            fontWeight: lifted ? "500" : "400",
          }}
        >
          {label}
        </label>
        {children && (
          <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)" }}>
            {children}
          </div>
        )}
      </div>
      {error && <p style={{ marginTop: "6px", fontSize: "11px", color: "#ef4444", paddingLeft: "4px" }}>{error}</p>}
    </div>
  );
}

/* ── Animated Background ── */
function AnimBG({ mode, accent, grid, glow }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0" style={{ backgroundColor: MODES[mode].bg }} />
      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: `linear-gradient(${grid} 1px,transparent 1px),linear-gradient(90deg,${grid} 1px,transparent 1px)`, backgroundSize: "60px 60px" }} />
      {/* Glow blobs */}
      <div className="absolute -top-1/4 -right-1/4 rounded-full blur-[140px] transition-all duration-700"
        style={{ width: "70vw", height: "70vw", backgroundColor: glow, opacity: 0.8 }} />
      <div className="absolute -bottom-1/4 -left-1/4 rounded-full blur-[120px] transition-all duration-700"
        style={{ width: "55vw", height: "55vw", backgroundColor: glow, opacity: 0.5 }} />
      {/* Scan line */}
      <div className="vl-scan-line" style={{ background: `linear-gradient(90deg,transparent,${accent},transparent)` }} />
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-16 h-16" style={{ borderTop: `1px solid ${accent}18`, borderLeft: `1px solid ${accent}18`, borderTopLeftRadius: "0" }} />
      <div className="absolute top-0 right-0 w-16 h-16" style={{ borderTop: `1px solid ${accent}18`, borderRight: `1px solid ${accent}18` }} />
      <div className="absolute bottom-0 left-0 w-16 h-16" style={{ borderBottom: `1px solid ${accent}18`, borderLeft: `1px solid ${accent}18` }} />
      <div className="absolute bottom-0 right-0 w-16 h-16" style={{ borderBottom: `1px solid ${accent}18`, borderRight: `1px solid ${accent}18` }} />
    </div>
  );
}

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);
  const [mode, setMode] = useState("user");
  const [showPass, setShowPass] = useState(false);
  const [localError, setLocalError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });
  const modeKeys = Object.keys(MODES);
  const m = MODES[mode];
  const Icon = m.icon;

  const switchMode = (key) => {
    setMode(key);
    setLocalError("");
    setForm({ email: "", password: "" });
    dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    dispatch(clearError());
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      const { role } = result.payload;
      if (!m.allowedRoles.includes(role)) {
        const msg = m.errorMessage(role);
        setLocalError(msg);
        toast.error(msg, { duration: 4000 });
        dispatch({ type: "auth/logout/fulfilled" });
        try { await import("../../axiosConfig").then(a => a.default.post("/api/v1/auth/logout")); } catch {}
        return;
      }
      toast.success("Welcome back!");
      navigate(m.redirect);
    } else {
      setLocalError(result.payload || "Invalid credentials");
    }
  };

  return (
    <div className="vl-body relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <InjectFonts />
      <AnimBG mode={mode} accent={m.accent} grid={m.grid} glow={m.glow} />

      <div className="relative z-10 w-full max-w-[420px]">

        {/* ── Logo ── */}
        <div className="vl-a1 flex items-center justify-center gap-3 mb-8">
          <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[17px] transition-all duration-500"
            style={{ borderBottomColor: m.accent }} />
          <span className="vl-display text-white text-xl font-bold tracking-[0.25em]">VAULT</span>
        </div>

        {/* ── Card ── */}
        <div
          className="rounded-3xl p-6 sm:p-8 transition-all duration-500"
          style={{
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: `1px solid ${m.accent}22`,
            boxShadow: `0 0 60px rgba(${m.accentRgb},0.08), 0 32px 64px rgba(0,0,0,0.5)`,
          }}
        >

          {/* ── Mode Tabs ── */}
          <div className="vl-a2 relative flex gap-1 p-1 rounded-2xl mb-7 overflow-hidden"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            {modeKeys.map((key) => {
              const mv = MODES[key];
              const MIcon = mv.icon;
              const active = mode === key;
              return (
                <button key={key} onClick={() => switchMode(key)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300"
                  style={{
                    background: active ? `rgba(${mv.accentRgb},0.12)` : "transparent",
                    color: active ? mv.accent : "#3a3a3a",
                    border: `1px solid ${active ? `${mv.accent}30` : "transparent"}`,
                    boxShadow: active ? `0 0 16px rgba(${mv.accentRgb},0.15)` : "none",
                  }}>
                  <MIcon size={12} />
                  <span className="hidden xs:inline sm:inline">{mv.label}</span>
                </button>
              );
            })}
          </div>

          {/* ── Header ── */}
          <div className="vl-mode-content vl-a3 flex items-center gap-3 mb-6" key={mode}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
              style={{ background: `rgba(${m.accentRgb},0.12)`, border: `1px solid ${m.accent}25` }}>
              <Icon size={18} style={{ color: m.accent }} />
            </div>
            <div>
              <h1 className="vl-display text-white font-bold text-lg leading-tight">{m.description}</h1>
              <p className="vl-mono text-[10px] mt-0.5 uppercase tracking-widest" style={{ color: "#333" }}>{m.sub}</p>
            </div>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            <div className="vl-a3">
              <VLInput
                id="email" label="Email Address" type="email"
                value={form.email} accent={m.accent}
                onChange={(e) => { setForm({ ...form, email: e.target.value }); setLocalError(""); }}
              />
            </div>

            <div className="vl-a4">
              <VLInput
                id="password" label="Password"
                type={showPass ? "text" : "password"}
                value={form.password} accent={m.accent}
                onChange={(e) => { setForm({ ...form, password: e.target.value }); setLocalError(""); }}
              >
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ color: "#444", background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </VLInput>
              {mode === "user" && (
                <div className="flex justify-end mt-1.5">
                  <Link to="/forgot-password" className="vl-mono text-[10px] uppercase tracking-widest hover:opacity-80 transition-opacity"
                    style={{ color: "#444" }}>
                    Forgot password?
                  </Link>
                </div>
              )}
            </div>

            {/* Error */}
            {localError && (
              <div className="vl-a4 flex items-start gap-2.5 px-4 py-3 rounded-xl"
                style={{ background: "#ef444410", border: "1px solid #ef444428" }}>
                <p className="text-xs leading-relaxed" style={{ color: "#f87171" }}>{localError}</p>
              </div>
            )}

            {/* Submit */}
            <div className="vl-a5 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="relative w-full py-3.5 rounded-xl text-sm font-bold overflow-hidden group disabled:opacity-50 flex items-center justify-center gap-2 transition-all duration-300"
                style={{
                  background: m.accent,
                  color: mode === "user" ? "#1a1a14" : "#000",
                  boxShadow: `0 4px 24px rgba(${m.accentRgb},0.25)`,
                  letterSpacing: "0.04em",
                }}
              >
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.15)" }} />
                <span className="relative flex items-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      <Icon size={14} />
                      Sign in as {m.label}
                      <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>

          {/* Register link */}
          {mode === "user" && (
            <p className="text-center text-xs mt-5" style={{ color: "#333" }}>
              No account?{" "}
              <Link to="/register" className="font-semibold hover:underline underline-offset-2 transition-colors"
                style={{ color: m.accent }}>
                Create one
              </Link>
            </p>
          )}

          {/* Mode hint for admin/superadmin */}
          {mode !== "user" && (
            <div className="mt-5 px-4 py-2.5 rounded-xl text-center text-[11px]"
              style={{ border: `1px solid ${m.accent}18`, background: `rgba(${m.accentRgb},0.05)`, color: "#444" }}>
              {mode === "admin"
                ? "Both Admin and Super Admin accounts can access this panel."
                : "Only Super Admin accounts are permitted here."}
            </div>
          )}

          {/* Back */}
          <div className="mt-6 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <Link to="/" className="flex items-center gap-1.5 text-xs transition-colors hover:text-white"
              style={{ color: "#2a2a2a" }}>
              <ArrowLeft size={13} /> Back to store
            </Link>
          </div>
        </div>

        {/* Glow under card */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/5 h-8 rounded-full blur-2xl -z-10 transition-all duration-500"
          style={{ background: m.accent, opacity: 0.15 }} />
      </div>
    </div>
  );
}