import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { assertValidSvg } from "../helpers/testUtils.js";
import { createMockBadges, createMockStats } from "../fixtures/mockBadges.js";
import type { NormalizedBadge } from "../../src/types/card.js";

// Mock the data fetchers to avoid real HTTP calls
vi.mock("../../src/fetchers/credlyFetcher.js", () => ({
  getUserBadgeData: vi.fn().mockResolvedValue({
    badges: createMockBadges(),
    stats: createMockStats(),
    displayName: "Test User",
  }),
}));

vi.mock("../../src/fetchers/imageFetcher.js", () => ({
  hydrateBadgeImages: vi.fn().mockImplementation((badges: readonly NormalizedBadge[]) =>
    Promise.resolve(
      badges.map((b) => ({
        ...b,
        imageBase64: "data:image/png;base64,iVBORw0KGgo=",
      })),
    ),
  ),
}));

vi.mock("../../src/cache/badgeCache.js", () => ({
  badgeCache: { get: vi.fn(), set: vi.fn(), getStats: vi.fn(() => ({})) },
}));

vi.mock("../../src/cache/imageCache.js", () => ({
  imageCache: { get: vi.fn(), set: vi.fn(), getStats: vi.fn(() => ({})) },
}));

// Now import the routes
const { statsRoute } = await import("../../src/routes/stats.js");
const { gridRoute } = await import("../../src/routes/grid.js");
const { timelineRoute } = await import("../../src/routes/timeline.js");
const { badgeRoute } = await import("../../src/routes/badge.js");
const { carouselRoute } = await import("../../src/routes/carousel.js");
const { overviewRoute } = await import("../../src/routes/overview.js");
const { healthRoute } = await import("../../src/routes/health.js");

function createApp() {
  const app = new Hono();
  app.route("/api/stats", statsRoute);
  app.route("/api/grid", gridRoute);
  app.route("/api/timeline", timelineRoute);
  app.route("/api/badge", badgeRoute);
  app.route("/api/carousel", carouselRoute);
  app.route("/api/overview", overviewRoute);
  app.route("/health", healthRoute);
  return app;
}

