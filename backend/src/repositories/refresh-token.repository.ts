import type { RefreshToken } from "@prisma/client";

import { prisma } from "../prisma/client";

type CreateRefreshTokenInput = {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
};

export async function createRefreshToken(
  input: CreateRefreshTokenInput,
): Promise<RefreshToken> {
  return prisma.refreshToken.create({
    data: input,
  });
}

export async function findRefreshTokenByToken(token: string): Promise<RefreshToken | null> {
  return prisma.refreshToken.findUnique({
    where: { token },
  });
}

export async function revokeRefreshTokenById(id: string): Promise<RefreshToken> {
  return prisma.refreshToken.update({
    where: { id },
    data: {
      revokedAt: new Date(),
    },
  });
}

export async function revokeRefreshTokenByToken(token: string): Promise<RefreshToken | null> {
  const record = await prisma.refreshToken.findUnique({
    where: { token },
  });

  if (!record) {
    return null;
  }

  return prisma.refreshToken.update({
    where: { id: record.id },
    data: {
      revokedAt: new Date(),
    },
  });
}

export async function rotateRefreshToken(
  oldTokenId: string,
  newToken: CreateRefreshTokenInput,
): Promise<RefreshToken> {
  const [, createdToken] = await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: oldTokenId },
      data: {
        revokedAt: new Date(),
      },
    }),
    prisma.refreshToken.create({
      data: newToken,
    }),
  ]);

  return createdToken;
}

export async function revokeAllRefreshTokensByUserId(userId: string): Promise<number> {
  const result = await prisma.refreshToken.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  return result.count;
}
