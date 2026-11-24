import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { RedisRateLimitStore } from "@/lib/security/rate-limit";
import Redis from "ioredis";

describe("P0 Redis Distributed Rate Limiter Integration", () => {
  const redisUrl = process.env.REDIS_URL;
  let isRedisLive = false;

  beforeAll(async () => {
    if (redisUrl) {
      try {
        const probe = new Redis(redisUrl, { connectTimeout: 1500, maxRetriesPerRequest: 1 });
        await probe.ping();
        isRedisLive = true;
        await probe.quit();
      } catch {
        isRedisLive = false;
      }
    }
  });

  describe("Real Multi-Client Cluster Concurrency", () => {
    it("enforces shared limits across independent Redis clients", async () => {
      if (!isRedisLive || !redisUrl) {
        console.warn("Skipping real Redis live test: REDIS_URL not active in current environment.");
        return;
      }

      // Instantiate two distinct, isolated client instances simulating two clustered container replicas
      const containerNode1 = new RedisRateLimitStore(redisUrl, "distributed-required");
      const containerNode2 = new RedisRateLimitStore(redisUrl, "distributed-required");

      const testKey = `real_cluster_test_${Date.now()}`;
      await containerNode1.reset(testKey);

      const limit = 4;
      const windowMs = 30000;

      // Node 1 consumes 2 tokens
      const res1 = await containerNode1.checkLimit(testKey, limit, windowMs);
      const res2 = await containerNode1.checkLimit(testKey, limit, windowMs);
      expect(res1.success).toBe(true);
      expect(res2.success).toBe(true);
      expect(res2.remaining).toBe(2);

      // Node 2 observes updated shared state immediately
      const res3 = await containerNode2.checkLimit(testKey, limit, windowMs);
      const res4 = await containerNode2.checkLimit(testKey, limit, windowMs);
      expect(res3.success).toBe(true);
      expect(res4.success).toBe(true);
      expect(res4.remaining).toBe(0);

      // Node 1 attempts 5th request -> rejected across cluster
      const res5 = await containerNode1.checkLimit(testKey, limit, windowMs);
      expect(res5.success).toBe(false);
      expect(res5.remaining).toBe(0);
      expect(res5.backend).toBe("redis");

      await containerNode1.reset(testKey);
      await containerNode1.disconnect();
      await containerNode2.disconnect();
    });

    it("prevents race condition overdraw under high concurrency across multiple clients", async () => {
      if (!isRedisLive || !redisUrl) return;

      const clientA = new RedisRateLimitStore(redisUrl, "distributed-required");
      const clientB = new RedisRateLimitStore(redisUrl, "distributed-required");

      const key = `concurrency_stress_${Date.now()}`;
      await clientA.reset(key);

      const limit = 10;
      const windowMs = 30000;

      // Fire 30 simultaneous requests evenly split across Client A and Client B
      const promises = Array.from({ length: 30 }, (_, i) => {
        const client = i % 2 === 0 ? clientA : clientB;
        return client.checkLimit(key, limit, windowMs);
      });

      const results = await Promise.all(promises);
      const successes = results.filter((r) => r.success);
      const rejections = results.filter((r) => !r.success);

      expect(successes.length).toBe(limit);
      expect(rejections.length).toBe(20);

      await clientA.reset(key);
      await clientA.disconnect();
      await clientB.disconnect();
    });
  });

  describe("Redis Outage & Fail-Closed Policy", () => {
    it("fails closed on network partition when failClosedOnOutage is true", async () => {
      // Connect to unreachable loopback port
      const deadStore = new RedisRateLimitStore("redis://127.0.0.1:58999", "distributed-required");
      const result = await deadStore.checkLimit("sensitive_auth_key", 5, 60000, true);

      expect(result.success).toBe(false);
      expect(result.error).toBe("RATE_LIMITER_UNAVAILABLE");
      expect(result.backend).toBe("redis");
      await deadStore.disconnect();
    });

    it("falls back to in-memory store only when explicitly operating under single-instance permitted policy", async () => {
      const deadStore = new RedisRateLimitStore("redis://127.0.0.1:58999", "single-instance-permitted");
      // Under single-instance policy, checkLimit falls back to in-memory fallbackStore
      const result = await deadStore.checkLimit("non_sensitive_key", 5, 60000, false);

      expect(result.success).toBe(true);
      expect(result.backend).toBe("memory");
      expect(result.remaining).toBe(4);
      await deadStore.disconnect();
    });
  });
});
