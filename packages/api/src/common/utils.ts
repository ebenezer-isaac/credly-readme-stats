const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "`": "&#96;",
  "/": "&#x2F;",
};

/** Escape HTML entities to prevent XSS in SVG content */
export function encodeHTML(str: string): string {
  return str.replace(/[&<>"'`/]/g, (char) => HTML_ENTITIES[char] ?? char);
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Parse comma-separated string into trimmed array.
 * "a, b, c" -> ["a", "b", "c"]
 */
export function parseArray(str: string | undefined): readonly string[] {
  if (!str || str.trim() === "") return [];
  return str
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** Parse string to boolean. "true", "1" -> true. Anything else -> false. */
export function parseBoolean(str: string | undefined): boolean {
  if (str === undefined) return false;
  return str === "true" || str === "1";
}

/**
 * Parse optional boolean from query string.
 * Returns undefined when absent (lets card defaults apply),
 * true/false when explicitly provided.
 */
export function parseOptionalBoolean(str: string | undefined): boolean | undefined {
  if (str === undefined) return undefined;
  return str === "true" || str === "1";
}

/**
 * Parse optional integer from query string.
 * Returns undefined when absent, allowing card defaults to apply.
 */
export function parseOptionalInt(str: string | undefined): number | undefined {
  if (str === undefined || str === "") return undefined;
  const parsed = parseInt(str, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

/**
 * Parse optional float from query string.
 * Returns undefined when absent, allowing card defaults to apply.
 */
export function parseOptionalFloat(str: string | undefined): number | undefined {
  if (str === undefined || str === "") return undefined;
  const parsed = parseFloat(str);
  return Number.isNaN(parsed) ? undefined : parsed;
}

/**
 * Validate a string against allowed values. Returns the value if valid, undefined if not.
 */
export function parseEnum<T extends string>(
  str: string | undefined,
  allowed: readonly T[],
): T | undefined {
  if (str === undefined) return undefined;
  // Use .some() to avoid type assertion on the includes() call
  if (allowed.some((v) => v === str)) return str as T;
  return undefined;
}

/** Format date string for display: "2024-01-15" -> "Jan 15, 2024" */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate + "T00:00:00Z");
  if (Number.isNaN(date.getTime())) return isoDate;

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[date.getUTCMonth()];
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  return `${month} ${day}, ${year}`;
}

/** Lowercase, trim, and normalize a username for cache keys */
export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase().replace(/\/+$/, "");
}

/** Validate Credly username format (allows hyphens, dots, and hex suffixes like "name.05496d7f") */
const USERNAME_REGEX = /^[a-zA-Z0-9][-a-zA-Z0-9.]{0,58}[a-zA-Z0-9]$/;

export function isValidUsername(username: string): boolean {
  return USERNAME_REGEX.test(username) || (username.length === 1 && /^[a-zA-Z0-9]$/.test(username));
}
