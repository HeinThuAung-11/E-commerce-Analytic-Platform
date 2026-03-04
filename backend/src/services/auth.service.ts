import { randomUUID } from "crypto";

import type { RoleName } from "@prisma/client";

import { env } from "../config/env";
import {
  createRefreshToken,
  findRefreshTokenByToken,
  rotateRefreshToken,
  revokeRefreshTokenById,
  revokeRefreshTokenByToken,
} from "../repositories/refresh-token.repository";
import { createUser, findUserByEmail, findUserById } from "../repositories/user.repository";
import type { LoginInput, RegisterInput } from "../types/auth";
import { comparePassword, hashPassword } from "../utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { createAppError } from "../utils/app-error";

type AuthResult = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: RoleName;
  };
};

type AuthCookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  expires: Date;
};

type ClearCookieOptions = Omit<AuthCookieOptions, "expires">;

export async function register(input: RegisterInput): Promise<AuthResult> {
  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    throw createAppError("Email is already registered", 409, "AUTH_001");
  }

  const passwordHash = await hashPassword(input.password);
  const roleName: RoleName = "ANALYST";
  const user = await createUser({
    name: input.name,
    email: input.email,
    passwordHash,
    roleName,
  });

  return createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role.name,
  });
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await findUserByEmail(input.email);

  if (!user || user.deletedAt) {
    throw createAppError("Invalid email or password", 401, "AUTH_002");
  }

  const isPasswordValid = await comparePassword(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw createAppError("Invalid email or password", 401, "AUTH_002");
  }

  return createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role.name,
  });
}

export async function refresh(refreshToken: string): Promise<AuthResult> {
  if (!refreshToken) {
    throw createAppError("Refresh token is required", 401, "AUTH_003");
  }

  const payload = verifyRefreshToken(refreshToken);
  const storedToken = await findRefreshTokenByToken(refreshToken);

  if (!storedToken) {
    throw createAppError("Refresh token is invalid", 401, "AUTH_004");
  }

  if (storedToken.revokedAt) {
    throw createAppError("Refresh token has been revoked", 401, "AUTH_005");
  }

  if (storedToken.id !== payload.tokenId || storedToken.userId !== payload.sub) {
    throw createAppError("Refresh token is invalid", 401, "AUTH_004");
  }

  if (storedToken.expiresAt.getTime() <= Date.now()) {
    await revokeRefreshTokenById(storedToken.id);
    throw createAppError("Refresh token has expired", 401, "AUTH_006");
  }

  const user = await findUserById(storedToken.userId);

  if (!user || user.deletedAt) {
    throw createAppError("User account is unavailable", 401, "AUTH_007");
  }

  return createSession(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
    },
    { rotateFromTokenId: storedToken.id },
  );
}

export async function logout(refreshToken: string | undefined): Promise<void> {
  if (!refreshToken) {
    return;
  }

  await revokeRefreshTokenByToken(refreshToken);
}

export function getRefreshCookieOptions(): AuthCookieOptions {
  const expires = new Date();
  expires.setDate(expires.getDate() + env.refreshTokenExpiresInDays);

  return {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    expires,
  };
}

export function getClearRefreshCookieOptions(): ClearCookieOptions {
  return {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
  };
}

type CreateSessionOptions = {
  rotateFromTokenId?: string;
};

async function createSession(
  user: AuthResult["user"],
  options?: CreateSessionOptions,
): Promise<AuthResult> {
  const refreshTokenId = randomUUID();
  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role,
    email: user.email,
  });
  const refreshToken = signRefreshToken({
    sub: user.id,
    tokenId: refreshTokenId,
  });
  const expiresAt = new Date();

  expiresAt.setDate(expiresAt.getDate() + env.refreshTokenExpiresInDays);

  if (options?.rotateFromTokenId) {
    await rotateRefreshToken(options.rotateFromTokenId, {
      id: refreshTokenId,
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });
  } else {
    await createRefreshToken({
      id: refreshTokenId,
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });
  }

  return {
    accessToken,
    refreshToken,
    user,
  };
}
