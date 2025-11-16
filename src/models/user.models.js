import Joi from "joi";

const nameSchema = Joi.string().trim().min(2).max(100).messages({
  "string.base": "نام باید رشته باشد",
  "string.empty": "نام نباید خالی باشد",
  "string.min": "نام باید حداقل ۲ کاراکتر باشد",
  "string.max": "نام نباید بیشتر از ۱۰۰ کاراکتر باشد",
});

const passwordSchema = Joi.string().trim().min(6).max(100).messages({
  "string.base": "رمزعبور باید رشته باشد",
  "string.empty": "رمزعبور نباید خالی باشد",
  "string.min": "رمزعبور باید حداقل ۶ کاراکتر باشد",
  "string.max": "رمزعبور نباید بیشتر از ۱۰۰ کاراکتر باشد",
});

export const registerUserSchema = Joi.object({
  name: nameSchema.required().messages({
    "any.required": "نام الزامی است",
  }),
  password: passwordSchema.required().messages({
    "any.required": "رمزعبور الزامی است",
  }),
});

export const loginUserSchema = Joi.object({
  name: nameSchema.required().messages({
    "any.required": "نام الزامی است",
  }),
  password: passwordSchema.required().messages({
    "any.required": "رمزعبور الزامی است",
  }),
});
