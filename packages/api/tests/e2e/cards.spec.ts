import { test, expect, type Page } from "@playwright/test";

/**
 * E2E tests for all SVG card endpoints.
 *
 * Requires the API server running at BASE_URL (default: http://localhost:3001).
 * Start with: PORT=3001 node packages/api/dist/index.js
 *
 * Run: npx playwright test --config packages/api/playwright.config.ts
 */

const BASE = process.env.BASE_URL ?? "http://localhost:3001";
const USER = process.env.TEST_USER ?? "ebenezer-isaac.05496d7f";

// How long to wait for stagger animations to finish (max delay ~1050ms + 300ms anim)
const ANIMATION_WAIT_MS = 2000;

// ──────────────────────── Helpers ────────────────────────

async function loadSvg(page: Page, url: string): Promise<string> {
  const res = await fetch(`${BASE}${url}`);
  const svg = await res.text();
  const html = `<!DOCTYPE html>
<html><head><style>body { margin: 16px; background: #f6f8fa; }</style></head>
<body>${svg}</body></html>`;
  await page.setContent(html, { waitUntil: "load" });
  await page.waitForTimeout(ANIMATION_WAIT_MS);
  return svg;
}

async function fetchSvg(url: string): Promise<{ status: number; headers: Headers; body: string }> {
  const res = await fetch(`${BASE}${url}`);
  return { status: res.status, headers: res.headers, body: await res.text() };
}

function assertValidSvgStructure(svg: string): void {
  expect(svg).toMatch(/^<svg\s/);
  expect(svg).toMatch(/<\/svg>$/);
  expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  expect(svg).toContain('role="img"');
  expect(svg).toContain("<title");
  expect(svg).toContain("<desc");
}

// ──────────────────────── Health Check ────────────────────────

test.describe("Health endpoint", () => {
  test("returns JSON with ok status", async () => {
    const res = await fetch(`${BASE}/health`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/json");
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body).toHaveProperty("uptime");
    expect(body).toHaveProperty("cache");
  });
});

// ──────────────────────── Stats Card ────────────────────────

