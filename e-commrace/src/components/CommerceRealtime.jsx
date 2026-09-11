import { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { API_BASE_URL, expireSession, refreshAccessToken } from "../axiosConfig";
import { getAccessToken } from "../utils/session";
import { playOrderChime, showPushNotification } from "../utils/pwaNotifications";

const RealtimeContext = createContext({ connected: false, notifications: [], clearNotifications: () => {} });
export const useCommerceRealtime = () => useContext(RealtimeContext);
const events = ["new_order", "low_stock", "new_review", "new_user_registered", "order_status_updated", "admin_order_updated"];
const currency = (value) => `PKR ${Number(value || 0).toLocaleString("en-PK")}`;
const broadcast = (name, detail) => window.dispatchEvent(new CustomEvent(`commerce:${name}`, { detail }));

function describeEvent(name, data) {
  const orderLink = data.orderId ? `/admin/orders/${data.orderId}` : "/admin/orders";
  switch (name) {
    case "new_order": return { title: "New order received", detail: `${currency(data.totalAmount)} from ${data.customerName || "a customer"}`, link: orderLink };
    case "low_stock": return { title: "Low stock alert", detail: `${data.title || "A product"}: ${data.stock ?? 0} units remaining`, link: "/admin/products" };
    case "new_review": return { title: `New ${data.rating || ""}-star review`, detail: data.comment || "A customer shared their experience.", link: "/admin/reviews" };
    case "new_user_registered": return { title: "New customer registered", detail: `${data.fullname || "Customer"}${data.email ? ` · ${data.email}` : ""}`, link: "/admin/users" };
    case "admin_order_updated": return { title: "Order updated", detail: `${data.customerName || "Order"} · ${data.status || data.paymentStatus || "Details updated"}`, link: orderLink };
    default: return { title: "Your order has an update", detail: data.trackingNumber ? `${data.courier || "Courier"}: ${data.trackingNumber}` : `Order status: ${data.status || "updated"}`, link: data.orderId ? `/orders/${data.orderId}` : "/orders" };
  }
}

export default function CommerceRealtime({ children }) {
  const { isAuthenticated, user, role } = useSelector((state) => state.auth);
  const userId = user?._id || user?.id;
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setConnected(false);
    setNotifications([]);
    if (!isAuthenticated || !userId) return undefined;
    const isAdmin = role === "admin" || role === "superadmin";
    const socket = io(import.meta.env.VITE_SOCKET_URL || API_BASE_URL, {
      withCredentials: true,
      auth: (callback) => callback({ token: getAccessToken() || undefined }),
      reconnectionDelay: 1000,
      reconnectionDelayMax: 15000,
      timeout: 20000,
    });
    let active = true;
    let attemptedRefresh = false;
    const recentEvents = new Map();
    socket.on("connect", () => {
      if (!active) return;
      setConnected(true);
      attemptedRefresh = false;
      socket.emit("join_user_room", userId);
      if (isAdmin) socket.emit("join_admin_room");
      broadcast("reconnected", { userId });
    });
    socket.on("disconnect", () => { if (active) setConnected(false); });
    socket.on("connect_error", async (error) => {
      if (!active) return;
      setConnected(false);
      const unauthorized = [401, "UNAUTHORIZED", "TOKEN_EXPIRED"].includes(error.data?.code) || /unauthorized|jwt expired|token expired|authentication/i.test(error.message || "");
      if (!unauthorized || attemptedRefresh) return;
      attemptedRefresh = true;
      try { await refreshAccessToken(); if (active) socket.connect(); }
      catch (refreshError) { if (active && [400, 401, 403].includes(refreshError.response?.status)) expireSession(); }
    });
    events.forEach((name) => socket.on(name, (payload) => {
      if (!active) return;
      const data = payload && typeof payload === "object" ? payload : {};
      broadcast(name, data);
      if (!isAdmin && name !== "order_status_updated") return;
      const key = `${name}:${data.orderId || data.productId || data.reviewId || data.userId || ""}:${data.updatedAt || data.status || data.createdAt || ""}`;
      const now = Date.now();
      if (now - (recentEvents.get(key) || 0) < 2000) return;
      recentEvents.set(key, now);
      if (recentEvents.size > 100) recentEvents.delete(recentEvents.keys().next().value);
      const notification = { ...describeEvent(name, data), id: `${name}-${now}-${recentEvents.size}`, type: name, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
      setNotifications((previous) => [notification, ...previous].slice(0, 30));
      if (name === "new_order" || name === "new_user_registered") playOrderChime();
      if (name === "new_order" || name === "order_status_updated") {
        showPushNotification(notification.title, { body: notification.detail, url: notification.link });
      }
      if (name === "low_stock") toast.error(notification.detail, { id: key });
      else if (name !== "admin_order_updated") toast.success(`${notification.title}: ${notification.detail}`, { id: key, duration: 5000 });
    }));
    return () => {
      active = false;
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [isAuthenticated, userId, role]);

  return <RealtimeContext.Provider value={{ connected, notifications, clearNotifications: () => setNotifications([]) }}>{children}</RealtimeContext.Provider>;
}
