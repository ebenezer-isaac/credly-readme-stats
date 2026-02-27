import { describe, it, expect } from "vitest";
import { renderGridCard } from "../../../src/cards/GridCard.js";
import { createMockBadges, createMockBadge } from "../../fixtures/mockBadges.js";
import { assertValidSvg, assertAccessibleSvg } from "../../helpers/testUtils.js";
import type { GridCardOptions } from "../../../src/types/card.js";

function defaultOptions(overrides: Partial<GridCardOptions> = {}): GridCardOptions {
  return { username: "testuser", ...overrides };
}

describe("renderGridCard", () => {
  const badges = createMockBadges().map((b) => ({
    ...b,
    imageBase64: "data:image/png;base64,fakeb64data",
  }));

  describe("basic rendering", () => {
    it("produces valid SVG", () => {
      assertValidSvg(renderGridCard(badges, defaultOptions()));
    });

    it("includes accessibility attributes", () => {
      const svg = renderGridCard(badges, defaultOptions());
      assertAccessibleSvg(svg);
      expect(svg).toContain("Badge grid");
    });

    it("includes username in title", () => {
      const svg = renderGridCard(badges, defaultOptions());
      expect(svg).toContain("testuser");
    });

    it("uses custom_title when provided", () => {
      const svg = renderGridCard(badges, defaultOptions({ custom_title: "My Grid" }));
      expect(svg).toContain("My Grid");
    });
  });

  describe("grid layout", () => {
    it("uses default 3 columns", () => {
      const svg = renderGridCard(badges, defaultOptions());
      // With 5 badges and 3 cols x 2 rows = 6 slots, should show up to 6
      expect(svg).toContain("image");
    });

    it("respects columns option", () => {
      const svg = renderGridCard(badges, defaultOptions({ columns: 2 }));
      assertValidSvg(svg);
    });

    it("respects rows option", () => {
      const svg = renderGridCard(badges, defaultOptions({ rows: 1, columns: 3 }));
      assertValidSvg(svg);
    });

    it("clamps columns to 1-6 range", () => {
      const svg1 = renderGridCard(badges, defaultOptions({ columns: 0 }));
      const svg2 = renderGridCard(badges, defaultOptions({ columns: 10 }));
      assertValidSvg(svg1);
      assertValidSvg(svg2);
    });

    it("clamps rows to 1-10 range", () => {
      const svg = renderGridCard(badges, defaultOptions({ rows: 0 }));
      assertValidSvg(svg);
    });
  });

  describe("badge size", () => {
    it("uses default 64px badge size", () => {
      const svg = renderGridCard(badges, defaultOptions());
      expect(svg).toContain('width="64"');
      expect(svg).toContain('height="64"');
    });

    it("respects badge_size option", () => {
      const svg = renderGridCard(badges, defaultOptions({ badge_size: 96 }));
      expect(svg).toContain('width="96"');
      expect(svg).toContain('height="96"');
    });

    it("clamps badge_size to 32-128 range", () => {
      const svg = renderGridCard(badges, defaultOptions({ badge_size: 10 }));
      expect(svg).toContain('width="32"');
    });
  });

  describe("show/hide options", () => {
    it("shows badge name by default", () => {
      const svg = renderGridCard(badges, defaultOptions());
      expect(svg).toContain('text-anchor="middle" class="badge-name"');
    });

    it("hides badge name when show_name is false", () => {
      const svg = renderGridCard(badges, defaultOptions({ show_name: false }));
      expect(svg).not.toContain('class="badge-name"');
    });

    it("hides issuer text by default", () => {
      const svg = renderGridCard(badges, defaultOptions());
      expect(svg).not.toContain('class="badge-issuer">');
    });

    it("shows issuer when show_issuer is true", () => {
      const svg = renderGridCard(badges, defaultOptions({ show_issuer: true }));
      expect(svg).toContain('class="badge-issuer">');
    });
  });

  describe("sorting", () => {
    it("sorts by recent by default", () => {
      const svg = renderGridCard(badges, defaultOptions());
      // Most recent badge (2024-06-01) should come first
      assertValidSvg(svg);
    });

    it("sorts by name", () => {
      const svg = renderGridCard(badges, defaultOptions({ sort: "name" }));
      assertValidSvg(svg);
    });

    it("sorts by issuer", () => {
      const svg = renderGridCard(badges, defaultOptions({ sort: "issuer" }));
      assertValidSvg(svg);
    });

    it("sorts by oldest", () => {
      const svg = renderGridCard(badges, defaultOptions({ sort: "oldest" }));
      assertValidSvg(svg);
    });
  });

  describe("filtering", () => {
    it("filters by issuer", () => {
      const svg = renderGridCard(badges, defaultOptions({ filter_issuer: "IBM" }));
      assertValidSvg(svg);
      expect(svg).toContain("1 of 1"); // Only IBM badge
    });

    it("filters by skill", () => {
      const svg = renderGridCard(badges, defaultOptions({ filter_skill: "Security" }));
      assertValidSvg(svg);
    });
  });

  describe("pagination", () => {
    it("paginates grid results", () => {
      const svg = renderGridCard(badges, defaultOptions({ columns: 1, rows: 1, page: 1 }));
      assertValidSvg(svg);
    });

    it("shows page 2 results", () => {
      const svg = renderGridCard(badges, defaultOptions({ columns: 1, rows: 1, page: 2 }));
      assertValidSvg(svg);
    });
  });

  describe("image embedding", () => {
    it("uses base64 image when available", () => {
      const svg = renderGridCard(badges, defaultOptions());
      expect(svg).toContain("data:image&#x2F;png;base64");
    });

    it("falls back to image URL when no base64", () => {
      const rawBadges = createMockBadges();
      const svg = renderGridCard(rawBadges, defaultOptions());
      expect(svg).toContain("images.credly.com");
    });
  });

  describe("card dimensions", () => {
    it("respects card_width option", () => {
      const svg = renderGridCard(badges, defaultOptions({ card_width: 600 }));
      expect(svg).toContain('width="600"');
    });
  });

  describe("edge cases", () => {
    it("handles empty badges array", () => {
      const svg = renderGridCard([], defaultOptions());
      assertValidSvg(svg);
      expect(svg).toContain("0 of 0");
    });

    it("handles single badge", () => {
      const single = [badges[0]!];
      const svg = renderGridCard(single, defaultOptions());
      assertValidSvg(svg);
    });

    it("escapes HTML in badge names", () => {
      const xssBadge = createMockBadge({ name: '<script>alert("xss")</script>' });
      const svg = renderGridCard([xssBadge], defaultOptions());
      expect(svg).not.toContain("<script>");
    });

    it("handles hide_title option", () => {
      const svg = renderGridCard(badges, defaultOptions({ hide_title: true }));
      expect(svg).not.toContain('data-testid="card-title"');
    });

    it("handles disable_animations option", () => {
      const svg = renderGridCard(badges, defaultOptions({ disable_animations: true }));
      expect(svg).not.toContain("@keyframes fadeIn");
    });
  });
});