describe("Route Integration Tests", () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = createApp();
  });

  describe("GET /api/stats", () => {
    it("returns SVG with valid username", async () => {
      const res = await app.request("/api/stats?username=testuser");
      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toBe("image/svg+xml; charset=utf-8");
      assertValidSvg(await res.text());
    });

    it("returns error SVG for missing username", async () => {
      const res = await app.request("/api/stats");
      expect(res.status).toBe(400);
      expect(res.headers.get("Content-Type")).toBe("image/svg+xml; charset=utf-8");
      assertValidSvg(await res.text());
    });

    it("returns error SVG for invalid username", async () => {
      const res = await app.request("/api/stats?username=-invalid");
      expect(res.status).toBe(400);
      assertValidSvg(await res.text());
    });

    it("sets Cache-Control headers", async () => {
      const res = await app.request("/api/stats?username=testuser");
      expect(res.headers.get("Cache-Control")).toContain("max-age=");
    });

    it("applies theme parameter", async () => {
      const res = await app.request("/api/stats?username=testuser&theme=dark");
      expect(res.status).toBe(200);
      const svg = await res.text();
      assertValidSvg(svg);
    });

    it("respects hide parameter", async () => {
      const res = await app.request("/api/stats?username=testuser&hide=total,issuers");
      const svg = await res.text();
      expect(svg).not.toContain("Total Badges");
      expect(svg).not.toContain("Unique Issuers");
    });

    it("respects custom_title parameter", async () => {
      const res = await app.request("/api/stats?username=testuser&custom_title=My+Stats");
      const svg = await res.text();
      expect(svg).toContain("My Stats");
    });
  });

  describe("GET /api/grid", () => {
    it("returns SVG with valid username", async () => {
      const res = await app.request("/api/grid?username=testuser");
      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toBe("image/svg+xml; charset=utf-8");
      assertValidSvg(await res.text());
    });

    it("returns error SVG for missing username", async () => {
      const res = await app.request("/api/grid");
      expect(res.status).toBe(400);
      assertValidSvg(await res.text());
    });

    it("accepts grid-specific parameters", async () => {
      const res = await app.request(
        "/api/grid?username=testuser&columns=4&rows=3&badge_size=96&sort=name",
      );
      expect(res.status).toBe(200);
      assertValidSvg(await res.text());
    });

    it("handles filter parameters", async () => {
      const res = await app.request("/api/grid?username=testuser&filter_issuer=AWS");
      expect(res.status).toBe(200);
      assertValidSvg(await res.text());
    });
  });

  describe("GET /api/timeline", () => {
    it("returns SVG with valid username", async () => {
      const res = await app.request("/api/timeline?username=testuser");
      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toBe("image/svg+xml; charset=utf-8");
      assertValidSvg(await res.text());
    });

    it("returns error SVG for missing username", async () => {
      const res = await app.request("/api/timeline");
      expect(res.status).toBe(400);
      assertValidSvg(await res.text());
    });

    it("accepts timeline-specific parameters", async () => {
      const res = await app.request(
        "/api/timeline?username=testuser&max_items=3&sort=oldest&show_description=true",
      );
      expect(res.status).toBe(200);
      assertValidSvg(await res.text());
    });
  });

  describe("GET /api/badge", () => {
    it("returns SVG with valid username and badge_id", async () => {
      const res = await app.request("/api/badge?username=testuser&badge_id=badge-001");
      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toBe("image/svg+xml; charset=utf-8");
      assertValidSvg(await res.text());
    });

    it("returns error SVG for missing username", async () => {
      const res = await app.request("/api/badge?badge_id=123");
      expect(res.status).toBe(400);
      assertValidSvg(await res.text());
    });

    it("returns error SVG for missing badge_id", async () => {
      const res = await app.request("/api/badge?username=testuser");
      expect(res.status).toBe(404);
      assertValidSvg(await res.text());
    });

    it("returns error SVG for non-existent badge_id", async () => {
      const res = await app.request("/api/badge?username=testuser&badge_id=nonexistent");
      expect(res.status).toBe(404);
      assertValidSvg(await res.text());
    });
  });

  describe("GET /api/carousel", () => {
    it("returns SVG with valid username", async () => {
      const res = await app.request("/api/carousel?username=testuser");
      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toBe("image/svg+xml; charset=utf-8");
      assertValidSvg(await res.text());
    });

    it("returns error SVG for missing username", async () => {
      const res = await app.request("/api/carousel");
      expect(res.status).toBe(400);
      assertValidSvg(await res.text());
    });

    it("accepts carousel-specific parameters", async () => {
      const res = await app.request(
        "/api/carousel?username=testuser&visible_count=4&badge_size=96&interval=5&sort=name",
      );
      expect(res.status).toBe(200);
      assertValidSvg(await res.text());
    });
  });

  describe("GET /api/overview", () => {
    it("returns SVG with valid username", async () => {
      const res = await app.request("/api/overview?username=testuser");
      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toBe("image/svg+xml; charset=utf-8");
      assertValidSvg(await res.text());
    });

    it("returns error SVG for missing username", async () => {
      const res = await app.request("/api/overview");
      expect(res.status).toBe(400);
      assertValidSvg(await res.text());
    });

    it("contains both stats and carousel content", async () => {
      const res = await app.request("/api/overview?username=testuser");
      const svg = await res.text();
      expect(svg).toContain("Total Badges");
      expect(svg).toContain("clip-path");
    });

    it("accepts overview-specific parameters", async () => {
      const res = await app.request(
        "/api/overview?username=testuser&visible_count=2&hide=expiring&interval=5",
      );
      expect(res.status).toBe(200);
      assertValidSvg(await res.text());
    });
  });

  describe("GET /health", () => {
    it("returns JSON health status", async () => {
      const res = await app.request("/health");
      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toContain("application/json");
      const body = await res.json();
      expect(body).toHaveProperty("status", "ok");
    });
  });

  describe("error responses", () => {
    it("all error cards are valid SVG", async () => {
      const errorRequests = [
        "/api/stats",
        "/api/stats?username=-",
        "/api/grid",
        "/api/timeline",
        "/api/badge",
        "/api/badge?username=testuser",
        "/api/carousel",
        "/api/overview",
      ];

      for (const path of errorRequests) {
        const res = await app.request(path);
        const body = await res.text();
        if (res.headers.get("Content-Type") === "image/svg+xml; charset=utf-8") {
          assertValidSvg(body);
        }
      }
    });
  });
});
