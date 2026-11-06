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

    let settings = await prisma.factorySettings.findUnique({
      where: { factoryId },
    });

    if (!settings) {
      settings = await prisma.factorySettings.create({
        data: {
          factoryId,
          usageMode: "FULL_ACCESS",
          marketplaceEnabled: true,
          autoMatchEnabled: true,
          lowStockAlertThreshold: 50,
          workingHoursPerShift: 8.0,
          currency: "EGP",
          traceabilityEnabled: true,
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("GET /api/factory/settings error:", error);
    return NextResponse.json({ error: "فشل تحميل إعدادات المصنع" }, { status: 500 });
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
      marketplaceEnabled,
      autoMatchEnabled,
      wasteThresholdPct,
      lowStockAlertThreshold,
      currency,
      traceabilityEnabled,
    } = body;

    const updateData: Record<string, unknown> = {};
    if (marketplaceEnabled !== undefined) {
      const isEnabled = Boolean(marketplaceEnabled);
      updateData.marketplaceEnabled = isEnabled;
      updateData.usageMode = isEnabled ? "FULL_ACCESS" : "MANAGEMENT_ONLY";
      if (!isEnabled) {
        updateData.autoMatchEnabled = false;
      }
    } else if (autoMatchEnabled !== undefined) {
      updateData.autoMatchEnabled = Boolean(autoMatchEnabled);
    }
    if (wasteThresholdPct !== undefined) updateData.wasteThresholdPct = parseFloat(String(wasteThresholdPct));
    if (lowStockAlertThreshold !== undefined) updateData.lowStockAlertThreshold = parseInt(String(lowStockAlertThreshold), 10);
    if (currency !== undefined) updateData.currency = String(currency);

    const settings = await prisma.factorySettings.upsert({
      where: { factoryId },
      create: {
        factoryId,
        usageMode: updateData.usageMode ? String(updateData.usageMode) : "FULL_ACCESS",
        marketplaceEnabled: updateData.marketplaceEnabled !== undefined ? Boolean(updateData.marketplaceEnabled) : true,
        wasteThresholdPct: updateData.wasteThresholdPct !== undefined ? Number(updateData.wasteThresholdPct) : 5.0,
        lowStockAlertThreshold: updateData.lowStockAlertThreshold !== undefined ? Number(updateData.lowStockAlertThreshold) : 50,
        currency: updateData.currency !== undefined ? String(updateData.currency) : "EGP",
        traceabilityEnabled: updateData.traceabilityEnabled !== undefined ? Boolean(updateData.traceabilityEnabled) : true,
      },
      update: updateData,
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("PATCH /api/factory/settings error:", error);
    return NextResponse.json({ error: "فشل حفظ إعدادات المصنع" }, { status: 500 });
  }
}
