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

    const machines = await prisma.machine.findMany({
      where: { factoryId },
      include: {
        maintenanceTickets: {
          select: { id: true, status: true, downtimeMinutes: true, totalCost: true, startTime: true },
        },
        productionEntries: {
          select: { producedQuantity: true, goodQuantity: true, defectiveQuantity: true },
        },
        expenses: {
          select: { amount: true },
        },
      },
      orderBy: { code: "asc" },
    });

    const formattedMachines = machines.map((m) => {
      const totalProduced = m.productionEntries.reduce((s, e) => s + e.producedQuantity, 0);
      const totalGood = m.productionEntries.reduce((s, e) => s + e.goodQuantity, 0);
      const totalDefect = m.productionEntries.reduce((s, e) => s + e.defectiveQuantity, 0);
      const wasteRate = totalProduced > 0 ? Math.round((totalDefect / totalProduced) * 1000) / 10 : 0;

      const totalDowntime = m.maintenanceTickets.reduce((s, t) => s + (t.downtimeMinutes || 0), 0);
      const totalMaintenanceCost = m.maintenanceTickets.reduce((s, t) => s + Number(t.totalCost || 0), 0);
      const activeTicket = m.maintenanceTickets.find((t) => t.status === "OPEN" || t.status === "IN_PROGRESS");

      return {
        id: m.id,
        code: m.code,
        name: m.name,
        type: m.type,
        brand: m.brand,
        model: m.model,
        serialNumber: m.serialNumber,
        status: m.status,
        hourlyOperatingCost: m.hourlyOperatingCost,
        maintenanceIntervalDays: m.maintenanceIntervalDays,
        lastMaintenanceDate: m.lastMaintenanceDate,
        totalDowntimeMinutes: totalDowntime,
        totalMaintenanceCost,
        totalProduced,
        totalGood,
        totalDefect,
        wasteRate,
        hasActiveBreakdown: Boolean(activeTicket),
        notes: m.notes,
      };
    });

    return NextResponse.json({ machines: formattedMachines });
  } catch (error) {
    console.error("GET /api/factory/machines error:", error);
    return NextResponse.json({ error: "فشل تحميل قائمة الماكينات" }, { status: 500 });
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
      code,
      name,
      type,
      brand,
      model,
      serialNumber,
      purchaseDate,
      purchaseCost,
      hourlyOperatingCost,
      maintenanceIntervalDays,
      notes,
    } = body;

    if (!code || !name || !type || !brand) {
      return NextResponse.json({ error: "كود الماكينة واسمها ونوعها والماركة حقول مطلوبة" }, { status: 400 });
    }

    const existing = await prisma.machine.findFirst({
      where: { factoryId, code },
    });
    if (existing) {
      return NextResponse.json({ error: `كود الماكينة (${code}) مستخدم بالفعل في مصنعك` }, { status: 400 });
    }

    const machine = await prisma.machine.create({
      data: {
        factoryId,
        code: code.trim().toUpperCase(),
        name,
        type,
        brand,
        model: model || null,
        serialNumber: serialNumber || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        purchaseCost: purchaseCost ? parseFloat(String(purchaseCost)) : null,
        hourlyOperatingCost: hourlyOperatingCost ? parseFloat(String(hourlyOperatingCost)) : 0,
        maintenanceIntervalDays: maintenanceIntervalDays ? parseInt(String(maintenanceIntervalDays), 10) : 30,
        status: "RUNNING",
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, machine });
  } catch (error) {
    console.error("POST /api/factory/machines error:", error);
    return NextResponse.json({ error: "فشل إضافة الماكينة الجديدة" }, { status: 500 });
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
    const { id, status, notes, hourlyOperatingCost } = body;

    if (!id) {
      return NextResponse.json({ error: "معرف الماكينة مطلوب" }, { status: 400 });
    }

    const machine = await prisma.machine.findFirst({
      where: { id, factoryId },
    });
    if (!machine) {
      return NextResponse.json({ error: "الماكينة غير موجودة" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (hourlyOperatingCost !== undefined) updateData.hourlyOperatingCost = parseFloat(String(hourlyOperatingCost));

    const updated = await prisma.machine.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, machine: updated });
  } catch (error) {
    console.error("PATCH /api/factory/machines error:", error);
    return NextResponse.json({ error: "فشل تحديث بيانات الماكينة" }, { status: 500 });
  }
}
