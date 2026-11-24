import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isSupabasePrivateStorageConfigured,
  isSupabasePublicStorageConfigured,
  isSupabaseStorageConfigured,
  getSupabasePrivateClient,
  getSupabasePublicClient,
  getSupabaseClient,
  uploadToSupabaseStorage,
  downloadFromSupabaseStorage,
  resetSupabaseStorageClients,
  SUPABASE_BUCKETS,
} from "@/lib/storage/supabase";

const mockUpload = vi.fn(async () => ({ error: null }));
const mockDownload = vi.fn(async () => ({
  data: new Blob(["mock-bytes"], { type: "application/pdf" }),
  error: null,
}));
const mockGetPublicUrl = vi.fn((key: string) => ({
  data: { publicUrl: `https://example.supabase.co/storage/v1/object/public/texlink-public-assets/${key}` },
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn((url: string, key: string) => ({
    _url: url,
    _key: key,
    storage: {
      from: vi.fn(() => ({
        upload: mockUpload,
        download: mockDownload,
        getPublicUrl: mockGetPublicUrl,
      })),
    },
  })),
}));

describe("Supabase Private Storage Credential Hardening & Client Separation", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    resetSupabaseStorageClients();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    (process.env as any).NODE_ENV = "test";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    resetSupabaseStorageClients();
  });

  it("refuses to mark private storage configured when only ANON key is present", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-public-key-only";

    expect(isSupabasePublicStorageConfigured()).toBe(true);
    expect(isSupabasePrivateStorageConfigured()).toBe(false);
    expect(isSupabaseStorageConfigured()).toBe(false);
  });

  it("never falls back to ANON key for private or default client helpers", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-public-key-only";

    expect(getSupabasePrivateClient()).toBeNull();
    expect(getSupabaseClient()).toBeNull();

    const publicClient = getSupabasePublicClient() as any;
    expect(publicClient).not.toBeNull();
    expect(publicClient._key).toBe("anon-public-key-only");
  });

  it("separates private service-role client from public anon client when both keys are present", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key-123";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-secret-456";

    expect(isSupabasePrivateStorageConfigured()).toBe(true);
    expect(isSupabasePublicStorageConfigured()).toBe(true);

    const privateClient = getSupabasePrivateClient() as any;
    const publicClient = getSupabasePublicClient() as any;

    expect(privateClient).not.toBeNull();
    expect(publicClient).not.toBeNull();
    expect(privateClient._key).toBe("service-role-secret-456");
    expect(publicClient._key).toBe("anon-key-123");
    expect(privateClient).not.toBe(publicClient);
  });

  it("fails closed on private bucket uploads and downloads when SUPABASE_SERVICE_ROLE_KEY is missing", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-public-key-only";

    const uploadRes = await uploadToSupabaseStorage({
      bucket: SUPABASE_BUCKETS.PRIVATE_DOCUMENTS,
      storageKey: "priv_user1_uuid.dat",
      buffer: Buffer.from("%PDF-1.4"),
      contentType: "application/pdf",
    });

    expect(uploadRes.success).toBe(false);
    expect(uploadRes.error).toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(mockUpload).not.toHaveBeenCalled();

    const downloadRes = await downloadFromSupabaseStorage({
      bucket: SUPABASE_BUCKETS.PRIVATE_DOCUMENTS,
      storageKey: "priv_user1_uuid.dat",
    });

    expect(downloadRes).toBeNull();
    expect(mockDownload).not.toHaveBeenCalled();

    // Public assets bucket STILL succeeds with the public anon client
    const publicUploadRes = await uploadToSupabaseStorage({
      bucket: SUPABASE_BUCKETS.PUBLIC_ASSETS,
      storageKey: "pub_logo.png",
      buffer: Buffer.from("png-bytes"),
      contentType: "image/png",
    });
    expect(publicUploadRes.success).toBe(true);
    expect(mockUpload).toHaveBeenCalledTimes(1);
  });

  it("returns HTTP 503 on private upload & download routes in production if service-role key is missing", async () => {
    vi.resetModules();

    vi.doMock("@/lib/auth/session", () => ({
      getCurrentUser: vi.fn(async () => ({
        id: "user-alpha-101",
        email: "alpha@cysle.com",
        name: "Alpha",
        phone: "01011111111",
        role: "FACTORY",
        isFactory: true,
        isBuyer: false,
        factoryId: "factory-alpha-id",
        factorySlug: "factory-alpha",
      })),
    }));
    vi.doMock("@/lib/db/prisma", () => ({
      prisma: {
        factoryDocument: {
          findFirst: vi.fn(async () => null),
        },
      },
    }));
    vi.doMock("@/lib/security/rate-limit", () => ({
      checkRateLimit: vi.fn(async () => ({
        success: true,
        limit: 20,
        remaining: 19,
        resetInMs: 60000,
        backend: "memory",
      })),
    }));

    (process.env as any).NODE_ENV = "production";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-public-key-only";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const { POST: uploadPost } = await import("@/app/api/upload/route");
    const { GET: documentGet } = await import("@/app/api/documents/[id]/route");

    const pdfBytes = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\n");
    const file = new File([pdfBytes], "tax-card.pdf", { type: "application/pdf" });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("isPrivate", "true");

    const uploadRes = await uploadPost(
      new Request("http://localhost:3000/api/upload", { method: "POST", body: formData })
    );
    expect(uploadRes.status).toBe(503);

    const docKey = "priv_user-alpha-101_e9b2c3d4-1234-4567-89ab-cdef01234567.dat";
    const downloadRes = await documentGet(
      new Request(`http://localhost:3000/api/documents/${docKey}`),
      { params: Promise.resolve({ id: docKey }) }
    );
    expect(downloadRes.status).toBe(503);
  });
});
