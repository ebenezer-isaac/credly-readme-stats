import { describe, it, expect } from "vitest";
import { AppError, createErrorInfo } from "../../../src/middleware/errorHandler.js";
import type { ErrorType } from "../../../src/middleware/errorHandler.js";

describe("AppError", () => {
  it("creates error with type and message", () => {
    const err = new AppError("USER_NOT_FOUND", "User not found");
    expect(err.type).toBe("USER_NOT_FOUND");
    expect(err.message).toBe("User not found");
    expect(err.name).toBe("AppError");
  });

  it("maps USER_NOT_FOUND to 404", () => {
    expect(new AppError("USER_NOT_FOUND", "").statusCode).toBe(404);
  });

  it("maps BADGE_NOT_FOUND to 404", () => {
    expect(new AppError("BADGE_NOT_FOUND", "").statusCode).toBe(404);
  });

  it("maps INVALID_USERNAME to 400", () => {
    expect(new AppError("INVALID_USERNAME", "").statusCode).toBe(400);
  });

  it("maps RATE_LIMITED to 429", () => {
    expect(new AppError("RATE_LIMITED", "").statusCode).toBe(429);
  });

  it("maps CREDLY_API_ERROR to 502", () => {
    expect(new AppError("CREDLY_API_ERROR", "").statusCode).toBe(502);
  });

  it("maps INTERNAL_ERROR to 500", () => {
    expect(new AppError("INTERNAL_ERROR", "").statusCode).toBe(500);
  });

  it("is an instance of Error", () => {
    const err = new AppError("INTERNAL_ERROR", "test");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });
});

describe("createErrorInfo", () => {
  const allTypes: ErrorType[] = [
    "USER_NOT_FOUND",
    "BADGE_NOT_FOUND",
    "INVALID_USERNAME",
    "RATE_LIMITED",
    "CREDLY_API_ERROR",
    "INTERNAL_ERROR",
  ];

  it("returns error info with message and suggestion for all types", () => {
    for (const type of allTypes) {
      const info = createErrorInfo(type);
      expect(info.type).toBe(type);
      expect(info.message).toBeTruthy();
      expect(info.suggestion).toBeTruthy();
      expect(typeof info.message).toBe("string");
      expect(typeof info.suggestion).toBe("string");
    }
  });

  it("includes username in USER_NOT_FOUND message", () => {
    const info = createErrorInfo("USER_NOT_FOUND", { username: "johndoe" });
    expect(info.message).toContain("johndoe");
  });

  it("includes username in BADGE_NOT_FOUND message", () => {
    const info = createErrorInfo("BADGE_NOT_FOUND", { username: "johndoe" });
    expect(info.message).toContain("johndoe");
  });

  it("handles missing context gracefully", () => {
    const info = createErrorInfo("USER_NOT_FOUND");
    expect(info.message).toContain("unknown");
  });

  it("handles empty context", () => {
    const info = createErrorInfo("USER_NOT_FOUND", {});
    expect(info.message).toContain("unknown");
  });

  it("suggestion provides actionable guidance", () => {
    expect(createErrorInfo("USER_NOT_FOUND").suggestion).toContain("username");
    expect(createErrorInfo("BADGE_NOT_FOUND").suggestion).toContain("badge_id");
    expect(createErrorInfo("INVALID_USERNAME").suggestion).toContain("letters");
    expect(createErrorInfo("RATE_LIMITED").suggestion).toContain("wait");
    expect(createErrorInfo("CREDLY_API_ERROR").suggestion).toContain("minutes");
    expect(createErrorInfo("INTERNAL_ERROR").suggestion).toContain("issue");
  });
});
