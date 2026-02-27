import { Hono } from "hono";
import { renderGridCard } from "../cards/GridCard.js";
import { getUserBadgeData } from "../fetchers/credlyFetcher.js";
import { hydrateBadgeImages } from "../fetchers/imageFetcher.js";
import { setCacheHeaders, resolveCacheSeconds } from "../middleware/index.js";
import { parseOptionalBoolean, parseOptionalInt, parseEnum } from "../common/utils.js";
import { parseBaseOptions, handleRouteError, validateUsername, SORT_VALUES } from "./shared.js";
import type { GridCardOptions } from "../types/card.js";

export const gridRoute = new Hono();

gridRoute.get("/", async (c) => {
  try {
    const base = parseBaseOptions(c);
    validateUsername(base.username);

    const options: GridCardOptions = {
      ...base,
      columns: parseOptionalInt(c.req.query("columns")),
      rows: parseOptionalInt(c.req.query("rows")),
      badge_size: parseOptionalInt(c.req.query("badge_size")),
      show_name: parseOptionalBoolean(c.req.query("show_name")),
      show_issuer: parseOptionalBoolean(c.req.query("show_issuer")),
      sort: parseEnum(c.req.query("sort"), SORT_VALUES),
      filter_issuer: c.req.query("filter_issuer"),
      filter_skill: c.req.query("filter_skill"),
      card_width: parseOptionalInt(c.req.query("card_width")),
      page: parseOptionalInt(c.req.query("page")),
    };

    const { badges, displayName } = await getUserBadgeData(base.username);
    const hydratedBadges = await hydrateBadgeImages(badges);
    const svg = renderGridCard(hydratedBadges, {
      ...options,
      custom_title: options.custom_title ?? `${displayName}'s Badges`,
    });

    setCacheHeaders(c, resolveCacheSeconds(options.cache_seconds));
    c.header("Content-Type", "image/svg+xml");
    return c.body(svg);
  } catch (err) {
    return handleRouteError(err, c);
  }
});
