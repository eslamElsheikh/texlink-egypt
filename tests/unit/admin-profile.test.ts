import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSessionToken, verifySessionToken } from "@/lib/auth/session";

describe("Admin Profile & Password Management", () => {
  it("verifies and hashes new password securely during password change", async () => {
    const currentPassword = "OldPassword123";
    const oldHash = await hashPassword(currentPassword);

    // Verify current matches
    const isOldValid = await verifyPassword(currentPassword, oldHash);
    expect(isOldValid).toBe(true);

    const isWrongValid = await verifyPassword("WrongPassword", oldHash);
    expect(isWrongValid).toBe(false);

    // Hash new password
    const newPassword = "NewSecureAdminPassword2026";
    const newHash = await hashPassword(newPassword);

    expect(newHash).not.toBe(newPassword);
    expect(await verifyPassword(newPassword, newHash)).toBe(true);
    expect(await verifyPassword(currentPassword, newHash)).toBe(false);
  });

  it("updates admin session token with new profile information seamlessly", async () => {
    const initialSession = {
      id: "admin_123",
      email: "admin@texlink-egypt.com",
      name: "إدارة منصة تكس لينك القديم",
      phone: "01000000001",
      role: "ADMIN" as const,
      isFactory: false,
      isBuyer: true,
      factoryId: null,
      factorySlug: null,
    };

    const initialToken = await createSessionToken(initialSession);
    const decodedInitial = await verifySessionToken(initialToken);
    expect(decodedInitial?.name).toBe("إدارة منصة تكس لينك القديم");

    // Update name and phone
    const updatedSession = {
      ...initialSession,
      name: "م. إسلام - المشرف العام",
      phone: "01099998888",
    };

    const updatedToken = await createSessionToken(updatedSession);
    const decodedUpdated = await verifySessionToken(updatedToken);

    expect(decodedUpdated?.name).toBe("م. إسلام - المشرف العام");
    expect(decodedUpdated?.phone).toBe("01099998888");
    expect(decodedUpdated?.role).toBe("ADMIN");
  });
});
