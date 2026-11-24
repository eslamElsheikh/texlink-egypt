import crypto from "crypto";

const PRIVATE_KEY_REGEX = /^priv_([a-zA-Z0-9_-]+)_([a-zA-Z0-9-]+)(\.[a-zA-Z0-9]+)?$/;
const VALID_STORAGE_KEY_REGEX = /^[a-zA-Z0-9_.-]+$/;
const VALID_USER_ID_REGEX = /^[a-zA-Z0-9_-]+$/;

/**
 * Validates raw storage key route parameters, strictly rejecting path traversal,
 * directory separators, hidden dot-files, and malformed characters.
 */
export function isValidStorageKeyParam(key: string): boolean {
  if (!key || typeof key !== "string") return false;
  if (key === "." || key === ".." || key.startsWith(".")) return false;
  if (key.includes("..") || key.includes("/") || key.includes("\\")) return false;
  return VALID_STORAGE_KEY_REGEX.test(key);
}

/**
 * Generates a private storage key strictly scoped to the uploading user ID.
 * Shared across upload and download authorization to guarantee a single format.
 */
export function buildPrivateStorageKey(userId: string, randomId?: string): string {
  if (!userId || !VALID_USER_ID_REGEX.test(userId)) {
    throw new Error("Invalid uploader user ID for private storage key");
  }
  const id = randomId || crypto.randomUUID();
  if (!/^[a-zA-Z0-9-]+$/.test(id)) {
    throw new Error("Invalid random identifier for private storage key");
  }
  return `priv_${userId}_${id}.dat`;
}

/**
 * Parses a user-scoped private storage key (`priv_<uploaderUserId>_<uuid>.dat`).
 * Returns null if the key does not match the scoped format.
 */
export function parsePrivateStorageKey(
  key: string
): { uploaderUserId: string; fileId: string } | null {
  if (!isValidStorageKeyParam(key)) return null;
  const match = key.match(PRIVATE_KEY_REGEX);
  if (!match) return null;
  return {
    uploaderUserId: match[1],
    fileId: match[2],
  };
}

/**
 * Extracts and validates the storage key from an internal document URL
 * (e.g., "/api/documents/priv_user1_uuid.dat" -> "priv_user1_uuid.dat").
 */
export function extractStorageKeyFromUrl(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  const cleanPath = url.split("?")[0]?.split("#")[0] || "";
  const candidate = cleanPath.split("/").pop() || "";
  return isValidStorageKeyParam(candidate) ? candidate : null;
}
