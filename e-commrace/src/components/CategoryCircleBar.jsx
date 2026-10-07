import { useMemo } from "react";
import { Sparkles, Layers } from "lucide-react";
import { optimizeImage } from "../utils/imageOptimizer";

const DEFAULT_CATEGORY_IMAGES = {
  all: "/banners/pakistani-emerald-lawn.jpg",
  "ready-to-wear": "/banners/pakistani-lilac-cambric.jpg",
  "unstitched-fabric": "/banners/pakistani-emerald-lawn.jpg",
  "luxury-pret": "/banners/pakistani-velvet-couture.jpg",
  "festive-collection": "/banners/pakistani-festive-pret.jpg",
  "velvet-festive": "/banners/pakistani-crimson-velvet.jpg",
  "west-fusion": "/categories/pakistani-raw-silk.jpg",
};

export default function CategoryCircleBar({
  categories = [],
  selectedCategory = "",
  onSelectCategory,
  totalProductsCount = 0,
  categoryCounts = {},
}) {
  return (
    <div className="w-full mb-6 sm:mb-8">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
          <span className="text-[10.5px] font-sans font-bold uppercase tracking-[0.22em] text-[#9c7830]">
            Explore By Silhouette & Edit
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#737168] hidden sm:inline">
          {categories.length + 1} Collections Available
        </span>
      </div>

      {/* Horizontal Scrollable Category Circles */}
      <div className="flex items-start gap-4 sm:gap-6 overflow-x-auto pb-3 pt-1 px-1 scrollbar-none snap-x select-none">
        
        {/* 1. All Products / Master Collection Circle */}
        <button
          type="button"
          onClick={() => onSelectCategory("")}
          className="flex flex-col items-center gap-2 flex-shrink-0 group cursor-pointer snap-start"
        >
          <div
            className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-[2px] transition-all duration-300 ${
              !selectedCategory
                ? "ring-2 ring-[#0e0e0c] ring-offset-2 bg-gradient-to-tr from-[#c5a059] to-[#0e0e0c] shadow-md scale-105"
                : "ring-1 ring-[#e5e3dc] group-hover:ring-[#0e0e0c] group-hover:scale-102"
            }`}
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-[#141410] relative">
              <img
                src={optimizeImage(DEFAULT_CATEGORY_IMAGES.all, { width: 160 })}
                alt="All Collections"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            </div>

            {/* Active Indicator Pin */}
            {!selectedCategory && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#0e0e0c] text-[#d4af37] rounded-full flex items-center justify-center text-[9px] shadow-sm font-bold border border-white">
                ✓
              </span>
            )}
          </div>

          <div className="text-center max-w-[80px] sm:max-w-[90px]">
            <p
              className={`text-xs font-serif leading-tight transition-colors line-clamp-1 ${
                !selectedCategory
                  ? "font-bold text-[#0e0e0c]"
                  : "text-[#4a4941] group-hover:text-[#0e0e0c]"
              }`}
            >
              All Pieces
            </p>
            <span
              className={`text-[10px] font-mono block mt-0.5 ${
                !selectedCategory
                  ? "text-[#9c7830] font-semibold"
                  : "text-[#8c897e]"
              }`}
            >
              {totalProductsCount ? `${totalProductsCount}` : "All"}
            </span>
          </div>
        </button>

        {/* 2. Individual Category Circles */}
        {categories.map((cat, idx) => {
          const catKey = cat.slug || cat._id || `cat-${idx}`;
          const isSelected = [cat._id, cat.slug].includes(selectedCategory);
          const imgUrl =
            cat.image?.url ||
            cat.image ||
            DEFAULT_CATEGORY_IMAGES[cat.slug] ||
            "/banners/pakistani-festive-lawn.jpg";

          const count =
            categoryCounts[cat._id] ||
            categoryCounts[cat.slug] ||
            cat.productCount ||
            null;

          return (
            <button
              key={catKey}
              type="button"
              onClick={() => onSelectCategory(cat.slug || cat._id)}
              className="flex flex-col items-center gap-2 flex-shrink-0 group cursor-pointer snap-start"
            >
              <div
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-[2px] transition-all duration-300 ${
                  isSelected
                    ? "ring-2 ring-[#0e0e0c] ring-offset-2 bg-gradient-to-tr from-[#c5a059] to-[#0e0e0c] shadow-md scale-105"
                    : "ring-1 ring-[#e5e3dc] group-hover:ring-[#0e0e0c] group-hover:scale-102"
                }`}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-[#141410] relative">
                  <img
                    src={optimizeImage(imgUrl, { width: 160 })}
                    alt={cat.name}
                    className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/15 group-hover:bg-black/5 transition-colors" />
                </div>

                {isSelected && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#0e0e0c] text-[#d4af37] rounded-full flex items-center justify-center text-[9px] shadow-sm font-bold border border-white">
                    ✓
                  </span>
                )}
              </div>

              <div className="text-center max-w-[80px] sm:max-w-[95px]">
                <p
                  className={`text-xs font-serif leading-tight transition-colors line-clamp-1 ${
                    isSelected
                      ? "font-bold text-[#0e0e0c]"
                      : "text-[#4a4941] group-hover:text-[#0e0e0c]"
                  }`}
                  title={cat.name}
                >
                  {cat.name}
                </p>
                <span
                  className={`text-[10px] font-mono block mt-0.5 ${
                    isSelected
                      ? "text-[#9c7830] font-semibold"
                      : "text-[#8c897e]"
                  }`}
                >
                  {count !== null ? `${count} items` : "Explore"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
