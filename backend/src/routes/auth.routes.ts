import { Router } from "express";

import {
  loginHandler,
  logoutHandler,
  refreshHandler,
  registerHandler,
} from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/async-handler";
import { emptyBodySchema, loginSchema, registerSchema } from "../types/auth";

const authRouter = Router();

authRouter.post(
  "/register",
  validate(registerSchema),
  asyncHandler(registerHandler),
);

authRouter.post(
  "/login",
  validate(loginSchema),
  asyncHandler(loginHandler),
);

authRouter.post(
  "/refresh",
  validate(emptyBodySchema),
  asyncHandler(refreshHandler),
);

authRouter.post(
  "/logout",
  validate(emptyBodySchema),
  asyncHandler(logoutHandler),
);

export { authRouter };
