import type { RoleName } from "@prisma/client";

import {
  login,
  refresh,
  register,
} from "./auth.service";
import * as refreshTokenRepository from "../repositories/refresh-token.repository";
import * as userRepository from "../repositories/user.repository";
import * as passwordUtils from "../utils/password";
import * as jwtUtils from "../utils/jwt";

jest.mock("../repositories/user.repository");
jest.mock("../repositories/refresh-token.repository");
jest.mock("../utils/password");
jest.mock("../utils/jwt");

type UserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  roleId: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  role: {
    name: RoleName;
  };
};

const mockedUserRepository = jest.mocked(userRepository);
const mockedRefreshTokenRepository = jest.mocked(refreshTokenRepository);
const mockedPasswordUtils = jest.mocked(passwordUtils);
const mockedJwtUtils = jest.mocked(jwtUtils);

describe("auth.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedPasswordUtils.hashPassword.mockResolvedValue("hashed-password");
    mockedPasswordUtils.comparePassword.mockResolvedValue(true);
    mockedJwtUtils.signAccessToken.mockReturnValue("access-token");
    mockedJwtUtils.signRefreshToken.mockReturnValue("refresh-token");
    mockedJwtUtils.verifyRefreshToken.mockReturnValue({
      sub: "user-1",
      tokenId: "token-1",
    });
    mockedRefreshTokenRepository.createRefreshToken.mockResolvedValue({
      id: "token-1",
      userId: "user-1",
      token: "refresh-token",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      revokedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockedRefreshTokenRepository.rotateRefreshToken.mockResolvedValue({
      id: "token-2",
      userId: "user-1",
      token: "refresh-token",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      revokedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it("forces register role to ANALYST", async () => {
    mockedUserRepository.findUserByEmail.mockResolvedValue(null);
    mockedUserRepository.createUser.mockResolvedValue({
      id: "user-1",
      name: "Alice",
      email: "alice@example.com",
      passwordHash: "hashed-password",
      roleId: "role-analyst",
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: {
        name: "ANALYST",
      },
    });

    await register({
      name: "Alice",
      email: "alice@example.com",
      password: "StrongPass123",
    });

    expect(mockedUserRepository.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        roleName: "ANALYST",
      }),
    );
  });

  it("returns auth error when login password is invalid", async () => {
    const user: UserRecord = {
      id: "user-1",
      name: "Alice",
      email: "alice@example.com",
      passwordHash: "stored-hash",
      roleId: "role-analyst",
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: {
        name: "ANALYST",
      },
    };

    mockedUserRepository.findUserByEmail.mockResolvedValue(user);
    mockedPasswordUtils.comparePassword.mockResolvedValue(false);

    await expect(
      login({
        email: "alice@example.com",
        password: "wrong-password",
      }),
    ).rejects.toMatchObject({
      statusCode: 401,
      errorCode: "AUTH_002",
    });
  });

  it("rotates refresh token atomically on refresh", async () => {
    const user: UserRecord = {
      id: "user-1",
      name: "Alice",
      email: "alice@example.com",
      passwordHash: "stored-hash",
      roleId: "role-manager",
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: {
        name: "MANAGER",
      },
    };

    mockedRefreshTokenRepository.findRefreshTokenByToken.mockResolvedValue({
      id: "token-1",
      userId: "user-1",
      token: "old-refresh-token",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      revokedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockedUserRepository.findUserById.mockResolvedValue(user);

    await refresh("old-refresh-token");

    expect(mockedRefreshTokenRepository.rotateRefreshToken).toHaveBeenCalledWith(
      "token-1",
      expect.objectContaining({
        userId: "user-1",
        token: "refresh-token",
      }),
    );
    expect(mockedRefreshTokenRepository.revokeRefreshTokenById).not.toHaveBeenCalledWith("token-1");
  });

  it("revokes expired refresh token and throws", async () => {
    mockedJwtUtils.verifyRefreshToken.mockReturnValue({
      sub: "user-1",
      tokenId: "token-expired",
    });
    mockedRefreshTokenRepository.findRefreshTokenByToken.mockResolvedValue({
      id: "token-expired",
      userId: "user-1",
      token: "expired-refresh-token",
      expiresAt: new Date(Date.now() - 1000),
      revokedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(refresh("expired-refresh-token")).rejects.toMatchObject({
      statusCode: 401,
      errorCode: "AUTH_006",
    });
    expect(mockedRefreshTokenRepository.revokeRefreshTokenById).toHaveBeenCalledWith("token-expired");
  });
});
