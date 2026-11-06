import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { getCurrentUser } from "@/lib/auth/session";
import { validateFileSignature } from "@/lib/storage/signatures";
import {
  isSupabaseStorageConfigured,
  uploadToSupabaseStorage,
  SUPABASE_BUCKETS,
} from "@/lib/storage/supabase";
const ALLOWED_MIME_TYPES: Record<string, true> = {
  "image/jpeg": true,
  "image/png": true,
  "image/webp": true,
  "application/pdf": true,
};

const FORBIDDEN_EXTENSIONS: Record<string, true> = {
  ".exe": true,
  ".bat": true,
  ".cmd": true,
  ".sh": true,
  ".php": true,
  ".js": true,
  ".mjs": true,
  ".html": true,
  ".htm": true,
  ".vbs": true,
  ".dll": true,
  ".com": true,
};

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json(
        { error: "غير مصرح لك برفع الملفات، يرجى تسجيل الدخول أولاً" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const isPrivate =
      formData.get("isPrivate") === "true" ||
      formData.get("type") === "DOCUMENT" ||
      formData.get("type") === "COMMERCIAL_REGISTER" ||
      formData.get("type") === "TAX_CARD" ||
      formData.get("type") === "INDUSTRIAL_REGISTER";

    if (!file) {
      return NextResponse.json({ error: "لم يتم تحديد أي ملف" }, { status: 400 });
    }

    // 1. Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "حجم الملف كبير جداً، الحد الأقصى 10 ميجابايت" },
        { status: 400 }
      );
    }

    // 2. Validate declared MIME type
    if (!ALLOWED_MIME_TYPES[file.type]) {
      return NextResponse.json(
        { error: "نوع الملف غير مدعوم. الأنواع المسموح بها هي الصور (JPG, PNG, WebP) ومستندات PDF فقط" },
        { status: 400 }
      );
    }

    // 3. Validate file extension against blacklist
    const ext = path.extname(file.name).toLowerCase();
    if (FORBIDDEN_EXTENSIONS[ext]) {
      return NextResponse.json(
        { error: "امتداد الملف غير مسموح به لأسباب أمنية" },
        { status: 400 }
      );
    }

    // 4. Validate binary magic bytes signature
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const signatureCheck = validateFileSignature(buffer, file.type);
    if (!signatureCheck.valid) {
      return NextResponse.json(
        { error: signatureCheck.error || "بصمة الملف الثنائية غير صالحة" },
        { status: 400 }
      );
    }

    // 5. Store according to confidentiality classification
    if (isPrivate) {
      const randomId = crypto.randomUUID();
      const storageKey = `priv_${randomId}.dat`;

      if (isSupabaseStorageConfigured()) {
        const uploadRes = await uploadToSupabaseStorage({
          bucket: SUPABASE_BUCKETS.PRIVATE_DOCUMENTS,
          storageKey,
          buffer,
          contentType: file.type,
        });

        if (!uploadRes.success) {
          return NextResponse.json(
            { error: "فشل حفظ المستند في وحدة التخزين السحابية المجانية" },
            { status: 500 }
          );
        }
      } else {
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json(
            { error: "وحدة التخزين السحابية غير مهيأة. يرجى تهيئة Supabase Storage في بيئة الإنتاج." },
            { status: 503 }
          );
        }
        // Fallback to local private storage strictly in development/test
        const privateDir = path.join(process.cwd(), "storage", "private", "documents");
        await mkdir(privateDir, { recursive: true });
        const filePath = path.join(privateDir, storageKey);
        await writeFile(filePath, buffer);
      }

      const secureDocumentUrl = `/api/documents/${storageKey}`;

      return NextResponse.json({
        success: true,
        isPrivate: true,
        storageKey,
        url: secureDocumentUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });
    }

    // Public Asset Storage (product photos, factory cover/logo)
    const randomId = crypto.randomUUID();
    const safeExt = ext.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
    const publicFileName = `pub_${randomId}.${safeExt}`;

    let publicUrl = `/uploads/${publicFileName}`;

    if (isSupabaseStorageConfigured()) {
      const uploadRes = await uploadToSupabaseStorage({
        bucket: SUPABASE_BUCKETS.PUBLIC_ASSETS,
        storageKey: publicFileName,
        buffer,
        contentType: file.type,
      });

      if (uploadRes.success && uploadRes.url) {
        publicUrl = uploadRes.url;
      }
    } else {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "وحدة التخزين السحابية غير مهيأة. يرجى تهيئة Supabase Storage في بيئة الإنتاج." },
          { status: 503 }
        );
      }
      const publicDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(publicDir, { recursive: true });
      const filePath = path.join(publicDir, publicFileName);
      await writeFile(filePath, buffer);
    }

    return NextResponse.json({
      success: true,
      isPrivate: false,
      url: publicUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء رفع الملف" },
      { status: 500 }
    );
  }
}
