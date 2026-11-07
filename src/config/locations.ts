/**
 * Cysle Egypt — Egyptian Governorates and Industrial Areas Catalog
 * Canonical dataset of all 27 Egyptian governorates with Arabic names, English names,
 * stable slugs, and hierarchical industrial areas.
 */

export interface IndustrialArea {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  governorateSlug: string;
  descriptionAr?: string;
}

export interface Governorate {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  industrialAreas?: IndustrialArea[];
}

export const EGYPT_GOVERNORATES: Governorate[] = [
  { id: "cairo", nameAr: "القاهرة", nameEn: "Cairo", slug: "cairo" },
  { id: "giza", nameAr: "الجيزة", nameEn: "Giza", slug: "giza" },
  { id: "qalyubia", nameAr: "القليوبية", nameEn: "Qalyubia", slug: "qalyubia" },
  { id: "alexandria", nameAr: "الإسكندرية", nameEn: "Alexandria", slug: "alexandria" },
  { id: "beheira", nameAr: "البحيرة", nameEn: "Beheira", slug: "beheira" },
  { id: "matrouh", nameAr: "مطروح", nameEn: "Matrouh", slug: "matrouh" },
  {
    id: "dakahlia",
    nameAr: "الدقهلية",
    nameEn: "Dakahlia",
    slug: "dakahlia",
    industrialAreas: [
      {
        id: "mansoura-salamon",
        nameAr: "المنصورة – سلامون",
        nameEn: "Mansoura – Salamon",
        slug: "mansoura-salamon",
        governorateSlug: "dakahlia",
        descriptionAr: "منطقة تريكو وتصنيع نسيج وملابس جاهزة في سلامون القماش، المنصورة",
      },
      {
        id: "mansoura-tanamil",
        nameAr: "المنصورة – طنامل",
        nameEn: "Mansoura – Tanamil",
        slug: "mansoura-tanamil",
        governorateSlug: "dakahlia",
        descriptionAr: "مركز صناعة وتجارة الملابس الجاهزة والتريكو في طنامل، الدقهلية",
      },
    ],
  },
  { id: "damietta", nameAr: "دمياط", nameEn: "Damietta", slug: "damietta" },
  { id: "kafr-el-sheikh", nameAr: "كفر الشيخ", nameEn: "Kafr El Sheikh", slug: "kafr-el-sheikh" },
  { id: "gharbia", nameAr: "الغربية", nameEn: "Gharbia", slug: "gharbia" },
  { id: "monufia", nameAr: "المنوفية", nameEn: "Monufia", slug: "monufia" },
  { id: "sharqia", nameAr: "الشرقية", nameEn: "Sharqia", slug: "sharqia" },
  { id: "port-said", nameAr: "بورسعيد", nameEn: "Port Said", slug: "port-said" },
  { id: "ismailia", nameAr: "الإسماعيلية", nameEn: "Ismailia", slug: "ismailia" },
  { id: "suez", nameAr: "السويس", nameEn: "Suez", slug: "suez" },
  { id: "north-sinai", nameAr: "شمال سيناء", nameEn: "North Sinai", slug: "north-sinai" },
  { id: "south-sinai", nameAr: "جنوب سيناء", nameEn: "South Sinai", slug: "south-sinai" },
  { id: "fayoum", nameAr: "الفيوم", nameEn: "Fayoum", slug: "fayoum" },
  { id: "beni-suef", nameAr: "بني سويف", nameEn: "Beni Suef", slug: "beni-suef" },
  { id: "minya", nameAr: "المنيا", nameEn: "Minya", slug: "minya" },
  { id: "asyut", nameAr: "أسيوط", nameEn: "Asyut", slug: "asyut" },
  { id: "new-valley", nameAr: "الوادي الجديد", nameEn: "New Valley", slug: "new-valley" },
  { id: "sohag", nameAr: "سوهاج", nameEn: "Sohag", slug: "sohag" },
  { id: "qena", nameAr: "قنا", nameEn: "Qena", slug: "qena" },
  { id: "luxor", nameAr: "الأقصر", nameEn: "Luxor", slug: "luxor" },
  { id: "aswan", nameAr: "أسوان", nameEn: "Aswan", slug: "aswan" },
  { id: "red-sea", nameAr: "البحر الأحمر", nameEn: "Red Sea", slug: "red-sea" },
];

