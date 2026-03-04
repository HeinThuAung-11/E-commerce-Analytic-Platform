import jwt from "jsonwebtoken";

import { env } from "../config/env";

export type AccessTokenPayload = {
  sub: string;
  role: "ADMIN" | "MANAGER" | "ANALYST";
  email: string;
};

export type RefreshTokenPayload = {
  sub: string;
  tokenId: string;
};

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.accessTokenSecret, {
    expiresIn: `${env.accessTokenExpiresInMinutes}m`,
  });
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.refreshTokenSecret, {
    expiresIn: `${env.refreshTokenExpiresInDays}d`,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.accessTokenSecret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.refreshTokenSecret) as RefreshTokenPayload;
}
