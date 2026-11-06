"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ActivityBarChart, DonutBreakdownChart } from "@/components/dashboard/Charts";
import { StatCardSkeleton } from "@/components/dashboard/LoadingSkeleton";
import {
  Building2,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  Send,
  Eye,
  AlertCircle,
  Truck,
  Package,
  Layers,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface FactoryData {
  factory: {
    id: string;
    nameAr: string;
    slug: string;
    governorate: string;
    rating: number;
    reviewCount: number;
    minOrderQuantity: number;
    monthlyCapacity: number;
    verificationStatus: string;
  };
  stats: {
    matchingRfqsCount: number;
    sentQuotesCount: number;
    acceptedQuotesCount: number;
    activeOrdersCount: number;
    completedOrdersCount: number;
    profileViews: number;
  };
  matchingRfqs: Array<{
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
    createdAt: string;
  }>;
  myQuotes: Array<{
    id: string;
    rfqId: string;
    rfqTitle: string;
    unitPrice: number;
    totalAmount: number;
    leadTimeDays: number;
    status: string;
    createdAt: string;
  }>;
  activeOrders: Array<{
    id: string;
    orderNumber: string;
    buyerName: string;
    productName: string;
    quantity: number;
    totalAmount: number;
    status: string;
    completedMilestonesCount: number;
    totalMilestonesCount: number;
  }>;
  quoteDonutSegments: Array<{
    name: string;
    value: number;
    percentage: number;
    color: string;
  }>;
}

export default function FactoryDashboardPage() {
  const [data, setData] = useState<FactoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState({
    id: "factory",
    name: "صاحب المصنع",
    email: "factory@texlink-egypt.com",
    role: "FACTORY" as const,
    isFactory: true,
    isBuyer: true,
    factorySlug: null as string | null,
  });

  // Quick Quote Modal state
  const [selectedRfq, setSelectedRfq] = useState<{ id: string; title: string; quantity: number } | null>(null);
  const [quotePrice, setQuotePrice] = useState(40);
  const [quoteLeadDays, setQuoteLeadDays] = useState(12);
  const [quoteTerms, setQuoteTerms] = useState("30% دفعة أولى مقدمة، 70% عند الاستلام والفحص");
  const [submittingQuote, setSubmittingQuote] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [dashRes, meRes] = await Promise.all([
        fetch("/api/factory/dashboard"),
        fetch("/api/auth/me"),
      ]);

      const dashJson = await dashRes.json();
      const meJson = await meRes.json();

      if (!dashRes.ok) throw new Error(dashJson.error || "فشل تحميل لوحة المصنع");

      setData(dashJson);
      if (meJson.user) {
        setUser({
          ...meJson.user,
          role: "FACTORY",
          factorySlug: dashJson.factory?.slug || null,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRfq) return;
    setSubmittingQuote(true);

    try {
      const res = await fetch(`/api/rfqs/${selectedRfq.id}/quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitPrice: Number(quotePrice),
          leadTimeDays: Number(quoteLeadDays),
          minQuantity: 50,
          paymentTermsAr: quoteTerms,
        }),
      });

      if (!res.ok) throw new Error("فشل إرسال العرض");

      alert("تم إرسال عرض السعر بنجاح!");
      setSelectedRfq(null);
      fetchDashboard();
    } catch (err) {
      alert("حدث خطأ أثناء تقديم العرض");
    } finally {
      setSubmittingQuote(false);
    }
  };

  return (
    <DashboardLayout user={user} currentRole="FACTORY">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-100 text-[#079B62] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              {data?.factory.nameAr || "مصنعي"}
            </span>
            <span className="text-xs text-[#718096]">
              {data?.factory.governorate} • تقييم {data?.factory.rating.toFixed(1)} ★
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#17233F] tracking-tight">
            أهلاً بك في مصنعك على TexLink 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] mt-1">
            تابع طلبات المشترين، وقدّم عروض أسعار، وأدر منتجاتك وطلبات التصنيع.
          </p>
        </div>

        <Link
          href="/factory/rfqs"
          className="bg-[#079B62] hover:bg-[#068453] text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all w-fit"
        >
          <FileText className="w-4 h-4" />
          <span>تصفح كافة الطلبات المطابقة</span>
        </Link>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Top 4 Statistics Cards matching Dashboard.jpg */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              title="الطلبات الجديدة المناسبة لمصنعي"
              value={data.stats.matchingRfqsCount}
              icon={FileText}
              variant="green"
              trend={{ value: "فرص متاحة", positive: true, label: "مطابقة لإمكانياتك" }}
              sparklineData={[12, 14, 18, 16, 22, 25, 28, 34]}
            />
            <StatCard
              title="عروض الأسعار المرسلة"
              value={data.stats.sentQuotesCount}
              icon={Clock}
              variant="purple"
              trend={{ value: `${data.stats.acceptedQuotesCount} مقبولة`, positive: true, label: "صفقات معتمدة" }}
              sparklineData={[5, 8, 11, 14, 12, 18, 20, 24]}
            />
            <StatCard
              title="أوامر التصنيع الجارية"
              value={data.stats.activeOrdersCount}
              icon={CheckCircle2}
              variant="blue"
              trend={{ value: "على خطوط الإنتاج", positive: true, label: "تتبع المراحل" }}
              sparklineData={[2, 3, 4, 3, 5, 4, 6, 7]}
            />
            <StatCard
              title="زيارات ملف المصنع"
              value={data.stats.profileViews}
              icon={Building2}
              variant="amber"
              trend={{ value: "14%+", positive: true, label: "مشاهدات من المشترين" }}
              sparklineData={[20, 35, 45, 60, 80, 110, 130, 142]}
            />
          </div>
        )
      )}

      {/* 3. Middle Section: Matching RFQs + Donut Performance Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Matching RFQ Feed (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E5EAF2] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#F1F4F9] pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#079B62]" />
              <h3 className="text-sm font-bold text-[#17233F]">
                طلبات تصنيع مطابقة لتخصص مصنعك ({data?.matchingRfqs.length || 0})
              </h3>
            </div>
            <Link
              href="/factory/rfqs"
              className="text-xs font-semibold text-[#079B62] hover:underline"
            >
              عرض الكافة ←
            </Link>
          </div>

          {!data || data.matchingRfqs.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              لا توجد طلبات جديدة مطابقة حالياً. بمجرد نشر طلب جديد مناسب سيظهر هنا تلقائياً.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {data.matchingRfqs.slice(0, 4).map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-xl border border-[#E5EAF2] hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col justify-between space-y-3 bg-[#FDFDFE]"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#079B62] bg-emerald-50 px-2 py-0.5 rounded">
                        {r.productType}
                      </span>
                      <span className="text-[10px] text-[#718096]">
                        المهلة: {r.deadlineDays} يوم
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#17233F] line-clamp-1">
                      {r.titleAr}
                    </h4>

                    <p className="text-[11px] text-[#718096] line-clamp-1">
                      الخامة: {r.fabricDetails}
                    </p>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                      <span className="font-bold text-slate-900">
                        {r.totalQuantity.toLocaleString()} قطعة
                      </span>
                      <span className="text-purple-700 font-bold text-[11px]">
                        {r.targetBudgetPerPiece ? `${r.targetBudgetPerPiece} ج.م / قطعة` : "حسب العرض"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-1">
                    {r.alreadyQuoted ? (
                      <span className="w-full bg-slate-100 text-slate-600 text-xs font-semibold py-1.5 rounded-lg flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>تم تقديم عرض مسبقاً</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedRfq({
                            id: r.id,
                            title: r.titleAr,
                            quantity: r.totalQuantity,
                          })
                        }
                        className="w-full bg-[#079B62] hover:bg-[#068453] text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Send className="w-3 h-3" />
                        <span>تقديم عرض سعر فوري</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quotes Performance Donut (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <DonutBreakdownChart
            title="أداء عروض الأسعار ونسبة القبول"
            totalDisplay={data ? `${data.stats.sentQuotesCount}` : "0"}
            totalSubtext="إجمالي العروض"
            segments={
              data?.quoteDonutSegments || [
                { name: "عروض مقبولة", value: 3, percentage: 60, color: "#079B62" },
                { name: "قيد المراجعة", value: 2, percentage: 30, color: "#2563EB" },
                { name: "أخرى", value: 1, percentage: 10, color: "#94A3B8" },
              ]
            }
          />

          {/* Motivational Achievement Card matching Dashboard.jpg */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
              <TrendingUp className="w-4 h-4 text-[#079B62]" />
              <span>نصيحة لزيادة مبيعات مصنعك:</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              تقديم عينات سريعة بأسعار واضحة خلال أول 3 ساعات يرفع فرصة قبول عرضك بنسبة تزيد عن 40%!
            </p>
            <Link
              href="/factory/orders"
              className="text-xs font-extrabold text-[#079B62] hover:underline block pt-1"
            >
              متابعة أوامر التشغيل الجارية ←
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Lower Tables: Active Production Orders & Recent Quotes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Production Orders (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E5EAF2] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#F1F4F9] pb-3">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#079B62]" />
              <h3 className="text-sm font-bold text-[#17233F]">
                أوامر التصنيع الجارية ({data?.activeOrders.length || 0})
              </h3>
            </div>
            <Link
              href="/factory/orders"
              className="text-xs font-semibold text-[#079B62] hover:underline"
            >
              إدارة خطوط الإنتاج ←
            </Link>
          </div>

          {!data || data.activeOrders.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              لا توجد أوامر قيد التصنيع حالياً. قدّم عروض أسعار على طلبات الـ RFQ المفتوحة لبدء صفقات جديدة!
            </p>
          ) : (
            <div className="space-y-3">
              {data.activeOrders.map((o) => (
                <div
                  key={o.id}
                  className="p-3.5 rounded-xl border border-[#E5EAF2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#5932A8]">
                        #{o.orderNumber}
                      </span>
                      <StatusBadge status={o.status} />
                    </div>
                    <h4 className="text-xs font-bold text-[#17233F]">
                      {o.productName}
                    </h4>
                    <span className="text-[11px] text-[#718096] block">
                      المشتري: {o.buyerName} • الكمية: {o.quantity.toLocaleString()} قطعة
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right sm:text-left">
                      <span className="text-xs font-black text-slate-900 block">
                        {o.totalAmount.toLocaleString()} ج.م
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        المراحل: {o.completedMilestonesCount} / {o.totalMilestonesCount}
                      </span>
                    </div>

                    <Link
                      href={`/orders/${o.id}`}
                      className="bg-emerald-50 hover:bg-emerald-600 text-[#079B62] hover:text-white p-2 rounded-xl transition-all"
                      title="شاشة أمر التصنيع"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Quotes Table (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E5EAF2] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#F1F4F9] pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-[#17233F]">آخر عروض الأسعار المرسلة</h3>
            </div>
            <Link
              href="/factory/quotes"
              className="text-xs font-semibold text-[#5932A8] hover:underline"
            >
              عرض الكل
            </Link>
          </div>

          {!data || data.myQuotes.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              لم تقدم أي عروض أسعار حتى الآن.
            </p>
          ) : (
            <div className="space-y-2.5">
              {data.myQuotes.map((q) => (
                <div
                  key={q.id}
                  className="p-3 rounded-xl border border-slate-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 overflow-hidden">
                    <h5 className="font-bold text-slate-800 truncate">
                      {q.rfqTitle}
                    </h5>
                    <span className="text-[10px] text-slate-400">
                      سعر القطعة: {q.unitPrice} ج.م • المدة: {q.leadTimeDays} يوم
                    </span>
                  </div>

                  <StatusBadge status={q.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Quote Submission Modal */}
      {selectedRfq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4 text-right">
            <div className="border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                تقديم عرض سعر لمصنعك
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                {selectedRfq.title} ({selectedRfq.quantity.toLocaleString()} قطعة)
              </p>
            </div>

            <form onSubmit={handleQuickQuoteSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  سعر القطعة (جنيه مصري) *
                </label>
                <input
                  type="number"
                  step={0.5}
                  min={1}
                  required
                  value={quotePrice}
                  onChange={(e) => setQuotePrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#079B62]"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  إجمالي قيمة الصفقة:{" "}
                  <strong className="text-emerald-700">
                    {((quotePrice || 0) * selectedRfq.quantity).toLocaleString()} ج.م
                  </strong>
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  مدة التنفيذ والتسليم (أيام) *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={quoteLeadDays}
                  onChange={(e) => setQuoteLeadDays(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#079B62]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  شروط الدفع المقترحة *
                </label>
                <input
                  type="text"
                  required
                  value={quoteTerms}
                  onChange={(e) => setQuoteTerms(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#079B62]"
                />
              </div>

              <div className="pt-3 border-t flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRfq(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingQuote}
                  className="bg-[#079B62] hover:bg-[#068453] text-white px-5 py-2 rounded-xl text-xs font-bold shadow transition-all disabled:opacity-50"
                >
                  {submittingQuote ? "جاري الإرسال..." : "إرسال العرض للمشتري"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