/**
 * Array of all 27 governorate Arabic names for dropdowns and validation.
 */
export const ALL_GOVERNORATE_NAMES_AR: string[] = EGYPT_GOVERNORATES.map((g) => g.nameAr);

/**
 * Fast lookup map from slug or Arabic name to Governorate object.
 */
export const GOVERNORATES_BY_KEY: Record<string, Governorate> = {};
for (const gov of EGYPT_GOVERNORATES) {
  GOVERNORATES_BY_KEY[gov.slug] = gov;
  GOVERNORATES_BY_KEY[gov.nameAr] = gov;
  GOVERNORATES_BY_KEY[gov.nameEn.toLowerCase()] = gov;
}

/**
 * All platform-managed industrial areas.
 */
export const ALL_INDUSTRIAL_AREAS: IndustrialArea[] = EGYPT_GOVERNORATES.flatMap(
  (g) => g.industrialAreas || []
);

export const INDUSTRIAL_AREAS_BY_SLUG: Record<string, IndustrialArea> = {};
for (const area of ALL_INDUSTRIAL_AREAS) {
  INDUSTRIAL_AREAS_BY_SLUG[area.slug] = area;
  INDUSTRIAL_AREAS_BY_SLUG[area.nameAr] = area;
}

/**
 * Safely map legacy / free-text location strings to canonical Egyptian Governorates.
 * Handles historical entries like "المحلة الكبرى" -> "الغربية", "المنصورة" -> "الدقهلية", etc.
 */
export function normalizeGovernorate(rawLocation: string | null | undefined): string | null {
  if (!rawLocation) return null;
  const trimmed = rawLocation.trim();

  // Direct match
  if (GOVERNORATES_BY_KEY[trimmed]) {
    return GOVERNORATES_BY_KEY[trimmed].nameAr;
  }

  // Common city & industrial hub mappings
  const legacyCityMap: Record<string, string> = {
    "المحلة الكبرى": "الغربية",
    "المحلة": "الغربية",
    "طنطا": "الغربية",
    "زفتى": "الغربية",
    "سمنود": "الغربية",
    "شبرا الخيمة": "القليوبية",
    "شبرا": "القليوبية",
    "بنها": "القليوبية",
    "قليوب": "القليوبية",
    "العبور": "القليوبية",
    "العاشر من رمضان": "الشرقية",
    "الزقازيق": "الشرقية",
    "بلبيس": "الشرقية",
    "المنصورة": "الدقهلية",
    "سلامون": "الدقهلية",
    "سلامون القماش": "الدقهلية",
    "طنامل": "الدقهلية",
    "ميت غمر": "الدقهلية",
    "طلخا": "الدقهلية",
    "السادات": "المنوفية",
    "مدينة السادات": "المنوفية",
    "شبين الكوم": "المنوفية",
    "أشمون": "المنوفية",
    "برج العرب": "الإسكندرية",
    "برج العرب الجديدة": "الإسكندرية",
    "العامرية": "الإسكندرية",
    "سموحة": "الإسكندرية",
    "كفر الدوار": "البحيرة",
    "دمنهور": "البحيرة",
    "6 أكتوبر": "الجيزة",
    "السادس من أكتوبر": "الجيزة",
    "الشيخ زايد": "الجيزة",
    "حلوان": "القاهرة",
    "بدر": "القاهرة",
    "مدينة بدر": "القاهرة",
    "القاهرة الجديدة": "القاهرة",
    "الشروق": "القاهرة",
  };

  for (const [key, gov] of Object.entries(legacyCityMap)) {
    if (trimmed.includes(key)) {
      return gov;
    }
  }

  return trimmed;
}

/**
 * Returns industrial areas available for a given governorate (by name or slug).
 */
export function getIndustrialAreasForGovernorate(govNameOrSlug: string): IndustrialArea[] {
  const gov = GOVERNORATES_BY_KEY[govNameOrSlug];
  return gov?.industrialAreas || [];
}
