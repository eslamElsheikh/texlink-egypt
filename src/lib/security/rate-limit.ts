/**
 * Cysle Egypt — Production Distributed Rate Limiter
 *
 * Implements an atomic sliding-window algorithm backed by Redis (for horizontally
 * scaled container instances).
 *
 * Explicit Production Policy:
 * 1. Multi-instance production strictly requires Redis (REDIS_URL).
 * 2. Silent fallback to in-memory rate limiting is strictly prohibited in multi-instance production.
 * 3. Sensitive operations (such as authentication / login) fail closed if Redis is unavailable.
 * 4. Single-instance exception: Permitted ONLY when explicitly opted into via
 *    ALLOW_SINGLE_INSTANCE_MEMORY_LIMITER=true.
 */

import Redis from "ioredis";

export type RateLimitPolicy = "distributed-required" | "single-instance-permitted";

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
  /**
   * Whether this check should fail closed (reject request) if the distributed
   * rate limiter is unreachable. Defaults to true in production for sensitive operations.
   */
  failClosedOnOutage?: boolean;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetInMs: number;
  backend: "redis" | "memory";
  error?: "RATE_LIMITER_UNAVAILABLE" | "RATE_LIMIT_EXCEEDED" | "CONFIG_ERROR";
  reason?: string;
}

export interface RateLimitStore {
  readonly isDistributed: boolean;
  checkLimit(key: string, limit: number, windowMs: number, failClosedOnOutage?: boolean): Promise<RateLimitResult>;
  reset(key?: string): Promise<void>;
  disconnect?(): Promise<void>;
}

// Atomic Lua script for rolling-window rate limiting in Redis
const SLIDING_WINDOW_LUA = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local member = ARGV[4]
local clearBefore = now - window

redis.call('ZREMRANGEBYSCORE', key, 0, clearBefore)
local currentCount = redis.call('ZCARD', key)

if currentCount < limit then
    redis.call('ZADD', key, now, member)
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
 * Returns active policy based on environment variables
 */
export function getRateLimitPolicy(env: NodeJS.ProcessEnv = process.env): RateLimitPolicy {
  if (env.NODE_ENV !== "production") {
    return "single-instance-permitted";
  }
  if (env.ALLOW_SINGLE_INSTANCE_MEMORY_LIMITER === "true" || env.RATE_LIMIT_POLICY === "single-instance-permitted") {
    return "single-instance-permitted";
  }
  return "distributed-required";
}

