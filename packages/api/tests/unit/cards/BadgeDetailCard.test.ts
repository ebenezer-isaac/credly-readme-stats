import { describe, it, expect } from "vitest";
import { renderBadgeDetailCard } from "../../../src/cards/BadgeDetailCard.js";
import { createMockBadge } from "../../fixtures/mockBadges.js";
import { assertValidSvg, assertAccessibleSvg } from "../../helpers/testUtils.js";
import type { BadgeDetailCardOptions } from "../../../src/types/card.js";

function defaultOptions(overrides: Partial<BadgeDetailCardOptions> = {}): BadgeDetailCardOptions {
  return { username: "testuser", badge_id: "badge-001", ...overrides };
}

describe("renderBadgeDetailCard", () => {
  const badge = createMockBadge({
    imageBase64: "data:image/png;base64,fakeb64data",
  });

  describe("basic rendering", () => {
    it("produces valid SVG", () => {
      assertValidSvg(renderBadgeDetailCard(badge, defaultOptions()));
    });

    it("includes accessibility attributes", () => {
      const svg = renderBadgeDetailCard(badge, defaultOptions());
      assertAccessibleSvg(svg, "AWS Solutions Architect");
    });

    it("uses badge name as default title", () => {
      const svg = renderBadgeDetailCard(badge, defaultOptions());
      expect(svg).toContain("AWS Solutions Architect");
    });

    it("uses custom_title when provided", () => {
      const svg = renderBadgeDetailCard(badge, defaultOptions({ custom_title: "My Badge" }));
      expect(svg).toContain("My Badge");
    });
  });

  describe("badge details", () => {
    it("shows badge image", () => {
      const svg = renderBadgeDetailCard(badge, defaultOptions());
      expect(svg).toContain("<image");
      // Image href is HTML-encoded (/ -> &#x2F;)
      expect(svg).toContain("base64");
    });

    it("falls back to image URL when no base64", () => {
      const rawBadge = createMockBadge();
      const svg = renderBadgeDetailCard(rawBadge, defaultOptions());
      expect(svg).toContain("images.credly.com");
    });

    it("shows issuer by default", () => {
      const svg = renderBadgeDetailCard(badge, defaultOptions());
      expect(svg).toContain("Amazon Web Services");
      expect(svg).toContain('class="badge-issuer">');
    });

    it("hides issuer when show_issuer is false", () => {
      const svg = renderBadgeDetailCard(badge, defaultOptions({ show_issuer: false }));
      expect(svg).not.toContain('class="badge-issuer">');
    });

    it("shows issued date", () => {
      const svg = renderBadgeDetailCard(badge, defaultOptions());
      expect(svg).toContain("Jan 15, 2024");
      expect(svg).toContain("Issued:");
    });

    it("shows expiry date when present", () => {
      const expiringBadge = createMockBadge({ expiresDate: "2027-01-15" });
      const svg = renderBadgeDetailCard(expiringBadge, defaultOptions());
      expect(svg).toContain("Expires:");
      expect(svg).toContain("Jan 15, 2027");
    });

    it("does not show expiry when null", () => {
      const svg = renderBadgeDetailCard(badge, defaultOptions());
      expect(svg).not.toContain("Expires:");
    });
  });

  describe("skills", () => {
    it("shows skills by default", () => {
      const svg = renderBadgeDetailCard(badge, defaultOptions());
      expect(svg).toContain('class="badge-skills">');
    });

    it("hides skills when show_skills is false", () => {
      const svg = renderBadgeDetailCard(badge, defaultOptions({ show_skills: false }));
      expect(svg).not.toContain('class="badge-skills">');
    });

    it("handles badge with no skills", () => {
      const noSkills = createMockBadge({ skills: [] });
      const svg = renderBadgeDetailCard(noSkills, defaultOptions());
      assertValidSvg(svg);
      expect(svg).not.toContain('class="badge-skills">');
    });
  });

  describe("description", () => {
    it("shows description by default", () => {
      const svg = renderBadgeDetailCard(badge, defaultOptions());
      expect(svg).toContain('class="badge-desc">');
    });

    it("hides description when show_description is false", () => {
      const svg = renderBadgeDetailCard(badge, defaultOptions({ show_description: false }));
      expect(svg).not.toContain('class="badge-desc">');
    });

    it("handles empty description", () => {
      const noDesc = createMockBadge({ description: "" });
      const svg = renderBadgeDetailCard(noDesc, defaultOptions());
      assertValidSvg(svg);
    });
  });

  describe("dimensions", () => {
    it("uses default width of 400", () => {
      const svg = renderBadgeDetailCard(badge, defaultOptions());
      expect(svg).toContain('width="400"');
    });

    it("respects card_width option", () => {
      const svg = renderBadgeDetailCard(badge, defaultOptions({ card_width: 500 }));
      expect(svg).toContain('width="500"');
    });

    it("clamps card_width to 300-600 range", () => {
      const svg1 = renderBadgeDetailCard(badge, defaultOptions({ card_width: 100 }));
      expect(svg1).toContain('width="300"');

      const svg2 = renderBadgeDetailCard(badge, defaultOptions({ card_width: 900 }));
      expect(svg2).toContain('width="600"');
    });
  });

  describe("edge cases", () => {
    it("escapes HTML in badge name", () => {
      const xssBadge = createMockBadge({ name: '<script>alert(1)</script>' });
      const svg = renderBadgeDetailCard(xssBadge, defaultOptions());
      expect(svg).not.toContain("<script>");
    });

    it("escapes HTML in issuer name", () => {
      const xssBadge = createMockBadge({ issuerName: '<img onerror="hack">' });
      const svg = renderBadgeDetailCard(xssBadge, defaultOptions());
      expect(svg).not.toContain("<img");
    });

    it("handles very long badge name", () => {
      const longName = createMockBadge({ name: "A".repeat(200) });
      const svg = renderBadgeDetailCard(longName, defaultOptions());
      assertValidSvg(svg);
    });

    it("handles very long description", () => {
      const longDesc = createMockBadge({ description: "Word ".repeat(100) });
      const svg = renderBadgeDetailCard(longDesc, defaultOptions());
      assertValidSvg(svg);
    });

    it("handles theming", () => {
      const svg = renderBadgeDetailCard(badge, defaultOptions({ theme: "dark" }));
      assertValidSvg(svg);
    });

    it("handles hide_border option", () => {
      const svg = renderBadgeDetailCard(badge, defaultOptions({ hide_border: true }));
      expect(svg).toContain('stroke-opacity="0"');
    });

    it("handles hide_title option", () => {
      const svg = renderBadgeDetailCard(badge, defaultOptions({ hide_title: true }));
      expect(svg).not.toContain('data-testid="card-title"');
    });

    it("handles disable_animations option", () => {
      const svg = renderBadgeDetailCard(badge, defaultOptions({ disable_animations: true }));
      expect(svg).not.toContain("@keyframes fadeIn");
    });
  });
});
