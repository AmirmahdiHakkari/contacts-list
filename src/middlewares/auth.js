import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";

export function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(
      new AppError(401, "توکن احراز هویت ارسال نشده است", {
        isOperational: true,
      })
    );
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(
      new AppError(401, "فرمت هدر Authorization نامعتبر است", {
        isOperational: true,
      })
    );
  }

  try {
    const secret = process.env.JWT_SECRET || "dev_secret_key";
    const decoded = jwt.verify(token, secret);

    if (!decoded.id || !decoded.public_id) {
      return next(
        new AppError(500, "ساختار توکن نامعتبر است", {
          isOperational: false,
        })
      );
    }

    req.user = decoded;

    return next();
  } catch (error) {
    req.log?.warn("JWT verify error", { message: error.message });
    return next(
      new AppError(401, "توکن نامعتبر یا منقضی شده است", {
        isOperational: true,
      })
    );
  }
}
