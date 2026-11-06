import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { getCurrentUser, createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { z } from "zod";

const factoryRegisterSchema = z.object({
  // Account info (if visitor)
  name: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن لا تقل عن 6 أحرف").optional(),
  phone: z.string().min(10, "رقم الهاتف غير صالح"),

  // Factory info
  factoryNameAr: z.string().min(3, "اسم المصنع مطلوب"),
  governorate: z.string().min(2, "المحافظة مطلوبة"),
  city: z.string().min(2, "المدينة أو المنطقة الصناعية مطلوبة"),
  address: z.string().min(5, "العنوان التفصيلي مطلوب"),
  whatsapp: z.string().min(10, "رقم الواتساب مطلوب"),
  bioAr: z.string().min(20, "نبذة عن المصنع (20 حرفاً على الأقل)"),
  establishedYear: z.number().int().min(1950).max(2026),
  monthlyCapacity: z.number().int().min(100),
  minOrderQuantity: z.number().int().min(10),

  // Specialties & Capabilities
  specialties: z.array(z.string()).min(1, "اختر تخصصاً واحداً على الأقل"),
  machines: z.array(z.string()).min(1, "حدد نوع الماكينات وخطوط الإنتاج"),
  fabrics: z.array(z.string()).min(1, "حدد أنواع الأقمشة"),

  // Documents
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

    let userId: string;

    if (session) {
      userId = session.id;
      // Upgrade user to factory role
      await prisma.user.update({
        where: { id: userId },
        data: {
          isFactory: true,
          role: "FACTORY",
        },
      });
    } else {
      if (!data.password) {
        return NextResponse.json(
          { error: "كلمة المرور مطلوبة لإنشاء حساب جديد" },
          { status: 400 }
        );
      }

      const existing = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      });

      if (existing) {
        return NextResponse.json(
          { error: "هذا البريد الإلكتروني مسجل بالفعل، يرجى تسجيل الدخول أولاً" },
          { status: 400 }
        );
      }

      const passwordHash = await hashPassword(data.password);
      const newUser = await prisma.user.create({
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

    // Slug generation
    const slugBase = data.factoryNameAr
      .toLowerCase()
      .replace(/[^\u0621-\u064Aa-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const slug = `${slugBase || "factory"}-${Date.now().toString().slice(-4)}`;

    const factory = await prisma.factoryProfile.create({
      data: {
        userId,
        nameAr: data.factoryNameAr,
        slug,
        governorate: data.governorate,
        city: data.city,
        address: data.address,
        phone: data.phone,
        whatsapp: data.whatsapp,
        bioAr: data.bioAr,
        establishedYear: data.establishedYear,
        monthlyCapacity: data.monthlyCapacity,
        minOrderQuantity: data.minOrderQuantity,
        specialties: JSON.stringify(data.specialties),
        machines: JSON.stringify(data.machines),
        fabrics: JSON.stringify(data.fabrics),
        verificationStatus: "PENDING",
      },
    });

    // Add documents if uploaded
    const docs = [];
    if (data.commercialRegisterUrl) {
      docs.push({
        factoryId: factory.id,
        type: "COMMERCIAL_REGISTER",
        fileUrl: data.commercialRegisterUrl,
        fileName: data.commercialRegisterName || "السجل_التجاري.pdf",
        status: "PENDING",
      });
    }

    if (data.taxCardUrl) {
      docs.push({
        factoryId: factory.id,
        type: "TAX_CARD",
        fileUrl: data.taxCardUrl,
        fileName: data.taxCardName || "البطاقة_الضريبية.pdf",
        status: "PENDING",
      });
    }

    if (data.industrialRegisterUrl) {
      docs.push({
        factoryId: factory.id,
        type: "INDUSTRIAL_REGISTER",
        fileUrl: data.industrialRegisterUrl,
        fileName: data.industrialRegisterName || "السجل_الصناعي.pdf",
        status: "PENDING",
      });
    }

    if (docs.length > 0) {
      await prisma.factoryDocument.createMany({ data: docs });
    }

    // Notify user in app
    await prisma.notification.create({
      data: {
        userId,
        titleAr: "تم استلام طلب تسجيل المصنع بنجاح",
        bodyAr: `شكراً لتسجيل ${data.factoryNameAr}. طلبك الآن قيد مراجعة وتدقيق المستندات من قبل الإدارة وسنوافيك بالرد قريباً.`,
        type: "SYSTEM",
        link: `/factories/${factory.slug}`,
      },
    });

    // Create session cookie if newly registered
    if (!session) {
      const token = await createSessionToken({
        id: userId,
        email: data.email,
        name: data.name,
        phone: data.phone,
        role: "FACTORY",
        isFactory: true,
        isBuyer: true,
        factoryId: factory.id,
        factorySlug: factory.slug,
      });
      await setSessionCookie(token);
    }

    return NextResponse.json({
      success: true,
      factory: {
        id: factory.id,
        slug: factory.slug,
        nameAr: factory.nameAr,
        status: factory.verificationStatus,
      },
    });
  } catch (error) {
    console.error("Factory registration error:", error);
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع أثناء تسجيل المصنع" },
      { status: 500 }
    );
  }
}
