import { Hono } from "hono";
import { renderCarouselCard } from "../cards/CarouselCard.js";
import { getUserBadgeData } from "../fetchers/credlyFetcher.js";
import { hydrateBadgeImages } from "../fetchers/imageFetcher.js";
import { AppError, setCacheHeaders, resolveCacheSeconds } from "../middleware/index.js";
import { isValidUsername, parseOptionalBoolean, parseOptionalInt, parseEnum } from "../common/utils.js";
import { parseBaseOptions, handleRouteError } from "./shared.js";
import type { CarouselCardOptions } from "../types/card.js";

const CAROUSEL_SORT_VALUES = ["recent", "oldest", "name", "issuer"] as const;

export const carouselRoute = new Hono();

carouselRoute.get("/", async (c) => {
  try {
    const base = parseBaseOptions(c);
    if (!base.username || !isValidUsername(base.username)) {
      throw new AppError("INVALID_USERNAME", `Invalid username: "${base.username}"`);
    }

    const options: CarouselCardOptions = {
      ...base,
      visible_count: parseOptionalInt(c.req.query("visible_count")),
      badge_size: parseOptionalInt(c.req.query("badge_size")),
      show_name: parseOptionalBoolean(c.req.query("show_name")),
      show_issuer: parseOptionalBoolean(c.req.query("show_issuer")),
      interval: parseOptionalInt(c.req.query("interval")),
      sort: parseEnum(c.req.query("sort"), CAROUSEL_SORT_VALUES),
      filter_issuer: c.req.query("filter_issuer"),
      filter_skill: c.req.query("filter_skill"),
      card_width: parseOptionalInt(c.req.query("card_width")),
      max_items: parseOptionalInt(c.req.query("max_items")),
    };

    const { badges, displayName } = await getUserBadgeData(base.username);
    const hydratedBadges = await hydrateBadgeImages(badges);
    const svg = renderCarouselCard(hydratedBadges, {
      ...options,
      custom_title: options.custom_title ?? `${displayName}'s Badge Carousel`,
    });

    setCacheHeaders(c, resolveCacheSeconds(options.cache_seconds));
    c.header("Content-Type", "image/svg+xml");
    return c.body(svg);
  } catch (err) {
    return handleRouteError(err, c);
  }
});
