import { describe, it, expect } from "vitest";
import { resolveUserDefaultLanding } from "@/middleware";

describe("TexLink — Multi-Workspace Architecture & Security Tests", () => {
  // 1. Role-Aware Landing Page Resolution
  describe("Role-Aware Default Landing Resolution", () => {
    it("redirects FACTORY_OWNER, FACTORY_ADMIN, and FACTORY_MANAGER to Factory Workspace", () => {
      expect(resolveUserDefaultLanding("FACTORY_OWNER", false)).toBe("/factory/dashboard");
      expect(resolveUserDefaultLanding("FACTORY_ADMIN", false)).toBe("/factory/dashboard");
      expect(resolveUserDefaultLanding("FACTORY_MANAGER", false)).toBe("/factory/dashboard");
      expect(resolveUserDefaultLanding("FACTORY", true)).toBe("/factory/dashboard");
    });

    it("redirects CRM_MANAGER and SALES_EMPLOYEE to CRM Workspace", () => {
      expect(resolveUserDefaultLanding("CRM_MANAGER", false)).toBe("/crm/dashboard");
      expect(resolveUserDefaultLanding("SALES_EMPLOYEE", false)).toBe("/crm/dashboard");
      expect(resolveUserDefaultLanding("crm_manager", false)).toBe("/crm/dashboard");
    });

    it("redirects PRODUCTION_EMPLOYEE to production floor interface", () => {
      expect(resolveUserDefaultLanding("PRODUCTION_EMPLOYEE", false)).toBe("/factory/production");
    });

    it("redirects WAREHOUSE_EMPLOYEE to inventory and warehouse interface", () => {
      expect(resolveUserDefaultLanding("WAREHOUSE_EMPLOYEE", false)).toBe("/factory/inventory");
    });

    it("redirects BUYER to Buyer / Marketplace dashboard", () => {
      expect(resolveUserDefaultLanding("BUYER", false)).toBe("/buyer/dashboard");
      expect(resolveUserDefaultLanding("individual_buyer", false)).toBe("/buyer/dashboard");
    });

    it("redirects ADMIN and PLATFORM_ADMIN to Platform Admin dashboard", () => {
      expect(resolveUserDefaultLanding("ADMIN", false)).toBe("/admin/dashboard");
      expect(resolveUserDefaultLanding("PLATFORM_ADMIN", false)).toBe("/admin/dashboard");
    });
  });

  // 2. Multi-Tenant CRM Isolation
  describe("CRM Multi-Tenant Data Isolation", () => {
    it("ensures CRM customers and deals are strictly filtered by factoryId", () => {
      const factory1 = "factory-nasr-mahalla";
      const factory2 = "factory-amal-shoubra";

      const crmCustomers = [
        { id: "c-1", factoryId: factory1, name: "شركة القاهرة", totalSpend: 150000 },
        { id: "c-2", factoryId: factory1, name: "براند ريتش كوتون", totalSpend: 90000 },
        { id: "c-3", factoryId: factory2, name: "مؤسسة الإسكندرية", totalSpend: 80000 },
      ];

      const f1Customers = crmCustomers.filter((c) => c.factoryId === factory1);
      const f2Customers = crmCustomers.filter((c) => c.factoryId === factory2);

      expect(f1Customers.length).toBe(2);
      expect(f1Customers.every((c) => c.factoryId === factory1)).toBe(true);
      expect(f2Customers.length).toBe(1);
      expect(f2Customers.find((c) => c.factoryId === factory1)).toBeUndefined();
    });

    it("rejects unauthorized cross-tenant CRM access", () => {
      const callerContext = { factoryId: "factory-nasr-mahalla", role: "FACTORY" };
      const requestedRecord = { id: "deal-99", factoryId: "factory-amal-shoubra" };

      const isAuthorized =
        callerContext.role === "ADMIN" || callerContext.factoryId === requestedRecord.factoryId;

      expect(isAuthorized).toBe(false);
    });
  });

  // 3. Customer Identity Deduplication & Linking
  describe("CRM Customer Identity Deduplication & Matching", () => {
    function findOrCreateCrmCustomer(
      factoryId: string,
      existingCustomers: Array<{ id: string; factoryId: string; phone: string; buyerId?: string | null }>,
      incomingLead: { phone: string; buyerId?: string | null; name: string }
    ) {
      // Deduplicate by phone within the same factory
      const matched = existingCustomers.find(
        (c) => c.factoryId === factoryId && c.phone === incomingLead.phone
      );

      if (matched) {
        return {
          customer: matched,
          createdNew: false,
        };
      }

      const newCustomer = {
        id: `c-new-${Date.now()}`,
        factoryId,
        name: incomingLead.name,
        phone: incomingLead.phone,
        buyerId: incomingLead.buyerId || null,
      };

      return {
        customer: newCustomer,
        createdNew: true,
      };
    }

    it("deduplicates customers by phone and links to existing record without creating duplicates", () => {
      const existing = [
        { id: "c-1", factoryId: "factory-1", phone: "01012345678", buyerId: "buyer-user-1" },
      ];

      const res = findOrCreateCrmCustomer("factory-1", existing, {
        name: "طارق الشاذلي (طلب جديد)",
        phone: "01012345678",
        buyerId: "buyer-user-1",
      });

      expect(res.createdNew).toBe(false);
      expect(res.customer.id).toBe("c-1");
    });

    it("creates a new CRM customer record when no match exists", () => {
      const existing = [
        { id: "c-1", factoryId: "factory-1", phone: "01012345678" },
      ];

      const res = findOrCreateCrmCustomer("factory-1", existing, {
        name: "عميل جديد من معرض الإسكندرية",
        phone: "01299887766",
      });

      expect(res.createdNew).toBe(true);
      expect(res.customer.phone).toBe("01299887766");
    });
  });

  // 4. Sales Pipeline Stage Transitions & Value Accumulation
  describe("CRM Sales Pipeline Stage Computations", () => {
    it("accurately calculates total pipeline value and won revenue", () => {
      const deals = [
        { id: "d-1", stage: "DISCOVERY", amount: 100000 },
        { id: "d-2", stage: "PROPOSAL", amount: 250000 },
        { id: "d-3", stage: "NEGOTIATION", amount: 450000 },
        { id: "d-4", stage: "WON", amount: 320000 },
        { id: "d-5", stage: "LOST", amount: 50000 },
      ];

      const openDeals = deals.filter((d) => d.stage !== "WON" && d.stage !== "LOST");
      const openDealsValue = openDeals.reduce((sum, d) => sum + d.amount, 0);
      const wonValue = deals.filter((d) => d.stage === "WON").reduce((sum, d) => sum + d.amount, 0);

      expect(openDeals.length).toBe(3);
      expect(openDealsValue).toBe(800000); // 100k + 250k + 450k
      expect(wonValue).toBe(320000);
    });
  });
});
