import type { NextFunction, Request, Response } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { ZodError } from "zod";

import type { ApiErrorResponse } from "../types/api";
import { isAppError } from "../utils/app-error";

export function notFoundHandler(_request: Request, response: Response): void {
  const payload: ApiErrorResponse = {
    success: false,
    message: "Route not found",
    errorCode: "ROUTE_404",
  };

  response.status(404).json(payload);
}

export function errorHandler(
  error: Error,
  request: Request,
  response: Response,
  _next: NextFunction,
): void {
  console.error(
    `[error] ${request.method} ${request.originalUrl} - ${error.name}: ${error.message}`,
  );

  if (isAppError(error)) {
    const payload: ApiErrorResponse = {
      success: false,
      message: error.message,
      errorCode: error.errorCode,
    };

    response.status(error.statusCode).json(payload);
    return;
  }

  if (error instanceof ZodError) {
    const payload: ApiErrorResponse = {
      success: false,
      message: "Request validation failed",
      errorCode: "VALIDATION_001",
    };

    response.status(400).json(payload);
    return;
  }

  if (error instanceof TokenExpiredError) {
    const payload: ApiErrorResponse = {
      success: false,
      message: "Token has expired",
      errorCode: "AUTH_008",
    };

    response.status(401).json(payload);
    return;
  }

  if (error instanceof JsonWebTokenError) {
    const payload: ApiErrorResponse = {
      success: false,
      message: "Token is invalid",
      errorCode: "AUTH_009",
    };

    response.status(401).json(payload);
    return;
  }

  const payload: ApiErrorResponse = {
    success: false,
    message: error.message || "Internal server error",
    errorCode: "APP_500",
  };

  response.status(500).json(payload);
}
