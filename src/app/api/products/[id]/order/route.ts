import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { NotificationService } from "@/lib/notifications";
import { z } from "zod";

const createProductOrderSchema = z.object({
  quantity: z.number().int().min(10, "الحد الأدنى للطلب 10 قطع"),
  selectedColors: z.string().optional(),
  selectedSizes: z.string().optional(),
  deliveryAddress: z.string().min(5, "العنوان ومكان الاستلام مطلوب"),
  notes: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const session = await getCurrentUser();

    let buyerId: string;
    if (session) {
      buyerId = session.id;
    } else {
      const defaultBuyer = await prisma.user.findFirst({
        where: { role: "BUYER" },
      });
      if (defaultBuyer) buyerId = defaultBuyer.id;
      else {
        return NextResponse.json(
          { error: "يرجى تسجيل الدخول لتقديم طلب الشراء" },
          { status: 401 }
        );
      }
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        factory: { include: { user: true } },
        priceTiers: { orderBy: { minQuantity: "desc" } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = createProductOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "بيانات غير صالحة" },
        { status: 400 }
      );
    }

    const { quantity, selectedColors, selectedSizes, deliveryAddress, notes } =
      parsed.data;

    if (quantity < product.moq) {
      return NextResponse.json(
        { error: `الحد الأدنى لطلب هذا المنتج هو ${product.moq} قطعة` },
        { status: 400 }
      );
    }

    // Determine tiered price per piece
    let unitPrice = product.basePrice;
    for (const tier of product.priceTiers) {
      if (
        quantity >= tier.minQuantity &&
        (tier.maxQuantity === null || quantity <= tier.maxQuantity)
      ) {
        unitPrice = tier.pricePerPiece;
        break;
      }
    }

    const totalAmount = unitPrice * quantity;
    const orderNumber = `STOCK-${Date.now().toString().slice(-5)}`;
    const agreedDeliveryDate = new Date(
      Date.now() + product.leadTimeDays * 24 * 60 * 60 * 1000
    );

    const paymentTerms = `توريد كاش/تحويل عند الاستلام - السعر يشمل شريحة الكمية (${unitPrice} ج.م للقطعة)`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        productId,
        buyerId,
        factoryId: product.factoryId,
        totalAmount,
        quantity,
        unitPrice,
        paymentTerms,
        status: "CONFIRMED",
        agreedDeliveryDate,
      },
    });

    // Create default milestones for stock orders
    const milestones = [
      {
        step: "READY",
        titleAr: "تجهيز وفرز البضاعة من المخزن",
        status: "IN_PROGRESS",
        notes: `الألوان: ${selectedColors || "حسب المتاح"} • المقاسات: ${selectedSizes || "مشكل"}`,
      },
      {
        step: "SHIPPED",
        titleAr: "الشحن وتسليم النقل",
        status: "PENDING",
        notes: `عنوان الاستلام: ${deliveryAddress}`,
      },
      {
        step: "DELIVERED",
        titleAr: "الاستلام النهائي والفحص",
        status: "PENDING",
        notes: "فحص البضاعة وتأكيد الاستلام",
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

    // Create conversation for direct messaging
    const conv = await prisma.conversation.create({
      data: {
        orderId: order.id,
        buyerId,
        factoryId: product.factoryId,
        lastMessageAt: new Date(),
      },
    });

    await prisma.message.create({
      data: {
        conversationId: conv.id,
        senderId: buyerId,
        content: `طلب شراء جديد لمنتج "${product.nameAr}" بكمية ${quantity} قطعة بإجمالي ${totalAmount.toLocaleString()} ج.م. العنوان: ${deliveryAddress}. ${notes ? `ملاحظات: ${notes}` : ""}`,
      },
    });

    // Notify Factory
    await NotificationService.notify({
      userId: product.factory.userId,
      recipientEmail: product.factory.user.email,
      recipientPhone: product.factory.user.phone,
      type: "ORDER_STATUS",
      titleAr: `📦 طلب شراء جاهز جديد #${order.orderNumber}!`,
      bodyAr: `تلقيت طلب شراء لمنتجك "${product.nameAr}" بكمية ${quantity} قطعة بقيمة ${totalAmount.toLocaleString()} ج.م. يرجى مراجعة وتجهيز الطلب للشحن.`,
      link: `/orders/${order.id}`,
      data: {
        orderNumber: order.orderNumber,
        stepTitle: "تجهيز وفرز البضاعة من المخزن",
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
      },
    });
  } catch (error) {
    console.error("Create product order error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إرسال طلب الشراء" },
      { status: 500 }
    );
  }
}
