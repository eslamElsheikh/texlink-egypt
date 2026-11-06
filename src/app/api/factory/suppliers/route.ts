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

    const suppliers = await prisma.supplier.findMany({
      where: { factoryId },
      include: {
        _count: { select: { purchaseOrders: true } },
      },
      orderBy: { name: "asc" },
    });

    const totalOutstanding = suppliers.reduce((s, sup) => s + (sup.outstandingBalance || 0), 0);

    return NextResponse.json({
      suppliers,
      stats: {
        totalSuppliers: suppliers.length,
        totalOutstanding,
      },
    });
  } catch (error) {
    console.error("GET /api/factory/suppliers error:", error);
    return NextResponse.json({ error: "فشل تحميل بيانات الموردين" }, { status: 500 });
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
    const { name, category, contactPerson, phone, address, outstandingBalance } = body;

    if (!name || !phone || !category) {
      return NextResponse.json({ error: "اسم المورد ورقم الهاتف والتصنيف حقول مطلوبة" }, { status: 400 });
    }

    const supplier = await prisma.supplier.create({
      data: {
        factoryId,
        name,
        category,
        contactPerson: contactPerson || null,
        phone,
        address: address || null,
        outstandingBalance: outstandingBalance ? parseFloat(String(outstandingBalance)) : 0,
      },
    });

    return NextResponse.json({ success: true, supplier });
  } catch (error) {
    console.error("POST /api/factory/suppliers error:", error);
    return NextResponse.json({ error: "فشل إضافة المورد الجديد" }, { status: 500 });
  }
}
