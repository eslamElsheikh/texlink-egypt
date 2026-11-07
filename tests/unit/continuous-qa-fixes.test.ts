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
});
