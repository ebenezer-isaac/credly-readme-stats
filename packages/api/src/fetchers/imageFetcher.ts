import { imageCache } from "../cache/imageCache.js";
import type { NormalizedBadge } from "../types/card.js";

// 1x1 transparent PNG as fallback
const PLACEHOLDER_BASE64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

const IMAGE_FETCH_TIMEOUT_MS = 8_000;
const DEFAULT_IMAGE_CONCURRENCY = 6;

/** Create an AbortSignal that times out after ms */
function createTimeout(ms: number): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(timeoutId) };
}

/**
 * Fetch a single image URL and return as data URI (base64-encoded).
 * Uses image cache internally (keyed by full URL for collision safety).
 * Returns "data:image/png;base64,..." string.
 * On failure, returns a 1x1 transparent PNG placeholder.
 */
export async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  const cacheKey = `img:${imageUrl}`;
  const cached = imageCache.get(cacheKey);
  if (cached) return cached;

  const timeout = createTimeout(IMAGE_FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(imageUrl, {
      signal: timeout.signal,
      headers: { "User-Agent": "credly-readme-stats/1.0" },
    });

    if (!response.ok) return PLACEHOLDER_BASE64;

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const contentType = response.headers.get("content-type") ?? "image/png";
    const dataUri = `data:${contentType};base64,${base64}`;

    imageCache.set(cacheKey, dataUri);
    return dataUri;
  } catch (err) {
    const reason = err instanceof Error ? err.message : "Unknown error";
    console.error(`[imageFetcher] Failed to fetch image ${imageUrl}: ${reason}`);
    return PLACEHOLDER_BASE64;
  } finally {
    timeout.clear();
  }
}

/**
 * Batch-fetch multiple images in parallel with concurrency limit.
 * Returns Map<originalUrl, base64DataUri>.
 */
export async function fetchImagesAsBase64(
  imageUrls: readonly string[],
  maxConcurrency = DEFAULT_IMAGE_CONCURRENCY,
): Promise<ReadonlyMap<string, string>> {
  const results = new Map<string, string>();
  const uniqueUrls = [...new Set(imageUrls)];

  // Process in chunks of maxConcurrency
  for (let i = 0; i < uniqueUrls.length; i += maxConcurrency) {
    const chunk = uniqueUrls.slice(i, i + maxConcurrency);
    const chunkResults = await Promise.all(
      chunk.map(async (url) => {
        const base64 = await fetchImageAsBase64(url);
        return [url, base64] as const;
      }),
    );
    for (const [url, base64] of chunkResults) {
      results.set(url, base64);
    }
  }

  return results;
}

/**
 * Attach base64 images to normalized badges.
 * Returns new array with imageBase64 populated (immutable).
 */
export async function hydrateBadgeImages(
  badges: readonly NormalizedBadge[],
): Promise<readonly NormalizedBadge[]> {
  const urls = badges.map((b) => b.imageUrl);
  const imageMap = await fetchImagesAsBase64(urls);

  return badges.map((badge) => ({
    ...badge,
    imageBase64: imageMap.get(badge.imageUrl) ?? PLACEHOLDER_BASE64,
  }));
}
