import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { errorHandler } from "../../src/middlewares/errorHandler.js";
import { AppError } from "../../src/utils/AppError.js";

function createMockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("errorHandler middleware", () => {
  let res;
  let next;

  beforeEach(() => {
    res = createMockRes();
    next = jest.fn();
    process.env.NODE_ENV = "test";
  });

  it("should pass through if no error", () => {
    errorHandler(null, {}, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("should handle AppError with statusCode and errors", () => {
    const err = new AppError(400, "Bad request", [
      { field: "name", message: "Required" },
    ]);

    errorHandler(err, {}, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Bad request",
      errors: [{ field: "name", message: "Required" }],
    });
  });

  it("should map Postgres duplicate key (23505) to 409", () => {
    const err = { code: "23505", message: "duplicate key value" };

    errorHandler(err, {}, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "رکورد تکراری است",
    });
  });

  it("should map network errors to 503", () => {
    const err = { code: "ECONNRESET" };

    errorHandler(err, {}, res, next);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      message:
        "امکان برقراری ارتباط با سرویس‌های زیرساختی وجود ندارد. لطفاً بعداً تلاش کنید.",
    });
  });

  it("should return 500 for unknown errors", () => {
    const err = new Error("something bad");

    errorHandler(err, {}, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toMatchObject({
      message: "خطای داخلی سرور",
    });
  });
});
