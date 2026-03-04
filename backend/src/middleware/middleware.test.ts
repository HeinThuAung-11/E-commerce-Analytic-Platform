import type { NextFunction, Request, Response } from "express";

import { authenticateJWT } from "./authenticate-jwt";
import { requireRole } from "./require-role";
import { validate } from "./validate";
import { registerSchema } from "../types/auth";
import * as jwtUtils from "../utils/jwt";

jest.mock("../utils/jwt");

const mockedJwtUtils = jest.mocked(jwtUtils);

function createNext(): NextFunction {
  return jest.fn() as unknown as NextFunction;
}

describe("middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("validate middleware throws on invalid payload", () => {
    const middleware = validate(registerSchema);
    const request = {
      body: {
        name: "A",
        email: "not-an-email",
        password: "123",
      },
      query: {},
      params: {},
      cookies: {},
    } as unknown as Request;
    const response = {} as Response;
    const next = createNext();

    expect(() => middleware(request, response, next)).toThrow();
    expect(next).not.toHaveBeenCalled();
  });

  it("authenticateJWT attaches user when token is valid", () => {
    mockedJwtUtils.verifyAccessToken.mockReturnValue({
      sub: "user-1",
      role: "ANALYST",
      email: "user@example.com",
    });

    const request = {
      headers: {
        authorization: "Bearer valid-token",
      },
    } as unknown as Request;
    const response = {} as Response;
    const next = createNext();

    authenticateJWT(request, response, next);

    expect(request.user).toEqual({
      sub: "user-1",
      role: "ANALYST",
      email: "user@example.com",
    });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("authenticateJWT throws when Bearer token is missing", () => {
    const request = {
      headers: {
        authorization: "Token invalid",
      },
    } as unknown as Request;
    const response = {} as Response;
    const next = createNext();

    expect(() => authenticateJWT(request, response, next)).toThrow();
    expect(next).not.toHaveBeenCalled();
  });

  it("requireRole rejects when user role is insufficient", () => {
    const middleware = requireRole("MANAGER");
    const request = {
      user: {
        sub: "user-1",
        role: "ANALYST",
        email: "user@example.com",
      },
    } as unknown as Request;
    const response = {} as Response;
    const next = createNext();

    expect(() => middleware(request, response, next)).toThrow();
    expect(next).not.toHaveBeenCalled();
  });

  it("requireRole allows higher privilege role", () => {
    const middleware = requireRole("ANALYST");
    const request = {
      user: {
        sub: "user-1",
        role: "ADMIN",
        email: "admin@example.com",
      },
    } as unknown as Request;
    const response = {} as Response;
    const next = createNext();

    middleware(request, response, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
