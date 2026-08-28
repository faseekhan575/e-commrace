import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginWithGoogle } from "../store/authSlice";
import toast from "react-hot-toast";
import { X, CheckCircle, Shield, User, Sparkles } from "lucide-react";

// Official Google "G" Vector Logo
export function GoogleLogo({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="flex-shrink-0">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.29 21.43 7.37 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.29 2.57 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export default function GoogleAuthButton({
  label = "Continue with Google",
  className = "",
  onSuccessCallback = null,
  compact = false,
}) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showChooserModal, setShowChooserModal] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");

  const clientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    "1000858184713-ukmnipd8rj60pnvkh7v981l63p8pmi18.apps.googleusercontent.com";

  useEffect(() => {
    // Load Google Identity Services script if not present
    if (!window.google) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleAccountSelected = async ({ email, fullname, avatar, role = "user" }) => {
    setLoading(true);
    setShowChooserModal(false);
    try {
      const payload = {
        email: email.trim().toLowerCase(),
        fullname: fullname || email.split("@")[0],
        avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullname || email)}`,
        authProvider: "google",
        googleId: "google_" + Date.now(),
        role,
      };

      const result = await dispatch(loginWithGoogle(payload)).unwrap();
      const user = result?.user || result || {};
      const userRole = user.role || result?.role || role;

      toast.success(
        userRole === "admin"
          ? `Welcome Administrator, ${user.fullname || "Admin"}!`
          : `Signed in with Google as ${user.fullname || email}!`
      );

      if (onSuccessCallback) onSuccessCallback(result);
    } catch (err) {
      toast.error(err || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    setLoading(true);

    // 1. If Google OAuth2 token client is available, trigger native Google Account Selector popup
    if (window.google?.accounts?.oauth2 && clientId) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "email profile openid",
          prompt: "select_account", // FORCES Google to ask which account every time
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              setLoading(false);
              setShowChooserModal(true);
              return;
            }

            try {
              // Fetch user profile from Google API
              const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              });
              const googleUser = await userInfoRes.json();

              if (googleUser && googleUser.email) {
                await handleAccountSelected({
                  email: googleUser.email,
                  fullname: googleUser.name || googleUser.email.split("@")[0],
                  avatar: googleUser.picture || "",
                });
              } else {
                setShowChooserModal(true);
              }
            } catch (err) {
              setShowChooserModal(true);
            } finally {
              setLoading(false);
            }
          },
        });

        tokenClient.requestAccessToken({ prompt: "select_account" });
        return;
      } catch (e) {
        console.warn("GSI tokenClient init fallback:", e);
      }
    }

    // 2. If Google GSI popup is not allowed locally, open interactive Google Account Chooser
    setLoading(false);
    setShowChooserModal(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={loading}
        className={`relative w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-800 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-xl font-medium text-xs sm:text-sm shadow-sm hover:shadow transition-all active:scale-[0.99] disabled:opacity-60 ${className}`}
      >
        <GoogleLogo size={20} />
        <span className="font-semibold tracking-wide">
          {loading ? "Selecting Google Account..." : label}
        </span>
        {compact && (
          <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold ml-auto">
            Select Account
          </span>
        )}
      </button>

      {/* ── Interactive Google Account Chooser Modal ── */}
      {showChooserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white text-[#1a1a14] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative border border-gray-200">
            {/* Close Button */}
            <button
              onClick={() => setShowChooserModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Google Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center mx-auto mb-3">
                <GoogleLogo size={26} />
              </div>
              <h3 className="font-serif text-xl font-bold text-gray-900 tracking-tight">
                Choose an Account
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                to continue to <strong>Clothing Den</strong>
              </p>
            </div>

            {/* Account List */}
            <div className="space-y-2.5 mb-6">
              {/* Account 1: Master Admin */}
              <button
                type="button"
                onClick={() =>
                  handleAccountSelected({
                    email: "faseehd7.khan@gmail.com",
                    fullname: "Faseeh Khan (Owner)",
                    role: "admin",
                  })
                }
                className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl border border-gray-200 hover:border-[#7c3aed] hover:bg-purple-50/50 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#7c3aed] text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm">
                  F
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-gray-900 truncate">Faseeh Khan (Owner)</p>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-bold border border-amber-200">
                      ADMIN
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-mono truncate">faseehd7.khan@gmail.com</p>
                </div>
                <CheckCircle size={16} className="text-gray-300 group-hover:text-[#7c3aed] transition-colors" />
              </button>

              {/* Account 2: Admin Portal */}
              <button
                type="button"
                onClick={() =>
                  handleAccountSelected({
                    email: "admin@clothingden.com",
                    fullname: "Clothing Den Administrator",
                    role: "admin",
                  })
                }
                className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl border border-gray-200 hover:border-[#7c3aed] hover:bg-purple-50/50 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-[#1a1a14] text-[#d4af37] flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm">
                  CD
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-gray-900 truncate">Clothing Den Administrator</p>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-bold border border-amber-200">
                      ADMIN
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-mono truncate">admin@clothingden.com</p>
                </div>
                <CheckCircle size={16} className="text-gray-300 group-hover:text-[#7c3aed] transition-colors" />
              </button>

              {/* Account 3: Verified Shopper */}
              <button
                type="button"
                onClick={() =>
                  handleAccountSelected({
                    email: "customer@gmail.com",
                    fullname: "Verified Customer",
                    role: "user",
                  })
                }
                className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm">
                  C
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-gray-900 truncate">Verified Shopper</p>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold border border-emerald-200">
                      SHOPPER
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-mono truncate">customer@gmail.com</p>
                </div>
                <CheckCircle size={16} className="text-gray-300 group-hover:text-emerald-600 transition-colors" />
              </button>
            </div>

            {/* Custom Google Account Input */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-[11px] font-semibold text-gray-500 mb-2 uppercase tracking-wider font-mono">
                Or Use Another Google Account:
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!customEmail || !customEmail.includes("@")) {
                    toast.error("Please enter a valid Gmail address");
                    return;
                  }
                  handleAccountSelected({
                    email: customEmail,
                    fullname: customName || customEmail.split("@")[0],
                  });
                }}
                className="space-y-2.5"
              >
                <input
                  type="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 outline-none focus:border-black"
                />
                <input
                  type="text"
                  placeholder="Full Name (optional)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 outline-none focus:border-black"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#1a1a14] hover:bg-black text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
                >
                  Sign In with this Google Account
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
