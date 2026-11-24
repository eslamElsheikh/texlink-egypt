import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { isValidStorageKeyParam, parsePrivateStorageKey } from "@/lib/storage/keys";
import {
  isSupabasePrivateStorageConfigured,
  downloadFromSupabaseStorage,
  SUPABASE_BUCKETS,
} from "@/lib/storage/supabase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول، يرجى تسجيل الدخول أولاً" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Strictly reject path traversal, directory separators, dot-files, and malformed keys
    if (!isValidStorageKeyParam(id)) {
      return NextResponse.json({ error: "معرف مستند غير صالح" }, { status: 400 });
    }
    const safeKey = id;

    // Authorization check
    const isAdmin = session.role === "ADMIN" || (session.role as string) === "PLATFORM_ADMIN";

    let authorized = isAdmin;
    let resolvedStorageKey = safeKey;

    const doc = await prisma.factoryDocument.findFirst({
      where: {
        OR: [
          { storageKey: safeKey },
          { fileUrl: `/api/documents/${safeKey}` },
          { fileUrl: { endsWith: `/${safeKey}` } },
          { id: safeKey },
        ],
      },
      include: { factory: true },
    });

    if (doc?.storageKey) {
      resolvedStorageKey = doc.storageKey;
    }

    if (!authorized) {
      if (doc) {
        // User must be the owner of the factory or assigned to the factory
        authorized = doc.factory.userId === session.id || session.factoryId === doc.factoryId;
      } else {
        // If not yet linked in DB (e.g. during registration wizard before profile save),
        // strictly verify that the storage key is explicitly scoped to the uploading user.
        const parsed = parsePrivateStorageKey(safeKey);
        authorized = Boolean(parsed && parsed.uploaderUserId === session.id);
      }
    }

    if (!authorized) {
      return NextResponse.json(
        { error: "غير مصرح لك بعرض هذا المستند الخاص" },
        { status: 403 }
      );
    }

    let fileBuffer: Buffer | null = null;
    let contentType = "application/pdf";

    // 1. Check Supabase Private Storage (strictly requires server-side service-role key)
    if (isSupabasePrivateStorageConfigured()) {
      const remote = await downloadFromSupabaseStorage({
        bucket: SUPABASE_BUCKETS.PRIVATE_DOCUMENTS,
        storageKey: resolvedStorageKey,
      });
      if (remote) {
        fileBuffer = remote.buffer;
        contentType = remote.contentType;
      }
    }

    // 2. Fall back to local filesystem storage strictly in offline development/testing
    if (!fileBuffer) {
      if (isSupabasePrivateStorageConfigured()) {
        return NextResponse.json({ error: "المستند غير موجود في التخزين السحابي" }, { status: 404 });
      }

      if (process.env.NODE_ENV === "production" || Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim())) {
        return NextResponse.json(
          { error: "وحدة التخزين السحابية الخاصة غير مهيأة (مفتاح الصلاحيات الخادم مطلوب). يرجى تهيئة SUPABASE_SERVICE_ROLE_KEY." },
          { status: 503 }
        );
      }

      const privateDir = path.join(process.cwd(), "storage", "private", "documents");
      const filePath = path.join(privateDir, resolvedStorageKey);
      try {
        fileBuffer = await readFile(filePath);
        if (fileBuffer[0] === 0xff && fileBuffer[1] === 0xd8) {
          contentType = "image/jpeg";
        } else if (fileBuffer[0] === 0x89 && fileBuffer[1] === 0x50) {
          contentType = "image/png";
        } else if (fileBuffer[0] === 0x52 && fileBuffer[1] === 0x49) {
          contentType = "image/webp";
        }
      } catch {
        return NextResponse.json({ error: "المستند غير موجود في التخزين الخاص" }, { status: 404 });
      }
    }

    const url = new URL(request.url);
    const isDownload = url.searchParams.get("download") === "true";
    const disposition = isDownload ? 'attachment; filename="document"' : 'inline; filename="secure-document"';

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(fileBuffer.length),
        "Content-Disposition": disposition,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Secure document serving error:", error);
    return NextResponse.json({ error: "فشل استعراض المستند" }, { status: 500 });
  }
}
