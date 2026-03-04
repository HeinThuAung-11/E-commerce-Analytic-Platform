import { Router } from "express";

import { getOrdersHandler } from "../controllers/analytics.controller";
import { authenticateJWT } from "../middleware/authenticate-jwt";
import { requireRole } from "../middleware/require-role";
import { validate } from "../middleware/validate";
import { ordersQuerySchema } from "../types/analytics";
import { asyncHandler } from "../utils/async-handler";

const orderRouter = Router();

orderRouter.use(authenticateJWT, requireRole("ANALYST"));

orderRouter.get(
  "/",
  validate(ordersQuerySchema),
  asyncHandler(getOrdersHandler),
);

export { orderRouter };
