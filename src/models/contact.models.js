import Joi from "joi";

const nameSchema = Joi.string().trim().min(2).max(100).messages({
  "string.base": "نام باید رشته باشد",
  "string.empty": "نام نباید خالی باشد",
  "string.min": "نام باید حداقل ۲ کاراکتر باشد",
  "string.max": "نام نباید بیشتر از ۱۰۰ کاراکتر باشد",
});

const phoneSchema = Joi.string()
  .trim()
  .pattern(/^09\d{9}$/)
  .messages({
    "string.base": "شماره تلفن باید رشته باشد",
    "string.empty": "شماره تلفن نباید خالی باشد",
    "string.pattern.base": "فرمت شماره موبایل معتبر نیست",
  });

export const createContactSchema = Joi.object({
  name: nameSchema.required().messages({
    "any.required": "نام الزامی است",
  }),
  phone: phoneSchema.required().messages({
    "any.required": "شماره تلفن الزامی است",
  }),
});

export const updateContactSchema = Joi.object({
  name: nameSchema.optional(),
  phone: phoneSchema.optional(),
})
  .or("name", "phone")
  .messages({
    "object.missing":
      "حداقل یکی از فیلدهای نام مخاطب یا شماره تلفن مخاطب باید ارسال شود",
  });
