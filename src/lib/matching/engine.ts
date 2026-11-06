import { prisma } from "@/lib/db/prisma";

export interface FactoryMatchResult {
  factoryId: string;
  factoryName: string;
  userId: string;
  score: number;
  matchReasons: string[];
}

export async function matchFactoriesForRfq(rfq: {
  id: string;
  productType: string;
  fabricDetails: string;
  totalQuantity: number;
  targetGovernorate?: string | null;
}): Promise<FactoryMatchResult[]> {
  const verifiedFactories = await prisma.factoryProfile.findMany({
    where: { verificationStatus: "VERIFIED" },
    include: { user: true },
  });

  const matches: FactoryMatchResult[] = [];

  for (const factory of verifiedFactories) {
    let score = 0;
    const matchReasons: string[] = [];

    const specialties = (JSON.parse(factory.specialties || "[]") as string[]).map((s) =>
      s.toLowerCase()
    );
    const fabrics = (JSON.parse(factory.fabrics || "[]") as string[]).map((f) =>
      f.toLowerCase()
    );

    const reqProduct = rfq.productType.toLowerCase();
    const reqFabric = rfq.fabricDetails.toLowerCase();

    // 1. Specialty Match (up to 40 pts)
    const isSpecialtyMatch = specialties.some(
      (spec) =>
        spec.includes(reqProduct) ||
        reqProduct.includes(spec) ||
        (reqProduct.includes("تيشيرت") && spec.includes("تيشيرت")) ||
        (reqProduct.includes("بولو") && spec.includes("بولو")) ||
        (reqProduct.includes("هودي") && spec.includes("هودي")) ||
        (reqProduct.includes("شورت") && spec.includes("بانتس")) ||
        (reqProduct.includes("شراب") && spec.includes("شراب")) ||
        (reqProduct.includes("جورب") && spec.includes("جوارب"))
    );

    if (isSpecialtyMatch) {
      score += 40;
      matchReasons.push("مطابقة التخصص والمنتج");
    } else {
      score += 15; // General textile capability baseline
    }

    // 2. Fabric Match (up to 30 pts)
    const isFabricMatch = fabrics.some(
      (fab) =>
        fab.includes(reqFabric) ||
        reqFabric.includes(fab) ||
        (reqFabric.includes("قطن") && fab.includes("قطن")) ||
        (reqFabric.includes("ميلتون") && fab.includes("ميلتون")) ||
        (reqFabric.includes("بيكيه") && fab.includes("بيكيه"))
    );

    if (isFabricMatch) {
      score += 30;
      matchReasons.push("خبرة في نوع الخامة المطلوبة");
    } else {
      score += 10;
    }

    // 3. Capacity & MOQ Match (up to 15 pts)
    if (factory.monthlyCapacity >= rfq.totalQuantity) {
      score += 15;
      matchReasons.push("الطاقة الاستيعابية ملائمة للكمية");
    }

    // 4. Location Match (up to 15 pts)
    if (
      rfq.targetGovernorate &&
      (factory.governorate.includes(rfq.targetGovernorate) ||
        rfq.targetGovernorate.includes(factory.governorate))
    ) {
      score += 15;
      matchReasons.push(`المصنع في ${factory.governorate}`);
    }

    if (score >= 50) {
      matches.push({
        factoryId: factory.id,
        factoryName: factory.nameAr,
        userId: factory.userId,
        score,
        matchReasons,
      });
    }
  }

  // Sort highest score first
  matches.sort((a, b) => b.score - a.score);

  // Send notifications to matched factories
  for (const match of matches) {
    await prisma.notification.create({
      data: {
        userId: match.userId,
        titleAr: "🎯 طلب تصنيع (RFQ) جديد يطابق تخصص مصنعك!",
        bodyAr: `تم نشر طلب جديد: "${rfq.productType}" بكمية ${rfq.totalQuantity} قطعة. نسبة التطابق مع مصنعك ${match.score}%. بادر بتقديم عرض سعر مناسب.`,
        type: "RFQ_MATCH",
        link: `/rfqs/${rfq.id}`,
      },
    });
  }

  return matches;
}
