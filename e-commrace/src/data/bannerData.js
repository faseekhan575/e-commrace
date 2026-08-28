export const DEFAULT_BANNERS = [
  {
    id: "banner-1",
    tagline: "SUMMER EDIT 2026",
    title: "Festive Lawn & Luxury Pret",
    subtitle: "A symphony of intricate schiffli embroidery, pure cambric weaves, and delicate organza dupattas designed for effortless grace.",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1920&q=85",
    mobileImage: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=85",
    ctaText: "Shop The Collection",
    ctaLink: "/products?category=ready-to-wear",
    theme: "light",
    active: true,
    badge: "NEW ARRIVALS",
  },
  {
    id: "banner-2",
    tagline: "ROYAL COUTURE",
    title: "Raw Silk & Velvet Formals",
    subtitle: "Exquisite hand-embellished zari work, kora dabka detailing, and timeless silhouettes for the festive wedding season.",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1920&q=85",
    mobileImage: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=85",
    ctaText: "Explore Formal Edit",
    ctaLink: "/products?category=luxury-pret",
    theme: "dark",
    active: true,
    badge: "LIMITED EDITION",
  },
  {
    id: "banner-3",
    tagline: "SIGNATURE CASUALS",
    title: "Printed Cambric & Daily Kurtas",
    subtitle: "Breathable pure Egyptian combed cottons with contemporary floral and geometric motifs tailored to perfection.",
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1920&q=85",
    mobileImage: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=85",
    ctaText: "Discover Ready to Wear",
    ctaLink: "/products",
    theme: "light",
    active: true,
    badge: "HOT SELLERS",
  },
];

const STORAGE_KEY = "sapphire_store_banners_v1";

export function getStoredBanners() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return DEFAULT_BANNERS;
}

export function saveStoredBanners(banners) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(banners));
    window.dispatchEvent(new Event("banners_updated"));
  } catch (e) {}
}