/**
 * In-memory sliding window fallback store (Single-instance only)
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
        error: "RATE_LIMIT_EXCEEDED",
        reason: "Rate limit quota exceeded",
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
  private policy: RateLimitPolicy;

  constructor(redisUrl: string, policy: RateLimitPolicy = getRateLimitPolicy()) {
    this.policy = policy;
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      commandTimeout: 3000,
    });

    this.client.on("error", (err) => {
      console.warn("⚠️ [RATE_LIMIT] Redis connection issue:", err.message);
    });
  }

  async checkLimit(
    key: string,
    limit: number,
    windowMs: number,
    failClosedOnOutage = (this.policy === "distributed-required")
  ): Promise<RateLimitResult> {
    try {
      const now = Date.now();
      const member = `${now}-${Math.random().toString(36).substring(2, 10)}`;
      const redisKey = `cysle:ratelimit:${key}`;
      const res = (await this.client.eval(
        SLIDING_WINDOW_LUA,
        1,
        redisKey,
        now,
        windowMs,
        limit,
        member
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
        ...(success ? {} : { error: "RATE_LIMIT_EXCEEDED", reason: "Rate limit quota exceeded" }),
      };
    } catch (err: unknown) {
      // In multi-instance production or sensitive operations, fail closed rather than allowing silent bypass
      if (failClosedOnOutage || this.policy === "distributed-required") {
        console.error("🚨 [RATE_LIMIT] Redis outage in distributed mode; failing closed:", err instanceof Error ? err.message : err);
        return {
          success: false,
          limit,
          remaining: 0,
          resetInMs: windowMs,
          backend: "redis",
          error: "RATE_LIMITER_UNAVAILABLE",
          reason: "Distributed rate limiter is unavailable in multi-instance production mode",
        };
      }

      // Explicit single-instance exception fallback
      console.warn("⚠️ [RATE_LIMIT] Falling back to memory limiter under approved single-instance exception.");
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

  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
    } catch {
      this.client.disconnect();
    }
  }
}

// Global store singleton
let activeStore: RateLimitStore | null = null;

export function getRateLimitStore(env: NodeJS.ProcessEnv = process.env): RateLimitStore {
  if (activeStore) return activeStore;

  const policy = getRateLimitPolicy(env);
  const redisUrl = env.REDIS_URL?.trim();

  if (redisUrl) {
    activeStore = new RedisRateLimitStore(redisUrl, policy);
  } else {
    if (policy === "distributed-required") {
      throw new Error(
        "FATAL_RATE_LIMIT_CONFIG_ERROR: REDIS_URL environment variable is strictly required for multi-instance production deployments. " +
        "Silent in-memory fallback is disabled in production to guarantee cluster-wide security. " +
        "For verified single-instance environments, explicitly set ALLOW_SINGLE_INSTANCE_MEMORY_LIMITER=true."
      );
    }

    if (env.NODE_ENV === "production") {
      console.warn(
        "⚠️ [RATE_LIMIT] Operating under explicit single-instance exception (ALLOW_SINGLE_INSTANCE_MEMORY_LIMITER=true)."
      );
    }
    activeStore = new MemoryRateLimitStore();
  }

  return activeStore;
}

/**
 * Asserts valid rate-limiting configuration at application startup.
 * Called during Next.js server bootstrap via instrumentation.register().
 * In production, halts startup immediately if REDIS_URL is omitted unless
 * ALLOW_SINGLE_INSTANCE_MEMORY_LIMITER=true is explicitly set.
 */
export function assertProductionStartupRateLimit(env: NodeJS.ProcessEnv = process.env): void {
  const isProduction = env.NODE_ENV === "production";
  if (!isProduction) return;

  // Skip during build phase
  if (env.NEXT_PHASE === "phase-production-build") return;

  const policy = getRateLimitPolicy(env);
  const redisUrl = env.REDIS_URL?.trim();

  if (!redisUrl) {
    if (policy === "distributed-required") {
      throw new Error(
        "FATAL_RATE_LIMIT_CONFIG_ERROR: REDIS_URL environment variable is strictly required for multi-instance production deployments. " +
        "Silent in-memory fallback is disabled in production to guarantee cluster-wide security. " +
        "For verified single-instance environments, explicitly set ALLOW_SINGLE_INSTANCE_MEMORY_LIMITER=true."
      );
    }
    console.warn(
      "⚠️ [RATE_LIMIT] REDIS_URL not configured. Operating under explicit single-instance exception (ALLOW_SINGLE_INSTANCE_MEMORY_LIMITER=true)."
    );
  }
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
  return store.checkLimit(identifier, options.limit, options.windowMs, options.failClosedOnOutage);
}

// ==============================================================================
// Trusted Proxy & Strict IP Sanitization
// ==============================================================================

// Strict IPv4 validation regex: 4 octets 0-255
const IPV4_REGEX = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

