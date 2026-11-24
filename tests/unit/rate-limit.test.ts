import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  checkRateLimit,
  setRateLimitStore,
  MemoryRateLimitStore,
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

  describe("Client IP Extraction", () => {
    it("extracts IP from X-Forwarded-For taking the first client address", () => {
      const req = new Request("http://localhost/api/test", {
        headers: { "x-forwarded-for": "156.204.10.2, 10.0.0.1" },
      });
      expect(getClientIp(req)).toBe("156.204.10.2");
    });

    it("falls back to X-Real-IP when X-Forwarded-For is omitted", () => {
      const req = new Request("http://localhost/api/test", {
        headers: { "x-real-ip": "41.233.15.80" },
      });
      expect(getClientIp(req)).toBe("41.233.15.80");
    });

    it("falls back to CF-Connecting-IP for Cloudflare CDN traffic", () => {
      const req = new Request("http://localhost/api/test", {
        headers: { "cf-connecting-ip": "197.35.40.12" },
      });
      expect(getClientIp(req)).toBe("197.35.40.12");
    });

    it("defaults safely to localhost when no proxy headers are present", () => {
      const req = new Request("http://localhost/api/test");
      expect(getClientIp(req)).toBe("127.0.0.1");
    });
  });
});
