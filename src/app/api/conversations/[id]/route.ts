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

    if (!session) {
      return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        buyer: { select: { id: true, name: true, buyerProfile: { select: { companyName: true } } } },
        factory: { select: { id: true, nameAr: true, userId: true, phone: true, whatsapp: true } },
        order: { select: { id: true, orderNumber: true, status: true } },
        rfq: { select: { id: true, titleAr: true, status: true } },
        messages: {
          include: {
            sender: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "المحادثة غير موجودة" }, { status: 404 });
    }

    const isContactAllowed =
      Boolean(conversation.orderId) ||
      session.role === "ADMIN" ||
      conversation.rfq?.status === "QUOTE_ACCEPTED";

    const partnerName =
      session.id === conversation.buyerId
        ? conversation.factory.nameAr
        : conversation.buyer.buyerProfile?.companyName || conversation.buyer.name;

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.id,
        partnerName,
        isContactAllowed,
        orderId: conversation.orderId,
        orderNumber: conversation.order?.orderNumber,
        rfqTitle: conversation.rfq?.titleAr,
        messages: conversation.messages.map((m) => ({
          id: m.id,
          senderId: m.senderId,
          senderName: m.sender.name,
          isMe: m.senderId === session.id,
          content: m.content,
          containsContactInfo: m.containsContactInfo,
          isMasked: m.isMasked,
          createdAt: m.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Fetch conversation detail error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحميل المحادثة" },
      { status: 500 }
    );
  }
}
