export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
export const SORTS = { newest: "Newest arrivals", "price-asc": "Price: low to high", "price-desc": "Price: high to low", popular: "Best sellers", rating: "Top rated" };
const numberParam = (value) => value !== null && value !== "" && Number.isFinite(Number(value)) && Number(value) >= 0 ? String(Number(value)) : "";
export function readFilters(params) {
  const sort = ({ "price-low": "price-asc", "price-high": "price-desc", featured: "newest" })[params.get("sort")] || params.get("sort");
  const rawSize = params.get("sizes") || params.get("size") || "";
  const stitching = (params.get("stitching") || "").toLowerCase();
  return {
    search: (params.get("search") || "").trim(), category: params.get("category") || "",
    fabric: params.get("fabric") || "", minPrice: numberParam(params.get("minPrice")), maxPrice: numberParam(params.get("maxPrice")),
    sizes: [...new Set(rawSize.toUpperCase().split(",").filter((size) => SIZES.includes(size)))],
    stitching: ["stitched", "unstitched"].includes(stitching) ? stitching : "",
    inStock: params.get("inStock") === "true", sale: params.get("sale") === "true",
    sort: SORTS[sort] ? sort : "newest",
  };
}
export const sellingPrice = (product) => Number(product.discountPrice) > 0 && Number(product.discountPrice) < Number(product.price) ? Number(product.discountPrice) : Number(product.price) || 0;
export function availableSizes(product) {
  if (product.sizeVariants?.length) return product.sizeVariants.filter((variant) => variant.isAvailable !== false && Number(variant.stock) > 0).map((variant) => String(variant.size).toUpperCase());
  return Number(product.stock) > 0 ? (product.sizes || []).map((size) => String(size).toUpperCase()) : [];
}
export function stitchingType(product) {
  const explicit = product.stitchingType || product.stitching;
  if (explicit) return String(explicit).toLowerCase() === "unstitched" ? "unstitched" : "stitched";
  const text = `${product.title || ""} ${product.category?.name || ""} ${(product.tags || []).join(" ")}`;
  if (/\bunstitched\b/i.test(text)) return "unstitched";
  if (/\bstitched\b|ready.to.wear|\bpret\b/i.test(text)) return "stitched";
  return "";
}
export function filterCatalog(products, filters, categories = []) {
  const category = categories.find((item) => [item._id, item.slug].includes(filters.category));
  const categoryTokens = [filters.category, category?._id, category?.slug].filter(Boolean);
  return products.filter((product) => {
    if (product.isActive === false) return false;
    // Apply the intersection locally too: older gateways can overwrite their
    // fabric predicate with search, or ignore an unknown category slug.
    if (filters.category) {
      const values = typeof product.category === "string" ? [product.category] : [product.category?._id, product.category?.slug];
      if (!values.some((value) => value && categoryTokens.includes(value))) return false;
    }
    if (filters.search) {
      const text = [product.title, product.description, ...(product.tags || [])].filter(Boolean).join(" ").toLowerCase();
      if (!text.includes(filters.search.toLowerCase())) return false;
    }
    if (filters.fabric) {
      const text = [product.fabric, product.fabricType, product.productTypeTag].filter(Boolean).join(" ").toLowerCase();
      if (!text.includes(filters.fabric.toLowerCase())) return false;
    }
    if (filters.minPrice !== "" && Number(product.price) < Number(filters.minPrice)) return false;
    if (filters.maxPrice !== "" && Number(product.price) > Number(filters.maxPrice)) return false;
    if (filters.sizes.length && !availableSizes(product).some((size) => filters.sizes.includes(size))) return false;
    if (filters.stitching && stitchingType(product) !== filters.stitching) return false;
    if (filters.sale && !(sellingPrice(product) < Number(product.price))) return false;
    if (filters.inStock && Number(product.stock) <= 0) return false;
    return true;
  }).sort((a, b) => {
    if (filters.sort === "price-asc") return sellingPrice(a) - sellingPrice(b);
    if (filters.sort === "price-desc") return sellingPrice(b) - sellingPrice(a);
    if (filters.sort === "rating") return Number(b.averageRating ?? b.rating ?? 0) - Number(a.averageRating ?? a.rating ?? 0);
    if (filters.sort === "popular") return Number(b.analytics?.purchased || 0) - Number(a.analytics?.purchased || 0);
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });
}