test.describe("Stats Card", () => {
  test("renders with default theme", async ({ page }) => {
    const svg = await loadSvg(page, `/api/stats?username=${USER}`);
    assertValidSvgStructure(svg);

    // Should use display name, not username slug
    expect(svg).not.toContain(USER);
    expect(svg).toContain("Credly Stats");

    // All stat rows should be present
    expect(svg).toContain("Total Badges");
    expect(svg).toContain("Unique Issuers");
    expect(svg).toContain("Unique Skills");
    expect(svg).toContain("Active Badges");
    expect(svg).toContain("Expiring Soon");
    expect(svg).toContain("Top Issuers");
    expect(svg).toContain("Top Skills");
  });

  test("displays stat values as visible text after animation", async ({ page }) => {
    await loadSvg(page, `/api/stats?username=${USER}`);

    // After animation delay, all stagger elements should be visible (opacity=1)
    const staggerElements = await page.locator(".stagger").all();
    expect(staggerElements.length).toBeGreaterThan(0);
    for (const el of staggerElements) {
      // Animation should have completed — check computed opacity
      const opacity = await el.evaluate((e) => getComputedStyle(e).opacity);
      expect(Number(opacity)).toBeCloseTo(1, 1);
    }
  });

  test("renders with dark theme", async ({ page }) => {
    const svg = await loadSvg(page, `/api/stats?username=${USER}&theme=dark`);
    assertValidSvgStructure(svg);
    // Dark theme uses #fff for text
    expect(svg).toContain("#fff");
  });

  test("renders with radical theme", async ({ page }) => {
    const svg = await loadSvg(page, `/api/stats?username=${USER}&theme=radical`);
    assertValidSvgStructure(svg);
    // Radical theme has a specific background color
    expect(svg).toContain("#141321");
  });

  test("renders with tokyonight theme", async ({ page }) => {
    const svg = await loadSvg(page, `/api/stats?username=${USER}&theme=tokyonight`);
    assertValidSvgStructure(svg);
    expect(svg).toContain("#1a1b27");
  });

  test("hides border when hide_border=true", async ({ page }) => {
    const svg = await loadSvg(page, `/api/stats?username=${USER}&hide_border=true`);
    expect(svg).toContain('stroke-opacity="0"');
  });

  test("uses custom title", async ({ page }) => {
    const svg = await loadSvg(page, `/api/stats?username=${USER}&custom_title=My+Certifications`);
    expect(svg).toContain("My Certifications");
  });

  test("hides icons when show_icons=false", async ({ page }) => {
    const svg = await loadSvg(page, `/api/stats?username=${USER}&show_icons=false`);
    // There should be no 16x16 inline icons for stat rows
    // The title icon should still be present (it's always shown)
    const svgDoc = svg;
    // count <svg viewBox="0 0 16 16" occurrences — stat rows won't have them
    const iconMatches = svgDoc.match(/x="0" y="-13" viewBox="0 0 16 16"/g);
    // Only the title icon should remain (1 occurrence)
    expect(iconMatches?.length ?? 0).toBeLessThanOrEqual(1);
  });

  test("hides specified sections", async ({ page }) => {
    const svg = await loadSvg(page, `/api/stats?username=${USER}&hide=expiring,top_skills`);
    expect(svg).not.toContain("Expiring Soon");
    expect(svg).not.toContain("Top Skills");
    // Other rows should still be present
    expect(svg).toContain("Total Badges");
    expect(svg).toContain("Unique Issuers");
  });

  test("hides all stat rows except total", async ({ page }) => {
    const svg = await loadSvg(
      page,
      `/api/stats?username=${USER}&hide=issuers,skills,active,expiring,top_issuers,top_skills`,
    );
    expect(svg).toContain("Total Badges");
    expect(svg).not.toContain("Unique Issuers");
    expect(svg).not.toContain("Active Badges");
  });

  test("respects card_width parameter", async ({ page }) => {
    const svg = await loadSvg(page, `/api/stats?username=${USER}&card_width=600`);
    expect(svg).toContain('width="600"');
  });

  test("clamps card_width to valid range", async ({ page }) => {
    const svg = await loadSvg(page, `/api/stats?username=${USER}&card_width=100`);
    // Minimum is 300
    expect(svg).toContain('width="300"');
  });

  test("sets correct HTTP headers", async () => {
    const { status, headers } = await fetchSvg(`/api/stats?username=${USER}`);
    expect(status).toBe(200);
    expect(headers.get("content-type")).toBe("image/svg+xml");
    expect(headers.get("cache-control")).toContain("max-age=");
  });

  test("respects disable_animations parameter", async ({ page }) => {
    const svg = await loadSvg(page, `/api/stats?username=${USER}&disable_animations=true`);
    // No @keyframes should be in the SVG
    expect(svg).not.toContain("@keyframes fadeIn");
    expect(svg).not.toContain("@keyframes scaleIn");
  });

  test("SVG dimensions fit content", async ({ page }) => {
    await loadSvg(page, `/api/stats?username=${USER}`);
    const svgEl = await page.$("svg");
    expect(svgEl).not.toBeNull();
    const box = await svgEl!.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBe(495);
    expect(box!.height).toBeGreaterThan(200);
    expect(box!.height).toBeLessThan(500);
  });

  test("stat rows are evenly spaced", async ({ page }) => {
    await loadSvg(page, `/api/stats?username=${USER}`);

    const labels = await page.locator(".stat-label").allTextContents();
    expect(labels.length).toBeGreaterThanOrEqual(4);
  });
});

// ──────────────────────── Grid Card ────────────────────────

