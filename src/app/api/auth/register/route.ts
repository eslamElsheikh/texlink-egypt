import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { normalizeGovernorate } from "@/config/locations";
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

    const normalizedEmail = email.toLowerCase();
    const passwordHash = await hashPassword(password);
    const isFactory = accountType === "FACTORY" || accountType === "BOTH";
    const isBuyer = accountType === "BUYER" || accountType === "BOTH";
    const mainRole = accountType === "FACTORY" ? "FACTORY" : "BUYER";
    const trimmedGov = governorate?.trim() || "";
    const resolvedGov = trimmedGov ? normalizeGovernorate(trimmedGov) || trimmedGov : "";
    const resolvedCity = trimmedGov;

    const txResult = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        return { duplicate: true as const };
      }

      const newUser = await tx.user.create({
        data: {
          name,
          email: normalizedEmail,
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
                  governorate: resolvedGov,
                },
              }
            : undefined,
          factoryProfile: isFactory
            ? {
                create: {
                  nameAr: companyName || `مصنع ${name}`,
                  slug: `factory-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
                  governorate: resolvedGov,
                  city: resolvedCity,
                  address: resolvedCity,
                  phone,
                  whatsapp: phone,
                  bioAr: "",
                  establishedYear: null,
                  verificationStatus: "PENDING",
                  commercialRegStatus: "UNREGISTERED",
                  taxRegStatus: "UNREGISTERED",
                  workerCount: 1,
                  machineCount: 1,
                  minOrderQuantity: 1,
                  monthlyCapacity: null,
                  specialties: "[]",
                  machines: "[]",
                  fabrics: "[]",
                  settings: {
                    create: {
                      usageMode: "FULL_ACCESS",
                      marketplaceEnabled: true,
                      autoMatchEnabled: true,
                      wasteThresholdPct: 5.0,
                      lowStockAlertThreshold: 50,
                      workingHoursPerShift: 8.0,
                      currency: "EGP",
                      traceabilityEnabled: true,
                    },
                  },
                  warehouses: {
                    create: {
                      name: "المستودع الرئيسي",
                      location: resolvedCity,
                      type: "RAW_MATERIALS",
                    },
                  },
                },
              }
            : undefined,
        },
        include: {
          factoryProfile: true,
          buyerProfile: true,
        },
      });

      if (newUser.factoryProfile) {
        await tx.user.update({
          where: { id: newUser.id },
          data: { factoryId: newUser.factoryProfile.id },
        });
      }

      return { duplicate: false as const, newUser };
    });

    if (txResult.duplicate) {
      return NextResponse.json(
        { error: "هذا البريد الإلكتروني مسجل بالفعل" },
        { status: 400 }
      );
    }

    const { newUser } = txResult;
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
