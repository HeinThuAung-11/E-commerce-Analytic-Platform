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

const demoOverview: OverviewResponse = {
  totalRevenue: "482930.22",
  totalOrders: 1420,
  completedOrders: 1186,
  totalCustomers: 612,
  totalProductsSold: 8420,
};

const demoRevenueByRange: Record<RevenueRange, RevenueResponse> = {
  "7d": {
    range: "7d",
    revenue: "52460.10",
    startDate: "2026-03-07",
  },
  "30d": {
    range: "30d",
    revenue: "198240.55",
    startDate: "2026-02-12",
  },
  "90d": {
    range: "90d",
    revenue: "482930.22",
    startDate: "2025-12-15",
  },
};

const demoTopProducts: Record<RevenueRange, TopProduct[]> = {
  "7d": [
    {
      productId: "prod-109",
      productName: "Nimbus Smartwatch S2",
      category: "Wearables",
      totalQuantity: 180,
      totalRevenue: "53940.00",
    },
    {
      productId: "prod-205",
      productName: "Atlas Pro Headphones",
      category: "Audio",
      totalQuantity: 210,
      totalRevenue: "47250.00",
    },
    {
      productId: "prod-312",
      productName: "Helio Air Purifier",
      category: "Home",
      totalQuantity: 98,
      totalRevenue: "29100.00",
    },
    {
      productId: "prod-418",
      productName: "Orbit 4K Action Cam",
      category: "Cameras",
      totalQuantity: 66,
      totalRevenue: "25800.00",
    },
    {
      productId: "prod-512",
      productName: "Apex Espresso Pro",
      category: "Kitchen",
      totalQuantity: 52,
      totalRevenue: "19760.00",
    },
  ],
  "30d": [
    {
      productId: "prod-109",
      productName: "Nimbus Smartwatch S2",
      category: "Wearables",
      totalQuantity: 520,
      totalRevenue: "155400.00",
    },
    {
      productId: "prod-205",
      productName: "Atlas Pro Headphones",
      category: "Audio",
      totalQuantity: 480,
      totalRevenue: "108000.00",
    },
    {
      productId: "prod-777",
      productName: "Pulse Running Shoes",
      category: "Sports",
      totalQuantity: 310,
      totalRevenue: "89900.00",
    },
    {
      productId: "prod-418",
      productName: "Orbit 4K Action Cam",
      category: "Cameras",
      totalQuantity: 150,
      totalRevenue: "58500.00",
    },
    {
      productId: "prod-512",
      productName: "Apex Espresso Pro",
      category: "Kitchen",
      totalQuantity: 144,
      totalRevenue: "54720.00",
    },
  ],
  "90d": [
    {
      productId: "prod-109",
      productName: "Nimbus Smartwatch S2",
      category: "Wearables",
      totalQuantity: 1420,
      totalRevenue: "424200.00",
    },
    {
      productId: "prod-205",
      productName: "Atlas Pro Headphones",
      category: "Audio",
      totalQuantity: 1280,
      totalRevenue: "288000.00",
    },
    {
      productId: "prod-777",
      productName: "Pulse Running Shoes",
      category: "Sports",
      totalQuantity: 940,
      totalRevenue: "272600.00",
    },
    {
      productId: "prod-418",
      productName: "Orbit 4K Action Cam",
      category: "Cameras",
      totalQuantity: 520,
      totalRevenue: "202800.00",
    },
    {
      productId: "prod-512",
      productName: "Apex Espresso Pro",
      category: "Kitchen",
      totalQuantity: 420,
      totalRevenue: "159600.00",
    },
  ],
};

