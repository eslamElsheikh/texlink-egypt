"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { FileText, PlusCircle, Search, Scale, Eye, ArrowRight } from "lucide-react";
import Link from "next/link";

interface BuyerRfq {
  id: string;
  titleAr: string;
  totalQuantity: number;
  productType: string;
  fabricDetails: string;
  targetBudgetPerPiece: number | null;
  deadlineDays: number;
  quoteCount: number;
  status: string;
  createdAt: string;
}

export default function BuyerRfqsPage() {
  const [rfqs, setRfqs] = useState<BuyerRfq[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

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
        if (data.latestRfqs) {
          setRfqs(data.latestRfqs);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = rfqs.filter(
    (r) =>
      r.titleAr.includes(q) ||
      r.productType.includes(q) ||
      r.fabricDetails.includes(q)
  );

  return (
    <DashboardLayout user={user} currentRole="BUYER">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#17233F]">
            إدارة طلبات التصنيع الخاصة بي (RFQ)
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] mt-1">
            تابع العروض الواردة من المصانع وقارن بين عينات الأسعار لاعتماد الأنسب.
          </p>
        </div>

        <Link
          href="/rfqs/new"
          className="bg-[#5932A8] hover:bg-[#482888] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          <span>نشر طلب تصنيع جديد</span>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-[#E5EAF2] shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="ابحث في طلباتي..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl pr-9 pl-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#5932A8]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        <span className="text-xs text-[#718096] font-bold">
          العدد: {filtered.length} طلب
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">جاري تحميل طلباتك...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            لا توجد طلبات مسجلة بعد. انقر على "نشر طلب تصنيع جديد" للبدء!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E5EAF2] text-[#718096]">
                  <th className="p-3.5 font-bold">عنوان الطلب</th>
                  <th className="p-3.5 font-bold">الموديل / الخامة</th>
                  <th className="p-3.5 font-bold">الكمية</th>
                  <th className="p-3.5 font-bold">الميزانية</th>
                  <th className="p-3.5 font-bold">العروض</th>
                  <th className="p-3.5 font-bold">الحالة</th>
                  <th className="p-3.5 font-bold text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F4F9]">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70">
                    <td className="p-3.5 font-bold text-[#17233F]">
                      {r.titleAr}
                    </td>
                    <td className="p-3.5 text-[#718096]">
                      {r.productType} ({r.fabricDetails})
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">
                      {r.totalQuantity.toLocaleString()} قطعة
                    </td>
                    <td className="p-3.5 text-purple-700 font-bold">
                      {r.targetBudgetPerPiece ? `${r.targetBudgetPerPiece} ج.م` : "حسب العرض"}
                    </td>
                    <td className="p-3.5">
                      <span className="bg-purple-50 text-[#5932A8] px-2 py-0.5 rounded-full font-bold">
                        {r.quoteCount} عروض
                      </span>
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/rfqs/${r.id}/compare`}
                          className="bg-[#5932A8] hover:bg-[#482888] text-white p-1.5 px-3 rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-sm transition-all"
                        >
                          <Scale className="w-3.5 h-3.5" />
                          <span>مقارنة العروض</span>
                        </Link>
                        <Link
                          href={`/rfqs/${r.id}`}
                          target="_blank"
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 rounded-lg inline-flex"
                          title="معاينة الطلب"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </div>
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
