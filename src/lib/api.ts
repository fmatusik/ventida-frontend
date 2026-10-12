import axios, { AxiosInstance } from "axios";
import { clearToken, getToken } from "@/lib/auth";

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

// Dołącza token JWT
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Wygasły/nieprawidłowy token: czyścimy sesję. Przekierowanie na /login robią
// chronione strony (useRequireAuth), więc strony publiczne działają dalej.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url: string = error.config?.url ?? "";
    if (error.response?.status === 401 && !url.includes("/auth/login") && getToken()) {
      clearToken();
    }
    return Promise.reject(error);
  },
);

export default api;
