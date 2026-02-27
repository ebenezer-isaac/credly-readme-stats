import type { CacheEntry, LRUCacheConfig, CacheStats } from "../types/cache.js";

/**
 * Generic LRU cache with per-entry TTL.
 * Backed by Map (insertion-order iteration) for O(1) access.
 */
export class LRUCache<T> {
  private readonly store = new Map<string, CacheEntry<T>>();
  private readonly maxSize: number;
  private readonly defaultTTL: number;
  private readonly name: string;
  private hits = 0;
  private misses = 0;
  private evictions = 0;

  constructor(config: LRUCacheConfig) {
    this.maxSize = config.maxSize;
    this.defaultTTL = config.defaultTTL;
    this.name = config.name;
  }

  /**
   * Get a value. Returns undefined if not found or expired.
   * Moves entry to end (most-recently-used) on hit.
   */
  get(key: string): T | undefined {
    const entry = this.store.get(key);

    if (entry === undefined) {
      this.misses++;
      return undefined;
    }

    if (this.isExpired(entry)) {
      this.store.delete(key);
      this.misses++;
      return undefined;
    }

    // Move to MRU position: delete and re-insert
    this.store.delete(key);
    this.store.set(key, entry);
    this.hits++;

    return entry.value;
  }

  /**
   * Set a value with optional custom TTL (overrides default).
   * Evicts least-recently-used if at capacity.
   */
  set(key: string, value: T, ttl?: number): void {
    // If key exists, delete first to update position
    if (this.store.has(key)) {
      this.store.delete(key);
    }

    // Evict LRU entries if at capacity
    while (this.store.size >= this.maxSize) {
      const lruKey = this.store.keys().next().value;
      if (lruKey !== undefined) {
        this.store.delete(lruKey);
        this.evictions++;
      }
    }

    const entry: CacheEntry<T> = {
      value,
      createdAt: Date.now(),
      ttl: ttl ?? this.defaultTTL,
    };

    this.store.set(key, entry);
  }

  /** Check if key exists and is not expired */
  has(key: string): boolean {
    const entry = this.store.get(key);
    if (entry === undefined) return false;
    if (this.isExpired(entry)) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  /** Delete a specific key */
  delete(key: string): boolean {
    return this.store.delete(key);
  }

  /** Clear all entries */
  clear(): void {
    this.store.clear();
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  /** Get cache statistics */
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      size: this.store.size,
      maxSize: this.maxSize,
      hitRate: total === 0 ? 0 : this.hits / total,
    };
  }

  /**
   * Prune all expired entries.
   * Returns count of pruned entries.
   */
  prune(): number {
    let pruned = 0;
    const now = Date.now();

    for (const [key, entry] of this.store) {
      if (now - entry.createdAt > entry.ttl) {
        this.store.delete(key);
        pruned++;
      }
    }

    return pruned;
  }

  /** Get the cache name (for logging) */
  getName(): string {
    return this.name;
  }

  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.createdAt > entry.ttl;
  }
}
