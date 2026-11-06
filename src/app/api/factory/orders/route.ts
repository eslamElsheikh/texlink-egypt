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

    const [b2bOrders, productionOrders] = await Promise.all([
      prisma.order.findMany({
        where: { factoryId },
        include: {
          buyer: {
            select: {
              name: true,
              phone: true,
              buyerProfile: { select: { companyName: true, governorate: true } },
            },
          },
          product: { select: { nameAr: true, fabric: true } },
          rfq: { select: { titleAr: true, productType: true } },
          milestones: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.productionOrder.findMany({
        where: { factoryId },
        select: { id: true, orderNumber: true, status: true },
      }),
    ]);

    // Check which B2B orders already have a corresponding ProductionOrder
    const formattedOrders = b2bOrders.map((ord) => {
      const matchingProdOrder = productionOrders.find(
        (po) =>
          po.orderNumber === ord.orderNumber ||
          po.orderNumber === `ORD-${ord.orderNumber}` ||
          po.orderNumber.includes(ord.orderNumber)
      );

      return {
        id: ord.id,
        orderNumber: ord.orderNumber,
        buyerName: ord.buyer.buyerProfile?.companyName || ord.buyer.name,
        buyerPhone: ord.buyer.phone,
        productName: ord.product?.nameAr || ord.rfq?.titleAr || "طلب مخصص B2B",
        fabric: ord.product?.fabric || ord.rfq?.productType || "-",
        quantity: ord.quantity,
        unitPrice: ord.unitPrice,
        totalAmount: ord.totalAmount,
        status: ord.status,
        agreedDeliveryDate: ord.agreedDeliveryDate,
        createdAt: ord.createdAt,
        isConvertedToProduction: Boolean(matchingProdOrder),
        productionOrderId: matchingProdOrder?.id || null,
        productionOrderStatus: matchingProdOrder?.status || null,
      };
    });

    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    console.error("GET /api/factory/orders error:", error);
    return NextResponse.json({ error: "فشل تحميل صفقات وطلبات السوق" }, { status: 500 });
  }
}
