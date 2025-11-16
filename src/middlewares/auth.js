import jwt from "jsonwebtoken";

export function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "توکن احراز هویت ارسال نشده است",
    });
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      message: "فرمت هدر Authorization نامعتبر است",
    });
  }

  try {
    const secret = process.env.JWT_SECRET || "dev_secret_key";
    const decoded = jwt.verify(token, secret);

    req.user = decoded;

    return next();
  } catch (error) {
    console.error("JWT verify error:", error.message);
    return res.status(401).json({
      message: "توکن نامعتبر یا منقضی شده است",
    });
  }
}
