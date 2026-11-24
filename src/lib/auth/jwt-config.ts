/**
 * Cysle Egypt — Centralized JWT Configuration & Cryptographic Key Validation
 *
 * Enforces production-grade secret entropy (minimum 32 characters),
 * algorithm restriction (HS256 strictly enforced), and fails closed
 * in production environments if secrets are missing or weak.
 */

import crypto from "crypto";

const KNOWN_INSECURE_SECRETS = new Set([
  "texlink-egypt-default-fallback-secret-2026",
  "default-fallback-secret",
  "secret",
  "123456",
  "changeme",
  "CHANGE_ME_IN_PRODUCTION_MIN_32_CHAR_RANDOM_HEX_OR_BASE64_KEY",
]);

export const MIN_SECRET_LENGTH = 32;
export const DEV_ONLY_FALLBACK_KEY = "cysle-dev-local-secret-not-for-production-min32bytes!";

export const JWT_ALGORITHM = "HS256" as const;
export const COOKIE_NAME = "texlink_session" as const;

export interface JwtValidationResult {
  secretKey: Uint8Array;
  rawLength: number;
  isDevFallback: boolean;
}

/**
 * Validates the JWT secret according to the current environment.
 * Throws a descriptive error (with secret value strictly redacted) if invalid in production.
 */
export function resolveJwtSecret(env: NodeJS.ProcessEnv = process.env): JwtValidationResult {
  const isProduction = env.NODE_ENV === "production";
  const configuredSecret = env.JWT_SECRET?.trim();

  if (!configuredSecret) {
    if (isProduction) {
      throw new Error(
        "FATAL_SECURITY_ERROR: JWT_SECRET environment variable is missing in production. Application startup aborted."
      );
    }
    if (env.NODE_ENV !== "test") {
      console.warn(
        "⚠️ [SECURITY WARNING] JWT_SECRET is not configured. Falling back to development-only mock key. THIS IS INSECURE FOR PRODUCTION."
      );
    }
    return {
      secretKey: new TextEncoder().encode(DEV_ONLY_FALLBACK_KEY),
      rawLength: DEV_ONLY_FALLBACK_KEY.length,
      isDevFallback: true,
    };
  }

  // Validate length
  if (configuredSecret.length < MIN_SECRET_LENGTH) {
    if (isProduction) {
      throw new Error(
        `FATAL_SECURITY_ERROR: JWT_SECRET does not meet minimum cryptographic length requirement (requires >= ${MIN_SECRET_LENGTH} characters; received ${configuredSecret.length} characters). Startup aborted.`
      );
    }
    if (env.NODE_ENV !== "test") {
      console.warn(
        `⚠️ [SECURITY WARNING] JWT_SECRET is shorter than ${MIN_SECRET_LENGTH} characters. Use a 256-bit key in production.`
      );
    }
  }

  // Validate against known insecure/placeholder secrets
  if (KNOWN_INSECURE_SECRETS.has(configuredSecret)) {
    if (isProduction) {
      throw new Error(
        "FATAL_SECURITY_ERROR: JWT_SECRET is set to a known insecure default/placeholder secret in production. Startup aborted."
      );
    }
    if (env.NODE_ENV !== "test") {
      console.warn(
        "⚠️ [SECURITY WARNING] JWT_SECRET matches a known insecure default. Change this before production deployment."
      );
    }
  }

  return {
    secretKey: new TextEncoder().encode(configuredSecret),
    rawLength: configuredSecret.length,
    isDevFallback: false,
  };
}

/**
 * Lazily or dynamically resolves the binary Uint8Array secret key.
 */
export function getJwtSecretKey(): Uint8Array {
  return resolveJwtSecret().secretKey;
}

/**
 * Generates a cryptographically strong, high-entropy production-grade JWT secret.
 * Generates 48 bytes (384 bits) of cryptographic entropy formatted as base64url.
 *
 * Safe production generation commands:
 *   openssl rand -base64 48
 *   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
 *   npm run jwt:generate
 */
export function generateCryptographicJwtSecret(byteLength: number = 48): string {
  if (byteLength < 32) {
    throw new Error("Cryptographic secret generation requires at least 32 bytes (256 bits) of entropy.");
  }
  return crypto.randomBytes(byteLength).toString("base64url");
}

/**
 * Asserts valid JWT cryptographic secret at application startup.
 * Called during Next.js server bootstrap via instrumentation.register().
 * In production, halts startup immediately if the secret is missing, weak (<32 chars),
 * or set to a known placeholder.
 */
export function assertProductionStartupJwtSecret(env: NodeJS.ProcessEnv = process.env): void {
  resolveJwtSecret(env);
}

