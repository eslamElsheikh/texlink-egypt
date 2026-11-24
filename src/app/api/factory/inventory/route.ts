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

    const [items, warehouses, movements] = await Promise.all([
      prisma.inventoryItem.findMany({
        where: { factoryId },
        include: { warehouse: true },
        orderBy: { name: "asc" },
      }),
      prisma.warehouse.findMany({
        where: { factoryId },
        include: {
          _count: { select: { items: true } },
        },
        orderBy: { name: "asc" },
      }),
      prisma.stockMovement.findMany({
        where: { factoryId },
        include: {
          inventoryItem: { select: { id: true, name: true, sku: true, unit: true } },
          fromWarehouse: { select: { name: true } },
          toWarehouse: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    // Zero-Warehouse Deadlock Prevention: auto-provision default warehouse if none exists
    if (warehouses.length === 0) {
      const defaultWarehouse = await prisma.warehouse.create({
        data: {
          factoryId,
          name: "المستودع الرئيسي",
          location: "مقر المصنع",
          type: "RAW_MATERIALS",
        },
        include: {
          _count: { select: { items: true } },
        },
      });
      warehouses.push(defaultWarehouse);
    }

    const totalValuation = items.reduce((s, i) => s + Number(i.totalValuation || Number(i.currentStock) * Number(i.unitCost)), 0);
    const lowStockItems = items.filter((i) => i.currentStock <= i.minimumStock);

    return NextResponse.json({
      items,
      warehouses,
      movements,
      stats: {
        totalItemsCount: items.length,
        totalValuation,
        lowStockCount: lowStockItems.length,
        warehousesCount: warehouses.length,
      },
    });
  } catch (error) {
    console.error("GET /api/factory/inventory error:", error);
    return NextResponse.json({ error: "فشل تحميل بيانات المخازن والخامات" }, { status: 500 });
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
    const { action } = body;

    // Action A: Create new Inventory Item
    if (action === "CREATE_ITEM") {
      const {
        warehouseId,
        name,
        sku,
        batchNumber,
        category,
        unit,
        initialStock,
        minimumStock,
        unitCost,
      } = body;

      if (!warehouseId || !name || !category || !unit) {
        return NextResponse.json({ error: "المستودع، الاسم، التصنيف ووحدة القياس حقول مطلوبة" }, { status: 400 });
      }

      // Tenant isolation: verify warehouse belongs to this factory
      const warehouse = await prisma.warehouse.findFirst({
        where: { id: warehouseId, factoryId },
      });
      if (!warehouse) {
        return NextResponse.json({ error: "المستودع المحدد غير موجود أو غير تابع لمصنعك" }, { status: 404 });
      }
      const initStock = parseFloat(String(initialStock || 0));
      const minStock = parseFloat(String(minimumStock || 10));
      const uCost = parseFloat(String(unitCost || 0));

      const item = await prisma.$transaction(async (tx) => {
        const created = await tx.inventoryItem.create({
          data: {
            factoryId,
            warehouseId,
            name,
            sku: sku || null,
            batchNumber: batchNumber || null,
            category,
            unit,
            currentStock: initStock,
            minimumStock: minStock,
            unitCost: uCost,
            totalValuation: initStock * uCost,
          },
        });

        if (initStock > 0) {
          await tx.stockMovement.create({
            data: {
              factoryId,
              inventoryItemId: created.id,
              movementType: "PURCHASE_IN",
              quantity: initStock,
              previousStock: 0,
              newStock: initStock,
              unitCost: uCost,
              toWarehouseId: warehouseId,
              notes: "رصيد افتتاحي عند إضافة الصنف",
            },
          });
        }

        return created;
      });

      return NextResponse.json({ success: true, item });
    }

    // Action B: Record Stock Movement (Immutable Audit Ledger)
    if (action === "STOCK_MOVEMENT") {
      const {
        inventoryItemId,
        movementType, // PURCHASE_IN, PRODUCTION_ISSUE, PRODUCTION_RETURN, ADJUSTMENT_IN, ADJUSTMENT_OUT, TRANSFER
        quantity,
        targetWarehouseId,
        referenceOrderNumber,
        notes,
      } = body;

      const qty = parseFloat(String(quantity));
      if (!inventoryItemId || !movementType || isNaN(qty) || qty <= 0) {
        return NextResponse.json({ error: "الصنف، نوع الحركة والكمية الموجبة مطلوبة" }, { status: 400 });
      }

      const item = await prisma.inventoryItem.findFirst({
        where: { id: inventoryItemId, factoryId },
      });
      if (!item) {
        return NextResponse.json({ error: "الصنف غير موجود أو غير تابع لمصنعك" }, { status: 404 });
      }
      // Tenant isolation for transfer destination
      if (targetWarehouseId) {
        const targetWh = await prisma.warehouse.findFirst({
          where: { id: targetWarehouseId, factoryId },
        });
        if (!targetWh) {
          return NextResponse.json({ error: "المستودع المحول إليه غير موجود أو غير تابع لمصنعك" }, { status: 404 });
        }
      }

      const result = await prisma.$transaction(async (tx) => {
        // Concurrency-safe: Re-read fresh item within transaction
        const freshItem = await tx.inventoryItem.findFirst({
          where: { id: inventoryItemId, factoryId },
        });
        if (!freshItem) throw new Error("الصنف غير موجود بالمخزن");

        const prevStock = freshItem.currentStock;
        let newStock = prevStock;

        const isAddition =
          movementType === "PURCHASE_IN" ||
          movementType === "PRODUCTION_RETURN" ||
          movementType === "ADJUSTMENT_IN";

        if (isAddition) {
          newStock = prevStock + qty;
        } else {
          newStock = prevStock - qty;
          if (newStock < 0) {
            throw new Error(`لا يمكن صرف كمية (${qty}) تفوق الرصيد الحالي المتوفر بالمخزن (${prevStock} ${freshItem.unit})`);
          }
        }

        // 1. Update item stock and valuation
        await tx.inventoryItem.update({
          where: { id: inventoryItemId },
          data: {
            currentStock: newStock,
            totalValuation: newStock * freshItem.unitCost,
          },
        });

        // 2. Create immutable stock movement record
        const m = await tx.stockMovement.create({
          data: {
            factoryId,
            inventoryItemId,
            movementType,
            quantity: qty,
            previousStock: prevStock,
            newStock,
            unitCost: item.unitCost,
            toWarehouseId: targetWarehouseId || (isAddition ? item.warehouseId : null),
            fromWarehouseId: isAddition ? null : item.warehouseId,
            referenceOrderNumber: referenceOrderNumber || null,
            notes: notes || null,
          },
        });
        return { movement: m, newStock };
      });

      return NextResponse.json({ success: true, movement: result.movement, newStock: result.newStock });
    }

    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/factory/inventory error:", error);
    return NextResponse.json({ error: "فشل تنفيذ العملية على المخزون" }, { status: 500 });
  }
}
