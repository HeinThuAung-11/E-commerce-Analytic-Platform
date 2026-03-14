const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const rawDemoMode = import.meta.env.VITE_DEMO_MODE;
const apiBaseUrl = (rawApiBaseUrl && rawApiBaseUrl.trim()) || "http://localhost:4000";
const demoMode = rawDemoMode === "true";

export const env = {
  apiBaseUrl: apiBaseUrl.replace(/\/+$/, ""),
  demoMode,
};
