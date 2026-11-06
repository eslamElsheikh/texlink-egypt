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

    const url = new URL(request.url);
    const orderId = url.searchParams.get("orderId");
    const machineId = url.searchParams.get("machineId");
    const stage = url.searchParams.get("stage");

    const whereClause: Record<string, unknown> = { factoryId };
    if (orderId) whereClause.productionOrderId = orderId;
    if (machineId) whereClause.machineId = machineId;
    if (stage) whereClause.stage = stage;

    const [entries, orders, machines, employees, shifts] = await Promise.all([
      prisma.productionEntry.findMany({
        where: whereClause,
        include: {
          productionOrder: {
            select: { id: true, orderNumber: true, productNameSnapshot: true },
          },
          machine: {
            select: { id: true, code: true, name: true },
          },
          employee: {
            select: { id: true, code: true, name: true },
          },
          shift: {
            select: { id: true, name: true },
          },
          wasteRecords: true,
        },
        orderBy: { productionDate: "desc" },
        take: 100,
      }),
      prisma.productionOrder.findMany({
        where: { factoryId, status: { in: ["PLANNED", "IN_PROGRESS", "PAUSED"] } },
        select: { id: true, orderNumber: true, productNameSnapshot: true },
        orderBy: { orderNumber: "asc" },
      }),
      prisma.machine.findMany({
        where: { factoryId },
        select: { id: true, code: true, name: true, status: true },
        orderBy: { code: "asc" },
      }),
      prisma.employee.findMany({
        where: { factoryId, isActive: true },
        select: { id: true, code: true, name: true, jobTitle: true },
        orderBy: { code: "asc" },
      }),
      prisma.shift.findMany({
        where: { factoryId, isActive: true },
        select: { id: true, name: true, startTime: true, endTime: true },
      }),
    ]);

    return NextResponse.json({
      entries,
      options: { orders, machines, employees, shifts },
    });
  } catch (error) {
    console.error("GET /api/factory/production error:", error);
    return NextResponse.json({ error: "فشل تحميل سجلات الإنتاج اليومي" }, { status: 500 });
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
      employeeId,
      shiftId,
      stage,
      producedQuantity,
      goodQuantity,
      defectiveQuantity,
      defectType,
      notes,
    } = body;

    if (!productionOrderId || !stage) {
      return NextResponse.json({ error: "أمر الإنتاج والمرحلة التشغيلية مطلوبان" }, { status: 400 });
    }

    const total = parseInt(String(producedQuantity), 10);
    const good = parseInt(String(goodQuantity), 10);
    const defect = parseInt(String(defectiveQuantity || 0), 10);

    if (isNaN(total) || isNaN(good) || isNaN(defect) || total < 0 || good < 0 || defect < 0) {
      return NextResponse.json(
        { error: "الكميات يجب أن تكون أرقاماً صحيحة غير سالبة" },
        { status: 400 }
      );
    }

    // Strict Accounting Invariant
    if (total !== good + defect) {
      return NextResponse.json(
        {
          error: `خطأ في توازن الإنتاج: إجمالي الإنتاج (${total}) يجب أن يساوي السليم (${good}) + التالف (${defect}) بالضبط`,
        },
        { status: 400 }
      );
    }

    // Verify production order belongs to this factory
    const order = await prisma.productionOrder.findFirst({
      where: { id: productionOrderId, factoryId },
    });
    if (!order) {
      return NextResponse.json({ error: "أمر الإنتاج غير موجود أو غير تابع لمصنعك" }, { status: 404 });
    }

    // Tenant isolation: verify machine belongs to this factory
    if (machineId) {
      const machine = await prisma.machine.findFirst({
        where: { id: machineId, factoryId },
      });
      if (!machine) {
        return NextResponse.json({ error: "الماكينة المحددة غير موجودة أو غير تابعة لمصنعك" }, { status: 404 });
      }
    }

    // Tenant isolation: verify employee belongs to this factory
    if (employeeId) {
      const employee = await prisma.employee.findFirst({
        where: { id: employeeId, factoryId },
      });
      if (!employee) {
        return NextResponse.json({ error: "العامل المحدد غير موجود أو غير تابع لمصنعك" }, { status: 404 });
      }
    }

    // Tenant isolation: verify shift belongs to this factory
    if (shiftId) {
      const shift = await prisma.shift.findFirst({
        where: { id: shiftId, factoryId },
      });
      if (!shift) {
        return NextResponse.json({ error: "الوردية المحددة غير موجودة أو غير تابعة لمصنعك" }, { status: 404 });
      }
    }
    // Execute in transaction
    const result = await prisma.$transaction(async (tx) => {
      const entry = await tx.productionEntry.create({
        data: {
          factoryId,
          productionOrderId,
          machineId: machineId || null,
          employeeId: employeeId || null,
          shiftId: shiftId || null,
          stage,
          producedQuantity: total,
          goodQuantity: good,
          defectiveQuantity: defect,
          notes: notes || null,
        },
      });

      // Auto-create waste record if defect > 0
      let waste = null;
      if (defect > 0) {
        waste = await tx.wasteRecord.create({
          data: {
            factoryId,
            productionOrderId,
            productionEntryId: entry.id,
            machineId: machineId || null,
            stage,
            defectType: defectType || "KNITTING_DEFECT",
            quantity: defect,
            reworkQuantity: 0,
            reworkAccepted: 0,
            scrappedQuantity: defect,
            estimatedCost: defect * 25, // default estimated unit cost
            notes: notes ? `ناتج عن تسجيل إنتاج: ${notes}` : null,
          },
        });
      }

      // If order is currently PLANNED, advance status to IN_PROGRESS automatically
      if (order.status === "PLANNED") {
        await tx.productionOrder.update({
          where: { id: order.id },
          data: { status: "IN_PROGRESS", actualStartDate: new Date() },
        });
      }

      return { entry, waste };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("POST /api/factory/production error:", error);
    return NextResponse.json({ error: "فشل حفظ تسجيل الإنتاج اليومي" }, { status: 500 });
  }
}
