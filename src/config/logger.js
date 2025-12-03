import winston from "winston";
import path from "node:path";

const isProd = process.env.NODE_ENV === "production";
const { combine, timestamp, errors, printf, json } = winston.format;

const devFormat = printf((info) => {
  const { level, message, timestamp, stack, ...meta } = info;
  const base = `${timestamp} ${level}: ${message}`;
  const rest = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  return stack ? `${base}${rest}\n${stack}` : `${base}${rest}`;
});

export const logger = winston.createLogger({
  level: isProd ? "info" : "debug",
  format: combine(
    timestamp(),
    errors({ stack: true }),
    isProd ? json() : devFormat
  ),
  defaultMeta: { service: process.env.SERVICE_NAME || "contacts-api" },
  transports: [
    new winston.transports.Console(),

    new winston.transports.File({
      filename: path.join("logs", "app.log"),
    }),

    new winston.transports.File({
      filename: path.join("logs", "error.log"),
      level: "error",
    }),
  ],
});
