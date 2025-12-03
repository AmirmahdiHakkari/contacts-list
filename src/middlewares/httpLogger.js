import morgan from "morgan";
import { logger } from "../config/logger.js";

morgan.token("requestId", (req) => req.requestId || "-");

export const httpLogger = morgan((tokens, req, res) => {
  const durationMs = Number(tokens["response-time"](req, res));
  const contentLength = Number(tokens.res(req, res, "content-length") || 0);

  const payload = {
    msg: "http_request",
    type: "access",
    requestId: tokens.requestId(req, res),
    method: tokens.method(req, res),
    path: tokens.url(req, res),
    status: Number(tokens.status(req, res)),
    durationMs,
    contentLength,
    remoteAddr: tokens["remote-addr"](req, res),
    userAgent: tokens["user-agent"](req, res),
  };

  logger.info(payload.msg, payload);
  return null;
});
