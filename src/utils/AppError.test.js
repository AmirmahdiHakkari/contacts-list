import { describe, it, expect } from "@jest/globals";
import { AppError } from "../../src/utils/AppError.js";

describe("AppError", () => {
  it("should extend Error and set statusCode and message", () => {
    const err = new AppError(400, "Bad request");

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe("Bad request");
  });

  it("should set errors array if provided", () => {
    const errors = [{ field: "name", message: "Required" }];
    const err = new AppError(422, "Validation failed", errors);

    expect(err.statusCode).toBe(422);
    expect(err.errors).toEqual(errors);
  });

  it("should default errors to empty array if not provided", () => {
    const err = new AppError(500, "Internal error");

    expect(err.errors).toEqual([]);
  });
});
