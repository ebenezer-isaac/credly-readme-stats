import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
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

// Routes
app.route("/api/stats", statsRoute);
app.route("/api/grid", gridRoute);
app.route("/api/timeline", timelineRoute);
app.route("/api/badge", badgeRoute);
app.route("/api/carousel", carouselRoute);
app.route("/api/overview", overviewRoute);
app.route("/health", healthRoute);

// Root redirect
app.get("/", (c) => {
  return c.json({
    name: "credly-readme-stats",
    version: "1.0.0",
    docs: "https://github.com/ebenezer-isaac/credly-readme-stats",
    endpoints: {
      stats: "/api/stats?username=YOUR_USERNAME",
      grid: "/api/grid?username=YOUR_USERNAME",
      timeline: "/api/timeline?username=YOUR_USERNAME",
      badge: "/api/badge?username=YOUR_USERNAME&badge_id=BADGE_ID",
      carousel: "/api/carousel?username=YOUR_USERNAME",
      overview: "/api/overview?username=YOUR_USERNAME",
      health: "/health",
    },
  });
});

const port = parseInt(process.env["PORT"] ?? "3000", 10);

console.log(`credly-readme-stats running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });

export { app };
