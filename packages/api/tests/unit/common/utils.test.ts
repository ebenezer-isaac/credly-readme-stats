import { describe, it, expect } from "vitest";
import {
  encodeHTML,
  clamp,
  parseArray,
  parseBoolean,
  parseOptionalBoolean,
  parseOptionalInt,
  parseOptionalFloat,
  parseEnum,
  formatDate,
  normalizeUsername,
  isValidUsername,
} from "../../../src/common/utils.js";

describe("encodeHTML", () => {
  it("escapes all HTML entities", () => {
    expect(encodeHTML("&")).toBe("&amp;");
    expect(encodeHTML("<")).toBe("&lt;");
    expect(encodeHTML(">")).toBe("&gt;");
    expect(encodeHTML('"')).toBe("&quot;");
    expect(encodeHTML("'")).toBe("&#39;");
    expect(encodeHTML("`")).toBe("&#96;");
    expect(encodeHTML("/")).toBe("&#x2F;");
  });

  it("escapes mixed content", () => {
    expect(encodeHTML('<script>alert("xss")</script>')).toBe(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;",
    );
  });

  it("returns plain text unchanged", () => {
    expect(encodeHTML("Hello World")).toBe("Hello World");
  });

  it("handles empty string", () => {
    expect(encodeHTML("")).toBe("");
  });
});

describe("clamp", () => {
  it("clamps below minimum", () => {
    expect(clamp(1, 5, 10)).toBe(5);
  });

  it("clamps above maximum", () => {
    expect(clamp(15, 5, 10)).toBe(10);
  });

  it("returns value within range", () => {
    expect(clamp(7, 5, 10)).toBe(7);
  });

  it("handles equal min and max", () => {
    expect(clamp(5, 5, 5)).toBe(5);
  });
});

describe("parseArray", () => {
  it("parses comma-separated string", () => {
    expect(parseArray("a, b, c")).toEqual(["a", "b", "c"]);
  });

  it("trims whitespace", () => {
    expect(parseArray("  a ,  b  ,  c  ")).toEqual(["a", "b", "c"]);
  });

  it("returns empty array for undefined", () => {
    expect(parseArray(undefined)).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    expect(parseArray("")).toEqual([]);
  });

  it("filters empty segments", () => {
    expect(parseArray("a,,b,")).toEqual(["a", "b"]);
  });
});

describe("parseBoolean", () => {
  it('returns true for "true"', () => {
    expect(parseBoolean("true")).toBe(true);
  });

  it('returns true for "1"', () => {
    expect(parseBoolean("1")).toBe(true);
  });

  it("returns false for undefined", () => {
    expect(parseBoolean(undefined)).toBe(false);
  });

  it("returns false for other strings", () => {
    expect(parseBoolean("false")).toBe(false);
    expect(parseBoolean("yes")).toBe(false);
    expect(parseBoolean("0")).toBe(false);
  });
});

describe("parseOptionalBoolean", () => {
  it("returns undefined for undefined input", () => {
    expect(parseOptionalBoolean(undefined)).toBeUndefined();
  });

  it('returns true for "true"', () => {
    expect(parseOptionalBoolean("true")).toBe(true);
  });

  it('returns true for "1"', () => {
    expect(parseOptionalBoolean("1")).toBe(true);
  });

  it("returns false for other strings", () => {
    expect(parseOptionalBoolean("false")).toBe(false);
    expect(parseOptionalBoolean("0")).toBe(false);
  });
});

describe("parseOptionalInt", () => {
  it("parses valid integer", () => {
    expect(parseOptionalInt("42")).toBe(42);
  });

  it("returns undefined for undefined", () => {
    expect(parseOptionalInt(undefined)).toBeUndefined();
  });

  it("returns undefined for empty string", () => {
    expect(parseOptionalInt("")).toBeUndefined();
  });

  it("returns undefined for non-numeric string", () => {
    expect(parseOptionalInt("abc")).toBeUndefined();
  });

  it("truncates float to integer", () => {
    expect(parseOptionalInt("4.5")).toBe(4);
  });

  it("parses negative integers", () => {
    expect(parseOptionalInt("-10")).toBe(-10);
  });
});

describe("parseOptionalFloat", () => {
  it("parses valid float", () => {
    expect(parseOptionalFloat("4.5")).toBe(4.5);
  });

  it("parses integer as float", () => {
    expect(parseOptionalFloat("42")).toBe(42);
  });

  it("returns undefined for undefined", () => {
    expect(parseOptionalFloat(undefined)).toBeUndefined();
  });

  it("returns undefined for empty string", () => {
    expect(parseOptionalFloat("")).toBeUndefined();
  });

  it("returns undefined for non-numeric string", () => {
    expect(parseOptionalFloat("abc")).toBeUndefined();
  });
});

describe("parseEnum", () => {
  const allowed = ["recent", "oldest", "name"] as const;

  it("returns value when it matches allowed values", () => {
    expect(parseEnum("recent", allowed)).toBe("recent");
    expect(parseEnum("oldest", allowed)).toBe("oldest");
  });

  it("returns undefined for invalid value", () => {
    expect(parseEnum("invalid", allowed)).toBeUndefined();
  });

  it("returns undefined for undefined input", () => {
    expect(parseEnum(undefined, allowed)).toBeUndefined();
  });
});

describe("formatDate", () => {
  it("formats ISO date string", () => {
    expect(formatDate("2024-01-15")).toBe("Jan 15, 2024");
  });

  it("handles different months", () => {
    expect(formatDate("2023-06-20")).toBe("Jun 20, 2023");
    expect(formatDate("2024-12-31")).toBe("Dec 31, 2024");
  });

  it("returns original string for invalid date", () => {
    expect(formatDate("not-a-date")).toBe("not-a-date");
  });
});

describe("normalizeUsername", () => {
  it("lowercases and trims", () => {
    expect(normalizeUsername("  JohnDoe  ")).toBe("johndoe");
  });

  it("removes trailing slashes", () => {
    expect(normalizeUsername("johndoe//")).toBe("johndoe");
  });
});

describe("isValidUsername", () => {
  it("accepts valid usernames", () => {
    expect(isValidUsername("john-doe")).toBe(true);
    expect(isValidUsername("user123")).toBe(true);
    expect(isValidUsername("a")).toBe(true);
    expect(isValidUsername("ab")).toBe(true);
  });

  it("accepts Credly usernames with dot-hash suffix", () => {
    expect(isValidUsername("ebenezer-isaac.05496d7f")).toBe(true);
    expect(isValidUsername("john-doe.abc123")).toBe(true);
  });

  it("rejects invalid usernames", () => {
    expect(isValidUsername("")).toBe(false);
    expect(isValidUsername("-invalid")).toBe(false);
    expect(isValidUsername("invalid-")).toBe(false);
    expect(isValidUsername("user name")).toBe(false);
    expect(isValidUsername("user@name")).toBe(false);
  });

  it("rejects usernames exceeding 60 chars", () => {
    expect(isValidUsername("a".repeat(61))).toBe(false);
  });
});
