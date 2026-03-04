import type { Product } from "@prisma/client";

import { prisma } from "../prisma/client";

export async function findAllProducts(): Promise<Product[]> {
  return prisma.product.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
