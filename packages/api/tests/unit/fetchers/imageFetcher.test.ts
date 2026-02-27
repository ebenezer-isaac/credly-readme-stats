import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createMockBadges } from "../../fixtures/mockBadges.js";

// We need to mock the image cache before importing
vi.mock("../../../src/cache/imageCache.js", () => ({
  imageCache: {
    get: vi.fn(() => undefined),
    set: vi.fn(),
  },
}));

const { fetchImageAsBase64, hydrateBadgeImages } = await import(
  "../../../src/fetchers/imageFetcher.js"
);

describe("fetchImageAsBase64", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ "content-type": "image/png" }),
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches image and returns base64 data URI", async () => {
    const result = await fetchImageAsBase64("https://example.com/img.png");
    expect(result).toMatch(/^data:image\/png;base64,/);
  });

  it("returns placeholder on fetch failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));
    const result = await fetchImageAsBase64("https://example.com/fail.png");
    expect(result).toMatch(/^data:image\/png;base64,/);
  });

  it("returns placeholder on non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }),
    );
    const result = await fetchImageAsBase64("https://example.com/404.png");
    expect(result).toMatch(/^data:image\/png;base64,/);
  });

  it("uses content-type from response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ "content-type": "image/webp" }),
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      }),
    );
    const result = await fetchImageAsBase64("https://example.com/img.webp");
    expect(result).toMatch(/^data:image\/webp;base64,/);
  });
});

describe("hydrateBadgeImages", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ "content-type": "image/png" }),
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns new array with imageBase64 populated", async () => {
    const badges = createMockBadges();
    const result = await hydrateBadgeImages(badges);

    expect(result).toHaveLength(badges.length);
    for (const badge of result) {
      expect(badge.imageBase64).toBeTruthy();
      expect(badge.imageBase64).toMatch(/^data:image\//);
    }
  });

  it("does not mutate original badges", async () => {
    const badges = createMockBadges();
    const originals = badges.map((b) => ({ ...b }));
    await hydrateBadgeImages(badges);

    for (let i = 0; i < badges.length; i++) {
      expect(badges[i]!.imageBase64).toBe(originals[i]!.imageBase64);
    }
  });

  it("handles empty array", async () => {
    const result = await hydrateBadgeImages([]);
    expect(result).toEqual([]);
  });
});
