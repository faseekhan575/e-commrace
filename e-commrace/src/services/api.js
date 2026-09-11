import http from "../axiosConfig";

export const errorMessage = (error) => typeof error === "string" ? error : error?.response?.data?.message || error?.message || "Something went wrong. Please try again.";
export const listData = (data, key) => Array.isArray(data) ? data : Array.isArray(data?.[key]) ? data[key] : [];
const segment = (id) => encodeURIComponent(id);
const get = async (url, params, signal) => (await http.get(url, { params, signal })).data.data;
const send = async (method, url, data) => (await http.request({ method, url, data })).data.data;
const resource = (base) => ({
  list: (params, signal) => get(base, params, signal),
  detail: (id, signal) => get(`${base}/${segment(id)}`, undefined, signal),
  admin: (params, signal) => get(`${base}/admin/all`, params, signal),
  create: (data) => send("post", `${base}/create`, data),
  update: (id, data) => send("patch", `${base}/${segment(id)}/update`, data),
  remove: (id) => send("delete", `${base}/${segment(id)}/delete`),
  toggle: (id) => send("patch", `${base}/${segment(id)}/toggle-active`),
});
const p = "/api/v3/product";
export const api = {
  auth: Object.fromEntries(["register", "verify-otp", "resend-otp", "login", "refresh-token", "forgot-password", "reset-password", "logout"].map((name) => [name, (data) => send("post", `/api/v1/auth/${name}`, data)])),
  me: () => get("/api/v1/auth/me"),
  profile: {
    get: () => get("/api/v2/user/profile"),
    update: (data) => send("patch", "/api/v2/user/profile/update", data),
    avatar: (file) => { const data = new FormData(); data.append("avatar", file); return send("patch", "/api/v2/user/avatar", data); },
    password: (data) => send("patch", "/api/v2/user/password", data),
    remove: () => send("delete", "/api/v2/user/delete"),
  },
  products: {
    ...resource(p),
    hot: (params) => get(`${p}/hot`, params),
    topSelling: (params) => get(`${p}/top-selling`, params),
    fabrics: (signal) => get(`${p}/fabrics`, undefined, signal),
    lowStock: (threshold = 5) => get(`${p}/admin/low-stock`, { threshold }),
    stock: (id, stock) => send("patch", `${p}/${segment(id)}/stock`, { stock }),
    toggleHot: (id) => send("patch", `${p}/${segment(id)}/toggle-hot`),
    toggleSize: (id, size) => send("patch", `${p}/${segment(id)}/toggle-size`, { size }),
    sizeStock: (id, size, stock) => send("patch", `${p}/${segment(id)}/size-stock`, { size, stock }),
    analytics: (id) => get(`${p}/${segment(id)}/analytics`),
    addImages: (id, data) => send("post", `${p}/${segment(id)}/image/add`, data),
    cover: (id, public_id) => send("patch", `${p}/${segment(id)}/image/set-default`, { public_id }),
    hover: (id, public_id) => send("patch", `${p}/${segment(id)}/image/set-hover`, { public_id }),
    reorder: (id, imageOrder) => send("patch", `${p}/${segment(id)}/image/reorder`, { imageOrder, public_ids: imageOrder }),
    removeImage: (id, public_id) => send("delete", `${p}/${segment(id)}/image/delete`, { public_id }),
  },
  categories: {
    ...resource("/api/v4/category"),
    hot: (params) => get("/api/v4/category/hot", params),
    products: (id, params) => get(`/api/v4/category/${segment(id)}/products`, params),
    toggleHot: (id) => send("patch", `/api/v4/category/${segment(id)}/toggle-hot`),
  },
  cart: {
    get: () => get("/api/v5/cart"),
    add: (data) => send("post", "/api/v5/cart/add", data),
    quantity: (itemId, quantity) => send("patch", "/api/v5/cart/quantity", { itemId, quantity }),
    remove: (itemId) => send("delete", "/api/v5/cart/remove", { itemId }),
    clear: () => send("delete", "/api/v5/cart/clear"),
  },
  orders: {
    place: (data) => send("post", "/api/v6/order/place", data),
    mine: () => get("/api/v6/order/my"),
    all: (params, signal) => get("/api/v6/order/all", params, signal),
    detail: (id) => get(`/api/v6/order/${segment(id)}`),
    cancel: (id) => send("patch", `/api/v6/order/${segment(id)}/cancel`),
    status: (id, data) => send("patch", `/api/v6/order/${segment(id)}/status`, data),
    tracking: (id, data) => send("patch", `/api/v6/order/${segment(id)}/tracking`, data),
    download: async () => (await http.get("/api/v6/order/download", { responseType: "blob" })).data,
  },
  reviews: {
    list: (id, params) => get(`/api/v7/review/${segment(id)}`, params),
    admin: (params, signal) => get("/api/v7/review/admin/all", params, signal),
    add: (id, data) => send("post", `/api/v7/review/${segment(id)}/add`, data),
    remove: (id) => send("delete", `/api/v7/review/${segment(id)}/delete`),
  },
  customers: {
    list: (params, signal) => get("/api/v8/admin/users", params, signal),
    detail: (id) => get(`/api/v8/admin/users/${segment(id)}`),
    remove: (id) => send("delete", `/api/v8/admin/users/${segment(id)}`),
  },
  dashboard: {
    stats: () => get("/api/v9/dashboard/stats"),
    live: () => get("/api/v9/dashboard/live-orders"),
    monthly: (year) => get("/api/v9/dashboard/monthly-orders", { year }),
    inventory: () => get("/api/v9/dashboard/inventory-summary"),
    order: (id) => get(`/api/v9/dashboard/order/${segment(id)}`),
  },
  banners: { ...resource("/api/v10/banner"), collection: (type) => get(`/api/v10/banner/collection/${segment(type)}`) },
  spotlights: { ...resource("/api/v11/spotlight"), homepage: () => get("/api/v11/spotlight/homepage") },
  health: async () => (await http.get("/api/health")).data,
};

// Size and stitching are client filters in the API contract. Collect all server
// pages before applying these filters so matches are never lost at page edges.
export async function collectPages(fetchPage, params = {}, key = "products", signal) {
  const first = await fetchPage({ ...params, page: 1, limit: 100 }, signal);
  const items = [...listData(first, key)];
  const pages = Math.max(1, Number(first?.totalPages) || 1);
  for (let page = 2; page <= pages; page++) {
    signal?.throwIfAborted();
    const next = await fetchPage({ ...params, page, limit: 100 }, signal);
    items.push(...listData(next, key));
  }
  const unique = [...new Map(items.map((item) => [item._id || item.id, item])).values()];
  return { ...first, [key]: unique, totalProducts: unique.length, totalPages: 1, currentPage: 1 };
}
