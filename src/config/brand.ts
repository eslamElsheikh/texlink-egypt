/**
 * Cysle Egypt — Centralized Brand Configuration
 * Single source of truth for public branding, titles, and copy across the platform.
 */

export const BRAND = {
  name: "Cysle",
  nameAr: "سايسل",
  country: "Egypt",
  countryAr: "مصر",
  fullName: "Cysle Egypt",
  fullNameAr: "سايسل مصر",
  tagline: "المنصة الأولى لربط مصانع التريكو والملابس في مصر بالمشترين",
  description:
    "المنصة الرقمية الرائدة في جمهورية مصر العربية لربط مصانع التريكو والملابس الجاهزة والغزل والنسيج بتجار الجملة وأصحاب العلامات التجارية، وتوفير نظام تشغيل متكامل للمصانع (Factory OS).",
  domain: "cysle-egypt.com",
  supportEmail: "support@cysle-egypt.com",
  phoneDisplay: "010 1234 5678",
  phoneRaw: "+201012345678",
  whatsappNumber: "201012345678",
  whatsappDefaultMessage: "مرحباً، أود الاستفسار عن منصة سايسل مصر (Cysle Egypt)",
  copyright: `© ${new Date().getFullYear()} Cysle Egypt. صنع بكل فخر لدعم الصناعة المصرية`,
  factoryOsName: "Cysle Factory OS",
  factoryOsDescription: "نظام إدارة وتشغيل مصانع التريكو والملابس الجاهزة المصرية",
  marketplaceName: "سوق سايسل B2B",
  crmName: "Cysle CRM",
} as const;

export type BrandConfig = typeof BRAND;
