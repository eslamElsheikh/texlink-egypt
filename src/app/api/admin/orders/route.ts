import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك" }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        buyer: { select: { name: true, buyerProfile: { select: { companyName: true } } } },
        factory: { select: { nameAr: true, slug: true, phone: true } },
        rfq: { select: { titleAr: true, productType: true } },
        milestones: { orderBy: { step: "asc" } },
      },
    });

    return NextResponse.json({
      success: true,
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        buyerName: o.buyer.buyerProfile?.companyName || o.buyer.name,
        factoryName: o.factory.nameAr,
        productName: o.rfq?.titleAr || "طلب توريد",
        quantity: o.quantity,
        totalAmount: o.totalAmount,
        unitPrice: o.unitPrice,
        status: o.status,
        createdAt: o.createdAt,
        completedMilestonesCount: o.milestones.filter((m) => m.status === "COMPLETED").length,
        totalMilestonesCount: o.milestones.length,
      })),
    });
  } catch (error) {
    console.error("Admin fetch orders error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحميل سجل الأوامر" },
      { status: 500 }
    );
  }
}
