import { describe, it, expect } from "vitest";
import { prisma } from "@/lib/db/prisma";

describe("RFQ Marketplace & Routing Integrity", () => {
  it("verifies open RFQ records exist with complete details in database", async () => {
    const openRfqs = await prisma.rfq.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        sizeBreakdowns: true,
      },
    });

    expect(openRfqs.length).toBeGreaterThan(0);
    const first = openRfqs[0];
    expect(first.id).toBeDefined();
    expect(first.titleAr).toBeTruthy();
    expect(first.totalQuantity).toBeGreaterThan(0);
    expect(first.status).toBe("OPEN");
  });

  it("verifies size breakdown records exist for RFQ", async () => {
    const breakdownCount = await prisma.rfqSizeBreakdown.count();
    expect(breakdownCount).toBeGreaterThan(0);
  });

  it("verifies RFQ quotes can be queried without relational errors", async () => {
    const quotes = await prisma.quote.findMany({
      include: {
        factory: {
          select: { id: true, nameAr: true, slug: true },
        },
        rfq: {
          select: { id: true, titleAr: true },
        },
      },
    });

    expect(quotes.length).toBeGreaterThan(0);
    for (const q of quotes) {
      expect(q.unitPrice).toBeGreaterThan(0);
      expect(q.factory).toBeDefined();
      expect(q.rfq).toBeDefined();
    }
  });
});
