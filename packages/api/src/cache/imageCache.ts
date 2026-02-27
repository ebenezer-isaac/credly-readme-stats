import { LRUCache } from "./LRUCache.js";

/** Base64 image cache: 2000 images, 24h TTL */
export const imageCache = new LRUCache<string>({
  maxSize: 2000,
  defaultTTL: 24 * 60 * 60 * 1000, // 24 hours
  name: "badge-images",
});
