import { describe, it, expect, vi } from "vitest";
import { Hono } from "hono";
import {
  resolveCacheSeconds,
  setCacheHeaders,
  setErrorCacheHeaders,
  CACHE_DEFAULTS,
} from "../../../src/middleware/cacheHeaders.js";

describe("resolveCacheSeconds", () => {
  it("returns default for undefined", () => {
    expect(resolveCacheSeconds(undefined)).toBe(CACHE_DEFAULTS.DEFAULT_CACHE_SECONDS);
  });

  it("returns default for NaN", () => {
    expect(resolveCacheSeconds(NaN)).toBe(CACHE_DEFAULTS.DEFAULT_CACHE_SECONDS);
  });

  it("clamps below minimum", () => {
    expect(resolveCacheSeconds(100)).toBe(CACHE_DEFAULTS.MIN_CACHE_SECONDS);
  });

  it("clamps above maximum", () => {
    expect(resolveCacheSeconds(999999)).toBe(CACHE_DEFAULTS.MAX_CACHE_SECONDS);
  });

  it("returns value within range", () => {
    expect(resolveCacheSeconds(10000)).toBe(10000);
  });

  it("returns exact minimum", () => {
    expect(resolveCacheSeconds(CACHE_DEFAULTS.MIN_CACHE_SECONDS)).toBe(
      CACHE_DEFAULTS.MIN_CACHE_SECONDS,
    );
  });

  it("returns exact maximum", () => {
    expect(resolveCacheSeconds(CACHE_DEFAULTS.MAX_CACHE_SECONDS)).toBe(
      CACHE_DEFAULTS.MAX_CACHE_SECONDS,
    );
  });
});

describe("setCacheHeaders", () => {
  it("sets correct Cache-Control header", async () => {
    const app = new Hono();
    app.get("/", (c) => {
      setCacheHeaders(c, 21600);
      return c.text("ok");
    });

    const res = await app.request("/");
    const cc = res.headers.get("Cache-Control");
    expect(cc).toContain("public");
    expect(cc).toContain("max-age=21600");
    expect(cc).toContain("s-maxage=21600");
    expect(cc).toContain(`stale-while-revalidate=${CACHE_DEFAULTS.STALE_WHILE_REVALIDATE}`);
  });
});

describe("setErrorCacheHeaders", () => {
  it("sets short cache for errors", async () => {
    const app = new Hono();
    app.get("/", (c) => {
      setErrorCacheHeaders(c);
      return c.text("error");
    });

    const res = await app.request("/");
    const cc = res.headers.get("Cache-Control");
    expect(cc).toContain(`max-age=${CACHE_DEFAULTS.ERROR_CACHE_SECONDS}`);
  });
});

describe("CACHE_DEFAULTS", () => {
  it("has sensible values", () => {
    expect(CACHE_DEFAULTS.MIN_CACHE_SECONDS).toBeLessThan(CACHE_DEFAULTS.MAX_CACHE_SECONDS);
    expect(CACHE_DEFAULTS.DEFAULT_CACHE_SECONDS).toBeGreaterThanOrEqual(
      CACHE_DEFAULTS.MIN_CACHE_SECONDS,
    );
    expect(CACHE_DEFAULTS.DEFAULT_CACHE_SECONDS).toBeLessThanOrEqual(
      CACHE_DEFAULTS.MAX_CACHE_SECONDS,
    );
    expect(CACHE_DEFAULTS.ERROR_CACHE_SECONDS).toBeLessThan(CACHE_DEFAULTS.MIN_CACHE_SECONDS);
  });
});
