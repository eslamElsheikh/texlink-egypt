import { describe, it, expect } from "vitest";
import { createSessionToken, verifySessionToken } from "@/lib/auth/session";

describe("Dashboard Architecture & Role Switching", () => {
  it("creates session for dual-role user (Buyer and Factory) and verifies permissions", async () => {
    const dualUser = {
      id: "usr_dual_123",
      email: "dual@texlink-egypt.com",
      name: "حساب مزدوج مصنع ومشتري",
      phone: "01011112222",
      role: "BUYER" as const,
      isFactory: true,
      isBuyer: true,
      factoryId: "fact_123",
      factorySlug: "el-nasr-tricot",
    };

    const token = await createSessionToken(dualUser);
    const verified = await verifySessionToken(token);

    expect(verified).not.toBeNull();
    expect(verified?.isFactory).toBe(true);
    expect(verified?.isBuyer).toBe(true);
    expect(verified?.role).toBe("BUYER");

    // Switch to Factory role
    const switchedPayload = {
      ...verified!,
      role: "FACTORY" as const,
    };
    const switchedToken = await createSessionToken(switchedPayload);
    const switchedVerified = await verifySessionToken(switchedToken);

    expect(switchedVerified?.role).toBe("FACTORY");
    expect(switchedVerified?.isFactory).toBe(true);
  });

  it("admin session holds platform-wide authorization", async () => {
    const adminUser = {
      id: "admin_user",
      email: "admin@texlink-egypt.com",
      name: "إدارة المنصة",
      phone: "01000000001",
      role: "ADMIN" as const,
      isFactory: false,
      isBuyer: true,
      factoryId: null,
      factorySlug: null,
    };

    const token = await createSessionToken(adminUser);
    const verified = await verifySessionToken(token);

    expect(verified?.role).toBe("ADMIN");
  });
});
