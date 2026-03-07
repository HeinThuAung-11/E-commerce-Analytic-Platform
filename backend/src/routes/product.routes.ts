import { Router } from "express";

import { getProductsHandler } from "../controllers/analytics.controller";
import { authenticateJWT } from "../middleware/authenticate-jwt";
import { requireRole } from "../middleware/require-role";
import { validate } from "../middleware/validate";
import { ordersQuerySchema } from "../types/analytics";
import { asyncHandler } from "../utils/async-handler";

const productRouter = Router();

productRouter.use(authenticateJWT, requireRole("ANALYST"));

productRouter.get(
  "/",
  validate(ordersQuerySchema),
  asyncHandler(getProductsHandler),
);

export { productRouter };
