import React from "react";

// ============================================================
// OFFICIAL LUXURY PAYMENT LOGOS & BADGES (PAKISTAN & GLOBAL)
// ============================================================

// 1. Official Easypaisa Logo (Telenor Bank)
export function EasypaisaLogo({ className = "h-8" }) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-[#00A859] rounded-xl text-white shadow-sm border border-[#00924d] ${className}`}>
      {/* Official Easypaisa Stylized Loop Icon */}
      <svg width="22" height="22" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
        <circle cx="20" cy="20" r="20" fill="white" />
        <path d="M12 20C12 15.5817 15.5817 12 20 12C24.4183 12 28 15.5817 28 20C28 24.4183 24.4183 28 20 28H14" stroke="#00A859" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="20" cy="20" r="3" fill="#00A859" />
      </svg>
      <div className="flex flex-col leading-none">
        <span className="font-black text-[13px] tracking-tight uppercase">easypaisa</span>
        <span className="text-[8px] font-medium text-emerald-100 tracking-wider">Telenor Bank</span>
      </div>
    </div>
  );
}

// 2. Official JazzCash Logo
export function JazzCashLogo({ className = "h-8" }) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-[#E61C24] rounded-xl text-white shadow-sm border border-[#cc181f] ${className}`}>
      {/* Official Jazz Flame Emblem */}
      <div className="w-5 h-5 rounded-full bg-[#FFCC00] flex items-center justify-center shadow-inner flex-shrink-0">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="#E61C24" />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-black text-[13px] tracking-tight">Jazz<span className="text-[#FFCC00]">Cash</span></span>
        <span className="text-[8px] font-medium text-red-100 tracking-wider">Mobilink Microfinance</span>
      </div>
    </div>
  );
}

// 3. Official SadaPay Logo (Mastercard Debit)
export function SadaPayLogo({ className = "h-8" }) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-[#000000] rounded-xl text-white shadow-sm border border-neutral-800 ${className}`}>
      {/* SadaPay Dual Pill Teal/Coral Vector */}
      <div className="flex items-center -space-x-1.5 flex-shrink-0">
        <span className="w-4 h-4 rounded-full bg-[#00D1B2] opacity-90 inline-block shadow-sm"></span>
        <span className="w-4 h-4 rounded-full bg-[#FF5E62] opacity-90 inline-block shadow-sm"></span>
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-bold text-[12px] tracking-tight">Sada<span className="text-[#00D1B2]">Pay</span></span>
        <span className="text-[8px] font-mono text-neutral-400">Mastercard</span>
      </div>
    </div>
  );
}

// 4. Official NayaPay Logo
export function NayaPayLogo({ className = "h-8" }) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-[#FF6A00] rounded-xl text-white shadow-sm border border-[#e05e00] ${className}`}>
      <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center flex-shrink-0">
        <span className="text-[#FF6A00] font-black text-xs">N</span>
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-black text-[12px] tracking-tight">NayaPay</span>
        <span className="text-[8px] font-mono text-orange-100">Visa Debit</span>
      </div>
    </div>
  );
}

