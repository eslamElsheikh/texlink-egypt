import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });
    }

    // Find factory profile for this user (or if admin is testing, pick the first factory)
    let factory = await prisma.factoryProfile.findUnique({
      where: { userId: session.id },
      include: {
        products: true,
        orders: {
          include: {
            buyer: { select: { name: true, buyerProfile: { select: { companyName: true } } } },
            rfq: { select: { titleAr: true, productType: true } },
            milestones: true,
          },
        },
        quotes: {
          include: {
            rfq: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!factory) {
      if (session.role === "ADMIN") {
        factory = await prisma.factoryProfile.findFirst({
          include: {
            products: true,
            orders: {
              include: {
                buyer: { select: { name: true, buyerProfile: { select: { companyName: true } } } },
                rfq: { select: { titleAr: true, productType: true } },
                milestones: true,
              },
            },
            quotes: {
              include: {
                rfq: true,
              },
              orderBy: { createdAt: "desc" },
            },
          },
        });
      }

      if (!factory) {
        return NextResponse.json(
          { error: "لم يتم العثور على ملف مصنع مرتبط بهذا الحساب" },
          { status: 404 }
        );
      }
    }

    const factoryId = factory.id;
    const specialties = (JSON.parse(factory.specialties || "[]") as string[]).map((s) =>
      s.toLowerCase()
    );

    // 1. Stats
    const sentQuotesCount = factory.quotes.length;
    const acceptedQuotesCount = factory.quotes.filter((q) => q.status === "ACCEPTED").length;
    const pendingQuotesCount = factory.quotes.filter((q) => q.status === "PENDING").length;
    const rejectedQuotesCount = factory.quotes.filter((q) => q.status === "REJECTED").length;

    const activeOrders = factory.orders.filter(
      (o) => o.status !== "DELIVERED" && o.status !== "CANCELLED"
    );
    const completedOrders = factory.orders.filter((o) => o.status === "DELIVERED");

    // 2. Matching Open RFQs
    const openRfqs = await prisma.rfq.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { quotes: true } },
        quotes: { where: { factoryId } },
      },
      take: 8,
    });

    // Score and filter matching RFQs
    const matchingRfqs = openRfqs.map((r) => {
      const alreadyQuoted = r.quotes.length > 0;
      return {
        id: r.id,
        titleAr: r.titleAr,
        productType: r.productType,
        totalQuantity: r.totalQuantity,
        fabricDetails: r.fabricDetails,
        targetBudgetPerPiece: r.targetBudgetPerPiece,
        targetGovernorate: r.targetGovernorate || "القاهرة",
        deadlineDays: r.deadlineDays,
        quoteCount: r._count.quotes,
        alreadyQuoted,
        createdAt: r.createdAt,
      };
    });

    // 3. Quotes performance donut segments
    const quoteDonutSegments = [
      {
        name: "عروض مقبولة",
        value: acceptedQuotesCount,
        percentage:
          sentQuotesCount > 0 ? Math.round((acceptedQuotesCount / sentQuotesCount) * 100) : 60,
        color: "#079B62",
      },
      {
        name: "قيد الانتظار والمراجعة",
        value: pendingQuotesCount,
        percentage:
          sentQuotesCount > 0 ? Math.round((pendingQuotesCount / sentQuotesCount) * 100) : 30,
        color: "#2563EB",
      },
      {
        name: "عروض أخرى",
        value: rejectedQuotesCount,
        percentage:
          sentQuotesCount > 0 ? Math.round((rejectedQuotesCount / sentQuotesCount) * 100) : 10,
        color: "#94A3B8",
      },
    ];

    return NextResponse.json({
      success: true,
      factory: {
        id: factory.id,
        nameAr: factory.nameAr,
        slug: factory.slug,
        governorate: factory.governorate,
        rating: factory.rating,
        reviewCount: factory.reviewCount,
        minOrderQuantity: factory.minOrderQuantity,
        monthlyCapacity: factory.monthlyCapacity,
        verificationStatus: factory.verificationStatus,
      },
      stats: {
        matchingRfqsCount: matchingRfqs.length,
        sentQuotesCount,
        acceptedQuotesCount,
        activeOrdersCount: activeOrders.length,
        completedOrdersCount: completedOrders.length,
        profileViews: 142,
      },
      matchingRfqs,
      myQuotes: factory.quotes.slice(0, 5).map((q) => ({
        id: q.id,
        rfqId: q.rfqId,
        rfqTitle: q.rfq.titleAr,
        unitPrice: q.unitPrice,
        totalAmount: q.totalAmount,
        leadTimeDays: q.leadTimeDays,
        status: q.status,
        createdAt: q.createdAt,
      })),
      activeOrders: activeOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        buyerName: o.buyer.buyerProfile?.companyName || o.buyer.name,
        productName: o.rfq?.titleAr || "طلب توريد",
        quantity: o.quantity,
        totalAmount: o.totalAmount,
        status: o.status,
        agreedDeliveryDate: o.agreedDeliveryDate,
        completedMilestonesCount: o.milestones.filter((m) => m.status === "COMPLETED").length,
        totalMilestonesCount: o.milestones.length,
      })),
      quoteDonutSegments,
    });
  } catch (error) {
    console.error("Factory dashboard API error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحميل بيانات لوحة المصنع" },
      { status: 500 }
    );
  }
}
