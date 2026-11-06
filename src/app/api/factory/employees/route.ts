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

    const [employees, shifts] = await Promise.all([
      prisma.employee.findMany({
        where: { factoryId },
        include: {
          attendanceRecords: {
            orderBy: { date: "desc" },
            take: 1,
          },
          _count: { select: { productionEntries: true } },
        },
        orderBy: { code: "asc" },
      }),
      prisma.shift.findMany({
        where: { factoryId },
        orderBy: { startTime: "asc" },
      }),
    ]);

    const totalSalaryPayroll = employees.reduce((s, e) => s + Number(e.monthlySalary || 0), 0);
    const activeCount = employees.filter((e) => e.isActive).length;

    return NextResponse.json({
      employees,
      shifts,
      stats: {
        totalEmployees: employees.length,
        activeEmployees: activeCount,
        totalSalaryPayroll,
      },
    });
  } catch (error) {
    console.error("GET /api/factory/employees error:", error);
    return NextResponse.json({ error: "فشل تحميل بيانات العمال والورديات" }, { status: 500 });
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
    const { code, name, jobTitle, phone, monthlySalary, paymentType, hiringDate } = body;

    if (!code || !name || !jobTitle) {
      return NextResponse.json({ error: "كود العامل، الاسم والمسمى الوظيفي حقول مطلوبة" }, { status: 400 });
    }

    const existing = await prisma.employee.findFirst({
      where: { factoryId, code },
    });
    if (existing) {
      return NextResponse.json({ error: `كود العامل (${code}) مستخدم بالفعل في هذا المصنع` }, { status: 400 });
    }

    const employee = await prisma.employee.create({
      data: {
        factoryId,
        code: code.trim().toUpperCase(),
        name,
        jobTitle,
        phone: phone || null,
        monthlySalary: monthlySalary ? parseFloat(String(monthlySalary)) : 0,
        paymentType: paymentType || "MONTHLY",
        hiringDate: hiringDate ? new Date(hiringDate) : new Date(),
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, employee });
  } catch (error) {
    console.error("POST /api/factory/employees error:", error);
    return NextResponse.json({ error: "فشل إضافة العامل الجديد" }, { status: 500 });
  }
}
