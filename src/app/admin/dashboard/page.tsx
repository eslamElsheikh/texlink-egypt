"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ActivityBarChart, DonutBreakdownChart } from "@/components/dashboard/Charts";
import { StatCardSkeleton, TableSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import {
  Building2,
  FileText,
  CheckCircle2,
  Users,
  DollarSign,
  Clock,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Download,
  AlertCircle,
  Eye,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface DashboardData {
  stats: {
    totalFactories: number;
    verifiedFactories: number;
    pendingFactories: number;
    totalBuyers: number;
    activeRfqs: number;
    totalQuotes: number;
    activeOrders: number;
    completedOrders: number;
    totalTransactionVolume: number;
  };
  pendingVerifications: Array<{
    id: string;
    nameAr: string;
    slug: string;
    ownerName: string;
    phone: string;
    governorate: string;
    createdAt: string;
    specialties: string[];
    documentsCount: number;
  }>;
  latestRfqs: Array<{
    id: string;
    titleAr: string;
    buyerName: string;
    totalQuantity: number;
    governorate: string;
    quoteCount: number;
    status: string;
    createdAt: string;
  }>;
  donutSegments: Array<{
    name: string;
    value: number;
    percentage: number;
    color: string;
  }>;
  recentActivities: Array<{
    id: string;
    action: string;
    details: string | null;
    createdAt: string;
    admin: { name: string };
  }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState({
    id: "admin",
    name: "إدارة منصة سايسل مصر",
    email: "admin@texlink-egypt.com",
    role: "ADMIN" as const,
    isFactory: false,
    isBuyer: true,
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [dashRes, meRes] = await Promise.all([
        fetch("/api/admin/dashboard"),
        fetch("/api/auth/me"),
      ]);

      const dashJson = await dashRes.json();
      const meJson = await meRes.json();

      if (!dashRes.ok) throw new Error(dashJson.error || "فشل تحميل لوحة الإدارة");

      setData(dashJson);
      if (meJson.user) {
        setUser({
          ...meJson.user,
          role: "ADMIN",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyFactory = async (id: string, status: "VERIFIED" | "REJECTED") => {
    let reason: string | undefined;
    if (status === "REJECTED") {
      const input = prompt("سبب رفض طلب التوثيق:");
      if (!input) return;
      reason = input;
    }

    try {
      const res = await fetch(`/api/admin/factories/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reason }),
      });
      if (!res.ok) throw new Error("فشل تحديث الحالة");

      // Refresh data
      fetchDashboard();
    } catch (err) {
      alert("حدث خطأ أثناء معالجة الطلب");
    }
  };

  // Mock bar data matching Dashboard.jpg
  const barChartData = [
    { label: "يناير", value: 4200 },
    { label: "فبراير", value: 6100 },
    { label: "مارس", value: 5800 },
    { label: "أبريل", value: 8400 },
    { label: "مايو", value: 7200 },
    { label: "يونيو", value: 9500 },
    { label: "يوليو", value: 11200 },
    { label: "أغسطس", value: 10400 },
    { label: "سبتمبر", value: 12480 },
  ];

  return (
    <DashboardLayout user={user} currentRole="ADMIN">
      {/* 1. Dashboard Header Section matching Dashboard.jpg */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#17233F] tracking-tight">
            مرحباً بك في لوحة إدارة Cysle 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] mt-1">
            تابع أداء المنصة وإدارة المصانع والمشترين وطلبات التصنيع.
          </p>
        </div>

        {/* Date Filter & Export Button matching Dashboard.jpg */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 bg-white border border-[#E5EAF2] px-3.5 py-2 rounded-xl text-xs font-semibold text-[#17233F] shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-[#718096]" />
            <span>1 أبريل 2026 - 30 أبريل 2026</span>
          </div>

          <button
            type="button"
            onClick={() => alert("جاري تصدير التقرير الشامل بصيغة PDF/Excel...")}
            className="bg-[#5932A8] hover:bg-[#482888] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير التقرير</span>
          </button>
        </div>
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
              title="إجمالي حجم الصفقات"
              value={`${data.stats.totalTransactionVolume.toLocaleString()} ج.م`}
              icon={DollarSign}
              variant="purple"
              trend={{ value: "12.5%+", positive: true, label: "مقارنة بالشهر السابق" }}
              sparklineData={[10, 15, 12, 20, 18, 25, 22, 30]}
            />
            <StatCard
              title="طلبات RFQ النشطة"
              value={data.stats.activeRfqs}
              icon={FileText}
              variant="blue"
              trend={{ value: "8.4%+", positive: true, label: "طلبات تصنيع جديدة" }}
              sparklineData={[5, 8, 12, 10, 15, 14, 18, 22]}
            />
            <StatCard
              title="المصانع المعتمدة"
              value={data.stats.verifiedFactories}
              icon={Building2}
              variant="green"
              trend={{ value: "16.2%+", positive: true, label: "منشآت موثقة" }}
              sparklineData={[8, 12, 10, 16, 14, 20, 22, 28]}
            />
            <StatCard
              title="أوامر التصنيع المكتملة"
              value={data.stats.completedOrders}
              icon={CheckCircle2}
              variant="amber"
              trend={{ value: "98%", positive: true, label: "نسبة الالتزام" }}
              sparklineData={[14, 16, 15, 19, 18, 22, 25, 29]}
            />
          </div>
        )
      )}

      {/* 3. Secondary Stats Pills Row */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3 rounded-xl border border-[#E5EAF2] text-xs flex items-center justify-between">
            <span className="text-[#718096]">المصانع قيد المراجعة:</span>
            <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              {data.stats.pendingFactories} بانتظار التدقيق
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#E5EAF2] text-xs flex items-center justify-between">
            <span className="text-[#718096]">المشترون المسجلون:</span>
            <span className="font-bold text-[#17233F]">
              {data.stats.totalBuyers} مشتري
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#E5EAF2] text-xs flex items-center justify-between">
            <span className="text-[#718096]">عروض الأسعار:</span>
            <span className="font-bold text-[#5932A8]">
              {data.stats.totalQuotes} عرض
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#E5EAF2] text-xs flex items-center justify-between">
            <span className="text-[#718096]">الطلبات قيد التشغيل:</span>
            <span className="font-bold text-blue-600">
              {data.stats.activeOrders} أمر إنتاج
            </span>
          </div>
        </div>
      )}

      {/* 4. Charts Row matching Dashboard.jpg */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Activity Chart (8 cols) */}
        <div className="lg:col-span-8">
          <ActivityBarChart
            title="نظرة عامة على نشاط المنصة وحجم الصفقات"
            totalDisplay={
              data
                ? `${data.stats.totalTransactionVolume.toLocaleString()} ج.م`
                : "124,800 ج.م"
            }
            trendText="↑ 12.5% مقارنة بالشهر السابق"
            data={barChartData}
            accentColor="#5932A8"
          />
        </div>

        {/* Donut Chart: Categories Breakdown (4 cols) */}
        <div className="lg:col-span-4">
          <DonutBreakdownChart
            title="توزيع المعاملات حسب التصنيف"
            totalDisplay={data ? `${data.stats.totalQuotes + data.stats.activeRfqs}` : "100"}
            totalSubtext="إجمالي البنود"
            segments={
              data?.donutSegments && data.donutSegments.length > 0
                ? data.donutSegments
                : [
                    { name: "تيشيرتات وبولو", value: 42, percentage: 42, color: "#5932A8" },
                    { name: "هوديز وميلتون", value: 24, percentage: 24, color: "#079B62" },
                    { name: "شرابات وجوارب", value: 18, percentage: 18, color: "#2563EB" },
                    { name: "بنطلونات رياضية", value: 12, percentage: 12, color: "#D97706" },
                    { name: "أخرى", value: 4, percentage: 4, color: "#94A3B8" },
                  ]
            }
          />
        </div>
      </div>

      {/* 5. Bottom Tables Row matching Dashboard.jpg */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pending Factory Verifications (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E5EAF2] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#F1F4F9] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-[#17233F]">
                طلبات توثيق المصانع المعلقة ({data?.pendingVerifications.length || 0})
              </h3>
            </div>
            <Link
              href="/admin/factories"
              className="text-xs font-semibold text-[#5932A8] hover:underline flex items-center gap-1"
            >
              <span>إدارة كافة المصانع</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {!data || data.pendingVerifications.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              لا توجد مصانع بانتظار التدقيق حالياً. كافة الطلبات تمت مراجعتها!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="text-[#718096] border-b border-[#F1F4F9]">
                    <th className="pb-2.5 font-bold">المصنع</th>
                    <th className="pb-2.5 font-bold">المالك</th>
                    <th className="pb-2.5 font-bold">المحافظة</th>
                    <th className="pb-2.5 font-bold">المستندات</th>
                    <th className="pb-2.5 font-bold text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F4F9]">
                  {data.pendingVerifications.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/70">
                      <td className="py-3 font-bold text-[#17233F]">
                        {f.nameAr}
                      </td>
                      <td className="py-3 text-[#718096]">{f.ownerName}</td>
                      <td className="py-3 text-[#718096]">{f.governorate}</td>
                      <td className="py-3">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[11px]">
                          {f.documentsCount} ملفات
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleVerifyFactory(f.id, "VERIFIED")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white p-1 rounded-lg text-xs"
                            title="اعتماد المصنع"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleVerifyFactory(f.id, "REJECTED")}
                            className="bg-rose-50 text-rose-600 hover:bg-rose-100 p-1 rounded-lg text-xs border border-rose-200"
                            title="رفض"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Latest RFQs Table (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E5EAF2] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#F1F4F9] pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#5932A8]" />
              <h3 className="text-sm font-bold text-[#17233F]">أحدث طلبات التصنيع (RFQ)</h3>
            </div>
            <Link
              href="/admin/rfqs"
              className="text-xs font-semibold text-[#5932A8] hover:underline"
            >
              عرض الكل
            </Link>
          </div>

          {!data || data.latestRfqs.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              لا توجد طلبات تصنيع معروضة حالياً.
            </p>
          ) : (
            <div className="space-y-3">
              {data.latestRfqs.map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-xl border border-[#E5EAF2] flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1 overflow-hidden">
                    <h4 className="text-xs font-bold text-[#17233F] truncate">
                      {r.titleAr}
                    </h4>
                    <p className="text-[11px] text-[#718096]">
                      {r.buyerName} • {r.totalQuantity.toLocaleString()} قطعة
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <StatusBadge status={r.status} />
                    <span className="text-[10px] text-slate-400">
                      {r.quoteCount} عروض
                    </span>
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
