import React from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { DualActionCards } from "@/components/home/DualActionCards";
import { HowItWorksDualSection } from "@/components/home/HowItWorksDualSection";
import { FeaturedFactoriesSection } from "@/components/home/FeaturedFactoriesSection";
import { LatestRfqsSection } from "@/components/home/LatestRfqsSection";
import { TrustBar } from "@/components/home/TrustBar";
import { prisma } from "@/lib/db/prisma";

export const revalidate = 60; // ISR 1 minute

interface FactoryItem {
  id: string;
  slug: string;
  nameAr: string;
  governorate: string;
  rating: number;
  specialtyText: string;
  imageUrl: string;
}

interface RfqItem {
  id: string;
  titleAr: string;
  totalQuantity: number;
  productType: string;
  fabricDetails: string;
  targetBudgetPerPiece: number | null;
  targetGovernorate: string | null;
  deadlineDays: number;
  timeAgo: string;
  status: string;
  thumbnailUrl: string;
}

function getTimeAgoString(date: Date): string {
  const diffHours = Math.max(
    1,
    Math.round((Date.now() - date.getTime()) / (1000 * 60 * 60))
  );
  if (diffHours < 2) return "منذ ساعتين";
  if (diffHours < 5) return `منذ ${diffHours} ساعات`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  const diffDays = Math.round(diffHours / 24);
  return `منذ ${diffDays} يوم`;
}

export default async function HomePage() {
  // Fetch real data from database
  let featuredFactoriesData: FactoryItem[] = [];
  let latestRfqsData: RfqItem[] = [];

  try {
    const dbFactories = await prisma.factoryProfile.findMany({
      where: {
        verificationStatus: "VERIFIED",
        settings: { marketplaceEnabled: true },
        isDemo: false,
      },
      orderBy: [{ featured: "desc" }, { rating: "desc" }],
      take: 3,
    });

    featuredFactoriesData = dbFactories.map((f) => {
      const specs = JSON.parse(f.specialties || "[]") as string[];
      return {
        id: f.id,
        slug: f.slug,
        nameAr: f.nameAr,
        governorate: f.governorate,
        rating: f.rating,
        specialtyText: specs[0] || "جميع أنواع التريكو",
        imageUrl:
          f.coverUrl ||
          "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400",
      };
    });

    const dbRfqs = await prisma.rfq.findMany({
      where: {
        status: "OPEN",
        expiresAt: { gt: new Date() },
        buyer: {
          email: { not: { contains: "qa" } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { category: true },
    });

    latestRfqsData = dbRfqs.map((r) => {
      const defaultThumbnails: Record<string, string> = {
        "تيشيرت": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200",
        "هودي": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=200",
        "جوارب": "https://images.unsplash.com/photo-1582966772680-860e372bb558?w=200",
        "default": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=200",
      };

      let thumb = defaultThumbnails["default"];
      if (r.titleAr.includes("تيشيرت")) thumb = defaultThumbnails["تيشيرت"];
      else if (r.titleAr.includes("هودي")) thumb = defaultThumbnails["هودي"];
      else if (r.titleAr.includes("شرابات") || r.titleAr.includes("جوارب"))
        thumb = defaultThumbnails["جوارب"];

      return {
        id: r.id,
        titleAr: r.titleAr,
        totalQuantity: r.totalQuantity,
        productType: r.productType,
        fabricDetails: r.fabricDetails,
        targetBudgetPerPiece: r.targetBudgetPerPiece,
        targetGovernorate: r.targetGovernorate,
        deadlineDays: r.deadlineDays,
        timeAgo: getTimeAgoString(r.createdAt),
        status: "مفتوح",
        thumbnailUrl: thumb,
      };
    });
  } catch (error) {
    console.error("Home data fetch error:", error);
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 1. Top Bar */}
      <TopBar />

      {/* 2. Main Header */}
      <Header />

      <main className="flex-1">
        {/* 3. Hero Section matching visual reference */}
        <Hero />

        {/* 4. Dual Action Cards: For Buyers & For Factories */}
        <DualActionCards />

        {/* 4.1 How TexLink Works: Dedicated Buyer and Factory Paths */}
        <HowItWorksDualSection />
        {/* 5. Featured Factories & Latest RFQs (Matching Screenshot Layout) */}
        <section className="py-6">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Right side in RTL: Featured Factories */}
            <FeaturedFactoriesSection factories={featuredFactoriesData} />

            {/* Left side in RTL: Latest RFQ Requests */}
            <LatestRfqsSection rfqs={latestRfqsData} />
          </div>
        </section>

        {/* 6. Trust Strip / Value Proposition Bar */}
        <TrustBar />
      </main>

      {/* 7. Full Footer */}
      <Footer />
    </div>
  );
}
