import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { getCurrentUser, createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { z } from "zod";
import { normalizeGovernorate } from "@/config/locations";
import { extractStorageKeyFromUrl, parsePrivateStorageKey } from "@/lib/storage/keys";

const factoryRegisterSchema = z.object({
  // Subscription / Usage Mode
  usageMode: z.enum(["MANAGEMENT_ONLY", "FULL_ACCESS"]).default("FULL_ACCESS").optional(),

  // Account info (if visitor)
  name: z.string().min(2, "اسم المالك أو المسؤول مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن لا تقل عن 6 أحرف").optional(),
  phone: z.string().min(10, "رقم الهاتف غير صالح"),

  // Unified Factory info (starting from 1 person, 1 machine)
  factoryNameAr: z.string().min(2, "اسم المصنع مطلوب"),
  governorate: z.string().min(2, "المحافظة مطلوبة"),
  industrialArea: z.string().optional(),
  city: z.string().min(2, "المدينة أو المركز مطلوب"),
  address: z.string().min(3, "العنوان التفصيلي مطلوب"),
  whatsapp: z.string().min(10, "رقم الواتساب مطلوب"),
  bioAr: z.string().optional().default(""),
  establishedYear: z.number().int().min(1950).max(new Date().getFullYear()).nullable().optional(),
  workerCount: z.number().int().min(1, "عدد العاملين لا يقل عن 1"),
  machineCount: z.number().int().min(1, "عدد الماكينات لا يقل عن 1"),
  monthlyCapacity: z.number().int().min(1, "الطاقة الإنتاجية الشهرية يجب أن تكون 1 على الأقل").nullable().optional(),
  minOrderQuantity: z.number().int().min(1, "الحد الأدنى للطلب يجب أن يكون 1 على الأقل"),

  // Optional Specialties & Capabilities (do not inject placeholder values)
  specialties: z.array(z.string()).optional().default([]),
  machines: z.array(z.string()).optional().default([]),
  fabrics: z.array(z.string()).optional().default([]),

  // Optional Legal Documents (do not block Factory eligibility or verification)
  commercialRegisterUrl: z.string().optional(),
  commercialRegisterName: z.string().optional(),
  taxCardUrl: z.string().optional(),
  taxCardName: z.string().optional(),
  industrialRegisterUrl: z.string().optional(),
  industrialRegisterName: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = factoryRegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "بيانات غير صالحة" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const session = await getCurrentUser();

    if (session && (session.role === "ADMIN" || (session.role as string) === "PLATFORM_ADMIN")) {
      return NextResponse.json(
        { error: "لا يمكن تحويل حساب المشرف إلى ملف مصنع" },
        { status: 403 }
      );
    }

    // Prevent cross-tenant document key hijacking during factory registration
    const submittedUrls = [
      data.commercialRegisterUrl,
      data.taxCardUrl,
      data.industrialRegisterUrl,
    ].filter(Boolean) as string[];

    for (const docUrl of submittedUrls) {
      const storageKey = extractStorageKeyFromUrl(docUrl);
      if (storageKey && storageKey.startsWith("priv_")) {
        const parsedKey = parsePrivateStorageKey(storageKey);
        if (!session || !parsedKey || parsedKey.uploaderUserId !== session.id) {
          return NextResponse.json(
            { error: "غير مصرح لك بربط مستند خاص يخص مستخدماً آخر" },
            { status: 403 }
          );
        }
      }
    }

    if (!session && !data.password) {
      return NextResponse.json(
        { error: "كلمة المرور مطلوبة لإنشاء حساب جديد" },
        { status: 400 }
      );
    }

    const slugBase = data.factoryNameAr
      .toLowerCase()
      .replace(/[^\u0621-\u064Aa-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const slug = `${slugBase || "factory"}-${Date.now().toString().slice(-4)}`;
    const normalizedGov = normalizeGovernorate(data.governorate) || data.governorate;
    const isManagementOnly = data.usageMode === "MANAGEMENT_ONLY";
    const usageMode = data.usageMode || "FULL_ACCESS";
    const commercialRegStatus = data.commercialRegisterUrl ? "PENDING" : "UNREGISTERED";
    const taxRegStatus = data.taxCardUrl ? "PENDING" : "UNREGISTERED";

    const result = await prisma.$transaction(async (tx) => {
      let userId: string;

      if (session) {
        const existingFactory = await tx.factoryProfile.findUnique({
          where: { userId: session.id },
          select: { id: true },
        });
        if (existingFactory) {
          return { conflict: "لديك ملف مصنع مسجل بالفعل، لا يمكن تكرار التسجيل" as const };
        }
        userId = session.id;
        await tx.user.update({
          where: { id: userId },
          data: {
            isFactory: true,
            role: "FACTORY",
          },
        });
      } else {
        const existing = await tx.user.findUnique({
          where: { email: data.email.toLowerCase() },
        });
        if (existing) {
          return {
            duplicateEmail: "هذا البريد الإلكتروني مسجل بالفعل، يرجى تسجيل الدخول أولاً" as const,
          };
        }

        const passwordHash = await hashPassword(data.password!);
        const newUser = await tx.user.create({
          data: {
            name: data.name,
            email: data.email.toLowerCase(),
            phone: data.phone,
            passwordHash,
            role: "FACTORY",
            isFactory: true,
            isBuyer: true,
          },
        });
        userId = newUser.id;
      }

      const factory = await tx.factoryProfile.create({
        data: {
          userId,
          nameAr: data.factoryNameAr,
          slug,
          governorate: normalizedGov,
          industrialArea: data.industrialArea || null,
          city: data.city,
          address: data.address,
          phone: data.phone,
          whatsapp: data.whatsapp,
          bioAr: data.bioAr || "",
          establishedYear: data.establishedYear ?? null,
          workerCount: data.workerCount,
          machineCount: data.machineCount,
          monthlyCapacity: data.monthlyCapacity ?? null,
          minOrderQuantity: data.minOrderQuantity,
          specialties: JSON.stringify(data.specialties ?? []),
          machines: JSON.stringify(data.machines ?? []),
          fabrics: JSON.stringify(data.fabrics ?? []),
          accountStatus: "ACTIVE",
          verificationStatus: "PENDING",
          commercialRegStatus,
          taxRegStatus,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { factoryId: factory.id },
      });

      await tx.factorySettings.create({
        data: {
          factoryId: factory.id,
          usageMode,
          marketplaceEnabled: !isManagementOnly,
          autoMatchEnabled: !isManagementOnly,
          wasteThresholdPct: 5.0,
          lowStockAlertThreshold: 50,
          workingHoursPerShift: 8.0,
          currency: "EGP",
          traceabilityEnabled: true,
        },
      });

      await tx.warehouse.create({
        data: {
          factoryId: factory.id,
          name: "المستودع الرئيسي",
          location: data.address || data.city || "مقر المصنع",
          type: "RAW_MATERIALS",
        },
      });

      const docs = [];
      if (data.commercialRegisterUrl) {
        docs.push({
          factoryId: factory.id,
          type: "COMMERCIAL_REGISTER",
          fileUrl: data.commercialRegisterUrl,
          storageKey: extractStorageKeyFromUrl(data.commercialRegisterUrl),
          fileName: data.commercialRegisterName || "السجل_التجاري.pdf",
          status: "PENDING",
        });
      }
      if (data.taxCardUrl) {
        docs.push({
          factoryId: factory.id,
          type: "TAX_CARD",
          fileUrl: data.taxCardUrl,
          storageKey: extractStorageKeyFromUrl(data.taxCardUrl),
          fileName: data.taxCardName || "البطاقة_الضريبية.pdf",
          status: "PENDING",
        });
      }
      if (data.industrialRegisterUrl) {
        docs.push({
          factoryId: factory.id,
          type: "INDUSTRIAL_REGISTER",
          fileUrl: data.industrialRegisterUrl,
          storageKey: extractStorageKeyFromUrl(data.industrialRegisterUrl),
          fileName: data.industrialRegisterName || "السجل_الصناعي.pdf",
          status: "PENDING",
        });
      }
      if (docs.length > 0) {
        await tx.factoryDocument.createMany({ data: docs });
      }

      await tx.notification.create({
        data: {
          userId,
          titleAr: "تم استلام طلب تسجيل المصنع بنجاح",
          bodyAr: `شكراً لتسجيل مصنع ${data.factoryNameAr}. يمكنك البدء في إدارة التشغيل فوراً، وسيتم التحقق الميداني من بيانات المصنع قريباً.`,
          type: "SYSTEM",
          link: `/factories/${factory.slug}`,
        },
      });

      return { userId, factory };
    });

    if ("conflict" in result) {
      return NextResponse.json({ error: result.conflict }, { status: 409 });
    }
    if ("duplicateEmail" in result) {
      return NextResponse.json({ error: result.duplicateEmail }, { status: 400 });
    }

    const { userId, factory } = result;

    // Issue or refresh JWT session cookie immediately (covers both guest sign-up and BUYER-to-FACTORY upgrade)
    const tokenPayload = {
      id: userId,
      email: session ? session.email : data.email.toLowerCase(),
      name: session ? session.name : data.name,
      phone: session ? session.phone : data.phone,
      role: "FACTORY" as const,
      isFactory: true,
      isBuyer: session ? session.isBuyer : true,
      factoryId: factory.id,
      factorySlug: factory.slug,
    };
    const token = await createSessionToken(tokenPayload);
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: tokenPayload,
      factory: {
        id: factory.id,
        slug: factory.slug,
        nameAr: factory.nameAr,
        status: factory.verificationStatus,
        commercialRegStatus: factory.commercialRegStatus,
        taxRegStatus: factory.taxRegStatus,
        workerCount: factory.workerCount,
        machineCount: factory.machineCount,
        usageMode,
      },
      destination: "/factory/dashboard",
    });
  } catch (error) {
    console.error("Factory registration error:", error);
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع أثناء تسجيل المصنع" },
      { status: 500 }
    );
  }
}
