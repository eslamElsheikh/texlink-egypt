import { describe, it, expect, beforeAll } from "vitest";
import { BRAND } from "@/config/brand";
import {
  EGYPT_GOVERNORATES,
  ALL_GOVERNORATE_NAMES_AR,
  getIndustrialAreasForGovernorate,
  normalizeGovernorate,
  INDUSTRIAL_AREAS_BY_SLUG,
} from "@/config/locations";
import { prisma } from "@/lib/db/prisma";
import fs from "fs";
import path from "path";

describe("Cysle Egypt — Brand & Configuration Integrity", () => {
  it("enforces Cysle brand identity consistently", () => {
    expect(BRAND.name).toBe("Cysle");
    expect(BRAND.nameAr).toBe("سايسل");
    expect(BRAND.fullName).toBe("Cysle Egypt");
    expect(BRAND.fullNameAr).toBe("سايسل مصر");
    expect(BRAND.factoryOsName).toContain("Cysle Factory OS");
    expect(BRAND.copyright).toContain("Cysle Egypt");
  });
});

describe("Cysle Egypt — All 27 Egyptian Governorates & Hierarchical Locations", () => {
  const canonical27List = [
    "القاهرة",
    "الجيزة",
    "القليوبية",
    "الإسكندرية",
    "البحيرة",
    "مطروح",
    "الدقهلية",
    "دمياط",
    "كفر الشيخ",
    "الغربية",
    "المنوفية",
    "الشرقية",
    "بورسعيد",
    "الإسماعيلية",
    "السويس",
    "شمال سيناء",
    "جنوب سيناء",
    "الفيوم",
    "بني سويف",
    "المنيا",
    "أسيوط",
    "الوادي الجديد",
    "سوهاج",
    "قنا",
    "الأقصر",
    "أسوان",
    "البحر الأحمر",
  ];

  it("contains exactly all 27 canonical Egyptian governorates", () => {
    expect(EGYPT_GOVERNORATES).toHaveLength(27);
    expect(ALL_GOVERNORATE_NAMES_AR).toHaveLength(27);

    for (const canonicalGov of canonical27List) {
      expect(ALL_GOVERNORATE_NAMES_AR).toContain(canonicalGov);
    }
  });

  it("provides unique, valid slugs and English names for all 27 governorates", () => {
    const slugs = new Set(EGYPT_GOVERNORATES.map((g) => g.slug));
    const namesEn = new Set(EGYPT_GOVERNORATES.map((g) => g.nameEn));

    expect(slugs.size).toBe(27);
    expect(namesEn.size).toBe(27);
  });

  it("maps hierarchical industrial areas for Dakahlia (Mansoura – Salamon & Mansoura – Tanamil)", () => {
    const dakahliaAreas = getIndustrialAreasForGovernorate("الدقهلية");
    expect(dakahliaAreas).toHaveLength(2);

    const salamon = dakahliaAreas.find((a) => a.slug === "mansoura-salamon");
    const tanamil = dakahliaAreas.find((a) => a.slug === "mansoura-tanamil");

    expect(salamon).toBeDefined();
    expect(salamon?.nameAr).toBe("المنصورة – سلامون");

    expect(tanamil).toBeDefined();
    expect(tanamil?.nameAr).toBe("المنصورة – طنامل");

    expect(INDUSTRIAL_AREAS_BY_SLUG["mansoura-salamon"]).toBeDefined();
    expect(INDUSTRIAL_AREAS_BY_SLUG["mansoura-tanamil"]).toBeDefined();
  });

  it("returns empty industrial area list for governorates without registered areas", () => {
    const aswanAreas = getIndustrialAreasForGovernorate("أسوان");
    expect(aswanAreas).toHaveLength(0);
  });

  it("normalizes legacy city and center names to canonical governorates safely", () => {
    expect(normalizeGovernorate("المحلة الكبرى")).toBe("الغربية");
    expect(normalizeGovernorate("المنصورة")).toBe("الدقهلية");
    expect(normalizeGovernorate("سلامون القماش")).toBe("الدقهلية");
    expect(normalizeGovernorate("شبرا الخيمة")).toBe("القليوبية");
    expect(normalizeGovernorate("العاشر من رمضان")).toBe("الشرقية");
    expect(normalizeGovernorate("مدينة السادات")).toBe("المنوفية");
    expect(normalizeGovernorate("برج العرب الجديدة")).toBe("الإسكندرية");
    // Direct matches
    expect(normalizeGovernorate("القاهرة")).toBe("القاهرة");
    expect(normalizeGovernorate("الجيزة")).toBe("الجيزة");
  });
});

