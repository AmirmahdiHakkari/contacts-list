import { describe, it, expect, jest, beforeEach } from "@jest/globals";

const verifyMock = jest.fn();

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    verify: verifyMock,
  },
}));

const { auth } = await import("../../src/middlewares/auth.js");

function createMockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("auth middleware", () => {
  beforeEach(() => {
    verifyMock.mockReset();
  });

  it("should return 401 if Authorization header is missing", () => {
    const req = { headers: {} };
    const res = createMockRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "توکن احراز هویت ارسال نشده است",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if scheme is not Bearer or token is missing", () => {
    const req = { headers: { authorization: "Token abc" } };
    const res = createMockRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "فرمت هدر Authorization نامعتبر است",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should attach decoded user and call next on valid token", () => {
    const decoded = { id: 1, name: "test" };
    verifyMock.mockReturnValue(decoded);

    const req = { headers: { authorization: "Bearer token123" } };
    const res = createMockRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(verifyMock).toHaveBeenCalledWith(
      "token123",
      process.env.JWT_SECRET || "dev_secret_key"
    );
    expect(req.user).toEqual(decoded);
    expect(next).toHaveBeenCalled();
  });

  it("should return 401 if jwt.verify throws", () => {
    verifyMock.mockImplementation(() => {
      throw new Error("invalid token");
    });

    const req = { headers: { authorization: "Bearer badtoken" } };
    const res = createMockRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "توکن نامعتبر یا منقضی شده است",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
