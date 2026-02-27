import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { normalizeBadge, computeStats } from "../../../src/fetchers/credlyFetcher.js";
import { createMockBadges, createMockBadge } from "../../fixtures/mockBadges.js";
import type { CredlyBadge } from "../../../src/types/credly.js";

/** Create a minimal raw Credly badge for testing normalization */
function createRawBadge(overrides: Partial<CredlyBadge> = {}): CredlyBadge {
  return {
    id: "raw-001",
    badge_template: {
      id: "tpl-001",
      name: "Test Badge",
      description: "A test badge",
      image_url: "https://images.credly.com/tpl.png",
      url: "https://www.credly.com/badges/tpl-001",
      vanity_slug: "test-badge",
      skills: [{ name: "Skill A" }, { name: "Skill B" }],
      level: null,
      badge_template_activities: [],
    },
    issuer: {
      entities: [
        {
          entity: {
            name: "Test Issuer",
            url: "https://issuer.example.com",
            image_url: "https://images.credly.com/issuer.png",
          },
        },
      ],
    },
    issued_at_date: "2024-01-15",
    expires_at_date: null,
    state: "accepted",
    image_url: "https://images.credly.com/badge.png",
    issued_to: "Test User",
    locale: "en",
    public: true,
    ...overrides,
  } as CredlyBadge;
}

describe("normalizeBadge", () => {
  it("transforms raw Credly badge to normalized format", () => {
    const raw = createRawBadge();
    const result = normalizeBadge(raw);

    expect(result.id).toBe("raw-001");
    expect(result.name).toBe("Test Badge");
    expect(result.description).toBe("A test badge");
    expect(result.imageUrl).toBe("https://images.credly.com/badge.png");
    expect(result.imageBase64).toBeNull();
    expect(result.issuerName).toBe("Test Issuer");
    expect(result.issuedDate).toBe("2024-01-15");
    expect(result.expiresDate).toBeNull();
    expect(result.skills).toEqual(["Skill A", "Skill B"]);
    expect(result.credlyUrl).toBe("https://www.credly.com/badges/tpl-001");
    expect(result.vanitySlug).toBe("test-badge");
  });

  it("uses badge_template image_url as fallback", () => {
    const raw = createRawBadge({ image_url: "" });
    const result = normalizeBadge(raw);
    expect(result.imageUrl).toBe("https://images.credly.com/tpl.png");
  });

  it("handles missing issuer entity", () => {
    const raw = createRawBadge({
      issuer: { entities: [] },
    } as any);
    const result = normalizeBadge(raw);
    expect(result.issuerName).toBe("Unknown Issuer");
  });

  it("handles expiry date", () => {
    const raw = createRawBadge({ expires_at_date: "2027-01-15" });
    const result = normalizeBadge(raw);
    expect(result.expiresDate).toBe("2027-01-15");
  });

  it("maps all skills", () => {
    const raw = createRawBadge({
      badge_template: {
        ...createRawBadge().badge_template,
        skills: [{ name: "A" }, { name: "B" }, { name: "C" }],
      },
    });
    const result = normalizeBadge(raw);
    expect(result.skills).toEqual(["A", "B", "C"]);
  });
});

describe("computeStats", () => {
  const badges = createMockBadges();

  it("counts total badges", () => {
    const stats = computeStats(badges);
    expect(stats.totalBadges).toBe(5);
  });

  it("identifies unique issuers", () => {
    const stats = computeStats(badges);
    expect(stats.uniqueIssuers).toHaveLength(4);
    expect(stats.uniqueIssuers).toContain("Amazon Web Services");
    expect(stats.uniqueIssuers).toContain("IBM");
  });

  it("counts total unique skills", () => {
    const stats = computeStats(badges);
    expect(stats.totalSkills).toBeGreaterThan(0);
    expect(stats.uniqueSkills.length).toBe(stats.totalSkills);
  });

  it("counts active badges (non-expired)", () => {
    const stats = computeStats(badges);
    expect(stats.activeBadges).toBe(5);
  });

  it("excludes expired badges from active count", () => {
    const expired = createMockBadge({ expiresDate: "2020-01-01" });
    const active = createMockBadge({ expiresDate: null });
    const stats = computeStats([expired, active]);
    expect(stats.activeBadges).toBe(1);
  });

  it("counts badges by year", () => {
    const stats = computeStats(badges);
    expect(stats.badgesByYear.get(2024)).toBe(3);
    expect(stats.badgesByYear.get(2023)).toBe(2);
  });

  it("ranks top issuers by count", () => {
    const stats = computeStats(badges);
    expect(stats.topIssuers[0]!.name).toBe("Amazon Web Services");
    expect(stats.topIssuers[0]!.count).toBe(2);
  });

  it("ranks top skills by count", () => {
    const stats = computeStats(badges);
    expect(stats.topSkills[0]!.name).toBe("Cloud Computing");
    expect(stats.topSkills[0]!.count).toBe(3);
  });

  it("handles empty badges array", () => {
    const stats = computeStats([]);
    expect(stats.totalBadges).toBe(0);
    expect(stats.uniqueIssuers).toEqual([]);
    expect(stats.totalSkills).toBe(0);
    expect(stats.activeBadges).toBe(0);
    expect(stats.expiringCount).toBe(0);
  });

  it("handles single badge", () => {
    const single = [createMockBadge()];
    const stats = computeStats(single);
    expect(stats.totalBadges).toBe(1);
    expect(stats.activeBadges).toBe(1);
  });

  it("counts expiring badges within 90 days", () => {
    const now = new Date();
    const expiringDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringBadge = createMockBadge({
      expiresDate: expiringDate.toISOString().split("T")[0],
    });
    const stats = computeStats([expiringBadge]);
    expect(stats.expiringCount).toBe(1);
  });

  it("does not count already expired badges", () => {
    const expiredBadge = createMockBadge({
      expiresDate: "2020-01-01",
    });
    const stats = computeStats([expiredBadge]);
    expect(stats.expiringCount).toBe(0);
  });

  it("does not count badges expiring beyond 90 days", () => {
    const farFuture = createMockBadge({
      expiresDate: "2099-01-01",
    });
    const stats = computeStats([farFuture]);
    expect(stats.expiringCount).toBe(0);
  });
});
