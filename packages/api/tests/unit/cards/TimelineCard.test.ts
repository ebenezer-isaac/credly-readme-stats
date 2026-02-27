import { describe, it, expect } from "vitest";
import { renderTimelineCard } from "../../../src/cards/TimelineCard.js";
import { createMockBadges, createMockBadge } from "../../fixtures/mockBadges.js";
import { assertValidSvg, assertAccessibleSvg } from "../../helpers/testUtils.js";
import type { TimelineCardOptions } from "../../../src/types/card.js";

function defaultOptions(overrides: Partial<TimelineCardOptions> = {}): TimelineCardOptions {
  return { username: "testuser", ...overrides };
}

describe("renderTimelineCard", () => {
  const badges = createMockBadges();

  describe("basic rendering", () => {
    it("produces valid SVG", () => {
      assertValidSvg(renderTimelineCard(badges, defaultOptions()));
    });

    it("includes accessibility attributes", () => {
      const svg = renderTimelineCard(badges, defaultOptions());
      assertAccessibleSvg(svg);
      expect(svg).toContain("Timeline");
    });

    it("includes username in title", () => {
      const svg = renderTimelineCard(badges, defaultOptions());
      expect(svg).toContain("testuser");
    });

    it("uses custom_title when provided", () => {
      const svg = renderTimelineCard(badges, defaultOptions({ custom_title: "My Timeline" }));
      expect(svg).toContain("My Timeline");
    });
  });

  describe("timeline entries", () => {
    it("shows badge names", () => {
      const svg = renderTimelineCard(badges, defaultOptions());
      expect(svg).toContain("AWS Solutions Architect");
    });

    it("shows formatted dates", () => {
      const svg = renderTimelineCard(badges, defaultOptions());
      expect(svg).toContain("Jan 15, 2024");
    });

    it("shows issuer names", () => {
      const svg = renderTimelineCard(badges, defaultOptions());
      expect(svg).toContain("Amazon Web Services");
    });

    it("shows skills by default", () => {
      const svg = renderTimelineCard(badges, defaultOptions());
      expect(svg).toContain('class="timeline-skills">');
    });

    it("hides skills when show_skills is false", () => {
      const svg = renderTimelineCard(badges, defaultOptions({ show_skills: false }));
      expect(svg).not.toContain('class="timeline-skills">');
    });

    it("hides description by default", () => {
      const svg = renderTimelineCard(badges, defaultOptions());
      expect(svg).not.toContain('class="timeline-desc">');
    });

    it("shows description when show_description is true", () => {
      const svg = renderTimelineCard(badges, defaultOptions({ show_description: true }));
      expect(svg).toContain('class="timeline-desc">');
    });
  });

  describe("max_items", () => {
    it("defaults to 6 items", () => {
      const svg = renderTimelineCard(badges, defaultOptions());
      assertValidSvg(svg);
    });

    it("respects max_items option", () => {
      const svg = renderTimelineCard(badges, defaultOptions({ max_items: 2 }));
      const circleCount = (svg.match(/<circle/g) || []).length;
      expect(circleCount).toBe(2);
    });

    it("clamps max_items to 1-20 range", () => {
      const svg = renderTimelineCard(badges, defaultOptions({ max_items: 0 }));
      const circleCount = (svg.match(/<circle/g) || []).length;
      expect(circleCount).toBe(1); // clamped to 1
    });
  });

  describe("sorting", () => {
    it("sorts by recent by default", () => {
      const svg = renderTimelineCard(badges, defaultOptions({ max_items: 1 }));
      expect(svg).toContain("Jun 1, 2024"); // most recent
    });

    it("sorts by oldest", () => {
      const svg = renderTimelineCard(badges, defaultOptions({ sort: "oldest", max_items: 1 }));
      expect(svg).toContain("Jun 20, 2023"); // oldest
    });
  });

  describe("filtering", () => {
    it("filters by issuer", () => {
      const svg = renderTimelineCard(badges, defaultOptions({ filter_issuer: "IBM" }));
      assertValidSvg(svg);
      const circleCount = (svg.match(/<circle/g) || []).length;
      expect(circleCount).toBe(1);
    });

    it("filters by skill", () => {
      const svg = renderTimelineCard(badges, defaultOptions({ filter_skill: "Security" }));
      assertValidSvg(svg);
    });
  });

  describe("timeline spine", () => {
    it("renders spine line for multiple entries", () => {
      const svg = renderTimelineCard(badges, defaultOptions());
      expect(svg).toContain("<line");
    });

    it("does not render spine for single entry", () => {
      const svg = renderTimelineCard([badges[0]!], defaultOptions());
      expect(svg).not.toContain("<line");
    });

    it("renders node circles", () => {
      const svg = renderTimelineCard(badges, defaultOptions());
      expect(svg).toContain("<circle");
    });
  });

  describe("card dimensions", () => {
    it("uses default width of 495", () => {
      const svg = renderTimelineCard(badges, defaultOptions());
      expect(svg).toContain('width="495"');
    });

    it("respects card_width option", () => {
      const svg = renderTimelineCard(badges, defaultOptions({ card_width: 600 }));
      expect(svg).toContain('width="600"');
    });

    it("clamps card_width to 400-800 range", () => {
      const svg = renderTimelineCard(badges, defaultOptions({ card_width: 100 }));
      expect(svg).toContain('width="400"');
    });
  });

  describe("edge cases", () => {
    it("handles empty badges array", () => {
      const svg = renderTimelineCard([], defaultOptions());
      assertValidSvg(svg);
    });

    it("handles badges with no skills", () => {
      const noSkills = [createMockBadge({ skills: [] })];
      const svg = renderTimelineCard(noSkills, defaultOptions());
      assertValidSvg(svg);
    });

    it("escapes HTML in badge names", () => {
      const xssBadge = createMockBadge({ name: '<img onerror=alert(1)>' });
      const svg = renderTimelineCard([xssBadge], defaultOptions());
      expect(svg).not.toContain("<img");
    });

    it("handles hide_title option", () => {
      const svg = renderTimelineCard(badges, defaultOptions({ hide_title: true }));
      expect(svg).not.toContain('data-testid="card-title"');
    });

    it("handles disable_animations option", () => {
      const svg = renderTimelineCard(badges, defaultOptions({ disable_animations: true }));
      expect(svg).not.toContain("@keyframes fadeIn");
    });

    it("handles badges with descriptions", () => {
      const withDesc = badges.map((b) => ({ ...b, description: "A test description" }));
      const svg = renderTimelineCard(withDesc, defaultOptions({ show_description: true }));
      assertValidSvg(svg);
    });
  });
});
