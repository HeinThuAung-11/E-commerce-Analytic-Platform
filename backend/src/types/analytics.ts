import { z } from "zod";

export type RevenueRange = "7d" | "30d" | "90d";

export const revenueRangeDays: Record<RevenueRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

export const revenueQuerySchema = z.object({
  query: z.object({
    range: z.enum(["7d", "30d", "90d"]),
  }),
});

export const ordersQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }),
});
