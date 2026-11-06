import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { resolveFactoryContext } from "@/lib/auth/factory-context";

export async function GET(request: Request) {
  try {
    const ctx = await resolveFactoryContext(request);
    if ("error" in ctx) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status });
    }
    const { factoryId, settings } = ctx;

    const [
      maintenanceTickets,
      lowStockItems,
      overdueOrders,
      productionEntries,
      suppliers,
    ] = await Promise.all([
      prisma.maintenanceTicket.findMany({
        where: { factoryId, status: { in: ["OPEN", "IN_PROGRESS"] } },
        include: { machine: true },
        take: 5,
      }),
      prisma.inventoryItem.findMany({
        where: { factoryId },
        include: { warehouse: true },
      }),
      prisma.productionOrder.findMany({
        where: {
          factoryId,
          status: { in: ["PLANNED", "IN_PROGRESS"] },
          plannedEndDate: { lt: new Date() },
        },
        take: 5,
      }),
      prisma.productionEntry.findMany({
        where: { factoryId },
        orderBy: { productionDate: "desc" },
        take: 20,
      }),
      prisma.supplier.findMany({
        where: { factoryId, outstandingBalance: { gt: 20000 } },
        take: 3,
      }),
    ]);

    const notifications = [];

    // 1. Machine Breakdown Notifications
    for (const ticket of maintenanceTickets) {
      notifications.push({
        id: `maint-${ticket.id}`,
        type: "MACHINE_BREAKDOWN",
        severity: "CRITICAL",
        titleAr: `عطل في ${ticket.machine.code}`,
        messageAr: `${ticket.machine.name}: ${ticket.description}`,
        link: "/factory/maintenance",
        createdAt: ticket.startTime,
      });
    }

    // 2. Low Stock Alerts
    const criticalStock = lowStockItems.filter((i) => i.currentStock <= i.minimumStock);
    for (const item of criticalStock) {
      notifications.push({
        id: `stock-${item.id}`,
        type: "LOW_INVENTORY",
        severity: "WARNING",
        titleAr: `رصيد حرج: ${item.name}`,
        messageAr: `المتبقي في ${item.warehouse.name} هو ${item.currentStock} ${item.unit} فقط (الحد الأدنى: ${item.minimumStock})`,
        link: "/factory/inventory",
        createdAt: item.updatedAt,
      });
    }

    // 3. Overdue Production Orders
    for (const order of overdueOrders) {
      notifications.push({
        id: `order-${order.id}`,
        type: "ORDER_OVERDUE",
        severity: "WARNING",
        titleAr: `تأخر أمر الإنتاج: ${order.orderNumber}`,
        messageAr: `${order.productNameSnapshot} تجاوز موعد التسليم المستهدف`,
        link: "/factory/production-orders",
        createdAt: order.plannedEndDate,
      });
    }

    // 4. Waste threshold alert
    const totalProd = productionEntries.reduce((s, e) => s + e.producedQuantity, 0);
    const totalDefect = productionEntries.reduce((s, e) => s + e.defectiveQuantity, 0);
    const wastePct = totalProd > 0 ? (totalDefect / totalProd) * 100 : 0;
    const threshold = settings?.wasteThresholdPct || 5.0;

    if (wastePct > threshold) {
      notifications.push({
        id: "waste-alert",
        type: "UNUSUAL_WASTE",
        severity: "ALERT",
        titleAr: "ارتفاع نسبة الهالك عن الحد المسموح",
        messageAr: `معدل الهالك الحالي (${wastePct.toFixed(1)}%) يتجاوز الحد الأقصى للمصنع (${threshold}%)`,
        link: "/factory/waste",
        createdAt: new Date(),
      });
    }

    // 5. Outstanding Supplier balances
    for (const sup of suppliers) {
      notifications.push({
        id: `sup-${sup.id}`,
        type: "SUPPLIER_PAYMENT_DUE",
        severity: "INFO",
        titleAr: `مستحقات توريد: ${sup.name}`,
        messageAr: `يوجد رصيد مستحق بقيمة ${sup.outstandingBalance.toLocaleString()} ج.م`,
        link: "/factory/suppliers",
        createdAt: sup.updatedAt,
      });
    }

    return NextResponse.json({
      notifications,
      unreadCount: notifications.length,
    });
  } catch (error) {
    console.error("GET /api/factory/notifications error:", error);
    return NextResponse.json({ error: "فشل تحميل إشعارات المصنع" }, { status: 500 });
  }
}
