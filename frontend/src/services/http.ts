import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import { env } from "../config/env";
import { clearAccessToken, getAccessToken, setAccessToken } from "../features/auth/token-store";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const refreshClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
});

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
});

let refreshPromise: Promise<string | null> | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<{ data: { accessToken: string } }>("/auth/refresh", {})
      .then((response) => {
        const newAccessToken = response.data.data.accessToken;
        setAccessToken(newAccessToken);
        return newAccessToken;
      })
      .catch(() => {
        clearAccessToken();
        if (unauthorizedHandler) {
          unauthorizedHandler();
        }
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableRequestConfig | undefined;
    const statusCode = error.response?.status;
    const isAuthEndpoint =
      config?.url?.includes("/auth/login") || config?.url?.includes("/auth/refresh");

    if (!config || statusCode !== 401 || config._retry || isAuthEndpoint) {
      throw error;
    }

    config._retry = true;

    const newToken = await refreshAccessToken();

    if (!newToken) {
      throw error;
    }

    config.headers.Authorization = `Bearer ${newToken}`;
    return apiClient(config);
  },
);
