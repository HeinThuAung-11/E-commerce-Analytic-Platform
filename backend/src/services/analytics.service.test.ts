import { OrderStatus, Prisma } from "@prisma/client";

import {
  getCategoryDistribution,
  getOrderTrend,
  getOrders,
  getOverview,
  getProducts,
  getRevenueByStatus,
  getRevenue,
  getTopProducts,
  invalidateAnalyticsCache,
} from "./analytics.service";
import * as orderRepository from "../repositories/order.repository";
import * as productRepository from "../repositories/product.repository";
import * as cacheKeys from "../utils/cache-keys";
import * as redisUtils from "../utils/redis";

jest.mock("../repositories/order.repository");
jest.mock("../repositories/product.repository");
jest.mock("../utils/redis");
jest.mock("../utils/cache-keys", () => ({
  CACHE_TTL_SECONDS: 60,
  analyticsCacheKeys: {
    overview: "analytics:overview",
    revenue: (range: string) => `analytics:revenue:${range}`,
    topProducts: (range: string) => `analytics:top-products:${range}`,
    orderTrend: (range: string) => `analytics:order-trend:${range}`,
    orderStatusMix: (range: string) => `analytics:order-status-mix:${range}`,
    revenueByStatus: (range: string) => `analytics:revenue-by-status:${range}`,
    categoryDistribution: (range: string) => `analytics:category-distribution:${range}`,
  },
  invalidateAnalyticsCacheKeys: jest.fn(),
}));

const mockedOrderRepository = jest.mocked(orderRepository);
const mockedProductRepository = jest.mocked(productRepository);
const mockedRedisUtils = jest.mocked(redisUtils);
const mockedCacheKeys = jest.mocked(cacheKeys);

