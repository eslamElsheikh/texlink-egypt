import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser, createSessionToken } from "@/lib/auth/session";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن لا يقل عن حرفين"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  phone: z.string().min(10, "رقم الهاتف غير صالح"),
  avatarUrl: z.string().nullable().optional(),
});

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك" }, { status: 403 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ success: true, profile: admin });
  } catch (error) {
    console.error("Get admin profile error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحميل الملف الشخصي" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "بيانات غير صالحة" },
        { status: 400 }
      );
    }

    const { name, email, phone, avatarUrl } = parsed.data;

    // Check if email changed and is taken by another user
    const existing = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        id: { not: session.id },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "البريد الإلكتروني مستخدم بالفعل من قبل حساب آخر" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: {
        name,
        email: email.toLowerCase(),
        phone,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        isFactory: true,
        isBuyer: true,
        createdAt: true,
      },
    });

    // Update JWT session cookie so changes reflect everywhere immediately
    const sessionPayload = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      phone: updatedUser.phone,
      role: updatedUser.role as "ADMIN",
      isFactory: updatedUser.isFactory,
      isBuyer: updatedUser.isBuyer,
      factoryId: null,
      factorySlug: null,
    };

    const token = await createSessionToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      message: "تم تحديث بياناتك بنجاح",
      profile: updatedUser,
    });

    response.cookies.set("texlink_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Update admin profile error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حفظ التغييرات" },
      { status: 500 }
    );
  }
}
