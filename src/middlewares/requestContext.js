import { randomUUID } from "node:crypto";
import { logger } from "../config/logger.js";

export function requestContext(req, res, next) {
  const requestId = req.headers["x-request-id"]?.toString() || randomUUID();

  req.requestId = requestId;

  req.log = logger.child({
    requestId,
    method: req.method,
    path: req.originalUrl,
  });

  res.setHeader("x-request-id", requestId);
  next();
}
