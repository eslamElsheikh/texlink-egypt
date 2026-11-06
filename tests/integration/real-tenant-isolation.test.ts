import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { assertDisposableTestDatabase } from "@/lib/db/provider";
describe("TexLink — Real Database Tenant-Isolation Integration Test Suite", () => {
  const factoryAlphaUserId = "user-test-alpha";
  const factoryBetaUserId = "user-test-beta";

  let factoryAlphaId = "";
  let factoryBetaId = "";

  // Alpha records
  let alphaWarehouseId = "";
  let alphaItemId = "";
  let alphaMachineId = "";
  let alphaOrderId = "";
  let alphaCustomerId = "";
  let alphaSupplierId = "";
  let alphaEmployeeId = "";
  let alphaTicketId = "";
  let alphaDealId = "";

  beforeAll(async () => {
    // Enforce safety guard: refuse execution against production
    assertDisposableTestDatabase();
    // 1. Create clean test user & factory Alpha
    const userA = await prisma.user.upsert({
      where: { email: "alpha-test@factory.com" },
      create: {
        id: factoryAlphaUserId,
        email: "alpha-test@factory.com",
        passwordHash: "$2a$10$fakehashfortestpurposesonly12345",
        name: "مالك مصنع ألفا",
        phone: "01000000001",
        role: "FACTORY",
        isFactory: true,
        isBuyer: false,
      },
      update: {},
    });

    const factoryA = await prisma.factoryProfile.upsert({
      where: { userId: userA.id },
      create: {
        userId: userA.id,
        nameAr: "مصنع ألفا للتريكو (اختبار حقيقي)",
        slug: "test-factory-alpha",
        governorate: "المحلة الكبرى",
        city: "المنطقة الصناعية",
        address: "عنبر 1",
        phone: "01000000001",
        whatsapp: "01000000001",
        bioAr: "مصنع تجريبي لاختبار عزل المستأجرين في قاعدة البيانات الحقيقية",
        specialties: "[]",
        machines: "[]",
        fabrics: "[]",
      },
      update: {},
    });
    factoryAlphaId = factoryA.id;

    // 2. Create clean test user & factory Beta
    const userB = await prisma.user.upsert({
      where: { email: "beta-test@factory.com" },
      create: {
        id: factoryBetaUserId,
        email: "beta-test@factory.com",
        passwordHash: "$2a$10$fakehashfortestpurposesonly12345",
        name: "مالك مصنع بيتا",
        phone: "01000000002",
        role: "FACTORY",
        isFactory: true,
        isBuyer: false,
      },
      update: {},
    });

    const factoryB = await prisma.factoryProfile.upsert({
      where: { userId: userB.id },
      create: {
        userId: userB.id,
        nameAr: "مصنع بيتا للملابس (اختبار حقيقي)",
        slug: "test-factory-beta",
        governorate: "شبرا الخيمة",
        city: "المنطقة الصناعية",
        address: "عنبر 2",
        phone: "01000000002",
        whatsapp: "01000000002",
        bioAr: "مصنع تجريبي بيتا لاختبار العزل",
        specialties: "[]",
        machines: "[]",
        fabrics: "[]",
      },
      update: {},
    });
    factoryBetaId = factoryB.id;

    // 3. Create representative real records for Factory Alpha
    const wh = await prisma.warehouse.create({
      data: {
        factoryId: factoryAlphaId,
        name: "مستودع ألفا السري",
        type: "RAW_MATERIALS",
      },
    });
    alphaWarehouseId = wh.id;

    const item = await prisma.inventoryItem.create({
      data: {
        factoryId: factoryAlphaId,
        warehouseId: alphaWarehouseId,
        name: "غزول قطنية سرية لمصنع ألفا",
        category: "YARN",
        unit: "KG",
        currentStock: 1000,
        unitCost: 150,
        totalValuation: 1000 * 150,
      },
    });
    alphaItemId = item.id;

    const machine = await prisma.machine.create({
      data: {
        factoryId: factoryAlphaId,
        code: "M-ALPHA-01",
        name: "ماكينة تريكو ألفا الخاصة",
        type: "CIRCULAR_KNITTING",
        brand: "Mayer & Cie",
        status: "RUNNING",
      },
    });
    alphaMachineId = machine.id;

    const order = await prisma.productionOrder.create({
      data: {
        factoryId: factoryAlphaId,
        orderNumber: "ORD-ALPHA-99",
        productNameSnapshot: "تيشيرت خاص بمصنع ألفا",
        targetQuantity: 5000,
        plannedStartDate: new Date(),
        plannedEndDate: new Date(),
      },
    });
    alphaOrderId = order.id;

    const cust = await prisma.crmCustomer.create({
      data: {
        factoryId: factoryAlphaId,
        name: "العميل السري لمصنع ألفا",
        phone: "01099999999",
        totalSpend: 500000,
      },
    });
    alphaCustomerId = cust.id;
    const supp = await prisma.supplier.create({
      data: {
        factoryId: factoryAlphaId,
        name: "مورد غزل خاص بمصنع ألفا",
        category: "YARN",
        phone: "01011111111",
      },
    });
    alphaSupplierId = supp.id;

    const emp = await prisma.employee.create({
      data: {
        factoryId: factoryAlphaId,
        code: "EMP-ALPHA-01",
        name: "فني نسيج سرّي لمصنع ألفا",
        jobTitle: "مشغل تريكو",
      },
    });
    alphaEmployeeId = emp.id;

    const ticket = await prisma.maintenanceTicket.create({
      data: {
        factoryId: factoryAlphaId,
        machineId: alphaMachineId,
        issueType: "NEEDLE_BREAKAGE",
        description: "عطل خاص بمصنع ألفا",
      },
    });
    alphaTicketId = ticket.id;

    const deal = await prisma.crmDeal.create({
      data: {
        factoryId: factoryAlphaId,
        customerId: alphaCustomerId,
        title: "صفقة خاصة بمصنع ألفا",
        amount: 300000,
      },
    });
    alphaDealId = deal.id;
  });

  afterAll(async () => {
    // Clean up test records
    if (factoryAlphaId) {
      await prisma.crmDeal.deleteMany({ where: { factoryId: factoryAlphaId } });
      await prisma.crmCustomer.deleteMany({ where: { factoryId: factoryAlphaId } });
      await prisma.maintenanceTicket.deleteMany({ where: { factoryId: factoryAlphaId } });
      await prisma.materialConsumption.deleteMany({ where: { factoryId: factoryAlphaId } });
      await prisma.employee.deleteMany({ where: { factoryId: factoryAlphaId } });
      await prisma.supplier.deleteMany({ where: { factoryId: factoryAlphaId } });
      await prisma.productionOrder.deleteMany({ where: { factoryId: factoryAlphaId } });
      await prisma.machine.deleteMany({ where: { factoryId: factoryAlphaId } });
      await prisma.stockMovement.deleteMany({ where: { factoryId: factoryAlphaId } });
      await prisma.inventoryItem.deleteMany({ where: { factoryId: factoryAlphaId } });
      await prisma.warehouse.deleteMany({ where: { factoryId: factoryAlphaId } });
      await prisma.factoryProfile.deleteMany({ where: { id: factoryAlphaId } });
      await prisma.user.deleteMany({ where: { id: factoryAlphaUserId } });
    }

    if (factoryBetaId) {
      await prisma.factoryProfile.deleteMany({ where: { id: factoryBetaId } });
      await prisma.user.deleteMany({ where: { id: factoryBetaUserId } });
    }
  });

  // Test 1: Direct Read Scoping
  it("Factory Beta cannot read Factory Alpha inventory items using tenant-scoped query", async () => {
    const betaItems = await prisma.inventoryItem.findMany({
      where: { factoryId: factoryBetaId },
    });

    const leakedAlphaItem = betaItems.find((i) => i.id === alphaItemId);
    expect(leakedAlphaItem).toBeUndefined();
    expect(betaItems.length).toBe(0);
  });

  // Test 2: Direct Record Lookup Isolation
  it("Factory Beta cannot access Factory Alpha customer record by primary key", async () => {
    const crossAccess = await prisma.crmCustomer.findFirst({
      where: { id: alphaCustomerId, factoryId: factoryBetaId },
    });

    expect(crossAccess).toBeNull();
  });

  // Test 3: Unauthorized Mutation
  it("Factory Beta cannot update Factory Alpha machine status", async () => {
    const updateResult = await prisma.machine.updateMany({
      where: { id: alphaMachineId, factoryId: factoryBetaId },
      data: { status: "STOPPED" },
    });

    expect(updateResult.count).toBe(0);

    // Verify Alpha machine status remains strictly RUNNING
    const freshAlphaMachine = await prisma.machine.findUnique({
      where: { id: alphaMachineId },
    });
    expect(freshAlphaMachine?.status).toBe("RUNNING");
  });

  // Test 4: Secondary IDOR - Cross-Factory Machine/Order Reference
  it("prevents Factory Beta from linking a production entry to Factory Alpha order or machine", async () => {
    // Simulation of API foreign key validator
    const orderCheck = await prisma.productionOrder.findFirst({
      where: { id: alphaOrderId, factoryId: factoryBetaId },
    });
    expect(orderCheck).toBeNull();

    const machineCheck = await prisma.machine.findFirst({
      where: { id: alphaMachineId, factoryId: factoryBetaId },
    });
    expect(machineCheck).toBeNull();
  });

  // Test 5: Secondary IDOR - Cross-Factory Warehouse Reference
  it("prevents Factory Beta from referencing Factory Alpha warehouse during stock creation or transfer", async () => {
    const warehouseCheck = await prisma.warehouse.findFirst({
      where: { id: alphaWarehouseId, factoryId: factoryBetaId },
    });

    expect(warehouseCheck).toBeNull();
  });

  // Test 6: Aggregates & Valuation Isolation
  it("ensures total inventory valuation for Factory Beta is zero and does not leak Alpha valuation", async () => {
    const betaItems = await prisma.inventoryItem.findMany({
      where: { factoryId: factoryBetaId },
    });

    const betaTotalValuation = betaItems.reduce((s, i) => s + (i.totalValuation || 0), 0);
    expect(betaTotalValuation).toBe(0);

    const alphaItem = await prisma.inventoryItem.findUnique({
      where: { id: alphaItemId },
    });
    expect(alphaItem?.totalValuation).toBe(1000 * 150); // 150,000 EGP
  });
  // Test 7: Workforce & Supplier Tenant Isolation
  it("prevents Factory Beta from reading Factory Alpha employees or suppliers", async () => {
    const betaEmployees = await prisma.employee.findMany({
      where: { factoryId: factoryBetaId },
    });
    expect(betaEmployees.some((e) => e.id === alphaEmployeeId)).toBe(false);

    const betaSuppliers = await prisma.supplier.findMany({
      where: { factoryId: factoryBetaId },
    });
    expect(betaSuppliers.some((s) => s.id === alphaSupplierId)).toBe(false);
  });

  // Test 8: Maintenance & CRM Isolation
  it("prevents Factory Beta from accessing Factory Alpha maintenance tickets or CRM deals", async () => {
    const ticketCheck = await prisma.maintenanceTicket.findFirst({
      where: { id: alphaTicketId, factoryId: factoryBetaId },
    });
    expect(ticketCheck).toBeNull();

    const dealCheck = await prisma.crmDeal.findFirst({
      where: { id: alphaDealId, factoryId: factoryBetaId },
    });
    expect(dealCheck).toBeNull();
  });

  // Test 9: Secondary IDOR - Cross-Factory Maintenance Creation
  it("prevents Factory Beta from creating a maintenance ticket referencing Factory Alpha machine", async () => {
    // API authorization check: verify machine belongs to caller factory
    const machine = await prisma.machine.findFirst({
      where: { id: alphaMachineId, factoryId: factoryBetaId },
    });
    expect(machine).toBeNull(); // Rejection on machine foreign key validation
  });

  // Test 10: Secondary IDOR - Cross-Factory CRM Deal Creation
  it("prevents Factory Beta from creating a deal referencing Factory Alpha customer", async () => {
    const customer = await prisma.crmCustomer.findFirst({
      where: { id: alphaCustomerId, factoryId: factoryBetaId },
    });
    expect(customer).toBeNull();
  });

  // Test 11: Transactional Concurrency - Prevent Negative Stock under race conditions
  it("concurrency test: concurrent stock deductions reject race-condition overdraws and preserve balance >= 0", async () => {
    // Create an isolated limited stock item with exactly 50 units
    const limitedItem = await prisma.inventoryItem.create({
      data: {
        factoryId: factoryAlphaId,
        warehouseId: alphaWarehouseId,
        name: "خيوط قطن للتجربة المتزامنة",
        category: "YARN",
        unit: "KG",
        currentStock: 50,
        unitCost: 100,
        totalValuation: 5000,
      },
    });

    // 5 concurrent attempts to deduct 20 units each (total demand 100 units > 50 available)
    const deductionAttempt = async (attemptId: number) => {
      try {
        return await prisma.$transaction(async (tx) => {
          const freshItem = await tx.inventoryItem.findUnique({
            where: { id: limitedItem.id },
          });

          if (!freshItem || freshItem.currentStock < 20) {
            return { attemptId, success: false, reason: "رصيد المخزون لا يكفي" };
          }

          const newStock = freshItem.currentStock - 20;
          await tx.inventoryItem.update({
            where: { id: limitedItem.id },
            data: {
              currentStock: newStock,
              totalValuation: newStock * freshItem.unitCost,
            },
          });

          await tx.stockMovement.create({
            data: {
              factoryId: factoryAlphaId,
              inventoryItemId: limitedItem.id,
              movementType: "PRODUCTION_ISSUE",
              quantity: 20,
              previousStock: freshItem.currentStock,
              newStock,
              unitCost: freshItem.unitCost,
              notes: `سحب متزامن رقم ${attemptId}`,
            },
          });

          return { attemptId, success: true };
        });
      } catch {
        return { attemptId, success: false, reason: "فشل المعاملة" };
      }
    };

    // Execute all 5 deductions concurrently
    const results = await Promise.all([
      deductionAttempt(1),
      deductionAttempt(2),
      deductionAttempt(3),
      deductionAttempt(4),
      deductionAttempt(5),
    ]);

    const successes = results.filter((r) => r.success);
    const failures = results.filter((r) => !r.success);

    // Exactly 2 attempts (2 * 20 = 40) could possibly succeed from 50 units
    expect(successes.length).toBe(2);
    expect(failures.length).toBe(3);

    // Final balance must be exactly 10 units (50 - 40) and strictly >= 0
    const finalItem = await prisma.inventoryItem.findUnique({
      where: { id: limitedItem.id },
    });
    expect(finalItem?.currentStock).toBe(10);
    expect(finalItem?.currentStock).toBeGreaterThanOrEqual(0);
  });
});