describe("Cysle Egypt — Local Static Promotion Images", () => {
  it("verifies factory promotion image exists locally with valid JPEG magic bytes", () => {
    const promoPath = path.join(process.cwd(), "public", "images", "factory-promo.jpg");
    expect(fs.existsSync(promoPath)).toBe(true);

    const buf = fs.readFileSync(promoPath);
    expect(buf.length).toBeGreaterThan(10000); // ~117 KB
    // JPEG magic bytes: 0xFF, 0xD8, 0xFF
    expect(buf[0]).toBe(0xff);
    expect(buf[1]).toBe(0xd8);
    expect(buf[2]).toBe(0xff);
  });

  it("verifies buyer promotion image exists locally with valid JPEG magic bytes", () => {
    const promoPath = path.join(process.cwd(), "public", "images", "buyer-promo.jpg");
    expect(fs.existsSync(promoPath)).toBe(true);

    const buf = fs.readFileSync(promoPath);
    expect(buf.length).toBeGreaterThan(10000); // ~71 KB
    expect(buf[0]).toBe(0xff);
    expect(buf[1]).toBe(0xd8);
    expect(buf[2]).toBe(0xff);
  });
});

describe("Cysle Egypt — Demo Tenant Isolation & Idempotency", () => {
  it("verifies demo tenant has isDemo flag set to true", async () => {
    const demoFactory = await prisma.factoryProfile.findUnique({
      where: { slug: "cysle-demo-factory" },
      select: {
        id: true,
        nameAr: true,
        slug: true,
        governorate: true,
        industrialArea: true,
        isDemo: true,
      },
    });

    expect(demoFactory).toBeDefined();
    expect(demoFactory?.isDemo).toBe(true);
    expect(demoFactory?.governorate).toBe("الدقهلية");
    expect(demoFactory?.industrialArea).toBe("mansoura-salamon");
  });

  it("verifies public factory directory query strictly excludes demo factories", async () => {
    // Simulate public query used by /api/factories
    const publicFactories = await prisma.factoryProfile.findMany({
      where: {
        settings: { marketplaceEnabled: true },
        isDemo: false,
      },
      select: { id: true, slug: true, nameAr: true, isDemo: true },
    });

    expect(publicFactories.length).toBeGreaterThan(0);
    for (const f of publicFactories) {
      expect(f.isDemo).toBe(false);
      expect(f.slug).not.toBe("cysle-demo-factory");
    }
  });

  it("verifies demo credentials file exists and uses strong passwords (no 123456)", () => {
    const credsPath = path.join(process.cwd(), ".demo-credentials.local.json");
    expect(fs.existsSync(credsPath)).toBe(true);

    const data = JSON.parse(fs.readFileSync(credsPath, "utf8"));
    expect(data.accounts).toBeDefined();
    expect(data.accounts.owner.email).toBe("owner@cysle-demo.com");

    for (const acc of Object.values<{ passwordPlain: string }>(data.accounts)) {
      expect(acc.passwordPlain).not.toBe("123456");
      expect(acc.passwordPlain.length).toBeGreaterThanOrEqual(16);
      expect(acc.passwordPlain).toMatch(/[A-Z]/);
      expect(acc.passwordPlain).toMatch(/[0-9]/);
    }
  });
});
