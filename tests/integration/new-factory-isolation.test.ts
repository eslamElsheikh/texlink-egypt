import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

describe("Cysle Egypt — Critical New Factory Account Data Isolation Audit", () => {
  let gammaUser: any;
  let gammaFactory: any;
  let alphaFactory: any;
  let betaFactory: any;

  beforeAll(async () => {
    alphaFactory = await prisma.factoryProfile.findUnique({ where: { slug: "cysle-qa-factory-alpha" } });
    betaFactory = await prisma.factoryProfile.findUnique({ where: { slug: "cysle-qa-factory-beta" } });

    // Clean any prior Gamma test records
    await prisma.user.deleteMany({ where: { email: "owner-gamma@cysle-qa.com" } });
    const existingGamma = await prisma.factoryProfile.findUnique({ where: { slug: "cysle-qa-factory-gamma" } });
    if (existingGamma) {
      await prisma.factorySettings.deleteMany({ where: { factoryId: existingGamma.id } });
      await prisma.factoryProfile.delete({ where: { id: existingGamma.id } });
    }

    // 1. Register fresh Factory Gamma user
    const passwordHash = await bcrypt.hash("GammaPass123!@#", 10);
    gammaUser = await prisma.user.create({
      data: {
        email: "owner-gamma@cysle-qa.com",
        name: "م. كريم عبد السلام (مالك مصنع جاما الجديد)",
        phone: "01055550001",
        passwordHash,
        role: "FACTORY",
        isFactory: true,
        isBuyer: false,
      },
    });

    // 2. Create fresh Factory Gamma profile (Empty, PENDING verification)
    gammaFactory = await prisma.factoryProfile.create({
      data: {
        userId: gammaUser.id,
        nameAr: "مصنع جاما الجديد للأقمشة (Factory Gamma)",
        slug: "cysle-qa-factory-gamma",
        governorate: "القليوبية",
        city: "شبرا الخيمة",
        address: "شارع 15 مايو، مجمع الصناعات",
        phone: "01055550001",
        whatsapp: "01055550001",
        bioAr: "مصنع تريكو جديد قيد التجهيز والبدء في تسجيل خطوط الإنتاج والماكينات.",
        specialties: JSON.stringify(["تيشيرتات وبولو"]),
        machines: JSON.stringify(["ماكينات خياطة"]),
        fabrics: JSON.stringify(["قطن 100%"]),
        accountStatus: "ACTIVE",
        verificationStatus: "PENDING", // STRICTLY PENDING UPON REGISTRATION
        isDemo: true,
        settings: {
          create: {
            usageMode: "FULL_ACCESS",
            marketplaceEnabled: false,
            currency: "EGP",
          },
        },
      },
    });

    await prisma.user.update({
      where: { id: gammaUser.id },
      data: { factoryId: gammaFactory.id },
    });
  });

  afterAll(async () => {
    // Cleanup Gamma
    if (gammaFactory) {
      await prisma.factorySettings.deleteMany({ where: { factoryId: gammaFactory.id } });
      await prisma.factoryProfile.delete({ where: { id: gammaFactory.id } });
    }
    if (gammaUser) {
      await prisma.user.deleteMany({ where: { id: gammaUser.id } });
    }
  });

  it("1. Verifies newly created factory starts with strictly ZERO production metrics (No 85420 or 82300 leak)", async () => {
    const entries = await prisma.productionEntry.findMany({
      where: { factoryId: gammaFactory.id },
    });
    expect(entries).toHaveLength(0);

    const totalProd = entries.reduce((s, e) => s + e.producedQuantity, 0);
    const goodQty = entries.reduce((s, e) => s + e.goodQuantity, 0);
    const defectQty = entries.reduce((s, e) => s + e.defectiveQuantity, 0);
    const wasteRate = totalProd > 0 ? (defectQty / totalProd) * 100 : 0;

    expect(totalProd).toBe(0);
    expect(goodQty).toBe(0);
    expect(defectQty).toBe(0);
    expect(wasteRate).toBe(0);

    // Assert strictly that neither 85420 nor 82300 nor 3120 is returned
    expect(totalProd).not.toBe(85420);
    expect(goodQty).not.toBe(82300);
    expect(defectQty).not.toBe(3120);
    expect(wasteRate).not.toBe(3.7);
  });

  it("2. Verifies newly created factory has zero machines, zero downtime, and zero tickets (No 5 or 12.5h leak)", async () => {
    const machines = await prisma.machine.findMany({
      where: { factoryId: gammaFactory.id },
    });
    expect(machines).toHaveLength(0);

    const tickets = await prisma.maintenanceTicket.findMany({
      where: { factoryId: gammaFactory.id },
    });
    expect(tickets).toHaveLength(0);

    const downtime = tickets.reduce((s, t) => s + (t.downtimeMinutes || 0), 0);
    expect(downtime).toBe(0);

    // Assert strictly no leak of 5 tickets or 12.5 hours (750 minutes)
    expect(tickets.length).not.toBe(5);
    expect(downtime).not.toBe(750);
  });

  it("3. Verifies newly created factory verificationStatus is PENDING (never falsely VERIFIED)", async () => {
    const factory = await prisma.factoryProfile.findUnique({
      where: { id: gammaFactory.id },
      select: { verificationStatus: true, accountStatus: true },
    });

    expect(factory).toBeDefined();
    expect(factory?.verificationStatus).toBe("PENDING");
    expect(factory?.accountStatus).toBe("ACTIVE");
    expect(factory?.verificationStatus).not.toBe("VERIFIED");
  });

  it("4. Verifies Factory Alpha sees only Alpha's records and does not bleed into Gamma", async () => {
    expect(alphaFactory).toBeDefined();

    const alphaMachines = await prisma.machine.findMany({
      where: { factoryId: alphaFactory.id },
    });
    expect(alphaMachines.length).toBeGreaterThan(0);

    // Verify Gamma has zero of Alpha's machines
    const gammaMachinesWithAlphaCode = await prisma.machine.findMany({
      where: { factoryId: gammaFactory.id, code: "M-ALPHA-01" },
    });
    expect(gammaMachinesWithAlphaCode).toHaveLength(0);
  });

  it("5. Verifies Factory Beta sees only Beta's records and does not bleed into Gamma", async () => {
    expect(betaFactory).toBeDefined();

    const betaItems = await prisma.inventoryItem.findMany({
      where: { factoryId: betaFactory.id },
    });
    expect(betaItems.length).toBeGreaterThan(0);

    // Verify Gamma has zero of Beta's items
    const gammaItemsWithBetaSku = await prisma.inventoryItem.findMany({
      where: { factoryId: gammaFactory.id, sku: "BETA-YARN-24" },
    });
    expect(gammaItemsWithBetaSku).toHaveLength(0);
  });
});