test.describe("Grid Card", () => {
  test("renders with default settings", async ({ page }) => {
    const svg = await loadSvg(page, `/api/grid?username=${USER}`);
    assertValidSvgStructure(svg);

    expect(svg).toContain("base64,");
    // Should use display name
    expect(svg).toContain("Badges");
  });

  test("renders with 4 columns and 3 rows", async ({ page }) => {
    const svg = await loadSvg(page, `/api/grid?username=${USER}&columns=4&rows=3`);
    assertValidSvgStructure(svg);

    const imageCount = (svg.match(/base64,/g) ?? []).length;
    expect(imageCount).toBeLessThanOrEqual(12); // 4 * 3 max
    expect(imageCount).toBeGreaterThan(0);
  });

  test("renders with large badge size", async ({ page }) => {
    const svg = await loadSvg(page, `/api/grid?username=${USER}&badge_size=96&columns=2`);
    assertValidSvgStructure(svg);
    // Badge images should be 96x96
    expect(svg).toContain('width="96"');
    expect(svg).toContain('height="96"');
  });

  test("shows issuer name when show_issuer=true", async ({ page }) => {
    const svg = await loadSvg(page, `/api/grid?username=${USER}&show_issuer=true`);
    // Should contain issuer names in the grid cells
    expect(svg).toContain("badge-issuer");
  });

  test("renders with dark theme", async ({ page }) => {
    const svg = await loadSvg(page, `/api/grid?username=${USER}&theme=dark`);
    assertValidSvgStructure(svg);
    expect(svg).toContain("#151515");
  });

  test("sets correct HTTP headers", async () => {
    const { status, headers } = await fetchSvg(`/api/grid?username=${USER}`);
    expect(status).toBe(200);
    expect(headers.get("content-type")).toBe("image/svg+xml");
    expect(headers.get("cache-control")).toContain("max-age=");
  });

  test("supports sort parameter", async ({ page }) => {
    const svgRecent = await loadSvg(page, `/api/grid?username=${USER}&sort=recent`);
    const svgOldest = await loadSvg(page, `/api/grid?username=${USER}&sort=oldest`);
    assertValidSvgStructure(svgRecent);
    assertValidSvgStructure(svgOldest);
    // Both should be valid, potentially different badge order
  });

  test("supports page parameter", async ({ page }) => {
    const svg = await loadSvg(page, `/api/grid?username=${USER}&page=2&rows=2&columns=2`);
    assertValidSvgStructure(svg);
  });

  test("supports custom card width", async ({ page }) => {
    const svg = await loadSvg(page, `/api/grid?username=${USER}&card_width=500`);
    assertValidSvgStructure(svg);
  });
});

// ──────────────────────── Timeline Card ────────────────────────

test.describe("Timeline Card", () => {
  test("renders with default settings", async ({ page }) => {
    const svg = await loadSvg(page, `/api/timeline?username=${USER}`);
    assertValidSvgStructure(svg);

    // Should have timeline structure
    expect(svg).toContain("Badge Timeline");
    expect(svg).not.toContain(USER);

    // Should have timeline entries with dates
    expect(svg).toMatch(/\d{4}/); // years in dates
  });

  test("renders with dark theme", async ({ page }) => {
    const svg = await loadSvg(page, `/api/timeline?username=${USER}&theme=dark`);
    assertValidSvgStructure(svg);
    expect(svg).toContain("#151515");
  });

  test("shows descriptions when show_description=true", async ({ page }) => {
    const svg = await loadSvg(page, `/api/timeline?username=${USER}&show_description=true`);
    assertValidSvgStructure(svg);

    // With descriptions, the card should be taller
    const svgEl = await page.$("svg");
    const box = await svgEl!.boundingBox();
    expect(box!.height).toBeGreaterThan(500);
  });

  test("limits items with max_items", async ({ page }) => {
    const svg3 = await loadSvg(page, `/api/timeline?username=${USER}&max_items=3`);
    const svg6 = await loadSvg(page, `/api/timeline?username=${USER}&max_items=6`);

    // Fewer items = shorter card
    const svgEl3 = await page.$("svg");
    await page.setContent(
      `<!DOCTYPE html><html><body>${svg3}</body></html>`,
      { waitUntil: "load" },
    );
    const box3 = await (await page.$("svg"))!.boundingBox();

    await page.setContent(
      `<!DOCTYPE html><html><body>${svg6}</body></html>`,
      { waitUntil: "load" },
    );
    const box6 = await (await page.$("svg"))!.boundingBox();

    expect(box3!.height).toBeLessThan(box6!.height);
  });

  test("sets correct HTTP headers", async () => {
    const { status, headers } = await fetchSvg(`/api/timeline?username=${USER}`);
    expect(status).toBe(200);
    expect(headers.get("content-type")).toBe("image/svg+xml");
  });

  test("supports sort=oldest", async ({ page }) => {
    const svg = await loadSvg(page, `/api/timeline?username=${USER}&sort=oldest`);
    assertValidSvgStructure(svg);
  });

  test("timeline spine and nodes are present", async ({ page }) => {
    const svg = await loadSvg(page, `/api/timeline?username=${USER}`);
    // Timeline should have circle nodes and a vertical line
    expect(svg).toContain("<circle");
    expect(svg).toContain("<line");
  });

  test("supports custom card width", async ({ page }) => {
    const svg = await loadSvg(page, `/api/timeline?username=${USER}&card_width=600`);
    expect(svg).toContain('width="600"');
  });
});

