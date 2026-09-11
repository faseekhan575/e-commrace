import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { loginWithGoogle } from "../store/authSlice";
import toast from "react-hot-toast";

let identityScript;
function loadGoogleIdentity() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id);
  if (!identityScript) {
    identityScript = new Promise((resolve, reject) => {
      let script = document.getElementById("google-identity-services");
      if (!script) {
        script = document.createElement("script");
        script.id = "google-identity-services";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", () => resolve(window.google.accounts.id), { once: true });
      script.addEventListener("error", () => {
        identityScript = null;
        script.remove();
        reject(new Error("Google sign-in could not load. Please use your email and password."));
      }, { once: true });
    });
  }
  return identityScript;
}
export default function GoogleAuthButton({ label = "Continue with Google", className = "", onSuccessCallback, compact = false }) {
  const dispatch = useDispatch();
  const container = useRef(null);
  const callback = useRef(onSuccessCallback);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  useEffect(() => { callback.current = onSuccessCallback; }, [onSuccessCallback]);
  useEffect(() => {
    if (!clientId) return undefined;
    let active = true;
    loadGoogleIdentity().then((identity) => {
      if (!active || !container.current) return;
      identity.initialize({
        client_id: clientId,
        auto_select: false,
        callback: async (response) => {
          if (!active || !response.credential) return;
          setLoading(true);
          setError("");
          try {
            const result = await dispatch(loginWithGoogle({ credential: response.credential })).unwrap();
            toast.success("You are signed in.");
            callback.current?.(result);
          } catch (failure) {
            if (active) setError(typeof failure === "string" ? failure : "Google sign-in failed. Please try email sign-in.");
          } finally { if (active) setLoading(false); }
        },
      });
      identity.renderButton(container.current, { theme: "outline", size: compact ? "medium" : "large", shape: "pill", text: label.toLowerCase().includes("sign in") ? "signin_with" : "continue_with", width: Math.min(400, container.current.clientWidth || 320) });
    }).catch((failure) => { if (active) setError(failure.message); });
    return () => { active = false; };
  }, [clientId, compact, dispatch, label]);
  if (!clientId) return <p className="text-center text-xs text-stone-500">Sign in securely with your email and password.</p>;
  return <div className={className} aria-busy={loading}>
    <div ref={container} className={`min-h-10 flex justify-center ${loading ? "pointer-events-none opacity-50" : ""}`} />
    {loading && <p role="status" className="mt-2 text-center text-xs text-stone-500">Completing Google sign-in...</p>}
    {error && <p role="alert" className="mt-2 text-center text-xs text-red-600">{error}</p>}
  </div>;
}

