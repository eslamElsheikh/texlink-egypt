import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies before importing the routes
vi.mock("@/lib/auth/session", () => ({
  getCurrentUser: vi.fn(),
  createSessionToken: vi.fn(async () => "mock-token"),
  setSessionCookie: vi.fn(async () => {}),
}));

vi.mock("@/lib/db/prisma", () => {
  const mockPrisma: Record<string, unknown> = {
    factoryDocument: {
      findFirst: vi.fn(),
      createMany: vi.fn(),
    },
    user: {
      update: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    factoryProfile: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
    },
    factorySettings: {
      create: vi.fn(),
    },
    warehouse: {
      create: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
    $transaction: vi.fn(async (cb: (tx: Record<string, unknown>) => Promise<unknown>) =>
      cb(mockPrisma)
    ),
  };

  return { prisma: mockPrisma };
});

vi.mock("@/lib/storage/supabase", () => ({
  isSupabasePrivateStorageConfigured: vi.fn(() => true),
  isSupabasePublicStorageConfigured: vi.fn(() => true),
  uploadToSupabaseStorage: vi.fn(async ({ storageKey }: { storageKey: string }) => ({
    success: true,
    url: `/api/documents/${storageKey}`,
  })),
  downloadFromSupabaseStorage: vi.fn(async () => ({
    buffer: Buffer.from("%PDF-1.4 mock-pdf-content"),
    contentType: "application/pdf",
  })),
  SUPABASE_BUCKETS: {
    PRIVATE_DOCUMENTS: "factory-private-documents",
    PUBLIC_ASSETS: "texlink-public-assets",
  },
}));

vi.mock("@/lib/security/rate-limit", () => ({
  checkRateLimit: vi.fn(async () => ({
    success: true,
    limit: 20,
    remaining: 19,
    resetInMs: 60000,
    backend: "memory",
  })),
}));

import { GET } from "@/app/api/documents/[id]/route";
import { POST as UPLOAD_POST } from "@/app/api/upload/route";
import { POST as REGISTER_POST } from "@/app/api/factories/register/route";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { buildPrivateStorageKey, parsePrivateStorageKey } from "@/lib/storage/keys";

describe("Private Document Tenant Isolation & Scoped Authorization", () => {
  const factoryAUser = {
    id: "user-alpha-101",
    email: "alpha@cysle.com",
    name: "Factory Alpha Owner",
    phone: "01011111111",
    role: "FACTORY" as const,
    isFactory: true,
    isBuyer: false,
    factoryId: "factory-alpha-id",
    factorySlug: "factory-alpha",
  };

  const factoryBUser = {
    id: "user-beta-202",
    email: "beta@cysle.com",
    name: "Factory Beta Owner",
    phone: "01022222222",
    role: "FACTORY" as const,
    isFactory: true,
    isBuyer: false,
    factoryId: "factory-beta-id",
    factorySlug: "factory-beta",
  };

  const buyerUser = {
    id: "user-buyer-303",
    email: "buyer@cysle.com",
    name: "Wholesale Buyer",
    phone: "01033333333",
    role: "BUYER" as const,
    isFactory: false,
    isBuyer: true,
    factoryId: null,
    factorySlug: null,
  };

  const factoryADocumentInDb = {
    id: "doc-alpha-id",
    factoryId: "factory-alpha-id",
    storageKey: "priv_alpha_tax_card.dat",
    fileUrl: "/api/documents/priv_alpha_tax_card.dat",
    fileName: "tax_card.pdf",
    isPrivate: true,
    factory: {
      id: "factory-alpha-id",
      userId: "user-alpha-101",
      nameAr: "مصنع ألفا",
    },
  };

  const factoryBDocumentInDb = {
    id: "doc-beta-id",
    factoryId: "factory-beta-id",
    storageKey: "priv_beta_commercial_reg.dat",
    fileUrl: "/api/documents/priv_beta_commercial_reg.dat",
    fileName: "commercial_reg.pdf",
    isPrivate: true,
    factory: {
      id: "factory-beta-id",
      userId: "user-beta-202",
      nameAr: "مصنع بيتا",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. strictly rejects unauthenticated access with HTTP 401", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const req = new Request("http://localhost:3000/api/documents/priv_alpha_tax_card.dat");
    const res = await GET(req, { params: Promise.resolve({ id: "priv_alpha_tax_card.dat" }) });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain("غير مصرح لك بالوصول");
  });

  it("2. allows Factory A to access its own registered document (HTTP 200)", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(factoryAUser);
    vi.mocked(prisma.factoryDocument.findFirst).mockResolvedValue(factoryADocumentInDb as any);

    const req = new Request("http://localhost:3000/api/documents/priv_alpha_tax_card.dat");
    const res = await GET(req, { params: Promise.resolve({ id: "priv_alpha_tax_card.dat" }) });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
  });

  it("3. strictly blocks Factory A from accessing a known Factory B document (HTTP 403 IDOR Defense)", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(factoryAUser);
    vi.mocked(prisma.factoryDocument.findFirst).mockResolvedValue(factoryBDocumentInDb as any);

    const req = new Request("http://localhost:3000/api/documents/priv_beta_commercial_reg.dat");
    const res = await GET(req, { params: Promise.resolve({ id: "priv_beta_commercial_reg.dat" }) });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("غير مصرح لك بعرض هذا المستند الخاص");
  });

  it("4. strictly blocks Buyer from accessing any private factory document (HTTP 403)", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(buyerUser);
    vi.mocked(prisma.factoryDocument.findFirst).mockResolvedValue(factoryADocumentInDb as any);

    const req = new Request("http://localhost:3000/api/documents/priv_alpha_tax_card.dat");
    const res = await GET(req, { params: Promise.resolve({ id: "priv_alpha_tax_card.dat" }) });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("غير مصرح لك بعرض هذا المستند الخاص");
  });

  it("5. strictly blocks a factory user from requesting an unknown or unregistered private storage key (HTTP 403)", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(factoryBUser);
    vi.mocked(prisma.factoryDocument.findFirst).mockResolvedValue(null);

    const req = new Request("http://localhost:3000/api/documents/priv_unknown_arbitrary_key.dat");
    const res = await GET(req, { params: Promise.resolve({ id: "priv_unknown_arbitrary_key.dat" }) });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("غير مصرح لك بعرض هذا المستند الخاص");
  });

  it("6. preserves legitimate factory registration wizard: allows user to access their own scoped pre-registration upload", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(factoryAUser);
    vi.mocked(prisma.factoryDocument.findFirst).mockResolvedValue(null);

    const userScopedKey = buildPrivateStorageKey(
      factoryAUser.id,
      "e9b2c3d4-1234-4567-89ab-cdef01234567"
    );

    const req = new Request(`http://localhost:3000/api/documents/${userScopedKey}`);
    const res = await GET(req, { params: Promise.resolve({ id: userScopedKey }) });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
  });

  it("7. strictly blocks Factory B from accessing Factory A's unlinked pre-registration upload (HTTP 403)", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(factoryBUser);
    vi.mocked(prisma.factoryDocument.findFirst).mockResolvedValue(null);

    const factoryAKey = buildPrivateStorageKey(
      factoryAUser.id,
      "e9b2c3d4-1234-4567-89ab-cdef01234567"
    );

    const req = new Request(`http://localhost:3000/api/documents/${factoryAKey}`);
    const res = await GET(req, { params: Promise.resolve({ id: factoryAKey }) });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("غير مصرح لك بعرض هذا المستند الخاص");
  });

  it("8. strictly rejects path traversal and malformed storage keys with HTTP 400", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(factoryAUser);

    const malformedIds = [
      "../../etc/passwd",
      "..\\..\\secret.pdf",
      "..",
      ".",
      ".env",
      "priv_user-alpha-101_1234.dat/../../other",
      "invalid key with spaces.dat",
      "bad$key!@#",
    ];

    for (const badId of malformedIds) {
      const req = new Request("http://localhost:3000/api/documents/invalid");
      const res = await GET(req, { params: Promise.resolve({ id: badId }) });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain("معرف مستند غير صالح");
    }
  });

  it("9. guarantees uploaded private storage keys and download authorization use identical format", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(factoryAUser);
    vi.mocked(prisma.factoryDocument.findFirst).mockResolvedValue(null);

    const pdfBytes = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\n");
    const file = new File([pdfBytes], "commercial-reg.pdf", { type: "application/pdf" });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("isPrivate", "true");

    const uploadReq = new Request("http://localhost:3000/api/upload", {
      method: "POST",
      body: formData,
    });

    const uploadRes = await UPLOAD_POST(uploadReq);
    expect(uploadRes.status).toBe(200);
    const uploadJson = await uploadRes.json();

    expect(uploadJson.isPrivate).toBe(true);
    expect(uploadJson.storageKey).toMatch(
      new RegExp(`^priv_${factoryAUser.id}_[0-9a-f-]+\\.dat$`)
    );
    expect(uploadJson.url).toBe(`/api/documents/${uploadJson.storageKey}`);

    const parsed = parsePrivateStorageKey(uploadJson.storageKey);
    expect(parsed).not.toBeNull();
    expect(parsed?.uploaderUserId).toBe(factoryAUser.id);

    // Same user can immediately retrieve via download route before DB save
    const downloadReq = new Request(`http://localhost:3000${uploadJson.url}`);
    const downloadRes = await GET(downloadReq, {
      params: Promise.resolve({ id: uploadJson.storageKey }),
    });
    expect(downloadRes.status).toBe(200);
  });

  it("10. registration saves exact storageKey and rejects cross-tenant key hijacking", async () => {
    const validKeyA = buildPrivateStorageKey(
      factoryAUser.id,
      "11111111-2222-4333-8444-555555555555"
    );

    const basePayload = {
      name: "Test Owner",
      email: "owner@cysle.com",
      phone: "01012345678",
      factoryNameAr: "مصنع النسيج الحديث",
      governorate: "القاهرة",
      city: "العاشر من رمضان",
      address: "المنطقة الصناعية الثالثة قطعة 5",
      whatsapp: "01012345678",
      bioAr: "مصنع متخصص في إنتاج الملابس الجاهزة والأقمشة القطنية عالية الجودة",
      establishedYear: 2015,
      workerCount: 1,
      machineCount: 1,
      monthlyCapacity: 10000,
      minOrderQuantity: 100,
      specialties: ["تيشيرتات"],
      machines: ["ماكينات خياطة أوفر"],
      fabrics: ["قطن 100%"],
      commercialRegisterUrl: `/api/documents/${validKeyA}?download=true`,
      commercialRegisterName: "السجل.pdf",
    };

    // Case A: Factory B attempts to hijack Factory A's pre-registration key -> HTTP 403
    vi.mocked(getCurrentUser).mockResolvedValue(factoryBUser);
    const hijackReq = new Request("http://localhost:3000/api/factories/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(basePayload),
    });
    const hijackRes = await REGISTER_POST(hijackReq);
    expect(hijackRes.status).toBe(403);
    expect(prisma.factoryDocument.createMany).not.toHaveBeenCalled();

    // Case B: Factory A registers with its own document -> saves clean storageKey
    vi.mocked(getCurrentUser).mockResolvedValue(factoryAUser);
    vi.mocked(prisma.factoryProfile.create).mockResolvedValue({
      id: "factory-alpha-new",
      slug: "factory-alpha-new-1234",
      nameAr: basePayload.factoryNameAr,
      verificationStatus: "PENDING",
    } as any);

    const legitReq = new Request("http://localhost:3000/api/factories/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(basePayload),
    });
    const legitRes = await REGISTER_POST(legitReq);
    expect(legitRes.status).toBe(200);

    expect(prisma.factoryDocument.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          factoryId: "factory-alpha-new",
          type: "COMMERCIAL_REGISTER",
          fileUrl: `/api/documents/${validKeyA}?download=true`,
          storageKey: validKeyA,
        }),
      ],
    });
  });
});
