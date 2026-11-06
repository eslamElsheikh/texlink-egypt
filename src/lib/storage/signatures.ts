/**
 * Secure File Signature (Magic Bytes) and Content Validator
 * Prevents MIME and extension spoofing by inspecting actual binary headers.
 */

export type SupportedFileType = "pdf" | "jpeg" | "png" | "webp";

export interface FileValidationResult {
  valid: boolean;
  detectedType?: SupportedFileType;
  error?: string;
}

/**
 * Validates actual binary signature of a file buffer.
 */
export function validateFileSignature(
  buffer: Buffer,
  declaredMimeType: string
): FileValidationResult {
  if (!buffer || buffer.length < 4) {
    return { valid: false, error: "الملف فارغ أو تالف" };
  }

  // 1. Check for malicious executable magic bytes
  // Windows PE (.exe, .dll, .scr): starts with 'MZ' (0x4D, 0x5A)
  if (buffer[0] === 0x4d && buffer[1] === 0x5a) {
    return { valid: false, error: "تم حظر رفع ملف تنفيذي لأسباب أمنية" };
  }
  // Linux ELF: 0x7F, 'E', 'L', 'F'
  if (buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46) {
    return { valid: false, error: "تم حظر رفع ملف تنفيذي لأسباب أمنية" };
  }
  // Shell script: '#!' (0x23, 0x21)
  if (buffer[0] === 0x23 && buffer[1] === 0x21) {
    return { valid: false, error: "تم حظر رفع ملف برمجي لأسباب أمنية" };
  }

  // Check for PHP or HTML script tags in the first 512 bytes
  const headerSlice = buffer.subarray(0, Math.min(buffer.length, 512)).toString("utf-8").toLowerCase();
  if (headerSlice.includes("<?php") || headerSlice.includes("<script") || headerSlice.includes("<!doctype html")) {
    return { valid: false, error: "تم اكتشاف شيفرة برمجية مدمجة بالملف" };
  }

  // 2. Identify legitimate file magic bytes
  // PDF: '%PDF' (0x25, 0x50, 0x44, 0x46)
  const isPdf =
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46;

  // JPEG: 0xFF, 0xD8, 0xFF
  const isJpeg =
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff;

  // PNG: 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A
  const isPng =
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a;

  // WebP: 'RIFF'....'WEBP'
  const isWebp =
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50;

  let detectedType: SupportedFileType | null = null;
  if (isPdf) detectedType = "pdf";
  else if (isJpeg) detectedType = "jpeg";
  else if (isPng) detectedType = "png";
  else if (isWebp) detectedType = "webp";

  if (!detectedType) {
    return {
      valid: false,
      error: "بصمة الملف الثنائية غير مطابقة للأنواع المسموح بها (PDF, JPEG, PNG, WebP)",
    };
  }

  // 3. Match declared MIME with detected magic bytes
  const mimeMap: Record<SupportedFileType, string[]> = {
    pdf: ["application/pdf"],
    jpeg: ["image/jpeg", "image/jpg", "image/pjpeg"],
    png: ["image/png"],
    webp: ["image/webp"],
  };

  const allowedForDetected = mimeMap[detectedType] || [];
  if (!allowedForDetected.includes(declaredMimeType.toLowerCase())) {
    return {
      valid: false,
      error: `تطابق غير صالح: بصمة الملف الحقيقية هي (${detectedType}) بينما النوع المعلن هو (${declaredMimeType})`,
    };
  }

  return { valid: true, detectedType };
}
