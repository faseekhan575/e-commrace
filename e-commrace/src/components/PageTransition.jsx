import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import BrandLoader from "./BrandLoader";

export default function PageTransition() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const timerRef = useRef(null);
  const fadeTimerRef = useRef(null);

  useEffect(() => {
    // Start transition animation on navigation
    setVisible(true);
    setFading(false);

    if (timerRef.current) clearTimeout(timerRef.current);
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);

    // Fade out after 450ms
    fadeTimerRef.current = setTimeout(() => {
      setFading(true);
    }, 450);

    // Hide after 650ms
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setFading(false);
    }, 650);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#0c0a14]/90 backdrop-blur-md transition-opacity duration-300 pointer-events-none ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="transform scale-110 transition-transform duration-300">
        <BrandLoader size="lg" theme="dark" variant="inline" />
      </div>
    </div>
  );
}