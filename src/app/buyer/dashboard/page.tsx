"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ActivityBarChart, DonutBreakdownChart } from "@/components/dashboard/Charts";
import { StatCardSkeleton } from "@/components/dashboard/LoadingSkeleton";
import {
  FileText,
  PlusCircle,
  Building2,
  Package,
  CheckCircle2,
  Clock,
  ArrowRight,
  Scale,
  Star,
  Truck,
  AlertCircle,
  Eye,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface BuyerData {
  stats: {
    totalRfqs: number;
    openRfqs: number;
    receivedQuotesCount: number;
    pendingQuotesCount: number;
    activeOrdersCount: number;
    completedOrdersCount: number;
  };
  latestRfqs: Array<{
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
  }>;
  pendingQuotes: Array<{
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
    createdAt: string;
  }>;
  activeOrders: Array<{
    id: string;
    orderNumber: string;
    factoryName: string;
    productName: string;
    quantity: number;
    totalAmount: number;
    status: string;
    completedMilestonesCount: number;
    totalMilestonesCount: number;
  }>;
  donutSegments: Array<{
    name: string;
    value: number;
    percentage: number;
    color: string;
  }>;
}

export default function BuyerDashboardPage() {
  const [data, setData] = useState<BuyerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState({
    id: "buyer",
    name: "مشتري معتمد",
    email: "buyer@texlink-egypt.com",
    role: "BUYER" as const,
    isFactory: true,
    isBuyer: true,
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [dashRes, meRes] = await Promise.all([
        fetch("/api/buyer/dashboard"),
        fetch("/api/auth/me"),
      ]);

      const dashJson = await dashRes.json();
      const meJson = await meRes.json();

      if (!dashRes.ok) throw new Error(dashJson.error || "فشل تحميل لوحة المشتري");

      setData(dashJson);
      if (meJson.user) {
        setUser({
          ...meJson.user,
          role: "BUYER",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout user={user} currentRole="BUYER">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#17233F] tracking-tight">
            أهلاً بك في TexLink 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] mt-1">
            اكتشف مصانع موثوقة، وانشر طلباتك، وقارن عروض الأسعار بسهولة.
          </p>
        </div>

        <Link
          href="/rfqs/new"
          className="bg-[#5932A8] hover:bg-[#482888] text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          <span>إنشاء طلب تصنيع جديد</span>
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
              title="إجمالي طلباتي (RFQ)"
              value={data.stats.totalRfqs}
              icon={FileText}
              variant="purple"
              trend={{ value: `${data.stats.openRfqs} مفتوح`, positive: true, label: "بانتظار العروض" }}
              sparklineData={[4, 7, 6, 9, 8, 12, 11, 15]}
            />
            <StatCard
              title="عروض الأسعار المستلمة"
              value={data.stats.receivedQuotesCount}
              icon={Scale}
              variant="green"
              trend={{ value: "عروض مصانع معتمدة", positive: true, label: "جاهزة للمقارنة" }}
              sparklineData={[6, 9, 12, 11, 15, 14, 18, 22]}
            />
            <StatCard
              title="عروض تحتاج قرارك"
              value={data.stats.pendingQuotesCount}
              icon={Clock}
              variant="amber"
              trend={{ value: "بانتظار المراجعة", positive: false, label: "اختر الأنسب" }}
              sparklineData={[3, 5, 4, 7, 6, 8, 7, 9]}
            />
            <StatCard
              title="أوامر التصنيع الجارية"
              value={data.stats.activeOrdersCount}
              icon={Truck}
              variant="blue"
              trend={{ value: `${data.stats.completedOrdersCount} مكتمل`, positive: true, label: "متابعة المراحل" }}
              sparklineData={[1, 2, 2, 3, 4, 3, 5, 6]}
            />
          </div>
        )
      )}

      {/* 3. Three Prominent Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/rfqs/new"
          className="bg-white p-5 rounded-2xl border border-[#E5EAF2] hover:border-purple-300 hover:shadow-md transition-all group flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#5932A8] bg-purple-50 px-2 py-0.5 rounded">
              خطوة أولى
            </span>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#5932A8] transition-colors">
              نشر طلب تصنيع (RFQ)
            </h3>
            <p className="text-[11px] text-slate-500">
              حدد خاماتك وتلقّ عروض المصانع مجاناً
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#5932A8] flex items-center justify-center shrink-0">
            <PlusCircle className="w-5 h-5" />
          </div>
        </Link>

        <Link
          href="/factories"
          className="bg-white p-5 rounded-2xl border border-[#E5EAF2] hover:border-emerald-300 hover:shadow-md transition-all group flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#079B62] bg-emerald-50 px-2 py-0.5 rounded">
              دليل المصانع
            </span>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#079B62] transition-colors">
              استكشف مصانع المحلة وشبرا
            </h3>
            <p className="text-[11px] text-slate-500">
              تصفح المنشآت المعتمدة والمكائن
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#079B62] flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
        </Link>

        <Link
          href="/products"
          className="bg-white p-5 rounded-2xl border border-[#E5EAF2] hover:border-blue-300 hover:shadow-md transition-all group flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              بضاعة حاضرة
            </span>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              تصفح المنتجات الجاهزة
            </h3>
            <p className="text-[11px] text-slate-500">
              طلب توريد فوري بأسعار جملة متدرجة
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
        </Link>
      </div>

      {/* 4. Middle Section: My Latest RFQs Table + Category Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Latest RFQs (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E5EAF2] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#F1F4F9] pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#5932A8]" />
              <h3 className="text-sm font-bold text-[#17233F]">
                أحدث طلباتي (RFQ) ومقارنة العروض ({data?.latestRfqs.length || 0})
              </h3>
            </div>
            <Link
              href="/buyer/rfqs"
              className="text-xs font-semibold text-[#5932A8] hover:underline"
            >
              عرض كافة طلباتي ←
            </Link>
          </div>

          {!data || data.latestRfqs.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              لم تنشر أي طلب تصنيع حتى الآن. انقر على "إنشاء طلب جديد" لنشر أول مواصفات!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="text-[#718096] border-b border-[#F1F4F9]">
                    <th className="pb-2.5 font-bold">عنوان الطلب</th>
                    <th className="pb-2.5 font-bold">الكمية</th>
                    <th className="pb-2.5 font-bold">الميزانية التقديرية</th>
                    <th className="pb-2.5 font-bold">العروض المستلمة</th>
                    <th className="pb-2.5 font-bold">الحالة</th>
                    <th className="pb-2.5 font-bold text-center">مقارنة العروض</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F4F9]">
                  {data.latestRfqs.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70">
                      <td className="py-3 font-bold text-[#17233F]">
                        {r.titleAr}
                      </td>
                      <td className="py-3 font-semibold text-slate-800">
                        {r.totalQuantity.toLocaleString()} قطعة
                      </td>
                      <td className="py-3 text-slate-600">
                        {r.targetBudgetPerPiece ? `${r.targetBudgetPerPiece} ج.م / قطعة` : "حسب العرض"}
                      </td>
                      <td className="py-3">
                        <span className="bg-purple-100 text-[#5932A8] px-2 py-0.5 rounded-full font-bold">
                          {r.quoteCount} عروض
                        </span>
                      </td>
                      <td className="py-3">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="py-3 text-center">
                        <Link
                          href={`/rfqs/${r.id}/compare`}
                          className="bg-[#5932A8] hover:bg-[#482888] text-white font-bold text-[11px] px-3 py-1.5 rounded-lg inline-flex items-center gap-1 shadow-sm transition-all"
                        >
                          <Scale className="w-3 h-3" />
                          <span>مقارنة العروض</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Categories / Fabric Donut Chart (4 cols) */}
        <div className="lg:col-span-4">
          <DonutBreakdownChart
            title="توزيع طلباتي حسب نوع المنتج"
            totalDisplay={data ? `${data.stats.totalRfqs}` : "0"}
            totalSubtext="إجمالي الطلبات"
            segments={
              data?.donutSegments || [
                { name: "تيشيرتات", value: 4, percentage: 60, color: "#5932A8" },
                { name: "هوديز", value: 2, percentage: 40, color: "#079B62" },
              ]
            }
          />
        </div>
      </div>

      {/* 5. Lower Grid: Received Quotes Awaiting Decision & Active Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Received Quotes (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E5EAF2] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#F1F4F9] pb-3">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-[#17233F]">
                عروض أسعار جديدة تحتاج قرارك ({data?.pendingQuotes.length || 0})
              </h3>
            </div>
            <Link
              href="/buyer/quotes"
              className="text-xs font-semibold text-[#5932A8] hover:underline"
            >
              عرض كافة العروض ←
            </Link>
          </div>

          {!data || data.pendingQuotes.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              لا توجد عروض جديدة بانتظار اتخاذ قرار.
            </p>
          ) : (
            <div className="space-y-3">
              {data.pendingQuotes.map((q) => (
                <div
                  key={q.id}
                  className="p-3.5 rounded-xl border border-[#E5EAF2] flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900">
                        {q.factoryName}
                      </span>
                      <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                        {q.factoryRating} ★
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {q.factoryGovernorate}
                      </span>
                    </div>

                    <h4 className="text-xs text-[#718096] truncate max-w-xs">
                      {q.rfqTitle}
                    </h4>

                    <div className="flex items-center gap-3 text-xs pt-1">
                      <span className="text-purple-700 font-black">
                        {q.unitPrice} ج.م للقطعة
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-700 font-semibold">
                        {q.leadTimeDays} يوم تسليم
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/rfqs/${q.rfqId}/compare`}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shrink-0 shadow-sm transition-all"
                  >
                    مقارنة واعتماد
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Orders Timeline (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E5EAF2] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#F1F4F9] pb-3">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#5932A8]" />
              <h3 className="text-sm font-bold text-[#17233F]">
                متابعة تشغيل وتوريد الطلبات ({data?.activeOrders.length || 0})
              </h3>
            </div>
            <Link
              href="/buyer/orders"
              className="text-xs font-semibold text-[#5932A8] hover:underline"
            >
              عرض الكل ←
            </Link>
          </div>

          {!data || data.activeOrders.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              لا توجد أوامر قيد التصنيع حالياً.
            </p>
          ) : (
            <div className="space-y-3">
              {data.activeOrders.map((o) => (
                <div
                  key={o.id}
                  className="p-3.5 rounded-xl border border-[#E5EAF2] flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#5932A8]">
                        #{o.orderNumber}
                      </span>
                      <StatusBadge status={o.status} />
                    </div>

                    <h4 className="text-xs font-bold text-slate-900">
                      {o.productName}
                    </h4>

                    <span className="text-[11px] text-slate-500 block">
                      المصنع: {o.factoryName} • {o.quantity.toLocaleString()} قطعة
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                      {o.completedMilestonesCount} / {o.totalMilestonesCount} مراحل
                    </span>

                    <Link
                      href={`/orders/${o.id}`}
                      className="bg-purple-50 hover:bg-[#5932A8] text-[#5932A8] hover:text-white p-2 rounded-xl transition-all"
                      title="متابعة مراحل الإنتاج"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
