import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { z } from "zod";

const createProductSchema = z.object({
  nameAr: z.string().min(3, "اسم المنتج مطلوب"),
  descriptionAr: z.string().min(5, "الوصف مطلوب"),
  fabric: z.string().min(2, "الخامة مطلوبة"),
  gsm: z.number().optional(),
  basePrice: z.number().positive("السعر مطلوب"),
  moq: z.number().int().min(1).default(50),
  leadTimeDays: z.number().int().min(1).default(7),
  stockQuantity: z.number().int().min(1).default(100),
  categorySlug: z.string().default("t-shirts"),
  priceTiers: z.array(
    z.object({
      minQuantity: z.number().int(),
      maxQuantity: z.number().int().nullable().optional(),
      pricePerPiece: z.number(),
    })
  ).optional(),
});

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });
    }

    let factory = await prisma.factoryProfile.findUnique({
      where: { userId: session.id },
    });

    if (!factory && session.role === "ADMIN") {
      factory = await prisma.factoryProfile.findFirst();
    }

    if (!factory) {
      return NextResponse.json({ error: "لا يوجد مصنع مرتبط" }, { status: 404 });
    }

    const products = await prisma.product.findMany({
      where: { factoryId: factory.id },
      include: {
        category: true,
        priceTiers: { orderBy: { minQuantity: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      products: products.map((p) => ({
        ...p,
        colors: JSON.parse(p.colors || "[]") as string[],
        sizes: JSON.parse(p.sizes || "[]") as string[],
        images: JSON.parse(p.images || "[]") as string[],
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل جلب المنتجات" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });
    }

    let factory = await prisma.factoryProfile.findUnique({
      where: { userId: session.id },
    });

    if (!factory && session.role === "ADMIN") {
      factory = await prisma.factoryProfile.findFirst();
    }

    if (!factory) {
      return NextResponse.json({ error: "لا يوجد مصنع مرتبط" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "بيانات غير صالحة" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const category = await prisma.category.findFirst({
      where: { slug: data.categorySlug },
    });

    const categoryId = category ? category.id : (await prisma.category.findFirst())!.id;

    const newProduct = await prisma.product.create({
      data: {
        factoryId: factory.id,
        categoryId,
        nameAr: data.nameAr,
        descriptionAr: data.descriptionAr,
        fabric: data.fabric,
        gsm: data.gsm,
        basePrice: data.basePrice,
        moq: data.moq,
        leadTimeDays: data.leadTimeDays,
        stockQuantity: data.stockQuantity,
        colors: JSON.stringify(["أبيض", "أسود", "كحلي"]),
        sizes: JSON.stringify(["M", "L", "XL", "2XL"]),
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500",
        ]),
        isActive: true,
        priceTiers: data.priceTiers
          ? {
              create: data.priceTiers.map((t) => ({
                minQuantity: t.minQuantity,
                maxQuantity: t.maxQuantity ?? null,
                pricePerPiece: t.pricePerPiece,
              })),
            }
          : undefined,
      },
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل إضافة المنتج" }, { status: 500 });
  }
}