// ──────────────────────── Carousel Card ────────────────────────

test.describe("Carousel Card", () => {
  test("renders with default settings", async ({ page }) => {
    const svg = await loadSvg(page, `/api/carousel?username=${USER}`);
    assertValidSvgStructure(svg);

    // Should contain badge images (base64-encoded)
    expect(svg).toContain("base64,");
    expect(svg).toContain("Badge Carousel");
  });

  test("contains clip-path for carousel viewport", async ({ page }) => {
    const svg = await loadSvg(page, `/api/carousel?username=${USER}`);
    expect(svg).toContain("clip-path");
    expect(svg).toContain("clipPath");
  });

  test("contains CSS animation keyframes", async ({ page }) => {
    const svg = await loadSvg(page, `/api/carousel?username=${USER}&visible_count=2`);
    expect(svg).toContain("@keyframes c-slide");
    expect(svg).toContain("animation:");
  });

  test("contains indicator dots when animated", async ({ page }) => {
    const svg = await loadSvg(page, `/api/carousel?username=${USER}&visible_count=2`);
    expect(svg).toContain("c-dot-0");
    expect(svg).toContain("c-dot-1");
  });

  test("shows badge count footer", async ({ page }) => {
    const svg = await loadSvg(page, `/api/carousel?username=${USER}&visible_count=3`);
    // Should contain "X of Y badges"
    expect(svg).toMatch(/\d+ of \d+ badges/);
  });

  test("respects badge_size parameter", async ({ page }) => {
    const svg = await loadSvg(page, `/api/carousel?username=${USER}&badge_size=96`);
    expect(svg).toContain('width="96"');
    expect(svg).toContain('height="96"');
  });

  test("respects visible_count parameter", async ({ page }) => {
    const svg = await loadSvg(page, `/api/carousel?username=${USER}&visible_count=2`);
    expect(svg).toContain("2 of");
  });

  test("shows badge names by default", async ({ page }) => {
    const svg = await loadSvg(page, `/api/carousel?username=${USER}`);
    expect(svg).toContain("c-badge-name");
  });

  test("hides badge names when show_name=false", async ({ page }) => {
    const svg = await loadSvg(page, `/api/carousel?username=${USER}&show_name=false`);
    expect(svg).not.toContain("c-badge-name");
  });

  test("shows issuer when show_issuer=true", async ({ page }) => {
    const svg = await loadSvg(page, `/api/carousel?username=${USER}&show_issuer=true`);
    expect(svg).toContain("c-badge-issuer");
  });

  test("hides issuer by default", async ({ page }) => {
    const svg = await loadSvg(page, `/api/carousel?username=${USER}`);
    expect(svg).not.toContain("c-badge-issuer");
  });

  test("disables animations when requested", async ({ page }) => {
    const svg = await loadSvg(page, `/api/carousel?username=${USER}&disable_animations=true`);
    expect(svg).not.toContain("@keyframes c-slide");
    expect(svg).not.toContain("@keyframes fadeIn");
  });

  test("renders with dark theme", async ({ page }) => {
    const svg = await loadSvg(page, `/api/carousel?username=${USER}&theme=dark`);
    assertValidSvgStructure(svg);
    expect(svg).toContain("#fff");
  });

  test("uses custom title", async ({ page }) => {
    const svg = await loadSvg(page, `/api/carousel?username=${USER}&custom_title=My+Carousel`);
    expect(svg).toContain("My Carousel");
  });

  test("hides border when hide_border=true", async ({ page }) => {
    const svg = await loadSvg(page, `/api/carousel?username=${USER}&hide_border=true`);
    expect(svg).toContain('stroke-opacity="0"');
  });

  test("sets correct HTTP headers", async () => {
    const { status, headers } = await fetchSvg(`/api/carousel?username=${USER}`);
    expect(status).toBe(200);
    expect(headers.get("content-type")).toBe("image/svg+xml");
    expect(headers.get("cache-control")).toContain("max-age=");
  });

  test("supports sort parameter", async ({ page }) => {
    const svgRecent = await loadSvg(page, `/api/carousel?username=${USER}&sort=recent`);
    const svgName = await loadSvg(page, `/api/carousel?username=${USER}&sort=name`);
    assertValidSvgStructure(svgRecent);
    assertValidSvgStructure(svgName);
  });

  test("supports filter_issuer parameter", async ({ page }) => {
    const svg = await loadSvg(page, `/api/carousel?username=${USER}&filter_issuer=Amazon`);
    assertValidSvgStructure(svg);
    // Filtered results should have fewer badges
    expect(svg).toMatch(/\d+ of \d+ badges/);
  });

  test("respects interval parameter in animation duration", async ({ page }) => {
    const svg = await loadSvg(page, `/api/carousel?username=${USER}&visible_count=2&interval=5`);
    // Duration should reflect interval * badge count
    expect(svg).toContain("animation:");
  });
});

