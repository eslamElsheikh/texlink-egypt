import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });
    }

    let buyerId = session.id;

    // If an admin or test user visits, ensure they can view buyer data
    let userRecord = await prisma.user.findUnique({
      where: { id: buyerId },
      include: { buyerProfile: true },
    });

    if (!userRecord?.isBuyer && session.role === "ADMIN") {
      const demoBuyer = await prisma.user.findFirst({
        where: { isBuyer: true },
        include: { buyerProfile: true },
      });
      if (demoBuyer) buyerId = demoBuyer.id;
    }

    // 1. Fetch Buyer's RFQs
    const rfqs = await prisma.rfq.findMany({
      where: { buyerId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { quotes: true } },
        quotes: {
          include: {
            factory: {
              select: {
                id: true,
                nameAr: true,
                slug: true,
                governorate: true,
                rating: true,
                reviewCount: true,
              },
            },
          },
          orderBy: { unitPrice: "asc" },
        },
      },
    });

    // 2. Fetch Buyer's Orders
    const orders = await prisma.order.findMany({
      where: { buyerId },
      orderBy: { createdAt: "desc" },
      include: {
        factory: { select: { nameAr: true, slug: true, phone: true } },
        rfq: { select: { titleAr: true, productType: true } },
        milestones: { orderBy: { step: "asc" } },
      },
    });

    const totalRfqs = rfqs.length;
    const openRfqs = rfqs.filter((r) => r.status === "OPEN").length;

    // All quotes received across buyer's RFQs
    const allReceivedQuotes = rfqs.flatMap((r) =>
      r.quotes.map((q) => ({
        ...q,
        rfqTitle: r.titleAr,
        rfqQuantity: r.totalQuantity,
      }))
    );

    const pendingDecisionQuotes = allReceivedQuotes.filter(
      (q) => q.status === "PENDING"
    );

    const activeOrders = orders.filter(
      (o) => o.status !== "DELIVERED" && o.status !== "CANCELLED"
    );
    const completedOrders = orders.filter((o) => o.status === "DELIVERED");

    // Donut segments: category breakdown of buyer's RFQs
    const categoryCounts: Record<string, number> = {};
    for (const r of rfqs) {
      const type = r.productType || "أخرى";
      categoryCounts[type] = (categoryCounts[type] || 0) + 1;
    }

    const donutColors = ["#5932A8", "#079B62", "#2563EB", "#D97706", "#EC4899"];
    const donutSegments = Object.entries(categoryCounts).map(
      ([name, count], i) => ({
        name,
        value: count,
        percentage: Math.round((count / (totalRfqs || 1)) * 100),
        color: donutColors[i % donutColors.length],
      })
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalRfqs,
        openRfqs,
        receivedQuotesCount: allReceivedQuotes.length,
        pendingQuotesCount: pendingDecisionQuotes.length,
        activeOrdersCount: activeOrders.length,
        completedOrdersCount: completedOrders.length,
      },
      latestRfqs: rfqs.slice(0, 5).map((r) => ({
        id: r.id,
        titleAr: r.titleAr,
        totalQuantity: r.totalQuantity,
        productType: r.productType,
        fabricDetails: r.fabricDetails,
        targetBudgetPerPiece: r.targetBudgetPerPiece,
        deadlineDays: r.deadlineDays,
        quoteCount: r._count.quotes,
        status: r.status,
        createdAt: r.createdAt,
      })),
      pendingQuotes: pendingDecisionQuotes.slice(0, 4).map((q) => ({
        id: q.id,
        rfqId: q.rfqId,
        rfqTitle: q.rfqTitle,
        unitPrice: q.unitPrice,
        totalAmount: q.totalAmount,
        leadTimeDays: q.leadTimeDays,
        samplePrice: q.samplePrice,
        paymentTermsAr: q.paymentTermsAr,
        factoryName: q.factory?.nameAr || "مورد",
        factoryRating: q.factory?.rating ?? 5.0,
        factoryGovernorate: q.factory?.governorate || "غير محدد",
        createdAt: q.createdAt,
      })),
      activeOrders: activeOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        factoryName: o.factory?.nameAr || "مورد",
        productName: o.rfq?.titleAr || "طلب توريد",
        quantity: o.quantity,
        totalAmount: o.totalAmount,
        status: o.status,
        agreedDeliveryDate: o.agreedDeliveryDate,
        completedMilestonesCount: o.milestones.filter(
          (m) => m.status === "COMPLETED"
        ).length,
        totalMilestonesCount: o.milestones.length,
      })),
      donutSegments:
        donutSegments.length > 0
          ? donutSegments
          : [
              { name: "تيشيرتات", value: 1, percentage: 60, color: "#5932A8" },
              { name: "هوديز", value: 1, percentage: 40, color: "#079B62" },
            ],
    });
  } catch (error) {
    console.error("Buyer dashboard API error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحميل بيانات لوحة المشتري" },
      { status: 500 }
    );
  }
}
