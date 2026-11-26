/**
 * TexLink — SQLite to PostgreSQL Production Data Migration Tool
 * Safely transfers all records from SQLite dev.db into target PostgreSQL database
 * respecting foreign-key topological order and converting data types accurately.
 */

import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

interface MigrationStats {
  table: string;
  count: number;
}

export function redactDatabaseUrl(rawUrl: string): string {
  if (!rawUrl) return rawUrl;
  let shouldFallbackRegex = false;
  try {
    const parsed = new URL(rawUrl);
    if (parsed.username || parsed.password) {
      parsed.username = parsed.username ? "***" : "";
      parsed.password = parsed.password ? "***" : "";
      return parsed.toString();
    }
    // WHATWG URL treats unescaped `#` or `?` in userinfo as hash/search rather than throwing.
    if (
      parsed.hash.includes("@") ||
      (parsed.search.includes("@") && !parsed.pathname.includes("@"))
    ) {
      shouldFallbackRegex = true;
    } else {
      return rawUrl;
    }
  } catch {
    shouldFallbackRegex = true;
  }

  if (!shouldFallbackRegex) return rawUrl;

  return rawUrl.replace(
    /([a-zA-Z][a-zA-Z0-9+.-]*:\/\/)([^\s]+)@([^\s@]+)$/g,
    (_match, scheme: string, userInfo: string, targetHost: string) =>
      `${scheme}${userInfo.includes(":") ? "***:***" : "***"}@${targetHost}`
  );
}

