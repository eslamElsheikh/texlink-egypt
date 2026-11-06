import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { resolveFactoryContext } from "@/lib/auth/factory-context";

export async function GET(request: Request) {
  try {
    const ctx = await resolveFactoryContext(request);
    if ("error" in ctx) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status });
    }
    const { factoryId, settings } = ctx;

    const [records, orders, machines] = await Promise.all([
      prisma.wasteRecord.findMany({
        where: { factoryId },
        include: {
          productionOrder: {
            select: { id: true, orderNumber: true, productNameSnapshot: true },
          },
          machine: {
            select: { id: true, code: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.productionOrder.findMany({
        where: { factoryId },
        select: { id: true, orderNumber: true, productNameSnapshot: true },
      }),
      prisma.machine.findMany({
        where: { factoryId },
        select: { id: true, code: true, name: true },
      }),
    ]);

    const totalDefective = records.reduce((s, r) => s + r.quantity, 0);
    const totalRework = records.reduce((s, r) => s + r.reworkQuantity, 0);
    const totalReworkAccepted = records.reduce((s, r) => s + r.reworkAccepted, 0);
    const totalScrapped = records.reduce((s, r) => s + r.scrappedQuantity, 0);
    const totalEstimatedLoss = records.reduce((s, r) => s + r.estimatedCost, 0);

    // Grouping by defect type for breakdown analytics
    const byDefectType: Record<string, number> = {};
    for (const r of records) {
      byDefectType[r.defectType] = (byDefectType[r.defectType] || 0) + r.quantity;
    }

    return NextResponse.json({
      records,
      options: { orders, machines },
      stats: {
        totalDefective,
        totalRework,
        totalReworkAccepted,
        totalScrapped,
        totalEstimatedLoss,
        thresholdPct: settings?.wasteThresholdPct || 5.0,
        byDefectType,
      },
    });
  } catch (error) {
    console.error("GET /api/factory/waste error:", error);
    return NextResponse.json({ error: "فشل تحميل سجلات الهالك والفاقد" }, { status: 500 });
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
      machineId,
      stage,
      defectType,
      quantity,
      reworkQuantity,
      reworkAccepted,
      scrappedQuantity,
      estimatedCost,
      notes,
    } = body;

    const qty = parseInt(String(quantity), 10);
    if (isNaN(qty) || qty <= 0 || !stage || !defectType) {
      return NextResponse.json({ error: "الكمية التالفة والمرحلة ونوع العيب حقول مطلوبة" }, { status: 400 });
    }

    // Tenant isolation: verify order belongs to this factory
    if (productionOrderId) {
      const order = await prisma.productionOrder.findFirst({
        where: { id: productionOrderId, factoryId },
      });
      if (!order) {
        return NextResponse.json({ error: "أمر الإنتاج غير موجود أو غير تابع لمصنعك" }, { status: 404 });
      }
    }

    // Tenant isolation: verify machine belongs to this factory
    if (machineId) {
      const machine = await prisma.machine.findFirst({
        where: { id: machineId, factoryId },
      });
      if (!machine) {
        return NextResponse.json({ error: "الماكينة غير موجودة أو غير تابعة لمصنعك" }, { status: 404 });
      }
    }
    const rework = parseInt(String(reworkQuantity || 0), 10);
    const accepted = parseInt(String(reworkAccepted || 0), 10);
    const scrap = parseInt(String(scrappedQuantity || qty - accepted), 10);
    const cost = parseFloat(String(estimatedCost || qty * 30));

    const record = await prisma.wasteRecord.create({
      data: {
        factoryId,
        productionOrderId: productionOrderId || null,
        machineId: machineId || null,
        stage,
        defectType,
        quantity: qty,
        reworkQuantity: rework,
        reworkAccepted: accepted,
        scrappedQuantity: Math.max(0, scrap),
        estimatedCost: cost,
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error("POST /api/factory/waste error:", error);
    return NextResponse.json({ error: "فشل حفظ سجل الهالك" }, { status: 500 });
  }
}
