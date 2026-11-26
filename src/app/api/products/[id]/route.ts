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
            isDemo: true,
            accountStatus: true,
            verificationStatus: true,
            settings: {
              select: {
                marketplaceEnabled: true,
              },
            },
          },
        },
        category: true,
        priceTiers: { orderBy: { minQuantity: "asc" } },
      },
    });

    if (
      !product ||
      !product.isActive ||
      !product.factory ||
      product.factory.isDemo ||
      product.factory.accountStatus !== "ACTIVE" ||
      product.factory.verificationStatus !== "VERIFIED" ||
      !product.factory.settings?.marketplaceEnabled
    ) {
      return NextResponse.json({ error: "المنتج غير موجود أو غير متاح للعرض العام" }, { status: 404 });
    }

    const { isDemo: _d, accountStatus: _a, verificationStatus: _v, settings: _s, ...publicFactory } =
      product.factory;

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        factory: publicFactory,
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
