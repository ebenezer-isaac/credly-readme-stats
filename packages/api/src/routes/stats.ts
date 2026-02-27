import { Hono } from "hono";
import { renderStatsCard } from "../cards/StatsCard.js";
import { getUserBadgeData } from "../fetchers/credlyFetcher.js";
import { setCacheHeaders, resolveCacheSeconds } from "../middleware/index.js";
import { parseOptionalBoolean, parseOptionalInt } from "../common/utils.js";
import { parseBaseOptions, handleRouteError, validateUsername } from "./shared.js";
import type { StatsCardOptions } from "../types/card.js";

export const statsRoute = new Hono();

statsRoute.get("/", async (c) => {
  try {
    const base = parseBaseOptions(c);
    validateUsername(base.username);

    const options: StatsCardOptions = {
      ...base,
      show_icons: parseOptionalBoolean(c.req.query("show_icons")),
      hide: c.req.query("hide"),
      card_width: parseOptionalInt(c.req.query("card_width")),
      line_height: parseOptionalInt(c.req.query("line_height")),
    };

    const { stats, displayName, profileUrl } = await getUserBadgeData(base.username);
    const svg = renderStatsCard(stats, {
      ...options,
      custom_title: options.custom_title ?? `${displayName}'s Credly Stats`,
      profile_url: profileUrl,
    });

    setCacheHeaders(c, resolveCacheSeconds(options.cache_seconds));
    c.header("Content-Type", "image/svg+xml; charset=utf-8");
    return c.body(svg);
  } catch (err) {
    return handleRouteError(err, c);
  }
});
