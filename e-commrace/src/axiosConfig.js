import axios from "axios";

const instance = axios.create({
  baseURL: "https://e-commarce-v3jf.onrender.com",
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default instance;