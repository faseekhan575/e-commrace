/**
 * Ultra High-Performance Cloudinary & Image Optimizer Utility
 * Automatically injects Cloudinary auto-format (f_auto -> AVIF/WebP),
 * intelligent compression (q_auto:good / q_auto:eco), responsive width resizing (w_xxx),
 * and DPR scaling for instant, zero-delay rendering in production.
 */

export function optimizeImage(url, { width = 800, quality = "auto:good", format = "auto" } = {}) {
  if (!url || typeof url !== "string") {
    return "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80";
  }

  // If it's a Cloudinary URL, inject transformations
  if (url.includes("cloudinary.com") && url.includes("/upload/")) {
    const parts = url.split("/upload/");
    const transformations = `f_${format},q_${quality},w_${width},c_limit,dpr_auto`;
    return `${parts[0]}/upload/${transformations}/${parts[1]}`;
  }

  // If it's an Unsplash URL, ensure auto-format and webp
  if (url.includes("images.unsplash.com")) {
    const urlObj = new URL(url);
    urlObj.searchParams.set("auto", "format");
    urlObj.searchParams.set("fit", "crop");
    urlObj.searchParams.set("w", String(width));
    urlObj.searchParams.set("q", "80");
    return urlObj.toString();
  }

  return url;
}

/**
 * Generates responsive srcset for ultra-sharp rendering on Retina/mobile screens
 */
export function getOptimizedSrcSet(url) {
  if (!url) return "";
  return `${optimizeImage(url, { width: 400 })} 400w, ${optimizeImage(url, { width: 800 })} 800w, ${optimizeImage(url, { width: 1200 })} 1200w`;
}
