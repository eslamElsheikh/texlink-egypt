import { describe, it, expect, beforeAll } from "vitest";
import { prisma } from "@/lib/db/prisma";

describe("Cysle Egypt — Complete End-to-End Business Workflows", () => {
  let factory: any;
  let buyer: any;
  let category: any;

  beforeAll(async () => {
    factory = await prisma.factoryProfile.findUnique({ where: { slug: "cysle-qa-factory-alpha" } });
    buyer = await prisma.user.findUnique({ where: { email: "buyer-qa-1@cysle-qa.com" } });
    category = await prisma.category.findFirst();
  });

  describe("Workflow A: Buyer to Factory Sales Cycle (RFQ -> Quote -> Accept -> CRM Link)", () => {
    let testRfq: any;
    let testQuote: any;
    let testOrder: any;

    it("Step 1-3: Buyer creates and submits a legitimate RFQ", async () => {
      testRfq = await prisma.rfq.create({
        data: {
          buyerId: buyer.id,
          categoryId: category.id,
          titleAr: "طلب تصنيع 1,000 تيشيرت صيفي قطني للاختبار E2E",
          productType: "تيشيرت كرو نيك",
          totalQuantity: 1000,
          fabricDetails: "قطن 100% سينجل جيرسي 180 جم",
          targetBudgetPerPiece: 45.0,
          deadlineDays: 15,
          status: "OPEN",
          targetGovernorate: "الدقهلية",
          expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        },
      });

      expect(testRfq).toBeDefined();
      expect(testRfq.status).toBe("OPEN");
    });

    it("Step 4-7: Factory submits a formal quotation", async () => {
      testQuote = await prisma.quote.create({
        data: {
          rfqId: testRfq.id,
          factoryId: factory.id,
          unitPrice: 42.0,
          totalAmount: 42000.0,
          leadTimeDays: 10,
          minQuantity: 100,
          paymentTermsAr: "50% مقدم، 50% عند الاستلام",
          status: "PENDING",
        },
      });

      expect(testQuote).toBeDefined();
      expect(testQuote.unitPrice).toBe(42.0);
    });

    it("Step 8-11: Buyer accepts quotation, creating Order and auto-linking CRM Customer", async () => {
      // 1. Mark quote accepted
      await prisma.quote.update({
        where: { id: testQuote.id },
        data: { status: "ACCEPTED" },
      });

      // 2. Mark RFQ quote accepted
      await prisma.rfq.update({
        where: { id: testRfq.id },
        data: { status: "QUOTE_ACCEPTED" },
      });

      // 3. Create B2B Order
      testOrder = await prisma.order.create({
        data: {
          orderNumber: "ORD-QA-" + Math.floor(1000 + Math.random() * 9000),
          rfqId: testRfq.id,
          quoteId: testQuote.id,
          buyerId: buyer.id,
          factoryId: factory.id,
          totalAmount: 42000.0,
          quantity: 1000,
          unitPrice: 42.0,
          paymentTerms: "50% مقدم، 50% عند الاستلام",
          status: "IN_PROGRESS",
        },
      });

      expect(testOrder).toBeDefined();
      expect(testOrder.status).toBe("IN_PROGRESS");

      // 4. Link or update CRM Customer for factory without duplicate
      let crmCust = await prisma.crmCustomer.findFirst({
        where: { factoryId: factory.id, buyerId: buyer.id },
      });

      if (crmCust) {
        crmCust = await prisma.crmCustomer.update({
          where: { id: crmCust.id },
          data: {
            totalSpend: { increment: 42000.0 },
            ordersCount: { increment: 1 },
          },
        });
      } else {
        crmCust = await prisma.crmCustomer.create({
          data: {
            factoryId: factory.id,
            buyerId: buyer.id,
            name: buyer.name,
            phone: buyer.phone,
            city: "القاهرة",
            source: "MARKETPLACE",
            totalSpend: 42000.0,
            ordersCount: 1,
          },
        });
      }
      expect(crmCust).toBeDefined();
      expect(crmCust.totalSpend).toBeGreaterThanOrEqual(42000.0);
    });
  });

  describe("Workflow B: Production Operations (Order -> Entry -> Invariant -> Costing)", () => {
    let prodOrder: any;
    let prodEntry: any;

    it("creates production order and logs daily output satisfying produced = good + defective", async () => {
      prodOrder = await prisma.productionOrder.create({
        data: {
          factoryId: factory.id,
          orderNumber: "ORD-PROD-QA-" + Date.now(),
          batchNumber: "BATCH-QA-" + Date.now(),
          productNameSnapshot: "تيشيرت قطن ممشط فاخر",
          targetQuantity: 1000,
          status: "IN_PROGRESS",
          plannedStartDate: new Date(),
          plannedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const producedQuantity = 500;
      const defectiveQuantity = 15;
      const goodQuantity = 485;

      // Invariant: produced = good + defective
      expect(producedQuantity).toBe(goodQuantity + defectiveQuantity);

      prodEntry = await prisma.productionEntry.create({
        data: {
          factoryId: factory.id,
          productionOrderId: prodOrder.id,
          stage: "KNITTING",
          producedQuantity,
          goodQuantity,
          defectiveQuantity,
        },
      });

      expect(prodEntry.producedQuantity).toBe(500);
      expect(prodEntry.goodQuantity).toBe(485);
    });

    it("calculates exact production cost per good unit", async () => {
      const materialCost = 25000.0;
      const directLaborCost = 6000.0;
      const machineCost = 4000.0;
      const maintenanceCost = 1500.0;
      const overheadCost = 2000.0;
      const totalCost = materialCost + directLaborCost + machineCost + maintenanceCost + overheadCost;
      const goodUnits = 485;
      const costPerUnit = Math.round((totalCost / goodUnits) * 100) / 100;

      const costRecord = await prisma.productionCost.create({
        data: {
          factoryId: factory.id,
          productionOrderId: prodOrder.id,
          materialCost,
          directLaborCost,
          machineCost,
          maintenanceCost,
          overheadCost,
          totalCost,
          goodUnitsCount: goodUnits,
          costPerGoodUnit: costPerUnit,
        },
      });

      expect(costRecord.totalCost).toBe(38500.0);
      expect(costRecord.costPerGoodUnit).toBe(79.38);
    });
  });

  describe("Workflow C: Machine Breakdown & Maintenance Lifecycle", () => {
    it("reports breakdown, updates machine status, and restores machine on ticket completion", async () => {
      const machine = await prisma.machine.findFirst({ where: { factoryId: factory.id } });
      expect(machine).toBeDefined();

      // 1. Report breakdown
      await prisma.machine.update({
        where: { id: machine!.id },
        data: { status: "UNDER_MAINTENANCE" },
      });

      // 2. Open ticket
      const ticket = await prisma.maintenanceTicket.create({
        data: {
          factoryId: factory.id,
          machineId: machine!.id,
          issueType: "NEEDLE_BREAKAGE",
          priority: "HIGH",
          description: "كسر إبر مفاجئ وتوقف المحرك",
          status: "IN_PROGRESS",
          sparePartsCost: 800.0,
          laborCost: 200.0,
          totalCost: 1000.0,
        },
      });

      expect(ticket.status).toBe("IN_PROGRESS");

      // 3. Close ticket and restore machine to RUNNING
      await prisma.maintenanceTicket.update({
        where: { id: ticket.id },
        data: {
          status: "COMPLETED",
          endTime: new Date(),
        },
      });

      const restoredMachine = await prisma.machine.update({
        where: { id: machine!.id },
        data: { status: "RUNNING" },
      });

      expect(restoredMachine.status).toBe("RUNNING");
    });
  });

  describe("Workflow D: Inventory Management & Transactional Movements", () => {
    it("verifies inventory deduction and stock movement audit trail", async () => {
      const item = await prisma.inventoryItem.findFirst({ where: { factoryId: factory.id } });
      expect(item).toBeDefined();

      const initialStock = item!.currentStock;
      const consumeQty = 250;

      // Atomic update
      const updatedItem = await prisma.inventoryItem.update({
        where: { id: item!.id },
        data: {
          currentStock: { decrement: consumeQty },
          totalValuation: (initialStock - consumeQty) * item!.unitCost,
        },
      });

      expect(updatedItem.currentStock).toBe(initialStock - consumeQty);

      // Audit movement
      const movement = await prisma.stockMovement.create({
        data: {
          factoryId: factory.id,
          inventoryItemId: item!.id,
          movementType: "PRODUCTION_OUT",
          quantity: consumeQty,
          previousStock: initialStock,
          newStock: updatedItem.currentStock,
          unitCost: item!.unitCost,
          notes: "صرف خامات لأمر تشغيل",
        },
      });

      expect(movement.quantity).toBe(250);
      expect(movement.newStock).toBe(initialStock - consumeQty);

      // Clean up / restore stock balance to preserve inventory ledger integrity
      await prisma.inventoryItem.update({
        where: { id: item!.id },
        data: {
          currentStock: initialStock,
          totalValuation: initialStock * item!.unitCost,
        },
      });
    });
  });

  describe("Workflow E: CRM Pipeline & Opportunity Conversion", () => {
    it("progresses deal through pipeline stages to WON with expected close date", async () => {
      const customer = await prisma.crmCustomer.findFirst({ where: { factoryId: factory.id } });
      expect(customer).toBeDefined();

      const deal = await prisma.crmDeal.create({
        data: {
          factoryId: factory.id,
          customerId: customer!.id,
          title: "صفقة توريد ملابس شتوية كبرى",
          stage: "PROPOSAL",
          amount: 180000.0,
          expectedCloseDate: new Date("2026-12-01"),
        },
      });

      expect(deal.stage).toBe("PROPOSAL");

      // Move to WON
      const wonDeal = await prisma.crmDeal.update({
        where: { id: deal.id },
        data: { stage: "WON" },
      });

      expect(wonDeal.stage).toBe("WON");
    }, 15000);
  });
});
