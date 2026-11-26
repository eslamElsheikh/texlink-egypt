import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";

vi.mock("@/lib/auth/session", () => ({
  getCurrentUser: vi.fn(),
  createSessionToken: vi.fn(async () => "mock-jwt-token"),
  setSessionCookie: vi.fn(async () => {}),
}));

vi.mock("@/lib/auth/password", () => ({
  hashPassword: vi.fn(async (pw: string) => `hashed:${pw}`),
}));

vi.mock("@/lib/db/prisma", () => {
  const mockPrisma: Record<string, unknown> = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    factoryProfile: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    factorySettings: {
      create: vi.fn(),
    },
    warehouse: {
      create: vi.fn(),
    },
    factoryDocument: {
      createMany: vi.fn(),
      updateMany: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    product: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    $transaction: vi.fn(async (cb: (tx: Record<string, unknown>) => Promise<unknown>) =>
      cb(mockPrisma)
    ),
  };
  return { prisma: mockPrisma };
});

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import {
  classifyFactorySizeSegment,
  formatLegalStatusAr,
  formatPhysicalVerificationAr,
} from "@/lib/factory/classification";
import {
  getIndustrialAreasForGovernorate,
  normalizeGovernorate,
} from "@/config/locations";
import { resolveFactoryContext } from "@/lib/auth/factory-context";
import { POST as REGISTER_FACTORY_POST } from "@/app/api/factories/register/route";
import { POST as AUTH_REGISTER_POST } from "@/app/api/auth/register/route";
import { POST as ADMIN_VERIFY_POST } from "@/app/api/admin/factories/[id]/verify/route";
import { POST as RFQ_POST } from "@/app/api/rfqs/route";
import { POST as QUOTE_POST } from "@/app/api/rfqs/[id]/quotes/route";
import { GET as PRODUCTS_GET } from "@/app/api/products/route";
import { POST as FACTORY_PRODUCTS_POST } from "@/app/api/factory/products/route";

