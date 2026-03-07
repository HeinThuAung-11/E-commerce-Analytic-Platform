import { Prisma, type Product } from "@prisma/client";

import { prisma } from "../prisma/client";

type ProductPaginationInput = {
  page: number;
  limit: number;
};

type PaginatedProductsResult = {
  items: Product[];
  total: number;
};

type CategoryDistributionResult = {
  category: string;
  count: number;
};

export async function findPaginatedProducts(
  input: ProductPaginationInput,
): Promise<PaginatedProductsResult> {
  const skip = (input.page - 1) * input.limit;

  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: input.limit,
    }),
    prisma.product.count({
      where: {
        deletedAt: null,
      },
    }),
  ]);

  return {
    items,
    total,
  };
}

export async function getProductCategoryDistribution(): Promise<CategoryDistributionResult[]> {
  const rows = await prisma.$queryRaw<
    Array<{
      category: string;
      count: bigint;
    }>
  >(Prisma.sql`
    SELECT
      "category" AS category,
      COUNT(*)::bigint AS count
    FROM "Product"
    WHERE "deletedAt" IS NULL
    GROUP BY "category"
    ORDER BY count DESC
  `);

  return rows.map((row) => ({
    category: row.category,
    count: Number(row.count),
  }));
}
