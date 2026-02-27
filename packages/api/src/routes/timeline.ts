import { Hono } from "hono";
import { renderTimelineCard } from "../cards/TimelineCard.js";
import { getUserBadgeData } from "../fetchers/credlyFetcher.js";
import { setCacheHeaders, resolveCacheSeconds } from "../middleware/index.js";
import { parseOptionalBoolean, parseOptionalInt, parseEnum } from "../common/utils.js";
import { parseBaseOptions, handleRouteError, validateUsername, TIMELINE_SORT_VALUES } from "./shared.js";
import type { TimelineCardOptions } from "../types/card.js";

export const timelineRoute = new Hono();

timelineRoute.get("/", async (c) => {
  try {
    const base = parseBaseOptions(c);
    validateUsername(base.username);

    const options: TimelineCardOptions = {
      ...base,
      max_items: parseOptionalInt(c.req.query("max_items")),
      show_description: parseOptionalBoolean(c.req.query("show_description")),
      show_skills: parseOptionalBoolean(c.req.query("show_skills")),
      sort: parseEnum(c.req.query("sort"), TIMELINE_SORT_VALUES),
      filter_issuer: c.req.query("filter_issuer"),
      filter_skill: c.req.query("filter_skill"),
      card_width: parseOptionalInt(c.req.query("card_width")),
    };

    const { badges, displayName, profileUrl } = await getUserBadgeData(base.username);
    const svg = renderTimelineCard(badges, {
      ...options,
      custom_title: options.custom_title ?? `${displayName}'s Badge Timeline`,
      profile_url: profileUrl,
    });

    setCacheHeaders(c, resolveCacheSeconds(options.cache_seconds));
    c.header("Content-Type", "image/svg+xml");
    return c.body(svg);
  } catch (err) {
    return handleRouteError(err, c);
  }
});
