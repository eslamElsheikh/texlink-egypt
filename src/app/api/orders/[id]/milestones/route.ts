import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { NotificationService } from "@/lib/notifications";
import { z } from "zod";

const updateMilestoneSchema = z.object({
  step: z.enum(["SAMPLE", "SAMPLE_APPROVAL", "PRODUCTION", "READY", "SHIPPED", "DELIVERED"]),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]),
  notes: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const session = await getCurrentUser();

    if (!session) {
      return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        factory: { include: { user: true } },
        buyer: true,
        milestones: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    const isBuyer = session.id === order.buyerId;
    const isFactory = session.id === order.factory.userId;
    const isAdmin = session.role === "ADMIN";

    if (!isBuyer && !isFactory && !isAdmin) {
      return NextResponse.json({ error: "غير مصرح لك بتعديل مراحل الطلب" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateMilestoneSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "بيانات غير صالحة" },
        { status: 400 }
      );
    }

    const { step, status, notes } = parsed.data;

    // Find milestone record
    const milestone = await prisma.orderMilestone.findFirst({
      where: { orderId, step },
    });

    if (!milestone) {
      return NextResponse.json({ error: "المرحلة غير موجودة" }, { status: 404 });
    }

    const isCompleted = status === "COMPLETED";

    const updatedMilestone = await prisma.orderMilestone.update({
      where: { id: milestone.id },
      data: {
        status,
        notes: notes ?? milestone.notes,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    // If step was completed, advance next step to IN_PROGRESS
    const stepOrder = [
      "SAMPLE",
      "SAMPLE_APPROVAL",
      "PRODUCTION",
      "READY",
      "SHIPPED",
      "DELIVERED",
    ];
    const currentIndex = stepOrder.indexOf(step);

    if (isCompleted && currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1];
      const nextMilestone = await prisma.orderMilestone.findFirst({
        where: { orderId, step: nextStep },
      });
      if (nextMilestone && nextMilestone.status === "PENDING") {
        await prisma.orderMilestone.update({
          where: { id: nextMilestone.id },
          data: { status: "IN_PROGRESS" },
        });
      }
    }

    // Map order status
    let newOrderStatus = order.status;
    if (step === "SAMPLE" && isCompleted) newOrderStatus = "SAMPLE_PENDING";
    else if (step === "SAMPLE_APPROVAL" && isCompleted) newOrderStatus = "SAMPLE_APPROVED";
    else if (step === "PRODUCTION") newOrderStatus = "IN_PRODUCTION";
    else if (step === "READY" && isCompleted) newOrderStatus = "READY_FOR_SHIPPING";
    else if (step === "SHIPPED" && isCompleted) newOrderStatus = "SHIPPED";
    else if (step === "DELIVERED" && isCompleted) newOrderStatus = "DELIVERED";

    await prisma.order.update({
      where: { id: orderId },
      data: { status: newOrderStatus },
    });

    // Notify the other party
    const notifyUser = isFactory ? order.buyer : order.factory.user;
    await NotificationService.notify({
      userId: notifyUser.id,
      recipientEmail: notifyUser.email,
      recipientPhone: notifyUser.phone,
      type: "ORDER_STATUS",
      titleAr: `تحديث في أمر التصنيع #${order.orderNumber}`,
      bodyAr: `تم تحديث مرحلة "${updatedMilestone.titleAr}" إلى: ${
        isCompleted ? "مكتملة بنجاح" : "قيد التنفيذ والتشغيل"
      }`,
      link: `/orders/${order.id}`,
      data: {
        orderNumber: order.orderNumber,
        stepTitle: updatedMilestone.titleAr,
      },
    });

    return NextResponse.json({
      success: true,
      milestone: updatedMilestone,
      orderStatus: newOrderStatus,
    });
  } catch (error) {
    console.error("Update milestone error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث المرحلة" },
      { status: 500 }
    );
  }
}
