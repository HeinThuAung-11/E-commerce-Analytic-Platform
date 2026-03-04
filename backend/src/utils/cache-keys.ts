import type { RevenueRange } from "../types/analytics";
import { deleteCacheKeys } from "./redis";

export const CACHE_TTL_SECONDS = 60;

export const analyticsCacheKeys = {
  overview: "analytics:overview",
  revenue: (range: RevenueRange): string => `analytics:revenue:${range}`,
  topProducts: "analytics:top-products",
};

export function getAnalyticsInvalidationKeys(): string[] {
  return [
    analyticsCacheKeys.overview,
    analyticsCacheKeys.revenue("7d"),
    analyticsCacheKeys.revenue("30d"),
    analyticsCacheKeys.revenue("90d"),
    analyticsCacheKeys.topProducts,
  ];
}

export async function invalidateAnalyticsCacheKeys(): Promise<void> {
  await deleteCacheKeys(getAnalyticsInvalidationKeys());
}
