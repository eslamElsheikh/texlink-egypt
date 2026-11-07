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

    const [costs, orders] = await Promise.all([
      prisma.productionCost.findMany({
        where: { factoryId },
        include: {
          productionOrder: {
            select: {
              id: true,
              orderNumber: true,
              productNameSnapshot: true,
              targetQuantity: true,
              status: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.productionOrder.findMany({
        where: { factoryId },
        select: { id: true, orderNumber: true, productNameSnapshot: true },
        orderBy: { orderNumber: "asc" },
      }),
    ]);

    const totalCalculatedCost = costs.reduce((s, c) => s + Number(c.totalCost || 0), 0);
    const averageCostPerUnit =
      costs.length > 0
        ? Math.round((costs.reduce((s, c) => s + Number(c.costPerGoodUnit || 0), 0) / costs.length) * 100) / 100
        : 0;

    return NextResponse.json({
      costs,
      options: { orders },
      stats: {
        totalCostedOrders: costs.length,
        totalCalculatedCost,
        averageCostPerUnit,
      },
    });
  } catch (error) {
    console.error("GET /api/factory/costs error:", error);
    return NextResponse.json({ error: "فشل تحميل تكاليف الإنتاج" }, { status: 500 });
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
      materialCost,
      directLaborCost,
      machineCost,
      maintenanceCost,
      overheadCost,
    } = body;

    if (!productionOrderId) {
      return NextResponse.json({ error: "أمر الإنتاج مطلوب" }, { status: 400 });
    }

    const order = await prisma.productionOrder.findFirst({
      where: { id: productionOrderId, factoryId },
      include: {
        productionEntries: { select: { goodQuantity: true } },
        materialConsumptions: { select: { totalCost: true } },
      },
    });
    if (!order) {
      return NextResponse.json({ error: "أمر الإنتاج غير موجود" }, { status: 404 });
    }

    // Auto-compute from linked records if values not explicitly overridden
    const computedMaterial =
      materialCost !== undefined
        ? parseFloat(String(materialCost))
        : order.materialConsumptions.reduce((s, c) => s + Number(c.totalCost || 0), 0);

    const computedLabor =
      directLaborCost !== undefined ? parseFloat(String(directLaborCost)) : 0;
    const computedMachine =
      machineCost !== undefined ? parseFloat(String(machineCost)) : 0;
    const computedMaint =
      maintenanceCost !== undefined ? parseFloat(String(maintenanceCost)) : 0;
    const computedOverhead =
      overheadCost !== undefined ? parseFloat(String(overheadCost)) : 0;

    const totalCost =
      computedMaterial + computedLabor + computedMachine + computedMaint + computedOverhead;

    const totalGood = order.productionEntries.reduce((s, e) => s + e.goodQuantity, 0);
    const costPerGoodUnit = totalGood > 0 ? Math.round((totalCost / totalGood) * 100) / 100 : 0;

    const costRecord = await prisma.productionCost.upsert({
      where: { productionOrderId },
      create: {
        factoryId,
        productionOrderId,
        materialCost: computedMaterial,
        directLaborCost: computedLabor,
        machineCost: computedMachine,
        maintenanceCost: computedMaint,
        overheadCost: computedOverhead,
        totalCost,
        goodUnitsCount: totalGood,
        costPerGoodUnit,
      },
      update: {
        materialCost: computedMaterial,
        directLaborCost: computedLabor,
        machineCost: computedMachine,
        maintenanceCost: computedMaint,
        overheadCost: computedOverhead,
        totalCost,
        goodUnitsCount: totalGood,
        costPerGoodUnit,
      },
    });

    return NextResponse.json({ success: true, cost: costRecord });
  } catch (error) {
    console.error("POST /api/factory/costs error:", error);
    return NextResponse.json({ error: "فشل احتساب تكلفة أمر الإنتاج" }, { status: 500 });
  }
}
