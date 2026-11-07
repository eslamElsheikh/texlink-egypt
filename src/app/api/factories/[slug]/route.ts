import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getCurrentUser();

    const factory = await prisma.factoryProfile.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isActive: true },
          include: { priceTiers: true, category: true },
        },
        reviewsReceived: {
          include: {
            author: {
              select: { name: true, buyerProfile: { select: { companyName: true } } },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        documents: {
          select: { id: true, type: true, fileName: true, status: true },
        },
      },
    });

    if (!factory) {
      return NextResponse.json(
        { error: "المصنع المطلوب غير موجود" },
        { status: 404 }
      );
    }

    // Check if contacts should be unmasked
    let canViewContact = false;

    if (session) {
      if (session.role === "ADMIN" || session.id === factory.userId) {
        canViewContact = true;
      } else {
        const activeOrderOrAcceptedQuote = await prisma.order.findFirst({
          where: {
            buyerId: session.id,
            factoryId: factory.id,
          },
        });
        if (activeOrderOrAcceptedQuote) {
          canViewContact = true;
        }
      }
    }

    return NextResponse.json({
      success: true,
      factory: {
        id: factory.id,
        slug: factory.slug,
        nameAr: factory.nameAr,
        governorate: factory.governorate,
        industrialArea: factory.industrialArea,
        city: factory.city,
        logoUrl: factory.logoUrl,
        coverUrl: factory.coverUrl,
        verificationStatus: factory.verificationStatus,
        verifiedAt: factory.verifiedAt,
        minOrderQuantity: factory.minOrderQuantity,
        monthlyCapacity: factory.monthlyCapacity,
        establishedYear: factory.establishedYear,
        rating: factory.rating,
        reviewCount: factory.reviewCount,
        specialties: JSON.parse(factory.specialties || "[]") as string[],
        machines: JSON.parse(factory.machines || "[]") as string[],
        fabrics: JSON.parse(factory.fabrics || "[]") as string[],
        gallery: JSON.parse(factory.gallery || "[]") as string[],
        products: factory.products.map((p) => ({
          ...p,
          colors: JSON.parse(p.colors || "[]") as string[],
          sizes: JSON.parse(p.sizes || "[]") as string[],
          images: JSON.parse(p.images || "[]") as string[],
        })),
        reviews: factory.reviewsReceived,
        // Anti-bypass contact protection
        canViewContact,
        phone: canViewContact ? factory.phone : null,
        whatsapp: canViewContact ? factory.whatsapp : null,
        address: canViewContact
          ? factory.address
          : `${factory.city} (يظهر العنوان الدقيق ورقم الهاتف تلقائياً فور اعتماد عرض السعر)`,
      },
    });
  } catch (error) {
    console.error("Fetch factory detail error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحميل بيانات المصنع" },
      { status: 500 }
    );
  }
}
