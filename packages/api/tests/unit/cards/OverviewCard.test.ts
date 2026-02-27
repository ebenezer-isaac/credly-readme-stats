import { describe, it, expect } from "vitest";
import { renderOverviewCard } from "../../../src/cards/OverviewCard.js";
import { createMockBadges, createMockStats } from "../../fixtures/mockBadges.js";
import { assertValidSvg, assertAccessibleSvg } from "../../helpers/testUtils.js";
import type { OverviewCardOptions } from "../../../src/types/card.js";

function defaultOptions(overrides: Partial<OverviewCardOptions> = {}): OverviewCardOptions {
  return { username: "testuser", ...overrides };
}

describe("renderOverviewCard", () => {
  const stats = createMockStats();
  const badges = createMockBadges();

  describe("basic rendering", () => {
    it("produces valid SVG", () => {
      assertValidSvg(renderOverviewCard(stats, badges, defaultOptions()));
    });

    it("includes accessibility attributes", () => {
      const svg = renderOverviewCard(stats, badges, defaultOptions());
      assertAccessibleSvg(svg);
      expect(svg).toContain("Credly overview");
    });

    it("includes username in title", () => {
      const svg = renderOverviewCard(stats, badges, defaultOptions());
      expect(svg).toContain("testuser&#39;s Credly Overview");
    });

    it("uses custom_title when provided", () => {
      const svg = renderOverviewCard(stats, badges, defaultOptions({ custom_title: "My Overview" }));
      expect(svg).toContain("My Overview");
    });
  });

  describe("stats section", () => {
    it("contains stat labels", () => {
      const svg = renderOverviewCard(stats, badges, defaultOptions());
      expect(svg).toContain("Total Badges");
      expect(svg).toContain("Unique Issuers");
      expect(svg).toContain("Unique Skills");
      expect(svg).toContain("Active Badges");
      expect(svg).toContain("Expiring Soon");
    });

    it("hides stats when specified", () => {
      const svg = renderOverviewCard(stats, badges, defaultOptions({ hide: "total,issuers" }));
      expect(svg).not.toContain("Total Badges");
      expect(svg).not.toContain("Unique Issuers");
      expect(svg).toContain("Unique Skills");
    });

    it("shows icons by default", () => {
      const svg = renderOverviewCard(stats, badges, defaultOptions());
      expect(svg).toContain("viewBox");
      expect(svg).toContain("<path");
    });

    it("hides icons when show_icons is false", () => {
      const svg = renderOverviewCard(stats, badges, defaultOptions({ show_icons: false }));
      expect(svg).toContain("Total Badges");
    });

    it("shows top issuers footer", () => {
      const svg = renderOverviewCard(stats, badges, defaultOptions());
      expect(svg).toContain("Top Issuers");
    });

    it("shows top skills footer", () => {
      const svg = renderOverviewCard(stats, badges, defaultOptions());
      expect(svg).toContain("Top Skills");
    });
  });

  describe("carousel section", () => {
    it("contains badge images", () => {
      const svg = renderOverviewCard(stats, badges, defaultOptions());
      expect(svg).toContain("<image");
    });

    it("contains clip-path for carousel", () => {
      const svg = renderOverviewCard(stats, badges, defaultOptions());
      expect(svg).toContain("clip-path");
    });

    it("uses 'oc' animation prefix", () => {
      const svg = renderOverviewCard(stats, badges, defaultOptions());
      expect(svg).toContain("oc-slide");
      expect(svg).toContain("oc-strip");
      expect(svg).toContain("oc-dot-0");
    });

    it("shows carousel footer text", () => {
      const svg = renderOverviewCard(stats, badges, defaultOptions());
      expect(svg).toContain("of 5 badges");
    });

    it("hides carousel when hide includes 'carousel'", () => {
      const svg = renderOverviewCard(stats, badges, defaultOptions({ hide: "carousel" }));
      expect(svg).not.toContain("<image");
      expect(svg).not.toContain("clip-path");
      // Stats should still be present
      expect(svg).toContain("Total Badges");
    });
  });

  describe("separator", () => {
    it("has separator line between stats and carousel", () => {
      const svg = renderOverviewCard(stats, badges, defaultOptions());
      expect(svg).toContain("stroke-opacity=\"0.4\"");
    });
  });

  describe("dimensions", () => {
    it("uses default width of 550", () => {
      const svg = renderOverviewCard(stats, badges, defaultOptions());
      expect(svg).toContain('width="550"');
    });

    it("respects card_width option", () => {
      const svg = renderOverviewCard(stats, badges, defaultOptions({ card_width: 700 }));
      expect(svg).toContain('width="700"');
    });

    it("clamps card_width to minimum 350", () => {
      const svg = renderOverviewCard(stats, badges, defaultOptions({ card_width: 100 }));
      expect(svg).toContain('width="350"');
    });

    it("clamps card_width to maximum 800", () => {
      const svg = renderOverviewCard(stats, badges, defaultOptions({ card_width: 1200 }));
      expect(svg).toContain('width="800"');
    });
  });

  describe("carousel options", () => {
    it("respects visible_count option", () => {
      const svg = renderOverviewCard(stats, badges, defaultOptions({ visible_count: 2 }));
      expect(svg).toContain("2 of 5 badges");
    });

    it("respects badge_size option", () => {
      const svg = renderOverviewCard(stats, badges, defaultOptions({ badge_size: 96 }));
      expect(svg).toContain('width="96"');
    });

    it("respects show_name option for carousel", () => {
      const svg = renderOverviewCard(stats, badges, defaultOptions({ show_name: false }));
      expect(svg).not.toContain("oc-badge-name");
    });

    it("respects interval option", () => {
      const svg = renderOverviewCard(stats, badges, defaultOptions({ interval: 5 }));
      // 5 badges * 5s = 25s
      expect(svg).toContain("25s");
    });

    it("respects sort option", () => {
      const svg = renderOverviewCard(stats, badges, defaultOptions({ sort: "name" }));
      assertValidSvg(svg);
    });

    it("respects filter_issuer option", () => {
      const svg = renderOverviewCard(stats, badges, defaultOptions({ filter_issuer: "IBM" }));
      expect(svg).toContain("1 of 1 badges");
    });
  });

  describe("theming", () => {
    it("applies dark theme to both sections", () => {
      const svg = renderOverviewCard(stats, badges, defaultOptions({ theme: "dark" }));
      assertValidSvg(svg);
      expect(svg).toContain("#fff");
    });

    it("applies custom title_color", () => {
      const svg = renderOverviewCard(stats, badges, defaultOptions({ title_color: "ff0000" }));
      expect(svg).toContain("#ff0000");
    });
  });

  describe("edge cases", () => {
    it("handles empty badges (stats only)", () => {
      const emptyStats = createMockStats({
        totalBadges: 0,
        uniqueIssuers: [],
        totalSkills: 0,
        uniqueSkills: [],
        activeBadges: 0,
        topIssuers: [],
        topSkills: [],
      });
      const svg = renderOverviewCard(emptyStats, [], defaultOptions());
      assertValidSvg(svg);
      expect(svg).toContain("0");
    });

    it("escapes HTML in username", () => {
      const svg = renderOverviewCard(stats, badges, defaultOptions({ username: '<img onerror="alert(1)">' }));
      expect(svg).not.toContain("<img");
    });

    it("handles hide_border option", () => {
      const svg = renderOverviewCard(stats, badges, defaultOptions({ hide_border: true }));
      expect(svg).toContain('stroke-opacity="0"');
    });

    it("handles hide_title option", () => {
      const svg = renderOverviewCard(stats, badges, defaultOptions({ hide_title: true }));
      expect(svg).not.toContain('data-testid="card-title"');
    });

    it("handles disable_animations", () => {
      const svg = renderOverviewCard(stats, badges, defaultOptions({ disable_animations: true }));
      expect(svg).not.toContain("@keyframes fadeIn");
      expect(svg).not.toContain("@keyframes oc-slide");
    });
  });
});
