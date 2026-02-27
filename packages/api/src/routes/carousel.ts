import { Hono } from "hono";
import { renderCarouselCard } from "../cards/CarouselCard.js";
import { getUserBadgeData } from "../fetchers/credlyFetcher.js";
import { hydrateBadgeImages } from "../fetchers/imageFetcher.js";
import { setCacheHeaders, resolveCacheSeconds } from "../middleware/index.js";
import { parseOptionalBoolean, parseOptionalInt, parseEnum } from "../common/utils.js";
import { parseBaseOptions, handleRouteError, validateUsername, SORT_VALUES } from "./shared.js";
import type { CarouselCardOptions } from "../types/card.js";

export const carouselRoute = new Hono();

carouselRoute.get("/", async (c) => {
  try {
    const base = parseBaseOptions(c);
    validateUsername(base.username);

    const options: CarouselCardOptions = {
      ...base,
      visible_count: parseOptionalInt(c.req.query("visible_count")),
      badge_size: parseOptionalInt(c.req.query("badge_size")),
      show_name: parseOptionalBoolean(c.req.query("show_name")),
      show_issuer: parseOptionalBoolean(c.req.query("show_issuer")),
      interval: parseOptionalInt(c.req.query("interval")),
      sort: parseEnum(c.req.query("sort"), SORT_VALUES),
      filter_issuer: c.req.query("filter_issuer"),
      filter_skill: c.req.query("filter_skill"),
      card_width: parseOptionalInt(c.req.query("card_width")),
      max_items: parseOptionalInt(c.req.query("max_items")),
    };

    const { badges, displayName, profileUrl } = await getUserBadgeData(base.username);
    const hydratedBadges = await hydrateBadgeImages(badges);
    const svg = renderCarouselCard(hydratedBadges, {
      ...options,
      custom_title: options.custom_title ?? `${displayName}'s Badge Carousel`,
      profile_url: profileUrl,
    });

    setCacheHeaders(c, resolveCacheSeconds(options.cache_seconds));
    c.header("Content-Type", "image/svg+xml");
    return c.body(svg);
  } catch (err) {
    return handleRouteError(err, c);
  }
});
