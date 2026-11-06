import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { z } from "zod";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "كلمة المرور الحالية مطلوبة"),
  newPassword: z.string().min(6, "كلمة المرور الجديدة يجب أن لا تقل عن 6 أحرف"),
  confirmPassword: z.string().min(6, "تأكيد كلمة المرور مطلوب"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "كلمة المرور الجديدة وتأكيدها غير متطابقين",
  path: ["confirmPassword"],
});

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "بيانات غير صالحة" },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { id: session.id },
    });

    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    // Verify current password
    const isCurrentValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      return NextResponse.json(
        { error: "كلمة المرور الحالية غير صحيحة" },
        { status: 400 }
      );
    }

    // Hash new password
    const newHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: session.id },
      data: { passwordHash: newHash },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        adminId: session.id,
        action: "ADMIN_PASSWORD_CHANGE",
        targetType: "USER",
        targetId: session.id,
        details: JSON.stringify({ message: "تم تغيير كلمة مرور الإدارة بنجاح" }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم تغيير كلمة المرور بنجاح",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تغيير كلمة المرور" },
      { status: 500 }
    );
  }
}
