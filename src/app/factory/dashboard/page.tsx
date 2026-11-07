"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Layers,
  Wrench,
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  Plus,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Package,
} from "lucide-react";
import Link from "next/link";

interface DashboardData {
  factory: {
    id: string;
    nameAr: string;
    slug: string;
    governorate: string;
    city: string;
    verificationStatus: string;
    monthlyCapacity: number;
  };
  settings: {
    marketplaceEnabled: boolean;
    currency: string;
    wasteThresholdPct: number;
  };
  isAdminPreview: boolean;
  kpis: {
    totalProduction: number;
    totalProductionTrend: string;
    goodQuantity: number;
    goodQuantityTrend: string;
    defectiveQuantity: number;
    defectiveQuantityTrend: string;
    wasteRate: number;
    wasteRateTrend: string;
    breakdownsMonth: number;
    breakdownsTrend: string;
    downtimeHours: number;
    downtimeTrend: string;
  };
  charts: {
    productionDays: Array<{
      dayAr: string;
      total: number;
      good: number;
      defect: number;
      dateStr: string;
    }>;
    machineDistribution: {
      total: number;
      ready: number;
      stopped: number;
      maintenance: number;
      readyPercentage: number;
    };
  };
  inventory: Array<{
    id: string;
    name: string;
    sku: string;
    category: string;
    currentStock: number;
    minimumStock: number;
    unit: string;
    isLow: boolean;
    warehouseName: string;
  }>;
  recentBreakdowns: Array<{
    id: string;
    machineCode: string;
    machineName: string;
    issueType: string;
    description: string;
    startTime: string;
    status: string;
    priority: string;
  }>;
  orders: Array<{
    id: string;
    orderNumber: string;
    productName: string;
    targetQuantity: number;
    producedQuantity: number;
    progressPercentage: number;
    priority: string;
    status: string;
    plannedEndDate: string;
  }>;
  insights: Array<{
    type: "SUCCESS" | "WARNING" | "ALERT" | "INFO";
    title: string;
    description: string;
    action?: string;
  }>;
}

