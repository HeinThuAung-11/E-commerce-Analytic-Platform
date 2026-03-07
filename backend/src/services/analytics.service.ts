import type { Product } from "@prisma/client";

import {
  getCategoryDistributionSince,
  getOrderOverview,
  getOrderStatusMixSince,
  getOrderTrendSince,
  getPaginatedOrders,
  getRevenueByStatusSince,
  getRevenueSince,
  getTopProductsBySalesSince,
} from "../repositories/order.repository";
import { findPaginatedProducts } from "../repositories/product.repository";
import type { RevenueRange } from "../types/analytics";
import { revenueRangeDays } from "../types/analytics";
import { createAppError } from "../utils/app-error";
import {
  analyticsCacheKeys,
  CACHE_TTL_SECONDS,
  invalidateAnalyticsCacheKeys,
} from "../utils/cache-keys";
import { getCacheValue, setCacheValue } from "../utils/redis";

type PaginationInput = {
  page: number;
  limit: number;
  range?: RevenueRange;
};

export async function getOverview(): Promise<{
  totalRevenue: string;
  totalOrders: number;
  completedOrders: number;
  totalCustomers: number;
  totalProductsSold: number;
}> {
  const cacheKey = analyticsCacheKeys.overview;
  const cached = await getCacheValue<{
    totalRevenue: string;
    totalOrders: number;
    completedOrders: number;
    totalCustomers: number;
    totalProductsSold: number;
  }>(cacheKey);

  if (cached) {
    return cached;
  }

  const overview = await getOrderOverview();
  const result = {
    totalRevenue: overview.totalRevenue.toString(),
    totalOrders: overview.totalOrders,
    completedOrders: overview.completedOrders,
    totalCustomers: overview.totalCustomers,
    totalProductsSold: overview.totalProductsSold,
  };

  await setCacheValue(cacheKey, result, CACHE_TTL_SECONDS);

  return result;
}

export async function getRevenue(range: RevenueRange): Promise<{
  range: RevenueRange;
  revenue: string;
  startDate: string;
}> {
  const cacheKey = analyticsCacheKeys.revenue(range);
  const cached = await getCacheValue<{
    range: RevenueRange;
    revenue: string;
    startDate: string;
  }>(cacheKey);

  if (cached) {
    return cached;
  }

  const days = revenueRangeDays[range];
  const startDate = new Date();

  startDate.setDate(startDate.getDate() - days);

  const revenue = await getRevenueSince(startDate);

  const result = {
    range,
    revenue: revenue.toString(),
    startDate: startDate.toISOString(),
  };

  await setCacheValue(cacheKey, result, CACHE_TTL_SECONDS);

  return result;
}

export async function getTopProducts(range: RevenueRange): Promise<
  Array<{
    productId: string;
    productName: string;
    category: string;
    totalQuantity: number;
    totalRevenue: string;
  }>
> {
  const cacheKey = analyticsCacheKeys.topProducts(range);
  const cached = await getCacheValue<
    Array<{
      productId: string;
      productName: string;
      category: string;
      totalQuantity: number;
      totalRevenue: string;
    }>
  >(cacheKey);

  if (cached) {
    return cached;
  }

  const startDate = getStartDateForRange(range);
  const products = await getTopProductsBySalesSince(10, startDate);
  const result = products.map((product) => ({
    productId: product.productId,
    productName: product.productName,
    category: product.category,
    totalQuantity: product.totalQuantity,
    totalRevenue: product.totalRevenue.toString(),
  }));

  await setCacheValue(cacheKey, result, CACHE_TTL_SECONDS);

  return result;
}

export async function getOrderTrend(range: RevenueRange): Promise<
  Array<{
    date: string;
    orderCount: number;
  }>
> {
  const cacheKey = analyticsCacheKeys.orderTrend(range);
  const cached = await getCacheValue<
    Array<{
      date: string;
      orderCount: number;
    }>
  >(cacheKey);

  if (cached) {
    return cached;
  }

  const startDate = getStartDateForRange(range);

  const result = await getOrderTrendSince(startDate);

  await setCacheValue(cacheKey, result, CACHE_TTL_SECONDS);

  return result;
}

