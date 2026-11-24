import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { SignJWT } from "jose";
import {
  resolveJwtSecret,
  getJwtSecretKey,
  JWT_ALGORITHM,
  MIN_SECRET_LENGTH,
  DEV_ONLY_FALLBACK_KEY,
} from "@/lib/auth/jwt-config";
import {
  createSessionToken,
  verifySessionToken,
  SessionUser,
} from "@/lib/auth/session";

describe("P0 Auth & JWT Security Validation", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset env
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("Environment Secret Validation (resolveJwtSecret)", () => {
    it("refuses to start in production if JWT_SECRET is completely missing", () => {
      expect(() =>
        resolveJwtSecret({
          NODE_ENV: "production",
        })
      ).toThrowError(/JWT_SECRET environment variable is missing in production/i);
    });

    it("refuses to start in production if JWT_SECRET is shorter than 32 characters", () => {
      expect(() =>
        resolveJwtSecret({
          NODE_ENV: "production",
          JWT_SECRET: "short-weak-secret-12345",
        })
      ).toThrowError(/does not meet minimum cryptographic length requirement/i);
    });

    it("refuses to start in production if JWT_SECRET matches a known insecure default", () => {
      expect(() =>
        resolveJwtSecret({
          NODE_ENV: "production",
          JWT_SECRET: "texlink-egypt-default-fallback-secret-2026",
        })
      ).toThrowError(/known insecure default\/placeholder secret in production/i);
    });

    it("does not leak secret values in error messages", () => {
      const sensitiveWeakSecret = "super-secret-weak";

      try {
        resolveJwtSecret({
          NODE_ENV: "production",
          JWT_SECRET: sensitiveWeakSecret,
        });
        expect.unreachable("Should have thrown");
      } catch (err: unknown) {
        const message = (err as Error).message;
        expect(message).not.toContain(sensitiveWeakSecret);
        expect(message).toContain("Startup aborted");
      }
    });

    it("succeeds in production when provided a valid 32+ character random key", () => {
      const res = resolveJwtSecret({
        NODE_ENV: "production",
        JWT_SECRET: "d8f3a9e2c4b107654321fedcba0987654321abcdef0123456789abcdef012345",
      });
      expect(res.rawLength).toBeGreaterThanOrEqual(MIN_SECRET_LENGTH);
      expect(res.isDevFallback).toBe(false);
      expect(res.secretKey).toBeInstanceOf(Uint8Array);
    });

    it("falls back gracefully in development/test with clear warning and explicit flag", () => {
      const res = resolveJwtSecret({
        NODE_ENV: "development",
      });
      expect(res.isDevFallback).toBe(true);
      expect(res.rawLength).toBe(DEV_ONLY_FALLBACK_KEY.length);
    });
  });

  describe("Session Token Lifecycle & Tamper Protection", () => {
    const validTestUser: SessionUser = {
      id: "usr_qa_factory_owner_2026",
      email: "owner@texlink-delta.eg",
      name: "محمود العربي",
      phone: "+201012345678",
      role: "FACTORY",
      isFactory: true,
      isBuyer: false,
      factoryId: "fac_delta_tex_01",
      factorySlug: "delta-textile-mahalla",
    };

    it("creates and successfully verifies valid session token with all claims", async () => {
      process.env.JWT_SECRET = "test-secret-key-that-is-at-least-32-chars-long-for-qa!";
      const token = await createSessionToken(validTestUser);

      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3);

      const verified = await verifySessionToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.id).toBe(validTestUser.id);
      expect(verified?.email).toBe(validTestUser.email);
      expect(verified?.role).toBe("FACTORY");
      expect(verified?.factoryId).toBe("fac_delta_tex_01");
      expect(verified?.factorySlug).toBe("delta-textile-mahalla");
    });

    it("strictly rejects expired tokens", async () => {
      process.env.JWT_SECRET = "test-secret-key-that-is-at-least-32-chars-long-for-qa!";
      const key = getJwtSecretKey();

      // Sign token expired 10 seconds ago
      const expiredToken = await new SignJWT({ ...validTestUser })
        .setProtectedHeader({ alg: JWT_ALGORITHM })
        .setIssuedAt(Math.floor(Date.now() / 1000) - 100)
        .setExpirationTime(Math.floor(Date.now() / 1000) - 10)
        .sign(key);

      const verified = await verifySessionToken(expiredToken);
      expect(verified).toBeNull();
    });

    it("strictly rejects signature tampering", async () => {
      process.env.JWT_SECRET = "test-secret-key-that-is-at-least-32-chars-long-for-qa!";
      const token = await createSessionToken(validTestUser);

      const parts = token.split(".");
      // Alter signature
      const tamperedSignature = parts[2].slice(0, -4) + "XXXX";
      const tamperedToken = `${parts[0]}.${parts[1]}.${tamperedSignature}`;

      const verified = await verifySessionToken(tamperedToken);
      expect(verified).toBeNull();
    });

    it("strictly rejects payload tampering (e.g. elevating role to ADMIN)", async () => {
      process.env.JWT_SECRET = "test-secret-key-that-is-at-least-32-chars-long-for-qa!";
      const token = await createSessionToken(validTestUser);

      const parts = token.split(".");
      // Decode payload, tamper role to ADMIN, re-encode without signature recalculation
      const decodedJson = JSON.parse(Buffer.from(parts[1], "base64url").toString());
      decodedJson.role = "ADMIN";
      const tamperedPayload = Buffer.from(JSON.stringify(decodedJson)).toString("base64url");

      const forgedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;
      const verified = await verifySessionToken(forgedToken);
      expect(verified).toBeNull();
    });

    it("strictly rejects tokens signed with wrong secret", async () => {
      const differentSecret = new TextEncoder().encode("another-foreign-attacker-secret-32-chars-long!");
      const attackerToken = await new SignJWT({ ...validTestUser, role: "ADMIN" })
        .setProtectedHeader({ alg: JWT_ALGORITHM })
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(differentSecret);

      process.env.JWT_SECRET = "our-legitimate-production-secret-min32-chars!";
      const verified = await verifySessionToken(attackerToken);
      expect(verified).toBeNull();
    });

    it("strictly rejects algorithm substitution attacks (alg: none)", async () => {
      process.env.JWT_SECRET = "test-secret-key-that-is-at-least-32-chars-long-for-qa!";

      // Forging header with alg: "none"
      const headerNone = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
      const payload = Buffer.from(JSON.stringify({ ...validTestUser, role: "ADMIN" })).toString("base64url");
      const forgedUnsignedToken = `${headerNone}.${payload}.`;

      const verified = await verifySessionToken(forgedUnsignedToken);
      expect(verified).toBeNull();
    });
  });
});
