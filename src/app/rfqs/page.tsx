"use client";

import React, { useEffect, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ALL_GOVERNORATE_NAMES_AR } from "@/config/locations";
import {
  FileText,
  Search,
  MapPin,
  Clock,
  ArrowLeft,
  PlusCircle,
  Tag,
  CheckCircle2,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface RfqItem {
  id: string;
  titleAr: string;
  productType: string;
  totalQuantity: number;
  fabricDetails: string;
  targetBudgetPerPiece?: number | null;
  targetGovernorate?: string | null;
  deadlineDays: number;
  status: string;
  createdAt: string;
  quoteCount: number;
}

export default function RfqsPage() {
  const [rfqs, setRfqs] = useState<RfqItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [q, setQ] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [status, setStatus] = useState("OPEN");

  const governorates = ["الكل", ...ALL_GOVERNORATE_NAMES_AR];

  useEffect(() => {
    fetchRfqs();
  }, [governorate, status]);

  const fetchRfqs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (governorate && governorate !== "الكل") params.set("governorate", governorate);
      if (status && status !== "ALL") params.set("status", status);

      const res = await fetch(`/api/rfqs?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setRfqs(json.rfqs);
      }
    } catch (err) {
      console.error("Fetch RFQs error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRfqs();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopBar />
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {/* Title & CTA Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/" className="hover:text-purple-600">
                الرئيسية
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-semibold">طلبات الشراء (RFQ)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#0b1320]">
              بورصة طلبات التصنيع وعروض الأسعار (RFQ)
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              تصفح طلبات الشراء الحية من كبار التجار وأصحاب البراندات وقدم عرض سعر مصنعك مباشرة.
            </p>
          </div>

          <Link
            href="/rfqs/new"
            className="inline-flex items-center gap-2 bg-[#542cb7] hover:bg-[#45209c] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>انشر طلب تصنيع جديد</span>
          </Link>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-8 space-y-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="ابحث عن مواصفات طلب: تيشيرت، ميلتون، هودي، قطن..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#542cb7]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            </div>

            <button
              type="submit"
              className="bg-[#542cb7] hover:bg-[#45209c] text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0"
            >
              بحث
            </button>
          </form>

          {/* Filter options */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">المحافظة:</span>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
                >
                  {governorates.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">الحالة:</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
                >
                  <option value="OPEN">مفتوح لتلقي العروض</option>
                  <option value="QUOTE_ACCEPTED">تم قبول عرض</option>
                  <option value="ALL">جميع الحالات</option>
                </select>
              </div>
            </div>

            <div className="text-slate-500 font-medium">
              إجمالي النتائج: <span className="font-bold text-slate-800">{rfqs.length}</span> طلب
            </div>
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-[#542cb7] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm">جاري تحميل طلبات الشراء...</p>
          </div>
        ) : rfqs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">لا توجد طلبات مطابقة للبحث</h3>
            <p className="text-slate-500 text-sm mt-1">جرب تغيير معايير البحث أو تصفح كافة الطلبات المفتوحة.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rfqs.map((rfq) => {
              const isOpen = rfq.status === "OPEN";

              return (
                <div
                  key={rfq.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header tags */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          isOpen
                            ? "bg-purple-100 text-[#542cb7]"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {isOpen ? "مفتوح للعروض" : "تم التعاقد"}
                      </span>

                      {rfq.targetGovernorate && (
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-purple-600" />
                          <span>{rfq.targetGovernorate}</span>
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#542cb7] transition-colors leading-snug">
                      {rfq.titleAr}
                    </h3>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px]">الكمية المطلوبة:</span>
                        <span className="font-bold text-slate-900">{rfq.totalQuantity.toLocaleString()} قطعة</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">نوع الخامة:</span>
                        <span className="font-bold text-slate-900 truncate block">{rfq.fabricDetails}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">المهلة المطلوبة:</span>
                        <span className="font-bold text-slate-900">{rfq.deadlineDays} يوم</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">الميزانية التقديرية:</span>
                        <span className="font-bold text-emerald-600">
                          {rfq.targetBudgetPerPiece ? `${rfq.targetBudgetPerPiece} ج.م / قطعة` : "حسب العرض"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer & CTA */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">
                      العروض المقدمة: <strong className="text-purple-700">{rfq.quoteCount}</strong>
                    </span>

                    <Link
                      href={`/rfqs/${rfq.id}`}
                      className="bg-purple-50 hover:bg-[#542cb7] text-[#542cb7] hover:text-white text-xs font-bold py-2 px-4 rounded-xl inline-flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <span>تفاصيل الطلب وتقديم عرض</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
