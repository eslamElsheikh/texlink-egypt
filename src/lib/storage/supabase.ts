/**
 * TexLink — Free Tier Supabase Storage Client
 * Strictly operates within the $0.00 budget:
 * - Public bucket: 'texlink-public-assets' (catalog photos, factory logos)
 * - Private bucket: 'factory-private-documents' (commercial register, tax cards)
 * - Strictly separates private service-role access from public anon access.
 * - Private operations fail closed if SUPABASE_SERVICE_ROLE_KEY is missing.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_BUCKETS = {
  PRIVATE_DOCUMENTS: "factory-private-documents",
  PUBLIC_ASSETS: "texlink-public-assets",
} as const;

let privateClientCache: { cacheKey: string; client: SupabaseClient } | null = null;
let publicClientCache: { cacheKey: string; client: SupabaseClient } | null = null;

/**
 * Returns true strictly when server-side service-role credentials are present
 * for private document operations. Never falls back to the public anon key.
 */
export function isSupabasePrivateStorageConfigured(
  env: NodeJS.ProcessEnv = process.env
): boolean {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return Boolean(url && serviceKey);
}

/**
 * Returns true when public asset storage credentials (anon key or service role)
 * and project URL are configured.
 */
export function isSupabasePublicStorageConfigured(
  env: NodeJS.ProcessEnv = process.env
): boolean {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return Boolean(url && key);
}

/**
 * Legacy helper retained for strict private-first compatibility.
 * Requires service-role credentials; never accepts anonymous-only config.
 */
export function isSupabaseStorageConfigured(
  env: NodeJS.ProcessEnv = process.env
): boolean {
  return isSupabasePrivateStorageConfigured(env);
}

/**
 * Server-side privileged Supabase client strictly for private document operations.
 * Returns null if SUPABASE_SERVICE_ROLE_KEY is missing (fail-closed).
 */
export function getSupabasePrivateClient(
  env: NodeJS.ProcessEnv = process.env
): SupabaseClient | null {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) {
    return null;
  }

  const cacheKey = `${url}::${serviceKey}`;
  if (!privateClientCache || privateClientCache.cacheKey !== cacheKey) {
    privateClientCache = {
      cacheKey,
      client: createClient(url, serviceKey, {
        auth: { persistSession: false },
      }),
    };
  }

  return privateClientCache.client;
}

/**
 * Public Supabase client exclusively for public catalog/asset buckets.
 * Uses NEXT_PUBLIC_SUPABASE_ANON_KEY when available.
 */
export function getSupabasePublicClient(
  env: NodeJS.ProcessEnv = process.env
): SupabaseClient | null {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    return null;
  }

  const cacheKey = `${url}::${key}`;
  if (!publicClientCache || publicClientCache.cacheKey !== cacheKey) {
    publicClientCache = {
      cacheKey,
      client: createClient(url, key, {
        auth: { persistSession: false },
      }),
    };
  }

  return publicClientCache.client;
}

/**
 * Safe alias for getSupabasePrivateClient() — never silently falls back to anon key.
 */
export function getSupabaseClient(
  env: NodeJS.ProcessEnv = process.env
): SupabaseClient | null {
  return getSupabasePrivateClient(env);
}

/**
 * Resets cached Supabase client instances (used in unit tests).
 */
export function resetSupabaseStorageClients(): void {
  privateClientCache = null;
  publicClientCache = null;
}

/**
 * Uploads a file buffer to Supabase Storage Free Tier.
 * Private buckets strictly require the server-side service-role client.
 */
export async function uploadToSupabaseStorage(params: {
  bucket: string;
  storageKey: string;
  buffer: Buffer;
  contentType: string;
}): Promise<{ success: boolean; url?: string; error?: string }> {
  const { bucket, storageKey, buffer, contentType } = params;
  const isPublicBucket = bucket === SUPABASE_BUCKETS.PUBLIC_ASSETS;

  const client = isPublicBucket ? getSupabasePublicClient() : getSupabasePrivateClient();
  if (!client) {
    return {
      success: false,
      error: isPublicBucket
        ? "Supabase public storage credentials not configured"
        : "Supabase service-role credentials (SUPABASE_SERVICE_ROLE_KEY) required for private document storage",
    };
  }

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

    if (isPublicBucket) {
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
 * Downloads a file buffer from Supabase Storage.
 * Private buckets strictly require the server-side service-role client and fail closed if unavailable.
 */
export async function downloadFromSupabaseStorage(params: {
  bucket: string;
  storageKey: string;
}): Promise<{ buffer: Buffer; contentType: string } | null> {
  const isPublicBucket = params.bucket === SUPABASE_BUCKETS.PUBLIC_ASSETS;
  const client = isPublicBucket ? getSupabasePublicClient() : getSupabasePrivateClient();
  if (!client) {
    return null;
  }

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
