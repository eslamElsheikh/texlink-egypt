import React from "react";

export type StatusType =
  | "OPEN"
  | "QUOTE_ACCEPTED"
  | "CONFIRMED"
  | "SAMPLE_PENDING"
  | "SAMPLE_APPROVED"
  | "IN_PRODUCTION"
  | "READY_FOR_SHIPPING"
  | "SHIPPED"
  | "DELIVERED"
  | "VERIFIED"
  | "PENDING"
  | "REJECTED"
  | "CANCELLED"
  | "ACCEPTED"
  | "ACTIVE"
  | string;

interface StatusBadgeProps {
  status: StatusType;
  customLabel?: string;
  className?: string;
}

export function StatusBadge({ status, customLabel, className = "" }: StatusBadgeProps) {
  const normalized = status.toUpperCase();

  const config: Record<
    string,
    { label: string; dot: string; bg: string; text: string; border: string }
  > = {
    DELIVERED: {
      label: "مكتمل ومستلم",
      dot: "bg-emerald-500",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
    VERIFIED: {
      label: "معتمد وموثق",
      dot: "bg-emerald-500",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
    ACCEPTED: {
      label: "مقبول",
      dot: "bg-emerald-500",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
    CONFIRMED: {
      label: "طلب مؤكد",
      dot: "bg-blue-500",
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    IN_PRODUCTION: {
      label: "جاري الإنتاج",
      dot: "bg-indigo-500 animate-pulse",
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200",
    },
    SAMPLE_APPROVED: {
      label: "العينة معتمدة",
      dot: "bg-purple-500",
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
    },
    SAMPLE_PENDING: {
      label: "تجهيز العينة",
      dot: "bg-amber-500",
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
    },
    READY_FOR_SHIPPING: {
      label: "جاهز للشحن",
      dot: "bg-cyan-500",
      bg: "bg-cyan-50",
      text: "text-cyan-700",
      border: "border-cyan-200",
    },
    SHIPPED: {
      label: "تم الشحن",
      dot: "bg-sky-500",
      bg: "bg-sky-50",
      text: "text-sky-700",
      border: "border-sky-200",
    },
    OPEN: {
      label: "مفتوح للعروض",
      dot: "bg-[#5932A8]",
      bg: "bg-[#F1ECFF]",
      text: "text-[#5932A8]",
      border: "border-purple-200",
    },
    QUOTE_ACCEPTED: {
      label: "عرض مقبول",
      dot: "bg-emerald-500",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
    PENDING: {
      label: "قيد المراجعة",
      dot: "bg-amber-500",
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
    },
    REJECTED: {
      label: "مرفوض",
      dot: "bg-rose-500",
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
    },
    CANCELLED: {
      label: "ملغي",
      dot: "bg-slate-400",
      bg: "bg-slate-100",
      text: "text-slate-600",
      border: "border-slate-200",
    },
    ACTIVE: {
      label: "نشط",
      dot: "bg-emerald-500",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
  };

  const current = config[normalized] || {
    label: status,
    dot: "bg-slate-400",
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${current.bg} ${current.text} ${current.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dot}`} />
      <span>{customLabel || current.label}</span>
    </span>
  );
}
