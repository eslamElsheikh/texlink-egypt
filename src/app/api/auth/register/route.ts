import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  phone: z.string().min(10, "رقم الهاتف غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن لا تقل عن 6 أحرف"),
  accountType: z.enum(["BUYER", "FACTORY", "BOTH"]),
  companyName: z.string().optional(),
  governorate: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "بيانات غير صالحة" },
        { status: 400 }
      );
    }

    const { name, email, phone, password, accountType, companyName, governorate } =
      parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "هذا البريد الإلكتروني مسجل بالفعل" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const isFactory = accountType === "FACTORY" || accountType === "BOTH";
    const isBuyer = accountType === "BUYER" || accountType === "BOTH";
    const mainRole = accountType === "FACTORY" ? "FACTORY" : "BUYER";

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone,
        passwordHash,
        role: mainRole,
        isFactory,
        isBuyer,
        buyerProfile: isBuyer
          ? {
              create: {
                companyName: companyName || name,
                businessType: "WHOLESALER",
                governorate: governorate || "القاهرة",
              },
            }
          : undefined,
        factoryProfile: isFactory
          ? {
              create: {
                nameAr: companyName || `مصنع ${name}`,
                slug: `factory-${Date.now()}`,
                governorate: governorate || "المحلة الكبرى",
                city: "المحلة",
                address: "المنطقة الصناعية",
                phone,
                whatsapp: phone,
                bioAr: "مصنع تريكو وملابس جاهزة متخصص في الجودة العالية والإنتاج الكمي.",
                verificationStatus: "PENDING",
                specialties: JSON.stringify(["تيشيرتات", "بولو"]),
                machines: JSON.stringify(["ماكينات خياطة سنجر", "أوفرلوك"]),
                fabrics: JSON.stringify(["قطن 100%", "سينجل جيرسي"]),
              },
            }
          : undefined,
      },
      include: {
        factoryProfile: true,
        buyerProfile: true,
      },
    });

    const sessionPayload = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      phone: newUser.phone,
      role: newUser.role as "BUYER" | "FACTORY" | "ADMIN",
      isFactory: newUser.isFactory,
      isBuyer: newUser.isBuyer,
      factoryId: newUser.factoryProfile?.id ?? null,
      factorySlug: newUser.factoryProfile?.slug ?? null,
    };

    const token = await createSessionToken(sessionPayload);
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: sessionPayload,
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الحساب" },
      { status: 500 }
    );
  }
}
