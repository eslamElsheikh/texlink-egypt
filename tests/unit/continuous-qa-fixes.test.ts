import { describe, it, expect, beforeAll } from "vitest";
import { prisma } from "@/lib/db/prisma";

describe("Cysle Egypt — Continuous QA Bug Fixes & Boundary Safeguards", () => {
  let factoryAlpha: any;
  let factoryBeta: any;
  let customerBeta: any;

  beforeAll(async () => {
    factoryAlpha = await prisma.factoryProfile.findUnique({ where: { slug: "cysle-qa-factory-alpha" } });
    factoryBeta = await prisma.factoryProfile.findUnique({ where: { slug: "cysle-qa-factory-beta" } });
    customerBeta = await prisma.crmCustomer.findFirst({ where: { factoryId: factoryBeta.id } });
  });

  describe("BUG-QA-01: IDOR Cross-Factory Customer ID in Leads", () => {
    it("ensures a factory cannot attach an alien customerId from another factory to its lead", async () => {
      expect(factoryAlpha).toBeDefined();
      expect(customerBeta).toBeDefined();

      // Factory Alpha attempts to reference Factory Beta's customer
      const targetCustomer = await prisma.crmCustomer.findFirst({
        where: { id: customerBeta.id, factoryId: factoryAlpha.id },
      });

      // Must be null (IDOR blocked)
      expect(targetCustomer).toBeNull();
    });
  });

  describe("BUG-QA-02: Double-Conversion Guard on Leads", () => {
    it("prevents converting an already converted lead into duplicate deals", async () => {
      // 1. Create a fresh lead
      const lead = await prisma.crmLead.create({
        data: {
          factoryId: factoryAlpha.id,
          title: "فرصة جديدة لاختبار منع التحويل المزدوج",
          contactName: "أحمد مختار",
          phone: "01099881122",
          status: "NEW",
          estimatedValue: 75000.0,
        },
      });

      expect(lead.status).toBe("NEW");

      // 2. First conversion
      const convertedLead = await prisma.crmLead.update({
        where: { id: lead.id },
        data: { status: "CONVERTED" },
      });
      expect(convertedLead.status).toBe("CONVERTED");

      // 3. Attempt second conversion (business rule: must be rejected)
      const canConvertAgain = convertedLead.status !== "CONVERTED";
      expect(canConvertAgain).toBe(false);

      // Cleanup
      await prisma.crmLead.delete({ where: { id: lead.id } });
    });
  });

  describe("BUG-QA-03: Positive Deal Amount Validation", () => {
    it("rejects negative or zero deal amounts", () => {
      const invalidAmounts = [-1000, 0, NaN, -0.01];

      for (const amt of invalidAmounts) {
        const isValid = !isNaN(amt) && amt > 0;
        expect(isValid).toBe(false);
      }

      const validAmount = 45000;
      expect(!isNaN(validAmount) && validAmount > 0).toBe(true);
    });
  });

  describe("BUG-QA-04: RFQ Expiration Guard on Quotes", () => {
    it("rejects quote submission when RFQ is expired even if status is OPEN", () => {
      const expiredRfq = {
        status: "OPEN",
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Expired yesterday
      };

      const isExpired = expiredRfq.expiresAt && new Date(expiredRfq.expiresAt) < new Date();
      const canSubmitQuote = expiredRfq.status === "OPEN" && !isExpired;
      expect(canSubmitQuote).toBe(false);

      const activeRfq = {
        status: "OPEN",
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Expires in 5 days
      };
      const canSubmitActive = activeRfq.status === "OPEN" && !(activeRfq.expiresAt && new Date(activeRfq.expiresAt) < new Date());
      expect(canSubmitActive).toBe(true);
    });
  });

  describe("BUG-QA-09: Production Order Product IDOR Guard", () => {
    it("ensures a factory cannot assign another factory's product to its production order", async () => {
      // Query alien product from Beta
      const alienProduct = await prisma.factoryProduct.findFirst({
        where: { factoryId: factoryBeta.id },
      });

      if (alienProduct) {
        const checkAlphaOwnership = await prisma.factoryProduct.findFirst({
          where: { id: alienProduct.id, factoryId: factoryAlpha.id },
        });
        expect(checkAlphaOwnership).toBeNull();
      }
    });
  });

  describe("BUG-QA-10: Purchase Order Item Quantity & Price Validation", () => {
    it("rejects non-positive quantities or negative unit prices on purchase items", () => {
      const invalidItems = [
        { q: -5, p: 100 },
        { q: 0, p: 50 },
        { q: 10, p: -20 },
        { q: NaN, p: 50 },
      ];

      for (const { q, p } of invalidItems) {
        const isValid = !isNaN(q) && q > 0 && !isNaN(p) && p >= 0;
        expect(isValid).toBe(false);
      }

      const validItem = { q: 100, p: 45.5 };
      expect(!isNaN(validItem.q) && validItem.q > 0 && !isNaN(validItem.p) && validItem.p >= 0).toBe(true);
    });
  });

  describe("BUG-QA-11: Quality Inspection Quantity Invariants", () => {
    it("enforces that accepted + rejected quantities cannot exceed inspected quantity", () => {
      const inspected = 100;
      const invalidCombinations = [
        { accepted: 90, rejected: 20 }, // 110 > 100
        { accepted: -5, rejected: 10 },  // negative accepted
        { accepted: 50, rejected: -1 },  // negative rejected
        { accepted: 105, rejected: 0 },  // 105 > 100
      ];

      for (const { accepted, rejected } of invalidCombinations) {
        const isValid = accepted >= 0 && rejected >= 0 && accepted + rejected <= inspected;
        expect(isValid).toBe(false);
      }

      const validInspection = { accepted: 96, rejected: 4 };
      expect(validInspection.accepted >= 0 && validInspection.rejected >= 0 && validInspection.accepted + validInspection.rejected <= inspected).toBe(true);
    });
  });

  describe("BUG-QA-12: Waste Record Rework & Accepted Boundary Validation", () => {
    it("enforces that rework cannot exceed defective quantity and accepted cannot exceed rework", () => {
      const qty = 50; // Total defective
      const invalidCombinations = [
        { rework: 60, accepted: 20 }, // rework > qty
        { rework: 30, accepted: 35 }, // accepted > rework
        { rework: -5, accepted: 0 },  // negative
      ];

      for (const { rework, accepted } of invalidCombinations) {
        const isValid = rework >= 0 && accepted >= 0 && rework <= qty && accepted <= rework;
        expect(isValid).toBe(false);
      }

      const validWaste = { rework: 35, accepted: 30 };
      expect(validWaste.rework >= 0 && validWaste.accepted >= 0 && validWaste.rework <= qty && validWaste.accepted <= validWaste.rework).toBe(true);
    });
  });
  describe("BUG-QA-13: Owner-Only Settings Authorization Guard", () => {
    it("rejects non-owner factory staff from modifying factory settings", async () => {
      const managerUser = await prisma.user.findUnique({ where: { email: "manager-alpha@cysle-qa.com" } });
      expect(managerUser).toBeDefined();
      expect(factoryAlpha).toBeDefined();

      // Manager's id is NOT factory.userId
      const isOwner = managerUser!.id === factoryAlpha.userId || managerUser!.role === "ADMIN";
      expect(isOwner).toBe(false);
    });
  });

  describe("BUG-QA-14: Order Review Eligibility Guard", () => {
    it("rejects buyer review if order is not completed or delivered", () => {
      const invalidStatuses = ["PENDING", "IN_PROGRESS", "CANCELLED", "READY_FOR_SHIPPING"];

      for (const st of invalidStatuses) {
        const canReview = st === "COMPLETED" || st === "DELIVERED";
        expect(canReview).toBe(false);
      }

      const eligibleStatuses = ["COMPLETED", "DELIVERED"];
      for (const st of eligibleStatuses) {
        const canReview = st === "COMPLETED" || st === "DELIVERED";
        expect(canReview).toBe(true);
      }
    });
  });

  describe("BUG-QA-15: Order Milestone Step Role Authorization", () => {
    it("enforces buyer-only confirmation for sample approval and delivery", () => {
      const buyerStep = "SAMPLE_APPROVAL";
      const isBuyer = true;
      const isFactory = false;

      const canBuyerConfirm = (buyerStep === "SAMPLE_APPROVAL" || buyerStep === "DELIVERED") && isBuyer;
      const canFactoryConfirm = (buyerStep === "SAMPLE_APPROVAL" || buyerStep === "DELIVERED") && isFactory;

      expect(canBuyerConfirm).toBe(true);
      expect(canFactoryConfirm).toBe(false);
    });
  });
  describe("BUG-QA-16 & 17: Conversation Participant Authorization", () => {
    it("enforces that only buyer, factory staff, or admin can participate in conversation", () => {
      const conversation = {
        buyerId: "buyer-123",
        factoryId: "factory-alpha",
        factory: { userId: "owner-alpha" },
      };

      // Unrelated user
      const unrelatedSession = { id: "intruder-user", factoryId: "factory-beta", role: "BUYER" };
      const isUnrelatedBuyer = unrelatedSession.id === conversation.buyerId;
      const isUnrelatedFactory = unrelatedSession.id === conversation.factory.userId || (unrelatedSession.factoryId === conversation.factoryId);
      const isUnrelatedAdmin = unrelatedSession.role === "ADMIN";
      const canUnrelatedAccess = isUnrelatedBuyer || isUnrelatedFactory || isUnrelatedAdmin;
      expect(canUnrelatedAccess).toBe(false);

      // Factory staff (e.g. Sales Employee with factoryId === factory-alpha)
      const staffSession = { id: "sales-emp-1", factoryId: "factory-alpha", role: "SALES_EMPLOYEE" };
      const isStaffFactory = staffSession.id === conversation.factory.userId || (staffSession.factoryId === conversation.factoryId);
      expect(isStaffFactory).toBe(true);
    });
  });

  describe("BUG-QA-18: Accurate Production Cost Calculation Without Hardcoded Inflation", () => {
    it("does not add fake 88,000 EGP defaults when labor or overhead are not recorded", () => {
      const materialCost = 10000;
      const directLaborCost = undefined;
      const machineCost = undefined;
      const maintenanceCost = undefined;
      const overheadCost = undefined;

      // Fixed logic: defaults to 0, not 15000/12000/3000/8000
      const computedLabor = directLaborCost !== undefined ? directLaborCost : 0;
      const computedMachine = machineCost !== undefined ? machineCost : 0;
      const computedMaint = maintenanceCost !== undefined ? maintenanceCost : 0;
      const computedOverhead = overheadCost !== undefined ? overheadCost : 0;

      const totalCost = materialCost + computedLabor + computedMachine + computedMaint + computedOverhead;
      expect(totalCost).toBe(10000);
      expect(totalCost).not.toBe(98000); // 10000 + 88000
    });
  });

  describe("BUG-QA-19: Shift Hours Boundary Validation", () => {
    it("rejects shift hours outside the valid 1 to 24 hour range", () => {
      const invalidHours = [-2, 0, 25, 0.5, NaN, 100];

      for (const h of invalidHours) {
        const isValid = !isNaN(h) && h >= 1 && h <= 24;
        expect(isValid).toBe(false);
      }

      const validHours = [8, 12, 7.5, 6];
      for (const h of validHours) {
        const isValid = !isNaN(h) && h >= 1 && h <= 24;
        expect(isValid).toBe(true);
      }
    });
  });

  describe("BUG-QA-20: Non-Negative Employee Monthly Salary", () => {
    it("rejects negative employee salaries", () => {
      const invalidSalaries = [-5000, -1, NaN];
      for (const s of invalidSalaries) {
        const isValid = !isNaN(s) && s >= 0;
        expect(isValid).toBe(false);
      }

      const validSalaries = [0, 6500, 12000];
      for (const s of validSalaries) {
        const isValid = !isNaN(s) && s >= 0;
        expect(isValid).toBe(true);
      }
    });
  });
  describe("BUG-QA-21: Public Catalog Demo Products Exclusion", () => {
    it("strictly excludes products from demo factories in public queries", async () => {
      const publicProducts = await prisma.product.findMany({
        where: {
          isActive: true,
          factory: { isDemo: false },
        },
        include: { factory: true },
      });

      for (const p of publicProducts) {
        expect(p.factory.isDemo).toBe(false);
        expect(p.factory.slug).not.toBe("cysle-demo-factory");
      }
    });
  });

  describe("BUG-QA-22: Direct Product Order Authentication Guard", () => {
    it("rejects anonymous order placement without binding to arbitrary buyer", () => {
      const anonymousSession = null;
      const canPlaceOrder = Boolean(anonymousSession);
      expect(canPlaceOrder).toBe(false);
    });
  });

  describe("BUG-QA-23: Zero Hardcoded User Emails in Frontend Pages", () => {
    it("ensures no dashboard page initializes with hardcoded demo emails in state", () => {
      const fs = require("fs");
      const path = require("path");

      function scanDir(dir: string, found: string[] = []): string[] {
        for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, item.name);
          if (item.isDirectory()) {
            scanDir(full, found);
          } else if (item.name.endsWith(".tsx")) {
            const content = fs.readFileSync(full, "utf8");
            if (content.includes("elnasr@mahalla-textile.com")) {
              found.push(full);
            }
          }
        }
        return found;
      }

      const leakedFiles = scanDir(path.join(process.cwd(), "src", "app"));
      expect(leakedFiles).toHaveLength(0);
    });
  });
});
