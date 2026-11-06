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

    const [records, employees, shifts] = await Promise.all([
      prisma.attendanceRecord.findMany({
        where: { factoryId },
        include: {
          employee: { select: { id: true, code: true, name: true, jobTitle: true } },
          shift: { select: { id: true, name: true, startTime: true, endTime: true } },
        },
        orderBy: { date: "desc" },
        take: 100,
      }),
      prisma.employee.findMany({
        where: { factoryId, isActive: true },
        select: { id: true, code: true, name: true, jobTitle: true },
        orderBy: { code: "asc" },
      }),
      prisma.shift.findMany({
        where: { factoryId, isActive: true },
        select: { id: true, name: true },
      }),
    ]);

    const presentCount = records.filter((r) => r.status === "PRESENT").length;
    const absentCount = records.filter((r) => r.status === "ABSENT").length;
    const lateCount = records.filter((r) => r.status === "LATE").length;
    const totalOvertime = records.reduce((s, r) => s + (r.overtimeHours || 0), 0);

    return NextResponse.json({
      records,
      options: { employees, shifts },
      stats: {
        totalRecords: records.length,
        presentCount,
        absentCount,
        lateCount,
        totalOvertime,
      },
    });
  } catch (error) {
    console.error("GET /api/factory/attendance error:", error);
    return NextResponse.json({ error: "فشل تحميل سجلات الحضور والانصراف" }, { status: 500 });
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
    const { employeeId, shiftId, date, checkIn, checkOut, status, overtimeHours } = body;

    if (!employeeId) {
      return NextResponse.json({ error: "العامل مطلوب" }, { status: 400 });
    }

    // Tenant isolation: verify employee belongs to this factory
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, factoryId },
    });
    if (!employee) {
      return NextResponse.json({ error: "العامل المحدد غير موجود أو غير تابع لمصنعك" }, { status: 404 });
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
    const record = await prisma.attendanceRecord.create({
      data: {
        factoryId,
        employeeId,
        shiftId: shiftId || null,
        date: date ? new Date(date) : new Date(),
        checkIn: checkIn || "08:00",
        checkOut: checkOut || "16:00",
        status: status || "PRESENT",
        overtimeHours: overtimeHours ? parseFloat(String(overtimeHours)) : 0,
      },
    });

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error("POST /api/factory/attendance error:", error);
    return NextResponse.json({ error: "فشل تسجيل الحضور والانصراف" }, { status: 500 });
  }
}
