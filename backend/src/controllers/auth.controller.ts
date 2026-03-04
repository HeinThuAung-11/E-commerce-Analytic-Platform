import type { Request, Response } from "express";

import type { LoginInput, RegisterInput } from "../types/auth";
import {
  getClearRefreshCookieOptions,
  getRefreshCookieOptions,
  login,
  logout,
  refresh,
  register,
} from "../services/auth.service";

const REFRESH_COOKIE_NAME = "refreshToken";

export async function registerHandler(request: Request, response: Response): Promise<void> {
  const payload = request.body as RegisterInput;
  const result = await register(payload);

  response.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getRefreshCookieOptions());

  response.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      accessToken: result.accessToken,
      user: result.user,
    },
  });
}

export async function loginHandler(request: Request, response: Response): Promise<void> {
  const payload = request.body as LoginInput;
  const result = await login(payload);

  response.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getRefreshCookieOptions());

  response.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      accessToken: result.accessToken,
      user: result.user,
    },
  });
}

export async function refreshHandler(request: Request, response: Response): Promise<void> {
  const refreshTokenValue = request.cookies[REFRESH_COOKIE_NAME] as string | undefined;
  const result = await refresh(refreshTokenValue ?? "");

  response.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getRefreshCookieOptions());

  response.status(200).json({
    success: true,
    message: "Token refreshed successfully",
    data: {
      accessToken: result.accessToken,
      user: result.user,
    },
  });
}

export async function logoutHandler(request: Request, response: Response): Promise<void> {
  const refreshTokenValue = request.cookies[REFRESH_COOKIE_NAME] as string | undefined;

  await logout(refreshTokenValue);

  response.clearCookie(REFRESH_COOKIE_NAME, getClearRefreshCookieOptions());
  response.status(200).json({
    success: true,
    message: "Logout successful",
  });
}
