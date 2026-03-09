import { Router } from "express";

import { prisma } from "../prisma/client";
import { checkRedisHealth } from "../utils/redis";
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

router.get("/health/readiness", async (_request, response) => {
  const [databaseReady, redisReady] = await Promise.all([
    prisma.$queryRaw`SELECT 1`
      .then(() => true)
      .catch(() => false),
    checkRedisHealth(),
  ]);

  const ready = databaseReady && redisReady;

  response.status(ready ? 200 : 503).json({
    success: ready,
    message: ready ? "Service is ready" : "Service dependencies are not ready",
    dependencies: {
      database: databaseReady ? "up" : "down",
      redis: redisReady ? "up" : "down",
    },
  });
});

export { router };
