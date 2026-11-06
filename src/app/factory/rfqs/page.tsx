"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { FileText, Search, Send, MapPin, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface RfqItem {
  id: string;
  titleAr: string;
  productType: string;
  totalQuantity: number;
  fabricDetails: string;
  targetBudgetPerPiece: number | null;
  targetGovernorate: string;
  deadlineDays: number;
  quoteCount: number;
  alreadyQuoted: boolean;
}

export default function FactoryRfqsPage() {
  const [rfqs, setRfqs] = useState<RfqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [selectedRfq, setSelectedRfq] = useState<RfqItem | null>(null);

  // Quote form
  const [price, setPrice] = useState(45);
  const [leadDays, setLeadDays] = useState(14);
  const [terms, setTerms] = useState("30% دفعة أولى مقدمة، 70% عند الاستلام");
  const [submitting, setSubmitting] = useState(false);

  const user = {
    id: "factory",
    name: "صاحب المصنع",
    email: "factory@texlink-egypt.com",
    role: "FACTORY" as const,
    isFactory: true,
    isBuyer: true,
  };

  useEffect(() => {
    fetchRfqs();
  }, []);

  const fetchRfqs = async () => {
    try {
      const res = await fetch("/api/factory/dashboard");
      const json = await res.json();
      if (json.success) {
        setRfqs(json.matchingRfqs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRfq) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/rfqs/${selectedRfq.id}/quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitPrice: Number(price),
          leadTimeDays: Number(leadDays),
          minQuantity: 50,
          paymentTermsAr: terms,
        }),
      });

      if (!res.ok) throw new Error("فشل إرسال العرض");

      alert("تم إرسال عرض سعرك بنجاح!");
      setSelectedRfq(null);
      fetchRfqs();
    } catch (err) {
      alert("حدث خطأ أثناء إرسال العرض");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = rfqs.filter(
    (r) =>
      r.titleAr.includes(q) ||
      r.productType.includes(q) ||
      r.fabricDetails.includes(q)
  );

  return (
    <DashboardLayout user={user} currentRole="FACTORY">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#17233F]">
            طلبات التصنيع المطابقة لقدرات مصنعك (RFQ)
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] mt-1">
            اختر الطلب المناسب لخامات وماكينات مصنعك وقدّم أفضل سعر للفوز بالصفقة.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-[#E5EAF2] shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="ابحث في الطلبات المطابقة..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl pr-9 pl-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#079B62]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        <span className="text-xs text-[#718096] font-bold">
          العدد: {filtered.length} طلب
        </span>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">جاري تحميل الطلبات...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 text-center text-xs text-slate-400 rounded-2xl border">
          لا توجد طلبات مطابقة حالياً.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="bg-white p-5 rounded-2xl border border-[#E5EAF2] hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#079B62] bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    {r.productType}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    خلال {r.deadlineDays} يوم
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {r.titleAr}
                </h3>

                <p className="text-xs text-slate-500">
                  الخامة: {r.fabricDetails}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">الكمية:</span>
                    <strong className="text-slate-900">{r.totalQuantity.toLocaleString()} قطعة</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">الميزانية المقترحة:</span>
                    <strong className="text-purple-700">
                      {r.targetBudgetPerPiece ? `${r.targetBudgetPerPiece} ج.م` : "حسب العرض"}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                {r.alreadyQuoted ? (
                  <span className="w-full bg-slate-100 text-slate-600 text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>تم تقديم عرض مسبقاً</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSelectedRfq(r)}
                    className="w-full bg-[#079B62] hover:bg-[#068453] text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>تقديم عرض سعر</span>
                  </button>
                )}

                <Link
                  href={`/rfqs/${r.id}`}
                  target="_blank"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl"
                  title="معاينة التفاصيل الكاملة"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quote Modal */}
      {selectedRfq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4 text-right">
            <h3 className="text-sm font-bold text-slate-900 border-b pb-2">
              تقديم عرض سعر لطلب: {selectedRfq.titleAr}
            </h3>

            <form onSubmit={handleQuoteSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  سعر القطعة (جنيه مصري) *
                </label>
                <input
                  type="number"
                  step={0.5}
                  min={1}
                  required
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#079B62]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  مدة التنفيذ (أيام) *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={leadDays}
                  onChange={(e) => setLeadDays(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#079B62]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  شروط الدفع *
                </label>
                <input
                  type="text"
                  required
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#079B62]"
                />
              </div>

              <div className="pt-3 border-t flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRfq(null)}
                  className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#079B62] hover:bg-[#068453] text-white px-5 py-2 rounded-xl text-xs font-bold shadow"
                >
                  {submitting ? "جاري الإرسال..." : "إرسال العرض"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
