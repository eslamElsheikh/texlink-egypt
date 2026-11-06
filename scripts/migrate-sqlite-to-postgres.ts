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

export async function migrateSqliteToPostgres(
  postgresUrl: string = "postgresql://postgres:postgres@localhost:5432/texlink_test"
): Promise<{ success: boolean; stats: MigrationStats[]; error?: string }> {
  console.log(`Starting data migration: SQLite -> PostgreSQL`);
  console.log(`Target: ${postgresUrl}`);

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
    console.error(`Migration error:`, error);
    return {
      success: false,
      stats,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    await sourcePrisma.$disconnect();
    await pool.end();
  }
}

if (require.main === module) {
  migrateSqliteToPostgres()
    .then((result) => {
      if (!result.success) {
        console.error("Migration failed:", result.error);
        process.exit(1);
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
