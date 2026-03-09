import { randomUUID } from "crypto";
import type { NextFunction, Request, Response } from "express";

const REQUEST_ID_HEADER = "x-request-id";

export function attachRequestId(request: Request, response: Response, next: NextFunction): void {
  const incomingId = request.header(REQUEST_ID_HEADER);
  const requestId = incomingId && incomingId.trim().length > 0 ? incomingId : randomUUID();

  request.requestId = requestId;
  response.setHeader(REQUEST_ID_HEADER, requestId);
  next();
}
