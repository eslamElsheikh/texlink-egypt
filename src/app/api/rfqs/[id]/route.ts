import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentUser();

    let targetId = id;
    if (id === "rfq-1" || id === "rfq-2" || id === "rfq-3") {
      const index = id === "rfq-1" ? 0 : id === "rfq-2" ? 1 : 2;
      const matched = await prisma.rfq.findMany({
        where: { status: "OPEN" },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { id: true },
      });
      if (matched[index]) {
        targetId = matched[index].id;
      }
    }

    const rfq = await prisma.rfq.findUnique({
      where: { id: targetId },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            buyerProfile: { select: { companyName: true, governorate: true } },
          },
        },
        category: true,
        sizeBreakdowns: true,
        attachments: true,
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
                logoUrl: true,
              },
            },
          },
          orderBy: { unitPrice: "asc" },
        },
      },
    });

    if (!rfq) {
      return NextResponse.json({ error: "طلب التصنيع غير موجود" }, { status: 404 });
    }

    // Role-based quote visibility:
    // If the viewer is the Buyer owner or Admin: sees all quotes.
    // If the viewer is a Factory: sees only its own quote (if submitted).
    const isOwner = session && session.id === rfq.buyerId;
    const isAdmin = session && session.role === "ADMIN";

    let visibleQuotes = rfq.quotes;
    if (!isOwner && !isAdmin) {
      if (session?.factoryId) {
        visibleQuotes = rfq.quotes.filter(
          (q) => q.factoryId === session.factoryId
        );
      } else {
        visibleQuotes = [];
      }
    }

    return NextResponse.json({
      success: true,
      rfq: {
        ...rfq,
        quotes: visibleQuotes,
        totalQuotesCount: rfq.quotes.length,
        isOwner: Boolean(isOwner),
      },
    });
  } catch (error) {
    console.error("Fetch RFQ detail error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحميل بيانات طلب التصنيع" },
      { status: 500 }
    );
  }
}
