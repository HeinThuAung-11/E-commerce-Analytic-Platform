import type { RevenueRange } from "../types/analytics";
import { deleteCacheKeys } from "./redis";

export const CACHE_TTL_SECONDS = 60;

export const analyticsCacheKeys = {
  overview: "analytics:overview",
  revenue: (range: RevenueRange): string => `analytics:revenue:${range}`,
  topProducts: (range: RevenueRange): string => `analytics:top-products:${range}`,
  orderTrend: (range: RevenueRange): string => `analytics:order-trend:${range}`,
  orderStatusMix: (range: RevenueRange): string => `analytics:order-status-mix:${range}`,
  revenueByStatus: (range: RevenueRange): string => `analytics:revenue-by-status:${range}`,
  categoryDistribution: (range: RevenueRange): string =>
    `analytics:category-distribution:${range}`,
};

export function getAnalyticsInvalidationKeys(): string[] {
  return [
    analyticsCacheKeys.overview,
    analyticsCacheKeys.revenue("7d"),
    analyticsCacheKeys.revenue("30d"),
    analyticsCacheKeys.revenue("90d"),
    analyticsCacheKeys.topProducts("7d"),
    analyticsCacheKeys.topProducts("30d"),
    analyticsCacheKeys.topProducts("90d"),
    analyticsCacheKeys.orderTrend("7d"),
    analyticsCacheKeys.orderTrend("30d"),
    analyticsCacheKeys.orderTrend("90d"),
    analyticsCacheKeys.orderStatusMix("7d"),
    analyticsCacheKeys.orderStatusMix("30d"),
    analyticsCacheKeys.orderStatusMix("90d"),
    analyticsCacheKeys.revenueByStatus("7d"),
    analyticsCacheKeys.revenueByStatus("30d"),
    analyticsCacheKeys.revenueByStatus("90d"),
    analyticsCacheKeys.categoryDistribution("7d"),
    analyticsCacheKeys.categoryDistribution("30d"),
    analyticsCacheKeys.categoryDistribution("90d"),
  ];
}

export async function invalidateAnalyticsCacheKeys(): Promise<void> {
  await deleteCacheKeys(getAnalyticsInvalidationKeys());
}