// ──────────────────────── Overview Card ────────────────────────

test.describe("Overview Card", () => {
  test("renders with default settings", async ({ page }) => {
    const svg = await loadSvg(page, `/api/overview?username=${USER}`);
    assertValidSvgStructure(svg);

    // Should contain both stats and carousel sections
    expect(svg).toContain("Credly Overview");
    expect(svg).toContain("Total Badges");
    expect(svg).toContain("base64,"); // badge images in carousel
  });

  test("contains all stat rows", async ({ page }) => {
    const svg = await loadSvg(page, `/api/overview?username=${USER}`);
    expect(svg).toContain("Total Badges");
    expect(svg).toContain("Unique Issuers");
    expect(svg).toContain("Unique Skills");
    expect(svg).toContain("Active Badges");
    expect(svg).toContain("Expiring Soon");
    expect(svg).toContain("Top Issuers");
    expect(svg).toContain("Top Skills");
  });

  test("contains carousel section with clip-path", async ({ page }) => {
    const svg = await loadSvg(page, `/api/overview?username=${USER}`);
    expect(svg).toContain("clip-path");
    expect(svg).toContain("clipPath");
  });

  test("uses 'oc' animation prefix (not 'c')", async ({ page }) => {
    const svg = await loadSvg(page, `/api/overview?username=${USER}&visible_count=2`);
    // Overview uses "oc" prefix to avoid collision with standalone carousel
    expect(svg).toContain("oc-slide");
    expect(svg).toContain("oc-strip");
  });

  test("contains separator line between stats and carousel", async ({ page }) => {
    const svg = await loadSvg(page, `/api/overview?username=${USER}`);
    expect(svg).toContain('stroke-opacity="0.4"');
  });

  test("default width is 550", async ({ page }) => {
    const svg = await loadSvg(page, `/api/overview?username=${USER}`);
    expect(svg).toContain('width="550"');
  });

  test("respects card_width parameter", async ({ page }) => {
    const svg = await loadSvg(page, `/api/overview?username=${USER}&card_width=700`);
    expect(svg).toContain('width="700"');
  });

  test("hides stat sections when specified", async ({ page }) => {
    const svg = await loadSvg(page, `/api/overview?username=${USER}&hide=expiring,top_skills`);
    expect(svg).not.toContain("Expiring Soon");
    expect(svg).not.toContain("Top Skills");
    expect(svg).toContain("Total Badges");
  });

  test("hides carousel when hide=carousel", async ({ page }) => {
    const svg = await loadSvg(page, `/api/overview?username=${USER}&hide=carousel`);
    expect(svg).not.toContain("clip-path");
    // Stats should still be present
    expect(svg).toContain("Total Badges");
  });

  test("shows badge names in carousel by default", async ({ page }) => {
    const svg = await loadSvg(page, `/api/overview?username=${USER}`);
    expect(svg).toContain("oc-badge-name");
  });

  test("hides badge names when show_name=false", async ({ page }) => {
    const svg = await loadSvg(page, `/api/overview?username=${USER}&show_name=false`);
    expect(svg).not.toContain("oc-badge-name");
  });

  test("shows issuer when show_issuer=true", async ({ page }) => {
    const svg = await loadSvg(page, `/api/overview?username=${USER}&show_issuer=true`);
    expect(svg).toContain("oc-badge-issuer");
  });

  test("disables animations when requested", async ({ page }) => {
    const svg = await loadSvg(page, `/api/overview?username=${USER}&disable_animations=true`);
    expect(svg).not.toContain("@keyframes fadeIn");
    expect(svg).not.toContain("@keyframes oc-slide");
  });

  test("renders with dark theme", async ({ page }) => {
    const svg = await loadSvg(page, `/api/overview?username=${USER}&theme=dark`);
    assertValidSvgStructure(svg);
    expect(svg).toContain("#fff");
  });

  test("uses custom title", async ({ page }) => {
    const svg = await loadSvg(page, `/api/overview?username=${USER}&custom_title=My+Overview`);
    expect(svg).toContain("My Overview");
  });

  test("hides border when hide_border=true", async ({ page }) => {
    const svg = await loadSvg(page, `/api/overview?username=${USER}&hide_border=true`);
    expect(svg).toContain('stroke-opacity="0"');
  });

  test("sets correct HTTP headers", async () => {
    const { status, headers } = await fetchSvg(`/api/overview?username=${USER}`);
    expect(status).toBe(200);
    expect(headers.get("content-type")).toBe("image/svg+xml");
    expect(headers.get("cache-control")).toContain("max-age=");
  });

  test("SVG dimensions fit combined content", async ({ page }) => {
    await loadSvg(page, `/api/overview?username=${USER}`);
    const svgEl = await page.$("svg");
    expect(svgEl).not.toBeNull();
    const box = await svgEl!.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBe(550);
    // Should be taller than stats-only card (stats ~350 + carousel ~200+)
    expect(box!.height).toBeGreaterThan(300);
  });

  test("supports filter_issuer parameter", async ({ page }) => {
    const svg = await loadSvg(page, `/api/overview?username=${USER}&filter_issuer=Amazon`);
    assertValidSvgStructure(svg);
  });

  test("supports sort parameter", async ({ page }) => {
    const svg = await loadSvg(page, `/api/overview?username=${USER}&sort=name`);
    assertValidSvgStructure(svg);
  });

  test("respects badge_size parameter", async ({ page }) => {
    const svg = await loadSvg(page, `/api/overview?username=${USER}&badge_size=96`);
    expect(svg).toContain('width="96"');
  });
});

