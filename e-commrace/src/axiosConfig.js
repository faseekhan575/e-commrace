import axios from "axios";
import { broadcastSessionEvent, getAccessToken, getSessionRevision, resetSessionCredentials, setAccessToken } from "./utils/session";

export const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:4000").replace(/\/+$/, "");
const options = { baseURL: API_BASE_URL, withCredentials: true, timeout: 25000 };
const instance = axios.create(options);
const refreshClient = axios.create(options);
let refreshPromise = null;

function isProtectedRequest(config) {
  const path = new URL(config.url, `${config.baseURL || API_BASE_URL}/`).pathname;
  if (path.startsWith("/api/v1/auth/")) return path === "/api/v1/auth/me";
  if (/^\/api\/v(2|5|6|8|9)\//.test(path)) return true;
  if (path.includes("/admin/")) return true;
  return (config.method || "get").toLowerCase() !== "get" && /^\/api\/v(3|4|7|10|11)\//.test(path);
}
export function expireSession() {
  resetSessionCredentials();
  broadcastSessionEvent("expired");
}
export async function refreshAccessToken() {
  if (!refreshPromise) {
    const revision = getSessionRevision();
    refreshPromise = refreshClient.post("/api/v1/auth/refresh-token", {}).then((response) => {
      if (revision !== getSessionRevision()) throw new axios.CanceledError("Session changed");
      if (response.data?.success === false) throw new Error(response.data.message || "Session refresh failed");
      const token = response.data?.data?.accessToken || null;
      setAccessToken(token);
      broadcastSessionEvent("refreshed", { token });
      return token;
    }).finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}
instance.interceptors.request.use((config) => {
  const token = getAccessToken();
  config.headers = axios.AxiosHeaders.from(config.headers);
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  else config.headers.delete("Authorization");
  config._sessionRevision ??= getSessionRevision();
  return config;
});
instance.interceptors.response.use(
  (response) => {
    if (response.data?.success === false) {
      return Promise.reject(new axios.AxiosError(response.data.message || "Request failed", "ERR_BAD_RESPONSE", response.config, response.request, response));
    }
    return response;
  },
  async (error) => {
    const config = error.config;
    if (!config || error.response?.status !== 401 || config.skipAuthRefresh || !isProtectedRequest(config)) throw error;
    if (config._sessionRevision !== getSessionRevision()) throw error;
    if (config._sessionRetry) { expireSession(); throw error; }
    config._sessionRetry = true;
    try { await refreshAccessToken(); }
    catch (refreshError) {
      if (config._sessionRevision === getSessionRevision() && [400, 401, 403].includes(refreshError.response?.status)) expireSession();
      throw refreshError;
    }
    if (config._sessionRevision !== getSessionRevision()) throw new axios.CanceledError("Session changed");
    return instance.request(config);
  }
);
export default instance;

