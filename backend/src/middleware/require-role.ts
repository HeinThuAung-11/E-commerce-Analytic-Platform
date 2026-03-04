import type { NextFunction, Request, Response } from "express";

import type { AccessTokenPayload } from "../utils/jwt";
import { createAppError } from "../utils/app-error";

type Role = AccessTokenPayload["role"];

const rolePriority: Record<Role, number> = {
  ADMIN: 3,
  MANAGER: 2,
  ANALYST: 1,
};

export function requireRole(requiredRole: Role) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    const currentUser = request.user;

    if (!currentUser) {
      throw createAppError("Authentication is required", 401, "AUTH_012");
    }

    if (rolePriority[currentUser.role] < rolePriority[requiredRole]) {
      throw createAppError("You do not have permission to access this resource", 403, "AUTH_013");
    }

    next();
  };
}
