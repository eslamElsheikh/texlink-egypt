/**
 * CYSLE Egypt — Unified Factory Analytical Segmentation & Legal Registration Helpers
 *
 * ONE platform entity: FACTORY.
 * Analytical size segments exist solely for research, matching context, and analytics —
 * they never alter entity type, account permissions, or onboarding eligibility.
 */

export type FactorySizeSegmentKey =
  | "INDIVIDUAL"
  | "MICRO"
  | "SMALL"
  | "MEDIUM"
  | "LARGE";

export interface FactorySizeSegmentInfo {
  key: FactorySizeSegmentKey;
  labelEn: string;
  labelAr: string;
  minWorkers: number;
  maxWorkers: number | null;
}

export const FACTORY_SIZE_SEGMENTS: Record<
  FactorySizeSegmentKey,
  FactorySizeSegmentInfo
> = {
  INDIVIDUAL: {
    key: "INDIVIDUAL",
    labelEn: "Individual Factory",
    labelAr: "مصنع فردي (عامل واحد)",
    minWorkers: 1,
    maxWorkers: 1,
  },
  MICRO: {
    key: "MICRO",
    labelEn: "Micro Factory",
    labelAr: "مصنع متناهي الصغر (2–5)",
    minWorkers: 2,
    maxWorkers: 5,
  },
  SMALL: {
    key: "SMALL",
    labelEn: "Small Factory",
    labelAr: "مصنع صغير (6–20)",
    minWorkers: 6,
    maxWorkers: 20,
  },
  MEDIUM: {
    key: "MEDIUM",
    labelEn: "Medium Factory",
    labelAr: "مصنع متوسط (21–80)",
    minWorkers: 21,
    maxWorkers: 80,
  },
  LARGE: {
    key: "LARGE",
    labelEn: "Large Factory",
    labelAr: "مصنع كبير (أكثر من 80)",
    minWorkers: 81,
    maxWorkers: null,
  },
};

export function classifyFactorySizeSegment(
  workerCount?: number | null
): FactorySizeSegmentInfo {
  const workers = typeof workerCount === "number" && workerCount >= 1 ? Math.floor(workerCount) : 1;
  if (workers === 1) return FACTORY_SIZE_SEGMENTS.INDIVIDUAL;
  if (workers <= 5) return FACTORY_SIZE_SEGMENTS.MICRO;
  if (workers <= 20) return FACTORY_SIZE_SEGMENTS.SMALL;
  if (workers <= 80) return FACTORY_SIZE_SEGMENTS.MEDIUM;
  return FACTORY_SIZE_SEGMENTS.LARGE;
}

export type LegalRegistrationStatus =
  | "UNREGISTERED"
  | "PENDING"
  | "VERIFIED"
  | "REJECTED";

export function formatLegalStatusAr(status?: string | null): string {
  switch (status) {
    case "VERIFIED":
      return "موثق قانونياً";
    case "PENDING":
      return "قيد المراجعة القانونية";
    case "REJECTED":
      return "مستندات غير مكتملة";
    case "UNREGISTERED":
    default:
      return "غير مسجل قانونياً (نشاط فعلي مستقل)";
  }
}

export function formatPhysicalVerificationAr(status?: string | null): string {
  switch (status) {
    case "VERIFIED":
      return "مصنع موثق ميدانياً";
    case "REJECTED":
      return "مرفوض";
    case "PENDING":
    default:
      return "بانتظار التحقق الميداني";
  }
}
