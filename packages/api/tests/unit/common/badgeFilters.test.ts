import { describe, it, expect } from "vitest";
import { sortBadges, filterBadges } from "../../../src/common/badgeFilters.js";
import { createMockBadges, createMockBadge } from "../../fixtures/mockBadges.js";

describe("sortBadges", () => {
  const badges = createMockBadges();

  it("sorts by recent (default)", () => {
    const result = sortBadges(badges, "recent");
    expect(result[0]!.issuedDate).toBe("2024-06-01");
    expect(result[result.length - 1]!.issuedDate).toBe("2023-06-20");
  });

  it("sorts by oldest", () => {
    const result = sortBadges(badges, "oldest");
    expect(result[0]!.issuedDate).toBe("2023-06-20");
    expect(result[result.length - 1]!.issuedDate).toBe("2024-06-01");
  });

  it("sorts by name", () => {
    const result = sortBadges(badges, "name");
    expect(result[0]!.name).toBe("AWS Cloud Practitioner");
    expect(result[1]!.name).toBe("AWS Solutions Architect");
  });

  it("sorts by issuer", () => {
    const result = sortBadges(badges, "issuer");
    expect(result[0]!.issuerName).toBe("Amazon Web Services");
  });

  it("defaults to recent for unknown sort", () => {
    const result = sortBadges(badges, undefined);
    expect(result[0]!.issuedDate).toBe("2024-06-01");
  });

  it("does not mutate the original array", () => {
    const original = [...badges];
    sortBadges(badges, "name");
    expect(badges).toEqual(original);
  });
});

describe("filterBadges", () => {
  const badges = createMockBadges();

  it("filters by issuer", () => {
    const result = filterBadges(badges, "Amazon Web Services");
    expect(result).toHaveLength(2);
    expect(result.every((b) => b.issuerName === "Amazon Web Services")).toBe(true);
  });

  it("filters by issuer case-insensitively", () => {
    const result = filterBadges(badges, "amazon");
    expect(result).toHaveLength(2);
  });

  it("filters by partial issuer match", () => {
    const result = filterBadges(badges, "amazon");
    expect(result).toHaveLength(2);
  });

  it("filters by multiple issuers (comma-separated)", () => {
    const result = filterBadges(badges, "IBM, Google");
    expect(result).toHaveLength(2);
  });

  it("filters by skill", () => {
    const result = filterBadges(badges, undefined, "Cloud Computing");
    expect(result).toHaveLength(3);
  });

  it("filters by skill case-insensitively", () => {
    const result = filterBadges(badges, undefined, "cloud");
    expect(result).toHaveLength(3);
  });

  it("combines issuer and skill filters", () => {
    const result = filterBadges(badges, "Amazon", "Architecture");
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe("AWS Solutions Architect");
  });

  it("returns all badges when no filters", () => {
    const result = filterBadges(badges);
    expect(result).toHaveLength(5);
  });

  it("returns empty when no matches", () => {
    const result = filterBadges(badges, "NonExistentIssuer");
    expect(result).toHaveLength(0);
  });
});
