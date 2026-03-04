import type { Product } from "@prisma/client";

import {
  getOrderOverview,
  getPaginatedOrders,
  getRevenueSince,
  getTopProductsBySales,
} from "../repositories/order.repository";
import { findAllProducts } from "../repositories/product.repository";
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

export async function getTopProducts(): Promise<
  Array<{
    productId: string;
    productName: string;
    category: string;
    totalQuantity: number;
    totalRevenue: string;
  }>
> {
  const cacheKey = analyticsCacheKeys.topProducts;
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

  const products = await getTopProductsBySales(10);
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

  const result = await getPaginatedOrders(input);
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
  Array<{
    id: string;
    name: string;
    sku: string;
    category: string;
    price: string;
    stock: number;
    createdAt: string;
    updatedAt: string;
  }>
> {
  const products = await findAllProducts();

  return products.map((product: Product) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    category: product.category,
    price: product.price.toString(),
    stock: product.stock,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }));
}

export async function invalidateAnalyticsCache(): Promise<void> {
  await invalidateAnalyticsCacheKeys();
}
