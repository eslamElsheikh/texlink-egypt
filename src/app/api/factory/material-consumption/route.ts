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

    const [consumptions, orders, inventoryItems] = await Promise.all([
      prisma.materialConsumption.findMany({
        where: { factoryId },
        include: {
          productionOrder: {
            select: { id: true, orderNumber: true, productNameSnapshot: true },
          },
          inventoryItem: {
            select: { id: true, name: true, sku: true, unit: true, currentStock: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.productionOrder.findMany({
        where: { factoryId, status: { in: ["PLANNED", "IN_PROGRESS", "PAUSED"] } },
        select: { id: true, orderNumber: true, productNameSnapshot: true },
      }),
      prisma.inventoryItem.findMany({
        where: { factoryId },
        select: { id: true, name: true, sku: true, unit: true, currentStock: true, unitCost: true },
      }),
    ]);

    const totalConsumedCost = consumptions.reduce((s, c) => s + (c.totalCost || 0), 0);

    return NextResponse.json({
      consumptions,
      options: { orders, inventoryItems },
      stats: {
        totalRecords: consumptions.length,
        totalConsumedCost,
      },
    });
  } catch (error) {
    console.error("GET /api/factory/material-consumption error:", error);
    return NextResponse.json({ error: "فشل تحميل استهلاك الخامات" }, { status: 500 });
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
      productionOrderId,
      inventoryItemId,
      plannedQuantity,
      issuedQuantity,
    } = body;

    const planned = parseFloat(String(plannedQuantity));
    const issued = parseFloat(String(issuedQuantity || planned));

    if (!productionOrderId || !inventoryItemId || isNaN(planned) || planned <= 0) {
      return NextResponse.json({ error: "أمر الإنتاج والصنف والكمية المخططة مطلوبة" }, { status: 400 });
    }

    const item = await prisma.inventoryItem.findFirst({
      where: { id: inventoryItemId, factoryId },
    });
    if (!item) {
      return NextResponse.json({ error: "خامة المخزن غير موجودة" }, { status: 404 });
    }

    if (item.currentStock < issued) {
      return NextResponse.json(
        {
          error: `الرصيد المتاح من (${item.name}) هو ${item.currentStock} ${item.unit} فقط، لا يكفي لصرف ${issued}`,
        },
        { status: 400 }
      );
    }

    const order = await prisma.productionOrder.findFirst({
      where: { id: productionOrderId, factoryId },
    });
    if (!order) {
      return NextResponse.json({ error: "أمر الإنتاج غير موجود" }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const prevStock = item.currentStock;
      const newStock = prevStock - issued;

      // 1. Deduct stock from warehouse
      await tx.inventoryItem.update({
        where: { id: inventoryItemId },
        data: {
          currentStock: newStock,
          totalValuation: newStock * item.unitCost,
        },
      });

      // 2. Add immutable stock movement
      await tx.stockMovement.create({
        data: {
          factoryId,
          inventoryItemId,
          movementType: "PRODUCTION_ISSUE",
          quantity: issued,
          previousStock: prevStock,
          newStock,
          unitCost: item.unitCost,
          fromWarehouseId: item.warehouseId,
          referenceOrderNumber: order.orderNumber,
          notes: `صرف خامات تشغيل لأمر إنتاج: ${order.orderNumber}`,
        },
      });

      // 3. Create or update MaterialConsumption
      const consumption = await tx.materialConsumption.create({
        data: {
          factoryId,
          productionOrderId,
          inventoryItemId,
          plannedQuantity: planned,
          issuedQuantity: issued,
          actualConsumed: issued,
          unitCost: item.unitCost,
          totalCost: issued * item.unitCost,
        },
      });

      return consumption;
    });

    return NextResponse.json({ success: true, consumption: result });
  } catch (error) {
    console.error("POST /api/factory/material-consumption error:", error);
    return NextResponse.json({ error: "فشل صرف واستهلاك الخامات" }, { status: 500 });
  }
}
