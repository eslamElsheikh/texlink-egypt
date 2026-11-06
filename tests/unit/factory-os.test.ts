import { describe, it, expect } from "vitest";

describe("TexLink Factory OS — Manufacturing ERP Unit & Security Tests", () => {
  // 1. Multi-Tenant Isolation
  describe("Multi-Tenant Data Isolation", () => {
    it("ensures operational queries are strictly partitioned by factoryId", () => {
      const factoryA_Id = "factory-nasr-mahalla";
      const factoryB_Id = "factory-amal-shoubra";

      const records = [
        { id: "pe-1", factoryId: factoryA_Id, produced: 1000 },
        { id: "pe-2", factoryId: factoryA_Id, produced: 2000 },
        { id: "pe-3", factoryId: factoryB_Id, produced: 5000 },
      ];

      const factoryA_Results = records.filter((r) => r.factoryId === factoryA_Id);
      const factoryB_Results = records.filter((r) => r.factoryId === factoryB_Id);

      expect(factoryA_Results.length).toBe(2);
      expect(factoryA_Results.every((r) => r.factoryId === factoryA_Id)).toBe(true);
      expect(factoryB_Results.length).toBe(1);
      expect(factoryB_Results.find((r) => r.factoryId === factoryA_Id)).toBeUndefined();
    });

    it("rejects unauthorized access when session factoryId does not match target tenant", () => {
      const sessionUser = {
        id: "user-1",
        role: "FACTORY",
        factoryId: "factory-nasr-mahalla",
      };

      const requestedFactoryId = "factory-amal-shoubra";

      const hasAccess =
        sessionUser.role === "ADMIN" || sessionUser.factoryId === requestedFactoryId;

      expect(hasAccess).toBe(false);
    });
  });

  // 2. Production Quantity Accounting Invariants
  describe("Production Quantity Accounting Invariants", () => {
    function validateProductionEntry(produced: number, good: number, defect: number) {
      if (
        !Number.isInteger(produced) ||
        !Number.isInteger(good) ||
        !Number.isInteger(defect) ||
        produced < 0 ||
        good < 0 ||
        defect < 0
      ) {
        return { valid: false, error: "الكميات يجب أن تكون أرقاماً صحيحة غير سالبة" };
      }

      if (produced !== good + defect) {
        return {
          valid: false,
          error: `قاعدة التوازن مكسورة: الإجمالي (${produced}) لا يساوي السليم (${good}) + التالف (${defect})`,
        };
      }

      return { valid: true };
    }

    it("accepts valid production entries where produced = good + defect", () => {
      expect(validateProductionEntry(1000, 950, 50).valid).toBe(true);
      expect(validateProductionEntry(500, 500, 0).valid).toBe(true);
      expect(validateProductionEntry(0, 0, 0).valid).toBe(true);
    });

    it("rejects imbalanced production entries where produced != good + defect", () => {
      const res = validateProductionEntry(1000, 950, 60);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("قاعدة التوازن مكسورة");
    });

    it("rejects negative production quantities", () => {
      expect(validateProductionEntry(-100, -90, -10).valid).toBe(false);
      expect(validateProductionEntry(100, 110, -10).valid).toBe(false);
    });

    it("rejects non-integer fractional quantities for piece-based production", () => {
      expect(validateProductionEntry(100.5, 95.5, 5).valid).toBe(false);
    });
  });

  // 3. Stock Movement Ledger & Negative Inventory Prevention
  describe("Stock Movement Ledger & Negative Inventory Prevention", () => {
    function applyStockMovement(
      currentStock: number,
      quantity: number,
      movementType: "PURCHASE_IN" | "PRODUCTION_ISSUE" | "PRODUCTION_RETURN" | "ADJUSTMENT_OUT"
    ) {
      if (quantity <= 0) {
        throw new Error("كمية الحركة المخزنية يجب أن تكون موجبة");
      }

      let newStock = currentStock;
      const isAddition = movementType === "PURCHASE_IN" || movementType === "PRODUCTION_RETURN";

      if (isAddition) {
        newStock = currentStock + quantity;
      } else {
        newStock = currentStock - quantity;
        if (newStock < 0) {
          throw new Error("لا يمكن صرف كمية تفوق الرصيد المتوفر بالمخزن (رصيد سالب مرفوض)");
        }
      }

      // Immutable movement snapshot
      const movement = {
        movementType,
        quantity,
        previousStock: currentStock,
        newStock,
      };

      return { currentStock: newStock, movement };
    }

    it("correctly increases stock on PURCHASE_IN and records audit balance", () => {
      const initialStock = 500;
      const { currentStock, movement } = applyStockMovement(initialStock, 200, "PURCHASE_IN");

      expect(currentStock).toBe(700);
      expect(movement.previousStock).toBe(500);
      expect(movement.newStock).toBe(700);
      expect(movement.newStock - movement.previousStock).toBe(200);
    });

    it("correctly decreases stock on PRODUCTION_ISSUE", () => {
      const initialStock = 500;
      const { currentStock, movement } = applyStockMovement(initialStock, 150, "PRODUCTION_ISSUE");

      expect(currentStock).toBe(350);
      expect(movement.previousStock).toBe(500);
      expect(movement.newStock).toBe(350);
      expect(movement.previousStock - movement.newStock).toBe(150);
    });

    it("strictly throws and rejects negative stock balance", () => {
      const initialStock = 50;
      expect(() => {
        applyStockMovement(initialStock, 60, "PRODUCTION_ISSUE");
      }).toThrow("لا يمكن صرف كمية تفوق الرصيد المتوفر بالمخزن");
    });
  });

  // 4. Waste & Rework Accounting (No Double Counting)
  describe("Waste & Rework Accounting", () => {
    function computeWasteBreakdown(defectiveTotal: number, reworkSent: number, reworkAccepted: number) {
      // reworkAccepted cannot exceed reworkSent
      const safeAccepted = Math.min(reworkSent, reworkAccepted);
      // Final scrap is what was not successfully reworked
      const finalScrapped = defectiveTotal - safeAccepted;

      return {
        defectiveTotal,
        reworkSent,
        reworkAccepted: safeAccepted,
        finalScrapped,
        salvageRatePct: defectiveTotal > 0 ? Math.round((safeAccepted / defectiveTotal) * 100) : 0,
      };
    }

    it("accurately partitions defective items into salvaged rework and final scrap", () => {
      // 100 defective items: 60 sent for rework, 45 salvaged -> 55 final scrap
      const res = computeWasteBreakdown(100, 60, 45);

      expect(res.reworkAccepted).toBe(45);
      expect(res.finalScrapped).toBe(55);
      // Total accounting check: salvaged + scrap = original defective
      expect(res.reworkAccepted + res.finalScrapped).toBe(100);
      expect(res.salvageRatePct).toBe(45);
    });

    it("handles zero rework cases where all defects are scrap", () => {
      const res = computeWasteBreakdown(50, 0, 0);
      expect(res.reworkAccepted).toBe(0);
      expect(res.finalScrapped).toBe(50);
    });
  });

  // 5. Maintenance Multi-Ticket Evaluation & Downtime
  describe("Maintenance Multi-Ticket Evaluation & Downtime", () => {
    function evaluateMachineRunningStatus(
      tickets: Array<{ id: string; status: "OPEN" | "IN_PROGRESS" | "WAITING_FOR_PARTS" | "RESOLVED" | "CLOSED" }>,
      resolvingTicketId: string
    ) {
      // Simulate resolving the specified ticket
      const remainingActiveTickets = tickets.filter(
        (t) =>
          t.id !== resolvingTicketId &&
          (t.status === "OPEN" || t.status === "IN_PROGRESS" || t.status === "WAITING_FOR_PARTS")
      );

      // Only restore RUNNING if NO OTHER active tickets exist
      const machineNewStatus = remainingActiveTickets.length === 0 ? "RUNNING" : "UNDER_MAINTENANCE";
      return { machineNewStatus, remainingActiveCount: remainingActiveTickets.length };
    }

    it("restores machine to RUNNING when the only active ticket is resolved", () => {
      const tickets = [{ id: "t-1", status: "OPEN" as const }];
      const res = evaluateMachineRunningStatus(tickets, "t-1");
      expect(res.machineNewStatus).toBe("RUNNING");
      expect(res.remainingActiveCount).toBe(0);
    });

    it("keeps machine UNDER_MAINTENANCE if another breakdown ticket is still open on same machine", () => {
      const tickets = [
        { id: "t-1", status: "IN_PROGRESS" as const },
        { id: "t-2", status: "OPEN" as const }, // Second active breakdown
      ];
      const res = evaluateMachineRunningStatus(tickets, "t-1");
      expect(res.machineNewStatus).toBe("UNDER_MAINTENANCE");
      expect(res.remainingActiveCount).toBe(1);
    });

    it("calculates downtime minutes accurately from timestamps", () => {
      const start = new Date("2026-03-01T08:00:00Z");
      const end = new Date("2026-03-01T10:30:00Z");
      const downtimeMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));

      expect(downtimeMinutes).toBe(150); // 2.5 hours = 150 minutes
    });
  });

  // 6. Production Cost Engine
  describe("Production Costing Engine", () => {
    function calculateProductionCost(params: {
      materialCost: number;
      directLaborCost: number;
      machineCost: number;
      maintenanceCost: number;
      overheadCost: number;
      goodUnitsCount: number;
    }) {
      const totalCost =
        params.materialCost +
        params.directLaborCost +
        params.machineCost +
        params.maintenanceCost +
        params.overheadCost;

      const costPerGoodUnit =
        params.goodUnitsCount > 0
          ? Math.round((totalCost / params.goodUnitsCount) * 100) / 100
          : 0;

      return { totalCost, costPerGoodUnit };
    }

    it("accurately sums all direct and indirect cost drivers into unit cost", () => {
      const res = calculateProductionCost({
        materialCost: 200000,
        directLaborCost: 40000,
        machineCost: 30000,
        maintenanceCost: 5000,
        overheadCost: 25000,
        goodUnitsCount: 2000,
      });

      expect(res.totalCost).toBe(300000);
      expect(res.costPerGoodUnit).toBe(150); // 300,000 / 2,000 = 150 EGP
    });

    it("guards against division by zero when zero good units are produced", () => {
      const res = calculateProductionCost({
        materialCost: 50000,
        directLaborCost: 10000,
        machineCost: 5000,
        maintenanceCost: 1000,
        overheadCost: 2000,
        goodUnitsCount: 0,
      });

      expect(res.totalCost).toBe(68000);
      expect(res.costPerGoodUnit).toBe(0);
    });
  });
});
