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
    const search = url.searchParams.get("q") || "";
    const status = url.searchParams.get("status");
    const source = url.searchParams.get("source");

    const whereClause: Record<string, unknown> = { factoryId };
    if (status) whereClause.status = status;
    if (source) whereClause.source = source;
    if (search.trim()) {
      whereClause.OR = [
        { name: { contains: search } },
        { companyName: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const customers = await prisma.crmCustomer.findMany({
      where: whereClause,
      include: {
        buyer: { select: { name: true, phone: true } },
        _count: { select: { deals: true, followUps: true, activities: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    const totalSpendAll = customers.reduce((s, c) => s + c.totalSpend, 0);

    return NextResponse.json({
      customers,
      stats: {
        totalCount: customers.length,
        activeCount: customers.filter((c) => c.status === "ACTIVE").length,
        marketplaceCount: customers.filter((c) => c.source === "MARKETPLACE").length,
        totalSpendAll,
      },
    });
  } catch (error) {
    console.error("GET /api/crm/customers error:", error);
    return NextResponse.json({ error: "فشل تحميل بيانات العملاء" }, { status: 500 });
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
      name,
      companyName,
      email,
      phone,
      whatsapp,
      governorate,
      city,
      address,
      source,
      status,
      tags,
      notes,
    } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "اسم العميل ورقم الهاتف حقول مطلوبة" }, { status: 400 });
    }

    // Check existing customer with same phone in this factory (Deduplication)
    const existing = await prisma.crmCustomer.findFirst({
      where: { factoryId, phone: phone.trim() },
    });
    if (existing) {
      return NextResponse.json(
        { error: `العميل مسجل بالفعل بنفس رقم الهاتف (${existing.name} - ${existing.companyName || ""})` },
        { status: 400 }
      );
    }

    // Deduplication check with existing marketplace buyer by phone/email
    let linkedBuyerId: string | null = null;
    if (phone || email) {
      const buyerUser = await prisma.user.findFirst({
        where: {
          OR: [
            ...(phone ? [{ phone: phone.trim() }] : []),
            ...(email ? [{ email: email.toLowerCase().trim() }] : []),
          ],
        },
      });
      if (buyerUser) {
        linkedBuyerId = buyerUser.id;
      }
    }

    const customer = await prisma.crmCustomer.create({
      data: {
        factoryId,
        buyerId: linkedBuyerId,
        name: name.trim(),
        companyName: companyName ? companyName.trim() : null,
        email: email ? email.toLowerCase().trim() : null,
        phone: phone.trim(),
        whatsapp: whatsapp ? whatsapp.trim() : phone.trim(),
        governorate: governorate || null,
        city: city || null,
        address: address || null,
        source: source || (linkedBuyerId ? "MARKETPLACE" : "DIRECT"),
        status: status || "ACTIVE",
        tags: typeof tags === "string" ? tags : JSON.stringify(tags || []),
        notes: notes || null,
      },
    });

    // Record initial CRM activity
    await prisma.crmActivity.create({
      data: {
        factoryId,
        customerId: customer.id,
        type: "NOTE",
        description: `تم إنشاء ملف العميل (${customer.name}) عبر مساحة CRM`,
        performedBy: ctx.user.name,
      },
    });

    return NextResponse.json({ success: true, customer });
  } catch (error) {
    console.error("POST /api/crm/customers error:", error);
    return NextResponse.json({ error: "فشل إضافة العميل الجديد" }, { status: 500 });
  }
}
