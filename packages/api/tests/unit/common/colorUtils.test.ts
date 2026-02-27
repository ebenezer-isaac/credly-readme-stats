import { describe, it, expect } from "vitest";
import {
  isValidHexColor,
  normalizeHex,
  parseGradient,
  resolveColor,
} from "../../../src/common/colorUtils.js";

describe("isValidHexColor", () => {
  it("accepts 3-digit hex", () => {
    expect(isValidHexColor("abc")).toBe(true);
    expect(isValidHexColor("#abc")).toBe(true);
  });

  it("accepts 6-digit hex", () => {
    expect(isValidHexColor("ff0000")).toBe(true);
    expect(isValidHexColor("#ff0000")).toBe(true);
  });

  it("accepts 8-digit hex (with alpha)", () => {
    expect(isValidHexColor("ff0000ff")).toBe(true);
    expect(isValidHexColor("#ff0000ff")).toBe(true);
  });

  it("rejects invalid hex", () => {
    expect(isValidHexColor("xyz")).toBe(false);
    expect(isValidHexColor("ff00")).toBe(false);
    expect(isValidHexColor("red")).toBe(false);
    expect(isValidHexColor("")).toBe(false);
  });
});

describe("normalizeHex", () => {
  it("expands 3-digit hex", () => {
    expect(normalizeHex("abc")).toBe("#aabbcc");
    expect(normalizeHex("#abc")).toBe("#aabbcc");
  });

  it("normalizes 6-digit hex", () => {
    expect(normalizeHex("FF0000")).toBe("#ff0000");
    expect(normalizeHex("#FF0000")).toBe("#ff0000");
  });

  it("normalizes 8-digit hex", () => {
    expect(normalizeHex("ff0000ff")).toBe("#ff0000ff");
  });

  it("returns original for invalid input", () => {
    expect(normalizeHex("red")).toBe("red");
  });
});

describe("parseGradient", () => {
  it("parses valid gradient string", () => {
    const result = parseGradient("35,0d1117,1a1b27");
    expect(result).toEqual({
      angle: 35,
      colors: ["#0d1117", "#1a1b27"],
    });
  });

  it("parses gradient with 3 colors", () => {
    const result = parseGradient("90,ff0000,00ff00,0000ff");
    expect(result).toEqual({
      angle: 90,
      colors: ["#ff0000", "#00ff00", "#0000ff"],
    });
  });

  it("returns null for non-gradient strings", () => {
    expect(parseGradient("ff0000")).toBeNull();
    expect(parseGradient("")).toBeNull();
  });

  it("returns null for less than 2 colors", () => {
    expect(parseGradient("35,ff0000")).toBeNull();
  });

  it("returns null for invalid angle", () => {
    expect(parseGradient("abc,ff0000,00ff00")).toBeNull();
  });

  it("returns null for invalid colors", () => {
    expect(parseGradient("35,red,blue")).toBeNull();
  });
});

describe("resolveColor", () => {
  it("prefers user color when valid", () => {
    expect(resolveColor("ff0000", "#00ff00", "#0000ff")).toBe("#ff0000");
  });

  it("falls back to theme color when user color is undefined", () => {
    expect(resolveColor(undefined, "#00ff00", "#0000ff")).toBe("#00ff00");
  });

  it("falls back to theme color when user color is invalid", () => {
    expect(resolveColor("invalid", "#00ff00", "#0000ff")).toBe("#00ff00");
  });

  it("falls back to default when theme color is empty", () => {
    expect(resolveColor(undefined, "", "#0000ff")).toBe("#0000ff");
  });
});
