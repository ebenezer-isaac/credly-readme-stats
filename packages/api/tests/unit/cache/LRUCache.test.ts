import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { LRUCache } from "../../../src/cache/LRUCache.js";

describe("LRUCache", () => {
  let cache: LRUCache<string>;

  beforeEach(() => {
    cache = new LRUCache({ maxSize: 3, defaultTTL: 60_000, name: "test" });
  });

  describe("get/set", () => {
    it("stores and retrieves a value", () => {
      cache.set("key1", "value1");
      expect(cache.get("key1")).toBe("value1");
    });

    it("returns undefined for missing key", () => {
      expect(cache.get("missing")).toBeUndefined();
    });

    it("overwrites existing key", () => {
      cache.set("key1", "v1");
      cache.set("key1", "v2");
      expect(cache.get("key1")).toBe("v2");
    });
  });

  describe("LRU eviction", () => {
    it("evicts least recently used when at capacity", () => {
      cache.set("a", "1");
      cache.set("b", "2");
      cache.set("c", "3");
      cache.set("d", "4"); // should evict "a"

      expect(cache.get("a")).toBeUndefined();
      expect(cache.get("d")).toBe("4");
    });

    it("promotes accessed entries to MRU", () => {
      cache.set("a", "1");
      cache.set("b", "2");
      cache.set("c", "3");
      cache.get("a"); // promote "a" to MRU
      cache.set("d", "4"); // should evict "b" (now LRU)

      expect(cache.get("a")).toBe("1");
      expect(cache.get("b")).toBeUndefined();
    });
  });

  describe("TTL expiry", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("returns undefined for expired entries", () => {
      cache.set("key1", "value1", 1000); // 1 second TTL
      vi.advanceTimersByTime(1001);
      expect(cache.get("key1")).toBeUndefined();
    });

    it("returns value before expiry", () => {
      cache.set("key1", "value1", 1000);
      vi.advanceTimersByTime(999);
      expect(cache.get("key1")).toBe("value1");
    });
  });

  describe("has", () => {
    it("returns true for existing key", () => {
      cache.set("key1", "value1");
      expect(cache.has("key1")).toBe(true);
    });

    it("returns false for missing key", () => {
      expect(cache.has("missing")).toBe(false);
    });

    it("returns false for expired key", () => {
      vi.useFakeTimers();
      cache.set("key1", "value1", 1000);
      vi.advanceTimersByTime(1001);
      expect(cache.has("key1")).toBe(false);
      vi.useRealTimers();
    });
  });

  describe("delete", () => {
    it("removes an entry", () => {
      cache.set("key1", "value1");
      expect(cache.delete("key1")).toBe(true);
      expect(cache.get("key1")).toBeUndefined();
    });

    it("returns false for missing key", () => {
      expect(cache.delete("missing")).toBe(false);
    });
  });

  describe("clear", () => {
    it("removes all entries and resets stats", () => {
      cache.set("a", "1");
      cache.set("b", "2");
      cache.get("a");
      cache.get("missing");
      cache.clear();

      // Stats are reset by clear
      const stats = cache.getStats();
      expect(stats.size).toBe(0);
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.evictions).toBe(0);

      // Values are gone (this increments misses)
      expect(cache.get("a")).toBeUndefined();
    });
  });

  describe("getStats", () => {
    it("tracks hits and misses", () => {
      cache.set("key1", "value1");
      cache.get("key1"); // hit
      cache.get("missing"); // miss

      const stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(0.5);
      expect(stats.size).toBe(1);
      expect(stats.maxSize).toBe(3);
    });

    it("tracks evictions", () => {
      cache.set("a", "1");
      cache.set("b", "2");
      cache.set("c", "3");
      cache.set("d", "4"); // evict

      const stats = cache.getStats();
      expect(stats.evictions).toBe(1);
    });

    it("returns 0 hitRate when no accesses", () => {
      expect(cache.getStats().hitRate).toBe(0);
    });
  });

  describe("prune", () => {
    it("removes expired entries", () => {
      vi.useFakeTimers();
      cache.set("a", "1", 500);
      cache.set("b", "2", 2000);
      vi.advanceTimersByTime(1000);

      const pruned = cache.prune();
      expect(pruned).toBe(1);
      expect(cache.get("a")).toBeUndefined();
      expect(cache.get("b")).toBe("2");
      vi.useRealTimers();
    });
  });

  describe("getName", () => {
    it("returns the cache name", () => {
      expect(cache.getName()).toBe("test");
    });
  });
});