const demoOrders: Record<RevenueRange, OrdersResponse> = {
  "7d": {
    items: [
      {
        id: "ord-9431",
        status: "COMPLETED",
        totalAmount: "420.00",
        createdAt: "2026-03-13T14:10:00.000Z",
        customer: {
          id: "cust-103",
          name: "Jasmine Patel",
          email: "jasmine@aurora.io",
        },
      },
      {
        id: "ord-9424",
        status: "SHIPPED",
        totalAmount: "210.00",
        createdAt: "2026-03-12T16:45:00.000Z",
        customer: {
          id: "cust-211",
          name: "Liam Brooks",
          email: "liam@northwind.com",
        },
      },
      {
        id: "ord-9417",
        status: "COMPLETED",
        totalAmount: "960.00",
        createdAt: "2026-03-12T09:20:00.000Z",
        customer: {
          id: "cust-044",
          name: "Camila Cruz",
          email: "camila@rocketmail.com",
        },
      },
      {
        id: "ord-9402",
        status: "PROCESSING",
        totalAmount: "310.00",
        createdAt: "2026-03-11T19:05:00.000Z",
        customer: {
          id: "cust-302",
          name: "Omar Khan",
          email: "omar@tandem.io",
        },
      },
      {
        id: "ord-9391",
        status: "COMPLETED",
        totalAmount: "129.00",
        createdAt: "2026-03-10T08:15:00.000Z",
        customer: {
          id: "cust-118",
          name: "Isabella Rossi",
          email: "isabella@studio.co",
        },
      },
      {
        id: "ord-9380",
        status: "REFUNDED",
        totalAmount: "189.00",
        createdAt: "2026-03-09T13:40:00.000Z",
        customer: {
          id: "cust-267",
          name: "Noah Walker",
          email: "noah@brightworks.io",
        },
      },
      {
        id: "ord-9368",
        status: "COMPLETED",
        totalAmount: "740.00",
        createdAt: "2026-03-08T21:30:00.000Z",
        customer: {
          id: "cust-089",
          name: "Chloe Martin",
          email: "chloe@stripe.dev",
        },
      },
    ],
    meta: {
      page: 1,
      limit: 50,
      total: 7,
      totalPages: 1,
    },
  },
  "30d": {
    items: [
      {
        id: "ord-9340",
        status: "COMPLETED",
        totalAmount: "640.00",
        createdAt: "2026-03-06T18:22:00.000Z",
        customer: {
          id: "cust-155",
          name: "Ethan Park",
          email: "ethan@fleet.io",
        },
      },
      {
        id: "ord-9288",
        status: "SHIPPED",
        totalAmount: "215.00",
        createdAt: "2026-03-03T12:48:00.000Z",
        customer: {
          id: "cust-241",
          name: "Maya Thompson",
          email: "maya@atlas.com",
        },
      },
      {
        id: "ord-9222",
        status: "PROCESSING",
        totalAmount: "880.00",
        createdAt: "2026-02-28T10:05:00.000Z",
        customer: {
          id: "cust-382",
          name: "Lucas Meyer",
          email: "lucas@orbit.io",
        },
      },
      {
        id: "ord-9184",
        status: "CANCELLED",
        totalAmount: "99.00",
        createdAt: "2026-02-26T09:15:00.000Z",
        customer: {
          id: "cust-014",
          name: "Sofia Blake",
          email: "sofia@lumen.com",
        },
      },
      {
        id: "ord-9105",
        status: "COMPLETED",
        totalAmount: "520.00",
        createdAt: "2026-02-21T16:30:00.000Z",
        customer: {
          id: "cust-458",
          name: "Daniel Nguyen",
          email: "daniel@zenith.dev",
        },
      },
      {
        id: "ord-9050",
        status: "REFUNDED",
        totalAmount: "140.00",
        createdAt: "2026-02-19T11:40:00.000Z",
        customer: {
          id: "cust-512",
          name: "Ava Clarke",
          email: "ava@horizon.io",
        },
      },
    ],
    meta: {
      page: 1,
      limit: 50,
      total: 6,
      totalPages: 1,
    },
  },
  "90d": {
    items: [
      {
        id: "ord-8802",
        status: "COMPLETED",
        totalAmount: "1220.00",
        createdAt: "2026-01-25T14:45:00.000Z",
        customer: {
          id: "cust-611",
          name: "Mila Santos",
          email: "mila@helios.io",
        },
      },
      {
        id: "ord-8720",
        status: "SHIPPED",
        totalAmount: "430.00",
        createdAt: "2026-01-18T09:28:00.000Z",
        customer: {
          id: "cust-332",
          name: "Oliver Reed",
          email: "oliver@verdant.com",
        },
      },
      {
        id: "ord-8611",
        status: "PROCESSING",
        totalAmount: "260.00",
        createdAt: "2026-01-10T17:05:00.000Z",
        customer: {
          id: "cust-283",
          name: "Zoe Martinez",
          email: "zoe@mint.io",
        },
      },
      {
        id: "ord-8524",
        status: "COMPLETED",
        totalAmount: "790.00",
        createdAt: "2026-01-02T12:10:00.000Z",
        customer: {
          id: "cust-139",
          name: "Henry Collins",
          email: "henry@terra.com",
        },
      },
      {
        id: "ord-8452",
        status: "REFUNDED",
        totalAmount: "180.00",
        createdAt: "2025-12-27T15:55:00.000Z",
        customer: {
          id: "cust-070",
          name: "Grace Lee",
          email: "grace@nebula.io",
        },
      },
    ],
    meta: {
      page: 1,
      limit: 50,
      total: 5,
      totalPages: 1,
    },
  },
};

