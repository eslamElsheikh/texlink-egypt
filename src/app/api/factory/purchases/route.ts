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

    const [orders, suppliers, inventoryItems] = await Promise.all([
      prisma.factoryPurchaseOrder.findMany({
        where: { factoryId },
        include: {
          supplier: { select: { id: true, name: true, phone: true } },
          items: {
            include: {
              inventoryItem: { select: { id: true, name: true, unit: true, warehouseId: true } },
            },
          },
        },
        orderBy: { orderDate: "desc" },
      }),
      prisma.supplier.findMany({
        where: { factoryId },
        select: { id: true, name: true, category: true },
        orderBy: { name: "asc" },
      }),
      prisma.inventoryItem.findMany({
        where: { factoryId },
        select: { id: true, name: true, unit: true, currentStock: true },
        orderBy: { name: "asc" },
      }),
    ]);

    const totalPurchases = orders.reduce((s, o) => s + Number(o.totalAmount || 0), 0);
    const pendingCount = orders.filter((o) => o.status === "PENDING" || o.status === "PARTIALLY_RECEIVED").length;

    return NextResponse.json({
      orders,
      options: { suppliers, inventoryItems },
      stats: {
        totalOrders: orders.length,
        pendingOrders: pendingCount,
        totalPurchases,
      },
    });
  } catch (error) {
    console.error("GET /api/factory/purchases error:", error);
    return NextResponse.json({ error: "فشل تحميل أوامر الشراء" }, { status: 500 });
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
    const { supplierId, poNumber, expectedDeliveryDate, notes, items } = body;

    if (!supplierId || !poNumber || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "المورد، رقم أمر الشراء والأصناف حقول مطلوبة" }, { status: 400 });
    }

    // Tenant isolation: verify supplier belongs to this factory
    const supplier = await prisma.supplier.findFirst({
      where: { id: supplierId, factoryId },
    });
    if (!supplier) {
      return NextResponse.json({ error: "المورد المحدد غير موجود أو غير تابع لمصنعك" }, { status: 404 });
    }

    const existing = await prisma.factoryPurchaseOrder.findFirst({
      where: { factoryId, poNumber },
    });
    if (existing) {
      return NextResponse.json({ error: `أمر الشراء (${poNumber}) مسجل بالفعل في مصنعك` }, { status: 400 });
    }

    let calculatedTotal = 0;
    for (const it of items) {
      if (it.inventoryItemId) {
        const invItem = await prisma.inventoryItem.findFirst({
          where: { id: it.inventoryItemId, factoryId },
        });
        if (!invItem) {
          return NextResponse.json({ error: `خامة المخزن (${it.description}) غير تابعة لمصنعك` }, { status: 404 });
        }
      }
    }

    const formattedItems = items.map((it: { description: string; quantity: number; unitPrice: number; inventoryItemId?: string }) => {
      const q = parseFloat(String(it.quantity || 0));
      const p = parseFloat(String(it.unitPrice || 0));
      const t = q * p;
      calculatedTotal += t;

      return {
        description: it.description,
        quantity: q,
        receivedQuantity: 0,
        unitPrice: p,
        totalPrice: t,
        inventoryItemId: it.inventoryItemId || null,
      };
    });

    const po = await prisma.factoryPurchaseOrder.create({
      data: {
        factoryId,
        supplierId,
        poNumber,
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
        totalAmount: calculatedTotal,
        notes: notes || null,
        status: "PENDING",
        items: {
          create: formattedItems,
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ success: true, order: po });
  } catch (error) {
    console.error("POST /api/factory/purchases error:", error);
    return NextResponse.json({ error: "فشل إنشاء أمر الشراء" }, { status: 500 });
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
    const { action } = body;

    // Action: Receive Items into Warehouse Inventory
    if (action === "RECEIVE_ITEMS") {
      const { purchaseOrderId, itemId, receivedQuantityNow } = body;
      const qtyNow = parseFloat(String(receivedQuantityNow));

      if (!purchaseOrderId || !itemId || isNaN(qtyNow) || qtyNow <= 0) {
        return NextResponse.json({ error: "أمر الشراء، الصنف والكمية المستلمة حقول مطلوبة" }, { status: 400 });
      }

      const po = await prisma.factoryPurchaseOrder.findFirst({
        where: { id: purchaseOrderId, factoryId },
        include: { items: { include: { inventoryItem: true } } },
      });
      if (!po) {
        return NextResponse.json({ error: "أمر الشراء غير موجود" }, { status: 404 });
      }

      const item = po.items.find((i) => i.id === itemId);
      if (!item) {
        return NextResponse.json({ error: "البند المطلوب غير موجود في أمر الشراء" }, { status: 404 });
      }

      const result = await prisma.$transaction(async (tx) => {
        const newReceivedTotal = item.receivedQuantity + qtyNow;

        // 1. Update purchase item received quantity
        await tx.factoryPurchaseItem.update({
          where: { id: itemId },
          data: { receivedQuantity: newReceivedTotal },
        });

        // 2. If mapped to inventory item, increase stock and add immutable movement
        if (item.inventoryItemId && item.inventoryItem) {
          const inv = item.inventoryItem;
          const prevStock = inv.currentStock;
          const newStock = prevStock + qtyNow;

          await tx.inventoryItem.update({
            where: { id: item.inventoryItemId },
            data: {
              currentStock: newStock,
              totalValuation: newStock * inv.unitCost,
            },
          });

          await tx.stockMovement.create({
            data: {
              factoryId,
              inventoryItemId: item.inventoryItemId,
              movementType: "PURCHASE_IN",
              quantity: qtyNow,
              previousStock: prevStock,
              newStock,
              unitCost: item.unitPrice,
              toWarehouseId: inv.warehouseId,
              referenceOrderNumber: po.poNumber,
              notes: `استلام بضاعة من أمر الشراء: ${po.poNumber}`,
            },
          });
        }

        // 3. Update overall PO status
        const allItemsReceived = po.items.every((it) =>
          it.id === itemId ? newReceivedTotal >= it.quantity : it.receivedQuantity >= it.quantity
        );

        await tx.factoryPurchaseOrder.update({
          where: { id: purchaseOrderId },
          data: {
            status: allItemsReceived ? "RECEIVED" : "PARTIALLY_RECEIVED",
          },
        });

        return { newReceivedTotal, allItemsReceived };
      });

      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/factory/purchases error:", error);
    return NextResponse.json({ error: "فشل استلام البضاعة في المخزن" }, { status: 500 });
  }
}
