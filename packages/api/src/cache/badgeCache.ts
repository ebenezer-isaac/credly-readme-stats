import { LRUCache } from "./LRUCache.js";
import type { NormalizedBadge, BadgeStats } from "../types/card.js";

interface BadgeCacheValue {
  readonly badges: readonly NormalizedBadge[];
  readonly stats: BadgeStats;
  readonly displayName: string;
}

/** Badge data cache: 500 users, 6h TTL */
export const badgeCache = new LRUCache<BadgeCacheValue>({
  maxSize: 500,
  defaultTTL: 6 * 60 * 60 * 1000, // 6 hours
  name: "badge-data",
});
