import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { resolveFactoryContext } from "@/lib/auth/factory-context";

export async function POST(request: Request) {
  try {
    const ctx = await resolveFactoryContext(request);
    if ("error" in ctx) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status });
    }
    const { factoryId } = ctx;

    const body = await request.json();
    const { orderId, priority } = body;

    if (!orderId) {
      return NextResponse.json({ error: "معرف طلب السوق التجاري مطلوب" }, { status: 400 });
    }

    // Verify order belongs to this factory
    const b2bOrder = await prisma.order.findFirst({
      where: { id: orderId, factoryId },
      include: {
        product: true,
        rfq: true,
        buyer: { select: { name: true } },
      },
    });

    if (!b2bOrder) {
      return NextResponse.json({ error: "طلب السوق التجاري غير موجود أو غير تابع لمصنعك" }, { status: 404 });
    }

    const targetOrderNumber = `ORD-${b2bOrder.orderNumber}`;

    // Idempotency check: Prevent duplicate production order generation
    const existing = await prisma.productionOrder.findFirst({
      where: {
        factoryId,
        orderNumber: { in: [targetOrderNumber, b2bOrder.orderNumber] },
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        alreadyConverted: true,
        productionOrder: existing,
        message: "أمر الإنتاج موجود بالفعل في خطوط التشغيل",
      });
    }

    const productName =
      b2bOrder.product?.nameAr || b2bOrder.rfq?.titleAr || "طلب سوق B2B";

    const batchNumber = `BATCH-B2B-${b2bOrder.orderNumber}`;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Factory OS ProductionOrder
      const prodOrder = await tx.productionOrder.create({
        data: {
          factoryId,
          orderNumber: targetOrderNumber,
          batchNumber,
          productId: b2bOrder.productId || null,
          productNameSnapshot: productName,
          targetQuantity: b2bOrder.quantity,
          plannedStartDate: new Date(),
          plannedEndDate:
            b2bOrder.agreedDeliveryDate ||
            new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          actualStartDate: new Date(),
          priority: priority || "HIGH",
          status: "IN_PROGRESS",
          notes: `تحويل تلقائي من صفقة سوق تكس لينك #${b2bOrder.orderNumber} لصالح المشتري ${b2bOrder.buyer.name}`,
        },
      });

      // 2. Update B2B Order status to IN_PRODUCTION
      await tx.order.update({
        where: { id: b2bOrder.id },
        data: { status: "IN_PRODUCTION" },
      });

      // 3. Update or create production milestone
      const prodMilestone = await tx.orderMilestone.findFirst({
        where: { orderId: b2bOrder.id, step: "PRODUCTION" },
      });

      if (prodMilestone) {
        await tx.orderMilestone.update({
          where: { id: prodMilestone.id },
          data: { status: "IN_PROGRESS", notes: `أمر التشغيل رقم ${targetOrderNumber}` },
        });
      } else {
        await tx.orderMilestone.create({
          data: {
            orderId: b2bOrder.id,
            step: "PRODUCTION",
            titleAr: "بدء مرحلة الإنتاج الصناعي الفعلي",
            status: "IN_PROGRESS",
            notes: `أمر تشغيل المصنع: ${targetOrderNumber}`,
          },
        });
      }

      return prodOrder;
    });

    return NextResponse.json({
      success: true,
      alreadyConverted: false,
      productionOrder: result,
      message: `تم تحويل الطلب بنجاح إلى أمر تشغيل صناعي (${result.orderNumber})`,
    });
  } catch (error) {
    console.error("POST /api/factory/orders/convert error:", error);
    return NextResponse.json({ error: "فشل تحويل طلب السوق إلى أمر إنتاج" }, { status: 500 });
  }
}
