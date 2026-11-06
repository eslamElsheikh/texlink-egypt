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
    const customerId = url.searchParams.get("customerId");

    const whereClause: Record<string, unknown> = { factoryId };
    if (customerId) whereClause.customerId = customerId;

    const [activities, customers] = await Promise.all([
      prisma.crmActivity.findMany({
        where: whereClause,
        include: {
          customer: { select: { id: true, name: true, companyName: true, phone: true } },
          deal: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.crmCustomer.findMany({
        where: { factoryId },
        select: { id: true, name: true, companyName: true },
        orderBy: { name: "asc" },
      }),
    ]);

    return NextResponse.json({ activities, customers });
  } catch (error) {
    console.error("GET /api/crm/activities error:", error);
    return NextResponse.json({ error: "فشل تحميل سجل الأنشطة" }, { status: 500 });
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
    const { customerId, dealId, type, description } = body;

    if (!customerId || !description) {
      return NextResponse.json({ error: "العميل والوصف حقول مطلوبة" }, { status: 400 });
    }

    // Tenant isolation: verify customer belongs to this factory
    const customer = await prisma.crmCustomer.findFirst({
      where: { id: customerId, factoryId },
    });
    if (!customer) {
      return NextResponse.json({ error: "العميل غير موجود أو غير تابع لمصنعك" }, { status: 404 });
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

    const activity = await prisma.crmActivity.create({
      data: {
        factoryId,
        customerId,
        dealId: dealId || null,
        type: type || "NOTE",
        description,
        performedBy: ctx.user.name,
      },
      include: {
        customer: true,
      },
    });

    // Update customer lastContactDate
    await prisma.crmCustomer.update({
      where: { id: customerId },
      data: { lastContactDate: new Date() },
    });

    return NextResponse.json({ success: true, activity });
  } catch (error) {
    console.error("POST /api/crm/activities error:", error);
    return NextResponse.json({ error: "فشل تسجيل النشاط" }, { status: 500 });
  }
}
