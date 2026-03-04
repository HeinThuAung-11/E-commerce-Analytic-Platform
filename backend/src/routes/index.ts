import { Router } from "express";

import { analyticsRouter } from "./analytics.routes";
import { authRouter } from "./auth.routes";
import { orderRouter } from "./order.routes";
import { productRouter } from "./product.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/analytics", analyticsRouter);
router.use("/orders", orderRouter);
router.use("/products", productRouter);

router.get("/health", (_request, response) => {
  response.status(200).json({
    success: true,
    message: "Backend is running",
  });
});

export { router };
