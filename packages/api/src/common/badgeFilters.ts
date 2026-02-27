import type { NormalizedBadge } from "../types/card.js";

/** Sort badges by the specified order */
export function sortBadges(
  badges: readonly NormalizedBadge[],
  sort: string | undefined,
): readonly NormalizedBadge[] {
  const sorted = [...badges];
  switch (sort) {
    case "oldest":
      return sorted.sort(
        (a, b) => new Date(a.issuedDate).getTime() - new Date(b.issuedDate).getTime(),
      );
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "issuer":
      return sorted.sort((a, b) => a.issuerName.localeCompare(b.issuerName));
    case "recent":
    default:
      return sorted.sort(
        (a, b) => new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime(),
      );
  }
}

/** Filter badges by issuer and/or skill */
export function filterBadges(
  badges: readonly NormalizedBadge[],
  filterIssuer?: string,
  filterSkill?: string,
): readonly NormalizedBadge[] {
  let result = [...badges];

  if (filterIssuer) {
    const issuers = filterIssuer
      .split(",")
      .map((s) => s.trim().toLowerCase());
    result = result.filter((b) =>
      issuers.some((issuer) => b.issuerName.toLowerCase().includes(issuer)),
    );
  }

  if (filterSkill) {
    const skills = filterSkill
      .split(",")
      .map((s) => s.trim().toLowerCase());
    result = result.filter((b) =>
      b.skills.some((skill) => skills.some((s) => skill.toLowerCase().includes(s))),
    );
  }

  return result;
}
