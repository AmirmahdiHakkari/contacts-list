import { AppError } from "../utils/AppError.js";

export function errorHandler(err, req, res, next) {
  if (!err) {
    return next();
  }

  const isDev = process.env.NODE_ENV === "development";

  const meta = {
    code: err.code,
    errno: err.errno,
    syscall: err.syscall,
    path: err.path,
    address: err.address,
    port: err.port,
  };

  console.error("Global error handler:", {
    message: err.message,
    stack: err.stack,
    ...meta,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      errors: err.errors && err.errors.length ? err.errors : undefined,
    });
  }

  if (err.code === "23505") {
    return res.status(409).json({
      message: "رکورد تکراری است",
    });
  }

  if (err.code === "23503") {
    return res.status(400).json({
      message: "ارتباط داده نامعتبر است (foreign key violation)",
    });
  }

  if (err.code === "EACCES" || err.code === "EPERM") {
    return res.status(500).json({
      message:
        "خطای سطح سیستم‌عامل: دسترسی به منبع در سرور امکان‌پذیر نیست. لطفاً بعداً تلاش کنید.",
    });
  }

  if (err.code === "EADDRINUSE") {
    return res.status(503).json({
      message:
        "پورت سرویس در حال استفاده است. سرویس دیگری در حال اجرا می‌باشد یا پیکربندی سرور نیاز به بررسی دارد.",
    });
  }

  if (err.code === "ENOENT") {
    return res.status(500).json({
      message:
        "منبع داخلی مورد نیاز سرور پیدا نشد. لطفاً با پشتیبانی تماس بگیرید.",
    });
  }

  if (
    err.code === "ECONNREFUSED" ||
    err.code === "ECONNRESET" ||
    err.code === "ETIMEDOUT" ||
    err.code === "ENOTFOUND" ||
    err.code === "EPIPE"
  ) {
    return res.status(503).json({
      message:
        "امکان برقراری ارتباط با سرویس‌های زیرساختی وجود ندارد. لطفاً بعداً تلاش کنید.",
    });
  }

  return res.status(500).json({
    message: "خطای داخلی سرور",
    ...(isDev && { stack: err.stack, code: err.code }),
  });
}
