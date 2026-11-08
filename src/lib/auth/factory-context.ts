import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser, SessionUser } from "@/lib/auth/session";
import type { FactoryProfile, FactorySettings } from "@prisma/client";

export interface FactoryContext {
  user: SessionUser;
  factory: FactoryProfile;
  factoryId: string;
  settings: FactorySettings | null;
  isAdminPreview: boolean;
}

/**
 * Resolves the authenticated factory context safely on the server.
 * Guarantees factoryId is strictly derived from verified session ownership.
 * Admins can preview a specific factory via `inspectFactoryId` parameter.
 */
export async function resolveFactoryContext(
  request?: Request
): Promise<FactoryContext | { error: string; status: number }> {
  const session = await getCurrentUser();
  if (!session) {
    return { error: "غير مصرح لك بالوصول، يرجى تسجيل الدخول أولاً", status: 401 };
  }

  const normalizedRole = (session.role || "").toUpperCase();
  const isFactoryRole =
    session.isFactory ||
    normalizedRole === "FACTORY" ||
    normalizedRole === "FACTORY_OWNER" ||
    normalizedRole === "FACTORY_ADMIN" ||
    normalizedRole === "FACTORY_MANAGER" ||
    normalizedRole === "CRM_MANAGER" ||
    normalizedRole === "SALES_EMPLOYEE" ||
    normalizedRole === "PRODUCTION_EMPLOYEE" ||
    normalizedRole === "WAREHOUSE_EMPLOYEE";

  // 1. Factory / CRM user resolution
  if (isFactoryRole) {
    let factory = await prisma.factoryProfile.findUnique({
      where: { userId: session.id },
      include: { settings: true },
    });

    // For non-owner staff/employees, strictly verify live employment from database to defeat stale JWTs
    if (!factory) {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.id },
        select: { factoryId: true, role: true },
      });

      if (!dbUser || !dbUser.factoryId) {
        return { error: "تم إلغاء ارتباطك بالمصنع أو إيقاف حسابك، يرجى مراجعة إدارة المنشأة", status: 403 };
      }

      factory = await prisma.factoryProfile.findUnique({
        where: { id: dbUser.factoryId },
        include: { settings: true },
      });
    }

    if (!factory) {
      return { error: "لم يتم العثور على ملف مصنع مرتبط بحسابك", status: 403 };
    }

    return {
      user: session,
      factory,
      factoryId: factory.id,
      settings: factory.settings,
      isAdminPreview: false,
    };
  }

  // 2. Admin preview mode
  if (normalizedRole === "ADMIN" || normalizedRole === "PLATFORM_ADMIN") {
    let targetFactoryId: string | null = null;

    if (request) {
      try {
        const url = new URL(request.url);
        targetFactoryId = url.searchParams.get("inspectFactoryId") || url.searchParams.get("factoryId");
      } catch {
        // Fall back if request is not standard URL
      }
    }

    let factory: (FactoryProfile & { settings: FactorySettings | null }) | null = null;
    if (targetFactoryId) {
      factory = await prisma.factoryProfile.findUnique({
        where: { id: targetFactoryId },
        include: { settings: true },
      });
    }

    if (!factory) {
      // In production, require explicit targetFactoryId rather than silently guessing
      const isProduction = process.env.NODE_ENV === "production";
      if (isProduction && targetFactoryId) {
        return { error: "المصنع المحدد للمعاينة غير موجود", status: 404 };
      }

      if (!isProduction) {
        // Development / Preview fallback for testing convenience
        factory = await prisma.factoryProfile.findFirst({
          where: { slug: "el-nasr-tricot" },
          include: { settings: true },
        });

        if (!factory) {
          factory = await prisma.factoryProfile.findFirst({
            include: { settings: true },
          });
        }
      } else {
        return {
          error: "يجب على المشرف تحديد معرف المصنع المراد معاينته بواسطة inspectFactoryId",
          status: 400,
        };
      }
    }

    if (!factory) {
      return { error: "لا يوجد أي مصانع مسجلة في النظام بعد", status: 404 };
    }

    // Auditable Admin inspection logging
    try {
      await prisma.auditLog.create({
        data: {
          adminId: session.id,
          action: "INSPECT_FACTORY_TENANT",
          targetType: "FACTORY",
          targetId: factory.id,
          details: JSON.stringify({
            adminEmail: session.email,
            factorySlug: factory.slug,
            timestamp: new Date().toISOString(),
          }),
        },
      });
    } catch (auditErr) {
      console.error("Non-blocking audit log error:", auditErr);
    }

    return {
      user: session,
      factory,
      factoryId: factory.id,
      settings: factory.settings,
      isAdminPreview: true,
    };
  }

  // 3. Unauthorized role (e.g. BUYER)
  return { error: "هذه الصفحة مخصصة لإدارة المصانع والعمليات التشغيلية فقط", status: 403 };
}
