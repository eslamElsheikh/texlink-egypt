import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getJwtSecretKey, JWT_ALGORITHM, COOKIE_NAME } from "./jwt-config";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: "BUYER" | "FACTORY" | "ADMIN";
  isFactory: boolean;
  isBuyer: boolean;
  factoryId?: string | null;
  factorySlug?: string | null;
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  const secretKey = getJwtSecretKey();
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey);
}

export async function verifySessionToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const secretKey = getJwtSecretKey();
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: [JWT_ALGORITHM],
    });
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireFactory(): Promise<SessionUser> {
  const user = await requireUser();
  if (!user.isFactory && user.role !== "FACTORY" && user.role !== "ADMIN") {
    throw new Error("FORBIDDEN_FACTORY_ONLY");
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN_ADMIN_ONLY");
  }
  return user;
}
