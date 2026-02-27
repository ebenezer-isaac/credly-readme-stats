import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { statsRoute } from "./routes/stats.js";
import { gridRoute } from "./routes/grid.js";
import { timelineRoute } from "./routes/timeline.js";
import { badgeRoute } from "./routes/badge.js";
import { carouselRoute } from "./routes/carousel.js";
import { overviewRoute } from "./routes/overview.js";
import { healthRoute } from "./routes/health.js";
import { createRateLimiter } from "./middleware/rateLimiter.js";

const app = new Hono();

// Global middleware
app.use("*", cors());
app.use("/api/*", createRateLimiter());

// API routes
app.route("/api/stats", statsRoute);
app.route("/api/grid", gridRoute);
app.route("/api/timeline", timelineRoute);
app.route("/api/badge", badgeRoute);
app.route("/api/carousel", carouselRoute);
app.route("/api/overview", overviewRoute);
app.route("/health", healthRoute);

// Static landing page (Astro build output)
// Hashed assets (_astro/*) get long-term cache; serveStatic calls next() on miss
app.use(
  "/_astro/*",
  serveStatic({
    root: "packages/web/dist",
    onFound: (_path, c) => {
      c.header("Cache-Control", "public, max-age=31536000, immutable");
    },
  }),
);
app.use("/*", serveStatic({ root: "packages/web/dist" }));
// SPA fallback — serves index.html for any unmatched non-API route
app.use("/*", serveStatic({ root: "packages/web/dist", path: "index.html" }));

const port = parseInt(process.env["PORT"] ?? "3000", 10);

// eslint-disable-next-line no-console -- startup log
console.log(`credly-readme-stats running on port ${port}`);

serve({ fetch: app.fetch, port });

export { app };
