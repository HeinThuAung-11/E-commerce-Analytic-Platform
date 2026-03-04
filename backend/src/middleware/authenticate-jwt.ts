import type { NextFunction, Request, Response } from "express";

import { verifyAccessToken } from "../utils/jwt";
import { createAppError } from "../utils/app-error";

export function authenticateJWT(
  request: Request,
  _response: Response,
  next: NextFunction,
): void {
  const authorization = request.headers.authorization;

  if (!authorization) {
    throw createAppError("Authorization header is required", 401, "AUTH_010");
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw createAppError("Authorization header must use Bearer token", 401, "AUTH_011");
  }

  request.user = verifyAccessToken(token);
  next();
}
