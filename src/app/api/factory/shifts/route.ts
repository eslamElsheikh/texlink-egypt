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

    const shifts = await prisma.shift.findMany({
      where: { factoryId },
      include: {
        _count: {
          select: {
            productionEntries: true,
            attendanceRecords: true,
          },
        },
      },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json({ shifts });
  } catch (error) {
    console.error("GET /api/factory/shifts error:", error);
    return NextResponse.json({ error: "فشل تحميل الورديات" }, { status: 500 });
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
    const { name, startTime, endTime, hours } = body;

    if (!name || !startTime || !endTime) {
      return NextResponse.json({ error: "اسم الوردية ووقت البدء والانتهاء حقول مطلوبة" }, { status: 400 });
    }

    const calculatedHours = hours ? parseFloat(String(hours)) : 8.0;

    const shift = await prisma.shift.create({
      data: {
        factoryId,
        name,
        startTime,
        endTime,
        hours: calculatedHours,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, shift });
  } catch (error) {
    console.error("POST /api/factory/shifts error:", error);
    return NextResponse.json({ error: "فشل إنشاء الوردية" }, { status: 500 });
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
    const { id, name, startTime, endTime, hours, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "معرف الوردية مطلوب" }, { status: 400 });
    }

    const existing = await prisma.shift.findFirst({
      where: { id, factoryId },
    });
    if (!existing) {
      return NextResponse.json({ error: "الوردية غير موجودة" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (startTime) updateData.startTime = startTime;
    if (endTime) updateData.endTime = endTime;
    if (hours !== undefined) updateData.hours = parseFloat(String(hours));
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const updated = await prisma.shift.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, shift: updated });
  } catch (error) {
    console.error("PATCH /api/factory/shifts error:", error);
    return NextResponse.json({ error: "فشل تحديث الوردية" }, { status: 500 });
  }
}
