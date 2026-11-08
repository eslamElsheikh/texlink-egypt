"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  FileText,
  Plus,
  RefreshCw,
  Clock,
  DollarSign,
  Building,
  CheckCircle2,
  ExternalLink,
  Search,
} from "lucide-react";
import Link from "next/link";

interface Quotation {
  id: string;
  unitPrice: number;
  totalAmount: number;
  leadTimeDays: number;
  status: string;
  paymentTermsAr: string;
  notesAr: string | null;
  createdAt: string;
  rfq: {
    id: string;
    titleAr: string;
    productType: string;
    totalQuantity: number;
    buyer: {
      name: string;
      phone: string;
      buyerProfile?: { companyName: string } | null;
    };
  };
}

export default function CrmQuotationsPage() {
  const [quotes, setQuotes] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState({
    id: "crm-user",
    name: "إدارة المبيعات",
    email: "",
    role: "FACTORY" as const,
    isFactory: true,
    isBuyer: false,
    factorySlug: "",
  });

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const [res, meRes] = await Promise.all([
        fetch("/api/factory/dashboard"),
        fetch("/api/auth/me").catch(() => null),
      ]);
      const json = await res.json();
      if (res.ok && json.myQuotes) {
        setQuotes(json.myQuotes);
      }
      if (meRes && meRes.ok) {
        const me = await meRes.json();
        if (me.user) setUser({ ...me.user, role: "FACTORY" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const totalQuotesValue = quotes.reduce((s, q) => s + q.totalAmount, 0);
  const acceptedQuotes = quotes.filter((q) => q.status === "ACCEPTED");

  return (
    <DashboardLayout user={user} currentRole="FACTORY">
      <div className="space-y-6 pb-12 font-sans" dir="rtl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-purple-50 text-[#5932A8] rounded-xl">
                <FileText className="w-6 h-6" />
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">عروض الأسعار والمقايسات (Quotations)</h1>
            </div>
            <p className="text-gray-500 text-xs md:text-sm mt-1">
              متابعة عروض الأسعار الصادرة للعملاء والمشترين، مدد التنفيذ المقترحة، ونسب قبول الصفقات.
            </p>
          </div>

          <Link
            href="/factory/rfqs"
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#5932A8] text-white rounded-xl font-bold text-sm hover:bg-[#49278f] transition shadow-sm"
          >
            <Plus className="w-5 h-5" />
            تقديم عرض جديد لطلب RFQ
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">إجمالي عروض الأسعار المقدمة</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{quotes.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">العروض المقبولة والمحسومة</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">{acceptedQuotes.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">إجمالي قيمة العروض المقدمة</p>
            <p className="text-2xl font-black text-[#5932A8] mt-1 font-mono">
              {totalQuotesValue.toLocaleString()} ج.م
            </p>
          </div>
        </div>

        {/* Quotes List Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">سجل عروض الأسعار الرسمية</h2>
            <button
              onClick={fetchQuotes}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
              title="تحديث"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">طلب الشراء / RFQ</th>
                  <th className="py-3 px-4">العميل / المشتري</th>
                  <th className="py-3 px-4">الكمية</th>
                  <th className="py-3 px-4">سعر القطعة</th>
                  <th className="py-3 px-4">إجمالي العرض</th>
                  <th className="py-3 px-4">مدة التنفيذ</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4">المعاينة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {quotes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      لا توجد عروض أسعار مسجلة حالياً.
                    </td>
                  </tr>
                ) : (
                  quotes.map((q) => (
                    <tr key={q.id} className="hover:bg-gray-50/70 transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-900 block">{q.rfq.titleAr}</span>
                        <span className="text-[10px] text-gray-400">{q.rfq.productType}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-800">
                        {q.rfq.buyer.buyerProfile?.companyName || q.rfq.buyer.name}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-gray-800">
                        {q.rfq.totalQuantity.toLocaleString()} قطعة
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                        {q.unitPrice.toLocaleString()} ج.م
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-gray-900 text-sm">
                        {q.totalAmount.toLocaleString()} ج.م
                      </td>
                      <td className="py-3 px-4 text-gray-600">{q.leadTimeDays} يوماً</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            q.status === "ACCEPTED"
                              ? "bg-emerald-100 text-emerald-800"
                              : q.status === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {q.status === "ACCEPTED" ? "مقبول ومحسوم ✓" : q.status === "REJECTED" ? "مرفوض" : "قيد المراجعة"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/rfqs/${q.rfq.id}`}
                          className="px-2.5 py-1 bg-purple-50 text-[#5932A8] hover:bg-purple-100 border border-purple-200 rounded-lg text-[10px] font-bold flex items-center gap-1 w-fit"
                        >
                          <span>عرض الطلب بالسوق</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
