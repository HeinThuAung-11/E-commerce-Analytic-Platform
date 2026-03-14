import { env } from "../../config/env";
import { apiClient } from "../../services/http";
import {
  getDemoCategoryDistribution,
  getDemoOrderStatusMix,
  getDemoOrderTrend,
  getDemoOrders,
  getDemoOverview,
  getDemoProducts,
  getDemoRevenue,
  getDemoRevenueByStatus,
  getDemoTopProducts,
} from "./demo-data";
import type {
  CategoryDistributionPoint,
  OrderItem,
  OrderStatusMixPoint,
  OrderTrendPoint,
  OrdersResponse,
  OverviewResponse,
  ProductItem,
  ProductsResponse,
  RevenueByStatusPoint,
  RevenueRange,
  RevenueResponse,
  TopProduct,
} from "./analytics.types";

export type {
  CategoryDistributionPoint,
  OrderItem,
  OrderStatusMixPoint,
  OrderTrendPoint,
  OrdersResponse,
  OverviewResponse,
  ProductItem,
  ProductsResponse,
  RevenueByStatusPoint,
  RevenueRange,
  RevenueResponse,
  TopProduct,
};

function isProductItem(value: unknown): value is ProductItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ProductItem>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.sku === "string" &&
    typeof candidate.category === "string" &&
    typeof candidate.price === "string" &&
    typeof candidate.stock === "number"
  );
}

function normalizeProductsResponse(data: unknown): ProductsResponse {
  if (Array.isArray(data) && data.every((item) => isProductItem(item))) {
    const items = data;
    return {
      items,
      meta: {
        page: 1,
        limit: items.length,
        total: items.length,
        totalPages: 1,
      },
    };
  }

  if (
    data &&
    typeof data === "object" &&
    "items" in data &&
    Array.isArray((data as { items: unknown }).items)
  ) {
    const candidate = data as Partial<ProductsResponse>;
    const items = (candidate.items ?? []).filter((item): item is ProductItem => isProductItem(item));
    const fallbackLimit = items.length || 20;

    return {
      items,
      meta: {
        page: candidate.meta?.page ?? 1,
        limit: candidate.meta?.limit ?? fallbackLimit,
        total: candidate.meta?.total ?? items.length,
        totalPages: candidate.meta?.totalPages ?? 1,
      },
    };
  }

  return {
    items: [],
    meta: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
    },
  };
}

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

export async function getOverview(): Promise<OverviewResponse> {
  if (env.demoMode) {
    return getDemoOverview();
  }
  const response = await apiClient.get<ApiEnvelope<OverviewResponse>>("/analytics/overview");
  return response.data.data;
}

export async function getRevenue(range: RevenueRange): Promise<RevenueResponse> {
  if (env.demoMode) {
    return getDemoRevenue(range);
  }
  const response = await apiClient.get<ApiEnvelope<RevenueResponse>>("/analytics/revenue", {
    params: {
      range,
    },
  });
  return response.data.data;
}

export async function getTopProducts(range: RevenueRange): Promise<TopProduct[]> {
  if (env.demoMode) {
    return getDemoTopProducts(range);
  }
  const response = await apiClient.get<ApiEnvelope<TopProduct[]>>("/analytics/top-products", {
    params: {
      range,
    },
  });
  return response.data.data;
}

export async function getOrders(
  page: number,
  limit: number,
  range?: RevenueRange,
): Promise<OrdersResponse> {
  if (env.demoMode) {
    return getDemoOrders(range ?? "30d");
  }
  const response = await apiClient.get<ApiEnvelope<OrdersResponse>>("/orders", {
    params: {
      page,
      limit,
      range,
    },
  });
  return response.data.data;
}

export async function getProducts(page: number, limit: number): Promise<ProductsResponse> {
  if (env.demoMode) {
    return getDemoProducts();
  }
  const response = await apiClient.get<ApiEnvelope<unknown>>("/products", {
    params: {
      page,
      limit,
    },
  });
  return normalizeProductsResponse(response.data.data);
}

export async function getOrderTrend(range: RevenueRange): Promise<OrderTrendPoint[]> {
  if (env.demoMode) {
    return getDemoOrderTrend(range);
  }
  const response = await apiClient.get<ApiEnvelope<OrderTrendPoint[]>>("/analytics/order-trend", {
    params: {
      range,
    },
  });
  return response.data.data;
}

export async function getRevenueByStatus(range: RevenueRange): Promise<RevenueByStatusPoint[]> {
  if (env.demoMode) {
    return getDemoRevenueByStatus(range);
  }
  const response = await apiClient.get<ApiEnvelope<RevenueByStatusPoint[]>>(
    "/analytics/revenue-by-status",
    {
      params: {
        range,
      },
    },
  );
  return response.data.data;
}

export async function getCategoryDistribution(range: RevenueRange): Promise<CategoryDistributionPoint[]> {
  if (env.demoMode) {
    return getDemoCategoryDistribution(range);
  }
  const response = await apiClient.get<ApiEnvelope<CategoryDistributionPoint[]>>(
    "/analytics/category-distribution",
    {
      params: {
        range,
      },
    },
  );
  return response.data.data;
}

export async function getOrderStatusMix(range: RevenueRange): Promise<OrderStatusMixPoint[]> {
  if (env.demoMode) {
    return getDemoOrderStatusMix(range);
  }
  const response = await apiClient.get<ApiEnvelope<OrderStatusMixPoint[]>>(
    "/analytics/order-status-mix",
    {
      params: {
        range,
      },
    },
  );
  return response.data.data;
}
