import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { resolveFactoryContext } from "@/lib/auth/factory-context";

export async function GET(request: Request) {
  try {
    const ctx = await resolveFactoryContext(request);
    if ("error" in ctx) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status });
    }
    const { factory } = ctx;

    return NextResponse.json({ factory });
  } catch (error) {
    console.error("GET /api/factory/profile error:", error);
    return NextResponse.json({ error: "فشل تحميل ملف المصنع" }, { status: 500 });
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
    const {
      nameAr,
      governorate,
      industrialArea,
      city,
      phone,
      whatsapp,
      bioAr,
      minOrderQuantity,
      monthlyCapacity,
      specialties,
      machines,
      fabrics,
    } = body;

    const updateData: Record<string, unknown> = {};
    if (nameAr) updateData.nameAr = nameAr;
    if (governorate) updateData.governorate = governorate;
    if (industrialArea !== undefined) updateData.industrialArea = industrialArea || null;
    if (city) updateData.city = city;
    if (phone) updateData.phone = phone;
    if (whatsapp) updateData.whatsapp = whatsapp;
    if (bioAr) updateData.bioAr = bioAr;
    if (minOrderQuantity) updateData.minOrderQuantity = parseInt(String(minOrderQuantity), 10);
    if (monthlyCapacity) updateData.monthlyCapacity = parseInt(String(monthlyCapacity), 10);
    if (specialties) updateData.specialties = typeof specialties === "string" ? specialties : JSON.stringify(specialties);
    if (machines) updateData.machines = typeof machines === "string" ? machines : JSON.stringify(machines);
    if (fabrics) updateData.fabrics = typeof fabrics === "string" ? fabrics : JSON.stringify(fabrics);

    const updated = await prisma.factoryProfile.update({
      where: { id: factoryId },
      data: updateData,
    });

    return NextResponse.json({ success: true, factory: updated });
  } catch (error) {
    console.error("PATCH /api/factory/profile error:", error);
    return NextResponse.json({ error: "فشل تحديث ملف المصنع" }, { status: 500 });
  }
}
