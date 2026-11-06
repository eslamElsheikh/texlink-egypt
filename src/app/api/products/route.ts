import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const categorySlug = searchParams.get("category") || "";
    const fabric = searchParams.get("fabric") || "";
    const factoryId = searchParams.get("factoryId") || "";

    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    if (categorySlug && categorySlug !== "ALL") {
      where.category = { slug: categorySlug };
    }

    if (fabric && fabric !== "ALL") {
      where.fabric = { contains: fabric };
    }

    if (factoryId) {
      where.factoryId = factoryId;
    }

    if (q) {
      where.OR = [
        { nameAr: { contains: q } },
        { descriptionAr: { contains: q } },
        { fabric: { contains: q } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      include: {
        factory: {
          select: {
            id: true,
            nameAr: true,
            slug: true,
            governorate: true,
            rating: true,
          },
        },
        category: true,
        priceTiers: { orderBy: { minQuantity: "asc" } },
      },
    });

    const parsed = products.map((p) => ({
      ...p,
      colors: JSON.parse(p.colors || "[]") as string[],
      sizes: JSON.parse(p.sizes || "[]") as string[],
      images: JSON.parse(p.images || "[]") as string[],
    }));

    return NextResponse.json({
      success: true,
      count: parsed.length,
      products: parsed,
    });
  } catch (error) {
    console.error("Fetch products error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب المنتجات الجاهزة" },
      { status: 500 }
    );
  }
}
