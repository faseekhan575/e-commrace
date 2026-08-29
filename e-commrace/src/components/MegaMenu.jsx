import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Tag, ChevronDown } from "lucide-react";

export const MEGA_MENU_DATA = {
  "ready-to-wear": {
    label: "Ready to Wear",
    badge: "HOT SELLERS",
    columns: [
      {
        title: "Shop by Silhouette",
        links: [
          { label: "1-Piece Daily Kurtas", url: "/products?search=kurta" },
          { label: "2-Piece Co-Ord Sets", url: "/products?search=co-ord" },
          { label: "3-Piece Stitched Formals", url: "/products?search=stitched" },
          { label: "A-Line & Angrakha Frocks", url: "/products?search=angrakha" },
          { label: "Short Tunics & Fusion Tops", url: "/products?search=tunic" },
        ],
      },
      {
        title: "Shop by Fabric",
        links: [
          { label: "Printed Cambric (Signature)", url: "/products?search=cambric" },
          { label: "Embroidered Lawn", url: "/products?search=lawn" },
          { label: "Textured Dobby Cotton", url: "/products?search=cotton" },
          { label: "Jacquard Weaves", url: "/products?search=jacquard" },
          { label: "Silk Satin Pret", url: "/products?search=silk" },
        ],
      },
      {
        title: "Occasion & Color",
        links: [
          { label: "Everyday University/Office Wear", url: "/products" },
          { label: "Pastel Spring Palette", url: "/products?search=floral" },
          { label: "Bold Festive Hues", url: "/products?search=festive" },
          { label: "Monochrome Black & White", url: "/products?search=monochrome" },
        ],
      },
    ],
    featured: {
      title: "Summer '26 Pret Lookbook",
      subtitle: "Effortless floral cambrics tailored for the modern Pakistani woman.",
      image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80",
      link: "/products?category=ready-to-wear",
      badge: "Starting PKR 3,800",
    },
  },
  "unstitched": {
    label: "Unstitched Lawn",
    badge: "FESTIVE '26",
    columns: [
      {
        title: "Collections",
        links: [
          { label: "3-Piece Luxury Embroidered Lawn", url: "/products?search=unstitched" },
          { label: "2-Piece Shirt & Dupatta", url: "/products?search=dupatta" },
          { label: "2-Piece Shirt & Trouser", url: "/products?search=trouser" },
          { label: "1-Piece Unstitched Fabric", url: "/products?search=cambric" },
        ],
      },
      {
        title: "Dupatta Accents",
        links: [
          { label: "Pure Chiffon Dupatta", url: "/products?search=chiffon" },
          { label: "Embroidered Organza Border", url: "/products?search=organza" },
          { label: "Woven Jacquard Shawl", url: "/products?search=jacquard" },
          { label: "Printed Voile Dupatta", url: "/products?search=voile" },
        ],
      },
    ],
    featured: {
      title: "Festive Embroidered Lawn Vol. 1",
      subtitle: "Intricate laser-cut schiffli embroidery paired with pure printed silk dupattas.",
      image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80",
      link: "/products?category=unstitched-lawn",
      badge: "New Release",
    },
  },
  "luxury-pret": {
    label: "Luxury Pret & Formals",
    badge: "COUTURE",
    columns: [
      {
        title: "Couture Silhouettes",
        links: [
          { label: "Raw Silk Heavy Formals", url: "/products?search=silk" },
          { label: "Velvet Zari Embroidered", url: "/products?search=velvet" },
          { label: "Chiffon Wedding Guest Edit", url: "/products?search=chiffon" },
          { label: "Peshwas & Long Gowns", url: "/products?search=gowns" },
        ],
      },
      {
        title: "Craftsmanship",
        links: [
          { label: "Hand-Embellished Kora Dabka", url: "/products?search=zari" },
          { label: "Mirror Work & Resham", url: "/products?search=embroidered" },
          { label: "Pearl & Sequin Accents", url: "/products?search=festive" },
        ],
      },
    ],
    featured: {
      title: "Maria.B & Sapphire Signature Formals",
      subtitle: "Heirloom craftsmanship crafted on pure handspun silk.",
      image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=600&q=80",
      link: "/products?category=luxury-pret",
      badge: "Pure Silk 100%",
    },
  },
  "festive-velvet": {
    label: "Velvet & Festive",
    badge: "WEDDING EDIT",
    columns: [
      {
        title: "Velvet Silhouettes",
        links: [
          { label: "Micro Velvet 9000 Kurtas", url: "/products?search=velvet" },
          { label: "Embroidered Angrakha Suits", url: "/products?search=angrakha" },
          { label: "Velvet Shawl Ensemble Sets", url: "/products?search=shawl" },
          { label: "Peshwas & Royal Formals", url: "/products?search=festive" },
        ],
      },
      {
        title: "Embellishment Craft",
        links: [
          { label: "Handcrafted Zari & Dabka", url: "/products?search=zari" },
          { label: "Antique Gota & Tilla", url: "/products?search=embroidered" },
          { label: "Marori & Sitara Work", url: "/products?search=velvet" },
          { label: "Resham Threadwork", url: "/products?search=silk" },
        ],
      },
    ],
    featured: {
      title: "Royal Velvet & Festive Edit",
      subtitle: "Heirloom micro-velvets adorned with royal gold tilla and zari shawls.",
      image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80",
      link: "/products?search=velvet",
      badge: "Pure Micro Velvet",
    },
  },
  "special-offers": {
    label: "Special Offers / Sale",
    badge: "UP TO 40% OFF",
    columns: [
      {
        title: "Sale Highlights",
        links: [
          { label: "Flat 40% Off Ready to Wear", url: "/products?search=sale" },
          { label: "Flat 30% Off Unstitched Lawn", url: "/products?search=sale" },
          { label: "Under PKR 4,000 Steals", url: "/products?sortBy=price-low" },
          { label: "End of Season Clearance", url: "/products" },
        ],
      },
    ],
    featured: {
      title: "Mid-Season Clearance",
      subtitle: "Grab the most wanted eastern wardrobe pieces before stocks sell out!",
      image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80",
      link: "/products",
      badge: "Limited Stock",
    },
  },
};