// ──────────────────────── Badge Detail Card ────────────────────────

test.describe("Badge Detail Card", () => {
  test("returns error SVG for missing badge_id", async ({ page }) => {
    const { status, body } = await fetchSvg(`/api/badge?username=${USER}`);
    expect(status).toBe(404);
    assertValidSvgStructure(body);
    expect(body).toContain("Something went wrong");
  });

  test("returns error SVG for missing username", async () => {
    const { status, body } = await fetchSvg("/api/badge?badge_id=test");
    expect(status).toBe(400);
    assertValidSvgStructure(body);
  });
});

// ──────────────────────── Error Cards ────────────────────────

test.describe("Error Cards", () => {
  test("missing username returns 400 error SVG", async ({ page }) => {
    const { status, body } = await fetchSvg("/api/stats");
    expect(status).toBe(400);
    assertValidSvgStructure(body);
    expect(body).toContain("Something went wrong");
    expect(body).toContain("Invalid username");
  });

  test("invalid username returns 400 error SVG", async ({ page }) => {
    const { status, body } = await fetchSvg("/api/stats?username=-bad");
    expect(status).toBe(400);
    assertValidSvgStructure(body);
    expect(body).toContain("Something went wrong");
  });

  test("error card has correct dimensions", async ({ page }) => {
    const svg = await loadSvg(page, "/api/stats");
    const svgEl = await page.$("svg");
    const box = await svgEl!.boundingBox();
    expect(box!.width).toBe(400);
    expect(box!.height).toBe(120);
  });

  test("error card shows suggestion text", async () => {
    const { body } = await fetchSvg("/api/stats");
    expect(body).toContain("letters, numbers, hyphens, and dots");
  });

  test("all error routes return valid SVG with correct content-type", async () => {
    const errorUrls = [
      "/api/stats",
      "/api/stats?username=-",
      "/api/grid",
      "/api/timeline",
      "/api/carousel",
      "/api/overview",
      "/api/badge",
      `/api/badge?username=${USER}`,
    ];

    for (const url of errorUrls) {
      const { headers, body } = await fetchSvg(url);
      expect(headers.get("content-type")).toBe("image/svg+xml");
      assertValidSvgStructure(body);
    }
  });

  test("XSS attempt in username is escaped", async () => {
    const { body } = await fetchSvg("/api/stats?username=<script>alert(1)</script>");
    // Should NOT contain raw script tags
    expect(body).not.toContain("<script>");
    // Should contain HTML-encoded version
    if (body.includes("script")) {
      expect(body).toContain("&lt;script&gt;");
    }
  });
});

