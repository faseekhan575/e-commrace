export const productId = (product) => typeof product === "string" ? product : String(product?._id || product?.id || "");
export const productPrice = (product) => {
  const regular = Number(product?.price);
  const sale = Number(product?.discountPrice);
  if (product?.discountPrice != null && sale > 0 && sale < regular) return sale;
  return Number.isFinite(regular) && regular >= 0 ? regular : 0;
};
export const cartItemPrice = (item) => {
  const price = item?.priceAtPurchase ?? item?.price;
  return price != null && Number.isFinite(Number(price)) ? Number(price) : productPrice(item?.product);
};
export const money = (value) => `PKR ${Number(value || 0).toLocaleString("en-PK", { maximumFractionDigits: 2 })}`;
export const productSizes = (product) => [...new Set([
  ...(product?.sizes || []).map((size) => typeof size === "string" ? size : size?.size),
  ...(product?.sizeVariants || []).map((variant) => variant.size),
].filter(Boolean))];
export const productColors = (product) => [...new Set([
  ...(product?.colors || []).map((color) => typeof color === "string" ? color : color?.name || color?.color),
  ...(product?.colorVariants || []).map((color) => typeof color === "string" ? color : color?.name || color?.color),
].filter(Boolean))];
export const availableStock = (product, size) => {
  if (!product || product.isActive === false) return 0;
  const variant = product.sizeVariants?.find((entry) => String(entry.size).toLowerCase() === String(size).toLowerCase());
  if (variant?.isAvailable === false || (product.sizeVariants?.length && !variant)) return 0;
  const stock = variant?.stock ?? product.stock;
  return stock == null ? 0 : Math.max(0, Number(stock) || 0);
};
export const firstAvailableSize = (product) => productSizes(product).find((size) => availableStock(product, size) > 0) || "";
export const cartItemId = (item) => String(item?._id || `guest:${productId(item?.product || item?.productId)}:${item?.size || ""}:${item?.color || ""}`);
export const errorMessage = (error, fallback = "Something went wrong. Please try again.") => typeof error === "string" ? error : error?.response?.data?.message || error?.message || fallback;
export const imageUrl = (image) => typeof image === "string" ? image : image?.url || "";
export const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'%3E%3Crect width='600' height='800' fill='%23f1efe9'/%3E%3Cpath d='M210 320h180v180H210z' fill='none' stroke='%23c3baa6' stroke-width='2'/%3E%3Cpath d='M260 320v-25a40 40 0 0 1 80 0v25' fill='none' stroke='%23c3baa6' stroke-width='2'/%3E%3Ctext x='300' y='550' text-anchor='middle' fill='%23857b67' font-family='serif' font-size='20'%3EImage unavailable%3C/text%3E%3C/svg%3E";
export const safeTrackingUrl = (value) => {
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) ? url.href : null; }
  catch { return null; }
};
