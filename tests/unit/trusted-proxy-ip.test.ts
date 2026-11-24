import { describe, it, expect, beforeEach } from "vitest";
import {
  getClientIp,
  isValidIp,
  sanitizeIp,
  checkRateLimit,
  setRateLimitStore,
  MemoryRateLimitStore,
} from "@/lib/security/rate-limit";

describe("P1 Trusted Proxy & Client IP Security", () => {
  describe("IP Format Validation (isValidIp & sanitizeIp)", () => {
    it("validates standard IPv4 addresses", () => {
      expect(isValidIp("192.168.1.1")).toBe(true);
      expect(isValidIp("10.0.0.1")).toBe(true);
      expect(isValidIp("156.204.10.2")).toBe(true);
      expect(isValidIp("127.0.0.1")).toBe(true);
      expect(isValidIp("255.255.255.255")).toBe(true);
    });

    it("validates IPv4 addresses with port and strips port", () => {
      expect(isValidIp("192.168.1.1:8080")).toBe(true);
      expect(sanitizeIp("192.168.1.1:8080")).toBe("192.168.1.1");
    });

    it("validates standard IPv6 addresses", () => {
      expect(isValidIp("::1")).toBe(true);
      expect(isValidIp("2001:0db8:85a3:0000:0000:8a2e:0370:7334")).toBe(true);
      expect(isValidIp("2001:db8::1")).toBe(true);
      expect(isValidIp("fe80::1")).toBe(true);
    });

    it("validates IPv6 addresses in brackets with port", () => {
      expect(isValidIp("[::1]:3000")).toBe(true);
      expect(sanitizeIp("[::1]:3000")).toBe("::1");
    });

    it("strictly rejects and sanitizes malformed strings and injection attempts", () => {
      const dangerousInputs = [
        "<script>alert(1)</script>",
        "127.0.0.1; DROP TABLE users;",
        "999.999.999.999",
        "256.100.50.25",
        "unknown",
        "null",
        "undefined",
        "../../etc/passwd",
        "192.168.1.1.extra.digits",
        "",
        " ",
      ];

      for (const input of dangerousInputs) {
        expect(isValidIp(input)).toBe(false);
        expect(sanitizeIp(input)).toBe("unknown");
      }
    });
  });

  describe("Trusted Reverse Proxy Extraction & Spoofing Defenses", () => {
    it("reads cf-connecting-ip first when verified by Cloudflare Edge", () => {
      const req = new Request("http://localhost/api/auth/login", {
        headers: {
          "cf-connecting-ip": "197.35.40.12",
          "x-real-ip": "10.0.0.5",
          "x-forwarded-for": "1.2.3.4, 10.0.0.5",
        },
      });
      expect(getClientIp(req)).toBe("197.35.40.12");
    });

    it("reads x-real-ip when set by trusted Altare / NGINX Ingress", () => {
      const req = new Request("http://localhost/api/auth/login", {
        headers: {
          "x-real-ip": "41.233.15.80",
          "x-forwarded-for": "1.1.1.1, 41.233.15.80",
        },
      });
      expect(getClientIp(req)).toBe("41.233.15.80");
    });

    it("defends against X-Forwarded-For prefix spoofing by inspecting the trusted ingress hop", () => {
      // Scenario: Malicious client sends a fake header "X-Forwarded-For: 203.0.113.195".
      // The reverse proxy appends the real connecting IP: "203.0.113.195, 156.204.10.5".
      // Our implementation must NOT trust the client-controlled first IP (203.0.113.195),
      // but must extract the rightmost IP (156.204.10.5) appended by the trusted ingress proxy.
      const req = new Request("http://localhost/api/auth/login", {
        headers: {
          "x-forwarded-for": "203.0.113.195, 156.204.10.5",
        },
      });

      // Default trusted depth is 1 (direct reverse proxy ingress)
      expect(getClientIp(req)).toBe("156.204.10.5");
    });

    it("handles single-IP X-Forwarded-For header when no spoofing prefix exists", () => {
      const req = new Request("http://localhost/api/auth/login", {
        headers: {
          "x-forwarded-for": "156.204.10.5",
        },
      });
      expect(getClientIp(req)).toBe("156.204.10.5");
    });

    it("rejects malicious X-Forwarded-For containing script or SQL injection", () => {
      const req = new Request("http://localhost/api/auth/login", {
        headers: {
          "x-forwarded-for": "<script>alert('xss')</script>",
        },
      });
      // Should reject invalid format and safely fallback to localhost default
      expect(getClientIp(req)).toBe("127.0.0.1");
    });

    it("ignores proxy headers when trustProxy is explicitly disabled", () => {
      const req = new Request("http://localhost/api/auth/login", {
        headers: {
          "cf-connecting-ip": "197.35.40.12",
          "x-real-ip": "41.233.15.80",
          "x-forwarded-for": "156.204.10.5",
        },
      });
      expect(getClientIp(req, { trustProxy: false })).toBe("127.0.0.1");
    });
  });

  describe("Dual-Bucket Login Rate Limiting & Account Lockout Defense", () => {
    beforeEach(() => {
      setRateLimitStore(new MemoryRateLimitStore());
    });

    it("protects specific accounts from brute-force from an IP without globally locking out legitimate users on other IPs", async () => {
      const attackerIp = "198.51.100.10";
      const victimIp = "192.0.2.55";
      const victimEmail = "ceo@elmahalla-textile.com";

      // Attacker on attackerIp sends 5 failed login attempts
      for (let i = 1; i <= 5; i++) {
        const check = await checkRateLimit(`login:compound:${attackerIp}:${victimEmail}`, {
          limit: 5,
          windowMs: 15 * 60 * 1000,
        });
        expect(check.success).toBe(true);
      }

      // Attacker 6th attempt is blocked
      const attackerBlocked = await checkRateLimit(`login:compound:${attackerIp}:${victimEmail}`, {
        limit: 5,
        windowMs: 15 * 60 * 1000,
      });
      expect(attackerBlocked.success).toBe(false);

      // Legitimate user on victimIp logs in for the same account -> MUST BE ALLOWED!
      // This strictly prevents Denial-of-Service / account lockout attacks by third parties.
      const legitimateCheck = await checkRateLimit(`login:compound:${victimIp}:${victimEmail}`, {
        limit: 5,
        windowMs: 15 * 60 * 1000,
      });
      expect(legitimateCheck.success).toBe(true);
      expect(legitimateCheck.remaining).toBe(4);
    });

    it("throttles volumetric credential stuffing across multiple accounts from a single IP", async () => {
      const attackerIp = "203.0.113.99";
      const ipLimit = 20;

      // Attacker tries 20 different emails from the same IP
      for (let i = 0; i < ipLimit; i++) {
        const check = await checkRateLimit(`login:ip:${attackerIp}`, {
          limit: ipLimit,
          windowMs: 60 * 1000,
        });
        expect(check.success).toBe(true);
      }

      // 21st attempt from this IP is blocked regardless of which email is attempted
      const ipBlocked = await checkRateLimit(`login:ip:${attackerIp}`, {
        limit: ipLimit,
        windowMs: 60 * 1000,
      });
      expect(ipBlocked.success).toBe(false);
      expect(ipBlocked.remaining).toBe(0);
    });
  });
});