describe("analytics.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedRedisUtils.getCacheValue.mockResolvedValue(null);
    mockedRedisUtils.setCacheValue.mockResolvedValue();
  });

  it("returns cached overview when cache is present", async () => {
    mockedRedisUtils.getCacheValue.mockResolvedValue({
      totalRevenue: "500.50",
      totalOrders: 30,
      completedOrders: 25,
      totalCustomers: 12,
      totalProductsSold: 90,
    });

    const result = await getOverview();

    expect(result).toEqual({
      totalRevenue: "500.50",
      totalOrders: 30,
      completedOrders: 25,
      totalCustomers: 12,
      totalProductsSold: 90,
    });
    expect(mockedOrderRepository.getOrderOverview).not.toHaveBeenCalled();
    expect(mockedRedisUtils.setCacheValue).not.toHaveBeenCalled();
  });

  it("computes and caches overview on cache miss", async () => {
    mockedOrderRepository.getOrderOverview.mockResolvedValue({
      totalRevenue: new Prisma.Decimal("1234.56"),
      totalOrders: 100,
      completedOrders: 80,
      totalCustomers: 42,
      totalProductsSold: 280,
    });

    const result = await getOverview();

    expect(result).toEqual({
      totalRevenue: "1234.56",
      totalOrders: 100,
      completedOrders: 80,
      totalCustomers: 42,
      totalProductsSold: 280,
    });
    expect(mockedRedisUtils.setCacheValue).toHaveBeenCalledWith(
      "analytics:overview",
      result,
      60,
    );
  });

  it("maps top products to string revenue values", async () => {
    mockedOrderRepository.getTopProductsBySalesSince.mockResolvedValue([
      {
        productId: "product-1",
        productName: "Keyboard",
        category: "Electronics",
        totalQuantity: 10,
        totalRevenue: new Prisma.Decimal("899.90"),
      },
    ]);

    const result = await getTopProducts("30d");

    expect(result).toEqual([
      {
        productId: "product-1",
        productName: "Keyboard",
        category: "Electronics",
        totalQuantity: 10,
        totalRevenue: "899.9",
      },
    ]);
    expect(mockedRedisUtils.setCacheValue).toHaveBeenCalledWith(
      "analytics:top-products:30d",
      result,
      60,
    );
  });

  it("rejects invalid pagination parameters", async () => {
    await expect(
      getOrders({
        page: 0,
        limit: 20,
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      errorCode: "ANALYTICS_001",
    });

    await expect(
      getOrders({
        page: 1,
        limit: 101,
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      errorCode: "ANALYTICS_001",
    });
  });

  it("returns paginated order payload and metadata", async () => {
    mockedOrderRepository.getPaginatedOrders.mockResolvedValue({
      items: [
        {
          id: "order-1",
          status: OrderStatus.COMPLETED,
          totalAmount: new Prisma.Decimal("250.00"),
          createdAt: new Date("2026-03-01T10:00:00.000Z"),
          customer: {
            id: "customer-1",
            name: "Jane",
            email: "jane@example.com",
          },
        },
      ],
      total: 45,
    });

    const result = await getOrders({
      page: 2,
      limit: 20,
    });

    expect(result).toEqual({
      items: [
        {
          id: "order-1",
          status: "COMPLETED",
          totalAmount: "250",
          createdAt: "2026-03-01T10:00:00.000Z",
          customer: {
            id: "customer-1",
            name: "Jane",
            email: "jane@example.com",
          },
        },
      ],
      meta: {
        page: 2,
        limit: 20,
        total: 45,
        totalPages: 3,
      },
    });
  });

  it("returns products with price and timestamps transformed", async () => {
    mockedProductRepository.findPaginatedProducts.mockResolvedValue({
      items: [
        {
          id: "product-1",
          name: "Mouse",
          sku: "SKU-000001",
          category: "Electronics",
          price: new Prisma.Decimal("49.99"),
          stock: 120,
          deletedAt: null,
          createdAt: new Date("2026-03-01T10:00:00.000Z"),
          updatedAt: new Date("2026-03-02T10:00:00.000Z"),
        },
      ],
      total: 1,
    });

    const result = await getProducts();

    expect(result).toEqual({
      items: [
        {
          id: "product-1",
          name: "Mouse",
          sku: "SKU-000001",
          category: "Electronics",
          price: "49.99",
          stock: 120,
          createdAt: "2026-03-01T10:00:00.000Z",
          updatedAt: "2026-03-02T10:00:00.000Z",
        },
      ],
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    });
  });

  it("delegates cache invalidation to cache utility", async () => {
    await invalidateAnalyticsCache();

    expect(mockedCacheKeys.invalidateAnalyticsCacheKeys).toHaveBeenCalledTimes(1);
  });

  it("maps order trend values from repository", async () => {
    mockedOrderRepository.getOrderTrendSince.mockResolvedValue([
      {
        date: "2026-03-01T00:00:00.000Z",
        orderCount: 15,
      },
    ]);

    const result = await getOrderTrend("30d");

    expect(result).toEqual([
      {
        date: "2026-03-01T00:00:00.000Z",
        orderCount: 15,
      },
    ]);
    expect(mockedRedisUtils.setCacheValue).toHaveBeenCalledWith(
      "analytics:order-trend:30d",
      result,
      60,
    );
  });

  it("caches revenue payload by selected range", async () => {
    mockedOrderRepository.getRevenueSince.mockResolvedValue(new Prisma.Decimal("321.45"));

    const result = await getRevenue("30d");

    expect(result.range).toBe("30d");
    expect(result.revenue).toBe("321.45");
    expect(mockedRedisUtils.setCacheValue).toHaveBeenCalledWith(
      "analytics:revenue:30d",
      result,
      60,
    );
  });

  it("maps revenue by status values to strings", async () => {
    mockedOrderRepository.getRevenueByStatusSince.mockResolvedValue([
      {
        status: OrderStatus.COMPLETED,
        revenue: new Prisma.Decimal("1500.25"),
        orders: 8,
      },
    ]);

    const result = await getRevenueByStatus("30d");

    expect(result).toEqual([
      {
        status: "COMPLETED",
        revenue: "1500.25",
        orders: 8,
      },
    ]);
    expect(mockedRedisUtils.setCacheValue).toHaveBeenCalledWith(
      "analytics:revenue-by-status:30d",
      result,
      60,
    );
  });

  it("returns category distribution values", async () => {
    mockedOrderRepository.getCategoryDistributionSince.mockResolvedValue([
      {
        category: "Electronics",
        count: 42,
      },
    ]);

    const result = await getCategoryDistribution("30d");

    expect(result).toEqual([
      {
        category: "Electronics",
        count: 42,
      },
    ]);
    expect(mockedRedisUtils.setCacheValue).toHaveBeenCalledWith(
      "analytics:category-distribution:30d",
      result,
      60,
    );
  });
});
