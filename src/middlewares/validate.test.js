import { describe, it, expect, jest } from "@jest/globals";
import { validate } from "../../src/middlewares/validate.js";

function createMockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("validate middleware", () => {
  it("should call next and replace req.body with validated value when schema passes", () => {
    const fakeSchema = {
      validate: jest.fn().mockReturnValue({
        error: null,
        value: { name: "Ali" },
      }),
    };

    const middleware = validate(fakeSchema);
    const req = { body: { name: "Ali", extra: "x" } };
    const res = createMockRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(fakeSchema.validate).toHaveBeenCalledWith(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });
    expect(req.body).toEqual({ name: "Ali" });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should return 400 with errors when validation fails", () => {
    const fakeError = {
      details: [
        { path: ["name"], message: '"name" is required' },
        { path: ["password"], message: '"password" is too short' },
      ],
    };

    const fakeSchema = {
      validate: jest.fn().mockReturnValue({
        error: fakeError,
        value: null,
      }),
    };

    const middleware = validate(fakeSchema);
    const req = { body: {} };
    const res = createMockRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "خطا در اعتبارسنجی ورودی‌ها",
      errors: [
        { field: "name", message: '"name" is required' },
        { field: "password", message: '"password" is too short' },
      ],
    });
    expect(next).not.toHaveBeenCalled();
  });
});
