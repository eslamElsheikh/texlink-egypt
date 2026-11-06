import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { resolveFactoryContext } from "@/lib/auth/factory-context";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await resolveFactoryContext(request);
    if ("error" in ctx) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status });
    }
    const { factoryId } = ctx;
    const { id } = await params;

    const customer = await prisma.crmCustomer.findFirst({
      where: { id, factoryId },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            buyerProfile: true,
          },
        },
        leads: { orderBy: { createdAt: "desc" } },
        deals: {
          include: {
            rfq: { select: { titleAr: true } },
            order: { select: { orderNumber: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        followUps: { orderBy: { dueDate: "asc" } },
        activities: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "العميل غير موجود أو غير تابع لمصنعك" }, { status: 404 });
    }

    // Two-way integration: Fetch real marketplace activities for this buyer if linked
    let marketplaceActivity = {
      orders: [] as unknown[],
      rfqs: [] as unknown[],
      quotes: [] as unknown[],
    };

    if (customer.buyerId) {
      const [b2bOrders, b2bQuotes, b2bRfqs] = await Promise.all([
        prisma.order.findMany({
          where: { factoryId, buyerId: customer.buyerId },
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            quantity: true,
            status: true,
            createdAt: true,
            agreedDeliveryDate: true,
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.quote.findMany({
          where: { factoryId, rfq: { buyerId: customer.buyerId } },
          select: {
            id: true,
            unitPrice: true,
            totalAmount: true,
            status: true,
            createdAt: true,
            rfq: { select: { id: true, titleAr: true, totalQuantity: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.rfq.findMany({
          where: { buyerId: customer.buyerId },
          select: {
            id: true,
            titleAr: true,
            productType: true,
            totalQuantity: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
      ]);

      marketplaceActivity = {
        orders: b2bOrders,
        quotes: b2bQuotes,
        rfqs: b2bRfqs,
      };
    }

    return NextResponse.json({ customer, marketplaceActivity });
  } catch (error) {
    console.error("GET /api/crm/customers/[id] error:", error);
    return NextResponse.json({ error: "فشل تحميل ملف العميل" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await resolveFactoryContext(request);
    if ("error" in ctx) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status });
    }
    const { factoryId } = ctx;
    const { id } = await params;

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
      status,
      tags,
      notes,
    } = body;

    const existing = await prisma.crmCustomer.findFirst({
      where: { id, factoryId },
    });
    if (!existing) {
      return NextResponse.json({ error: "العميل غير موجود" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name.trim();
    if (companyName !== undefined) updateData.companyName = companyName ? companyName.trim() : null;
    if (email !== undefined) updateData.email = email ? email.toLowerCase().trim() : null;
    if (phone) updateData.phone = phone.trim();
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp ? whatsapp.trim() : null;
    if (governorate !== undefined) updateData.governorate = governorate;
    if (city !== undefined) updateData.city = city;
    if (address !== undefined) updateData.address = address;
    if (status) updateData.status = status;
    if (tags !== undefined) updateData.tags = typeof tags === "string" ? tags : JSON.stringify(tags);
    if (notes !== undefined) updateData.notes = notes;

    const updated = await prisma.crmCustomer.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, customer: updated });
  } catch (error) {
    console.error("PATCH /api/crm/customers/[id] error:", error);
    return NextResponse.json({ error: "فشل تحديث ملف العميل" }, { status: 500 });
  }
}
