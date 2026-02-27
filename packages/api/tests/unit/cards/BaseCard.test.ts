import { describe, it, expect } from "vitest";
import { BaseCard, PADDING_X } from "../../../src/cards/BaseCard.js";
import type { CardColors } from "../../../src/types/card.js";
import { assertValidSvg, assertAccessibleSvg } from "../../helpers/testUtils.js";

const defaultColors: CardColors = {
  titleColor: "#2f80ed",
  textColor: "#434d58",
  iconColor: "#4c71f2",
  bgColor: "#fffefe",
  borderColor: "#e4e2e2",
  badgeLabelColor: "#858585",
};

function createCard(overrides = {}) {
  return new BaseCard({
    width: 400,
    height: 200,
    colors: defaultColors,
    defaultTitle: "Test Card",
    a11yTitle: "Test Card",
    a11yDesc: "Test description",
    ...overrides,
  });
}

describe("BaseCard", () => {
  describe("render", () => {
    it("produces valid SVG", () => {
      const svg = createCard().render("<text>body</text>");
      assertValidSvg(svg);
    });

    it("includes width and height", () => {
      const svg = createCard({ width: 495, height: 300 }).render("");
      expect(svg).toContain('width="495"');
      expect(svg).toContain('height="300"');
    });

    it("includes body content", () => {
      const svg = createCard().render("<text>Hello World</text>");
      expect(svg).toContain("<text>Hello World</text>");
    });

    it("wraps body in main-card-body group", () => {
      const svg = createCard().render("<text>body</text>");
      expect(svg).toContain('data-testid="main-card-body"');
    });

    it("includes accessibility attributes", () => {
      const svg = createCard().render("");
      assertAccessibleSvg(svg, "Test Card");
      expect(svg).toContain("Test description");
    });
  });

  describe("title", () => {
    it("renders title by default", () => {
      const svg = createCard().render("");
      expect(svg).toContain("Test Card");
      expect(svg).toContain('data-testid="card-title"');
    });

    it("hides title when hideTitle is true", () => {
      const svg = createCard({ hideTitle: true }).render("");
      expect(svg).not.toContain('data-testid="card-title"');
    });

    it("uses customTitle over defaultTitle", () => {
      const svg = createCard({ customTitle: "Custom Title", defaultTitle: "Default" }).render("");
      expect(svg).toContain("Custom Title");
    });

    it("renders title prefix icon when provided", () => {
      const svg = createCard({
        titlePrefixIcon: '<path d="M0 0h16v16H0z"/>',
      }).render("");
      expect(svg).toContain("icon");
      expect(svg).toContain('<path d="M0 0h16v16H0z"/>');
    });
  });

  describe("border", () => {
    it("shows border by default", () => {
      const svg = createCard().render("");
      expect(svg).toContain('stroke-opacity="1"');
    });

    it("hides border when hideBorder is true", () => {
      const svg = createCard({ hideBorder: true }).render("");
      expect(svg).toContain('stroke-opacity="0"');
    });

    it("applies custom border radius", () => {
      const svg = createCard({ borderRadius: 10 }).render("");
      expect(svg).toContain('rx="10"');
    });

    it("uses default border radius of 4.5", () => {
      const svg = createCard().render("");
      expect(svg).toContain('rx="4.5"');
    });
  });

  describe("background", () => {
    it("uses solid color", () => {
      const svg = createCard().render("");
      expect(svg).toContain('fill="#fffefe"');
    });

    it("uses gradient when bgColor is array", () => {
      const gradientColors: CardColors = {
        ...defaultColors,
        bgColor: ["35", "#0d1117", "#1a1b27"],
      };
      const svg = createCard({ colors: gradientColors }).render("");
      expect(svg).toContain("linearGradient");
      expect(svg).toContain('fill="url(#gradient)"');
      expect(svg).toContain('rotate(35)');
    });
  });

  describe("animations", () => {
    it("includes animations by default", () => {
      const svg = createCard().render("");
      expect(svg).toContain("@keyframes fadeIn");
      expect(svg).toContain("@keyframes scaleIn");
    });

    it("disables animations when requested", () => {
      const svg = createCard({ disableAnimations: true }).render("");
      expect(svg).not.toContain("@keyframes fadeIn");
    });
  });

  describe("withCSS", () => {
    it("returns new instance with CSS injected", () => {
      const card = createCard();
      const cardWithCSS = card.withCSS(".custom { fill: red; }");
      const svg = cardWithCSS.render("");
      expect(svg).toContain(".custom { fill: red; }");
    });

    it("does not modify original instance", () => {
      const card = createCard();
      const original = card.render("");
      card.withCSS(".custom { fill: red; }");
      expect(card.render("")).toBe(original);
    });

    it("preserves all card configuration", () => {
      const card = createCard({
        width: 500,
        height: 300,
        borderRadius: 10,
        hideTitle: true,
        hideBorder: true,
        disableAnimations: true,
      });
      const svg = card.withCSS(".test {}").render("<text>body</text>");
      expect(svg).toContain('width="500"');
      expect(svg).toContain('height="300"');
      expect(svg).toContain('rx="10"');
      expect(svg).not.toContain('data-testid="card-title"');
      expect(svg).toContain('stroke-opacity="0"');
    });
  });

  describe("XSS prevention", () => {
    it("escapes HTML in title", () => {
      const svg = createCard({ customTitle: '<script>alert("xss")</script>' }).render("");
      expect(svg).not.toContain("<script>");
      expect(svg).toContain("&lt;script&gt;");
    });

    it("escapes HTML in a11y attributes", () => {
      const svg = createCard({ a11yTitle: "<img onerror=alert(1)>" }).render("");
      expect(svg).not.toContain("<img onerror");
    });
  });

  describe("PADDING_X constant", () => {
    it("exports PADDING_X as 25", () => {
      expect(PADDING_X).toBe(25);
    });
  });
});
