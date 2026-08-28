import React from "react";

/**
 * BrandLoader — Luxury Animated Clothing Den Loader
 *
 * Features:
 * - Sequenced stroke drawing of concentric golden arches
 * - Subtle pulsing spotlight on the center couture dress mannequin
 * - Gold shimmering "CLOTHING DEN" & "FASHION THAT SPEAKS" typography
 *
 * Props:
 * - size: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
 * - variant: 'fullscreen' | 'inline' | 'icon' (default: 'inline')
 * - text: string (default: "CLOTHING DEN")
 * - subtitle: string (default: "FASHION THAT SPEAKS")
 * - theme: 'dark' | 'light' (default: 'light')
 */
export default function BrandLoader({
  size = "md",
  variant = "inline",
  text = "CLOTHING DEN",
  subtitle = "FASHION THAT SPEAKS",
  theme = "light",
  className = "",
}) {
  const isDark = theme === "dark";

  // Dimension scaling
  const dimensions = {
    sm: { w: 48, h: 48, fontTitle: "text-xs", fontSub: "text-[8px]" },
    md: { w: 84, h: 84, fontTitle: "text-sm", fontSub: "text-[9px]" },
    lg: { w: 120, h: 120, fontTitle: "text-lg", fontSub: "text-[10px]" },
    xl: { w: 160, h: 160, fontTitle: "text-2xl", fontSub: "text-xs" },
  }[size] || { w: 84, h: 84, fontTitle: "text-sm", fontSub: "text-[9px]" };

  const iconMarkup = (
    <div className="relative flex items-center justify-center">
      {/* Background Soft Glow */}
      <div className="absolute inset-0 rounded-full bg-[#d4af37]/15 blur-xl animate-pulse pointer-events-none" />

      <svg
        width={dimensions.w}
        height={dimensions.h}
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 overflow-visible"
      >
        <defs>
          <linearGradient id="loaderGoldGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f7e08b">
              <animate attributeName="stop-color" values="#f7e08b;#d4af37;#b8860b;#f7e08b" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#d4af37">
              <animate attributeName="stop-color" values="#d4af37;#b8860b;#f7e08b;#d4af37" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#996515">
              <animate attributeName="stop-color" values="#996515;#d4af37;#f7e08b;#996515" dur="3s" repeatCount="indefinite" />
            </stop>
          </linearGradient>

          <filter id="goldShimmer" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Arch Layer 1 (Outer) */}
        <path
          d="M20 135 V62 L80 18 L140 62 V135"
          stroke="url(#loaderGoldGlow)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="300"
          strokeDashoffset="300"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="300;0;300"
            dur="2.8s"
            repeatCount="indefinite"
            keyTimes="0;0.5;1"
            calcMode="spline"
            keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
          />
        </path>

        {/* Arch Layer 2 */}
        <path
          d="M36 135 V70 L80 36 L124 70 V135"
          stroke="url(#loaderGoldGlow)"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="260"
          strokeDashoffset="260"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="260;0;260"
            dur="2.8s"
            begin="0.15s"
            repeatCount="indefinite"
            keyTimes="0;0.5;1"
            calcMode="spline"
            keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
          />
        </path>

        {/* Arch Layer 3 */}
        <path
          d="M52 135 V78 L80 54 L108 78 V135"
          stroke="url(#loaderGoldGlow)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="220"
          strokeDashoffset="220"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="220;0;220"
            dur="2.8s"
            begin="0.3s"
            repeatCount="indefinite"
            keyTimes="0;0.5;1"
            calcMode="spline"
            keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
          />
        </path>

        {/* Arch Layer 4 (Inner) */}
        <path
          d="M68 135 V86 L80 72 L92 86 V135"
          stroke="url(#loaderGoldGlow)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="180"
          strokeDashoffset="180"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="180;0;180"
            dur="2.8s"
            begin="0.45s"
            repeatCount="indefinite"
            keyTimes="0;0.5;1"
            calcMode="spline"
            keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
          />
        </path>

        {/* Center Mannequin Torso with breathing scale & golden highlight */}
        <g transform="translate(62, 80) scale(0.9)">
          <g>
            <animateTransform
              attributeName="transform"
              type="scale"
              values="1; 1.08; 1"
              keyTimes="0; 0.5; 1"
              dur="2.8s"
              repeatCount="indefinite"
              additive="sum"
            />
            {/* Finial / Head */}
            <circle cx="20" cy="8" r="3.5" fill={isDark ? "#d4af37" : "#141410"} />
            <rect x="18.5" y="11.5" width="3" height="4" fill={isDark ? "#d4af37" : "#141410"} />

            {/* Torso */}
            <path
              d="M10 16 C10 16 14 19 20 19 C26 19 30 16 30 16 C32 23 29 32 26 38 C23 44 26 54 27 58 H13 C14 54 17 44 14 38 C11 32 8 23 10 16 Z"
              fill={isDark ? "#d4af37" : "#141410"}
            />

            {/* Stand Pole & Pedestal */}
            <line x1="20" y1="58" x2="20" y2="65" stroke={isDark ? "#d4af37" : "#141410"} strokeWidth="2.5" />
            <ellipse cx="20" cy="65.5" rx="7" ry="2" fill={isDark ? "#d4af37" : "#141410"} />
          </g>
        </g>
      </svg>
    </div>
  );

  if (variant === "icon") {
    return iconMarkup;
  }

  const content = (
    <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
      {iconMarkup}

      {text && (
        <div className="mt-4 animate-pulse">
          <h3
            className={`font-serif ${dimensions.fontTitle} font-bold tracking-[0.3em] uppercase ${
              isDark ? "text-white" : "text-[#141410]"
            } leading-none`}
            style={{ fontFamily: "'Cinzel', 'Cormorant Garamond', Georgia, serif" }}
          >
            {text}
          </h3>

          {subtitle && (
            <>
              <p
                className={`${dimensions.fontSub} font-sans font-semibold tracking-[0.35em] uppercase text-[#b8860b] mt-1.5`}
              >
                {subtitle}
              </p>
              <div className="flex items-center justify-center gap-2 mt-1.5 opacity-60">
                <span className="w-6 h-[1px] bg-[#d4af37]" />
                <span className="w-1.5 h-1.5 rotate-45 bg-[#d4af37]" />
                <span className="w-6 h-[1px] bg-[#d4af37]" />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );

  if (variant === "fullscreen") {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md transition-opacity duration-500 ${
          isDark ? "bg-[#080808]/95 text-white" : "bg-[#fafaf8]/95 text-[#141410]"
        }`}
      >
        {content}
      </div>
    );
  }

  return content;
}