const demoProducts: ProductsResponse = {
  items: [
    {
      id: "prod-109",
      name: "Nimbus Smartwatch S2",
      sku: "NW-S2-001",
      category: "Wearables",
      price: "299.00",
      stock: 240,
      createdAt: "2025-08-12T08:00:00.000Z",
      updatedAt: "2026-03-01T10:00:00.000Z",
    },
    {
      id: "prod-205",
      name: "Atlas Pro Headphones",
      sku: "AT-HP-204",
      category: "Audio",
      price: "225.00",
      stock: 180,
      createdAt: "2025-09-01T08:00:00.000Z",
      updatedAt: "2026-03-05T11:45:00.000Z",
    },
    {
      id: "prod-312",
      name: "Helio Air Purifier",
      sku: "HE-AP-312",
      category: "Home",
      price: "297.00",
      stock: 90,
      createdAt: "2025-07-18T08:00:00.000Z",
      updatedAt: "2026-03-08T09:15:00.000Z",
    },
    {
      id: "prod-418",
      name: "Orbit 4K Action Cam",
      sku: "OR-CAM-418",
      category: "Cameras",
      price: "390.00",
      stock: 72,
      createdAt: "2025-10-09T08:00:00.000Z",
      updatedAt: "2026-03-10T16:30:00.000Z",
    },
    {
      id: "prod-512",
      name: "Apex Espresso Pro",
      sku: "AP-ESP-512",
      category: "Kitchen",
      price: "380.00",
      stock: 64,
      createdAt: "2025-06-24T08:00:00.000Z",
      updatedAt: "2026-03-09T12:00:00.000Z",
    },
    {
      id: "prod-777",
      name: "Pulse Running Shoes",
      sku: "PL-RUN-777",
      category: "Sports",
      price: "290.00",
      stock: 210,
      createdAt: "2025-11-14T08:00:00.000Z",
      updatedAt: "2026-03-07T14:20:00.000Z",
    },
  ],
  meta: {
    page: 1,
    limit: 50,
    total: 6,
    totalPages: 1,
  },
};

const demoOrderTrend: Record<RevenueRange, OrderTrendPoint[]> = {
  "7d": [
    { date: "2026-03-07", orderCount: 64 },
    { date: "2026-03-08", orderCount: 72 },
    { date: "2026-03-09", orderCount: 61 },
    { date: "2026-03-10", orderCount: 83 },
    { date: "2026-03-11", orderCount: 90 },
    { date: "2026-03-12", orderCount: 77 },
    { date: "2026-03-13", orderCount: 95 },
  ],
  "30d": [
    { date: "2026-02-12", orderCount: 48 },
    { date: "2026-02-17", orderCount: 55 },
    { date: "2026-02-22", orderCount: 62 },
    { date: "2026-02-27", orderCount: 71 },
    { date: "2026-03-04", orderCount: 68 },
    { date: "2026-03-09", orderCount: 82 },
    { date: "2026-03-13", orderCount: 94 },
  ],
  "90d": [
    { date: "2025-12-15", orderCount: 52 },
    { date: "2026-01-04", orderCount: 66 },
    { date: "2026-01-24", orderCount: 74 },
    { date: "2026-02-13", orderCount: 88 },
    { date: "2026-03-04", orderCount: 96 },
    { date: "2026-03-13", orderCount: 104 },
  ],
};

