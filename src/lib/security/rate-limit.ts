/**
 * Cysle Egypt — Production Distributed Rate Limiter
 *
 * Implements an atomic sliding-window algorithm backed by Redis (for horizontally
 * scaled container instances) with an automatic, safe in-memory fallback when
 * REDIS_URL is not configured or temporarily unreachable.
 */

import Redis from "ioredis";

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetInMs: number;
  backend: "redis" | "memory";
}

export interface RateLimitStore {
  readonly isDistributed: boolean;
  checkLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult>;
  reset(key?: string): Promise<void>;
}

// Atomic Lua script for rolling-window rate limiting in Redis
const SLIDING_WINDOW_LUA = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local clearBefore = now - window

redis.call('ZREMRANGEBYSCORE', key, 0, clearBefore)
local currentCount = redis.call('ZCARD', key)

if currentCount < limit then
    redis.call('ZADD', key, now, now .. '-' .. math.random(1000, 9999))
    redis.call('PEXPIRE', key, window)
    return {1, limit - currentCount - 1, window}
else
    local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
    local resetIn = window
    if oldest and #oldest >= 2 then
        resetIn = math.max(0, math.floor(tonumber(oldest[2]) + window - now))
    end
    return {0, 0, resetIn}
end
`;

/**
 * In-memory sliding window fallback store
 */
export class MemoryRateLimitStore implements RateLimitStore {
  readonly isDistributed = false;
  private records = new Map<string, number[]>();

  async checkLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now();
    let timestamps = this.records.get(key) || [];
    timestamps = timestamps.filter((ts) => now - ts < windowMs);

    if (timestamps.length >= limit) {
      const oldest = timestamps[0] || now;
      const resetInMs = Math.max(0, windowMs - (now - oldest));
      this.records.set(key, timestamps);
      return {
        success: false,
        limit,
        remaining: 0,
        resetInMs,
        backend: "memory",
      };
    }

    timestamps.push(now);
    this.records.set(key, timestamps);

    return {
      success: true,
      limit,
      remaining: limit - timestamps.length,
      resetInMs: windowMs,
      backend: "memory",
    };
  }

  async reset(key?: string): Promise<void> {
    if (key) {
      this.records.delete(key);
    } else {
      this.records.clear();
    }
  }
}

/**
 * Redis-backed distributed store for multi-instance clusters
 */
export class RedisRateLimitStore implements RateLimitStore {
  readonly isDistributed = true;
  private client: Redis;
  private fallbackStore = new MemoryRateLimitStore();

  constructor(redisUrl: string) {
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      enableOfflineQueue: false,
      lazyConnect: true,
    });

    this.client.on("error", (err) => {
      console.warn("⚠️ [RATE_LIMIT] Redis connection issue; falling back to memory:", err.message);
    });
  }

  async checkLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    try {
      if (this.client.status !== "ready") {
        await this.client.connect().catch(() => {});
      }

      const now = Date.now();
      const redisKey = `cysle:ratelimit:${key}`;
      const res = (await this.client.eval(
        SLIDING_WINDOW_LUA,
        1,
        redisKey,
        now,
        windowMs,
        limit
      )) as [number, number, number];

      const success = res[0] === 1;
      const remaining = Number(res[1]);
      const resetInMs = Number(res[2]);

      return {
        success,
        limit,
        remaining,
        resetInMs,
        backend: "redis",
      };
    } catch (err: unknown) {
      // Graceful fallback to memory on Redis partition/failure
      return this.fallbackStore.checkLimit(key, limit, windowMs);
    }
  }

  async reset(key?: string): Promise<void> {
    try {
      if (key) {
        await this.client.del(`cysle:ratelimit:${key}`);
      }
    } catch {
      // Ignore
    }
    await this.fallbackStore.reset(key);
  }
}

// Global store singleton
let activeStore: RateLimitStore | null = null;

export function getRateLimitStore(): RateLimitStore {
  if (activeStore) return activeStore;

  const redisUrl = process.env.REDIS_URL?.trim();
  if (redisUrl) {
    activeStore = new RedisRateLimitStore(redisUrl);
  } else {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "⚠️ [RATE_LIMIT] REDIS_URL not configured. Operating in single-instance in-memory fallback mode."
      );
    }
    activeStore = new MemoryRateLimitStore();
  }

  return activeStore;
}

export function setRateLimitStore(store: RateLimitStore | null): void {
  activeStore = store;
}

/**
 * Checks and records rate limit for an identifier key.
 */
export async function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 30, windowMs: 60 * 1000 }
): Promise<RateLimitResult> {
  const store = getRateLimitStore();
  return store.checkLimit(identifier, options.limit, options.windowMs);
}

/**
 * Extracts client IP safely from request headers.
 */
export function getClientIp(req: Request): string {
  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  return "127.0.0.1";
}
