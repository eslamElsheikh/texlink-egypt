"use client";

import React, { useEffect, useState, use } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  FileText,
  MapPin,
  Clock,
  ArrowRight,
  Send,
  CheckCircle2,
  AlertCircle,
  FileDown,
  Layers,
  Sparkles,
  Building2,
  Calendar,
  DollarSign,
  Scale,
} from "lucide-react";
import Link from "next/link";

interface SizeItem {
  id: string;
  size: string;
  color?: string | null;
  quantity: number;
}

interface AttachmentItem {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
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
  factory: {
    id: string;
    nameAr: string;
    slug: string;
    governorate: string;
    rating: number;
  };
}

interface RfqDetail {
  id: string;
  titleAr: string;
  productType: string;
  totalQuantity: number;
  fabricDetails: string;
  gsm?: number | null;
  colors?: string | null;
  printingEmbroidery?: string | null;
  targetBudgetPerPiece?: number | null;
  deadlineDays: number;
  sampleRequired: boolean;
  targetGovernorate?: string | null;
  notesAr?: string | null;
  status: string;
  createdAt: string;
  totalQuotesCount: number;
  isOwner: boolean;
  buyer: {
    name: string;
    buyerProfile?: { companyName: string; governorate: string } | null;
  };
  sizeBreakdowns: SizeItem[];
  attachments: AttachmentItem[];
  quotes: QuoteItem[];
}

