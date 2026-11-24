import { describe, it, expect } from "vitest";
import { assertSafeSeedExecution, generateSeedPassword } from "@/../prisma/seed";

describe("P0 Database Seed Safety & Production Guardrails", () => {
  it("strictly refuses to execute if NODE_ENV is production", () => {
    expect(() =>
      assertSafeSeedExecution({
        NODE_ENV: "production",
        DATABASE_URL: "file:./dev.db",
      })
    ).toThrowError(/Destructive seed execution is strictly prohibited when NODE_ENV is set to 'production'/i);
  });

  it("strictly refuses to execute against remote Supabase/PostgreSQL without ALLOW_DESTRUCTIVE_DEV_SEED=true", () => {
    expect(() =>
      assertSafeSeedExecution({
        NODE_ENV: "development",
        DATABASE_URL: "postgresql://postgres:secret@db.xyz.supabase.co:5432/postgres",
      })
    ).toThrowError(/Detected connection to a remote\/PostgreSQL database without explicit ALLOW_DESTRUCTIVE_DEV_SEED=true/i);
  });

  it("strictly refuses to execute against Altare production PostgreSQL without ALLOW_DESTRUCTIVE_DEV_SEED=true", () => {
    expect(() =>
      assertSafeSeedExecution({
        NODE_ENV: "development",
        DATABASE_URL: "postgresql://texlink_user:secret@postgres.altare.gg:5432/texlink_prod",
      })
    ).toThrowError(/Detected connection to a remote\/PostgreSQL database without explicit ALLOW_DESTRUCTIVE_DEV_SEED=true/i);
  });

  it("strictly refuses when ALLOW_DESTRUCTIVE_DEV_SEED=false", () => {
    expect(() =>
      assertSafeSeedExecution({
        NODE_ENV: "development",
        DATABASE_URL: "file:./dev.db",
        ALLOW_DESTRUCTIVE_DEV_SEED: "false",
      })
    ).toThrowError(/Destructive seed execution was explicitly disabled via ALLOW_DESTRUCTIVE_DEV_SEED=false/i);
  });

  it("permits execution on local SQLite database in development", () => {
    expect(() =>
      assertSafeSeedExecution({
        NODE_ENV: "development",
        DATABASE_URL: "file:./dev.db",
      })
    ).not.toThrow();
  });

  it("permits execution on remote database ONLY when explicitly authorized via ALLOW_DESTRUCTIVE_DEV_SEED=true in non-production", () => {
    expect(() =>
      assertSafeSeedExecution({
        NODE_ENV: "development",
        DATABASE_URL: "postgresql://postgres:secret@db.staging.supabase.co:5432/postgres",
        ALLOW_DESTRUCTIVE_DEV_SEED: "true",
      })
    ).not.toThrow();
  });

  it("generates strong passwords and never outputs weak defaults like '123456'", () => {
    const password = generateSeedPassword();
    expect(password).not.toBe("123456");
    expect(password.length).toBeGreaterThanOrEqual(12);
    expect(password).toMatch(/^DevSeed!/);
  });

  it("respects DEV_SEED_PASSWORD override for deterministic testing", () => {
    const originalEnv = process.env.DEV_SEED_PASSWORD;
    try {
      process.env.DEV_SEED_PASSWORD = "CustomSecureSeedPassword2026!";
      expect(generateSeedPassword()).toBe("CustomSecureSeedPassword2026!");
    } finally {
      if (originalEnv) {
        process.env.DEV_SEED_PASSWORD = originalEnv;
      } else {
        delete process.env.DEV_SEED_PASSWORD;
      }
    }
  });
});
