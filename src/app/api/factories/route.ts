import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const governorate = searchParams.get("governorate") || "";
    const specialty = searchParams.get("specialty") || "";
    const fabric = searchParams.get("fabric") || "";
    const verifiedOnly = searchParams.get("verified") === "true";
    const capacityMin = searchParams.get("capacityMin")
      ? parseInt(searchParams.get("capacityMin")!, 10)
      : undefined;

    const where: Prisma.FactoryProfileWhereInput = {};

    if (verifiedOnly) {
      where.verificationStatus = "VERIFIED";
    }

    if (governorate) {
      where.governorate = { contains: governorate };
    }

    if (capacityMin) {
      where.monthlyCapacity = { gte: capacityMin };
    }

    if (q) {
      where.OR = [
        { nameAr: { contains: q } },
        { bioAr: { contains: q } },
        { specialties: { contains: q } },
        { governorate: { contains: q } },
      ];
    }

    if (specialty) {
      where.specialties = { contains: specialty };
    }

    if (fabric) {
      where.fabrics = { contains: fabric };
    }

    const factories = await prisma.factoryProfile.findMany({
      where,
      orderBy: [{ featured: "desc" }, { rating: "desc" }, { createdAt: "desc" }],
      include: {
        _count: {
          select: { products: true, reviewsReceived: true },
        },
      },
    });

    const parsedFactories = factories.map((f) => ({
      id: f.id,
      slug: f.slug,
      nameAr: f.nameAr,
      governorate: f.governorate,
      city: f.city,
      bioAr: f.bioAr,
      logoUrl: f.logoUrl,
      coverUrl: f.coverUrl,
      verificationStatus: f.verificationStatus,
      minOrderQuantity: f.minOrderQuantity,
      monthlyCapacity: f.monthlyCapacity,
      establishedYear: f.establishedYear,
      rating: f.rating,
      reviewCount: f.reviewCount,
      specialties: JSON.parse(f.specialties || "[]") as string[],
      machines: JSON.parse(f.machines || "[]") as string[],
      fabrics: JSON.parse(f.fabrics || "[]") as string[],
      featured: f.featured,
      productCount: f._count.products,
      // Mask contact details in directory
      phone: null,
      address: null,
      whatsapp: null,
    }));

    return NextResponse.json({
      success: true,
      count: parsedFactories.length,
      factories: parsedFactories,
    });
  } catch (error) {
    console.error("Fetch factories error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب قائمة المصانع" },
      { status: 500 }
    );
  }
}
