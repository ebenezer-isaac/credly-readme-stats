import type { Context, Next } from "hono";

export interface RateLimitConfig {
  readonly windowMs: number;
  readonly maxRequests: number;
  readonly keyGenerator?: (c: Context) => string;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60_000, // 1 minute
  maxRequests: 60,
};

export interface RateLimitMiddleware {
  (c: Context, next: Next): Promise<Response | void>;
  /** Stop the periodic cleanup timer. Call this on shutdown or in tests. */
  readonly cleanup: () => void;
}

/**
 * Create a rate limiting middleware.
 * Uses in-memory sliding window counter per client IP.
 * Returns 429 with plain text when limit exceeded.
 * Call `.cleanup()` to stop the periodic cleanup timer.
 */
export function createRateLimiter(config?: Partial<RateLimitConfig>): RateLimitMiddleware {
  const { windowMs, maxRequests, keyGenerator } = { ...DEFAULT_CONFIG, ...config };
  const store = new Map<string, { count: number; resetAt: number }>();

  // Periodic cleanup of expired entries (handle stored for cleanup)
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  }, windowMs);

  // Ensure the timer doesn't prevent process exit
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }

  const middleware = async (c: Context, next: Next) => {
    // Parse first IP from x-forwarded-for (may contain "ip1, ip2, ip3")
    const xff = c.req.header("x-forwarded-for");
    const clientIp = keyGenerator
      ? keyGenerator(c)
      : xff?.split(",")[0]?.trim() ?? c.req.header("x-real-ip") ?? "unknown";

    const now = Date.now();
    const entry = store.get(clientIp);

    if (entry && now < entry.resetAt) {
      // Immutable update: replace entry with incremented count
      store.set(clientIp, { count: entry.count + 1, resetAt: entry.resetAt });
      if (entry.count + 1 > maxRequests) {
        c.header("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
        return c.text("Too many requests", 429);
      }
    } else {
      store.set(clientIp, { count: 1, resetAt: now + windowMs });
    }

    await next();
  };

  middleware.cleanup = () => clearInterval(cleanupTimer);

  return middleware as RateLimitMiddleware;
}
