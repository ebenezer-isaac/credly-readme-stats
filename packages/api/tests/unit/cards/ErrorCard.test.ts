import { describe, it, expect } from "vitest";
import { renderErrorCard } from "../../../src/cards/ErrorCard.js";
import { createErrorInfo } from "../../../src/middleware/errorHandler.js";
import type { ErrorType } from "../../../src/middleware/errorHandler.js";
import { assertValidSvg } from "../../helpers/testUtils.js";

describe("renderErrorCard", () => {
  it("produces valid SVG", () => {
    const info = createErrorInfo("INTERNAL_ERROR");
    assertValidSvg(renderErrorCard(info));
  });

  it("includes error message", () => {
    const info = createErrorInfo("USER_NOT_FOUND", { username: "testuser" });
    const svg = renderErrorCard(info);
    expect(svg).toContain("testuser");
  });

  it("includes suggestion text", () => {
    const info = createErrorInfo("INVALID_USERNAME");
    const svg = renderErrorCard(info);
    expect(svg).toContain(info.suggestion);
  });

  it("includes 'Something went wrong' header", () => {
    const info = createErrorInfo("INTERNAL_ERROR");
    const svg = renderErrorCard(info);
    expect(svg).toContain("Something went wrong");
  });

  it("renders all error types correctly", () => {
    const types: ErrorType[] = [
      "USER_NOT_FOUND",
      "BADGE_NOT_FOUND",
      "INVALID_USERNAME",
      "RATE_LIMITED",
      "CREDLY_API_ERROR",
      "INTERNAL_ERROR",
    ];

    for (const type of types) {
      const info = createErrorInfo(type);
      const svg = renderErrorCard(info);
      assertValidSvg(svg);
      // Message is HTML-encoded in SVG (quotes become &quot;)
      expect(svg).toContain("Something went wrong");
      expect(svg).toContain(info.suggestion);
    }
  });

  it("uses default colors when no colors provided", () => {
    const info = createErrorInfo("INTERNAL_ERROR");
    const svg = renderErrorCard(info);
    expect(svg).toContain("#e74c3c"); // default title color
    expect(svg).toContain("#fffefe"); // default bg color
  });

  it("uses custom colors when provided", () => {
    const info = createErrorInfo("INTERNAL_ERROR");
    const svg = renderErrorCard(info, {
      titleColor: "#ff0000",
      textColor: "#00ff00",
      bgColor: "#0000ff",
      borderColor: "#111111",
      badgeLabelColor: "#222222",
    });
    expect(svg).toContain("#ff0000");
    expect(svg).toContain("#00ff00");
    expect(svg).toContain("#0000ff");
  });

  it("handles gradient bgColor by falling back to default", () => {
    const info = createErrorInfo("INTERNAL_ERROR");
    const svg = renderErrorCard(info, {
      bgColor: ["35", "#0d1117", "#1a1b27"],
    });
    expect(svg).toContain("#fffefe"); // fallback to default solid color
  });

  it("escapes HTML in error message", () => {
    const info = {
      type: "INTERNAL_ERROR" as ErrorType,
      message: '<script>alert("xss")</script>',
      suggestion: "Try again.",
    };
    const svg = renderErrorCard(info);
    expect(svg).not.toContain("<script>");
    expect(svg).toContain("&lt;script&gt;");
  });

  it("includes accessibility desc with error message", () => {
    const info = createErrorInfo("USER_NOT_FOUND", { username: "test" });
    const svg = renderErrorCard(info);
    expect(svg).toContain("<desc");
  });

  it("includes warning icon", () => {
    const info = createErrorInfo("INTERNAL_ERROR");
    const svg = renderErrorCard(info);
    expect(svg).toContain("<path"); // SVG icon path
  });
});