export default function RfqDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [rfq, setRfq] = useState<RfqDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Factory quote form state
  const [unitPrice, setUnitPrice] = useState<number>(35);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(14);
  const [samplePrice, setSamplePrice] = useState<number>(150);
  const [sampleLeadTimeDays, setSampleLeadTimeDays] = useState<number>(3);
  const [minQuantity, setMinQuantity] = useState<number>(100);
  const [paymentTermsAr, setPaymentTermsAr] = useState("30% دفعة أولى مقدمة، 70% عند الاستلام والفحص");
  const [notesAr, setNotesAr] = useState("");
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState(false);
  const [quoteError, setQuoteError] = useState("");

  useEffect(() => {
    fetchRfq();
  }, [id]);

  const fetchRfq = async () => {
    try {
      const res = await fetch(`/api/rfqs/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "الطلب غير موجود");
      setRfq(json.rfq);
      if (json.rfq.totalQuantity) {
        setMinQuantity(Math.min(100, json.rfq.totalQuantity));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل جلب الطلب";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteError("");
    setSubmittingQuote(true);

    try {
      const res = await fetch(`/api/rfqs/${id}/quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitPrice: Number(unitPrice),
          leadTimeDays: Number(leadTimeDays),
          samplePrice: Number(samplePrice),
          sampleLeadTimeDays: Number(sampleLeadTimeDays),
          minQuantity: Number(minQuantity),
          paymentTermsAr,
          notesAr,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل إرسال عرض السعر");

      setQuoteSuccess(true);
      fetchRfq();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء إرسال العرض";
      setQuoteError(msg);
    } finally {
      setSubmittingQuote(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <TopBar />
        <Header />
        <div className="flex-1 py-32 text-center text-slate-400">
          <div className="w-10 h-10 border-4 border-[#542cb7] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">جاري تحميل تفاصيل طلب الشراء...</p>
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
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">طلب التصنيع غير موجود</h2>
          <p className="text-slate-500 text-sm mb-6">{error || "تعذر العثور على الطلب المطلوب."}</p>
          <Link
            href="/rfqs"
            className="bg-[#542cb7] text-white px-6 py-2.5 rounded-xl text-sm font-semibold"
          >
            العودة إلى بورصة الطلبات
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const calculatedTotal = (unitPrice || 0) * rfq.totalQuantity;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopBar />
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {/* Back Link */}
        <div className="mb-4">
          <Link
            href="/rfqs"
            className="text-xs font-semibold text-slate-500 hover:text-[#542cb7] flex items-center gap-1 transition-colors w-fit"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة إلى بورصة الطلبات</span>
          </Link>
        </div>

        {/* Buyer Notification Banner if has quotes */}
        {rfq.isOwner && rfq.totalQuotesCount > 0 && (
          <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white rounded-2xl p-5 mb-8 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-right">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Sparkles className="w-5 h-5 text-purple-300" />
                <h3 className="text-base font-extrabold">
                  لديك {rfq.totalQuotesCount} عروض أسعار جاهزة للمقارنة!
                </h3>
              </div>
              <p className="text-xs text-purple-100">
                قارن الأسعار، مدة التنفيذ، شروط الدفع، وعينات المصانع جنباً إلى جنب في جدول واحد واعتمد العرض الأنسب.
              </p>
            </div>

            <Link
              href={`/rfqs/${rfq.id}/compare`}
              className="bg-white hover:bg-purple-50 text-[#542cb7] font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow transition-all shrink-0 flex items-center gap-2"
            >
              <Scale className="w-4 h-4" />
              <span>جدول مقارنة العروض والقبول ←</span>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main 2 Cols: RFQ Specs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-4">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    rfq.status === "OPEN"
                      ? "bg-purple-100 text-[#542cb7]"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {rfq.status === "OPEN" ? "مفتوح لتلقي العروض" : "تم التعاقد وقبول عرض"}
                </span>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    المهلة: {rfq.deadlineDays} يوم
                  </span>
                  {rfq.targetGovernorate && (
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-purple-500" />
                      {rfq.targetGovernorate}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-snug">
                  {rfq.titleAr}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  المشتري: <span className="font-semibold text-slate-700">{rfq.buyer.buyerProfile?.companyName || rfq.buyer.name}</span>
                </p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">الكمية الإجمالية:</span>
                  <span className="font-bold text-slate-900 text-sm">{rfq.totalQuantity.toLocaleString()} قطعة</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">الميزانية التقديرية:</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    {rfq.targetBudgetPerPiece ? `${rfq.targetBudgetPerPiece} ج.م / قطعة` : "حسب العرض"}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">عينة معتمدة مسبقة:</span>
                  <span className="font-bold text-slate-900">
                    {rfq.sampleRequired ? "مطلوبة قبل الإنتاج" : "غير مطلوبة"}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 sm:col-span-2">
                  <span className="text-slate-400 block text-[10px]">مواصفات القماش والخامة:</span>
                  <span className="font-bold text-slate-900">{rfq.fabricDetails}</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">وزن القماش (GSM):</span>
                  <span className="font-bold text-slate-900">{rfq.gsm ? `${rfq.gsm} GSM` : "قياسي"}</span>
                </div>

                {rfq.colors && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 sm:col-span-3">
                    <span className="text-slate-400 block text-[10px]">الألوان المطلوبة:</span>
                    <span className="font-bold text-slate-900">{rfq.colors}</span>
                  </div>
                )}

                {rfq.printingEmbroidery && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 sm:col-span-3">
                    <span className="text-slate-400 block text-[10px]">الطباعة والتطريز:</span>
                    <span className="font-bold text-slate-900">{rfq.printingEmbroidery}</span>
                  </div>
                )}
              </div>

              {rfq.notesAr && (
                <div className="pt-3 border-t border-slate-100 text-xs">
                  <span className="font-bold text-slate-700 block mb-1">ملاحظات واشتراطات خاصة:</span>
                  <p className="text-slate-600 leading-relaxed bg-amber-50/60 p-3 rounded-xl border border-amber-100">
                    {rfq.notesAr}
                  </p>
                </div>
              )}
            </div>

            {/* Size Breakdown Table */}
            {rfq.sizeBreakdowns.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 border-b pb-3 mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#542cb7]" />
                  <span>جدول تفصيل المقاسات والكميات</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700">
                        <th className="p-3 font-bold rounded-r-lg">المقاس (Size)</th>
                        <th className="p-3 font-bold">اللون</th>
                        <th className="p-3 font-bold rounded-l-lg">الكمية المطلوبة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rfq.sizeBreakdowns.map((sb) => (
                        <tr key={sb.id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-800">{sb.size}</td>
                          <td className="p-3 text-slate-600">{sb.color || "حسب الموديل"}</td>
                          <td className="p-3 font-bold text-purple-700">{sb.quantity.toLocaleString()} قطعة</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Attachments / Tech Packs */}
            {rfq.attachments.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 border-b pb-3 mb-4 flex items-center gap-2">
                  <FileDown className="w-5 h-5 text-[#542cb7]" />
                  <span>المرفقات وملفات التصميم ({rfq.attachments.length})</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {rfq.attachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-slate-200 hover:border-purple-300 rounded-xl p-3 flex items-center gap-3 bg-slate-50 hover:bg-purple-50/50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-[#542cb7] shrink-0 font-bold text-xs">
                        DOC
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold text-slate-800 block truncate">{att.fileName}</span>
                        <span className="text-[10px] text-slate-500">معاينة وتنزيل الملف ←</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: Factory Quote Submission Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 sticky top-20">
              <div className="border-b pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#059669]" />
                  <span>تقديم عرض سعر من مصنعك</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  قدم أفضل سعر ومدة تسليم للمشتري مباشرة.
                </p>
              </div>

              {quoteSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-900">تم إرسال عرض السعر بنجاح!</h4>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    تم إشعار المشتري بعرض سعرك. ستتلقى تنبيهاً فور مراجعة العرض وقبوله.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleQuoteSubmit} className="space-y-4">
                  {quoteError && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{quoteError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      سعر القطعة (جنيه مصري) *
                    </label>
                    <input
                      type="number"
                      step={0.5}
                      min={1}
                      required
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
                    />
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                      <span>الإجمالي التقديري للطلبية:</span>
                      <strong className="text-purple-700 font-bold">{calculatedTotal.toLocaleString()} ج.م</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        مدة التسليم (أيام) *
                      </label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={leadTimeDays}
                        onChange={(e) => setLeadTimeDays(parseInt(e.target.value) || 1)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        الحد الأدنى (MOQ) *
                      </label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={minQuantity}
                        onChange={(e) => setMinQuantity(parseInt(e.target.value) || 1)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        سعر العينة (ج.م)
                      </label>
                      <input
                        type="number"
                        value={samplePrice}
                        onChange={(e) => setSamplePrice(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        مدة العينة (أيام)
                      </label>
                      <input
                        type="number"
                        value={sampleLeadTimeDays}
                        onChange={(e) => setSampleLeadTimeDays(parseInt(e.target.value) || 1)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      شروط الدفع المقترحة *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: 30% دفعة أولى مقدمة، 70% عند الاستلام"
                      value={paymentTermsAr}
                      onChange={(e) => setPaymentTermsAr(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ملاحظات أو ضمانات للمشتري
                    </label>
                    <textarea
                      rows={2}
                      placeholder="أي تفاصيل عن دقة القص، الألوان، شروط الاستبدال..."
                      value={notesAr}
                      onChange={(e) => setNotesAr(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingQuote}
                    className="w-full bg-[#059669] hover:bg-[#047857] text-white font-bold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submittingQuote ? "جاري الإرسال..." : "إرسال عرض السعر للمشتري"}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
