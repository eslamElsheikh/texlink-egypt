import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { resolveFactoryContext } from "@/lib/auth/factory-context";

export async function GET(request: Request) {
  try {
    const ctx = await resolveFactoryContext(request);
    if ("error" in ctx) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status });
    }
    const { factoryId } = ctx;

    const [orders, products] = await Promise.all([
      prisma.productionOrder.findMany({
        where: { factoryId },
        include: {
          product: {
            select: { id: true, code: true, name: true, fabricType: true, gsm: true },
          },
          productionEntries: {
            select: { producedQuantity: true, goodQuantity: true, defectiveQuantity: true },
          },
          wasteRecords: {
            select: { quantity: true, scrappedQuantity: true },
          },
          productionCost: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.factoryProduct.findMany({
        where: { factoryId },
        select: { id: true, code: true, name: true, category: true, standardPrice: true },
        orderBy: { name: "asc" },
      }),
    ]);

    const formattedOrders = orders.map((ord) => {
      const totalProduced = ord.productionEntries.reduce((s, e) => s + e.producedQuantity, 0);
      const totalGood = ord.productionEntries.reduce((s, e) => s + e.goodQuantity, 0);
      const totalDefect = ord.productionEntries.reduce((s, e) => s + e.defectiveQuantity, 0);
      const target = ord.targetQuantity || 1;
      const progress = Math.min(100, Math.round((totalGood / target) * 100));

      return {
        id: ord.id,
        orderNumber: ord.orderNumber,
        batchNumber: ord.batchNumber,
        productName: ord.productNameSnapshot,
        product: ord.product,
        targetQuantity: ord.targetQuantity,
        totalProduced,
        totalGood,
        totalDefect,
        progressPercentage: progress,
        priority: ord.priority,
        status: ord.status,
        plannedStartDate: ord.plannedStartDate,
        plannedEndDate: ord.plannedEndDate,
        actualStartDate: ord.actualStartDate,
        actualEndDate: ord.actualEndDate,
        cost: ord.productionCost,
        notes: ord.notes,
      };
    });

    return NextResponse.json({ orders: formattedOrders, products });
  } catch (error) {
    console.error("GET /api/factory/production-orders error:", error);
    return NextResponse.json({ error: "فشل تحميل أوامر الإنتاج" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await resolveFactoryContext(request);
    if ("error" in ctx) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status });
    }
    const { factoryId } = ctx;

    const body = await request.json();
    const {
      orderNumber,
      batchNumber,
      productId,
      productName,
      targetQuantity,
      plannedStartDate,
      plannedEndDate,
      priority,
      notes,
    } = body;

    if (!orderNumber || !targetQuantity || (!productId && !productName)) {
      return NextResponse.json(
        { error: "رقم أمر الإنتاج والكمية واسم المنتج مطلوبة" },
        { status: 400 }
      );
    }

    const qty = parseInt(String(targetQuantity), 10);
    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json({ error: "الكمية المستهدفة يجب أن تكون رقماً موجباً" }, { status: 400 });
    }

    // Check unique order number per factory
    const existing = await prisma.productionOrder.findFirst({
      where: { factoryId, orderNumber },
    });
    if (existing) {
      return NextResponse.json({ error: `رقم الأمر ${orderNumber} موجود بالفعل في هذا المصنع` }, { status: 400 });
    }

    let finalProductName = productName;
    if (productId) {
      const prod = await prisma.factoryProduct.findFirst({
        where: { id: productId, factoryId },
      });
      if (!prod) {
        return NextResponse.json({ error: "المنتج المحدد غير موجود أو غير تابع لمصنعك" }, { status: 404 });
      }
      finalProductName = prod.name;
    }

    const order = await prisma.productionOrder.create({
      data: {
        factoryId,
        orderNumber,
        batchNumber: batchNumber || `BATCH-${new Date().getFullYear()}-${orderNumber.replace(/\D/g, "") || "01"}`,
        productId: productId || null,
        productNameSnapshot: finalProductName || "منتج تريكو عام",
        targetQuantity: qty,
        plannedStartDate: plannedStartDate ? new Date(plannedStartDate) : new Date(),
        plannedEndDate: plannedEndDate
          ? new Date(plannedEndDate)
          : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        priority: priority || "MEDIUM",
        status: "PLANNED",
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("POST /api/factory/production-orders error:", error);
    return NextResponse.json({ error: "فشل إنشاء أمر الإنتاج" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const ctx = await resolveFactoryContext(request);
    if ("error" in ctx) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status });
    }
    const { factoryId } = ctx;

    const body = await request.json();
    const { id, status, notes } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "معرف أمر الإنتاج والحالة مطلوبان" }, { status: 400 });
    }

    const order = await prisma.productionOrder.findFirst({
      where: { id, factoryId },
    });
    if (!order) {
      return NextResponse.json({ error: "أمر الإنتاج غير موجود" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = { status };
    if (notes !== undefined) updateData.notes = notes;
    if (status === "COMPLETED" && !order.actualEndDate) {
      updateData.actualEndDate = new Date();
    }
    if (status === "IN_PROGRESS" && !order.actualStartDate) {
      updateData.actualStartDate = new Date();
    }

    const updated = await prisma.productionOrder.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("PATCH /api/factory/production-orders error:", error);
    return NextResponse.json({ error: "فشل تحديث أمر الإنتاج" }, { status: 500 });
  }
}
