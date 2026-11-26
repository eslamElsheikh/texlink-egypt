import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";

const mockPoolConnect = vi.fn();
const mockPoolEnd = vi.fn().mockResolvedValue(undefined);
const mockPrismaDisconnect = vi.fn().mockResolvedValue(undefined);

vi.mock("@prisma/client", () => ({
  PrismaClient: class MockPrismaClient {
    $disconnect = mockPrismaDisconnect;
  },
}));

vi.mock("pg", () => ({
  Pool: class MockPool {
    connect = mockPoolConnect;
    end = mockPoolEnd;
  },
}));

import {
  redactDatabaseUrl,
  sanitizeErrorMessage,
  migrateSqliteToPostgres,
  runCli,
} from "@/../scripts/migrate-sqlite-to-postgres";

describe("Phase 19 Security Hardening", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Database URL redaction (scripts/migrate-sqlite-to-postgres.ts)", () => {
    it("masks username and password while preserving host, port, database, and query parameters", () => {
      const input =
        "postgresql://db_admin:S3cr3tP4ss!@db.internal:6543/cysle_prod?schema=public&sslmode=require&pgbouncer=true";
      const redacted = redactDatabaseUrl(input);

      expect(redacted).not.toContain("db_admin");
      expect(redacted).not.toContain("S3cr3tP4ss!");
      expect(redacted).toBe(
        "postgresql://***:***@db.internal:6543/cysle_prod?schema=public&sslmode=require&pgbouncer=true"
      );
    });

    it("masks username-only URLs without adding a spurious password placeholder", () => {
      const input = "postgresql://readonly_user@localhost:5432/cysle";
      const redacted = redactDatabaseUrl(input);

      expect(redacted).not.toContain("readonly_user");
      expect(redacted).toBe("postgresql://***@localhost:5432/cysle");
    });

    it("preserves credential-free and file URLs unchanged", () => {
      expect(redactDatabaseUrl("postgresql://localhost:5432/cysle")).toBe(
        "postgresql://localhost:5432/cysle"
      );
      expect(redactDatabaseUrl("file:./dev.db")).toBe("file:./dev.db");
    });

    it("masks credentials in malformed URLs (unescaped @ or invalid port) without throwing", () => {
      const malformedWithAt = "postgresql://alice:p@ss!word@db.host:badport/cysle?sslmode=require";
      const redacted = redactDatabaseUrl(malformedWithAt);

      expect(redacted).not.toContain("alice");
      expect(redacted).not.toContain("p@ss!word");
      expect(redacted).toBe("postgresql://***:***@db.host:badport/cysle?sslmode=require");

      expect(redactDatabaseUrl("not a valid url")).toBe("not a valid url");
      expect(redactDatabaseUrl("")).toBe("");
    });

    it("redacts target URL and embedded credentials in logs and error output", async () => {
      const targetUrl = "postgresql://produser:TopSecretPass123@10.0.0.5:5432/cysle_prod?sslmode=require";
      mockPoolConnect.mockRejectedValueOnce(
        new Error(
          `Connection failed for ${targetUrl}; secondary postgres://backupuser:BackupPass!@10.0.0.6:5432/bkp`
        )
      );

      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const result = await migrateSqliteToPostgres(targetUrl);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).not.toContain("produser");
      expect(result.error).not.toContain("TopSecretPass123");
      expect(result.error).not.toContain("backupuser");
      expect(result.error).not.toContain("BackupPass!");
      expect(result.error).toContain("postgresql://***:***@10.0.0.5:5432/cysle_prod");
      expect(result.error).toContain("postgres://***:***@10.0.0.6:5432/bkp");

      const allStdout = logSpy.mock.calls.flat().join(" ");
      const allStderr = errorSpy.mock.calls.flat().join(" ");
      expect(allStdout).not.toContain("TopSecretPass123");
      expect(allStdout).toContain("Target: postgresql://***:***@10.0.0.5:5432/cysle_prod?sslmode=require");
      expect(allStderr).not.toContain("TopSecretPass123");
      expect(allStderr).not.toContain("BackupPass!");
    });

    it("sanitizes arbitrary string errors safely", () => {
      const clean = sanitizeErrorMessage("connect failed postgresql://u1:p1@host/db");
      expect(clean).toBe("connect failed postgresql://***:***@host/db");
    });

    it("masks URLs with special characters including unescaped #, /, ?, and percent-encoding", () => {
      const hashPass = "postgresql://user:123#abc@db.internal:5432/app";
      const slashPass = "postgresql://user:p/ss@db.internal:5432/app";
      const queryPass = "postgresql://user:p?s=1@db.internal:5432/app";
      const encodedPass = "postgresql://user:p%40ss%23word!@db.internal:5432/app?sslmode=require";

      expect(redactDatabaseUrl(hashPass)).toBe("postgresql://***:***@db.internal:5432/app");
      expect(redactDatabaseUrl(slashPass)).toBe("postgresql://***:***@db.internal:5432/app");
      expect(redactDatabaseUrl(queryPass)).toBe("postgresql://***:***@db.internal:5432/app");
      expect(redactDatabaseUrl(encodedPass)).toBe(
        "postgresql://***:***@db.internal:5432/app?sslmode=require"
      );
    });

    it("redacts nested error.cause chains, AggregateError.errors, PG detail, Prisma errors, and circular refs", () => {
      const targetUrl = "postgresql://prisma_user:Ultra$ecret#99@pg.internal:5432/cysle";
      const rootCause = Object.assign(
        new Error(`ECONNREFUSED ${targetUrl}`),
        { detail: "Connection attempted with Ultra$ecret#99 to postgres://other:Secret2!@10.0.0.9/b" }
      );
      const agg = new AggregateError(
        [new Error(`IPv6 fail ${targetUrl}`), new Error("IPv4 fail")],
        "connect aggregate error"
      );
      const prismaLikeError = new Error("PrismaClientInitializationError: Unable to reach DB", {
        cause: new Error("Driver failure", { cause: agg }),
      });
      // Inject circular reference safely
      const circular: Record<string, unknown> = {
        message: `Inner circular error postgres://cuser:CircPass123@10.0.0.2/c`,
      };
      circular.cause = circular;
      (agg as unknown as { cause?: unknown }).cause = rootCause;

      const msg = sanitizeErrorMessage(prismaLikeError, targetUrl);
      expect(msg).not.toContain("prisma_user");
      expect(msg).not.toContain("Ultra$ecret#99");
      expect(msg).not.toContain("Secret2!");
      expect(msg).toContain("postgresql://***:***@pg.internal:5432/cysle");
      expect(msg).toContain("postgres://***:***@10.0.0.9/b");

      const circularMsg = sanitizeErrorMessage(circular);
      expect(circularMsg).not.toContain("CircPass123");
      expect(circularMsg).toContain("[circular error reference]");
    });

    it("redacts credentials in CLI-level failure and unhandled rejection paths", async () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const codeFail = await runCli(async () => ({
        success: false,
        stats: [],
        error: "Auth failed for postgresql://cliuser:CliSecret99@db.internal:5432/cysle",
      }));
      expect(codeFail).toBe(1);

      const codeCrash = await runCli(async () => {
        throw new Error("Fatal crash on postgresql://crashuser:CrashSecret99@db.internal:5432/cysle");
      });
      expect(codeCrash).toBe(1);

      const codeOk = await runCli(async () => ({ success: true, stats: [] }));
      expect(codeOk).toBe(0);

      const allErr = errorSpy.mock.calls.flat().join(" ");
      expect(allErr).not.toContain("CliSecret99");
      expect(allErr).not.toContain("CrashSecret99");
      expect(allErr).toContain("postgresql://***:***@db.internal:5432/cysle");
    });
  });

  describe("Workflow and Dockerfile hardening invariants", () => {
    it("removes --auth CLI flag from .github/workflows/deploy.yml while keeping env auth", () => {
      const deployYml = fs.readFileSync(
        path.join(process.cwd(), ".github", "workflows", "deploy.yml"),
        "utf-8"
      );
      expect(deployYml).toContain("NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}");
      expect(deployYml).not.toMatch(/netlify-cli[^\n]*--auth\b/);
    });

    it("does not define ARG JWT_SECRET or ENV JWT_SECRET in Dockerfile", () => {
      const dockerfile = fs.readFileSync(path.join(process.cwd(), "Dockerfile"), "utf-8");
      expect(dockerfile).not.toMatch(/^\s*ARG\s+JWT_SECRET\b/m);
      expect(dockerfile).not.toMatch(/^\s*ENV\s+JWT_SECRET\b/m);
    });

    it("does not pass --build-arg JWT_SECRET in altare-ci.yml while preserving runtime -e JWT_SECRET", () => {
      const altareCi = fs.readFileSync(
        path.join(process.cwd(), ".github", "workflows", "altare-ci.yml"),
        "utf-8"
      );
      expect(altareCi).not.toMatch(/--build-arg\s+JWT_SECRET/);
      expect(altareCi).toMatch(/-e\s+JWT_SECRET=/);
    });
  });
});