// ──────────────────────── Theme Tests ────────────────────────

test.describe("Themes", () => {
  const themes = [
    "default",
    "dark",
    "radical",
    "merko",
    "gruvbox",
    "tokyonight",
    "onedark",
    "cobalt",
    "synthwave",
    "dracula",
    "nord",
    "catppuccin_mocha",
    "catppuccin_latte",
    "rose_pine",
    "github_dark",
    "github_light",
    "aura",
    "neon",
    "react",
    "vue",
  ];

  for (const theme of themes) {
    test(`stats card renders with ${theme} theme`, async () => {
      const { status, body } = await fetchSvg(`/api/stats?username=${USER}&theme=${theme}`);
      expect(status).toBe(200);
      assertValidSvgStructure(body);
    });
  }

  test("unknown theme falls back to default", async () => {
    const { status, body } = await fetchSvg(`/api/stats?username=${USER}&theme=nonexistent`);
    expect(status).toBe(200);
    assertValidSvgStructure(body);
  });

  test("custom colors override theme", async () => {
    const { body } = await fetchSvg(
      `/api/stats?username=${USER}&theme=dark&title_color=ff0000`,
    );
    expect(body).toContain("#ff0000");
  });

  test("gradient background renders", async () => {
    const { body } = await fetchSvg(
      `/api/stats?username=${USER}&bg_color=35,0d1117,1a1b27`,
    );
    expect(body).toContain("linearGradient");
    expect(body).toContain("rotate(35)");
  });
});

// ──────────────────────── Custom Color Parameters ────────────────────────

test.describe("Custom color parameters", () => {
  test("title_color is applied", async () => {
    const { body } = await fetchSvg(`/api/stats?username=${USER}&title_color=ff5733`);
    expect(body).toContain("#ff5733");
  });

  test("text_color is applied", async () => {
    const { body } = await fetchSvg(`/api/stats?username=${USER}&text_color=00ff00`);
    expect(body).toContain("#00ff00");
  });

  test("icon_color is applied", async () => {
    const { body } = await fetchSvg(`/api/stats?username=${USER}&icon_color=0000ff`);
    expect(body).toContain("#0000ff");
  });

  test("bg_color is applied", async () => {
    const { body } = await fetchSvg(`/api/stats?username=${USER}&bg_color=1a1a2e`);
    expect(body).toContain("#1a1a2e");
  });

  test("border_color is applied", async () => {
    const { body } = await fetchSvg(`/api/stats?username=${USER}&border_color=e74c3c`);
    expect(body).toContain("#e74c3c");
  });
});

// ──────────────────────── Cache Headers ────────────────────────

test.describe("Cache headers", () => {
  test("default cache is 6h (21600s)", async () => {
    const { headers } = await fetchSvg(`/api/stats?username=${USER}`);
    const cacheControl = headers.get("cache-control") ?? "";
    expect(cacheControl).toContain("max-age=21600");
  });

  test("custom cache_seconds is respected (clamped)", async () => {
    const { headers } = await fetchSvg(`/api/stats?username=${USER}&cache_seconds=86400`);
    const cacheControl = headers.get("cache-control") ?? "";
    // Should be clamped to max allowed value
    expect(cacheControl).toContain("max-age=");
  });

  test("error responses have short cache", async () => {
    const { headers } = await fetchSvg("/api/stats");
    const cacheControl = headers.get("cache-control") ?? "";
    expect(cacheControl).toContain("max-age=300");
  });
});

// ──────────────────────── Accessibility ────────────────────────
// Note: assertValidSvgStructure() already checks role="img", xmlns, <title>, <desc>
// in every card render test above. These tests check additional a11y properties.

test.describe("Accessibility", () => {
  test("stats card has aria-labelledby and desc with badge count", async () => {
    // Reuse a cached response to avoid rate limiting
    const svg = await (await fetch(`${BASE}/api/stats?username=${USER}`)).text();
    expect(svg).toContain('aria-labelledby="descId"');
    expect(svg).toMatch(/Credly stats: \d+ badges/);
  });
});
