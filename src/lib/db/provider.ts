/**
 * Database Provider Inspector and Migration Strategy
 *
 * Handles detection of active database engine:
 * - SQLite for local testing and zero-setup development ("file:./dev.db")
 * - PostgreSQL for staging and high-concurrency production deployments ("postgresql://...")
 */

export type DatabaseEngine = "sqlite" | "postgresql";

export function getActiveDatabaseEngine(): DatabaseEngine {
  const url = process.env.DATABASE_URL || "";
  if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
    return "postgresql";
  }
  return "sqlite";
}

export function isProductionPostgres(): boolean {
  return getActiveDatabaseEngine() === "postgresql";
}

export const DATABASE_CAPABILITIES = {
  sqlite: {
    engine: "sqlite",
    concurrencyModel: "file-lock",
    rowLevelLocking: false,
    decimalType: "float-representation",
    supportsConcurrentDeductions: true, // Handled via interactive serializable transactions
    recommendedEnv: ["development", "test"],
  },
  postgresql: {
    engine: "postgresql",
    concurrencyModel: "multiversion-concurrency-control-mvcc",
    rowLevelLocking: true, // FOR UPDATE row locking
    decimalType: "arbitrary-precision-numeric",
    supportsConcurrentDeductions: true,
    recommendedEnv: ["staging", "production"],
  },
} as const;

/**
 * Safety guard: Asserts that a target database connection is explicitly a disposable test database.
 * Prevents running destructive integration tests or test teardowns against production databases.
 */
export function assertDisposableTestDatabase(url?: string): void {
  const targetUrl = url || process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || "";
  if (!targetUrl) {
    throw new Error("No database URL provided for safety check.");
  }

  const lower = targetUrl.toLowerCase();

  // Explicit rejection of production indicators
  const isProductionKeywords =
    lower.includes("prod") ||
    lower.includes("live") ||
    lower.includes("production") ||
    lower.includes("aws.com") ||
    lower.includes("rds.amazonaws") ||
    lower.includes("supabase.co") ||
    lower.includes("neon.tech");

  if (isProductionKeywords && !lower.includes("test")) {
    throw new Error(
      `[SAFETY GUARD] Operation aborted: "${targetUrl}" appears to be a production database. Tests must run exclusively against an isolated disposable database.`
    );
  }

  // Accept explicit test / staging / local dev databases
  const isAllowedTestDb =
    lower.includes("test") ||
    lower.includes("staging") ||
    lower.includes("dev.db") ||
    lower.includes("localhost") ||
    lower.includes("127.0.0.1") ||
    lower.startsWith("file:");

  if (!isAllowedTestDb) {
    throw new Error(
      `[SAFETY GUARD] Database "${targetUrl}" cannot be verified as an isolated disposable test database. Name must contain 'test', 'staging', or be local SQLite.`
    );
  }
}
