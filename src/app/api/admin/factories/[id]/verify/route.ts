import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { z } from "zod";

const verifySchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED"]),
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

    const { status, reason } = parsed.data;

    const factory = await prisma.factoryProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!factory) {
      return NextResponse.json({ error: "المصنع غير موجود" }, { status: 404 });
    }

    const isVerified = status === "VERIFIED";

    const updated = await prisma.factoryProfile.update({
      where: { id },
      data: {
        verificationStatus: status,
        rejectionReason: isVerified ? null : reason || "المستندات المقدمة غير مطابقة للشروط",
        verifiedAt: isVerified ? new Date() : null,
      },
    });

    if (isVerified) {
      await prisma.factoryDocument.updateMany({
        where: { factoryId: id },
        data: { status: "APPROVED" },
      });
    }

    // Record audit log
    await prisma.auditLog.create({
      data: {
        adminId: session.id,
        action: isVerified ? "VERIFY_FACTORY" : "REJECT_FACTORY",
        targetType: "FACTORY",
        targetId: id,
        details: JSON.stringify({
          factoryName: factory.nameAr,
          decision: status,
          reason,
        }),
      },
    });

    // Notify factory owner
    await prisma.notification.create({
      data: {
        userId: factory.userId,
        titleAr: isVerified
          ? "🎉 تهانينا! تم اعتماد وتوثيق مصنعك رسمياً"
          : "تحديث بخصوص طلب توثيق مصنعك",
        bodyAr: isVerified
          ? `تم التحقق من مستندات مصنع "${factory.nameAr}" واكتسب شارة التوثيق الرسمية. يمكنك الآن استقبال طلبات عروض الأسعار والظهور في قائمة المصانع المعتمدة.`
          : `تم رفض طلب التوثيق للسبب التالي: ${reason || "مستندات غير مكتملة"}. يمكنك تعديل بياناتك وإعادة تقديم الطلب.`,
        type: "FACTORY_VERIFICATION",
        link: `/factories/${factory.slug}`,
      },
    });

    return NextResponse.json({
      success: true,
      factory: {
        id: updated.id,
        status: updated.verificationStatus,
      },
    });
  } catch (error) {
    console.error("Admin verify factory error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء معالجة طلب التحقق" },
      { status: 500 }
    );
  }
}
