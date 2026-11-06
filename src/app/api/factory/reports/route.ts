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
    const traceOrderId = url.searchParams.get("traceOrderId");

    const [
      productionEntries,
      wasteRecords,
      machines,
      orders,
      costs,
      inventoryItems,
    ] = await Promise.all([
      prisma.productionEntry.findMany({
        where: { factoryId },
        include: {
          productionOrder: { select: { orderNumber: true, productNameSnapshot: true } },
          machine: { select: { code: true, name: true } },
        },
        orderBy: { productionDate: "desc" },
      }),
      prisma.wasteRecord.findMany({
        where: { factoryId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.machine.findMany({
        where: { factoryId },
        include: {
          maintenanceTickets: true,
          productionEntries: true,
        },
      }),
      prisma.productionOrder.findMany({
        where: { factoryId },
        include: {
          productionEntries: {
            include: { employee: true, machine: true, shift: true },
          },
          materialConsumptions: {
            include: { inventoryItem: true },
          },
          qualityInspections: true,
          wasteRecords: true,
          productionCost: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.productionCost.findMany({
        where: { factoryId },
        include: {
          productionOrder: { select: { orderNumber: true, productNameSnapshot: true } },
        },
      }),
      prisma.inventoryItem.findMany({
        where: { factoryId },
        include: { warehouse: true },
      }),
    ]);

    // 1. Production Summary
    const totalProduced = productionEntries.reduce((s, e) => s + e.producedQuantity, 0);
    const totalGood = productionEntries.reduce((s, e) => s + e.goodQuantity, 0);
    const totalDefect = productionEntries.reduce((s, e) => s + e.defectiveQuantity, 0);
    const overallWasteRate =
      totalProduced > 0 ? Math.round((totalDefect / totalProduced) * 1000) / 10 : 0;

    // 2. Machine Efficiency
    const machineStats = machines.map((m) => {
      const output = m.productionEntries.reduce((s, e) => s + e.producedQuantity, 0);
      const good = m.productionEntries.reduce((s, e) => s + e.goodQuantity, 0);
      const downtime = m.maintenanceTickets.reduce((s, t) => s + (t.downtimeMinutes || 0), 0);
      const maintCost = m.maintenanceTickets.reduce((s, t) => s + Number(t.totalCost || 0), 0);

      return {
        id: m.id,
        code: m.code,
        name: m.name,
        status: m.status,
        totalOutput: output,
        goodOutput: good,
        downtimeMinutes: downtime,
        maintenanceCost: maintCost,
        operatingCostPerHour: m.hourlyOperatingCost,
      };
    });

    // 3. Traceability Engine
    let traceData = null;
    const targetOrder = traceOrderId
      ? orders.find((o) => o.id === traceOrderId || o.orderNumber === traceOrderId)
      : orders[0];

    if (targetOrder) {
      traceData = {
        orderId: targetOrder.id,
        orderNumber: targetOrder.orderNumber,
        batchNumber: targetOrder.batchNumber || "BATCH-DEFAULT",
        productName: targetOrder.productNameSnapshot,
        targetQuantity: targetOrder.targetQuantity,
        status: targetOrder.status,
        plannedDates: {
          start: targetOrder.plannedStartDate,
          end: targetOrder.plannedEndDate,
        },
        rawMaterials: targetOrder.materialConsumptions.map((mc) => ({
          itemName: mc.inventoryItem.name,
          sku: mc.inventoryItem.sku,
          batchNumber: mc.inventoryItem.batchNumber || "RAW-BATCH",
          consumed: mc.actualConsumed,
          unit: mc.inventoryItem.unit,
          cost: mc.totalCost,
        })),
        stagesAndMachines: targetOrder.productionEntries.map((pe) => ({
          stage: pe.stage,
          date: pe.productionDate,
          machine: pe.machine ? `${pe.machine.code} (${pe.machine.name})` : "صالة التجهيز",
          employee: pe.employee ? `${pe.employee.name} (${pe.employee.jobTitle})` : "طاقم الوردية",
          shift: pe.shift?.name || "وردية صباحية",
          produced: pe.producedQuantity,
          good: pe.goodQuantity,
          defect: pe.defectiveQuantity,
        })),
        qualitySignoffs: targetOrder.qualityInspections.map((qi) => ({
          stage: qi.stage,
          status: qi.status,
          inspector: qi.inspectorName || "مسؤول الجودة",
          inspected: qi.inspectedQuantity,
          accepted: qi.acceptedQuantity,
          rejected: qi.rejectedQuantity,
          date: qi.inspectionDate,
        })),
        defectsAndWaste: targetOrder.wasteRecords.map((wr) => ({
          stage: wr.stage,
          type: wr.defectType,
          quantity: wr.quantity,
          scrapped: wr.scrappedQuantity,
          estimatedCost: wr.estimatedCost,
        })),
        costing: targetOrder.productionCost
          ? {
              totalCost: targetOrder.productionCost.totalCost,
              costPerGoodUnit: targetOrder.productionCost.costPerGoodUnit,
              goodUnits: targetOrder.productionCost.goodUnitsCount,
            }
          : null,
      };
    }

    return NextResponse.json({
      summary: {
        totalProduced,
        totalGood,
        totalDefect,
        overallWasteRate,
        totalOrdersCount: orders.length,
        totalInventoryValuation: inventoryItems.reduce(
          (s, i) => s + Number(i.totalValuation || Number(i.currentStock) * Number(i.unitCost)),
          0
        ),
      },
      machines: machineStats,
      costs,
      traceData,
      orderOptions: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        productName: o.productNameSnapshot,
      })),
    });
  } catch (error) {
    console.error("GET /api/factory/reports error:", error);
    return NextResponse.json({ error: "فشل تحميل تقارير المصنع" }, { status: 500 });
  }
}
