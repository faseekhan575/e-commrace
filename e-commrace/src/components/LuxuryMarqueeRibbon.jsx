export default function LuxuryMarqueeRibbon() {
  const marqueeStatements = [
    "ATELIER SPRING / SUMMER '26 DROP IS LIVE",
    "PURE EGYPTIAN COMBED CAMBRIC & LUXURY RAW SILK",
    "COMPLIMENTARY EXPRESS DISPATCH ACROSS PAKISTAN",
    "BESPOKE HAND-EMBELLISHED ZARI & KORA DABKA",
    "7-DAY EFFORTLESS DOORSTEP SIZE EXCHANGE",
    "SEAMLESS COD & ENCRYPTED DIGITAL PAYMENTS",
  ];

  return (
    <div className="bg-[#0e0e0c] border-y border-[#262620] py-3 overflow-hidden text-[#e8e6df] relative select-none">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {/* Render twice for continuous seamless infinite loop */}
        {[...marqueeStatements, ...marqueeStatements].map((statement, idx) => (
          <div
            key={idx}
            className="flex items-center gap-6 mx-6 text-[10.5px] sm:text-[11.5px] font-sans font-medium tracking-[0.26em] uppercase flex-shrink-0 text-[#dedcd3]"
          >
            <span className="text-[#c5a059] text-xs">✦</span>
            <span>{statement}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

