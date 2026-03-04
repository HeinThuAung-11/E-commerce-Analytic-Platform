import type { NextFunction, Request, Response } from "express";
import type { AnyZodObject } from "zod";

export function validate(schema: AnyZodObject) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    schema.parse({
      body: request.body,
      query: request.query,
      params: request.params,
      cookies: request.cookies,
    });

    next();
  };
}

