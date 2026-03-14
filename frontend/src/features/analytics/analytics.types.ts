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
