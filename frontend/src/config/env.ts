const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const apiBaseUrl = (rawApiBaseUrl && rawApiBaseUrl.trim()) || "http://localhost:4000";

export const env = {
  apiBaseUrl: apiBaseUrl.replace(/\/+$/, ""),
};