const demoRevenueByStatus: Record<RevenueRange, RevenueByStatusPoint[]> = {
  "7d": [
    { status: "COMPLETED", revenue: "38240.10", orders: 320 },
    { status: "SHIPPED", revenue: "9230.00", orders: 110 },
    { status: "PROCESSING", revenue: "3120.00", orders: 48 },
    { status: "REFUNDED", revenue: "1890.00", orders: 8 },
  ],
  "30d": [
    { status: "COMPLETED", revenue: "149200.55", orders: 980 },
    { status: "SHIPPED", revenue: "34200.00", orders: 240 },
    { status: "PROCESSING", revenue: "11200.00", orders: 92 },
    { status: "REFUNDED", revenue: "3640.00", orders: 20 },
  ],
  "90d": [
    { status: "COMPLETED", revenue: "380120.22", orders: 3110 },
    { status: "SHIPPED", revenue: "74200.00", orders: 560 },
    { status: "PROCESSING", revenue: "22100.00", orders: 188 },
    { status: "REFUNDED", revenue: "6510.00", orders: 44 },
  ],
};

const demoCategoryDistribution: Record<RevenueRange, CategoryDistributionPoint[]> = {
  "7d": [
    { category: "Wearables", count: 140 },
    { category: "Audio", count: 120 },
    { category: "Home", count: 88 },
    { category: "Cameras", count: 54 },
    { category: "Kitchen", count: 48 },
    { category: "Sports", count: 102 },
  ],
  "30d": [
    { category: "Wearables", count: 420 },
    { category: "Audio", count: 380 },
    { category: "Home", count: 270 },
    { category: "Cameras", count: 190 },
    { category: "Kitchen", count: 160 },
    { category: "Sports", count: 340 },
  ],
  "90d": [
    { category: "Wearables", count: 1220 },
    { category: "Audio", count: 980 },
    { category: "Home", count: 740 },
    { category: "Cameras", count: 520 },
    { category: "Kitchen", count: 410 },
    { category: "Sports", count: 860 },
  ],
};

const demoOrderStatusMix: Record<RevenueRange, OrderStatusMixPoint[]> = {
  "7d": [
    { status: "COMPLETED", count: 320 },
    { status: "SHIPPED", count: 110 },
    { status: "PROCESSING", count: 48 },
    { status: "REFUNDED", count: 8 },
  ],
  "30d": [
    { status: "COMPLETED", count: 980 },
    { status: "SHIPPED", count: 240 },
    { status: "PROCESSING", count: 92 },
    { status: "REFUNDED", count: 20 },
  ],
  "90d": [
    { status: "COMPLETED", count: 3110 },
    { status: "SHIPPED", count: 560 },
    { status: "PROCESSING", count: 188 },
    { status: "REFUNDED", count: 44 },
  ],
};

export function getDemoOverview(): OverviewResponse {
  return demoOverview;
}

export function getDemoRevenue(range: RevenueRange): RevenueResponse {
  return demoRevenueByRange[range];
}

export function getDemoTopProducts(range: RevenueRange): TopProduct[] {
  return demoTopProducts[range];
}

export function getDemoOrders(range: RevenueRange): OrdersResponse {
  return demoOrders[range];
}

export function getDemoProducts(): ProductsResponse {
  return demoProducts;
}

export function getDemoOrderTrend(range: RevenueRange): OrderTrendPoint[] {
  return demoOrderTrend[range];
}

export function getDemoRevenueByStatus(range: RevenueRange): RevenueByStatusPoint[] {
  return demoRevenueByStatus[range];
}

export function getDemoCategoryDistribution(range: RevenueRange): CategoryDistributionPoint[] {
  return demoCategoryDistribution[range];
}

export function getDemoOrderStatusMix(range: RevenueRange): OrderStatusMixPoint[] {
  return demoOrderStatusMix[range];
}
