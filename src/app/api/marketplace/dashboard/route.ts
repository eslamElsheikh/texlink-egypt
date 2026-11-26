import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { resolveFactoryContext } from "@/lib/auth/factory-context";

export async function GET(request: Request) {
  try {
    const ctx = await resolveFactoryContext(request);
    if ("error" in ctx) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status });
    }
    const { factoryId, factory, settings, isAdminPreview } = ctx;

    if (!settings?.marketplaceEnabled) {
      return NextResponse.json(
        { error: "حساب المصنع مضبوط على وضع الإدارة فقط؛ قم بتفعيل السوق التجاري للوصول إلى لوحة السوق" },
        { status: 403 }
      );
    }

    if (factory.verificationStatus !== "VERIFIED") {
      return NextResponse.json(
        { error: "يجب إتمام التحقق الميداني للمصنع قبل الوصول إلى لوحة السوق التجاري" },
        { status: 403 }
      );
    }

    const [
      matchingRfqs,
      myQuotes,
      factoryOrders,
      products,
    ] = await Promise.all([
      prisma.rfq.findMany({
        where: { status: "OPEN" },
        include: {
          buyer: { select: { name: true, buyerProfile: { select: { companyName: true } } } },
          category: { select: { nameAr: true } },
          _count: { select: { quotes: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.quote.findMany({
        where: { factoryId },
        include: {
          rfq: { select: { id: true, titleAr: true, totalQuantity: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.order.findMany({
        where: { factoryId },
        include: {
          buyer: { select: { name: true } },
          product: { select: { nameAr: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.product.findMany({
        where: { factoryId, isActive: true },
        select: { id: true, nameAr: true, basePrice: true, stockQuantity: true },
      }),
    ]);

    const acceptedQuotesCount = myQuotes.filter((q) => q.status === "ACCEPTED").length;
    const pendingQuotesCount = myQuotes.filter((q) => q.status === "PENDING").length;
    const totalMarketplaceVolume = factoryOrders.reduce((s, o) => s + o.totalAmount, 0);

    return NextResponse.json({
      factory: {
        id: factory.id,
        nameAr: factory.nameAr,
        slug: factory.slug,
      },
      isAdminPreview,
      kpis: {
        openRfqsCount: matchingRfqs.length,
        submittedQuotesCount: myQuotes.length,
        acceptedQuotesCount,
        pendingQuotesCount,
        marketplaceOrdersCount: factoryOrders.length,
        totalMarketplaceVolume,
        catalogProductsCount: products.length,
      },
      recentRfqs: matchingRfqs,
      recentQuotes: myQuotes,
      recentOrders: factoryOrders,
    });
  } catch (error) {
    console.error("GET /api/marketplace/dashboard error:", error);
    return NextResponse.json({ error: "فشل تحميل لوحة تحكم السوق التجاري" }, { status: 500 });
  }
}
