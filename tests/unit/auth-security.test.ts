import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSessionToken, verifySessionToken } from "@/lib/auth/session";

describe("Auth & Password Security", () => {
  it("hashes password with salt and verifies correctly", async () => {
    const raw = "MySecureEgyptianPassword2026!";
    const hashed = await hashPassword(raw);

    expect(hashed).not.toBe(raw);
    expect(await verifyPassword(raw, hashed)).toBe(true);
    expect(await verifyPassword("WrongPassword", hashed)).toBe(false);
  });

  it("signs and verifies JWT session tokens with role payload", async () => {
    const userPayload = {
      id: "usr_test_123",
      email: "buyer@test.com",
      name: "أحمد المشتري",
      phone: "01012345678",
      role: "BUYER" as const,
      isFactory: false,
      isBuyer: true,
      factoryId: null,
      factorySlug: null,
    };

    const token = await createSessionToken(userPayload);
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(20);

    const decoded = await verifySessionToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.id).toBe("usr_test_123");
    expect(decoded?.email).toBe("buyer@test.com");
    expect(decoded?.role).toBe("BUYER");
  });

  it("rejects tampered or invalid JWT tokens", async () => {
    const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered.signature";
    const decoded = await verifySessionToken(fakeToken);
    expect(decoded).toBeNull();
  });
});
