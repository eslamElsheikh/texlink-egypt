import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { z } from "zod";

const legalStatusEnum = z.enum(["UNREGISTERED", "PENDING", "VERIFIED", "REJECTED"]);

const verifySchema = z.object({
  status: z.enum(["PENDING", "VERIFIED", "REJECTED"]).optional(),
  commercialRegStatus: legalStatusEnum.optional(),
  taxRegStatus: legalStatusEnum.optional(),
  reason: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentUser();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بإجراء هذه العملية" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "بيانات غير صالحة" },
        { status: 400 }
      );
    }

    const { status, commercialRegStatus, taxRegStatus, reason } = parsed.data;
    if (!status && !commercialRegStatus && !taxRegStatus) {
      return NextResponse.json(
        { error: "يجب تحديد حالة التحقق الميداني أو الحالة القانونية" },
        { status: 400 }
      );
    }

    const factory = await prisma.factoryProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!factory) {
      return NextResponse.json({ error: "المصنع غير موجود" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (status) {
      const isVerified = status === "VERIFIED";
      updateData.verificationStatus = status;
      updateData.rejectionReason =
        status === "REJECTED" ? reason || "البيانات المقدمة غير مطابقة للشروط" : null;
      updateData.verifiedAt = isVerified ? new Date() : null;
    }
    if (commercialRegStatus) {
      updateData.commercialRegStatus = commercialRegStatus;
    }
    if (taxRegStatus) {
      updateData.taxRegStatus = taxRegStatus;
    }

    const updated = await prisma.factoryProfile.update({
      where: { id },
      data: updateData,
    });

    // Update documents only when their corresponding legal status is updated
    if (commercialRegStatus === "VERIFIED" || commercialRegStatus === "REJECTED") {
      await prisma.factoryDocument.updateMany({
        where: { factoryId: id, type: "COMMERCIAL_REGISTER" },
        data: { status: commercialRegStatus === "VERIFIED" ? "APPROVED" : "REJECTED" },
      });
    }
    if (taxRegStatus === "VERIFIED" || taxRegStatus === "REJECTED") {
      await prisma.factoryDocument.updateMany({
        where: { factoryId: id, type: "TAX_CARD" },
        data: { status: taxRegStatus === "VERIFIED" ? "APPROVED" : "REJECTED" },
      });
    }

    await prisma.auditLog.create({
      data: {
        adminId: session.id,
        action:
          status === "REJECTED"
            ? "REJECT_FACTORY"
            : status === "VERIFIED"
            ? "VERIFY_FACTORY"
            : "UPDATE_FACTORY_LEGAL_STATUS",
        targetType: "FACTORY",
        targetId: id,
        details: JSON.stringify({
          factoryName: factory.nameAr,
          verificationStatus: updated.verificationStatus,
          commercialRegStatus: updated.commercialRegStatus,
          taxRegStatus: updated.taxRegStatus,
          reason,
        }),
      },
    });

    if (status === "VERIFIED" || status === "REJECTED") {
      const isVerified = status === "VERIFIED";
      await prisma.notification.create({
        data: {
          userId: factory.userId,
          titleAr: isVerified
            ? "تم التحقق من مصنعك واعتماده ميدانياً"
            : "تحديث بخصوص طلب توثيق مصنعك",
          bodyAr: isVerified
            ? `تم التحقق التشغيلي من مصنع "${factory.nameAr}" وتفعيل شارة المصنع الموثق. يمكنك الآن تقديم عروض الأسعار والظهور في السوق.`
            : `تم رفض طلب التوثيق للسبب التالي: ${reason || "بيانات غير مكتملة"}. يمكنك تعديل بياناتك وإعادة تقديم الطلب.`,
          type: "FACTORY_VERIFICATION",
          link: `/factories/${factory.slug}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      factory: {
        id: updated.id,
        status: updated.verificationStatus,
        verificationStatus: updated.verificationStatus,
        commercialRegStatus: updated.commercialRegStatus,
        taxRegStatus: updated.taxRegStatus,
      },
    });
  } catch (error) {
    console.error("Admin verify factory error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء معالجة طلب التوثيق" },
      { status: 500 }
    );
  }
}
