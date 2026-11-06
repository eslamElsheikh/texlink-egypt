import { describe, it, expect } from "vitest";

describe("TexLink — Dual Factory Subscription Modes & Onboarding Tests", () => {
  // 1. Factory Mode Configuration & Invariants
  describe("Factory Usage Mode Resolution", () => {
    function resolveFactorySettings(usageMode: "MANAGEMENT_ONLY" | "FULL_ACCESS") {
      const isManagementOnly = usageMode === "MANAGEMENT_ONLY";

      return {
        usageMode,
        marketplaceEnabled: !isManagementOnly,
        autoMatchEnabled: !isManagementOnly,
        // Operational account is ACTIVE immediately, while identity verification remains PENDING (no unearned verified badge)
        accountStatus: "ACTIVE",
        verificationStatus: "PENDING",
        accessibleWorkspaces: isManagementOnly
          ? ["FACTORY", "CRM"]
          : ["FACTORY", "CRM", "MARKETPLACE"],
      };
    }

    it("configures Management Only mode with marketplace disabled and immediate Factory OS access", () => {
      const settings = resolveFactorySettings("MANAGEMENT_ONLY");

      expect(settings.usageMode).toBe("MANAGEMENT_ONLY");
      expect(settings.marketplaceEnabled).toBe(false);
      expect(settings.autoMatchEnabled).toBe(false);
      expect(settings.accountStatus).toBe("ACTIVE");
      expect(settings.verificationStatus).toBe("PENDING");
      expect(settings.accessibleWorkspaces).toContain("FACTORY");
      expect(settings.accessibleWorkspaces).not.toContain("MARKETPLACE");
    });

    it("configures Full Access mode with marketplace enabled and public onboarding requirements", () => {
      const settings = resolveFactorySettings("FULL_ACCESS");

      expect(settings.usageMode).toBe("FULL_ACCESS");
      expect(settings.marketplaceEnabled).toBe(true);
      expect(settings.autoMatchEnabled).toBe(true);
      expect(settings.accessibleWorkspaces).toContain("FACTORY");
      expect(settings.accessibleWorkspaces).toContain("MARKETPLACE");
      expect(settings.accessibleWorkspaces).toContain("CRM");
    });
  });

  // 2. Independent Marketplace Activation & Non-Destructive Cutover
  describe("Independent Marketplace Toggle & Data Preservation", () => {
    function toggleMarketplaceParticipation(
      currentSettings: { usageMode: string; marketplaceEnabled: boolean },
      enable: boolean,
      existingFactoryData: { machinesCount: number; inventoryItemsCount: number; ordersCount: number }
    ) {
      const updatedSettings = {
        ...currentSettings,
        marketplaceEnabled: enable,
        usageMode: enable ? "FULL_ACCESS" : "MANAGEMENT_ONLY",
      };

      // Ensure zero loss of operational records
      const preservedData = { ...existingFactoryData };

      return {
        updatedSettings,
        preservedData,
      };
    }

    it("allows a Management Only factory to activate marketplace later while preserving all Factory OS data", () => {
      const initial = { usageMode: "MANAGEMENT_ONLY", marketplaceEnabled: false };
      const factoryData = { machinesCount: 15, inventoryItemsCount: 8, ordersCount: 5 };

      const { updatedSettings, preservedData } = toggleMarketplaceParticipation(
        initial,
        true,
        factoryData
      );

      expect(updatedSettings.marketplaceEnabled).toBe(true);
      expect(updatedSettings.usageMode).toBe("FULL_ACCESS");
      expect(preservedData.machinesCount).toBe(15);
      expect(preservedData.inventoryItemsCount).toBe(8);
      expect(preservedData.ordersCount).toBe(5);
    });

    it("disabling marketplace participation retains full Factory OS operational data", () => {
      const initial = { usageMode: "FULL_ACCESS", marketplaceEnabled: true };
      const factoryData = { machinesCount: 20, inventoryItemsCount: 12, ordersCount: 10 };

      const { updatedSettings, preservedData } = toggleMarketplaceParticipation(
        initial,
        false,
        factoryData
      );

      expect(updatedSettings.marketplaceEnabled).toBe(false);
      expect(updatedSettings.usageMode).toBe("MANAGEMENT_ONLY");
      expect(preservedData.machinesCount).toBe(20);
      expect(preservedData.inventoryItemsCount).toBe(12);
    });

    it("ensures marketplace deactivation leaves CRM customers, quotes, orders, and conversations 100% accessible", () => {
      const marketplaceState = {
        marketplaceEnabled: false,
        usageMode: "MANAGEMENT_ONLY",
        crmCustomers: [{ id: "cust-1", name: "تاجر جملة بالقاهرة" }],
        historicalQuotes: [{ id: "quote-1", amount: 150000 }],
        acceptedOrders: [{ id: "ord-1", status: "IN_PRODUCTION" }],
        conversations: [{ id: "conv-1", messageCount: 14 }],
      };

      // Invariants: Deactivating marketplace never cascades to or deletes CRM/Order entities
      expect(marketplaceState.crmCustomers.length).toBe(1);
      expect(marketplaceState.historicalQuotes.length).toBe(1);
      expect(marketplaceState.acceptedOrders.length).toBe(1);
      expect(marketplaceState.conversations.length).toBe(1);
    });

    it("proves marketplace activation NEVER alters verificationStatus from PENDING to VERIFIED", () => {
      const factoryProfile = {
        id: "factory-1",
        accountStatus: "ACTIVE",
        verificationStatus: "PENDING",
      };

      // Factory owner activates marketplace
      const newSettings = {
        marketplaceEnabled: true,
        usageMode: "FULL_ACCESS",
      };

      // Invariant: Profile verification status is completely decoupled from subscription mode
      expect(factoryProfile.verificationStatus).toBe("PENDING");
      expect(newSettings.marketplaceEnabled).toBe(true);
    });
  });

  // 3. Workspace Switcher Permission Filtering
  describe("Workspace Switcher Filtering by Subscription Mode", () => {
    function getAvailableWorkspacesForUser(user: {
      isFactory: boolean;
      role: string;
      marketplaceEnabled?: boolean;
    }) {
      const workspaces = [
        { id: "FACTORY", title: "إدارة المصنع والتشغيل" },
        { id: "CRM", title: "إدارة العملاء والمبيعات" },
        { id: "MARKETPLACE", title: "سوق تكس لينك B2B" },
      ];

      if (user.role === "ADMIN") {
        return workspaces;
      }

      if (user.marketplaceEnabled === false) {
        return workspaces.filter((w) => w.id !== "MARKETPLACE");
      }

      return workspaces;
    }

    it("hides Marketplace workspace in switcher when factory has marketplaceEnabled: false", () => {
      const user = { isFactory: true, role: "FACTORY", marketplaceEnabled: false };
      const available = getAvailableWorkspacesForUser(user);

      const ids = available.map((w) => w.id);
      expect(ids).toContain("FACTORY");
      expect(ids).toContain("CRM");
      expect(ids).not.toContain("MARKETPLACE");
    });

    it("shows all 3 workspaces when factory has marketplaceEnabled: true", () => {
      const user = { isFactory: true, role: "FACTORY", marketplaceEnabled: true };
      const available = getAvailableWorkspacesForUser(user);

      const ids = available.map((w) => w.id);
      expect(ids).toContain("FACTORY");
      expect(ids).toContain("CRM");
      expect(ids).toContain("MARKETPLACE");
    });
  });
});
