import { describe, it, expect } from "vitest";
import { measureText, truncateText, wrapTextMultiline } from "../../../src/common/textMeasure.js";

describe("measureText", () => {
  it("measures known characters", () => {
    const width = measureText("A", 14);
    expect(width).toBeGreaterThan(0);
    expect(width).toBeCloseTo(0.6 * 14, 1);
  });

  it("measures text proportionally to font size", () => {
    const w14 = measureText("Hello", 14);
    const w28 = measureText("Hello", 28);
    expect(w28).toBeCloseTo(w14 * 2, 1);
  });

  it("applies bold multiplier", () => {
    const normal = measureText("Test", 14);
    const bold = measureText("Test", 14, true);
    expect(bold).toBeGreaterThan(normal);
    expect(bold).toBeCloseTo(normal * 1.08, 1);
  });

  it("handles empty string", () => {
    expect(measureText("", 14)).toBe(0);
  });

  it("uses default width for unknown characters", () => {
    const width = measureText("\u4e16", 14); // CJK character
    expect(width).toBeCloseTo(0.55 * 14, 1);
  });
});

describe("truncateText", () => {
  it("returns original text if it fits", () => {
    expect(truncateText("Hi", 200, 14)).toBe("Hi");
  });

  it("truncates with ellipsis when too long", () => {
    const result = truncateText("This is a very long text that should be truncated", 100, 14);
    expect(result).toMatch(/\.\.\.$/);
    expect(result.length).toBeLessThan("This is a very long text that should be truncated".length);
  });

  it("handles empty string", () => {
    expect(truncateText("", 100, 14)).toBe("");
  });
});

describe("wrapTextMultiline", () => {
  it("returns single line if text fits", () => {
    const result = wrapTextMultiline("Short text", 500, 14);
    expect(result).toEqual(["Short text"]);
  });

  it("wraps at word boundaries", () => {
    const result = wrapTextMultiline("This is a longer text that needs wrapping", 100, 14, 5);
    expect(result.length).toBeGreaterThan(1);
  });

  it("respects maxLines", () => {
    const result = wrapTextMultiline(
      "Word ".repeat(50),
      100,
      14,
      2,
    );
    expect(result.length).toBeLessThanOrEqual(2);
  });

  it("handles empty string", () => {
    const result = wrapTextMultiline("", 100, 14);
    expect(result).toEqual([]);
  });
});
