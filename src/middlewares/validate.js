import { AppError } from "../utils/AppError.js";

export function validate(schema) {
  return (req, res, next) => {
    const options = {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    };

    const { error, value } = schema.validate(req.body, options);

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return next(
        new AppError(400, "خطا در اعتبارسنجی ورودی‌ها", { errors })
      );
    }

    req.body = value;
    next();
  };
}