export async function getRevenueByStatus(range: RevenueRange): Promise<
  Array<{
    status: string;
    revenue: string;
    orders: number;
  }>
> {
  const cacheKey = analyticsCacheKeys.revenueByStatus(range);
  const cached = await getCacheValue<
    Array<{
      status: string;
      revenue: string;
      orders: number;
    }>
  >(cacheKey);

  if (cached) {
    return cached;
  }

  const startDate = getStartDateForRange(range);

  const grouped = await getRevenueByStatusSince(startDate);
  const result = grouped.map((row) => ({
    status: row.status,
    revenue: row.revenue.toString(),
    orders: row.orders,
  }));

  await setCacheValue(cacheKey, result, CACHE_TTL_SECONDS);

  return result;
}

export async function getCategoryDistribution(range: RevenueRange): Promise<
  Array<{
    category: string;
    count: number;
  }>
> {
  const cacheKey = analyticsCacheKeys.categoryDistribution(range);
  const cached = await getCacheValue<
    Array<{
      category: string;
      count: number;
    }>
  >(cacheKey);

  if (cached) {
    return cached;
  }

  const startDate = getStartDateForRange(range);
  const result = await getCategoryDistributionSince(startDate);

  await setCacheValue(cacheKey, result, CACHE_TTL_SECONDS);

  return result;
}

export async function getOrderStatusMix(range: RevenueRange): Promise<
  Array<{
    status: string;
    count: number;
  }>
> {
  const cacheKey = analyticsCacheKeys.orderStatusMix(range);
  const cached = await getCacheValue<
    Array<{
      status: string;
      count: number;
    }>
  >(cacheKey);

  if (cached) {
    return cached;
  }

  const startDate = getStartDateForRange(range);
  const grouped = await getOrderStatusMixSince(startDate);
  const result = grouped.map((row) => ({
    status: row.status,
    count: row.count,
  }));

  await setCacheValue(cacheKey, result, CACHE_TTL_SECONDS);

  return result;
}

export async function getOrders(input: PaginationInput): Promise<{
  items: Array<{
    id: string;
    status: string;
    totalAmount: string;
    createdAt: string;
    customer: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  if (input.page < 1 || input.limit < 1 || input.limit > 100) {
    throw createAppError("Pagination parameters are invalid", 400, "ANALYTICS_001");
  }

  const startDate = input.range ? getStartDateForRange(input.range) : undefined;
  const result = await getPaginatedOrders({
    page: input.page,
    limit: input.limit,
    startDate,
  });
  const totalPages = Math.ceil(result.total / input.limit) || 1;

  return {
    items: result.items.map((item) => ({
      id: item.id,
      status: item.status,
      totalAmount: item.totalAmount.toString(),
      createdAt: item.createdAt.toISOString(),
      customer: item.customer,
    })),
    meta: {
      page: input.page,
      limit: input.limit,
      total: result.total,
      totalPages,
    },
  };
}

export async function getProducts(): Promise<
  {
    items: Array<{
      id: string;
      name: string;
      sku: string;
      category: string;
      price: string;
      stock: number;
      createdAt: string;
      updatedAt: string;
    }>;
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }
> {
  const defaultPagination = {
    page: 1,
    limit: 20,
  };
  return getPaginatedProducts(defaultPagination);
}

export async function getPaginatedProducts(input: PaginationInput): Promise<{
  items: Array<{
    id: string;
    name: string;
    sku: string;
    category: string;
    price: string;
    stock: number;
    createdAt: string;
    updatedAt: string;
  }>;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  if (input.page < 1 || input.limit < 1 || input.limit > 100) {
    throw createAppError("Pagination parameters are invalid", 400, "ANALYTICS_001");
  }

  const result = await findPaginatedProducts(input);
  const totalPages = Math.ceil(result.total / input.limit) || 1;

  return {
    items: result.items.map((product: Product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    })),
    meta: {
      page: input.page,
      limit: input.limit,
      total: result.total,
      totalPages,
    },
  };
}

export async function invalidateAnalyticsCache(): Promise<void> {
  await invalidateAnalyticsCacheKeys();
}

function getStartDateForRange(range: RevenueRange): Date {
  const days = revenueRangeDays[range];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  return startDate;
}