function redactInlineUrls(text: string): string {
  return text.replace(
    /([a-zA-Z][a-zA-Z0-9+.-]*:\/\/)([^\s"'`<>@]+(?:@[^\s"'`<>@]+)*)@([^\s"'`<>@]+)/g,
    (_match, scheme: string, userInfo: string, targetHost: string) =>
      `${scheme}${userInfo.includes(":") ? "***:***" : "***"}@${targetHost}`
  );
}

function extractRawCredentials(rawUrl?: string): { password?: string } {
  if (!rawUrl) return {};
  try {
    const parsed = new URL(rawUrl);
    if (parsed.password) {
      return { password: decodeURIComponent(parsed.password) };
    }
  } catch {
    const m = rawUrl.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^:\s/]+:([^\s]+)@[^\s@]+$/);
    if (m?.[1]) return { password: m[1] };
  }
  return {};
}

function formatErrorWithCauses(
  error: unknown,
  visited: Set<object> = new Set(),
  depth: number = 0
): string {
  if (depth > 5) return "[truncated error chain]";
  if (error === null || error === undefined) return String(error);
  if (typeof error !== "object") return String(error);
  if (visited.has(error)) return "[circular error reference]";
  visited.add(error);

  const errObj = error as {
    message?: unknown;
    cause?: unknown;
    errors?: unknown[];
    detail?: unknown;
  };
  const parts: string[] = [];
  if (typeof errObj.message === "string" && errObj.message.length > 0) {
    parts.push(errObj.message);
  } else if (error instanceof Error) {
    parts.push(error.name || "Error");
  } else {
    try {
      parts.push(JSON.stringify(error));
    } catch {
      parts.push(String(error));
    }
  }

  if (typeof errObj.detail === "string" && errObj.detail.length > 0) {
    parts.push(`detail: ${errObj.detail}`);
  }
  if (Array.isArray(errObj.errors) && errObj.errors.length > 0) {
    const nested = errObj.errors
      .slice(0, 5)
      .map((item) => formatErrorWithCauses(item, visited, depth + 1));
    parts.push(`errors: [${nested.join("; ")}]`);
  }
  if (errObj.cause !== undefined) {
    parts.push(`cause: ${formatErrorWithCauses(errObj.cause, visited, depth + 1)}`);
  }

  return parts.join(" | ");
}

export function sanitizeErrorMessage(error: unknown, rawUrl?: string): string {
  let msg = formatErrorWithCauses(error);
  if (rawUrl) {
    const redactedTarget = redactDatabaseUrl(rawUrl);
    if (msg.includes(rawUrl)) {
      msg = msg.split(rawUrl).join(redactedTarget);
    }
    const { password } = extractRawCredentials(rawUrl);
    if (password && password.length >= 6 && msg.includes(password)) {
      msg = msg.split(password).join("***");
    }
  }
  return redactInlineUrls(msg);
}

export async function migrateSqliteToPostgres(
  postgresUrl: string = "postgresql://postgres:postgres@localhost:5432/texlink_test"
): Promise<{ success: boolean; stats: MigrationStats[]; error?: string }> {
  console.log(`Starting data migration: SQLite -> PostgreSQL`);
  console.log(`Target: ${redactDatabaseUrl(postgresUrl)}`);

  const sourcePrisma = new PrismaClient();
  const pool = new Pool({ connectionString: postgresUrl });

  const stats: MigrationStats[] = [];

  try {
    const client = await pool.connect();

    async function copyTable<T extends Record<string, unknown>>(
      tableName: string,
      fetchFn: () => Promise<T[]>
    ) {
      const items = await fetchFn();
      if (items.length === 0) {
        stats.push({ table: tableName, count: 0 });
        console.log(`  - ${tableName}: 0 records`);
        return;
      }

      const columns = Object.keys(items[0]);
      const quotedCols = columns.map((c) => `"${c}"`).join(", ");

      for (const item of items) {
        const values = columns.map((c) => {
          const val = item[c];
          if (val instanceof Date) return val.toISOString();
          return val;
        });
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
        const query = `
          INSERT INTO "${tableName}" (${quotedCols})
          VALUES (${placeholders})
          ON CONFLICT ("id") DO NOTHING;
        `;
        await client.query(query, values);
      }

      stats.push({ table: tableName, count: items.length });
      console.log(`  ✓ Migrated ${tableName}: ${items.length} records`);
    }

    // Level 0: Independent entities
    await copyTable("User", () => sourcePrisma.user.findMany());
    await copyTable("Category", () => sourcePrisma.category.findMany());

    // Level 1: User-dependent profiles
    await copyTable("FactoryProfile", () => sourcePrisma.factoryProfile.findMany());
    await copyTable("BuyerProfile", () => sourcePrisma.buyerProfile.findMany());
    await copyTable("AuditLog", () => sourcePrisma.auditLog.findMany());
    await copyTable("Notification", () => sourcePrisma.notification.findMany());

    // Level 2: Factory-dependent entities
    await copyTable("FactorySettings", () => sourcePrisma.factorySettings.findMany());
    await copyTable("Machine", () => sourcePrisma.machine.findMany());
    await copyTable("FactoryProduct", () => sourcePrisma.factoryProduct.findMany());
    await copyTable("Warehouse", () => sourcePrisma.warehouse.findMany());
    await copyTable("Employee", () => sourcePrisma.employee.findMany());
    await copyTable("Shift", () => sourcePrisma.shift.findMany());
    await copyTable("Supplier", () => sourcePrisma.supplier.findMany());
    await copyTable("Product", () => sourcePrisma.product.findMany());
    await copyTable("CrmCustomer", () => sourcePrisma.crmCustomer.findMany());

    // Level 3: Secondary dependencies
    await copyTable("InventoryItem", () => sourcePrisma.inventoryItem.findMany());
    await copyTable("ProductionOrder", () => sourcePrisma.productionOrder.findMany());
    await copyTable("AttendanceRecord", () => sourcePrisma.attendanceRecord.findMany());
    await copyTable("CrmLead", () => sourcePrisma.crmLead.findMany());

    // Level 4: Operational entries and transactions
    await copyTable("ProductionEntry", () => sourcePrisma.productionEntry.findMany());
    await copyTable("MaintenanceTicket", () => sourcePrisma.maintenanceTicket.findMany());
    await copyTable("StockMovement", () => sourcePrisma.stockMovement.findMany());
    await copyTable("Expense", () => sourcePrisma.expense.findMany());
    await copyTable("CrmDeal", () => sourcePrisma.crmDeal.findMany());

    // Level 5: Detailed tickets and metrics
    await copyTable("WasteRecord", () => sourcePrisma.wasteRecord.findMany());
    await copyTable("ProductionCost", () => sourcePrisma.productionCost.findMany());
    await copyTable("CrmFollowUp", () => sourcePrisma.crmFollowUp.findMany());
    await copyTable("CrmActivity", () => sourcePrisma.crmActivity.findMany());

    client.release();
    console.log(`\n✓ Migration completed successfully. Total tables: ${stats.length}`);
    return { success: true, stats };
  } catch (error: unknown) {
    const safeError = sanitizeErrorMessage(error, postgresUrl);
    console.error(`Migration error: ${safeError}`);
    return {
      success: false,
      stats,
      error: safeError,
    };
  } finally {
    await sourcePrisma.$disconnect();
    await pool.end();
  }
}

export async function runCli(
  runMigration: () => Promise<{ success: boolean; stats: MigrationStats[]; error?: string }> = migrateSqliteToPostgres
): Promise<number> {
  try {
    const result = await runMigration();
    if (!result.success) {
      console.error("Migration failed:", sanitizeErrorMessage(result.error));
      return 1;
    }
    return 0;
  } catch (err) {
    console.error("Migration crashed:", sanitizeErrorMessage(err));
    return 1;
  }
}

if (require.main === module) {
  runCli().then((code) => process.exit(code));
}
