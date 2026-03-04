import { Router } from "express";

import {
  getOverviewHandler,
  getRevenueHandler,
  getTopProductsHandler,
} from "../controllers/analytics.controller";
import { analyticsRateLimit } from "../middleware/analytics-rate-limit";
import { authenticateJWT } from "../middleware/authenticate-jwt";
import { requireRole } from "../middleware/require-role";
import { validate } from "../middleware/validate";
import { revenueQuerySchema } from "../types/analytics";
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
  asyncHandler(getTopProductsHandler),
);

export { analyticsRouter };
