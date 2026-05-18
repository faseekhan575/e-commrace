import axios from "axios";

const instance = axios.create({
  baseURL: "https://e-commarce-v3jf.onrender.com",
  withCredentials: true,
});

// ─── REQUEST: attach token ───────────────────────────────────
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── RESPONSE: auto clear token only on 401 ─────────────────
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
    }
    return Promise.reject(error);
  }
);

export default instance;