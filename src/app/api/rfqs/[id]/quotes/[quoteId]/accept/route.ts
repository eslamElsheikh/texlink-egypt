import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; quoteId: string }> }
) {
  try {
    const { id: rfqId, quoteId } = await params;
    const session = await getCurrentUser();

    if (!session) {
      return NextResponse.json({ error: "يرجى تسجيل الدخول أولاً" }, { status: 401 });
    }

    const rfq = await prisma.rfq.findUnique({
      where: { id: rfqId },
      include: { buyer: true },
    });

    if (!rfq) {
      return NextResponse.json({ error: "طلب التصنيع غير موجود" }, { status: 404 });
    }

    if (session.id !== rfq.buyerId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بقبول العروض لهذا الطلب" }, { status: 403 });
    }

    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { factory: true },
    });

    if (!quote || quote.rfqId !== rfqId) {
      return NextResponse.json({ error: "عرض السعر غير موجود" }, { status: 404 });
    }

    // 1. Accept this quote and reject others
    await prisma.quote.update({
      where: { id: quoteId },
      data: { status: "ACCEPTED" },
    });

    await prisma.quote.updateMany({
      where: { rfqId, id: { not: quoteId } },
      data: { status: "REJECTED" },
    });

    // 2. Update RFQ status
    await prisma.rfq.update({
      where: { id: rfqId },
      data: {
        status: "QUOTE_ACCEPTED",
        acceptedQuoteId: quoteId,
      },
    });

    // 3. Create the Order
    const orderNumber = `ORD-2026-${Date.now().toString().slice(-5)}`;
    const agreedDeliveryDate = new Date(
      Date.now() + quote.leadTimeDays * 24 * 60 * 60 * 1000
    );

    const order = await prisma.order.create({
      data: {
        orderNumber,
        rfqId,
        quoteId,
        buyerId: rfq.buyerId,
        factoryId: quote.factoryId,
        totalAmount: quote.totalAmount,
        quantity: rfq.totalQuantity,
        unitPrice: quote.unitPrice,
        paymentTerms: quote.paymentTermsAr,
        status: "CONFIRMED",
        agreedDeliveryDate,
      },
    });

    // 4. Create initial milestone timeline
    const milestones = [
      {
        step: "SAMPLE",
        titleAr: "إعداد عينة ما قبل الإنتاج",
        status: quote.samplePrice && quote.samplePrice > 0 ? "IN_PROGRESS" : "PENDING",
        notes: quote.samplePrice && quote.samplePrice > 0 ? "جاري تحضير عينة المواصفات" : "بدون عينة حسب الاتفاق",
      },
      {
        step: "SAMPLE_APPROVAL",
        titleAr: "موافقة العميل على العينة",
        status: "PENDING",
        notes: "في انتظار فحص واعتماد العينة من المشتري",
      },
      {
        step: "PRODUCTION",
        titleAr: "بدء الإنتاج والتشغيل الفعلي",
        status: "PENDING",
        notes: "قص الأقمشة، الحياكة، والطباعة/التطريز",
      },
      {
        step: "READY",
        titleAr: "جاهزية الشحنة والفرز النهائي",
        status: "PENDING",
        notes: "فحص الجودة والكي والتعبئة",
      },
      {
        step: "SHIPPED",
        titleAr: "الشحن وتسليم مندوب النقل",
        status: "PENDING",
        notes: "تسليم الطلبية لشركة الشحن أو وسيلة النقل المعتمدة",
      },
      {
        step: "DELIVERED",
        titleAr: "الاستلام النهائي والفحص",
        status: "PENDING",
        notes: "تأكيد وصول واستلام الشحنة وإتمام المعاملة",
      },
    ];

    for (const ms of milestones) {
      await prisma.orderMilestone.create({
        data: {
          orderId: order.id,
          step: ms.step,
          titleAr: ms.titleAr,
          status: ms.status,
          notes: ms.notes,
        },
      });
    }

    // 5. Create or link Conversation
    const conversation = await prisma.conversation.create({
      data: {
        rfqId,
        quoteId,
        orderId: order.id,
        buyerId: rfq.buyerId,
        factoryId: quote.factoryId,
        lastMessageAt: new Date(),
      },
    });

    // System welcome message revealing contact information
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: session.id,
        content: `🎉 تم اعتماد عرض السعر بنجاح برقم أمر تصنيع #${order.orderNumber}. تم فتح بيانات التواصل المباشر بين الطرفين للتنسيق ومتابعة مراحل الإنتاج والتسليم.`,
        containsContactInfo: false,
        isMasked: false,
      },
    });

    // 6. Notify factory owner
    await prisma.notification.create({
      data: {
        userId: quote.factory.userId,
        titleAr: "🎉 تم قبول عرض سعرك! تم إنشاء طلب رسمي",
        bodyAr: `وافق المشتري على عرض سعرك لطلب "${rfq.titleAr}". تم إنشاء أمر التصنيع رقم #${order.orderNumber} بقيمة إجمالية ${order.totalAmount.toLocaleString()} ج.م. يمكنك الآن التواصل المباشر والبدء في تجهيز العينة/الإنتاج.`,
        type: "QUOTE_ACCEPTED",
        link: `/orders/${order.id}`,
      },
    });

    // 7. Auto-link to Factory CRM Workspace
    try {
      let crmCustomer = await prisma.crmCustomer.findFirst({
        where: {
          factoryId: quote.factoryId,
          OR: [
            { buyerId: rfq.buyerId },
            { phone: rfq.buyer.phone },
          ],
        },
      });

      if (!crmCustomer) {
        crmCustomer = await prisma.crmCustomer.create({
          data: {
            factoryId: quote.factoryId,
            buyerId: rfq.buyerId,
            name: rfq.buyer.name,
            phone: rfq.buyer.phone,
            email: rfq.buyer.email,
            source: "MARKETPLACE",
            status: "ACTIVE",
            totalSpend: order.totalAmount,
            ordersCount: 1,
            notes: `عميل سوق B2B من طلب RFQ: ${rfq.titleAr}`,
          },
        });
      } else {
        await prisma.crmCustomer.update({
          where: { id: crmCustomer.id },
          data: {
            buyerId: rfq.buyerId,
            totalSpend: { increment: order.totalAmount },
            ordersCount: { increment: 1 },
            lastContactDate: new Date(),
          },
        });
      }

      // Create won deal in CRM pipeline
      const crmDeal = await prisma.crmDeal.create({
        data: {
          factoryId: quote.factoryId,
          customerId: crmCustomer.id,
          rfqId: rfq.id,
          orderId: order.id,
          title: `صفقة سوق B2B: ${rfq.titleAr}`,
          stage: "WON",
          amount: order.totalAmount,
          notes: `تم اعتماد عرض السعر بنجاح برقم أمر تصنيع #${order.orderNumber}`,
        },
      });

      // Log CRM Activity
      await prisma.crmActivity.create({
        data: {
          factoryId: quote.factoryId,
          customerId: crmCustomer.id,
          dealId: crmDeal.id,
          type: "MARKETPLACE_ORDER",
          description: `اعتماد طلب شراء رسمي #${order.orderNumber} بقيمة ${order.totalAmount.toLocaleString()} ج.م من سوق تكس لينك`,
          performedBy: rfq.buyer.name,
        },
      });
    } catch (crmErr) {
      console.error("Auto CRM link error (non-blocking):", crmErr);
    }
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
      },
    });
  } catch (error) {
    console.error("Accept quote error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء قبول عرض السعر" },
      { status: 500 }
    );
  }
}
