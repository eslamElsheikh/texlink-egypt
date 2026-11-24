import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  checkRateLimit,
  setRateLimitStore,
  getRateLimitStore,
  getRateLimitPolicy,
  assertProductionStartupRateLimit,
  MemoryRateLimitStore,
  RedisRateLimitStore,
  RateLimitStore,
  RateLimitResult,
  getClientIp,
} from "@/lib/security/rate-limit";

// Simulated multi-instance shared distributed store
class MockClusterDistributedStore implements RateLimitStore {
  readonly isDistributed = true;
  private static sharedClusterStorage = new Map<string, number[]>();

  async checkLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now();
    let timestamps = MockClusterDistributedStore.sharedClusterStorage.get(key) || [];
    timestamps = timestamps.filter((ts) => now - ts < windowMs);

    if (timestamps.length >= limit) {
      const oldest = timestamps[0] || now;
      return {
        success: false,
        limit,
        remaining: 0,
        resetInMs: Math.max(0, windowMs - (now - oldest)),
        backend: "redis",
      };
    }

    timestamps.push(now);
    MockClusterDistributedStore.sharedClusterStorage.set(key, timestamps);
    return {
      success: true,
      limit,
      remaining: limit - timestamps.length,
      resetInMs: windowMs,
      backend: "redis",
    };
  }

  async reset(key?: string): Promise<void> {
    if (key) {
      MockClusterDistributedStore.sharedClusterStorage.delete(key);
    } else {
      MockClusterDistributedStore.sharedClusterStorage.clear();
    }
  }
}

