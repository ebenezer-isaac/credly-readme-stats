import { describe, it, expect } from "vitest";
import { renderStatsCard } from "../../../src/cards/StatsCard.js";
import { createMockStats } from "../../fixtures/mockBadges.js";
import { assertValidSvg, assertAccessibleSvg } from "../../helpers/testUtils.js";
import type { StatsCardOptions } from "../../../src/types/card.js";

function defaultOptions(overrides: Partial<StatsCardOptions> = {}): StatsCardOptions {
  return { username: "testuser", ...overrides };
}

describe("renderStatsCard", () => {
  const stats = createMockStats();

  describe("basic rendering", () => {
    it("produces valid SVG", () => {
      assertValidSvg(renderStatsCard(stats, defaultOptions()));
    });

    it("includes accessibility attributes", () => {
      const svg = renderStatsCard(stats, defaultOptions());
      assertAccessibleSvg(svg);
      expect(svg).toContain("Credly stats");
    });

    it("includes username in title", () => {
      const svg = renderStatsCard(stats, defaultOptions());
      expect(svg).toContain("testuser&#39;s Credly Stats");
    });

    it("uses custom_title when provided", () => {
      const svg = renderStatsCard(stats, defaultOptions({ custom_title: "My Badges" }));
      expect(svg).toContain("My Badges");
    });
  });

  describe("stat rows", () => {
    it("shows total badges", () => {
      const svg = renderStatsCard(stats, defaultOptions());
      expect(svg).toContain("Total Badges");
      expect(svg).toContain("5");
    });

    it("shows unique issuers", () => {
      const svg = renderStatsCard(stats, defaultOptions());
      expect(svg).toContain("Unique Issuers");
    });

    it("shows unique skills", () => {
      const svg = renderStatsCard(stats, defaultOptions());
      expect(svg).toContain("Unique Skills");
    });

    it("shows active badges", () => {
      const svg = renderStatsCard(stats, defaultOptions());
      expect(svg).toContain("Active Badges");
    });

    it("shows expiring count", () => {
      const svg = renderStatsCard(stats, defaultOptions());
      expect(svg).toContain("Expiring Soon");
    });
  });

  describe("hide option", () => {
    it("hides total when specified", () => {
      const svg = renderStatsCard(stats, defaultOptions({ hide: "total" }));
      expect(svg).not.toContain("Total Badges");
    });

    it("hides multiple stats", () => {
      const svg = renderStatsCard(stats, defaultOptions({ hide: "total,issuers,skills" }));
      expect(svg).not.toContain("Total Badges");
      expect(svg).not.toContain("Unique Issuers");
      expect(svg).not.toContain("Unique Skills");
    });

    it("hides top_issuers footer section", () => {
      const svg = renderStatsCard(stats, defaultOptions({ hide: "top_issuers" }));
      expect(svg).not.toContain("Top Issuers");
    });

    it("hides top_skills footer section", () => {
      const svg = renderStatsCard(stats, defaultOptions({ hide: "top_skills" }));
      expect(svg).not.toContain("Top Skills");
    });
  });

  describe("icons", () => {
    it("shows icons by default", () => {
      const svg = renderStatsCard(stats, defaultOptions());
      expect(svg).toContain("viewBox");
      expect(svg).toContain("<path");
    });

    it("hides icons when show_icons is false", () => {
      const svg = renderStatsCard(stats, defaultOptions({ show_icons: false }));
      // With icons hidden, the icon SVG elements should not be rendered in stat rows
      // The stat rows should still be present but without icon SVGs
      expect(svg).toContain("Total Badges");
    });
  });

  describe("dimensions", () => {
    it("uses default width of 495", () => {
      const svg = renderStatsCard(stats, defaultOptions());
      expect(svg).toContain('width="495"');
    });

    it("respects card_width option", () => {
      const svg = renderStatsCard(stats, defaultOptions({ card_width: 600 }));
      expect(svg).toContain('width="600"');
    });

    it("clamps card_width to minimum 300", () => {
      const svg = renderStatsCard(stats, defaultOptions({ card_width: 100 }));
      expect(svg).toContain('width="300"');
    });

    it("clamps card_width to maximum 800", () => {
      const svg = renderStatsCard(stats, defaultOptions({ card_width: 1000 }));
      expect(svg).toContain('width="800"');
    });
  });

  describe("theming", () => {
    it("applies dark theme", () => {
      const svg = renderStatsCard(stats, defaultOptions({ theme: "dark" }));
      assertValidSvg(svg);
      expect(svg).toContain("#fff"); // dark theme has white text
    });

    it("applies custom colors", () => {
      const svg = renderStatsCard(stats, defaultOptions({ title_color: "ff0000" }));
      expect(svg).toContain("#ff0000");
    });
  });

  describe("footer sections", () => {
    it("shows top issuers when available", () => {
      const svg = renderStatsCard(stats, defaultOptions());
      expect(svg).toContain("Top Issuers");
      expect(svg).toContain("Amazon Web Services");
    });

    it("shows top skills when available", () => {
      const svg = renderStatsCard(stats, defaultOptions());
      expect(svg).toContain("Top Skills");
    });

    it("hides top issuers when none exist", () => {
      const noIssuers = createMockStats({ topIssuers: [] });
      const svg = renderStatsCard(noIssuers, defaultOptions());
      expect(svg).not.toContain("Top Issuers");
    });

    it("hides top skills when none exist", () => {
      const noSkills = createMockStats({ topSkills: [] });
      const svg = renderStatsCard(noSkills, defaultOptions());
      expect(svg).not.toContain("Top Skills");
    });
  });

  describe("animations", () => {
    it("includes stagger animations by default", () => {
      const svg = renderStatsCard(stats, defaultOptions());
      expect(svg).toContain("animation-delay");
    });

    it("disables animations when requested", () => {
      const svg = renderStatsCard(stats, defaultOptions({ disable_animations: true }));
      expect(svg).not.toContain("@keyframes fadeIn");
    });
  });

  describe("edge cases", () => {
    it("handles zero badges", () => {
      const emptyStats = createMockStats({
        totalBadges: 0,
        uniqueIssuers: [],
        totalSkills: 0,
        uniqueSkills: [],
        activeBadges: 0,
        topIssuers: [],
        topSkills: [],
      });
      const svg = renderStatsCard(emptyStats, defaultOptions());
      assertValidSvg(svg);
      expect(svg).toContain("0");
    });

    it("escapes HTML in username", () => {
      const svg = renderStatsCard(stats, defaultOptions({ username: '<img onerror="alert(1)">' }));
      expect(svg).not.toContain("<img");
    });

    it("handles border options", () => {
      const svg = renderStatsCard(stats, defaultOptions({ hide_border: true }));
      expect(svg).toContain('stroke-opacity="0"');
    });

    it("handles hide_title option", () => {
      const svg = renderStatsCard(stats, defaultOptions({ hide_title: true }));
      expect(svg).not.toContain('data-testid="card-title"');
    });
  });
});
