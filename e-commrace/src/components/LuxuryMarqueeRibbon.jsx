import { Sparkles, Truck, ShieldCheck, Tag, RotateCcw, Lock, Flame } from "lucide-react";

export default function LuxuryMarqueeRibbon() {
  const tickerItems = [
    { icon: <Sparkles size={14} className="text-[#d4af37]" />, text: "HAUTE COUTURE & LUXURY PRET COLLECTION '26 LIVE" },
    { icon: <Truck size={14} className="text-blue-400" />, text: "SAME-DAY 4-HOUR BIKER DELIVERY IN LHR • KHI • ISB" },
    { icon: <Tag size={14} className="text-rose-400" />, text: "USE VOUCHER 'LUXURY10' FOR FLAT 10% OFF AT CHECKOUT" },
    { icon: <Lock size={14} className="text-emerald-400" />, text: "256-BIT SSL ENCRYPTED GATEWAYS: COD, EASYPAISA, JAZZCASH & CARDS" },
    { icon: <ShieldCheck size={14} className="text-amber-400" />, text: "100% PURE AUTHENTIC COMBED CAMBRIC & RAW SILK FABRICS" },
    { icon: <RotateCcw size={14} className="text-purple-400" />, text: "7-DAY COMPLIMENTARY DOORSTEP SIZE EXCHANGE NATIONWIDE" },
    { icon: <Flame size={14} className="text-amber-500" />, text: "FESTIVE EID ATELIER: BESPOKE HANDCRAFTED ZARI & DABKA" },
  ];

  return (
    <div className="bg-[#141410] border-y border-[#2a2a22] py-3.5 overflow-hidden text-white relative select-none">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {/* Render twice for continuous seamless infinite loop */}
        {[...tickerItems, ...tickerItems].map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2.5 mx-6 text-xs font-mono font-bold tracking-widest uppercase text-gray-200 flex-shrink-0"
          >
            {item.icon}
            <span>{item.text}</span>
            <span className="text-[#d4af37] font-serif font-normal text-sm ml-4">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