describe("P1 Distributed Production Rate Limiting", () => {
  beforeEach(async () => {
    setRateLimitStore(new MemoryRateLimitStore());
  });

  describe("Single-Instance In-Memory Store", () => {
    it("permits requests within quota and accurately decrements remaining counter", async () => {
      const key = "test_user_01";
      const limit = 5;
      const windowMs = 60000;

      for (let i = 0; i < limit; i++) {
        const result = await checkRateLimit(key, { limit, windowMs });
        expect(result.success).toBe(true);
        expect(result.remaining).toBe(limit - 1 - i);
        expect(result.backend).toBe("memory");
      }
    });

    it("strictly blocks requests once the quota is exhausted", async () => {
      const key = "test_user_exhausted";
      const limit = 3;
      const windowMs = 60000;

      await checkRateLimit(key, { limit, windowMs });
      await checkRateLimit(key, { limit, windowMs });
      await checkRateLimit(key, { limit, windowMs });

      const blocked = await checkRateLimit(key, { limit, windowMs });
      expect(blocked.success).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.resetInMs).toBeGreaterThan(0);
    });

    it("resets limits correctly after manual reset", async () => {
      const store = new MemoryRateLimitStore();
      setRateLimitStore(store);

      const key = "test_reset";
      await checkRateLimit(key, { limit: 1, windowMs: 60000 });
      const blocked = await checkRateLimit(key, { limit: 1, windowMs: 60000 });
      expect(blocked.success).toBe(false);

      await store.reset(key);
      const afterReset = await checkRateLimit(key, { limit: 1, windowMs: 60000 });
      expect(afterReset.success).toBe(true);
    });
  });

  describe("Concurrent Requests & Race-Condition Defenses", () => {
    it("handles simultaneous concurrent requests without race-condition overdraw", async () => {
      const key = "test_concurrent_user";
      const limit = 10;
      const windowMs = 60000;

      // Dispatch 25 requests simultaneously
      const promises = Array.from({ length: 25 }, () =>
        checkRateLimit(key, { limit, windowMs })
      );

      const results = await Promise.all(promises);
      const successful = results.filter((r) => r.success);
      const rejected = results.filter((r) => !r.success);

      expect(successful.length).toBe(limit);
      expect(rejected.length).toBe(15);
    });
  });

  describe("Multi-Instance Distributed Cluster Simulation", () => {
    it("enforces shared limits across multiple application container instances", async () => {
      const clusterStore = new MockClusterDistributedStore();
      await clusterStore.reset();
      setRateLimitStore(clusterStore);

      const sharedKey = "ip_197.100.50.25";
      const limit = 4;
      const windowMs = 60000;

      // Instance A executes 2 requests
      const resA1 = await checkRateLimit(sharedKey, { limit, windowMs });
      const resA2 = await checkRateLimit(sharedKey, { limit, windowMs });
      expect(resA1.success).toBe(true);
      expect(resA2.success).toBe(true);
      expect(resA2.remaining).toBe(2);

      // Instance B receives requests from the same client IP
      const resB1 = await checkRateLimit(sharedKey, { limit, windowMs });
      const resB2 = await checkRateLimit(sharedKey, { limit, windowMs });
      expect(resB1.success).toBe(true);
      expect(resB2.success).toBe(true);
      expect(resB2.remaining).toBe(0);

      // Instance C receives an additional request -> rejected by shared state
      const resC = await checkRateLimit(sharedKey, { limit, windowMs });
      expect(resC.success).toBe(false);
      expect(resC.remaining).toBe(0);
      expect(resC.backend).toBe("redis");
    });
  });

  describe("Production Policy & Redis Outage Behavior", () => {
    it("identifies distributed-required policy in production by default", () => {
      expect(getRateLimitPolicy({ NODE_ENV: "production" })).toBe("distributed-required");
    });

    it("permits single-instance exception only when explicitly opted into", () => {
      expect(
        getRateLimitPolicy({
          NODE_ENV: "production",
          ALLOW_SINGLE_INSTANCE_MEMORY_LIMITER: "true",
        })
      ).toBe("single-instance-permitted");
    });

    it("throws a fatal configuration error in production if REDIS_URL is omitted without single-instance override", () => {
      setRateLimitStore(null);
      expect(() =>
        getRateLimitStore({
          NODE_ENV: "production",
        })
      ).toThrowError(/FATAL_RATE_LIMIT_CONFIG_ERROR/);
    });

    it("fails closed on Redis outage when failClosedOnOutage is true", async () => {
      // Connect to unreachable port to force connection failure
      const brokenStore = new RedisRateLimitStore("redis://127.0.0.1:59999", "distributed-required");
      const result = await brokenStore.checkLimit("auth_test_key", 5, 60000, true);

      expect(result.success).toBe(false);
      expect(result.error).toBe("RATE_LIMITER_UNAVAILABLE");
      expect(result.reason).toContain("Distributed rate limiter is unavailable");
      await brokenStore.disconnect();
    });

    it("asserts production startup halts when REDIS_URL is missing in distributed mode", () => {
      expect(() =>
        assertProductionStartupRateLimit({
          NODE_ENV: "production",
        })
      ).toThrowError(/FATAL_RATE_LIMIT_CONFIG_ERROR/);
    });

    it("asserts production startup permits single-instance exception with warning", () => {
      expect(() =>
        assertProductionStartupRateLimit({
          NODE_ENV: "production",
          ALLOW_SINGLE_INSTANCE_MEMORY_LIMITER: "true",
        })
      ).not.toThrow();
    });

    it("asserts production startup succeeds when REDIS_URL is provided", () => {
      expect(() =>
        assertProductionStartupRateLimit({
          NODE_ENV: "production",
          REDIS_URL: "redis://10.0.0.1:6379",
        })
      ).not.toThrow();
    });

    it("skips rate limit startup check during Next.js build phase", () => {
      expect(() =>
        assertProductionStartupRateLimit({
          NODE_ENV: "production",
          NEXT_PHASE: "phase-production-build",
        })
      ).not.toThrow();
    });
  });

  describe("Client IP Extraction", () => {
    it("extracts connecting client IP from X-Forwarded-For using trusted depth", () => {
      const req = new Request("http://localhost/api/test", {
        headers: { "x-forwarded-for": "156.204.10.2, 10.0.0.1" },
      });
      // Default depth 1 extracts the rightmost client IP appended by trusted ingress
      expect(getClientIp(req)).toBe("10.0.0.1");
    });

    it("falls back to X-Real-IP when X-Forwarded-For is omitted and trustRealIp is enabled", () => {
      const req = new Request("http://localhost/api/test", {
        headers: { "x-real-ip": "41.233.15.80" },
      });
      expect(getClientIp(req, { trustRealIp: true })).toBe("41.233.15.80");
    });

    it("falls back to CF-Connecting-IP when verified for Cloudflare CDN traffic", () => {
      const req = new Request("http://localhost/api/test", {
        headers: { "cf-connecting-ip": "197.35.40.12" },
      });
      expect(getClientIp(req, { trustCloudflare: true })).toBe("197.35.40.12");
    });

    it("defaults safely to localhost when no proxy headers are present", () => {
      const req = new Request("http://localhost/api/test");
      expect(getClientIp(req)).toBe("127.0.0.1");
    });
  });
});
