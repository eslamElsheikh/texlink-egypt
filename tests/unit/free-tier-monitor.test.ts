import { describe, it, expect } from "vitest";
import {
  getFreeTierUsageMetrics,
  SUPABASE_FREE_QUOTAS,
} from "@/lib/monitoring/free-tier-monitor";

describe("TexLink — Zero Cost ($0.00) Free-Tier Monitor", () => {
  it("enforces absolute $0.00 USD monthly cost across all tracked services", async () => {
    const metrics = await getFreeTierUsageMetrics();
    expect(metrics.totalMonthlyCostUSD).toBe(0.0);
  });

  it("sets Supabase Free plan quota ceilings correctly (500MB DB, 1024MB Storage, 5120MB Egress)", async () => {
    const metrics = await getFreeTierUsageMetrics();
    expect(metrics.databaseLimitMB).toBe(SUPABASE_FREE_QUOTAS.DATABASE_LIMIT_MB);
    expect(metrics.storageLimitMB).toBe(SUPABASE_FREE_QUOTAS.STORAGE_LIMIT_MB);
    expect(metrics.egressLimitMB).toBe(SUPABASE_FREE_QUOTAS.EGRESS_LIMIT_MB);
  });

  it("reports healthy status when resource usage remains well under 80% free thresholds", async () => {
    const metrics = await getFreeTierUsageMetrics();
    expect(metrics.databaseAlert).toBe(false);
    expect(metrics.storageAlert).toBe(false);
    expect(metrics.status).toBe("HEALTHY");
  });
});
