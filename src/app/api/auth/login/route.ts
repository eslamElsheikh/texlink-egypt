import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken } from "@/lib/auth/session";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن لا تقل عن 6 أحرف"),
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateCheck = await checkRateLimit(`login_ip_${ip}`, { limit: 10, windowMs: 60 * 1000 });
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "تم تجاوز الحد المسموح به لمحاولات تسجيل الدخول. يرجى الانتظار لمدة دقيقة." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rateCheck.resetInMs / 1000)) } }
      );
    }

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "بيانات غير صالحة" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { factoryProfile: true, buyerProfile: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    let factoryId = user.factoryProfile?.id ?? user.factoryId ?? null;
    let factorySlug = user.factoryProfile?.slug ?? null;

    if (!factorySlug && factoryId) {
      const employerFactory = await prisma.factoryProfile.findUnique({
        where: { id: factoryId },
        select: { slug: true },
      });
      if (employerFactory) {
        factorySlug = employerFactory.slug;
      }
    }

    const sessionPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role as "BUYER" | "FACTORY" | "ADMIN",
      isFactory: user.isFactory,
      isBuyer: user.isBuyer,
      factoryId,
      factorySlug,
    };

    const token = await createSessionToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
    });

    // Set cookie explicitly on response object
    response.cookies.set("texlink_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع أثناء تسجيل الدخول" },
      { status: 500 }
    );
  }
}
