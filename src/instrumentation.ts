/**
 * Next.js Server Lifecycle Instrumentation Hook
 * Executes automatically when the Next.js server boots (in standalone, server, or Docker mode).
 * Halts production startup immediately if required security invariants are violated.
 */

export async function register() {
  // Only execute server-side startup validation in Node.js runtime
  if (process.env.NEXT_RUNTIME === "nodejs" || !process.env.NEXT_RUNTIME) {
    const { assertProductionStartupJwtSecret } = await import("@/lib/auth/jwt-config");
    const { assertProductionStartupRateLimit } = await import("@/lib/security/rate-limit");
    try {
      assertProductionStartupJwtSecret();
      assertProductionStartupRateLimit();
    } catch (err: any) {
      console.error("FATAL: Server startup validation failed:", err?.message || err);
      process.exit(1);
    }
  }
}
