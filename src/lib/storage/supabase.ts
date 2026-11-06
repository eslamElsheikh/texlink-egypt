/**
 * TexLink — Free Tier Supabase Storage Client
 * Strictly operates within the $0.00 budget:
 * - Public bucket: 'texlink-public-assets' (catalog photos, factory logos)
 * - Private bucket: 'factory-private-documents' (commercial register, tax cards)
 * - Falls back to local storage in offline dev/test environments.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_BUCKETS = {
  PRIVATE_DOCUMENTS: "factory-private-documents",
  PUBLIC_ASSETS: "texlink-public-assets",
} as const;

let supabaseInstance: SupabaseClient | null = null;

export function isSupabaseStorageConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseStorageConfigured()) {
    return null;
  }

  if (!supabaseInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    supabaseInstance = createClient(url, key, {
      auth: { persistSession: false },
    });
  }

  return supabaseInstance;
}

/**
 * Uploads a file buffer to Supabase Storage Free Tier
 */
export async function uploadToSupabaseStorage(params: {
  bucket: string;
  storageKey: string;
  buffer: Buffer;
  contentType: string;
}): Promise<{ success: boolean; url?: string; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: "Supabase Storage credentials not configured" };
  }

  const { bucket, storageKey, buffer, contentType } = params;

  try {
    const { error: uploadError } = await client.storage
      .from(bucket)
      .upload(storageKey, buffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error(`Supabase Storage upload error [${bucket}/${storageKey}]:`, uploadError);
      return { success: false, error: uploadError.message };
    }

    if (bucket === SUPABASE_BUCKETS.PUBLIC_ASSETS) {
      const { data } = client.storage.from(bucket).getPublicUrl(storageKey);
      return { success: true, url: data.publicUrl };
    }

    // For private documents, URL is routed via authenticated Next.js endpoint
    return { success: true, url: `/api/documents/${storageKey}` };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Supabase Storage exception:", message);
    return { success: false, error: message };
  }
}

/**
 * Downloads a file buffer from private Supabase Storage
 */
export async function downloadFromSupabaseStorage(params: {
  bucket: string;
  storageKey: string;
}): Promise<{ buffer: Buffer; contentType: string } | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client.storage
      .from(params.bucket)
      .download(params.storageKey);

    if (error || !data) {
      console.error(`Supabase download error [${params.storageKey}]:`, error);
      return null;
    }

    const arrayBuffer = await data.arrayBuffer();
    return {
      buffer: Buffer.from(arrayBuffer),
      contentType: data.type || "application/pdf",
    };
  } catch (err) {
    console.error("Supabase download exception:", err);
    return null;
  }
}
