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

    const [followUps, customers] = await Promise.all([
      prisma.crmFollowUp.findMany({
        where: { factoryId },
        include: {
          customer: { select: { id: true, name: true, companyName: true, phone: true } },
          deal: { select: { id: true, title: true } },
        },
        orderBy: { dueDate: "asc" },
      }),
      prisma.crmCustomer.findMany({
        where: { factoryId },
        select: { id: true, name: true, companyName: true },
        orderBy: { name: "asc" },
      }),
    ]);

    const now = new Date();
    const pendingCount = followUps.filter((f) => f.status === "PENDING").length;
    const completedCount = followUps.filter((f) => f.status === "COMPLETED").length;
    const overdueCount = followUps.filter((f) => f.status === "PENDING" && new Date(f.dueDate) < now).length;

    return NextResponse.json({
      followUps,
      customers,
      stats: {
        total: followUps.length,
        pendingCount,
        completedCount,
        overdueCount,
      },
    });
  } catch (error) {
    console.error("GET /api/crm/follow-ups error:", error);
    return NextResponse.json({ error: "فشل تحميل مهام المتابعة" }, { status: 500 });
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
    const { customerId, dealId, title, dueDate, type, priority, assignedTo, notes } = body;

    if (!title || !dueDate) {
      return NextResponse.json({ error: "عنوان المهمة وموعد الاستحقاق حقول مطلوبة" }, { status: 400 });
    }

    // Tenant isolation: verify customer belongs to this factory
    if (customerId) {
      const customer = await prisma.crmCustomer.findFirst({
        where: { id: customerId, factoryId },
      });
      if (!customer) {
        return NextResponse.json({ error: "العميل غير موجود أو غير تابع لمصنعك" }, { status: 404 });
      }
    }

    // Tenant isolation: verify deal belongs to this factory
    if (dealId) {
      const deal = await prisma.crmDeal.findFirst({
        where: { id: dealId, factoryId },
      });
      if (!deal) {
        return NextResponse.json({ error: "الصفقة غير موجودة أو غير تابعة لمصنعك" }, { status: 404 });
      }
    }
    const followUp = await prisma.crmFollowUp.create({
      data: {
        factoryId,
        customerId: customerId || null,
        dealId: dealId || null,
        title,
        dueDate: new Date(dueDate),
        type: type || "CALL",
        priority: priority || "MEDIUM",
        status: "PENDING",
        assignedTo: assignedTo || ctx.user.name,
        notes: notes || null,
      },
      include: {
        customer: true,
      },
    });

    return NextResponse.json({ success: true, followUp });
  } catch (error) {
    console.error("POST /api/crm/follow-ups error:", error);
    return NextResponse.json({ error: "فشل إضافة مهمة المتابعة" }, { status: 500 });
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
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "معرف المهمة مطلوب" }, { status: 400 });
    }

    const followUp = await prisma.crmFollowUp.findFirst({
      where: { id, factoryId },
    });
    if (!followUp) {
      return NextResponse.json({ error: "المهمة غير موجودة" }, { status: 404 });
    }

    const isDone = status === "COMPLETED";

    const updated = await prisma.crmFollowUp.update({
      where: { id },
      data: {
        status: status || followUp.status,
        completedAt: isDone ? new Date() : followUp.completedAt,
        notes: notes !== undefined ? notes : followUp.notes,
      },
    });

    return NextResponse.json({ success: true, followUp: updated });
  } catch (error) {
    console.error("PATCH /api/crm/follow-ups error:", error);
    return NextResponse.json({ error: "فشل تحديث مهمة المتابعة" }, { status: 500 });
  }
}
