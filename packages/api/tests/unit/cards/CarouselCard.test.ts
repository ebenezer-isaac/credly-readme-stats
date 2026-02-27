import { describe, it, expect } from "vitest";
import { renderCarouselCard } from "../../../src/cards/CarouselCard.js";
import { createMockBadges, createMockBadge } from "../../fixtures/mockBadges.js";
import { assertValidSvg, assertAccessibleSvg } from "../../helpers/testUtils.js";
import type { CarouselCardOptions } from "../../../src/types/card.js";

function defaultOptions(overrides: Partial<CarouselCardOptions> = {}): CarouselCardOptions {
  return { username: "testuser", ...overrides };
}

describe("renderCarouselCard", () => {
  const badges = createMockBadges();

  describe("basic rendering", () => {
    it("produces valid SVG", () => {
      assertValidSvg(renderCarouselCard(badges, defaultOptions()));
    });

    it("includes accessibility attributes", () => {
      const svg = renderCarouselCard(badges, defaultOptions());
      assertAccessibleSvg(svg);
      expect(svg).toContain("Badge carousel");
    });

    it("includes username in title", () => {
      const svg = renderCarouselCard(badges, defaultOptions());
      expect(svg).toContain("testuser&#39;s Badge Carousel");
    });

    it("uses custom_title when provided", () => {
      const svg = renderCarouselCard(badges, defaultOptions({ custom_title: "My Carousel" }));
      expect(svg).toContain("My Carousel");
    });
  });

  describe("carousel animation", () => {
    it("includes @keyframes when badges exceed visible count", () => {
      const svg = renderCarouselCard(badges, defaultOptions({ visible_count: 2 }));
      expect(svg).toContain("@keyframes c-slide");
      expect(svg).toContain("animation:");
    });

    it("does not include @keyframes when badges fit in visible count", () => {
      const svg = renderCarouselCard(badges, defaultOptions({ visible_count: 6 }));
      expect(svg).not.toContain("@keyframes c-slide");
    });

    it("disables animations when requested", () => {
      const svg = renderCarouselCard(badges, defaultOptions({ disable_animations: true }));
      expect(svg).not.toContain("@keyframes c-slide");
      expect(svg).not.toContain("@keyframes fadeIn");
    });

    it("includes clip-path for animated carousel", () => {
      const svg = renderCarouselCard(badges, defaultOptions({ visible_count: 3 }));
      expect(svg).toContain("clip-path");
      expect(svg).toContain("clipPath");
    });

    it("includes indicator dots when animated", () => {
      const svg = renderCarouselCard(badges, defaultOptions({ visible_count: 3 }));
      expect(svg).toContain("c-dot-0");
      expect(svg).toContain("c-dot-1");
    });

    it("does not include indicator dots when static", () => {
      const svg = renderCarouselCard(badges, defaultOptions({ visible_count: 6 }));
      expect(svg).not.toContain("c-dot-0");
    });

    it("shows footer text with badge count", () => {
      const svg = renderCarouselCard(badges, defaultOptions({ visible_count: 3 }));
      expect(svg).toContain("3 of 5 badges");
    });

    it("uses correct animation duration based on item count and interval", () => {
      const svg = renderCarouselCard(badges, defaultOptions({ visible_count: 2, interval: 4 }));
      // 5 badges * 4s = 20s duration
      expect(svg).toContain("20s");
    });
  });

  describe("badge display", () => {
    it("renders badge images", () => {
      const svg = renderCarouselCard(badges, defaultOptions());
      expect(svg).toContain("<image");
    });

    it("shows badge names by default", () => {
      const svg = renderCarouselCard(badges, defaultOptions());
      expect(svg).toContain("c-badge-name");
    });

    it("hides badge names when show_name is false", () => {
      const svg = renderCarouselCard(badges, defaultOptions({ show_name: false }));
      expect(svg).not.toContain("c-badge-name");
    });

    it("shows issuer when show_issuer is true", () => {
      const svg = renderCarouselCard(badges, defaultOptions({ show_issuer: true }));
      expect(svg).toContain("c-badge-issuer");
    });

    it("hides issuer by default", () => {
      const svg = renderCarouselCard(badges, defaultOptions());
      expect(svg).not.toContain("c-badge-issuer");
    });
  });

  describe("options", () => {
    it("respects badge_size option", () => {
      const svg = renderCarouselCard(badges, defaultOptions({ badge_size: 96 }));
      expect(svg).toContain('width="96"');
      expect(svg).toContain('height="96"');
    });

    it("clamps badge_size to minimum 32", () => {
      const svg = renderCarouselCard(badges, defaultOptions({ badge_size: 10 }));
      expect(svg).toContain('width="32"');
    });

    it("clamps badge_size to maximum 128", () => {
      const svg = renderCarouselCard(badges, defaultOptions({ badge_size: 200 }));
      expect(svg).toContain('width="128"');
    });

    it("respects max_items option", () => {
      const manyBadges = Array.from({ length: 20 }, (_, i) =>
        createMockBadge({ id: `badge-${i}`, name: `Badge ${i}` }),
      );
      const svg = renderCarouselCard(manyBadges, defaultOptions({ max_items: 8, visible_count: 3 }));
      // 8 badges + 3 duplicated = 11 <image> elements
      const imageCount = (svg.match(/<image /g) ?? []).length;
      expect(imageCount).toBe(11);
    });

    it("filters by issuer", () => {
      const svg = renderCarouselCard(badges, defaultOptions({ filter_issuer: "Amazon" }));
      // Only AWS badges (2 out of 5)
      expect(svg).toContain("2 of 2 badges");
    });

    it("sorts by name", () => {
      const svg = renderCarouselCard(badges, defaultOptions({ sort: "name" }));
      assertValidSvg(svg);
    });
  });

  describe("theming", () => {
    it("applies dark theme", () => {
      const svg = renderCarouselCard(badges, defaultOptions({ theme: "dark" }));
      assertValidSvg(svg);
      expect(svg).toContain("#fff");
    });

    it("applies custom colors", () => {
      const svg = renderCarouselCard(badges, defaultOptions({ title_color: "ff0000" }));
      expect(svg).toContain("#ff0000");
    });
  });

  describe("edge cases", () => {
    it("handles empty badges array", () => {
      const svg = renderCarouselCard([], defaultOptions());
      assertValidSvg(svg);
    });

    it("handles single badge", () => {
      const svg = renderCarouselCard([badges[0]!], defaultOptions());
      assertValidSvg(svg);
      expect(svg).not.toContain("@keyframes c-slide");
    });

    it("escapes HTML in badge names", () => {
      const xssBadge = createMockBadge({ name: '<img onerror="alert(1)">' });
      const svg = renderCarouselCard([xssBadge], defaultOptions());
      expect(svg).not.toContain("<img");
    });

    it("handles hide_border option", () => {
      const svg = renderCarouselCard(badges, defaultOptions({ hide_border: true }));
      expect(svg).toContain('stroke-opacity="0"');
    });

    it("handles hide_title option", () => {
      const svg = renderCarouselCard(badges, defaultOptions({ hide_title: true }));
      expect(svg).not.toContain('data-testid="card-title"');
    });
  });
});