export default function MegaMenu({ activeCategory, onClose }) {
  if (!activeCategory || !MEGA_MENU_DATA[activeCategory]) return null;

  const data = MEGA_MENU_DATA[activeCategory];

  return (
    <div
      onMouseLeave={onClose}
      className="absolute top-full left-0 w-full bg-white border-b border-t border-[#e8e8e0] shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8 items-start">

          {/* Links Columns */}
          <div className="col-span-8 grid grid-cols-3 gap-6">
            {data.columns.map((col, idx) => (
              <div key={idx} className="space-y-3">
                <h4 className="font-serif text-sm font-bold tracking-wider text-[#141410] uppercase border-b border-gray-100 pb-2">
                  {col.title}
                </h4>
                <ul className="space-y-2 text-xs">
                  {col.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link
                        to={link.url}
                        onClick={onClose}
                        className="text-[#666] hover:text-black hover:translate-x-1 inline-block transition-transform duration-150 py-0.5"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Featured Visual Highlight Card */}
          {data.featured && (
            <div className="col-span-4 pl-4 border-l border-gray-100">
              <Link
                to={data.featured.link}
                onClick={onClose}
                className="group block relative aspect-[4/3] rounded-sm overflow-hidden bg-[#f5f5f0] shadow-sm"
              >
                <img
                  src={data.featured.image}
                  alt={data.featured.title}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-4 text-white">
                  {data.featured.badge && (
                    <span className="self-start text-[9px] font-bold uppercase tracking-widest bg-white/20 backdrop-blur-md px-2 py-0.5 rounded mb-1.5 font-mono">
                      {data.featured.badge}
                    </span>
                  )}
                  <h5 className="font-serif text-base font-bold leading-tight group-hover:text-[#d4af37] transition-colors">
                    {data.featured.title}
                  </h5>
                  <p className="text-[11px] text-gray-300 line-clamp-1 mt-0.5">
                    {data.featured.subtitle}
                  </p>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37] mt-2 flex items-center gap-1">
                    Explore Collection <ArrowRight size={11} />
                  </span>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
