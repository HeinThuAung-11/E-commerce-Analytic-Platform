import { OrderStatus, Prisma } from "@prisma/client";

import { prisma } from "../prisma/client";

type PaginatedOrdersInput = {
  page: number;
  limit: number;
  startDate?: Date;
};

export async function getOrderOverview(): Promise<{
  totalRevenue: Prisma.Decimal;
  totalOrders: number;
  completedOrders: number;
  totalCustomers: number;
  totalProductsSold: number;
}> {
  const [completedAggregate, totalOrders, completedOrders, totalCustomers, groupedItems] =
    await Promise.all([
      prisma.order.aggregate({
        where: {
          status: OrderStatus.COMPLETED,
          deletedAt: null,
        },
        _sum: {
          totalAmount: true,
        },
      }),
      prisma.order.count({
        where: {
          deletedAt: null,
        },
      }),
      prisma.order.count({
        where: {
          status: OrderStatus.COMPLETED,
          deletedAt: null,
        },
      }),
      prisma.customer.count({
        where: {
          deletedAt: null,
        },
      }),
      prisma.orderItem.aggregate({
        _sum: {
          quantity: true,
        },
        where: {
          order: {
            deletedAt: null,
            status: OrderStatus.COMPLETED,
          },
        },
      }),
    ]);

  return {
    totalRevenue: completedAggregate._sum.totalAmount ?? new Prisma.Decimal(0),
    totalOrders,
    completedOrders,
    totalCustomers,
    totalProductsSold: groupedItems._sum.quantity ?? 0,
  };
}

export async function getRevenueSince(startDate: Date): Promise<Prisma.Decimal> {
  const aggregate = await prisma.order.aggregate({
    where: {
      status: OrderStatus.COMPLETED,
      deletedAt: null,
      createdAt: {
        gte: startDate,
      },
    },
    _sum: {
      totalAmount: true,
    },
  });

  return aggregate._sum.totalAmount ?? new Prisma.Decimal(0);
}

export async function getTopProductsBySales(limit: number): Promise<
  Array<{
    productId: string;
    productName: string;
    category: string;
    totalQuantity: number;
    totalRevenue: Prisma.Decimal;
  }>
> {
  const groupedItems = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: {
      order: {
        status: OrderStatus.COMPLETED,
        deletedAt: null,
      },
    },
    _sum: {
      quantity: true,
      subtotal: true,
    },
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
    take: limit,
  });

  const productIds = groupedItems.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      category: true,
    },
  });

  const productMap = new Map(
    products.map((product) => [
      product.id,
      {
        name: product.name,
        category: product.category,
      },
    ]),
  );

  return groupedItems
    .map((item) => {
      const product = productMap.get(item.productId);

      if (!product) {
        return null;
      }

      return {
        productId: item.productId,
        productName: product.name,
        category: product.category,
        totalQuantity: item._sum.quantity ?? 0,
        totalRevenue: item._sum.subtotal ?? new Prisma.Decimal(0),
      };
    })
    .filter(
      (
        item,
      ): item is {
        productId: string;
        productName: string;
        category: string;
        totalQuantity: number;
        totalRevenue: Prisma.Decimal;
      } => item !== null,
    );
}

export async function getTopProductsBySalesSince(
  limit: number,
  startDate: Date,
): Promise<
  Array<{
    productId: string;
    productName: string;
    category: string;
    totalQuantity: number;
    totalRevenue: Prisma.Decimal;
  }>
> {
  const groupedItems = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: {
      order: {
        status: OrderStatus.COMPLETED,
        deletedAt: null,
        createdAt: {
          gte: startDate,
        },
      },
    },
    _sum: {
      quantity: true,
      subtotal: true,
    },
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
    take: limit,
  });

  const productIds = groupedItems.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      category: true,
    },
  });

  const productMap = new Map(
    products.map((product) => [
      product.id,
      {
        name: product.name,
        category: product.category,
      },
    ]),
  );

  return groupedItems
    .map((item) => {
      const product = productMap.get(item.productId);

      if (!product) {
        return null;
      }

      return {
        productId: item.productId,
        productName: product.name,
        category: product.category,
        totalQuantity: item._sum.quantity ?? 0,
        totalRevenue: item._sum.subtotal ?? new Prisma.Decimal(0),
      };
    })
    .filter(
      (
        item,
      ): item is {
        productId: string;
        productName: string;
        category: string;
        totalQuantity: number;
        totalRevenue: Prisma.Decimal;
      } => item !== null,
    );
}

export async function getPaginatedOrders(input: PaginatedOrdersInput): Promise<{
  items: Array<{
    id: string;
    status: OrderStatus;
    totalAmount: Prisma.Decimal;
    createdAt: Date;
    customer: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  total: number;
}> {
  const skip = (input.page - 1) * input.limit;
  const where = {
    deletedAt: null,
    ...(input.startDate
      ? {
          createdAt: {
            gte: input.startDate,
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: input.limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    items,
    total,
  };
}

export async function getOrderStatusMixSince(startDate: Date): Promise<
  Array<{
    status: OrderStatus;
    count: number;
  }>
> {
  const grouped = await prisma.order.groupBy({
    by: ["status"],
    where: {
      deletedAt: null,
      createdAt: {
        gte: startDate,
      },
    },
    _count: {
      _all: true,
    },
  });

  return grouped.map((row) => ({
    status: row.status,
    count: row._count._all,
  }));
}

export async function getOrderTrendSince(startDate: Date): Promise<
  Array<{
    date: string;
    orderCount: number;
  }>
> {
  const rows = await prisma.$queryRaw<
    Array<{
      day: Date;
      count: bigint;
    }>
  >(Prisma.sql`
    SELECT
      date_trunc('day', "createdAt") AS day,
      COUNT(*)::bigint AS count
    FROM "Order"
    WHERE "deletedAt" IS NULL
      AND "createdAt" >= ${startDate}
    GROUP BY day
    ORDER BY day ASC
  `);

  return rows.map((row) => ({
    date: row.day.toISOString(),
    orderCount: Number(row.count),
  }));
}

export async function getRevenueByStatusSince(startDate: Date): Promise<
  Array<{
    status: OrderStatus;
    revenue: Prisma.Decimal;
    orders: number;
  }>
> {
  const grouped = await prisma.order.groupBy({
    by: ["status"],
    where: {
      deletedAt: null,
      createdAt: {
        gte: startDate,
      },
    },
    _sum: {
      totalAmount: true,
    },
    _count: {
      _all: true,
    },
    orderBy: {
      _sum: {
        totalAmount: "desc",
      },
    },
  });

  return grouped.map((row) => ({
    status: row.status,
    revenue: row._sum.totalAmount ?? new Prisma.Decimal(0),
    orders: row._count._all,
  }));
}

export async function getCategoryDistributionSince(startDate: Date): Promise<
  Array<{
    category: string;
    count: number;
  }>
> {
  const rows = await prisma.$queryRaw<
    Array<{
      category: string;
      count: bigint;
    }>
  >(Prisma.sql`
    SELECT
      p."category" AS category,
      SUM(oi."quantity")::bigint AS count
    FROM "OrderItem" oi
    JOIN "Order" o ON o."id" = oi."orderId"
    JOIN "Product" p ON p."id" = oi."productId"
    WHERE o."deletedAt" IS NULL
      AND p."deletedAt" IS NULL
      AND o."createdAt" >= ${startDate}
    GROUP BY p."category"
    ORDER BY count DESC
  `);

  return rows.map((row) => ({
    category: row.category,
    count: Number(row.count),
  }));
}
