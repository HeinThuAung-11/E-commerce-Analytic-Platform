import type { NextFunction, Request, Response } from "express";

import { logInfo } from "../utils/logger";

export function requestLogger(request: Request, response: Response, next: NextFunction): void {
  const startedAt = process.hrtime.bigint();

  response.on("finish", () => {
    const finishedAt = process.hrtime.bigint();
    const durationMs = Number(finishedAt - startedAt) / 1_000_000;

    logInfo({
      message: "HTTP request completed",
      requestId: request.requestId ?? null,
      method: request.method,
      path: request.originalUrl,
      statusCode: response.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      ip: request.ip,
      userAgent: request.get("user-agent") ?? null,
    });
  });

  next();
}
