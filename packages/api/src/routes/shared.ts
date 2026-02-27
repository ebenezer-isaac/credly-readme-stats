import type { Context } from "hono";
import type { BaseCardOptions } from "../types/card.js";
import { renderErrorCard } from "../cards/ErrorCard.js";
import { getCardColors } from "../themes/resolveTheme.js";
import { AppError, createErrorInfo, setErrorCacheHeaders } from "../middleware/index.js";
import { parseBoolean, parseOptionalFloat, parseOptionalInt, isValidUsername } from "../common/utils.js";

/** Valid sort values for cards with full sort support (grid, carousel, overview) */
export const SORT_VALUES = ["recent", "oldest", "name", "issuer"] as const;

/** Valid sort values for timeline (date-only sorting) */
export const TIMELINE_SORT_VALUES = ["recent", "oldest"] as const;

/** Validate username and throw AppError if invalid */
export function validateUsername(username: string | undefined): asserts username is string {
  if (!username || !isValidUsername(username)) {
    throw new AppError("INVALID_USERNAME", `Invalid username: "${username}"`);
  }
}

/** Parse shared base card options from query string. No type casts, no hacks. */
export function parseBaseOptions(c: Context): BaseCardOptions {
  const username = c.req.query("username") ?? "";
  return {
    username,
    theme: c.req.query("theme"),
    title_color: c.req.query("title_color"),
    text_color: c.req.query("text_color"),
    icon_color: c.req.query("icon_color"),
    bg_color: c.req.query("bg_color"),
    border_color: c.req.query("border_color"),
    badge_label_color: c.req.query("badge_label_color"),
    hide_border: parseBoolean(c.req.query("hide_border")),
    hide_title: parseBoolean(c.req.query("hide_title")),
    custom_title: c.req.query("custom_title"),
    border_radius: parseOptionalFloat(c.req.query("border_radius")),
    disable_animations: parseBoolean(c.req.query("disable_animations")),
    cache_seconds: parseOptionalInt(c.req.query("cache_seconds")),
  };
}

/** Wrap a route handler with consistent error handling that renders error SVG cards */
export function handleRouteError(err: unknown, c: Context): Response {
  setErrorCacheHeaders(c);

  if (err instanceof AppError) {
    const errorInfo = createErrorInfo(err.type, {
      username: c.req.query("username") ?? "",
    });
    const colors = getCardColors({ username: "", theme: c.req.query("theme") });
    return new Response(renderErrorCard(errorInfo, colors), {
      status: err.statusCode,
      headers: { "Content-Type": "image/svg+xml; charset=utf-8" },
    });
  }

  console.error("[route] Unhandled error:", err instanceof Error ? err.stack ?? err.message : err);
  const errorInfo = createErrorInfo("INTERNAL_ERROR");
  return new Response(renderErrorCard(errorInfo), {
    status: 500,
    headers: { "Content-Type": "image/svg+xml; charset=utf-8" },
  });
}
