/** A single cache entry with TTL metadata */
export interface CacheEntry<T> {
  readonly value: T;
  readonly createdAt: number;
  readonly ttl: number;
}

/** LRU cache configuration */
export interface LRUCacheConfig {
  readonly maxSize: number;
  readonly defaultTTL: number;
  readonly name: string;
}

/** Cache statistics for monitoring */
export interface CacheStats {
  readonly hits: number;
  readonly misses: number;
  readonly evictions: number;
  readonly size: number;
  readonly maxSize: number;
  readonly hitRate: number;
}
