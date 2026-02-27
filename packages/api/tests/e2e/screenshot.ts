import { chromium } from "playwright";

const BASE = "http://localhost:3001";
const USER = "ebenezer-isaac.05496d7f";
const OUT = "packages/api/tests/e2e/screenshots";

const urls = [
  { name: "stats-default", url: `/api/stats?username=${USER}` },
  { name: "stats-dark", url: `/api/stats?username=${USER}&theme=dark` },
  { name: "stats-radical", url: `/api/stats?username=${USER}&theme=radical` },
  { name: "stats-tokyonight", url: `/api/stats?username=${USER}&theme=tokyonight` },
  { name: "stats-hide-border", url: `/api/stats?username=${USER}&hide_border=true` },
  { name: "stats-custom-title", url: `/api/stats?username=${USER}&custom_title=My+Certifications` },
  { name: "stats-no-icons", url: `/api/stats?username=${USER}&show_icons=false` },
  { name: "stats-hide-sections", url: `/api/stats?username=${USER}&hide=expiring,top_skills` },
  { name: "grid-default", url: `/api/grid?username=${USER}` },
  { name: "grid-4col", url: `/api/grid?username=${USER}&columns=4&rows=3` },
  { name: "grid-dark", url: `/api/grid?username=${USER}&theme=dark` },
  { name: "grid-large", url: `/api/grid?username=${USER}&badge_size=96&columns=2` },
  { name: "grid-with-issuer", url: `/api/grid?username=${USER}&show_issuer=true` },
  { name: "timeline-default", url: `/api/timeline?username=${USER}` },
  { name: "timeline-dark", url: `/api/timeline?username=${USER}&theme=dark` },
  { name: "timeline-with-desc", url: `/api/timeline?username=${USER}&show_description=true` },
  { name: "timeline-max3", url: `/api/timeline?username=${USER}&max_items=3` },
  { name: "carousel-default", url: `/api/carousel?username=${USER}` },
  { name: "carousel-dark", url: `/api/carousel?username=${USER}&theme=dark` },
  { name: "carousel-large", url: `/api/carousel?username=${USER}&badge_size=96&visible_count=2` },
  { name: "carousel-with-issuer", url: `/api/carousel?username=${USER}&show_issuer=true` },
  { name: "overview-default", url: `/api/overview?username=${USER}` },
  { name: "overview-dark", url: `/api/overview?username=${USER}&theme=dark` },
  { name: "overview-wide", url: `/api/overview?username=${USER}&card_width=700` },
  { name: "overview-hide-carousel", url: `/api/overview?username=${USER}&hide=carousel` },
  { name: "error-missing-user", url: `/api/stats` },
  { name: "error-invalid-user", url: `/api/stats?username=-bad` },
  { name: "error-missing-badge", url: `/api/badge?username=${USER}` },
];

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 800 } });

  for (const { name, url } of urls) {
    const fullUrl = `${BASE}${url}`;
    try {
      // Fetch SVG as text, embed in HTML — avoids Playwright SVG document issues
      const res = await fetch(fullUrl);
      const svg = await res.text();

      const html = `<!DOCTYPE html>
<html><head><style>
  body { margin: 16px; background: #f6f8fa; font-family: sans-serif; }
</style></head>
<body>${svg}</body></html>`;

      await page.setContent(html, { waitUntil: "load" });
      await page.waitForTimeout(2000); // wait for stagger animations to complete

      // Clip to the SVG bounding box
      const svgEl = await page.$("svg");
      if (svgEl) {
        const box = await svgEl.boundingBox();
        if (box) {
          await page.screenshot({
            path: `${OUT}/${name}.png`,
            clip: { x: box.x, y: box.y, width: box.width, height: box.height },
          });
          console.log(`  captured: ${name} (${Math.round(box.width)}x${Math.round(box.height)})`);
          continue;
        }
      }
      // Fallback: full page screenshot
      await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
      console.log(`  captured: ${name} (fullPage fallback)`);
    } catch (err) {
      console.error(`  FAILED: ${name} — ${(err as Error).message}`);
    }
  }

  await browser.close();
  console.log(`\nDone. ${urls.length} screenshots saved to ${OUT}/`);
}

main().catch(console.error);
