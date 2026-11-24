import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies before importing the route
vi.mock("@/lib/auth/session", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    factoryDocument: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("@/lib/storage/supabase", () => ({
  isSupabaseStorageConfigured: vi.fn(() => true),
  downloadFromSupabaseStorage: vi.fn(async ({ storageKey }: { storageKey: string }) => {
    return {
      buffer: Buffer.from("mock-pdf-content"),
      contentType: "application/pdf",
    };
  }),
  SUPABASE_BUCKETS: {
    PRIVATE_DOCUMENTS: "factory-private-documents",
    PUBLIC_ASSETS: "texlink-public-assets",
  },
}));

import { GET } from "@/app/api/documents/[id]/route";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

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
    // Document exists in DB but belongs to Factory Beta
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
    // Factory B user tries to access an arbitrary unknown key not registered in the database
    vi.mocked(getCurrentUser).mockResolvedValue(factoryBUser);
    vi.mocked(prisma.factoryDocument.findFirst).mockResolvedValue(null);

    const req = new Request("http://localhost:3000/api/documents/priv_unknown_arbitrary_key.dat");
    const res = await GET(req, { params: Promise.resolve({ id: "priv_unknown_arbitrary_key.dat" }) });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("غير مصرح لك بعرض هذا المستند الخاص");
  });

  it("6. preserves legitimate factory registration wizard: allows user to access their own scoped pre-registration upload", async () => {
    // User Alpha uploaded a document during the registration wizard; not yet saved in DB
    vi.mocked(getCurrentUser).mockResolvedValue(factoryAUser);
    vi.mocked(prisma.factoryDocument.findFirst).mockResolvedValue(null);

    // Key is securely scoped to user-alpha-101
    const userScopedKey = `priv_user-alpha-101_e9b2c3d4-1234-4567-89ab-cdef01234567.dat`;

    const req = new Request(`http://localhost:3000/api/documents/${userScopedKey}`);
    const res = await GET(req, { params: Promise.resolve({ id: userScopedKey }) });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
  });

  it("7. strictly blocks Factory B from accessing Factory A's unlinked pre-registration upload (HTTP 403)", async () => {
    // Factory B user attempts to access Factory A's unlinked pre-registration upload
    vi.mocked(getCurrentUser).mockResolvedValue(factoryBUser);
    vi.mocked(prisma.factoryDocument.findFirst).mockResolvedValue(null);

    // Key is scoped to user-alpha-101, but current session is user-beta-202
    const factoryAKey = `priv_user-alpha-101_e9b2c3d4-1234-4567-89ab-cdef01234567.dat`;

    const req = new Request(`http://localhost:3000/api/documents/${factoryAKey}`);
    const res = await GET(req, { params: Promise.resolve({ id: factoryAKey }) });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("غير مصرح لك بعرض هذا المستند الخاص");
  });
});
