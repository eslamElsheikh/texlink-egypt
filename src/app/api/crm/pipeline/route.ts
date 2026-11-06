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

    const [deals, customers] = await Promise.all([
      prisma.crmDeal.findMany({
        where: { factoryId },
        include: {
          customer: { select: { id: true, name: true, companyName: true, phone: true } },
          rfq: { select: { id: true, titleAr: true } },
          order: { select: { id: true, orderNumber: true } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.crmCustomer.findMany({
        where: { factoryId },
        select: { id: true, name: true, companyName: true },
        orderBy: { name: "asc" },
      }),
    ]);

    const totalPipelineValue = deals.filter((d) => d.stage !== "LOST").reduce((s, d) => s + Number(d.amount || 0), 0);
    const wonValue = deals.filter((d) => d.stage === "WON").reduce((s, d) => s + Number(d.amount || 0), 0);

    return NextResponse.json({
      deals,
      customers,
      stats: {
        totalDeals: deals.length,
        totalPipelineValue,
        wonValue,
      },
    });
  } catch (error) {
    console.error("GET /api/crm/pipeline error:", error);
    return NextResponse.json({ error: "فشل تحميل خط الصفقات" }, { status: 500 });
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
    const { customerId, title, stage, amount, expectedCloseDate, notes } = body;

    if (!customerId || !title || !amount) {
      return NextResponse.json({ error: "العميل، عنوان الصفقة والمبلغ التقديري حقول مطلوبة" }, { status: 400 });
    }

    // Tenant isolation: verify customer belongs to this factory
    const customer = await prisma.crmCustomer.findFirst({
      where: { id: customerId, factoryId },
    });
    if (!customer) {
      return NextResponse.json({ error: "العميل غير موجود أو غير تابع لمصنعك" }, { status: 404 });
    }
    const deal = await prisma.crmDeal.create({
      data: {
        factoryId,
        customerId,
        title,
        stage: stage || "DISCOVERY",
        amount: parseFloat(String(amount)),
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
        notes: notes || null,
      },
      include: {
        customer: true,
      },
    });

    // Record activity
    await prisma.crmActivity.create({
      data: {
        factoryId,
        customerId,
        dealId: deal.id,
        type: "NOTE",
        description: `تم فتح صفقة جديدة: ${deal.title} بقيمة ${deal.amount.toLocaleString()} ج.م`,
        performedBy: ctx.user.name,
      },
    });

    return NextResponse.json({ success: true, deal });
  } catch (error) {
    console.error("POST /api/crm/pipeline error:", error);
    return NextResponse.json({ error: "فشل إنشاء الصفقة" }, { status: 500 });
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
    const { id, stage, amount, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "معرف الصفقة مطلوب" }, { status: 400 });
    }

    const deal = await prisma.crmDeal.findFirst({
      where: { id, factoryId },
    });
    if (!deal) {
      return NextResponse.json({ error: "الصفقة غير موجودة" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (stage) updateData.stage = stage;
    if (amount !== undefined) updateData.amount = parseFloat(String(amount));
    if (notes !== undefined) updateData.notes = notes;

    const updated = await prisma.$transaction(async (tx) => {
      const d = await tx.crmDeal.update({
        where: { id },
        data: updateData,
      });

      // If moved to WON, update customer totalSpend
      if (stage === "WON" && deal.stage !== "WON") {
        await tx.crmCustomer.update({
          where: { id: deal.customerId },
          data: {
            totalSpend: { increment: d.amount },
            ordersCount: { increment: 1 },
          },
        });

        await tx.crmActivity.create({
          data: {
            factoryId,
            customerId: deal.customerId,
            dealId: deal.id,
            type: "NOTE",
            description: `مبروك! تم حسم الصفقة بنجاح: ${deal.title} بقيمة ${d.amount.toLocaleString()} ج.م`,
            performedBy: ctx.user.name,
          },
        });
      }

      return d;
    });

    return NextResponse.json({ success: true, deal: updated });
  } catch (error) {
    console.error("PATCH /api/crm/pipeline error:", error);
    return NextResponse.json({ error: "فشل تحديث الصفقة" }, { status: 500 });
  }
}
