import { Router } from "express";

import { getProductsHandler } from "../controllers/analytics.controller";
import { authenticateJWT } from "../middleware/authenticate-jwt";
import { requireRole } from "../middleware/require-role";
import { asyncHandler } from "../utils/async-handler";

const productRouter = Router();

productRouter.use(authenticateJWT, requireRole("ANALYST"));

productRouter.get(
  "/",
  asyncHandler(getProductsHandler),
);

export { productRouter };
