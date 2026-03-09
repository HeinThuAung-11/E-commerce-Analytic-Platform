import { useEffect, useState } from "react";

import {
  getCategoryDistribution,
  getOrderTrend,
  getOrderStatusMix,
  getOrders,
  getOverview,
  getProducts,
  getRevenueByStatus,
  getRevenue,
  getTopProducts,
  type CategoryDistributionPoint,
  type OrderTrendPoint,
  type OrderItem,
  type OrderStatusMixPoint,
  type OverviewResponse,
  type ProductItem,
  type RevenueByStatusPoint,
  type RevenueRange,
  type TopProduct,
} from "./analytics.service";

const revenueRanges: RevenueRange[] = ["7d", "30d", "90d"];

type RevenueByRange = Record<RevenueRange, string>;

function isNotFoundError(reason: unknown): boolean {
  if (!reason || typeof reason !== "object") {
    return false;
  }

  const maybeResponse = (reason as { response?: { status?: number } }).response;
  return maybeResponse?.status === 404;
}

export function useDashboardData(selectedRange: RevenueRange) {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [orderStatusMix, setOrderStatusMix] = useState<OrderStatusMixPoint[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [orderTrend, setOrderTrend] = useState<OrderTrendPoint[]>([]);
  const [revenueByStatus, setRevenueByStatus] = useState<RevenueByStatusPoint[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<CategoryDistributionPoint[]>([]);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [apiVersionMismatch, setApiVersionMismatch] = useState(false);
  const [revenueByRange, setRevenueByRange] = useState<RevenueByRange>({
    "7d": "0",
    "30d": "0",
    "90d": "0",
  });

  useEffect(() => {
    async function loadDashboard(): Promise<void> {
      setIsLoading(true);
      setErrorMessage(null);

      const [
        overviewResult,
        productsResult,
        revenue7dResult,
        revenue30dResult,
        revenue90dResult,
      ] = await Promise.allSettled([
        getOverview(),
        getProducts(1, 50),
        getRevenue("7d"),
        getRevenue("30d"),
        getRevenue("90d"),
      ]);

      let failedRequests = 0;

      if (overviewResult.status === "fulfilled") {
        setOverview(overviewResult.value);
      } else {
        failedRequests += 1;
      }

      if (productsResult.status === "fulfilled") {
        setProducts(productsResult.value.items);
      } else {
        failedRequests += 1;
      }

      const nextRevenueByRange: RevenueByRange = {
        "7d": "0",
        "30d": "0",
        "90d": "0",
      };

      if (revenue7dResult.status === "fulfilled") {
        nextRevenueByRange["7d"] = revenue7dResult.value.revenue;
      } else {
        failedRequests += 1;
      }

      if (revenue30dResult.status === "fulfilled") {
        nextRevenueByRange["30d"] = revenue30dResult.value.revenue;
      } else {
        failedRequests += 1;
      }

      if (revenue90dResult.status === "fulfilled") {
        nextRevenueByRange["90d"] = revenue90dResult.value.revenue;
      } else {
        failedRequests += 1;
      }

      setRevenueByRange(nextRevenueByRange);

      if (failedRequests > 0) {
        setErrorMessage("Some dashboard sections failed to load. Showing available data.");
      }

      setLastUpdatedAt(new Date().toISOString());
      setIsLoading(false);
    }

    void loadDashboard();
  }, []);

  useEffect(() => {
    async function loadRangeCharts(): Promise<void> {
      setIsLoading(true);
      setErrorMessage(null);
      setApiVersionMismatch(false);
      const [
        ordersResult,
        trendResult,
        revenueByStatusResult,
        topProductsResult,
        orderStatusMixResult,
        categoryDistributionResult,
      ] = await Promise.allSettled([
        getOrders(1, 50, selectedRange),
        getOrderTrend(selectedRange),
        getRevenueByStatus(selectedRange),
        getTopProducts(selectedRange),
        getOrderStatusMix(selectedRange),
        getCategoryDistribution(selectedRange),
      ]);

      let failedRequests = 0;

      if (ordersResult.status === "fulfilled") {
        setOrders(ordersResult.value.items);
      } else {
        failedRequests += 1;
      }

      if (trendResult.status === "fulfilled") {
        setOrderTrend(trendResult.value);
      } else {
        failedRequests += 1;
      }

      if (revenueByStatusResult.status === "fulfilled") {
        setRevenueByStatus(revenueByStatusResult.value);
      } else {
        failedRequests += 1;
      }

      if (topProductsResult.status === "fulfilled") {
        setTopProducts(topProductsResult.value);
      } else {
        failedRequests += 1;
      }

      if (orderStatusMixResult.status === "fulfilled") {
        setOrderStatusMix(orderStatusMixResult.value);
      } else {
        failedRequests += 1;
      }

      if (categoryDistributionResult.status === "fulfilled") {
        setCategoryDistribution(categoryDistributionResult.value);
      } else {
        failedRequests += 1;
      }

      if (
        (trendResult.status === "rejected" && isNotFoundError(trendResult.reason)) ||
        (revenueByStatusResult.status === "rejected" && isNotFoundError(revenueByStatusResult.reason)) ||
        (topProductsResult.status === "rejected" && isNotFoundError(topProductsResult.reason)) ||
        (orderStatusMixResult.status === "rejected" && isNotFoundError(orderStatusMixResult.reason)) ||
        (categoryDistributionResult.status === "rejected" &&
          isNotFoundError(categoryDistributionResult.reason))
      ) {
        setApiVersionMismatch(true);
      }

      if (failedRequests > 0) {
        setErrorMessage("Some dashboard sections failed to load. Showing available data.");
      }

      if (
        ordersResult.status === "fulfilled" ||
        trendResult.status === "fulfilled" ||
        revenueByStatusResult.status === "fulfilled"
      ) {
        setLastUpdatedAt(new Date().toISOString());
      }

      setIsLoading(false);
    }

    void loadRangeCharts();
  }, [selectedRange]);

  return {
    isLoading,
    errorMessage,
    overview,
    topProducts,
    orderStatusMix,
    orders,
    products,
    orderTrend,
    revenueByStatus,
    categoryDistribution,
    lastUpdatedAt,
    apiVersionMismatch,
    revenueByRange,
    revenueRanges,
  };
}
