import { Router } from "express";

import {
  getCategoryDistributionHandler,
  getOrderStatusMixHandler,
  getOrderTrendHandler,
  getOverviewHandler,
  getRevenueByStatusHandler,
  getRevenueHandler,
  getTopProductsHandler,
} from "../controllers/analytics.controller";
import { analyticsRateLimit } from "../middleware/analytics-rate-limit";
import { authenticateJWT } from "../middleware/authenticate-jwt";
import { requireRole } from "../middleware/require-role";
import { validate } from "../middleware/validate";
import { optionalRevenueQuerySchema, revenueQuerySchema } from "../types/analytics";
import { asyncHandler } from "../utils/async-handler";

const analyticsRouter = Router();

analyticsRouter.use(analyticsRateLimit, authenticateJWT, requireRole("ANALYST"));

analyticsRouter.get(
  "/overview",
  asyncHandler(getOverviewHandler),
);

analyticsRouter.get(
  "/revenue",
  validate(revenueQuerySchema),
  asyncHandler(getRevenueHandler),
);

analyticsRouter.get(
  "/top-products",
  validate(optionalRevenueQuerySchema),
  asyncHandler(getTopProductsHandler),
);

analyticsRouter.get(
  "/order-trend",
  validate(revenueQuerySchema),
  asyncHandler(getOrderTrendHandler),
);

analyticsRouter.get(
  "/revenue-by-status",
  validate(revenueQuerySchema),
  asyncHandler(getRevenueByStatusHandler),
);

analyticsRouter.get(
  "/category-distribution",
  validate(optionalRevenueQuerySchema),
  asyncHandler(getCategoryDistributionHandler),
);

analyticsRouter.get(
  "/order-status-mix",
  validate(revenueQuerySchema),
  asyncHandler(getOrderStatusMixHandler),
);

export { analyticsRouter };
