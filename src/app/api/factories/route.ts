import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { GOVERNORATES_BY_KEY, normalizeGovernorate } from "@/config/locations";
import { classifyFactorySizeSegment } from "@/lib/factory/classification";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    let rawGovernorate = searchParams.get("governorate") || "";
    const area = searchParams.get("area") || "";
    const specialty = searchParams.get("specialty") || "";
    const fabric = searchParams.get("fabric") || "";
    const verifiedOnly = searchParams.get("verified") === "true";
    const capacityMin = searchParams.get("capacityMin")
      ? parseInt(searchParams.get("capacityMin")!, 10)
      : undefined;
    const pageRaw = searchParams.get("page");
    const limitRaw = searchParams.get("limit");
    const page = pageRaw ? Math.max(1, parseInt(pageRaw, 10) || 1) : 1;
    const limit = limitRaw ? Math.min(100, Math.max(1, parseInt(limitRaw, 10) || 50)) : undefined;

    // Normalize governorate if slug or legacy name passed
    let governorate = rawGovernorate;
    if (governorate && GOVERNORATES_BY_KEY[governorate.toLowerCase()]) {
      governorate = GOVERNORATES_BY_KEY[governorate.toLowerCase()].nameAr;
    } else if (governorate) {
      governorate = normalizeGovernorate(governorate) || governorate;
    }

    // Public/buyer directory policy: ALWAYS exclude demo, suspended, disabled-marketplace, and unverified (PENDING/REJECTED) factories.
    // Query params (verifiedOnly, filters, pagination) can never weaken this boundary.
    const andConditions: Prisma.FactoryProfileWhereInput[] = [
      { isDemo: false },
      { accountStatus: "ACTIVE" },
      { verificationStatus: "VERIFIED" },
      { settings: { marketplaceEnabled: true } },
    ];
    if (verifiedOnly) {
      andConditions.push({ verificationStatus: "VERIFIED" });
    }

    if (governorate) {
      andConditions.push({ governorate: { contains: governorate } });
    }

    if (area) {
      andConditions.push({
        OR: [
          { industrialArea: { contains: area } },
          { address: { contains: area } },
          { city: { contains: area } },
        ],
      });
    }
    if (capacityMin && Number.isFinite(capacityMin)) {
      andConditions.push({ monthlyCapacity: { gte: capacityMin } });
    }

    if (q) {
      andConditions.push({
        OR: [
          { nameAr: { contains: q } },
          { bioAr: { contains: q } },
          { specialties: { contains: q } },
          { governorate: { contains: q } },
        ],
      });
    }

    if (specialty) {
      andConditions.push({ specialties: { contains: specialty } });
    }

    if (fabric) {
      andConditions.push({ fabrics: { contains: fabric } });
    }

    const where: Prisma.FactoryProfileWhereInput = { AND: andConditions };

    const factories = await prisma.factoryProfile.findMany({
      where,
      orderBy: [{ featured: "desc" }, { rating: "desc" }, { createdAt: "desc" }],
      skip: limit ? (page - 1) * limit : undefined,
      take: limit,
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
      industrialArea: f.industrialArea,
      bioAr: f.bioAr,
      coverUrl: f.coverUrl,
      verificationStatus: f.verificationStatus,
      commercialRegStatus: f.commercialRegStatus,
      taxRegStatus: f.taxRegStatus,
      workerCount: f.workerCount,
      machineCount: f.machineCount,
      sizeSegment: classifyFactorySizeSegment(f.workerCount),
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
