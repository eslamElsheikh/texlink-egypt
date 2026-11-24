import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { sanitizeMessageContent } from "@/lib/anti-bypass/sanitizer";
import { NotificationService } from "@/lib/notifications";
import { z } from "zod";

const sendMessageSchema = z.object({
  content: z.string().min(1, "لا يمكن إرسال رسالة فارغة"),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const session = await getCurrentUser();

    if (!session) {
      return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        factory: { include: { user: true } },
        buyer: true,
        order: true,
        rfq: true,
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "المحادثة غير موجودة" }, { status: 404 });
    }

    // Verify participant
    const isBuyer = session.id === conversation.buyerId;
    const isFactory = Boolean(
      conversation.factory &&
        (session.id === conversation.factory.userId ||
          (session.factoryId && session.factoryId === conversation.factory.id))
    );
    const isAdmin = session.role === "ADMIN";

    if (!isBuyer && !isFactory && !isAdmin) {
      return NextResponse.json({ error: "غير مصرح لك بالإرسال في هذه المحادثة" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = sendMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "محتوى غير صالح" },
        { status: 400 }
      );
    }

    // Is contact allowed? (Only after order is confirmed / quote accepted, or admin)
    const isContactAllowed =
      Boolean(conversation.orderId) ||
      conversation.rfq?.status === "QUOTE_ACCEPTED" ||
      isAdmin;

    const sanitizeResult = sanitizeMessageContent(
      parsed.data.content,
      isContactAllowed
    );

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: session.id,
        content: sanitizeResult.cleanText,
        containsContactInfo: sanitizeResult.containsContactInfo,
        isMasked: sanitizeResult.containsContactInfo && !isContactAllowed,
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    // Notify the other party
    const recipientUser = isBuyer ? conversation.factory?.user : conversation.buyer;

    if (recipientUser) {
      await NotificationService.notify({
        userId: recipientUser.id,
        recipientEmail: recipientUser.email,
        recipientPhone: recipientUser.phone,
        type: "NEW_MESSAGE",
        titleAr: `رسالة جديدة من ${session.name}`,
        bodyAr: sanitizeResult.cleanText.slice(0, 100),
        link: `/messages?id=${conversationId}`,
        data: {
          orderNumber: conversation.order?.orderNumber || "",
          preview: sanitizeResult.cleanText.slice(0, 80),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        senderId: message.senderId,
        content: message.content,
        containsContactInfo: message.containsContactInfo,
        isMasked: message.isMasked,
        warning: sanitizeResult.warningMessage,
        createdAt: message.createdAt,
      },
    });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إرسال الرسالة" },
      { status: 500 }
    );
  }
}
