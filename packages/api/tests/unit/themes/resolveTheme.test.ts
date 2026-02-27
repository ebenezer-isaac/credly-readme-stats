import { describe, it, expect } from "vitest";
import { getTheme, getThemeNames, getCardColors } from "../../../src/themes/resolveTheme.js";
import { themes } from "../../../src/themes/themes.js";

describe("getTheme", () => {
  it("returns default theme for undefined", () => {
    const theme = getTheme(undefined);
    expect(theme).toEqual(themes.default);
  });

  it("returns named theme", () => {
    const theme = getTheme("dark");
    expect(theme).toEqual(themes.dark);
  });

  it("returns default theme for unknown name", () => {
    const theme = getTheme("nonexistent");
    expect(theme).toEqual(themes.default);
  });
});

describe("getThemeNames", () => {
  it("returns all theme names", () => {
    const names = getThemeNames();
    expect(names).toContain("default");
    expect(names).toContain("dark");
    expect(names).toContain("radical");
    expect(names.length).toBeGreaterThanOrEqual(20);
  });
});

describe("getCardColors", () => {
  it("resolves default theme colors", () => {
    const colors = getCardColors({ username: "test" });
    expect(colors.titleColor).toBeDefined();
    expect(colors.textColor).toBeDefined();
    expect(colors.iconColor).toBeDefined();
    expect(colors.bgColor).toBeDefined();
    expect(colors.borderColor).toBeDefined();
    expect(colors.badgeLabelColor).toBeDefined();
  });

  it("applies named theme", () => {
    const darkColors = getCardColors({ username: "test", theme: "dark" });
    const defaultColors = getCardColors({ username: "test" });
    expect(darkColors.bgColor).not.toEqual(defaultColors.bgColor);
  });

  it("user overrides take precedence over theme", () => {
    const colors = getCardColors({
      username: "test",
      theme: "dark",
      title_color: "ff0000",
    });
    expect(colors.titleColor).toBe("#ff0000");
  });

  it("handles gradient bg_color", () => {
    const colors = getCardColors({
      username: "test",
      bg_color: "35,0d1117,1a1b27",
    });
    expect(Array.isArray(colors.bgColor)).toBe(true);
    expect(colors.bgColor).toEqual(["35", "#0d1117", "#1a1b27"]);
  });

  it("handles solid bg_color override", () => {
    const colors = getCardColors({
      username: "test",
      bg_color: "ff0000",
    });
    expect(colors.bgColor).toBe("#ff0000");
  });

  it("ignores invalid user color overrides", () => {
    const colors = getCardColors({
      username: "test",
      title_color: "invalid",
    });
    // Should fall back to default theme color
    expect(colors.titleColor).toBe(getCardColors({ username: "test" }).titleColor);
  });
});
