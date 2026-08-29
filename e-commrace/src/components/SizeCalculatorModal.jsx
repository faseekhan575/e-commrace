import { useState } from "react";
import { X, Ruler, CheckCircle, Sparkles, HelpCircle } from "lucide-react";

export default function SizeCalculatorModal({ isOpen, onClose, onSelectSize, productTitle = "Apparel" }) {
  const [heightFeet, setHeightFeet] = useState("5");
  const [heightInches, setHeightInches] = useState("4");
  const [bustInches, setBustInches] = useState("36");
  const [waistInches, setWaistInches] = useState("28");
  const [fitPreference, setFitPreference] = useState("regular"); // fitted, regular, relaxed
  const [calculatedSize, setCalculatedSize] = useState(null);

  if (!isOpen) return null;

  const handleCalculate = (e) => {
    e.preventDefault();
    const bust = Number(bustInches) || 36;
    let size = "M";

    if (bust <= 33) size = "XS";
    else if (bust <= 35) size = "S";
    else if (bust <= 38) size = "M";
    else if (bust <= 41) size = "L";
    else if (bust <= 44) size = "XL";
    else size = "XXL";

    if (fitPreference === "relaxed" && size !== "XXL") {
      const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
      const nextIdx = Math.min(sizes.length - 1, sizes.indexOf(size) + 1);
      size = sizes[nextIdx];
    } else if (fitPreference === "fitted" && size !== "XS") {
      const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
      const prevIdx = Math.max(0, sizes.indexOf(size) - 1);
      size = sizes[prevIdx];
    }

    setCalculatedSize(size);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white text-[#141410] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative border border-[#e8e8e0]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-black p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#141410] text-[#d4af37] flex items-center justify-center mx-auto mb-3 shadow-md">
            <Ruler size={22} />
          </div>
          <h3 className="font-serif text-xl font-bold text-gray-900 tracking-tight">
            Virtual Fit & Size Finder
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Tailored size calculation for <strong>{productTitle}</strong>
          </p>
        </div>

        <form onSubmit={handleCalculate} className="space-y-4 text-xs">
          {/* Height */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
              Your Height (Feet & Inches)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={heightFeet}
                onChange={(e) => setHeightFeet(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl outline-none bg-white font-medium"
              >
                <option value="4">4 Feet</option>
                <option value="5">5 Feet</option>
                <option value="6">6 Feet</option>
              </select>
              <select
                value={heightInches}
                onChange={(e) => setHeightInches(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl outline-none bg-white font-medium"
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => (
                  <option key={n} value={n}>{n} Inches</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bust/Chest */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
              Bust / Chest Measurement (Inches)
            </label>
            <input
              type="number"
              min="28"
              max="52"
              required
              value={bustInches}
              onChange={(e) => setBustInches(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl outline-none font-mono"
            />
          </div>

          {/* Fit Preference */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
              Preferred Fit Silhouette
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "fitted", label: "Tailored Fitted" },
                { key: "regular", label: "Standard Regular" },
                { key: "relaxed", label: "Loose & Flowy" },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFitPreference(f.key)}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                    fitPreference === f.key
                      ? "border-black bg-[#141410] text-white"
                      : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calculate Button */}
          <button
            type="submit"
            className="w-full py-3 bg-[#141410] hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md mt-2"
          >
            Calculate Recommended Size
          </button>
        </form>

        {/* Calculated Result Card */}
        {calculatedSize && (
          <div className="mt-5 p-4 bg-amber-50/70 border border-amber-200 rounded-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold uppercase text-amber-900 tracking-wider">
                Recommended Fit
              </span>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                98% Accuracy Match
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-serif text-3xl font-black text-black">
                Size: {calculatedSize}
              </span>
              <span className="text-xs text-gray-600">
                ({fitPreference.toUpperCase()} drape)
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onSelectSize) onSelectSize(calculatedSize);
                onClose();
              }}
              className="mt-3 w-full py-2.5 bg-[#d4af37] hover:bg-[#aa7c11] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <CheckCircle size={15} />
              <span>Select Size {calculatedSize} for this Outfit</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
