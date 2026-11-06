import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك" }, { status: 403 });
    }

    // 1. Statistics
    const [
      totalFactories,
      verifiedFactories,
      pendingFactories,
      totalBuyers,
      activeRfqs,
      totalQuotes,
      activeOrders,
      completedOrders,
      ordersAggregate,
    ] = await Promise.all([
      prisma.factoryProfile.count(),
      prisma.factoryProfile.count({ where: { verificationStatus: "VERIFIED" } }),
      prisma.factoryProfile.count({ where: { verificationStatus: "PENDING" } }),
      prisma.user.count({ where: { isBuyer: true } }),
      prisma.rfq.count({ where: { status: "OPEN" } }),
      prisma.quote.count(),
      prisma.order.count({ where: { status: { notIn: ["DELIVERED", "CANCELLED"] } } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
    ]);

    const totalTransactionVolume = ordersAggregate._sum.totalAmount || 0;

    // 2. Pending Factory Verifications
    const pendingVerifications = await prisma.factoryProfile.findMany({
      where: { verificationStatus: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { name: true, phone: true, email: true } },
        documents: true,
      },
    });

    // 3. Latest RFQs
    const latestRfqs = await prisma.rfq.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        buyer: { select: { name: true, buyerProfile: { select: { companyName: true } } } },
        _count: { select: { quotes: true } },
      },
    });

    // 4. Category Breakdown for Donut Chart
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { products: true, rfqs: true } },
      },
    });

    const totalCategoryItems = categories.reduce(
      (acc, c) => acc + c._count.products + c._count.rfqs,
      0
    ) || 1;

    const categoryColors = ["#5932A8", "#079B62", "#2563EB", "#D97706", "#EC4899"];

    const donutSegments = categories.map((c, i) => {
      const count = c._count.products + c._count.rfqs;
      const percentage = Math.round((count / totalCategoryItems) * 100);
      return {
        name: c.nameAr,
        value: count,
        percentage: percentage || 10,
        color: categoryColors[i % categoryColors.length],
      };
    });

    // 5. Recent Activity / Audit Log
    const recentActivities = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        admin: { select: { name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalFactories,
        verifiedFactories,
        pendingFactories,
        totalBuyers,
        activeRfqs,
        totalQuotes,
        activeOrders,
        completedOrders,
        totalTransactionVolume,
      },
      pendingVerifications: pendingVerifications.map((f) => ({
        id: f.id,
        nameAr: f.nameAr,
        slug: f.slug,
        ownerName: f.user.name,
        phone: f.user.phone,
        governorate: f.governorate,
        createdAt: f.createdAt,
        specialties: JSON.parse(f.specialties || "[]") as string[],
        documentsCount: f.documents.length,
      })),
      latestRfqs: latestRfqs.map((r) => ({
        id: r.id,
        titleAr: r.titleAr,
        buyerName: r.buyer.buyerProfile?.companyName || r.buyer.name,
        totalQuantity: r.totalQuantity,
        governorate: r.targetGovernorate || "القاهرة",
        quoteCount: r._count.quotes,
        status: r.status,
        createdAt: r.createdAt,
      })),
      donutSegments,
      recentActivities,
    });
  } catch (error) {
    console.error("Admin dashboard API error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب بيانات لوحة الإدارة" },
      { status: 500 }
    );
  }
}