export default function FactoryDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<"30" | "7">("30");
  const [user, setUser] = useState<any>({
    id: "factory-user",
    name: "إدارة المصنع",
    email: "",
    role: "FACTORY",
    isFactory: true,
    isBuyer: false,
    factorySlug: "",
    verificationStatus: "PENDING",
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [res, meRes] = await Promise.all([
        fetch("/api/factory/dashboard"),
        fetch("/api/auth/me").catch(() => null),
      ]);

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "تعذر تحميل بيانات المصنع");
      }
      const json = await res.json();
      setData(json);

      if (meRes && meRes.ok) {
        const meJson = await meRes.json().catch(() => null);
        if (meJson?.user) {
          setUser({
            ...meJson.user,
            role: "FACTORY",
            verificationStatus: json.factory?.verificationStatus || meJson.user.factoryProfile?.verificationStatus || "PENDING",
            factorySlug: json.factory?.slug || meJson.user.factorySlug || "",
          });
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout user={user} currentRole="FACTORY">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="w-12 h-12 border-4 border-[#079B62] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium text-sm">جاري تحميل لوحة تحكم المصنع والعمليات...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout user={user} currentRole="FACTORY">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-lg mx-auto mt-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-red-900 mb-2">تعذر فتح لوحة التحكم</h2>
          <p className="text-red-700 text-sm mb-6">{error || "حدث خطأ غير معروف"}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-2.5 bg-[#079B62] text-white rounded-lg font-semibold text-sm hover:bg-[#068453] transition"
          >
            إعادة المحاولة
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const { factory, kpis, charts, inventory, recentBreakdowns, orders, insights, isAdminPreview } = data;

  return (
    <DashboardLayout user={user} currentRole="FACTORY">
      <div className="space-y-6 pb-12 font-sans" dir="rtl">
        {/* Admin Preview Mode Notice */}
        {isAdminPreview && (
          <div className="bg-amber-50 border-r-4 border-amber-500 p-4 rounded-xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-xl">👁️</span>
              <div>
                <p className="text-sm font-bold text-amber-900">وضع معاينة المشرف (Admin Inspection Mode)</p>
                <p className="text-xs text-amber-700">
                  أنت تتصفح حالياً لوحة تشغيل <strong>{factory.nameAr}</strong> بصلاحيات مدير النظام
                </p>
              </div>
            </div>
            <Link
              href="/admin/factories"
              className="text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition"
            >
              العودة لإدارة المصانع ←
            </Link>
          </div>
        )}

        {/* Hero Welcome Banner Matching Image #2 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-[#14264A] via-[#1a3363] to-[#254682] text-white p-6 md:p-8 shadow-sm">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium text-emerald-300 border border-white/15">
                <span className={`w-2 h-2 rounded-full ${factory.verificationStatus === "VERIFIED" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                <span>
                  {factory.nameAr} — {factory.verificationStatus === "VERIFIED" ? "معتمد وموثق ✓" : "قيد المراجعة والتوثيق ⏳"}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                أهلاً بك في {factory.nameAr}
              </h1>
              <p className="text-white/80 text-sm md:text-base max-w-xl">
                تابع إنتاج مصنعك، وأدر الماكينات، وراقب نسب الهالك والمخزون الحي بكل سهولة.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto bg-black/20 p-1.5 rounded-xl border border-white/10 backdrop-blur-sm">
              <button
                onClick={() => setTimeFilter("30")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
                  timeFilter === "30"
                    ? "bg-[#079B62] text-white shadow-sm"
                    : "text-white/80 hover:text-white"
                }`}
              >
                آخر 30 يوم
              </button>
              <button
                onClick={() => setTimeFilter("7")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
                  timeFilter === "7"
                    ? "bg-[#079B62] text-white shadow-sm"
                    : "text-white/80 hover:text-white"
                }`}
              >
                آخر 7 أيام
              </button>
            </div>
          </div>

          <div className="absolute left-0 bottom-0 top-0 w-96 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        </div>

        {/* 6 KPI Cards Grid Matching Image #2 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Card 1: إجمالي الإنتاج */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                {kpis.totalProductionTrend}
              </span>
            </div>
            <p className="text-xs font-medium text-gray-500">إجمالي الإنتاج</p>
            <p className="text-xl md:text-2xl font-black text-gray-900 mt-1">
              {kpis.totalProduction.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">قطعة منتجة</p>
          </div>

          {/* Card 2: القطع السليمة */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#079B62] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                {kpis.goodQuantityTrend}
              </span>
            </div>
            <p className="text-xs font-medium text-gray-500">القطع السليمة</p>
            <p className="text-xl md:text-2xl font-black text-gray-900 mt-1">
              {kpis.goodQuantity.toLocaleString()}
            </p>
            <p className="text-[10px] text-emerald-600 mt-1 font-semibold">مطابقة للمواصفات</p>
          </div>

          {/* Card 3: الهالك والفاقد */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" />
                {kpis.defectiveQuantityTrend}
              </span>
            </div>
            <p className="text-xs font-medium text-gray-500">الهالك والفاقد</p>
            <p className="text-xl md:text-2xl font-black text-gray-900 mt-1">
              {kpis.defectiveQuantity.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">قطعة معيبة / تالفة</p>
          </div>

          {/* Card 4: نسبة الهالك */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#5932A8] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" />
                {kpis.wasteRateTrend}
              </span>
            </div>
            <p className="text-xs font-medium text-gray-500">نسبة الهالك</p>
            <p className="text-xl md:text-2xl font-black text-gray-900 mt-1">
              {kpis.wasteRate}%
            </p>
            <p className="text-[10px] text-purple-700 mt-1 font-semibold">الحد الأقصى: 5%</p>
          </div>

          {/* Card 5: الأعطال هذا الشهر */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" />
                {kpis.breakdownsTrend}
              </span>
            </div>
            <p className="text-xs font-medium text-gray-500">الأعطال هذا الشهر</p>
            <p className="text-xl md:text-2xl font-black text-gray-900 mt-1">
              {kpis.breakdownsMonth}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">بلاغات صيانة</p>
          </div>

          {/* Card 6: وقت التوقف */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" />
                {kpis.downtimeTrend}
              </span>
            </div>
            <p className="text-xs font-medium text-gray-500">وقت التوقف</p>
            <p className="text-xl md:text-2xl font-black text-gray-900 mt-1">
              {kpis.downtimeHours}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">ساعة توقف إجمالية</p>
          </div>
        </div>

        {/* Factory Intelligence Insights Banner */}
        {insights.length > 0 && (
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-100 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#079B62] text-white flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <span>مساعد الذكاء التشغيلي للمصنع (Factory Intelligence)</span>
                  <span className="bg-emerald-100 text-[#079B62] text-[10px] px-2 py-0.5 rounded-md font-semibold">مباشر</span>
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {insights[0].description}
                </p>
              </div>
            </div>
            {insights[0].action && (
              <Link
                href={insights[0].action}
                className="self-start md:self-auto px-4 py-2 bg-white text-[#079B62] hover:bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold transition shadow-sm"
              >
                متابعة الإجراء ←
              </Link>
            )}
          </div>
        )}

        {/* Middle Section: Production Bar Chart & Machine Donut Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Dual Bar Chart: إنتاج المصنع (7 أيام) */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-base font-bold text-gray-900">إنتاج المصنع</h3>
                <p className="text-xs text-gray-500">مقارنة إجمالي الإنتاج بالقطع السليمة خلال الأسبوع</p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#5932A8]" />
                  <span className="text-gray-600 font-medium">إجمالي الإنتاج</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#079B62]" />
                  <span className="text-gray-600 font-medium">إنتاج سليم</span>
                </div>
              </div>
            </div>

            {/* Custom Dual Bar Chart or Empty State */}
            {kpis.totalProduction === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                <Boxes className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-700">لا توجد سجلات إنتاج مسجلة حتى الآن</p>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  قم بإنشاء أول أمر تشغيل لمصنعك وتسجيل يوميات صالة الإنتاج لبدء تحليل مؤشرات الكفاءة ونسب الهالك.
                </p>
                <Link
                  href="/factory/production-orders"
                  className="mt-4 px-4 py-2 bg-[#079B62] hover:bg-[#068453] text-white rounded-xl text-xs font-bold transition shadow-sm inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>إنشاء أول أمر تشغيل</span>
                </Link>
              </div>
            ) : (
              <>
                <div className="h-64 w-full flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-gray-100">
                  {charts.productionDays.map((d, idx) => {
                    const maxVal = Math.max(14000, ...charts.productionDays.map((p) => p.total));
                    const totalHeightPct = Math.min(100, Math.round((d.total / maxVal) * 100));
                    const goodHeightPct = Math.min(100, Math.round((d.good / maxVal) * 100));

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-gray-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-20 shadow-lg">
                          {d.dayAr}: {d.good.toLocaleString()} سليم من {d.total.toLocaleString()}
                        </div>

                        <div className="w-full flex items-end justify-center gap-1.5 h-full">
                          <div
                            style={{ height: `${totalHeightPct}%` }}
                            className="w-3.5 sm:w-5 bg-[#5932A8]/85 hover:bg-[#5932A8] rounded-t-md transition-all duration-300"
                          />
                          <div
                            style={{ height: `${goodHeightPct}%` }}
                            className="w-3.5 sm:w-5 bg-[#079B62] hover:bg-[#068453] rounded-t-md transition-all duration-300"
                          />
                        </div>
                        <span className="text-[11px] text-gray-500 font-semibold mt-2">{d.dayAr}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between pt-3 text-xs text-gray-400">
                  <span>0 قطعة</span>
                  <span>مؤشر الإنتاج الأسبوعي</span>
                  <span>محدث لحظياً</span>
                </div>
              </>
            )}
          </div>

          {/* Donut Chart: حالة الماكينات */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">حالة الماكينات</h3>
                <Link
                  href="/factory/machines"
                  className="text-xs font-bold text-[#079B62] hover:underline flex items-center gap-1"
                >
                  عرض الكل ←
                </Link>
              </div>

              {charts.machineDistribution.total === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50/60 rounded-xl border border-dashed border-slate-200 my-4">
                  <Wrench className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-700">لا توجد ماكينات مسجلة</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    أضف ماكينات ومعدات المصنع لبدء مراقبة الجاهزية وحالات التشغيل.
                  </p>
                  <Link
                    href="/factory/machines"
                    className="mt-3 px-3.5 py-1.5 bg-[#079B62] hover:bg-[#068453] text-white rounded-lg text-xs font-bold transition shadow-sm inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة ماكينة</span>
                  </Link>
                </div>
              ) : (
                <div className="relative flex items-center justify-center my-6">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-100"
                        strokeWidth="3.8"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#079B62]"
                        strokeDasharray={`${charts.machineDistribution.readyPercentage}, 100`}
                        strokeWidth="3.8"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-black text-gray-900">
                        {charts.machineDistribution.readyPercentage}%
                      </span>
                      <span className="text-[10px] font-bold text-[#079B62]">جاهزة للعمل</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2.5 pt-4 border-t border-gray-100 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#079B62]" />
                  <span className="text-gray-700 font-medium">ماكينات جاهزة وتعمل</span>
                </div>
                <span className="font-bold text-gray-900">{charts.machineDistribution.ready} ماكينة</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-gray-700 font-medium">ماكينات متوقفة مؤقتاً</span>
                </div>
                <span className="font-bold text-gray-900">{charts.machineDistribution.stopped} ماكينة</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-gray-700 font-medium">تحت الصيانة والإصلاح</span>
                </div>
                <span className="font-bold text-red-600">{charts.machineDistribution.maintenance} ماكينة</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row (3 Interactive Widgets Matching Image #2) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Widget 1: المخزون والخامات */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-[#079B62]" />
                  <h3 className="text-sm font-bold text-gray-900">المخزون والخامات الحية</h3>
                </div>
                <Link
                  href="/factory/inventory"
                  className="text-xs font-semibold text-[#079B62] hover:underline"
                >
                  المستودع ←
                </Link>
              </div>

              <div className="space-y-3">
                {inventory.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-900">{item.name}</p>
                      <p className="text-[10px] text-gray-500">
                        {item.currentStock.toLocaleString()} {item.unit}
                      </p>
                    </div>
                    {item.isLow ? (
                      <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-md">
                        منخفض ⚠️
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        متوفر ✓
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100">
              <Link
                href="/factory/inventory"
                className="w-full flex items-center justify-center gap-2 py-2 bg-[#079B62] text-white rounded-xl text-xs font-bold hover:bg-[#068453] transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                طلب خامات جديدة
              </Link>
            </div>
          </div>

          {/* Widget 2: أحدث الأعطال والصيانة */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-amber-600" />
                  <h3 className="text-sm font-bold text-gray-900">أحدث بلاغات الأعطال</h3>
                </div>
                <Link
                  href="/factory/maintenance"
                  className="text-xs font-semibold text-amber-600 hover:underline"
                >
                  سجل الصيانة ←
                </Link>
              </div>

              <div className="space-y-3">
                {recentBreakdowns.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-6">لا توجد أعطال مسجلة حالياً، الماكينات تعمل بانتظام.</p>
                ) : (
                  recentBreakdowns.slice(0, 3).map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1 hover:border-gray-200 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900">{t.machineCode}</span>
                        {t.status === "RESOLVED" || t.status === "CLOSED" ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                            تم الإصلاح
                          </span>
                        ) : t.status === "IN_PROGRESS" ? (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                            قيد الإصلاح
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                            بانتظار الفني
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-600 line-clamp-1">{t.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100">
              <Link
                href="/factory/maintenance"
                className="w-full flex items-center justify-center gap-2 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                تسجيل عطل جديد
              </Link>
            </div>
          </div>

          {/* Widget 3: الطلبات الجارية وأوامر الإنتاج */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#5932A8]" />
                  <h3 className="text-sm font-bold text-gray-900">أوامر الإنتاج الجارية</h3>
                </div>
                <Link
                  href="/factory/production-orders"
                  className="text-xs font-semibold text-[#5932A8] hover:underline"
                >
                  جميع الأوامر ←
                </Link>
              </div>

              <div className="space-y-3">
                {orders.slice(0, 3).map((ord) => (
                  <div
                    key={ord.id}
                    className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1.5 hover:border-gray-200 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900">{ord.orderNumber}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          ord.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800"
                            : ord.status === "IN_PROGRESS"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {ord.status === "COMPLETED"
                          ? "مكتمل"
                          : ord.status === "IN_PROGRESS"
                          ? "قيد الإنتاج"
                          : "في التجهيز"}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 line-clamp-1">{ord.productName}</p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#5932A8] h-full rounded-full transition-all duration-300"
                          style={{ width: `${ord.progressPercentage}%` }}
                        />
                      </div>
                      <span className="font-semibold">{ord.progressPercentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100">
              <Link
                href="/factory/production"
                className="w-full flex items-center justify-center gap-2 py-2 bg-[#5932A8] text-white rounded-xl text-xs font-bold hover:bg-[#4a298c] transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                تسجيل إنتاج يومي جديد
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