// 5. Official VISA Vector Logo
export function VisaLogo({ className = "h-7" }) {
  return (
    <div className={`inline-flex items-center px-2.5 py-1 bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      <svg width="42" height="15" viewBox="0 0 1000 324" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M404.1 8.5L260.6 315.5H166.5L101.4 69.3C97.5 54.1 94.2 48.6 82.2 42.1C62.6 31.6 29.5 21.8 0 15.5L4.5 8.5H148.6C167.3 8.5 184.2 21.2 188.1 42.6L224.2 220.2L312.3 8.5H404.1ZM760.8 217.1C761.5 137.6 642.5 133 643.5 95.8C643.9 84.4 655.4 72.3 680.6 69C693.1 67.3 727.6 66.2 764.3 82.4L777.6 23.9C759.4 17.5 736.2 11.8 706.7 11.8C620.2 11.8 559.2 55.6 558.7 118.2C557.7 164.5 601.7 189.9 634.8 205.3C668.8 221.1 680.2 231.2 680 245.5C679.6 267.4 651.9 277 626.8 277.4C582.6 278.1 556.7 266.1 536.4 257L522.6 317.9C539.3 266.1 578.4 322.3 617.9 322.6C709.8 322.6 760.3 280.2 760.8 217.1ZM990.2 315.5H1000L922.8 8.5H843.8C826.5 8.5 812 18.2 805.9 32.1L689.8 315.5H782.3L800.7 267.8H913.3L924.3 315.5H990.2ZM826.2 201.2L860.8 107.5L880.8 201.2H826.2ZM536.2 8.5L462.4 315.5H375.4L449.1 8.5H536.2Z" fill="#1434CB" />
        <path d="M148.6 8.5H4.5L0 15.5C59 28.1 97.4 57.5 101.4 69.3L135.5 200.2L188.1 42.6C184.2 21.2 167.3 8.5 148.6 8.5Z" fill="#F7B600" />
      </svg>
    </div>
  );
}

// 6. Official Mastercard Vector Logo
export function MastercardLogo({ className = "h-7" }) {
  return (
    <div className={`inline-flex items-center px-2.5 py-1 bg-[#1A1A1A] rounded-lg border border-neutral-700 shadow-sm ${className}`}>
      <svg width="34" height="21" viewBox="0 0 100 62" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="31" cy="31" r="31" fill="#EB001B" />
        <circle cx="69" cy="31" r="31" fill="#F79E1B" fillOpacity="0.92" />
        <path d="M50 8.44C57.48 14.36 62.3 22.12 62.3 31C62.3 39.88 57.48 47.64 50 53.56C42.52 47.64 37.7 39.88 37.7 31C37.7 22.12 42.52 14.36 50 8.44Z" fill="#FF5F00" />
      </svg>
      <span className="ml-1.5 text-white font-semibold text-[10px] tracking-tight">Mastercard</span>
    </div>
  );
}

// 7. Official PayPak Logo (Pakistan National Payment Scheme)
export function PayPakLogo({ className = "h-7" }) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#006838] text-white rounded-lg border border-[#00522c] shadow-sm font-bold text-[10px] ${className}`}>
      {/* Pakistan Crescent & Star */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c2.3 0 4.43-.78 6.13-2.09-4.85-.35-8.69-4.38-8.69-9.33 0-4.04 2.57-7.48 6.2-8.81C14.39 2.65 13.22 2 12 2z" fill="#ffffff" />
        <polygon points="17,6 18,9 21,9 18.5,11 19.5,14 17,12 14.5,14 15.5,11 13,9 16,9" fill="#ffffff" />
      </svg>
      <span className="font-extrabold tracking-wider">PayPak</span>
    </div>
  );
}

// 8. Official UnionPay Logo
export function UnionPayLogo({ className = "h-7" }) {
  return (
    <div className={`inline-flex items-center px-2 py-1 bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      <div className="flex items-center -space-x-1">
        <div className="w-3.5 h-4.5 bg-[#E21836] rounded-xs transform -skew-x-12"></div>
        <div className="w-3.5 h-4.5 bg-[#005B9E] rounded-xs transform -skew-x-12"></div>
        <div className="w-3.5 h-4.5 bg-[#007C64] rounded-xs transform -skew-x-12"></div>
      </div>
      <span className="ml-1.5 text-gray-900 font-bold text-[9px] tracking-tight">UnionPay</span>
    </div>
  );
}

// 9. Official Google Pay Logo
export function GooglePayLogo({ className = "h-7" }) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-300 rounded-xl text-gray-800 text-xs font-semibold shadow-sm ${className}`}>
      <svg width="16" height="16" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.29 21.43 7.37 24 12 24z" />
        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z" />
        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.29 2.57 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
      </svg>
      <span className="font-bold text-gray-800 text-[11px]">Pay</span>
    </div>
  );
}

// 10. Official Apple Pay Logo
export function ApplePayLogo({ className = "h-7" }) {
  return (
    <div className={`inline-flex items-center gap-1 px-3 py-1 bg-black rounded-xl text-white text-xs font-semibold shadow-sm border border-neutral-800 ${className}`}>
      <svg width="13" height="15" viewBox="0 0 170 170" fill="currentColor">
        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.08-7.71-7.94-12.04-14.58-6.19-9.5-11.07-20.2-14.64-32.1-3.57-11.9-5.36-23.08-5.36-33.54 0-15.65 4.09-28.53 12.28-38.64 8.19-10.11 18.23-15.28 30.12-15.52 4.36 0 9.29 1.13 14.79 3.39 5.51 2.26 9.4 3.44 11.69 3.54 1.9.1 5.86-1.12 11.87-3.67 6.01-2.54 11.21-3.68 15.6-3.41 11.53.59 20.89 4.88 28.09 12.87-10.14 6.17-15.11 14.88-14.92 26.13.2 8.78 3.52 16.14 9.97 22.08 6.45 5.94 14.15 9.25 23.09 9.94-2.18 6.81-5.15 14.07-8.91 21.78zM119.22 31.02c0-7.22 2.65-14.05 7.95-20.48 5.3-6.43 11.75-10.19 19.34-11.28.2 1.48.3 2.92.3 4.31 0 7.35-2.8 14.46-8.4 21.32-5.6 6.87-12.01 10.74-19.23 11.61.03-1.89.04-3.72.04-5.48z"/>
      </svg>
      <span className="font-semibold text-[11px]">Pay</span>
    </div>
  );
}

// 11. Pakistani Banks Suite (Meezan, HBL, Alfalah, Raast / 1-Link)
export function BankTransferLogos({ className = "" }) {
  return (
    <div className={`inline-flex items-center gap-2 flex-wrap ${className}`}>
      {/* Meezan Bank */}
      <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#4A154B] text-white rounded-lg shadow-xs text-[10px] font-bold border border-[#3b103c]">
        <span className="w-2 h-2 rounded-full bg-[#D4AF37] inline-block"></span>
        <span>Meezan Bank</span>
      </div>

      {/* HBL (Habib Bank) */}
      <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#008269] text-white rounded-lg shadow-xs text-[10px] font-bold border border-[#006854]">
        <span className="font-serif font-black">HBL</span>
      </div>

      {/* Bank Alfalah */}
      <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#BF1E2E] text-white rounded-lg shadow-xs text-[10px] font-bold border border-[#991825]">
        <span>Alfalah</span>
      </div>

      {/* Raast / 1-Link Instant IBFT */}
      <div className="inline-flex items-center gap-1 px-2 py-1 bg-[#0B4F26] text-white rounded-lg shadow-xs text-[9px] font-bold border border-[#083b1c]">
        <span>⚡ Raast / 1-Link</span>
      </div>
    </div>
  );
}

// 12. Combined Credit & Debit Cards Array
export function CardLogos({ className = "" }) {
  return (
    <div className={`inline-flex items-center gap-2 flex-wrap ${className}`}>
      <VisaLogo />
      <MastercardLogo />
      <PayPakLogo />
      <UnionPayLogo />
    </div>
  );
}

// 13. Official Cash on Delivery (COD) Luxury Badge
export function CODLogo({ className = "" }) {
  return (
    <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#141410] border border-[#d4af37]/40 rounded-xl text-white shadow-sm ${className}`}>
      <div className="w-5 h-5 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#f7e08b]">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
          <line x1="1" y1="10" x2="23" y2="10"></line>
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-bold text-[11px] text-[#f7e08b] tracking-wider uppercase">Cash on Delivery</span>
        <span className="text-[8px] font-mono text-gray-400">Pay at Doorstep • All Pakistan</span>
      </div>
    </div>
  );
}
