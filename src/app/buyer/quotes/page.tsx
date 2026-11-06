"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Scale, Star, ArrowRight, Eye, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface BuyerQuote {
  id: string;
  rfqId: string;
  rfqTitle: string;
  unitPrice: number;
  totalAmount: number;
  leadTimeDays: number;
  samplePrice: number | null;
  paymentTermsAr: string;
  factoryName: string;
  factoryRating: number;
  factoryGovernorate: string;
}

export default function BuyerQuotesPage() {
  const [quotes, setQuotes] = useState<BuyerQuote[]>([]);
  const [loading, setLoading] = useState(true);

  const user = {
    id: "buyer",
    name: "مشتري معتمد",
    email: "buyer@texlink-egypt.com",
    role: "BUYER" as const,
    isFactory: true,
    isBuyer: true,
  };

  useEffect(() => {
    fetch("/api/buyer/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.pendingQuotes) {
          setQuotes(data.pendingQuotes);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout user={user} currentRole="BUYER">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#17233F]">
            عروض الأسعار المستلمة من المصانع
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] mt-1">
            قارن بين عروض المصانع المصرية، واعتمد أفضل سعر ومدة لتأكيد التعاقد وبدء التشغيل.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">جاري تحميل عروض الأسعار...</div>
        ) : quotes.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            لا توجد عروض أسعار جديدة حالياً.
          </div>
        ) : (
          <div className="divide-y divide-[#F1F4F9]">
            {quotes.map((q) => (
              <div
                key={q.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">
                      {q.factoryName}
                    </span>
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                      {q.factoryRating}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      • {q.factoryGovernorate}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#17233F]">
                    {q.rfqTitle}
                  </h3>

                  <p className="text-xs text-[#718096]">
                    شروط الدفع المقترحة: {q.paymentTermsAr}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right md:text-left">
                    <span className="text-sm font-black text-[#5932A8] block">
                      {q.unitPrice} ج.م <span className="text-[10px] font-normal text-slate-500">/ قطعة</span>
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      الإجمالي: {q.totalAmount.toLocaleString()} ج.م (خلال {q.leadTimeDays} يوم)
                    </span>
                  </div>

                  <Link
                    href={`/rfqs/${q.rfqId}/compare`}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>مقارنة وقبول العرض</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
