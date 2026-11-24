import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentUser();

    if (!session) {
      return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            buyerProfile: { select: { companyName: true, governorate: true } },
          },
        },
        factory: {
          select: {
            id: true,
            userId: true,
            nameAr: true,
            slug: true,
            phone: true,
            whatsapp: true,
            address: true,
            city: true,
            governorate: true,
            rating: true,
          },
        },
        rfq: {
          select: {
            id: true,
            titleAr: true,
            productType: true,
            fabricDetails: true,
            gsm: true,
            colors: true,
            printingEmbroidery: true,
            sizeBreakdowns: true,
          },
        },
        product: true,
        milestones: { orderBy: { step: "asc" } },
        reviews: {
          include: {
            author: { select: { name: true } },
          },
        },
        conversation: { select: { id: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    const isBuyer = session.id === order.buyerId;
    const isFactory = Boolean(order.factory && session.id === order.factory.userId);
    const isAdmin = session.role === "ADMIN";

    if (!isBuyer && !isFactory && !isAdmin) {
      return NextResponse.json({ error: "غير مصرح لك بمعاينة هذا الطلب" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        isBuyer,
        isFactory,
        isAdmin,
        // Since quote is accepted and order exists, contact information is fully unmasked
        canViewContact: true,
      },
    });
  } catch (error) {
    console.error("Fetch order detail error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحميل بيانات الطلب" },
      { status: 500 }
    );
  }
}
