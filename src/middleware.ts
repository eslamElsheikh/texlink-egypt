import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "texlink-egypt-default-fallback-secret-2026"
);

const COOKIE_NAME = "texlink_session";

interface TokenPayload {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "FACTORY" | "BUYER";
  isFactory: boolean;
  isBuyer: boolean;
  factorySlug?: string | null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  let session: TokenPayload | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      session = payload as unknown as TokenPayload;
    } catch {
      session = null;
    }
  }

  // 1. Admin Routes Protection (/admin/*)
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.role !== "ADMIN") {
      // Authenticated non-admin: redirect to their authorized dashboard
      if (session.isFactory) {
        return NextResponse.redirect(new URL("/factory/dashboard", request.url));
      }
      return NextResponse.redirect(new URL("/buyer/dashboard", request.url));
    }

    // Authenticated ADMIN: allow access
    return NextResponse.next();
  }

  // 2. Factory Dashboard Routes (/factory/*)
  if (pathname.startsWith("/factory")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.role !== "ADMIN" && !session.isFactory) {
      return NextResponse.redirect(new URL("/buyer/dashboard", request.url));
    }

    return NextResponse.next();
  }

  // 3. Buyer Dashboard Routes (/buyer/*)
  if (pathname.startsWith("/buyer")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/factory/:path*",
    "/buyer/:path*",
  ],
};
