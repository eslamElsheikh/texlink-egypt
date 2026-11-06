import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        factory: {
          select: {
            id: true,
            nameAr: true,
            slug: true,
            governorate: true,
            rating: true,
            reviewCount: true,
            logoUrl: true,
            minOrderQuantity: true,
          },
        },
        category: true,
        priceTiers: { orderBy: { minQuantity: "asc" } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        colors: JSON.parse(product.colors || "[]") as string[],
        sizes: JSON.parse(product.sizes || "[]") as string[],
        images: JSON.parse(product.images || "[]") as string[],
      },
    });
  } catch (error) {
    console.error("Fetch product detail error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحميل بيانات المنتج" },
      { status: 500 }
    );
  }
}
