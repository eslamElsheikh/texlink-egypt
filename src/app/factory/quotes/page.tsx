"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Clock, Search, ArrowRight, Eye, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface FactoryQuote {
  id: string;
  rfqId: string;
  rfqTitle: string;
  unitPrice: number;
  totalAmount: number;
  leadTimeDays: number;
  status: string;
  createdAt: string;
}

export default function FactoryQuotesPage() {
  const [quotes, setQuotes] = useState<FactoryQuote[]>([]);
  const [loading, setLoading] = useState(true);

  const user = {
    id: "factory",
    name: "صاحب المصنع",
    email: "factory@texlink-egypt.com",
    role: "FACTORY" as const,
    isFactory: true,
    isBuyer: true,
  };

  useEffect(() => {
    fetch("/api/factory/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.myQuotes) {
          setQuotes(data.myQuotes);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout user={user} currentRole="FACTORY">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#17233F]">
            سجل عروض الأسعار المقدمة
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] mt-1">
            تابع حالة العروض المرسلة للمشترين وتفاصيل الصفقات المعتمدة.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">جاري تحميل العروض...</div>
        ) : quotes.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            لم تقدم أي عروض أسعار بعد.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E5EAF2] text-[#718096]">
                  <th className="p-3.5 font-bold">الطلب (RFQ)</th>
                  <th className="p-3.5 font-bold">سعر القطعة</th>
                  <th className="p-3.5 font-bold">إجمالي العرض</th>
                  <th className="p-3.5 font-bold">مدة التنفيذ</th>
                  <th className="p-3.5 font-bold">تاريخ التقديم</th>
                  <th className="p-3.5 font-bold">الحالة</th>
                  <th className="p-3.5 font-bold text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F4F9]">
                {quotes.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/70">
                    <td className="p-3.5 font-bold text-[#17233F]">
                      {q.rfqTitle}
                    </td>
                    <td className="p-3.5 font-black text-[#079B62]">
                      {q.unitPrice} ج.م
                    </td>
                    <td className="p-3.5 font-black text-slate-900">
                      {q.totalAmount.toLocaleString()} ج.م
                    </td>
                    <td className="p-3.5 text-slate-600">{q.leadTimeDays} يوم</td>
                    <td className="p-3.5 text-[#718096]">
                      {new Date(q.createdAt).toLocaleDateString("ar-EG")}
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={q.status} />
                    </td>
                    <td className="p-3.5 text-center">
                      <Link
                        href={`/rfqs/${q.rfqId}`}
                        target="_blank"
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 rounded-lg inline-flex"
                        title="معاينة الطلب"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
