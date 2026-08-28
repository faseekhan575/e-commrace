import React from "react";

// Official vector logos and luxury payment badges
export function EasypaisaLogo({ className = "h-7" }) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#00a859] rounded-lg text-white font-bold text-xs tracking-tight shadow-sm ${className}`}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="white" />
        <path d="M7 12H17M12 7V17" stroke="#00a859" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className="font-extrabold tracking-wide uppercase text-[11px]">easypaisa</span>
    </div>
  );
}

export function JazzCashLogo({ className = "h-7" }) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#ed1c24] rounded-lg text-white font-bold text-xs tracking-tight shadow-sm ${className}`}>
      <div className="w-4 h-4 rounded-full bg-[#ffcb05] flex items-center justify-center text-[#ed1c24] font-black text-[10px]">
        J
      </div>
      <span className="font-extrabold tracking-wide text-[11px]">JazzCash</span>
    </div>
  );
}

export function BankTransferLogos({ className = "h-6" }) {
  return (
    <div className={`inline-flex items-center gap-2 flex-wrap ${className}`}>
      {/* Meezan Bank badge */}
      <span className="px-2 py-0.5 rounded bg-[#4a154b] text-white text-[10px] font-bold">Meezan Bank</span>
      {/* HBL badge */}
      <span className="px-2 py-0.5 rounded bg-[#008269] text-white text-[10px] font-bold">HBL</span>
      {/* Bank Alfalah */}
      <span className="px-2 py-0.5 rounded bg-[#bf1e2e] text-white text-[10px] font-bold">Bank Alfalah</span>
      <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-semibold border">1-Link / IBFT</span>
    </div>
  );
}

export function CardLogos({ className = "" }) {
  return (
    <div className={`inline-flex items-center gap-2 flex-wrap ${className}`}>
      {/* VISA */}
      <div className="px-2 py-0.5 rounded bg-[#1a1f71] text-white text-[10px] font-black italic tracking-widest">
        VISA
      </div>
      {/* Mastercard */}
      <div className="px-2 py-0.5 rounded bg-[#222] text-white text-[10px] font-bold flex items-center gap-0.5">
        <span className="w-2.5 h-2.5 rounded-full bg-[#eb001b] inline-block opacity-90"></span>
        <span className="w-2.5 h-2.5 rounded-full bg-[#f79e1b] inline-block -ml-1.5 opacity-90"></span>
        <span className="ml-1 text-[9px]">Mastercard</span>
      </div>
      {/* PayPak */}
      <div className="px-2 py-0.5 rounded bg-[#00552b] text-white text-[9px] font-bold tracking-tight">
        PayPak
      </div>
      {/* UnionPay */}
      <div className="px-2 py-0.5 rounded bg-[#006064] text-white text-[9px] font-bold">
        UnionPay
      </div>
    </div>
  );
}

export function GooglePayLogo({ className = "" }) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-300 rounded-lg text-gray-800 text-xs font-semibold shadow-sm ${className}`}>
      <span className="font-bold text-[#4285F4]">G</span>
      <span className="font-bold text-[#EA4335]">o</span>
      <span className="font-bold text-[#FBBC05]">o</span>
      <span className="font-bold text-[#4285F4]">g</span>
      <span className="font-bold text-[#34A853]">l</span>
      <span className="font-bold text-[#EA4335]">e</span>
      <span className="text-gray-700 ml-0.5 font-bold">Pay</span>
    </div>
  );
}

export function ApplePayLogo({ className = "" }) {
  return (
    <div className={`inline-flex items-center gap-1 px-3 py-1 bg-black rounded-lg text-white text-xs font-semibold shadow-sm ${className}`}>
      <svg width="12" height="14" viewBox="0 0 170 170" fill="currentColor">
        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.08-7.71-7.94-12.04-14.58-6.19-9.5-11.07-20.2-14.64-32.1-3.57-11.9-5.36-23.08-5.36-33.54 0-15.65 4.09-28.53 12.28-38.64 8.19-10.11 18.23-15.28 30.12-15.52 4.36 0 9.29 1.13 14.79 3.39 5.51 2.26 9.4 3.44 11.69 3.54 1.9.1 5.86-1.12 11.87-3.67 6.01-2.54 11.21-3.68 15.6-3.41 11.53.59 20.89 4.88 28.09 12.87-10.14 6.17-15.11 14.88-14.92 26.13.2 8.78 3.52 16.14 9.97 22.08 6.45 5.94 14.15 9.25 23.09 9.94-2.18 6.81-5.15 14.07-8.91 21.78zM119.22 31.02c0-7.22 2.65-14.05 7.95-20.48 5.3-6.43 11.75-10.19 19.34-11.28.2 1.48.3 2.92.3 4.31 0 7.35-2.8 14.46-8.4 21.32-5.6 6.87-12.01 10.74-19.23 11.61.03-1.89.04-3.72.04-5.48z"/>
      </svg>
      <span>Pay</span>
    </div>
  );
}

export function SadaPayLogo({ className = "" }) {
  return (
    <div className={`inline-flex items-center gap-1 px-2.5 py-1 bg-[#ff5252] rounded-lg text-white text-xs font-bold shadow-sm ${className}`}>
      <span className="tracking-tight">SadaPay</span>
    </div>
  );
}

export function CODLogo({ className = "" }) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 bg-[#1a1a14] rounded-lg text-white text-xs font-bold shadow-sm ${className}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13"></rect>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
        <circle cx="5.5" cy="18.5" r="2.5"></circle>
        <circle cx="18.5" cy="18.5" r="2.5"></circle>
      </svg>
      <span>CASH ON DELIVERY (COD)</span>
    </div>
  );
}
