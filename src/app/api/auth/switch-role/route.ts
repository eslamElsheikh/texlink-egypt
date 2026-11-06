import { NextResponse } from "next/server";
import { getCurrentUser, createSessionToken } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const switchSchema = z.object({
  targetRole: z.enum(["BUYER", "FACTORY"]),
});

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = switchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "دور غير صالح" }, { status: 400 });
    }

    const { targetRole } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: { factoryProfile: true, buyerProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    // Verify user is permitted for this role
    if (targetRole === "FACTORY" && !user.isFactory && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "هذا الحساب غير مسجل كصاحب مصنع" },
        { status: 403 }
      );
    }

    if (targetRole === "BUYER" && !user.isBuyer && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "هذا الحساب غير مسجل كمشتري" },
        { status: 403 }
      );
    }

    const newPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: (user.role === "ADMIN" ? "ADMIN" : targetRole) as "BUYER" | "FACTORY" | "ADMIN",
      isFactory: user.isFactory,
      isBuyer: user.isBuyer,
      factoryId: user.factoryProfile?.id ?? null,
      factorySlug: user.factoryProfile?.slug ?? null,
    };

    const token = await createSessionToken(newPayload);

    const response = NextResponse.json({
      success: true,
      activeRole: targetRole,
      user: newPayload,
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
    console.error("Switch role error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تبديل وضع الحساب" },
      { status: 500 }
    );
  }
}
