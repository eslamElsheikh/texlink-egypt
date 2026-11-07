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

    const [inspections, orders] = await Promise.all([
      prisma.qualityInspection.findMany({
        where: { factoryId },
        include: {
          productionOrder: {
            select: { id: true, orderNumber: true, productNameSnapshot: true },
          },
        },
        orderBy: { inspectionDate: "desc" },
      }),
      prisma.productionOrder.findMany({
        where: { factoryId },
        select: { id: true, orderNumber: true, productNameSnapshot: true },
        orderBy: { orderNumber: "asc" },
      }),
    ]);

    const totalInspected = inspections.reduce((s, i) => s + i.inspectedQuantity, 0);
    const totalAccepted = inspections.reduce((s, i) => s + i.acceptedQuantity, 0);
    const totalRejected = inspections.reduce((s, i) => s + i.rejectedQuantity, 0);
    const passRate = totalInspected > 0 ? Math.round((totalAccepted / totalInspected) * 1000) / 10 : 100;

    return NextResponse.json({
      inspections,
      orders,
      stats: {
        totalInspections: inspections.length,
        totalInspected,
        totalAccepted,
        totalRejected,
        passRate,
      },
    });
  } catch (error) {
    console.error("GET /api/factory/quality error:", error);
    return NextResponse.json({ error: "فشل تحميل سجلات فحص الجودة" }, { status: 500 });
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
      stage,
      inspectedQuantity,
      acceptedQuantity,
      rejectedQuantity,
      reworkQuantity,
      defectReasons,
      status,
      inspectorName,
    } = body;

    const inspected = parseInt(String(inspectedQuantity), 10);
    const accepted = parseInt(String(acceptedQuantity), 10);
    const rejected = parseInt(String(rejectedQuantity || 0), 10);

    if (!productionOrderId || !stage || isNaN(inspected) || isNaN(accepted) || inspected <= 0) {
      return NextResponse.json({ error: "أمر الإنتاج والمرحلة وكمية الفحص حقول مطلوبة" }, { status: 400 });
    }

    if (accepted < 0 || rejected < 0 || accepted + rejected > inspected) {
      return NextResponse.json(
        { error: "الكميات المقبولة والمرفوضة يجب أن تكون غير سالبة ولا تتجاوز إجمالي كمية الفحص" },
        { status: 400 }
      );
    }
    // Tenant isolation: verify order belongs to this factory
    const order = await prisma.productionOrder.findFirst({
      where: { id: productionOrderId, factoryId },
    });
    if (!order) {
      return NextResponse.json({ error: "أمر الإنتاج غير موجود أو غير تابع لمصنعك" }, { status: 404 });
    }
    const inspection = await prisma.qualityInspection.create({
      data: {
        factoryId,
        productionOrderId,
        stage,
        inspectedQuantity: inspected,
        acceptedQuantity: accepted,
        rejectedQuantity: rejected,
        reworkQuantity: parseInt(String(reworkQuantity || 0), 10),
        defectReasons: defectReasons || null,
        status: status || (rejected > 0 ? "PASSED_WITH_CONDITIONS" : "PASSED"),
        inspectorName: inspectorName || null,
      },
    });

    return NextResponse.json({ success: true, inspection });
  } catch (error) {
    console.error("POST /api/factory/quality error:", error);
    return NextResponse.json({ error: "فشل إنشاء فحص الجودة" }, { status: 500 });
  }
}