// Standard IPv6 validation regex (handles full, compressed ::, and IPv4-mapped)
const IPV6_REGEX = /^(?:(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?:(?::[0-9a-fA-F]{1,4}){1,6})|:(?:(?::[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(?::[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(?:ffff(?::0{1,4}){0,1}:){0,1}(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])|(?:[0-9a-fA-F]{1,4}:){1,4}:(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

/**
 * Validates whether a string is a valid IPv4 or IPv6 address.
 */
export function isValidIp(ip: string): boolean {
  if (!ip || typeof ip !== "string") return false;
  let cleanIp = ip.trim();
  if (cleanIp.includes(",")) {
    cleanIp = cleanIp.split(",")[0].trim();
  }
  // Strip port if present (e.g., "192.168.1.1:8080" or "[::1]:8080")
  if (cleanIp.startsWith("[") && cleanIp.includes("]")) {
    cleanIp = cleanIp.substring(1, cleanIp.indexOf("]"));
  } else if (cleanIp.includes(".") && cleanIp.includes(":")) {
    cleanIp = cleanIp.split(":")[0];
  }
  return IPV4_REGEX.test(cleanIp) || IPV6_REGEX.test(cleanIp);
}

/**
 * Sanitizes and normalizes an IP address string.
 * Returns "unknown" if the IP string is invalid, malformed, or contains injection attempts.
 */
export function sanitizeIp(rawIp: string): string {
  if (!rawIp || typeof rawIp !== "string") return "unknown";
  let clean = rawIp.trim();
  if (clean.includes(",")) {
    clean = clean.split(",")[0].trim();
  }
  if (clean.startsWith("[") && clean.includes("]")) {
    clean = clean.substring(1, clean.indexOf("]"));
  } else if (clean.includes(".") && clean.includes(":")) {
    clean = clean.split(":")[0];
  }
  if (IPV4_REGEX.test(clean) || IPV6_REGEX.test(clean)) {
    return clean;
  }
  return "unknown";
}

export interface GetClientIpOptions {
  trustProxy?: boolean;
  trustedDepth?: number;
  trustCloudflare?: boolean;
  trustRealIp?: boolean;
}

/**
 * Extracts and sanitizes the client IP address from request headers.
 *
 * Security Protections:
 * 1. Never trusts arbitrary client-supplied X-Forwarded-For prefixes.
 *    When behind a reverse proxy (Altare Ingress, Cloudflare, AWS ALB),
 *    the trusted ingress appends the real client connection IP to the end of the chain.
 *    Reading the rightmost IP (`ips.length - trustedDepth`) prevents client spoofing attacks.
 * 2. Cloudflare `cf-connecting-ip` is strictly guarded: only trusted if `trustCloudflare` is true
 *    or `TRUST_CF_CONNECTING_IP === "true"`. This prevents spoofed `cf-connecting-ip` headers from bypassing limits.
 * 3. Ingress `x-real-ip` is strictly guarded: only trusted if `trustRealIp` is true
 *    or `TRUST_REAL_IP === "true"`.
 * 4. Strictly validates IPv4 and IPv6 format; rejects malformed, injection, or duplicate values.
 */
export function getClientIp(req: Request, options?: GetClientIpOptions): string {
  const trustProxy = options?.trustProxy ?? (process.env.TRUST_PROXY !== "false");
  const trustedDepth = options?.trustedDepth ?? Number(process.env.TRUSTED_PROXY_DEPTH || 1);
  const trustCloudflare = options?.trustCloudflare ?? (process.env.TRUST_CF_CONNECTING_IP === "true");
  const trustRealIp = options?.trustRealIp ?? (process.env.TRUST_REAL_IP === "true");

  if (!trustProxy) {
    return "127.0.0.1";
  }

  // 1. Cloudflare edge verified client IP (only when verified in infrastructure)
  if (trustCloudflare) {
    const cfConnectingIp = req.headers.get("cf-connecting-ip");
    if (cfConnectingIp) {
      const sanitized = sanitizeIp(cfConnectingIp);
      if (sanitized !== "unknown") return sanitized;
    }
  }

  // 2. Ingress X-Real-IP (only when ingress is verified to overwrite this header)
  if (trustRealIp) {
    const realIp = req.headers.get("x-real-ip");
    if (realIp) {
      const sanitized = sanitizeIp(realIp);
      if (sanitized !== "unknown") return sanitized;
    }
  }

  // 3. X-Forwarded-For: client, proxy1, proxy2...
  // In reverse proxy environments with 1 trusted hop (depth = 1),
  // the client IP is at `ips[ips.length - trustedDepth]`.
  // If an attacker prepends fake IPs ("X-Forwarded-For: 1.1.1.1"),
  // taking the rightmost IP ensures we inspect the actual client IP appended by the proxy.
  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const ips = xForwardedFor
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (ips.length > 0) {
      const targetIndex = Math.max(0, ips.length - Math.max(1, trustedDepth));
      const targetIp = ips[targetIndex];
      const sanitized = sanitizeIp(targetIp);
      if (sanitized !== "unknown") return sanitized;
    }
  }

  return "127.0.0.1";
}
