import React from "react";

/**
 * ClothingDenIcon — The official golden geometric portal arch with center dress mannequin
 */
export function ClothingDenIcon({ size = 40, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`flex-shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id="denGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4af37" />
          <stop offset="50%" stopColor="#b8860b" />
          <stop offset="100%" stopColor="#996515" />
        </linearGradient>
      </defs>

      {/* Outer Arch Layer 1 */}
      <path
        d="M20 135 V62 L80 18 L140 62 V135"
        stroke="url(#denGoldGrad)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Arch Layer 2 */}
      <path
        d="M36 135 V70 L80 36 L124 70 V135"
        stroke="url(#denGoldGrad)"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Arch Layer 3 */}
      <path
        d="M52 135 V78 L80 54 L108 78 V135"
        stroke="url(#denGoldGrad)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Arch Layer 4 */}
      <path
        d="M68 135 V86 L80 72 L92 86 V135"
        stroke="url(#denGoldGrad)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Center Mannequin / Dress Stand Silhouette */}
      <g transform="translate(62, 80) scale(0.9)">
        {/* Neck / Finial */}
        <circle cx="20" cy="8" r="3.5" fill="#141410" />
        <rect x="18.5" y="11.5" width="3" height="4" fill="#141410" />
        
        {/* Mannequin Torso Body */}
        <path
          d="M10 16 C10 16 14 19 20 19 C26 19 30 16 30 16 C32 23 29 32 26 38 C23 44 26 54 27 58 H13 C14 54 17 44 14 38 C11 32 8 23 10 16 Z"
          fill="#141410"
        />

        {/* Stand Base Pole & Pedestal */}
        <line x1="20" y1="58" x2="20" y2="65" stroke="#141410" strokeWidth="2.5" />
        <ellipse cx="20" cy="65.5" rx="7" ry="2" fill="#141410" />
      </g>
    </svg>
  );
}

/**
 * Complete Clothing Den Brand Logo
 * Supports:
 * - variant: 'horizontal' (for headers/navbars)
 * - variant: 'stacked' (for hero banners, login pages, receipts)
 * - variant: 'icon' (icon only)
 * - theme: 'dark' (white & gold text for dark bg) | 'light' (black & gold text for light bg)
 */
export default function BrandLogo({
  variant = "horizontal",
  theme = "light",
  size = 42,
  className = "",
  showTagline = true,
}) {
  const isDark = theme === "dark";
  const titleColor = isDark ? "text-white" : "text-[#141410]";
  const taglineColor = isDark ? "text-[#c5a059]" : "text-[#8c6d31]";

  if (variant === "icon") {
    return <ClothingDenIcon size={size} className={className} />;
  }

  if (variant === "stacked") {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <ClothingDenIcon size={size * 1.5} />
        
        <div className="mt-3">
          <h2
            className={`font-serif text-2xl sm:text-3xl font-bold tracking-[0.28em] uppercase ${titleColor} leading-none`}
            style={{ fontFamily: "'Cinzel', 'Cormorant Garamond', Georgia, serif" }}
          >
            CLOTHING DEN
          </h2>
          
          {showTagline && (
            <>
              <p
                className={`text-[10px] sm:text-[11px] font-sans font-semibold tracking-[0.35em] uppercase ${taglineColor} mt-1.5`}
              >
                FASHION THAT SPEAKS
              </p>
              <div className="flex items-center justify-center gap-2 mt-1.5 opacity-60">
                <span className="w-8 h-[1px] bg-[#d4af37]" />
                <span className="w-1.5 h-1.5 rotate-45 bg-[#d4af37]" />
                <span className="w-8 h-[1px] bg-[#d4af37]" />
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Default: Horizontal Navbar Brand
  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      <ClothingDenIcon size={size} />

      <div className="flex flex-col">
        <span
          className={`font-serif text-lg sm:text-xl font-bold tracking-[0.24em] uppercase ${titleColor} leading-none`}
          style={{ fontFamily: "'Cinzel', 'Cormorant Garamond', Georgia, serif" }}
        >
          CLOTHING DEN
        </span>

        {showTagline && (
          <span
            className={`text-[8.5px] sm:text-[9.5px] font-sans font-semibold tracking-[0.26em] uppercase ${taglineColor} mt-1`}
          >
            FASHION THAT SPEAKS
          </span>
        )}
      </div>
    </div>
  );
}