describe("Cysle Egypt — Factory-Only Alignment & Security Verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("classifies all 5 analytical factory size segments from 1 person upward without a Workshop entity", () => {
    expect(classifyFactorySizeSegment(1).key).toBe("INDIVIDUAL");
    expect(classifyFactorySizeSegment(2).key).toBe("MICRO");
    expect(classifyFactorySizeSegment(5).key).toBe("MICRO");
    expect(classifyFactorySizeSegment(6).key).toBe("SMALL");
    expect(classifyFactorySizeSegment(20).key).toBe("SMALL");
    expect(classifyFactorySizeSegment(21).key).toBe("MEDIUM");
    expect(classifyFactorySizeSegment(80).key).toBe("MEDIUM");
    expect(classifyFactorySizeSegment(81).key).toBe("LARGE");
    expect(classifyFactorySizeSegment(null).key).toBe("INDIVIDUAL");

    expect(formatLegalStatusAr("UNREGISTERED")).toContain("غير مسجل");
    expect(formatPhysicalVerificationAr("VERIFIED")).toContain("موثق");
  });

  it("keeps Salamoun El-Qomash and Tanamel strictly independent under Dakahlia locations", () => {
    const areas = getIndustrialAreasForGovernorate("الدقهلية");
    const salamon = areas.find((a) => a.slug === "mansoura-salamon");
    const tanamil = areas.find((a) => a.slug === "mansoura-tanamil");

    expect(salamon).toBeDefined();
    expect(tanamil).toBeDefined();
    expect(salamon?.nameAr).toBe("سلامون القماش – مركز المنصورة – الدقهلية");
    expect(tanamil?.nameAr).toBe("طنامل – مركز أجا – الدقهلية");
    expect(normalizeGovernorate("أجا")).toBe("الدقهلية");
    expect(normalizeGovernorate("مركز أجا")).toBe("الدقهلية");
  });

  it("forbids ADMIN cross-tenant findFirst fallback in all environments unless explicit inspectFactoryId is provided", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      email: "admin@cysle.eg",
      name: "Admin",
      phone: "01000000000",
      role: "ADMIN",
      isFactory: false,
      isBuyer: false,
    });

    const missingIdRes = await resolveFactoryContext(
      new Request("http://localhost:3000/api/factory/products")
    );
    expect("error" in missingIdRes).toBe(true);
    if ("error" in missingIdRes) {
      expect(missingIdRes.status).toBe(400);
    }
    expect(prisma.factoryProfile.findFirst).not.toHaveBeenCalled();

    vi.mocked(prisma.factoryProfile.findUnique).mockResolvedValue(null);
    const badIdRes = await resolveFactoryContext(
      new Request("http://localhost:3000/api/factory/products?inspectFactoryId=nonexistent")
    );
    expect("error" in badIdRes).toBe(true);
    if ("error" in badIdRes) {
      expect(badIdRes.status).toBe(404);
    }
  });

  it("registers a 1-person / 1-machine Individual Factory without mandatory CR/Tax documents and enforces duplicate guard", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "user-indiv-1",
      email: "solo@cysle.eg",
      name: "أحمد السنجي",
      phone: "01011223344",
      role: "FACTORY",
      isFactory: true,
      isBuyer: true,
    });
    vi.mocked(prisma.factoryProfile.findUnique).mockResolvedValueOnce(null);
    vi.mocked(prisma.factoryProfile.create).mockResolvedValue({
      id: "factory-indiv-1",
      slug: "ahmad-knit-1234",
      nameAr: "مصنع أحمد للتريكو الفردي",
    } as never);

    const req = new Request("http://localhost:3000/api/factories/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "أحمد السنجي",
        email: "solo@cysle.eg",
        phone: "01011223344",
        factoryNameAr: "مصنع أحمد للتريكو الفردي",
        governorate: "الدقهلية",
        industrialArea: "mansoura-tanamil",
        city: "أجا",
        address: "طنامل شارع المصانع",
        whatsapp: "01011223344",
        bioAr: "ماكينة تريكو مسطح فردية لخدمة التوريد واللضم",
        workerCount: 1,
        machineCount: 1,
        monthlyCapacity: 1,
        minOrderQuantity: 1,
        specialties: ["تريكو مسطح (فلات)"],
        machines: ["ماكينة تريكو مسطح"],
        fabrics: ["قطن مصري 100%"],
      }),
    });

    const res = await REGISTER_FACTORY_POST(req);
    expect(res.status).toBe(200);
    expect(prisma.factoryProfile.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          workerCount: 1,
          machineCount: 1,
          monthlyCapacity: 1,
          minOrderQuantity: 1,
          verificationStatus: "PENDING",
          commercialRegStatus: "UNREGISTERED",
          taxRegStatus: "UNREGISTERED",
        }),
      })
    );
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user-indiv-1" },
        data: { factoryId: "factory-indiv-1" },
      })
    );
    expect(prisma.factorySettings.create).toHaveBeenCalled();
    expect(prisma.warehouse.create).toHaveBeenCalled();

    // Duplicate registration attempt must fail cleanly with 409
    vi.mocked(prisma.factoryProfile.findUnique).mockResolvedValueOnce({
      id: "factory-indiv-1",
    } as never);
    const dupRes = await REGISTER_FACTORY_POST(
      new Request("http://localhost:3000/api/factories/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "أحمد السنجي",
          email: "solo@cysle.eg",
          phone: "01011223344",
          factoryNameAr: "مصنع مكرر",
          governorate: "الدقهلية",
          city: "أجا",
          address: "طنامل",
          whatsapp: "01011223344",
          bioAr: "تجربة تكرار التسجيل",
          workerCount: 1,
          machineCount: 1,
          monthlyCapacity: 1,
          minOrderQuantity: 1,
          specialties: ["تريكو مسطح (فلات)"],
          machines: ["ماكينة"],
          fabrics: ["قطن"],
        }),
      })
    );
    expect(dupRes.status).toBe(409);
  });

  it("initializes FactorySettings, default Warehouse, and non-fabricated nulls during quick /api/auth/register", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "new-user-1",
      name: "محمود تريكو",
      email: "mahmoud@cysle.eg",
      role: "FACTORY",
      isFactory: true,
      isBuyer: false,
      factoryProfile: { id: "new-factory-1", slug: "factory-123" },
    } as never);

    const req = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "محمود تريكو",
        email: "mahmoud@cysle.eg",
        phone: "01022334455",
        password: "Password123!",
        accountType: "FACTORY",
      }),
    });

    const res = await AUTH_REGISTER_POST(req);
    expect(res.status).toBe(200);
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          factoryProfile: expect.objectContaining({
            create: expect.objectContaining({
              governorate: "",
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
          }),
        }),
      })
    );
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "new-user-1" },
      data: { factoryId: "new-factory-1" },
    });
  });

  it("keeps physical verification strictly decoupled from CR/Tax legal registration in admin verify route", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      email: "admin@cysle.eg",
      name: "Admin",
      phone: "01000000000",
      role: "ADMIN",
      isFactory: false,
      isBuyer: false,
    });
    vi.mocked(prisma.factoryProfile.findUnique).mockResolvedValue({
      id: "fac-1",
      userId: "owner-1",
      verificationStatus: "PENDING",
      commercialRegStatus: "UNREGISTERED",
      taxRegStatus: "UNREGISTERED",
      user: { id: "owner-1" },
    } as never);
    vi.mocked(prisma.factoryProfile.update).mockResolvedValue({
      id: "fac-1",
      verificationStatus: "VERIFIED",
      commercialRegStatus: "UNREGISTERED",
      taxRegStatus: "UNREGISTERED",
    } as never);

    const res = await ADMIN_VERIFY_POST(
      new Request("http://localhost:3000/api/admin/factories/fac-1/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "VERIFIED" }),
      }),
      { params: Promise.resolve({ id: "fac-1" }) }
    );
    expect(res.status).toBe(200);
    expect(prisma.factoryProfile.update).toHaveBeenCalledWith({
      where: { id: "fac-1" },
      data: expect.objectContaining({
        verificationStatus: "VERIFIED",
      }),
    });
    expect(prisma.factoryDocument.updateMany).not.toHaveBeenCalled();
  });

  it("enforces authentication on POST /api/rfqs and blocks MANAGEMENT_ONLY & unverified factories from marketplace quotes/products", async () => {
    // 1. POST /api/rfqs denies guest without 401 fallback
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const guestRfqRes = await RFQ_POST(
      new Request("http://localhost:3000/api/rfqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
    );
    expect(guestRfqRes.status).toBe(401);

    // 2. POST /api/rfqs/[id]/quotes rejects MANAGEMENT_ONLY (marketplaceEnabled: false)
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u-mgmt",
      email: "mgmt@cysle.eg",
      name: "Mgmt Factory",
      phone: "01022334455",
      role: "FACTORY",
      isFactory: true,
      isBuyer: false,
      factoryId: "fac-mgmt",
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ factoryId: "fac-mgmt" } as never);
    vi.mocked(prisma.factoryProfile.findUnique).mockResolvedValue({
      id: "fac-mgmt",
      verificationStatus: "VERIFIED",
      settings: { marketplaceEnabled: false },
    } as never);

    const mgmtQuoteRes = await QUOTE_POST(
      new Request("http://localhost:3000/api/rfqs/rfq-1/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
      { params: Promise.resolve({ id: "rfq-1" }) }
    );
    expect(mgmtQuoteRes.status).toBe(403);

    // 3. POST /api/factory/products rejects unverified factory
    vi.mocked(prisma.factoryProfile.findUnique).mockResolvedValue({
      id: "fac-unverified",
      verificationStatus: "PENDING",
      settings: { marketplaceEnabled: true },
    } as never);
    const unverifiedProdRes = await FACTORY_PRODUCTS_POST(
      new Request("http://localhost:3000/api/factory/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
    );
    expect(unverifiedProdRes.status).toBe(403);

    // 4. GET /api/products filters strictly on verified + active + non-demo + marketplaceEnabled
    const listRes = await PRODUCTS_GET(new Request("http://localhost:3000/api/products"));
    expect(listRes.status).toBe(200);
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isActive: true,
          factory: {
            isDemo: false,
            accountStatus: "ACTIVE",
            verificationStatus: "VERIFIED",
            settings: { marketplaceEnabled: true },
          },
        }),
      })
    );
  });

  it("contains zero active Workshop classifications in aligned UI and location source files", () => {
    const filesToCheck = [
      "src/app/factories/register/page.tsx",
      "src/app/faq/page.tsx",
      "src/components/home/HowItWorksDualSection.tsx",
      "src/app/factories/[slug]/page.tsx",
      "src/app/orders/[id]/page.tsx",
      "src/components/layout/Footer.tsx",
      "README.md",
    ];

    for (const rel of filesToCheck) {
      const content = fs.readFileSync(path.join(process.cwd(), rel), "utf8");
      expect(content).not.toMatch(/ورشة|الورش|workshops?/i);
    }
  });
});
