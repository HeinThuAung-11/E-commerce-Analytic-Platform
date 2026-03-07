import { apiClient } from "../../services/http";

export type OverviewResponse = {
  totalRevenue: string;
  totalOrders: number;
  completedOrders: number;
  totalCustomers: number;
  totalProductsSold: number;
};

export type RevenueRange = "7d" | "30d" | "90d";

export type RevenueResponse = {
  range: RevenueRange;
  revenue: string;
  startDate: string;
};

export type TopProduct = {
  productId: string;
  productName: string;
  category: string;
  totalQuantity: number;
  totalRevenue: string;
};

export type OrderStatusMixPoint = {
  status: string;
  count: number;
};

export type OrderItem = {
  id: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
};

export type OrdersResponse = {
  items: OrderItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ProductItem = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductsResponse = {
  items: ProductItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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

export type OrderTrendPoint = {
  date: string;
  orderCount: number;
};

export type RevenueByStatusPoint = {
  status: string;
  revenue: string;
  orders: number;
};

export type CategoryDistributionPoint = {
  category: string;
  count: number;
};

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

export async function getOverview(): Promise<OverviewResponse> {
  const response = await apiClient.get<ApiEnvelope<OverviewResponse>>("/analytics/overview");
  return response.data.data;
}

export async function getRevenue(range: RevenueRange): Promise<RevenueResponse> {
  const response = await apiClient.get<ApiEnvelope<RevenueResponse>>("/analytics/revenue", {
    params: {
      range,
    },
  });
  return response.data.data;
}

export async function getTopProducts(range: RevenueRange): Promise<TopProduct[]> {
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
  const response = await apiClient.get<ApiEnvelope<unknown>>("/products", {
    params: {
      page,
      limit,
    },
  });
  return normalizeProductsResponse(response.data.data);
}

export async function getOrderTrend(range: RevenueRange): Promise<OrderTrendPoint[]> {
  const response = await apiClient.get<ApiEnvelope<OrderTrendPoint[]>>("/analytics/order-trend", {
    params: {
      range,
    },
  });
  return response.data.data;
}

export async function getRevenueByStatus(range: RevenueRange): Promise<RevenueByStatusPoint[]> {
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
