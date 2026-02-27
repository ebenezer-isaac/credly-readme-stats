import type { Context } from "hono";
import { clamp } from "../common/utils.js";

export const CACHE_DEFAULTS = {
  MIN_CACHE_SECONDS: 7200, // 2 hours
  MAX_CACHE_SECONDS: 86400, // 24 hours
  DEFAULT_CACHE_SECONDS: 21600, // 6 hours
  ERROR_CACHE_SECONDS: 300, // 5 minutes
  STALE_WHILE_REVALIDATE: 3600, // 1 hour
} as const;

/** Resolve cache-control max-age from user-specified value */
export function resolveCacheSeconds(requested: number | undefined): number {
  if (requested === undefined || Number.isNaN(requested)) {
    return CACHE_DEFAULTS.DEFAULT_CACHE_SECONDS;
  }
  return clamp(requested, CACHE_DEFAULTS.MIN_CACHE_SECONDS, CACHE_DEFAULTS.MAX_CACHE_SECONDS);
}

/** Set Cache-Control headers on a successful SVG response */
export function setCacheHeaders(c: Context, cacheSeconds: number): void {
  c.header(
    "Cache-Control",
    `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}, stale-while-revalidate=${CACHE_DEFAULTS.STALE_WHILE_REVALIDATE}`,
  );
}

/** Set short Cache-Control headers for error responses */
export function setErrorCacheHeaders(c: Context): void {
  c.header(
    "Cache-Control",
    `public, max-age=${CACHE_DEFAULTS.ERROR_CACHE_SECONDS}, s-maxage=${CACHE_DEFAULTS.ERROR_CACHE_SECONDS}`,
  );
}
