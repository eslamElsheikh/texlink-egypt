import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getJwtSecretKey, JWT_ALGORITHM, COOKIE_NAME } from "@/lib/auth/jwt-config";

export interface TokenPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  isFactory: boolean;
  isBuyer: boolean;
  factorySlug?: string | null;
}

export function resolveUserDefaultLanding(role: string, isFactory: boolean): string {
  const normalizedRole = role?.toUpperCase();
  if (normalizedRole === "ADMIN" || normalizedRole === "PLATFORM_ADMIN") {
    return "/admin/dashboard";
  }
  if (normalizedRole === "CRM_MANAGER" || normalizedRole === "SALES_EMPLOYEE") {
    return "/crm/dashboard";
  }
  if (normalizedRole === "PRODUCTION_EMPLOYEE") {
    return "/factory/production";
  }
  if (normalizedRole === "WAREHOUSE_EMPLOYEE") {
    return "/factory/inventory";
  }
  if (
    normalizedRole === "FACTORY" ||
    normalizedRole === "FACTORY_OWNER" ||
    normalizedRole === "FACTORY_ADMIN" ||
    normalizedRole === "FACTORY_MANAGER" ||
    isFactory
  ) {
    return "/factory/dashboard";
  }
  return "/buyer/dashboard";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  let session: TokenPayload | null = null;

  if (token) {
    try {
      const secretKey = getJwtSecretKey();
      const { payload } = await jwtVerify(token, secretKey, {
        algorithms: [JWT_ALGORITHM],
      });
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

    if (session.role?.toUpperCase() !== "ADMIN" && session.role?.toUpperCase() !== "PLATFORM_ADMIN") {
      const destination = resolveUserDefaultLanding(session.role, session.isFactory);
      return NextResponse.redirect(new URL(destination, request.url));
    }

    return NextResponse.next();
  }

  // 2. Factory Dashboard Routes (/factory/*)
  if (pathname.startsWith("/factory")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const normalizedRole = session.role?.toUpperCase();
    const isAuthorizedForFactory =
      normalizedRole === "ADMIN" ||
      normalizedRole === "PLATFORM_ADMIN" ||
      normalizedRole === "FACTORY" ||
      normalizedRole === "FACTORY_OWNER" ||
      normalizedRole === "FACTORY_ADMIN" ||
      normalizedRole === "FACTORY_MANAGER" ||
      normalizedRole === "PRODUCTION_EMPLOYEE" ||
      normalizedRole === "WAREHOUSE_EMPLOYEE" ||
      session.isFactory;

    if (!isAuthorizedForFactory) {
      return NextResponse.redirect(new URL("/buyer/dashboard", request.url));
    }

    return NextResponse.next();
  }

  // 3. CRM Workspace Routes (/crm/*)
  if (pathname.startsWith("/crm")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const normalizedRole = session.role?.toUpperCase();
    const isAuthorizedForCrm =
      normalizedRole === "ADMIN" ||
      normalizedRole === "PLATFORM_ADMIN" ||
      normalizedRole === "CRM_MANAGER" ||
      normalizedRole === "SALES_EMPLOYEE" ||
      normalizedRole === "FACTORY" ||
      normalizedRole === "FACTORY_OWNER" ||
      normalizedRole === "FACTORY_ADMIN" ||
      normalizedRole === "FACTORY_MANAGER" ||
      session.isFactory;

    if (!isAuthorizedForCrm) {
      return NextResponse.redirect(new URL("/buyer/dashboard", request.url));
    }

    return NextResponse.next();
  }
  // 4. Marketplace Seller Workspace Routes (/marketplace/*)
  if (pathname.startsWith("/marketplace")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // 5. Buyer Dashboard Routes (/buyer/*)
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
    "/crm/:path*",
    "/marketplace/:path*",
    "/buyer/:path*",
  ],
};
