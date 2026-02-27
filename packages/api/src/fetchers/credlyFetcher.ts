import type { CredlyBadgesResponse, CredlyBadge, CredlyMetadata } from "../types/credly.js";
import type { NormalizedBadge, BadgeStats } from "../types/card.js";
import { AppError } from "../middleware/errorHandler.js";
import { badgeCache } from "../cache/badgeCache.js";
import { normalizeUsername } from "../common/utils.js";

const CREDLY_BASE_URL = "https://www.credly.com/users";
const DEFAULT_PER_PAGE = 48;
const FETCH_TIMEOUT_MS = 10_000;
const MAX_PAGES = 10;

/** Create an AbortSignal that times out after ms */
function createTimeout(ms: number): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(timeoutId) };
}

/** Validate that raw JSON matches expected Credly response shape */
function validateCredlyResponse(json: unknown): json is CredlyBadgesResponse {
  if (typeof json !== "object" || json === null) return false;
  const obj = json as Record<string, unknown>;
  if (!Array.isArray(obj["data"])) return false;
  if (typeof obj["metadata"] !== "object" || obj["metadata"] === null) return false;
  return true;
}

/** Fetch a single page of badges from Credly */
export async function fetchBadgePage(
  username: string,
  page = 1,
  perPage = DEFAULT_PER_PAGE,
): Promise<CredlyBadgesResponse> {
  const url = `${CREDLY_BASE_URL}/${encodeURIComponent(username)}/badges.json?page=${page}&per=${perPage}&sort=most_popular&filter=all`;

  const timeout = createTimeout(FETCH_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(url, {
      signal: timeout.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "credly-readme-stats/1.0",
      },
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : "Unknown error";
    console.error(`[credlyFetcher] Fetch failed for "${username}": ${reason}`);
    throw new AppError("CREDLY_API_ERROR", `Failed to connect to Credly API`);
  } finally {
    timeout.clear();
  }

  if (response.status === 404) {
    throw new AppError("USER_NOT_FOUND", `User "${username}" not found on Credly`);
  }

  if (!response.ok) {
    throw new AppError(
      "CREDLY_API_ERROR",
      `Credly API returned ${response.status}: ${response.statusText}`,
    );
  }

  const json: unknown = await response.json();
  if (!validateCredlyResponse(json)) {
    throw new AppError("CREDLY_API_ERROR", "Unexpected response format from Credly API");
  }

  return json;
}

/**
 * Fetch ALL badges for a user, handling pagination.
 * Fetches page 1, then remaining pages in parallel.
 */
export async function fetchAllBadges(
  username: string,
): Promise<{ readonly badges: readonly CredlyBadge[]; readonly metadata: CredlyMetadata }> {
  const firstPage = await fetchBadgePage(username, 1);

  if (firstPage.metadata.total_pages <= 1) {
    return { badges: firstPage.data, metadata: firstPage.metadata };
  }

  // Fetch remaining pages in parallel (capped to prevent unbounded requests)
  const pagesToFetch = Math.min(firstPage.metadata.total_pages - 1, MAX_PAGES - 1);
  const remainingPages = Array.from(
    { length: pagesToFetch },
    (_, i) => i + 2,
  );

  const results = await Promise.all(
    remainingPages.map((page) => fetchBadgePage(username, page)),
  );

  const allBadges = [
    ...firstPage.data,
    ...results.flatMap((r) => [...r.data]),
  ];

  return { badges: allBadges, metadata: firstPage.metadata };
}

/** Transform raw Credly badge into normalized card-ready format */
export function normalizeBadge(raw: CredlyBadge): NormalizedBadge {
  const issuerEntity = raw.issuer.entities[0];

  return {
    id: raw.id,
    name: raw.badge_template.name,
    description: raw.badge_template.description,
    imageUrl: raw.image_url || raw.badge_template.image_url,
    imageBase64: null,
    issuerName: issuerEntity?.entity.name ?? "Unknown Issuer",
    issuedDate: raw.issued_at_date,
    expiresDate: raw.expires_at_date,
    skills: raw.badge_template.skills.map((s) => s.name),
    level: raw.badge_template.level,
    credlyUrl: `https://www.credly.com/badges/${raw.id}`,
  };
}

/** Compute aggregate statistics from a collection of normalized badges */
export function computeStats(badges: readonly NormalizedBadge[]): BadgeStats {
  const issuerCounts = new Map<string, number>();
  const skillCounts = new Map<string, number>();
  const yearCounts = new Map<number, number>();
  const now = new Date();
  let expiringCount = 0;

  for (const badge of badges) {
    // Issuers
    issuerCounts.set(badge.issuerName, (issuerCounts.get(badge.issuerName) ?? 0) + 1);

    // Skills
    for (const skill of badge.skills) {
      skillCounts.set(skill, (skillCounts.get(skill) ?? 0) + 1);
    }

    // Years
    const year = new Date(badge.issuedDate + "T00:00:00Z").getUTCFullYear();
    if (!Number.isNaN(year)) {
      yearCounts.set(year, (yearCounts.get(year) ?? 0) + 1);
    }

    // Expiring (within 90 days)
    if (badge.expiresDate) {
      const expiry = new Date(badge.expiresDate + "T00:00:00Z");
      const daysUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (daysUntilExpiry > 0 && daysUntilExpiry <= 90) {
        expiringCount++;
      }
    }
  }

  // Active badges = total minus expired ones
  const activeBadges = badges.filter((b) => {
    if (!b.expiresDate) return true;
    return new Date(b.expiresDate + "T00:00:00Z").getTime() > now.getTime();
  }).length;

  // Top issuers (sorted by count desc)
  const topIssuers = [...issuerCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  // Top skills (sorted by count desc)
  const topSkills = [...skillCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  return {
    totalBadges: badges.length,
    uniqueIssuers: [...new Set(badges.map((b) => b.issuerName))],
    totalSkills: skillCounts.size,
    uniqueSkills: [...skillCounts.keys()],
    activeBadges,
    expiringCount,
    badgesByYear: yearCounts,
    topIssuers,
    topSkills,
  };
}

/** Result of fetching and processing a user's badge data */
export interface UserBadgeData {
  readonly badges: readonly NormalizedBadge[];
  readonly stats: BadgeStats;
  readonly displayName: string;
  readonly profileUrl: string;
}

/**
 * High-level: fetch, normalize, and compute stats.
 * Uses badge cache internally.
 * Extracts the user's display name from the first badge's `issued_to` field.
 */
export async function getUserBadgeData(username: string): Promise<UserBadgeData> {
  const cacheKey = `badges:${normalizeUsername(username)}`;
  const cached = badgeCache.get(cacheKey);
  if (cached) return cached;

  const { badges: rawBadges } = await fetchAllBadges(username);
  const badges = rawBadges.map(normalizeBadge);
  const stats = computeStats(badges);
  const displayName = rawBadges[0]?.issued_to ?? username;
  const profileUrl = `${CREDLY_BASE_URL}/${encodeURIComponent(username)}/badges`;

  const result: UserBadgeData = { badges, stats, displayName, profileUrl };
  badgeCache.set(cacheKey, result);

  return result;
}
