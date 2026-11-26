import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth/session", () => ({
  getCurrentUser: vi.fn(),
  createSessionToken: vi.fn(async (payload: unknown) => JSON.stringify(payload)),
  setSessionCookie: vi.fn(async () => {}),
}));

vi.mock("@/lib/auth/password", () => ({
  hashPassword: vi.fn(async (pw: string) => `hashed:${pw}`),
}));

vi.mock("@/lib/notifications", () => ({
  NotificationService: {
    notify: vi.fn(async () => {}),
  },
}));

vi.mock("@/lib/db/prisma", () => {
  const mockPrisma: Record<string, unknown> = {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    factoryProfile: {
      findUnique: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    factorySettings: {
      create: vi.fn(),
    },
    warehouse: {
      create: vi.fn(),
    },
    factoryDocument: {
      createMany: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
    },
    order: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
    },
    orderMilestone: {
      create: vi.fn(),
    },
    conversation: {
      create: vi.fn(),
    },
    message: {
      create: vi.fn(),
    },
    rfq: {
      findUnique: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
    },
    quote: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
    },
    machine: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    productionEntry: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    maintenanceTicket: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    inventoryItem: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    productionOrder: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    auditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn(async (cb: (tx: Record<string, unknown>) => Promise<unknown>) =>
      cb(mockPrisma)
    ),
  };
  return { prisma: mockPrisma };
});

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser, createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { POST as AUTH_REGISTER_POST } from "@/app/api/auth/register/route";
import { POST as FACTORY_REGISTER_POST } from "@/app/api/factories/register/route";
import { GET as MARKETPLACE_DASHBOARD_GET } from "@/app/api/marketplace/dashboard/route";
import { GET as FACTORY_DASHBOARD_GET } from "@/app/api/factory/dashboard/route";
import { GET as PRODUCT_DETAIL_GET } from "@/app/api/products/[id]/route";
import { POST as PRODUCT_ORDER_POST } from "@/app/api/products/[id]/order/route";
import { GET as BUYER_DASHBOARD_GET } from "@/app/api/buyer/dashboard/route";
import { GET as FACTORIES_LIST_GET } from "@/app/api/factories/route";
import { GET as FACTORY_SLUG_GET } from "@/app/api/factories/[slug]/route";
import { GET as ADMIN_FACTORIES_GET } from "@/app/api/admin/factories/route";
import { GET as ORDER_DETAIL_GET } from "@/app/api/orders/[id]/route";
import { POST as QUOTE_ACCEPT_POST } from "@/app/api/rfqs/[id]/quotes/[quoteId]/accept/route";
import { POST as RFQ_POST } from "@/app/api/rfqs/route";
import { POST as QUOTE_POST } from "@/app/api/rfqs/[id]/quotes/route";

