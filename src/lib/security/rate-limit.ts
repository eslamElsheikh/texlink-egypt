/**
 * Cysle Egypt — In-Memory Sliding Window Rate Limiter
 *
 * Provides protection against brute force and resource exhaustion on
 * sensitive endpoints (authentication, file uploads, document generation).
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodic cleanup of expired entries every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredRecords(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;

  lastCleanup = now;
  for (const [key, record] of rateLimitStore.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
    if (record.timestamps.length === 0) {
      rateLimitStore.delete(key);
    }
  }
}

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetInMs: number;
}

/**
 * Checks and records a rate limit hit for a given identifier key.
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 30, windowMs: 60 * 1000 }
): RateLimitResult {
  const now = Date.now();
  cleanupExpiredRecords(options.windowMs);

  let record = rateLimitStore.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(identifier, record);
  }

  // Filter timestamps within the rolling window
  record.timestamps = record.timestamps.filter((ts) => now - ts < options.windowMs);

  if (record.timestamps.length >= options.limit) {
    const oldestTimestamp = record.timestamps[0] || now;
    const resetInMs = Math.max(0, options.windowMs - (now - oldestTimestamp));
    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      resetInMs,
    };
  }

  record.timestamps.push(now);

  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - record.timestamps.length,
    resetInMs: options.windowMs,
  };
}

/**
 * Resets rate limit store (useful for test isolation).
 */
export function resetRateLimitStore(): void {
  rateLimitStore.clear();
}
