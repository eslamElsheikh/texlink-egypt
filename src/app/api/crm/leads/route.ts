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

    const leads = await prisma.crmLead.findMany({
      where: { factoryId },
      include: {
        customer: { select: { id: true, name: true, companyName: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const byStatus = {
      NEW: leads.filter((l) => l.status === "NEW").length,
      CONTACTED: leads.filter((l) => l.status === "CONTACTED").length,
      QUALIFIED: leads.filter((l) => l.status === "QUALIFIED").length,
      CONVERTED: leads.filter((l) => l.status === "CONVERTED").length,
      UNQUALIFIED: leads.filter((l) => l.status === "UNQUALIFIED").length,
    };

    return NextResponse.json({ leads, stats: byStatus });
  } catch (error) {
    console.error("GET /api/crm/leads error:", error);
    return NextResponse.json({ error: "فشل تحميل العملاء المحتملين" }, { status: 500 });
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
      customerId,
      title,
      contactName,
      phone,
      email,
      estimatedValue,
      productInterest,
      source,
      status,
      notes,
    } = body;

    if (!title || !contactName || !phone) {
      return NextResponse.json({ error: "عنوان الفرصة، اسم جهة الاتصال ورقم الهاتف حقول مطلوبة" }, { status: 400 });
    }

    const lead = await prisma.crmLead.create({
      data: {
        factoryId,
        customerId: customerId || null,
        title,
        contactName,
        phone,
        email: email || null,
        estimatedValue: estimatedValue ? parseFloat(String(estimatedValue)) : null,
        productInterest: productInterest || null,
        source: source || "DIRECT_CALL",
        status: status || "NEW",
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, lead });
  } catch (error) {
    console.error("POST /api/crm/leads error:", error);
    return NextResponse.json({ error: "فشل إضافة العميل المحتمل" }, { status: 500 });
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
    const { id, status, notes, action } = body;

    if (!id) {
      return NextResponse.json({ error: "معرف الفرصة مطلوب" }, { status: 400 });
    }

    const lead = await prisma.crmLead.findFirst({
      where: { id, factoryId },
    });
    if (!lead) {
      return NextResponse.json({ error: "الفرصة غير موجودة" }, { status: 404 });
    }

    // Action: Convert Lead to Customer & Deal
    if (action === "CONVERT_TO_DEAL") {
      const result = await prisma.$transaction(async (tx) => {
        let customerId = lead.customerId;

        // If no customer linked, create one
        if (!customerId) {
          const newCust = await tx.crmCustomer.create({
            data: {
              factoryId,
              name: lead.contactName,
              phone: lead.phone,
              email: lead.email,
              source: lead.source,
              status: "ACTIVE",
              notes: `تم تحويله تلقائياً من العميل المحتمل: ${lead.title}`,
            },
          });
          customerId = newCust.id;
        }

        // Create Deal
        const deal = await tx.crmDeal.create({
          data: {
            factoryId,
            customerId,
            leadId: lead.id,
            title: lead.title,
            stage: "PROPOSAL",
            amount: lead.estimatedValue || 50000,
            notes: lead.notes,
          },
        });

        // Update Lead status
        await tx.crmLead.update({
          where: { id: lead.id },
          data: { status: "CONVERTED", customerId },
        });

        return { customerId, deal };
      });

      return NextResponse.json({ success: true, ...result });
    }

    const updated = await prisma.crmLead.update({
      where: { id },
      data: {
        status: status || lead.status,
        notes: notes !== undefined ? notes : lead.notes,
      },
    });

    return NextResponse.json({ success: true, lead: updated });
  } catch (error) {
    console.error("PATCH /api/crm/leads error:", error);
    return NextResponse.json({ error: "فشل تحديث العميل المحتمل" }, { status: 500 });
  }
}