describe("Phase 13 — Targeted Remediation & HTTP Security Regression Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Registration Correctness & Non-Fabricated Profile Data", () => {
    it("registers a 1-person / 1-machine FACTORY with omitted optional fields and zero fabricated defaults", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(null);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue({ id: "u-solo-1" } as never);
      vi.mocked(prisma.factoryProfile.create).mockResolvedValue({
        id: "fac-solo-1",
        slug: "solo-1",
        nameAr: "مصنع ماكينة واحدة",
        verificationStatus: "PENDING",
        commercialRegStatus: "UNREGISTERED",
        taxRegStatus: "UNREGISTERED",
        workerCount: 1,
        machineCount: 1,
      } as never);

      const req = new Request("http://localhost:3000/api/factories/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "حسن الفردي",
          email: "solo-minimal@cysle.eg",
          password: "Password123!",
          phone: "01012345678",
          factoryNameAr: "مصنع ماكينة واحدة",
          governorate: "الدقهلية",
          city: "أجا",
          address: "طنامل",
          whatsapp: "01012345678",
          workerCount: 1,
          machineCount: 1,
          minOrderQuantity: 1,
        }),
      });

      const res = await FACTORY_REGISTER_POST(req);
      expect(res.status).toBe(200);
      expect(prisma.factoryProfile.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            bioAr: "",
            establishedYear: null,
            monthlyCapacity: null,
            workerCount: 1,
            machineCount: 1,
            minOrderQuantity: 1,
            specialties: "[]",
            machines: "[]",
            fabrics: "[]",
            commercialRegStatus: "UNREGISTERED",
            taxRegStatus: "UNREGISTERED",
          }),
        })
      );
    });

    it("keeps BUYER registration strictly BUYER (no FactoryProfile/Settings/Warehouse) and blocks ADMIN factory creation", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: "u-buyer-1",
        email: "buyer@cysle.eg",
        name: "تاجر جملة",
        phone: "01055555555",
        role: "BUYER",
        isFactory: false,
        isBuyer: true,
        factoryProfile: null,
      } as never);

      const buyerRes = await AUTH_REGISTER_POST(
        new Request("http://localhost:3000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "تاجر جملة",
            email: "buyer@cysle.eg",
            phone: "01055555555",
            password: "Password123!",
            accountType: "BUYER",
          }),
        })
      );
      expect(buyerRes.status).toBe(200);
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            role: "BUYER",
            isFactory: false,
            isBuyer: true,
            factoryProfile: undefined,
          }),
        })
      );
      expect(prisma.user.update).not.toHaveBeenCalled();

      // ADMIN must never be converted to a FactoryProfile
      vi.mocked(getCurrentUser).mockResolvedValue({
        id: "admin-1",
        email: "admin@cysle.eg",
        name: "Admin",
        phone: "01000000000",
        role: "ADMIN",
        isFactory: false,
        isBuyer: false,
      });
      const adminAttempt = await FACTORY_REGISTER_POST(
        new Request("http://localhost:3000/api/factories/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Admin",
            email: "admin@cysle.eg",
            phone: "01000000000",
            factoryNameAr: "مصنع مرفوض",
            governorate: "الدقهلية",
            city: "المنصورة",
            address: "شارع 1",
            whatsapp: "01000000000",
            workerCount: 1,
            machineCount: 1,
            minOrderQuantity: 1,
          }),
        })
      );
      expect(adminAttempt.status).toBe(403);
      expect(prisma.factoryProfile.create).not.toHaveBeenCalled();
    });

    it("refreshes JWT session cookie immediately on authenticated BUYER-to-FACTORY upgrade and rejects retries with 409", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue({
        id: "buyer-upgrade-1",
        email: "upgrade@cysle.eg",
        name: "مشتري يطور لمصنع",
        phone: "01098765432",
        role: "BUYER",
        isFactory: false,
        isBuyer: true,
        factoryId: null,
      });
      vi.mocked(prisma.factoryProfile.findUnique).mockResolvedValueOnce(null);
      vi.mocked(prisma.factoryProfile.create).mockResolvedValue({
        id: "fac-upgraded-1",
        slug: "upgraded-fac-1",
        nameAr: "مصنع التطوير",
        verificationStatus: "PENDING",
        commercialRegStatus: "UNREGISTERED",
        taxRegStatus: "UNREGISTERED",
        workerCount: 1,
        machineCount: 1,
      } as never);

      const reqPayload = {
        name: "مشتري يطور لمصنع",
        email: "upgrade@cysle.eg",
        phone: "01098765432",
        factoryNameAr: "مصنع التطوير",
        governorate: "الدقهلية",
        city: "المنصورة",
        address: "سلامون القماش",
        whatsapp: "01098765432",
        workerCount: 1,
        machineCount: 1,
        minOrderQuantity: 1,
      };

      const upgradeRes = await FACTORY_REGISTER_POST(
        new Request("http://localhost:3000/api/factories/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reqPayload),
        })
      );
      expect(upgradeRes.status).toBe(200);
      expect(createSessionToken).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "buyer-upgrade-1",
          role: "FACTORY",
          isFactory: true,
          isBuyer: true,
          factoryId: "fac-upgraded-1",
          factorySlug: "upgraded-fac-1",
        })
      );
      expect(setSessionCookie).toHaveBeenCalledTimes(1);

      // Retry after upgrade must return 409 and never create a duplicate record
      vi.mocked(prisma.factoryProfile.findUnique).mockResolvedValueOnce({
        id: "fac-upgraded-1",
      } as never);
      const retryRes = await FACTORY_REGISTER_POST(
        new Request("http://localhost:3000/api/factories/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reqPayload),
        })
      );
      expect(retryRes.status).toBe(409);
      expect(prisma.factoryProfile.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("2. MOQ Consistency (MOQ 1, MOQ 10, and Below-MOQ Rejection)", () => {
    const eligibleVerifiedFactory = {
      id: "fac-ver-1",
      userId: "owner-ver-1",
      isDemo: false,
      accountStatus: "ACTIVE",
      verificationStatus: "VERIFIED",
      settings: { marketplaceEnabled: true },
      user: { id: "owner-ver-1", email: "o@cysle.eg", phone: "01011111111" },
    };

    beforeEach(() => {
      vi.mocked(getCurrentUser).mockResolvedValue({
        id: "buyer-1",
        email: "buyer1@cysle.eg",
        name: "Buyer",
        phone: "01022222222",
        role: "BUYER",
        isFactory: false,
        isBuyer: true,
      });
      vi.mocked(prisma.order.create).mockResolvedValue({
        id: "ord-1",
        orderNumber: "STOCK-12345",
      } as never);
      vi.mocked(prisma.conversation.create).mockResolvedValue({ id: "conv-1" } as never);
    });

    it("accepts quantity 1 when product.moq is 1 and rejects quantity 0", async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue({
        id: "prod-moq-1",
        nameAr: "بلوفر تريكو قطعة",
        factoryId: "fac-ver-1",
        isActive: true,
        moq: 1,
        basePrice: 120,
        leadTimeDays: 3,
        factory: eligibleVerifiedFactory,
        priceTiers: [],
      } as never);

      const okRes = await PRODUCT_ORDER_POST(
        new Request("http://localhost:3000/api/products/prod-moq-1/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: 1, deliveryAddress: "المنصورة شارع العباسي" }),
        }),
        { params: Promise.resolve({ id: "prod-moq-1" }) }
      );
      expect(okRes.status).toBe(200);

      const zeroRes = await PRODUCT_ORDER_POST(
        new Request("http://localhost:3000/api/products/prod-moq-1/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: 0, deliveryAddress: "المنصورة شارع العباسي" }),
        }),
        { params: Promise.resolve({ id: "prod-moq-1" }) }
      );
      expect(zeroRes.status).toBe(400);
    });

    it("accepts quantity 10 when product.moq is 10 and rejects quantity 5 below configured MOQ", async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue({
        id: "prod-moq-10",
        nameAr: "تيشيرت جملة",
        factoryId: "fac-ver-1",
        isActive: true,
        moq: 10,
        basePrice: 80,
        leadTimeDays: 5,
        factory: eligibleVerifiedFactory,
        priceTiers: [],
      } as never);

      const belowMoqRes = await PRODUCT_ORDER_POST(
        new Request("http://localhost:3000/api/products/prod-moq-10/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: 5, deliveryAddress: "القاهرة" }),
        }),
        { params: Promise.resolve({ id: "prod-moq-10" }) }
      );
      expect(belowMoqRes.status).toBe(400);

      const exactMoqRes = await PRODUCT_ORDER_POST(
        new Request("http://localhost:3000/api/products/prod-moq-10/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: 10, deliveryAddress: "القاهرة" }),
        }),
        { params: Promise.resolve({ id: "prod-moq-10" }) }
      );
      expect(exactMoqRes.status).toBe(200);
    });
  });

  describe("3. Marketplace Authorization vs. Unverified Factory OS & Buyer Dashboard Isolation", () => {
    it("allows PENDING unverified factory to access Factory OS /api/factory/dashboard while blocking /api/marketplace/dashboard", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue({
        id: "u-pending-fac",
        email: "pending@cysle.eg",
        name: "Pending Owner",
        phone: "01000001111",
        role: "FACTORY",
        isFactory: true,
        isBuyer: false,
        factoryId: "fac-pending-1",
      });
      vi.mocked(prisma.factoryProfile.findUnique).mockResolvedValue({
        id: "fac-pending-1",
        userId: "u-pending-fac",
        nameAr: "مصنع قيد المراجعة",
        slug: "pending-fac-1",
        verificationStatus: "PENDING",
        settings: { marketplaceEnabled: true, wasteThresholdPct: 5 },
      } as never);

      const factoryOsRes = await FACTORY_DASHBOARD_GET(
        new Request("http://localhost:3000/api/factory/dashboard")
      );
      expect(factoryOsRes.status).toBe(200);

      const mktPendingRes = await MARKETPLACE_DASHBOARD_GET(
        new Request("http://localhost:3000/api/marketplace/dashboard")
      );
      expect(mktPendingRes.status).toBe(403);

      // MANAGEMENT_ONLY factory also blocked on /api/marketplace/dashboard even if VERIFIED
      vi.mocked(prisma.factoryProfile.findUnique).mockResolvedValue({
        id: "fac-mgmt-1",
        userId: "u-pending-fac",
        verificationStatus: "VERIFIED",
        settings: { marketplaceEnabled: false },
      } as never);
      const mktMgmtRes = await MARKETPLACE_DASHBOARD_GET(
        new Request("http://localhost:3000/api/marketplace/dashboard")
      );
      expect(mktMgmtRes.status).toBe(403);
    });

    it("blocks direct product viewing (GET) and ordering (POST) for inactive, PENDING, or marketplace-disabled products", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue({
        id: "buyer-1",
        email: "buyer1@cysle.eg",
        name: "Buyer",
        phone: "01022222222",
        role: "BUYER",
        isFactory: false,
        isBuyer: true,
      });

      // Inactive product
      vi.mocked(prisma.product.findUnique).mockResolvedValue({
        id: "prod-inactive",
        isActive: false,
        moq: 1,
        factory: {
          id: "fac-1",
          isDemo: false,
          accountStatus: "ACTIVE",
          verificationStatus: "VERIFIED",
          settings: { marketplaceEnabled: true },
        },
      } as never);
      const getInactive = await PRODUCT_DETAIL_GET(
        new Request("http://localhost:3000/api/products/prod-inactive"),
        { params: Promise.resolve({ id: "prod-inactive" }) }
      );
      expect(getInactive.status).toBe(404);

      const orderInactive = await PRODUCT_ORDER_POST(
        new Request("http://localhost:3000/api/products/prod-inactive/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: 1, deliveryAddress: "المنصورة" }),
        }),
        { params: Promise.resolve({ id: "prod-inactive" }) }
      );
      expect(orderInactive.status).toBe(403);

      // Marketplace-disabled factory product
      vi.mocked(prisma.product.findUnique).mockResolvedValue({
        id: "prod-mgmt",
        isActive: true,
        moq: 1,
        factory: {
          id: "fac-mgmt",
          isDemo: false,
          accountStatus: "ACTIVE",
          verificationStatus: "VERIFIED",
          settings: { marketplaceEnabled: false },
        },
      } as never);
      const getMgmt = await PRODUCT_DETAIL_GET(
        new Request("http://localhost:3000/api/products/prod-mgmt"),
        { params: Promise.resolve({ id: "prod-mgmt" }) }
      );
      expect(getMgmt.status).toBe(404);

      const orderMgmt = await PRODUCT_ORDER_POST(
        new Request("http://localhost:3000/api/products/prod-mgmt/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: 1, deliveryAddress: "المنصورة" }),
        }),
        { params: Promise.resolve({ id: "prod-mgmt" }) }
      );
      expect(orderMgmt.status).toBe(403);

      // Non-buyer factory cannot place product order
      vi.mocked(getCurrentUser).mockResolvedValue({
        id: "fac-only",
        email: "fac-only@cysle.eg",
        name: "Factory Only",
        phone: "01033333333",
        role: "FACTORY",
        isFactory: true,
        isBuyer: false,
      });
      const nonBuyerOrder = await PRODUCT_ORDER_POST(
        new Request("http://localhost:3000/api/products/prod-1/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: 1, deliveryAddress: "المنصورة" }),
        }),
        { params: Promise.resolve({ id: "prod-1" }) }
      );
      expect(nonBuyerOrder.status).toBe(403);
    });

    it("removes ADMIN findFirst() fallback from GET /api/buyer/dashboard and restricts non-buyers", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue({
        id: "admin-1",
        email: "admin@cysle.eg",
        name: "Admin",
        phone: "01000000000",
        role: "ADMIN",
        isFactory: false,
        isBuyer: false,
      });
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "admin-1",
        isBuyer: false,
        buyerProfile: null,
      } as never);

      const adminNoParam = await BUYER_DASHBOARD_GET(
        new Request("http://localhost:3000/api/buyer/dashboard")
      );
      expect(adminNoParam.status).toBe(400);
      expect(prisma.user.findFirst).not.toHaveBeenCalled();

      // Non-buyer FACTORY user denied with 403
      vi.mocked(getCurrentUser).mockResolvedValue({
        id: "fac-only",
        email: "f@cysle.eg",
        name: "F",
        phone: "010",
        role: "FACTORY",
        isFactory: true,
        isBuyer: false,
      });
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "fac-only",
        isBuyer: false,
        buyerProfile: null,
      } as never);
      const facRes = await BUYER_DASHBOARD_GET(
        new Request("http://localhost:3000/api/buyer/dashboard")
      );
      expect(facRes.status).toBe(403);
    });
  });

  describe("4. GET /api/factories & Slug Visibility Policy + Cross-Tenant Security Regressions", () => {
    it("enforces VERIFIED-only public directory policy regardless of filters/pagination while keeping /api/admin/factories authorized", async () => {
      const res = await FACTORIES_LIST_GET(
        new Request("http://localhost:3000/api/factories?q=تريكو&area=tanamil&page=2&limit=5")
      );
      expect(res.status).toBe(200);
      expect(prisma.factoryProfile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              { isDemo: false },
              { accountStatus: "ACTIVE" },
              { verificationStatus: "VERIFIED" },
              { settings: { marketplaceEnabled: true } },
            ]),
          }),
        })
      );

      // Public direct slug access to PENDING factory returns 404; ADMIN & owner see explicit PENDING status
      vi.mocked(prisma.factoryProfile.findUnique).mockResolvedValue({
        id: "fac-pend-1",
        userId: "owner-pend-1",
        slug: "pending-factory",
        nameAr: "مصنع قيد المراجعة",
        governorate: "الدقهلية",
        city: "أجا",
        address: "طنامل",
        phone: "010",
        whatsapp: "010",
        isDemo: false,
        accountStatus: "ACTIVE",
        verificationStatus: "PENDING",
        commercialRegStatus: "UNREGISTERED",
        taxRegStatus: "UNREGISTERED",
        workerCount: 1,
        machineCount: 1,
        minOrderQuantity: 1,
        monthlyCapacity: null,
        establishedYear: null,
        rating: 4.5,
        reviewCount: 0,
        specialties: "[]",
        machines: "[]",
        fabrics: "[]",
        gallery: "[]",
        settings: { marketplaceEnabled: true },
        products: [],
        reviewsReceived: [],
      } as never);

      vi.mocked(getCurrentUser).mockResolvedValue(null);
      const guestSlugRes = await FACTORY_SLUG_GET(
        new Request("http://localhost:3000/api/factories/pending-factory"),
        { params: Promise.resolve({ slug: "pending-factory" }) }
      );
      expect(guestSlugRes.status).toBe(404);

      vi.mocked(getCurrentUser).mockResolvedValue({
        id: "owner-pend-1",
        email: "owner@cysle.eg",
        name: "Owner",
        phone: "010",
        role: "FACTORY",
        isFactory: true,
        isBuyer: false,
        factoryId: "fac-pend-1",
      });
      const ownerSlugRes = await FACTORY_SLUG_GET(
        new Request("http://localhost:3000/api/factories/pending-factory"),
        { params: Promise.resolve({ slug: "pending-factory" }) }
      );
      expect(ownerSlugRes.status).toBe(200);
      const ownerJson = await ownerSlugRes.json();
      expect(ownerJson.factory.verificationStatus).toBe("PENDING");

      // Non-admin rejected on /api/admin/factories; ADMIN permitted
      const nonAdminList = await ADMIN_FACTORIES_GET();
      expect(nonAdminList.status).toBe(403);
      vi.mocked(getCurrentUser).mockResolvedValue({
        id: "admin-1",
        email: "admin@cysle.eg",
        name: "Admin",
        phone: "010",
        role: "ADMIN",
        isFactory: false,
        isBuyer: false,
      });
      const adminList = await ADMIN_FACTORIES_GET();
      expect(adminList.status).toBe(200);
    });

    it("enforces cross-buyer order BOLA, cross-factory order isolation, quote accept ownership, and RFQ/quote role checks", async () => {
      // Buyer B cannot view Buyer A's order; Factory Beta cannot view Factory Alpha's order
      vi.mocked(prisma.order.findUnique).mockResolvedValue({
        id: "ord-a",
        buyerId: "buyer-a",
        factoryId: "fac-alpha",
        factory: { id: "fac-alpha", userId: "owner-alpha" },
      } as never);

      vi.mocked(getCurrentUser).mockResolvedValue({
        id: "buyer-b",
        email: "bb@cysle.eg",
        name: "Buyer B",
        phone: "010",
        role: "BUYER",
        isFactory: false,
        isBuyer: true,
      });
      const crossBuyerOrder = await ORDER_DETAIL_GET(
        new Request("http://localhost:3000/api/orders/ord-a"),
        { params: Promise.resolve({ id: "ord-a" }) }
      );
      expect(crossBuyerOrder.status).toBe(403);

      vi.mocked(getCurrentUser).mockResolvedValue({
        id: "owner-beta",
        email: "beta@cysle.eg",
        name: "Owner Beta",
        phone: "010",
        role: "FACTORY",
        isFactory: true,
        isBuyer: false,
        factoryId: "fac-beta",
      });
      const crossFactoryOrder = await ORDER_DETAIL_GET(
        new Request("http://localhost:3000/api/orders/ord-a"),
        { params: Promise.resolve({ id: "ord-a" }) }
      );
      expect(crossFactoryOrder.status).toBe(403);

      // Buyer B cannot accept quote on Buyer A's RFQ
      vi.mocked(getCurrentUser).mockResolvedValue({
        id: "buyer-b",
        email: "bb@cysle.eg",
        name: "Buyer B",
        phone: "010",
        role: "BUYER",
        isFactory: false,
        isBuyer: true,
      });
      vi.mocked(prisma.rfq.findUnique).mockResolvedValue({
        id: "rfq-a",
        buyerId: "buyer-a",
        status: "OPEN",
      } as never);
      const crossAccept = await QUOTE_ACCEPT_POST(
        new Request("http://localhost:3000/api/rfqs/rfq-a/quotes/q-1/accept", { method: "POST" }),
        { params: Promise.resolve({ id: "rfq-a", quoteId: "q-1" }) }
      );
      expect(crossAccept.status).toBe(403);

      // Unauthorized RFQ creation (non-buyer factory)
      vi.mocked(getCurrentUser).mockResolvedValue({
        id: "fac-only",
        email: "f@cysle.eg",
        name: "Factory Only",
        phone: "010",
        role: "FACTORY",
        isFactory: true,
        isBuyer: false,
        factoryId: "fac-alpha",
      });
      const unauthRfq = await RFQ_POST(
        new Request("http://localhost:3000/api/rfqs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        })
      );
      expect(unauthRfq.status).toBe(403);

      // PENDING factory attempting to quote
      vi.mocked(prisma.factoryProfile.findUnique).mockResolvedValue({
        id: "fac-alpha",
        userId: "fac-only",
        verificationStatus: "PENDING",
        settings: { marketplaceEnabled: true },
      } as never);
      const pendingQuote = await QUOTE_POST(
        new Request("http://localhost:3000/api/rfqs/rfq-a/quotes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ unitPrice: 50, leadTimeDays: 7, minQuantity: 1, paymentTermsAr: "نقدي عند الاستلام" }),
        }),
        { params: Promise.resolve({ id: "rfq-a" }) }
      );
      expect(pendingQuote.status).toBe(403);
    });
  });
});
