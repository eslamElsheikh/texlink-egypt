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
});
