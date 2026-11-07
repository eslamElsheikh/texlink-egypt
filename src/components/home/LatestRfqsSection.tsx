import React from "react";
import Link from "next/link";
import { FileText, MapPin, Clock, ArrowLeft } from "lucide-react";

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

interface LatestRfqsProps {
  rfqs?: RfqItem[];
}

export function LatestRfqsSection({ rfqs = [] }: LatestRfqsProps) {
  const items = rfqs;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#542cb7]" />
          <span>أحدث طلبات الشراء (RFQ)</span>
        </h2>

        <Link
          href="/rfqs"
          className="text-xs font-semibold text-[#542cb7] hover:text-[#45209c] flex items-center gap-1 transition-colors"
        >
          <span>عرض الكل</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Rows or Empty State */}
      {items.length === 0 ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-10 h-10 bg-purple-50 text-[#542cb7] rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-slate-800 text-sm font-bold">لا توجد طلبات تصنيع مفتوحة حالياً</p>
            <p className="text-slate-500 text-xs mt-0.5">
              كن أول من ينشر طلب شراء واستقبل عروض الأسعار مباشرة من المصانع المعتمدة
            </p>
          </div>
          <Link
            href="/rfqs/new"
            className="inline-flex items-center gap-1.5 bg-[#542cb7] hover:bg-[#432194] text-white text-xs px-4 py-2 rounded-xl font-bold transition shadow-sm"
          >
            <span>انشر أول طلب تصنيع (RFQ)</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/rfqs/${item.id}`}
              className="border border-slate-100 hover:border-purple-200 rounded-xl p-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-all group"
            >
              {/* Meta & Status (Left in RTL) */}
              <div className="flex flex-col items-start gap-1.5 shrink-0">
                <span className="bg-[#ede9fe] text-[#542cb7] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  {item.status}
                </span>
                <div className="flex flex-col text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {item.timeAgo}
                  </span>
                  {item.targetGovernorate && (
                    <span className="flex items-center gap-1 font-medium text-slate-700 mt-0.5">
                      <MapPin className="w-3 h-3 text-purple-500" />
                      {item.targetGovernorate}
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Details (Center) */}
              <div className="flex-1 text-right">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#542cb7] transition-colors line-clamp-1">
                  {item.titleAr}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  <span>الموعد المطلوب: خلال {item.deadlineDays} يوم</span>
                  {item.targetBudgetPerPiece && (
                    <span> • الميزانية: {item.targetBudgetPerPiece - 10} - {item.targetBudgetPerPiece} جنيه للقطعة</span>
                  )}
                  {item.fabricDetails && !item.targetBudgetPerPiece && (
                    <span> • الخامة: {item.fabricDetails}</span>
                  )}
                </p>
              </div>

              {/* Thumbnail Image (Right in RTL) */}
              <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                <img
                  src={item.thumbnailUrl}
                  alt={item.titleAr}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
