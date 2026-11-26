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
      workerCount,
      machineCount,
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
    if (minOrderQuantity !== undefined) {
      const parsedMoq = parseInt(String(minOrderQuantity), 10);
      if (!Number.isNaN(parsedMoq) && parsedMoq >= 1) updateData.minOrderQuantity = parsedMoq;
    }
    if (monthlyCapacity !== undefined) {
      const parsedCap = parseInt(String(monthlyCapacity), 10);
      if (!Number.isNaN(parsedCap) && parsedCap >= 1) updateData.monthlyCapacity = parsedCap;
    }
    if (workerCount !== undefined) {
      const parsedWorkers = parseInt(String(workerCount), 10);
      if (!Number.isNaN(parsedWorkers) && parsedWorkers >= 1) updateData.workerCount = parsedWorkers;
    }
    if (machineCount !== undefined) {
      const parsedMachines = parseInt(String(machineCount), 10);
      if (!Number.isNaN(parsedMachines) && parsedMachines >= 1) updateData.machineCount = parsedMachines;
    }
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
