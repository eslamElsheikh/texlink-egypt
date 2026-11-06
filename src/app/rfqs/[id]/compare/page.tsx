"use client";

import React, { useEffect, useState, use } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Scale,
  Star,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  DollarSign,
  Calendar,
  AlertCircle,
  Truck,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface FactoryInfo {
  id: string;
  nameAr: string;
  slug: string;
  governorate: string;
  rating: number;
  reviewCount: number;
  logoUrl?: string;
}

interface QuoteItem {
  id: string;
  unitPrice: number;
  totalAmount: number;
  leadTimeDays: number;
  samplePrice?: number | null;
  sampleLeadTimeDays?: number | null;
  minQuantity: number;
  paymentTermsAr: string;
  notesAr?: string | null;
  status: string;
  factory: FactoryInfo;
}

interface RfqInfo {
  id: string;
  titleAr: string;
  totalQuantity: number;
  productType: string;
  fabricDetails: string;
  deadlineDays: number;
  status: string;
  acceptedQuoteId?: string | null;
  quotes: QuoteItem[];
}

export default function CompareQuotesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [rfq, setRfq] = useState<RfqInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acceptingQuoteId, setAcceptingQuoteId] = useState<string | null>(null);

  useEffect(() => {
    fetchRfq();
  }, [id]);

  const fetchRfq = async () => {
    try {
      const res = await fetch(`/api/rfqs/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "الطلب غير موجود");
      setRfq(json.rfq);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل جلب البيانات";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptQuote = async (quote: QuoteItem) => {
    const confirmed = confirm(
      `هل تؤكد قبول عرض "${quote.factory.nameAr}" بسعر ${quote.unitPrice} ج.م للقطعة (إجمالي ${quote.totalAmount.toLocaleString()} ج.م)؟\n\nسيتم إنشاء أمر تصنيع رسمي وفتح أرقام التواصل والواتساب المباشر.`
    );
    if (!confirmed) return;

    setAcceptingQuoteId(quote.id);
    try {
      const res = await fetch(`/api/rfqs/${id}/quotes/${quote.id}/accept`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل قبول العرض");

      // Redirect to the newly created Order page
      router.push(`/orders/${json.order.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء قبول العرض";
      alert(msg);
      setAcceptingQuoteId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <TopBar />
        <Header />
        <div className="flex-1 py-32 text-center text-slate-400">
          <div className="w-10 h-10 border-4 border-[#542cb7] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">جاري إعداد جدول مقارنة العروض...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !rfq) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <TopBar />
        <Header />
        <div className="flex-1 max-w-lg mx-auto py-24 text-center px-4">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">تعذر فتح المقارنة</h2>
          <p className="text-slate-500 text-sm mb-6">{error || "الطلب غير متوفر."}</p>
          <Link
            href="/rfqs"
            className="bg-[#542cb7] text-white px-6 py-2.5 rounded-xl text-sm font-semibold"
          >
            العودة للطلبات
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const quotes = rfq.quotes || [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopBar />
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {/* Breadcrumb & Navigation */}
        <div className="mb-4">
          <Link
            href={`/rfqs/${rfq.id}`}
            className="text-xs font-semibold text-slate-500 hover:text-[#542cb7] flex items-center gap-1 transition-colors w-fit"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة لصفحة تفاصيل الطلب</span>
          </Link>
        </div>

        {/* Title & Request Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold mb-2">
              <Scale className="w-4 h-4 text-[#542cb7]" />
              <span>مقارنة عروض الأسعار المقدمة</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              {rfq.titleAr}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              الكمية المطلوبة: <span className="font-bold text-slate-800">{rfq.totalQuantity.toLocaleString()} قطعة</span> •{" "}
              الخامة: <span className="font-bold text-slate-800">{rfq.fabricDetails}</span> •{" "}
              عدد العروض المستلمة: <span className="font-bold text-purple-700">{quotes.length} عروض</span>
            </p>
          </div>

          {rfq.status === "QUOTE_ACCEPTED" && (
            <div className="bg-emerald-100 text-emerald-900 text-xs px-4 py-2 rounded-xl flex items-center gap-2 font-bold shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>تم اعتماد عرض السعر مسبقاً والطلب جاري تشغيله</span>
            </div>
          )}
        </div>

        {/* Comparison Table / Grid */}
        {quotes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <Scale className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">لم تصل أي عروض أسعار حتى الآن</h3>
            <p className="text-slate-500 text-sm mt-1">
              تم إشعار المصانع المطابقة وبمجرد تقديم أول عرض سيظهر هنا للمقارنة.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="min-w-[800px] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-800 border-b border-slate-200 text-xs">
                    <th className="p-4 w-44 font-extrabold bg-slate-200/60">وجه المقارنة</th>
                    {quotes.map((q) => (
                      <th key={q.id} className="p-4 font-bold text-center border-r border-slate-200">
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="font-extrabold text-sm text-slate-900 line-clamp-1">
                            {q.factory.nameAr}
                          </span>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              {q.factory.rating.toFixed(1)}
                            </span>
                            <span>•</span>
                            <span>{q.factory.governorate}</span>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {/* Row: Unit Price */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-4 font-bold bg-slate-50 text-slate-900">سعر القطعة</td>
                    {quotes.map((q) => (
                      <td key={q.id} className="p-4 text-center border-r border-slate-100">
                        <span className="text-base font-black text-[#542cb7]">
                          {q.unitPrice} ج.م
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Row: Total Order Amount */}
                  <tr className="hover:bg-slate-50 bg-purple-50/20">
                    <td className="p-4 font-bold bg-slate-50 text-slate-900">إجمالي الطلبية بالكامل</td>
                    {quotes.map((q) => (
                      <td key={q.id} className="p-4 text-center border-r border-slate-100">
                        <span className="text-base font-black text-slate-900">
                          {q.totalAmount.toLocaleString()} ج.م
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Row: Production Lead Time */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-4 font-bold bg-slate-50 text-slate-900">مدة الإنتاج والتسليم</td>
                    {quotes.map((q) => (
                      <td key={q.id} className="p-4 text-center border-r border-slate-100 font-semibold text-slate-800">
                        {q.leadTimeDays} يوم عمل
                      </td>
                    ))}
                  </tr>

                  {/* Row: Sample Cost & Lead Time */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-4 font-bold bg-slate-50 text-slate-900">عينة ما قبل الإنتاج</td>
                    {quotes.map((q) => (
                      <td key={q.id} className="p-4 text-center border-r border-slate-100">
                        {q.samplePrice && q.samplePrice > 0 ? (
                          <span>
                            {q.samplePrice} ج.م (خلال {q.sampleLeadTimeDays || 3} أيام)
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-bold">مجانية مع الطلبية</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Row: Minimum Order Quantity */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-4 font-bold bg-slate-50 text-slate-900">الحد الأدنى للطلب (MOQ)</td>
                    {quotes.map((q) => (
                      <td key={q.id} className="p-4 text-center border-r border-slate-100 font-medium">
                        {q.minQuantity} قطعة
                      </td>
                    ))}
                  </tr>

                  {/* Row: Payment Terms */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-4 font-bold bg-slate-50 text-slate-900">شروط الدفع المتفق عليها</td>
                    {quotes.map((q) => (
                      <td key={q.id} className="p-4 text-center border-r border-slate-100 text-slate-600 px-6">
                        {q.paymentTermsAr}
                      </td>
                    ))}
                  </tr>

                  {/* Row: Factory Notes */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-4 font-bold bg-slate-50 text-slate-900">ملاحظات وضمانات المصنع</td>
                    {quotes.map((q) => (
                      <td key={q.id} className="p-4 text-center border-r border-slate-100 text-slate-500 italic px-6">
                        {q.notesAr || "لا توجد ملاحظات إضافية"}
                      </td>
                    ))}
                  </tr>

                  {/* Action Row */}
                  <tr className="bg-slate-50">
                    <td className="p-4 font-bold bg-slate-100 text-slate-900">قرار المشتري</td>
                    {quotes.map((q) => {
                      const isAccepted = q.status === "ACCEPTED";
                      const isRejected = q.status === "REJECTED";

                      return (
                        <td key={q.id} className="p-4 text-center border-r border-slate-200">
                          {isAccepted ? (
                            <span className="bg-emerald-600 text-white font-bold text-xs py-2 px-5 rounded-xl inline-flex items-center gap-1.5 shadow-sm">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>العرض المعتمد</span>
                            </span>
                          ) : isRejected ? (
                            <span className="text-slate-400 text-xs italic">مرفوض</span>
                          ) : (
                            <button
                              onClick={() => handleAcceptQuote(q)}
                              disabled={acceptingQuoteId !== null || rfq.status !== "OPEN"}
                              className="bg-[#059669] hover:bg-[#047857] disabled:opacity-50 text-white font-bold text-xs py-2.5 px-6 rounded-xl inline-flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>
                                {acceptingQuoteId === q.id
                                  ? "جاري الاعتماد..."
                                  : "قبول هذا العرض وبدء التصنيع"}
                              </span>
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
