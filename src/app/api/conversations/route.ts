import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { buyerId: session.id },
          { factory: { userId: session.id } },
          ...(session.factoryId ? [{ factoryId: session.factoryId }] : []),
        ],
      },
      include: {
        buyer: { select: { id: true, name: true, buyerProfile: { select: { companyName: true } } } },
        factory: { select: { id: true, nameAr: true, logoUrl: true, phone: true } },
        order: { select: { id: true, orderNumber: true, status: true } },
        rfq: { select: { id: true, titleAr: true, status: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      conversations: conversations.map((c) => ({
        id: c.id,
        orderNumber: c.order?.orderNumber,
        rfqTitle: c.rfq?.titleAr,
        partnerName:
          session.id === c.buyerId
            ? c.factory.nameAr
            : c.buyer.buyerProfile?.companyName || c.buyer.name,
        lastMessage: c.messages[0]?.content || "محادثة جديدة",
        lastMessageAt: c.lastMessageAt,
        hasActiveOrder: Boolean(c.orderId),
      })),
    });
  } catch (error) {
    console.error("Fetch conversations error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحميل المحادثات" },
      { status: 500 }
    );
  }
}
