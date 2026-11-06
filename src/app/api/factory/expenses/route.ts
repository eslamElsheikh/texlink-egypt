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

    const [expenses, machines, orders] = await Promise.all([
      prisma.expense.findMany({
        where: { factoryId },
        include: {
          relatedMachine: { select: { id: true, code: true, name: true } },
          relatedProductionOrder: { select: { id: true, orderNumber: true } },
        },
        orderBy: { date: "desc" },
        take: 100,
      }),
      prisma.machine.findMany({
        where: { factoryId },
        select: { id: true, code: true, name: true },
        orderBy: { code: "asc" },
      }),
      prisma.productionOrder.findMany({
        where: { factoryId },
        select: { id: true, orderNumber: true, productNameSnapshot: true },
        orderBy: { orderNumber: "asc" },
      }),
    ]);

    const totalExpenses = expenses.reduce((s, exp) => s + Number(exp.amount || 0), 0);

    const byCategory: Record<string, number> = {};
    for (const exp of expenses) {
      byCategory[exp.category] = (byCategory[exp.category] || 0) + Number(exp.amount || 0);
    }

    return NextResponse.json({
      expenses,
      options: { machines, orders },
      stats: {
        totalExpenses,
        expensesCount: expenses.length,
        byCategory,
      },
    });
  } catch (error) {
    console.error("GET /api/factory/expenses error:", error);
    return NextResponse.json({ error: "فشل تحميل المصروفات" }, { status: 500 });
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
      category,
      amount,
      date,
      paymentMethod,
      description,
      relatedMachineId,
      relatedProductionOrderId,
    } = body;

    const parsedAmount = parseFloat(String(amount));
    if (!category || isNaN(parsedAmount) || parsedAmount <= 0 || !description) {
      return NextResponse.json({ error: "التصنيف، المبلغ والوصف حقول مطلوبة" }, { status: 400 });
    }

    // Tenant isolation: verify machine belongs to this factory
    if (relatedMachineId) {
      const machine = await prisma.machine.findFirst({
        where: { id: relatedMachineId, factoryId },
      });
      if (!machine) {
        return NextResponse.json({ error: "الماكينة المرتبطة غير موجودة أو غير تابعة لمصنعك" }, { status: 404 });
      }
    }

    // Tenant isolation: verify production order belongs to this factory
    if (relatedProductionOrderId) {
      const order = await prisma.productionOrder.findFirst({
        where: { id: relatedProductionOrderId, factoryId },
      });
      if (!order) {
        return NextResponse.json({ error: "أمر الإنتاج المرتبط غير موجود أو غير تابع لمصنعك" }, { status: 404 });
      }
    }

    const expense = await prisma.expense.create({
      data: {
        factoryId,
        category,
        amount: parsedAmount,
        date: date ? new Date(date) : new Date(),
        paymentMethod: paymentMethod || "CASH",
        description,
        relatedMachineId: relatedMachineId || null,
        relatedProductionOrderId: relatedProductionOrderId || null,
      },
    });

    return NextResponse.json({ success: true, expense });
  } catch (error) {
    console.error("POST /api/factory/expenses error:", error);
    return NextResponse.json({ error: "فشل تسجيل المصروف" }, { status: 500 });
  }
}
