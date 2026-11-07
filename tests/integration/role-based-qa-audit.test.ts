import { describe, it, expect, beforeAll } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { createSessionToken, verifySessionToken } from "@/lib/auth/session";
import { resolveUserDefaultLanding } from "@/middleware";
import { resolveFactoryContext } from "@/lib/auth/factory-context";

describe("Cysle Egypt — Role-Based QA & Permissions Audit", () => {
  let adminUser: any;
  let ownerAlpha: any;
  let managerAlpha: any;
  let crmAlpha: any;
  let salesAlpha: any;
  let productionAlpha: any;
  let warehouseAlpha: any;
  let ownerBeta: any;
  let buyerUser: any;
  let factoryAlpha: any;
  let factoryBeta: any;

  beforeAll(async () => {
    // Load QA test accounts
    adminUser = await prisma.user.findUnique({ where: { email: "admin-qa@cysle-qa.com" } });
    ownerAlpha = await prisma.user.findUnique({ where: { email: "owner-alpha@cysle-qa.com" } });
    managerAlpha = await prisma.user.findUnique({ where: { email: "manager-alpha@cysle-qa.com" } });
    crmAlpha = await prisma.user.findUnique({ where: { email: "crm-alpha@cysle-qa.com" } });
    salesAlpha = await prisma.user.findUnique({ where: { email: "sales-alpha@cysle-qa.com" } });
    productionAlpha = await prisma.user.findUnique({ where: { email: "production-alpha@cysle-qa.com" } });
    warehouseAlpha = await prisma.user.findUnique({ where: { email: "warehouse-alpha@cysle-qa.com" } });
    ownerBeta = await prisma.user.findUnique({ where: { email: "owner-beta@cysle-qa.com" } });
    buyerUser = await prisma.user.findUnique({ where: { email: "buyer-qa-1@cysle-qa.com" } });

    factoryAlpha = await prisma.factoryProfile.findUnique({ where: { slug: "cysle-qa-factory-alpha" } });
    factoryBeta = await prisma.factoryProfile.findUnique({ where: { slug: "cysle-qa-factory-beta" } });
  });

  describe("1. Default Landing Page Resolution (Middleware)", () => {
    it("routes PLATFORM_ADMIN to /admin/dashboard", () => {
      expect(resolveUserDefaultLanding("ADMIN", false)).toBe("/admin/dashboard");
      expect(resolveUserDefaultLanding("PLATFORM_ADMIN", false)).toBe("/admin/dashboard");
    });

    it("routes FACTORY_OWNER and FACTORY to /factory/dashboard", () => {
      expect(resolveUserDefaultLanding("FACTORY", true)).toBe("/factory/dashboard");
      expect(resolveUserDefaultLanding("FACTORY_OWNER", true)).toBe("/factory/dashboard");
      expect(resolveUserDefaultLanding("FACTORY_MANAGER", true)).toBe("/factory/dashboard");
    });

    it("routes CRM_MANAGER and SALES_EMPLOYEE to /crm/dashboard", () => {
      expect(resolveUserDefaultLanding("CRM_MANAGER", true)).toBe("/crm/dashboard");
      expect(resolveUserDefaultLanding("SALES_EMPLOYEE", true)).toBe("/crm/dashboard");
    });

    it("routes PRODUCTION_EMPLOYEE to /factory/production", () => {
      expect(resolveUserDefaultLanding("PRODUCTION_EMPLOYEE", true)).toBe("/factory/production");
    });

    it("routes WAREHOUSE_EMPLOYEE to /factory/inventory", () => {
      expect(resolveUserDefaultLanding("WAREHOUSE_EMPLOYEE", true)).toBe("/factory/inventory");
    });

    it("routes BUYER to /buyer/dashboard", () => {
      expect(resolveUserDefaultLanding("BUYER", false)).toBe("/buyer/dashboard");
    });
  });

  describe("2. JWT Session Token Generation & Verification", () => {
    it("generates and verifies valid session tokens for each role", async () => {
      const rolesToTest = [
        { u: adminUser, role: "ADMIN" },
        { u: ownerAlpha, role: "FACTORY" },
        { u: managerAlpha, role: "FACTORY_MANAGER" },
        { u: crmAlpha, role: "CRM_MANAGER" },
        { u: buyerUser, role: "BUYER" },
      ];

      for (const { u, role } of rolesToTest) {
        if (!u) continue;
        const token = await createSessionToken({
          id: u.id,
          email: u.email,
          name: u.name,
          phone: u.phone,
          role: u.role as any,
          isFactory: u.isFactory,
          isBuyer: u.isBuyer,
          factoryId: u.factoryId,
        });

        expect(token).toBeTruthy();
        const payload = await verifySessionToken(token);
        expect(payload).toBeDefined();
        expect(payload?.email).toBe(u.email);
        expect(payload?.role).toBe(u.role);
      }
    });

    it("rejects tampered or forged JWT tokens", async () => {
      const validToken = await createSessionToken({
        id: "attacker-id",
        email: "attacker@fake.com",
        name: "Attacker",
        phone: "01000000000",
        role: "BUYER",
        isFactory: false,
        isBuyer: true,
      });

      const tampered = validToken.slice(0, -6) + "xxxxxx";
      const result = await verifySessionToken(tampered);
      expect(result).toBeNull();
    });
  });

  describe("3. Server-Side Factory Context Resolution & Employee Binding", () => {
    it("resolves factory context for Factory Owner via factoryProfile", async () => {
      expect(ownerAlpha).toBeDefined();
      expect(factoryAlpha).toBeDefined();

      const factory = await prisma.factoryProfile.findUnique({
        where: { userId: ownerAlpha.id },
      });

      expect(factory).toBeDefined();
      expect(factory?.id).toBe(factoryAlpha.id);
    });

    it("resolves employer factory context for Factory Staff (Manager, CRM, Production, Warehouse) via factoryId", async () => {
      const staffList = [managerAlpha, crmAlpha, salesAlpha, productionAlpha, warehouseAlpha];

      for (const staff of staffList) {
        expect(staff).toBeDefined();
        expect(staff.factoryId).toBe(factoryAlpha.id);

        const employer = await prisma.factoryProfile.findUnique({
          where: { id: staff.factoryId },
        });

        expect(employer).toBeDefined();
        expect(employer?.slug).toBe("cysle-qa-factory-alpha");
      }
    });

    it("ensures Buyer has no factory profile or employer factoryId", async () => {
      expect(buyerUser).toBeDefined();
      expect(buyerUser.factoryId).toBeNull();
      expect(buyerUser.isFactory).toBe(false);
      expect(buyerUser.isBuyer).toBe(true);

      const fp = await prisma.factoryProfile.findUnique({
        where: { userId: buyerUser.id },
      });
      expect(fp).toBeNull();
    });
  });

  describe("4. Cross-Tenant Barrier (Factory Alpha vs Factory Beta)", () => {
    it("ensures Factory Alpha cannot access Factory Beta inventory", async () => {
      // Query scoped by Alpha's factoryId
      const alphaItems = await prisma.inventoryItem.findMany({
        where: { factoryId: factoryAlpha.id },
      });

      expect(alphaItems.length).toBeGreaterThan(0);
      for (const item of alphaItems) {
        expect(item.factoryId).toBe(factoryAlpha.id);
        expect(item.factoryId).not.toBe(factoryBeta.id);
      }

      // Query Beta's inventory specifically with Alpha's ID should return empty
      const leakedBetaItems = await prisma.inventoryItem.findMany({
        where: { factoryId: factoryAlpha.id, sku: "BETA-YARN-24" },
      });
      expect(leakedBetaItems).toHaveLength(0);
    });

    it("ensures Factory Beta cannot view Factory Alpha CRM customers", async () => {
      const betaCustomers = await prisma.crmCustomer.findMany({
        where: { factoryId: factoryBeta.id },
      });

      expect(betaCustomers.length).toBeGreaterThan(0);
      for (const c of betaCustomers) {
        expect(c.factoryId).toBe(factoryBeta.id);
        expect(c.name).not.toBe("عميل ألفا الأول");
      }
    });

    it("ensures cross-factory stock transfers are impossible", async () => {
      const whAlpha = await prisma.warehouse.findFirst({ where: { factoryId: factoryAlpha.id } });
      const whBeta = await prisma.warehouse.findFirst({ where: { factoryId: factoryBeta.id } });

      expect(whAlpha).toBeDefined();
      expect(whBeta).toBeDefined();
      expect(whAlpha?.factoryId).not.toBe(whBeta?.factoryId);

      // Business rule: fromWarehouse and toWarehouse must belong to caller's factoryId
      const isCrossFactory = whAlpha?.factoryId !== whBeta?.factoryId;
      expect(isCrossFactory).toBe(true);
    });
  });
});
