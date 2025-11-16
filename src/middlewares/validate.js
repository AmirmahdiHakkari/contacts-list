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

      return res.status(400).json({
        message: "خطا در اعتبارسنجی ورودی‌ها",
        errors,
      });
    }

    req.body = value;
    next();
  };
}
