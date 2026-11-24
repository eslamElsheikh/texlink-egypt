/**
 * Next.js Server Lifecycle Instrumentation Hook
 * Executes automatically when the Next.js server boots (in standalone, server, or Docker mode).
 * Halts production startup immediately if required security invariants are violated.
 */
import { assertProductionStartupJwtSecret } from "@/lib/auth/jwt-config";

export async function register() {
  // Only execute server-side startup validation in Node.js runtime
  if (process.env.NEXT_RUNTIME === "nodejs" || !process.env.NEXT_RUNTIME) {
    assertProductionStartupJwtSecret();
  }
}
