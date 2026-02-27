import type { NormalizedBadge, BadgeStats } from "../../src/types/card.js";

/** Factory for creating mock NormalizedBadge objects */
export function createMockBadge(overrides: Partial<NormalizedBadge> = {}): NormalizedBadge {
  return {
    id: "badge-001",
    name: "AWS Solutions Architect",
    description: "Validates technical expertise in designing distributed systems on AWS.",
    imageUrl: "https://images.credly.com/images/test-badge.png",
    imageBase64: null,
    issuerName: "Amazon Web Services",
    issuedDate: "2024-01-15",
    expiresDate: null,
    skills: ["Cloud Computing", "AWS", "Architecture"],
    level: null,
    credlyUrl: "https://www.credly.com/badges/test-badge",
    vanitySlug: "aws-solutions-architect",
    ...overrides,
  };
}

/** Create a set of diverse mock badges for testing */
export function createMockBadges(): readonly NormalizedBadge[] {
  return [
    createMockBadge({
      id: "badge-001",
      name: "AWS Solutions Architect",
      issuerName: "Amazon Web Services",
      issuedDate: "2024-01-15",
      skills: ["Cloud Computing", "AWS", "Architecture"],
    }),
    createMockBadge({
      id: "badge-002",
      name: "IBM Data Science Professional",
      issuerName: "IBM",
      issuedDate: "2023-06-20",
      skills: ["Data Science", "Python", "Machine Learning"],
    }),
    createMockBadge({
      id: "badge-003",
      name: "CompTIA Security+",
      issuerName: "CompTIA",
      issuedDate: "2024-03-10",
      expiresDate: "2027-03-10",
      skills: ["Security", "Networking"],
    }),
    createMockBadge({
      id: "badge-004",
      name: "AWS Cloud Practitioner",
      issuerName: "Amazon Web Services",
      issuedDate: "2023-11-02",
      skills: ["Cloud Computing", "AWS"],
    }),
    createMockBadge({
      id: "badge-005",
      name: "Google Cloud Associate",
      issuerName: "Google",
      issuedDate: "2024-06-01",
      skills: ["Cloud Computing", "GCP"],
    }),
  ];
}

/** Create mock BadgeStats for testing */
export function createMockStats(overrides: Partial<BadgeStats> = {}): BadgeStats {
  return {
    totalBadges: 5,
    uniqueIssuers: ["Amazon Web Services", "IBM", "CompTIA", "Google"],
    totalSkills: 8,
    uniqueSkills: [
      "Cloud Computing",
      "AWS",
      "Architecture",
      "Data Science",
      "Python",
      "Machine Learning",
      "Security",
      "Networking",
    ],
    activeBadges: 5,
    expiringCount: 0,
    badgesByYear: new Map([
      [2023, 2],
      [2024, 3],
    ]),
    topIssuers: [
      { name: "Amazon Web Services", count: 2 },
      { name: "IBM", count: 1 },
      { name: "CompTIA", count: 1 },
      { name: "Google", count: 1 },
    ],
    topSkills: [
      { name: "Cloud Computing", count: 3 },
      { name: "AWS", count: 2 },
    ],
    ...overrides,
  };
}
