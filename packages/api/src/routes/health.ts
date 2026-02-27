import { Hono } from "hono";
import { badgeCache, imageCache } from "../cache/index.js";

export const healthRoute = new Hono();

const startTime = Date.now();

healthRoute.get("/", (c) => {
  return c.json({
    status: "ok",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    cache: {
      badges: badgeCache.getStats(),
      images: imageCache.getStats(),
    },
  });
});
