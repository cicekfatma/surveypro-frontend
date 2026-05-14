import axios from "axios";
import {
  AUTH_REDIRECT_REASONS,
  clearAuthSession,
  redirectToLogin,
} from "../auth/session";
export { getApiErrorMessage } from "./errorMessage";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

let isHandlingAuthError = false;

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || "";
    const skipAuthHandling = Boolean(error?.config?.skipAuthHandling);

    const shouldHandleAuthError =
      !skipAuthHandling &&
      (status === 401 || status === 403) &&
      !requestUrl.includes("/auth/login");

    if (shouldHandleAuthError && !isHandlingAuthError) {
      isHandlingAuthError = true;

      clearAuthSession();
      redirectToLogin(
        status === 403
          ? AUTH_REDIRECT_REASONS.forbidden
          : AUTH_REDIRECT_REASONS.expired
      );

      window.setTimeout(() => {
        isHandlingAuthError = false;
      }, 0);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
