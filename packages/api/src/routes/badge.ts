import { Hono } from "hono";
import { renderBadgeDetailCard } from "../cards/BadgeDetailCard.js";
import { getUserBadgeData } from "../fetchers/credlyFetcher.js";
import { hydrateBadgeImages } from "../fetchers/imageFetcher.js";
import { AppError, setCacheHeaders, resolveCacheSeconds } from "../middleware/index.js";
import { parseOptionalBoolean, parseOptionalInt } from "../common/utils.js";
import { parseBaseOptions, handleRouteError, validateUsername } from "./shared.js";
import type { BadgeDetailCardOptions } from "../types/card.js";

export const badgeRoute = new Hono();

badgeRoute.get("/", async (c) => {
  try {
    const base = parseBaseOptions(c);
    const badgeId = c.req.query("badge_id");

    validateUsername(base.username);
    if (!badgeId) {
      throw new AppError("BADGE_NOT_FOUND", "badge_id parameter is required");
    }

    const options: BadgeDetailCardOptions = {
      ...base,
      badge_id: badgeId,
      show_description: parseOptionalBoolean(c.req.query("show_description")),
      show_skills: parseOptionalBoolean(c.req.query("show_skills")),
      show_issuer: parseOptionalBoolean(c.req.query("show_issuer")),
      card_width: parseOptionalInt(c.req.query("card_width")),
    };

    const { badges } = await getUserBadgeData(base.username);
    const target = badges.find((b) => b.id === badgeId);
    if (!target) {
      throw new AppError("BADGE_NOT_FOUND", `Badge "${badgeId}" not found for user "${base.username}"`);
    }

    const hydratedBadges = await hydrateBadgeImages([target]);
    const hydratedBadge = hydratedBadges[0];
    if (!hydratedBadge) {
      throw new AppError("CREDLY_API_ERROR", "Failed to process badge image");
    }
    const svg = renderBadgeDetailCard(hydratedBadge, options);

    setCacheHeaders(c, resolveCacheSeconds(options.cache_seconds));
    c.header("Content-Type", "image/svg+xml");
    return c.body(svg);
  } catch (err) {
    return handleRouteError(err, c);
  }
});
