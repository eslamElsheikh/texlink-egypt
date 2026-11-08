"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Users,
  TrendingUp,
  UserPlus,
  CheckSquare,
  Clock,
  DollarSign,
  Phone,
  ArrowRight,
  Plus,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  Calendar,
  AlertCircle,
  Building,
} from "lucide-react";
import Link from "next/link";

interface CrmDashboardData {
  factory: {
    id: string;
    nameAr: string;
    slug: string;
  };
  isAdminPreview: boolean;
  kpis: {
    totalCustomers: number;
    activeCustomers: number;
    newLeads: number;
    totalLeads: number;
    openDealsCount: number;
    openDealsValue: number;
    wonDealsValue: number;
    pendingQuotesCount: number;
    pendingFollowUpsCount: number;
    overdueFollowUpsCount: number;
  };
  pipelineStages: Array<{
    id: string;
    title: string;
    color: string;
    count: number;
    totalAmount: number;
  }>;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    performedBy: string | null;
    createdAt: string;
    customer: { id: string; name: string; companyName: string | null };
  }>;
  upcomingFollowUps: Array<{
    id: string;
    title: string;
    dueDate: string;
    type: string;
    priority: string;
    status: string;
    assignedTo: string | null;
    customer?: { id: string; name: string; companyName: string | null; phone: string };
  }>;
  topCustomers: Array<{
    id: string;
    name: string;
    companyName: string | null;
    phone: string;
    source: string;
    status: string;
    totalSpend: number;
    ordersCount: number;
  }>;
  recentDeals: Array<{
    id: string;
    title: string;
    stage: string;
    amount: number;
    customer: { id: string; name: string; companyName: string | null };
  }>;
}

export default function CrmDashboardPage() {
  const [data, setData] = useState<CrmDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [user, setUser] = useState({
    id: "crm-user",
    name: "إدارة المبيعات",
    email: "",
    role: "FACTORY" as const,
    isFactory: true,
    isBuyer: false,
    factorySlug: "",
  });

  const fetchCrmData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [res, meRes] = await Promise.all([
        fetch("/api/crm/dashboard"),
        fetch("/api/auth/me").catch(() => null),
      ]);

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "تعذر تحميل بيانات لوحة CRM");
      }

      const json = await res.json();
      setData(json);

      if (meRes && meRes.ok) {
        const me = await meRes.json();
        if (me.user) setUser({ ...me.user, role: "FACTORY" });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrmData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout user={user} currentRole="FACTORY">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="w-12 h-12 border-4 border-[#5932A8] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium text-sm">جاري تحميل مساحة إدارة العملاء والمبيعات (CRM)...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout user={user} currentRole="FACTORY">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-lg mx-auto mt-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-red-900 mb-2">تعذر فتح لوحة CRM</h2>
          <p className="text-red-700 text-sm mb-6">{error || "حدث خطأ غير معروف"}</p>
          <button
            onClick={fetchCrmData}
            className="px-6 py-2.5 bg-[#5932A8] text-white rounded-lg font-semibold text-sm hover:bg-[#49278f] transition"
          >
            إعادة المحاولة
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const { factory, kpis, pipelineStages, recentActivities, upcomingFollowUps, topCustomers, recentDeals } = data;

  return (
    <DashboardLayout user={user} currentRole="FACTORY">
      <div className="space-y-6 pb-12 font-sans" dir="rtl">
        {/* Workspace Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-[#14264A] via-[#3a2072] to-[#5932A8] text-white p-6 md:p-8 shadow-sm">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium text-purple-200 border border-white/15">
                <Users className="w-3.5 h-3.5 text-purple-300" />
                مساحة إدارة العملاء والمبيعات (CRM Workspace) — {factory.nameAr}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                لوحة المبيعات والعلاقات التجارية
              </h1>
              <p className="text-white/80 text-xs md:text-sm max-w-xl">
                إدارة طلبات المشترين، تحويل الفرص لصفقات محسومة، متابعة التذكيرات، وسجل التواصل المباشر.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              <Link
                href="/crm/customers"
                className="px-4 py-2 bg-white text-[#5932A8] hover:bg-purple-50 text-xs font-extrabold rounded-xl transition shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة عميل جديد</span>
              </Link>
              <Link
                href="/crm/pipeline"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition flex items-center gap-1.5"
              >
                <TrendingUp className="w-4 h-4" />
                <span>عرض خط الصفقات</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Primary CRM KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#5932A8] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {kpis.activeCustomers} نشط
              </span>
            </div>
            <p className="text-xs font-medium text-gray-500">إجمالي العملاء والشركات</p>
            <p className="text-xl md:text-2xl font-black text-gray-900 mt-1">
              {kpis.totalCustomers}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">سجل العملاء المعتمدين</p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {kpis.newLeads} جديد
              </span>
            </div>
            <p className="text-xs font-medium text-gray-500">العملاء المحتملون (Leads)</p>
            <p className="text-xl md:text-2xl font-black text-gray-900 mt-1">
              {kpis.totalLeads}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">فرص تواصل وتوريد</p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {kpis.openDealsCount} صفقة
              </span>
            </div>
            <p className="text-xs font-medium text-gray-500">قيمة الصفقات المفتوحة</p>
            <p className="text-xl md:text-2xl font-black text-gray-900 mt-1 font-mono">
              {kpis.openDealsValue.toLocaleString()} ج.م
            </p>
            <p className="text-[10px] text-emerald-600 mt-1 font-semibold">
              المحسوم: {kpis.wonDealsValue.toLocaleString()} ج.م
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <CheckSquare className="w-5 h-5" />
              </div>
              {kpis.overdueFollowUpsCount > 0 ? (
                <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                  {kpis.overdueFollowUpsCount} متأخر
                </span>
              ) : (
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  منتظم ✓
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-gray-500">المتابعات والتذكيرات</p>
            <p className="text-xl md:text-2xl font-black text-gray-900 mt-1">
              {kpis.pendingFollowUpsCount}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">مكالمات وعروض قيد المتابعة</p>
          </div>
        </div>

        {/* Sales Pipeline Visual Overview */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#5932A8]" />
              <h2 className="text-base font-bold text-gray-900">خط سير المبيعات والصفقات (Sales Pipeline)</h2>
            </div>
            <Link
              href="/crm/pipeline"
              className="text-xs font-bold text-[#5932A8] hover:underline flex items-center gap-1"
            >
              عرض كانبان التفصيلي ←
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {pipelineStages.map((stage) => (
              <div
                key={stage.id}
                className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2 hover:border-gray-200 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800">{stage.title}</span>
                  <span className="text-[10px] font-bold text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                    {stage.count}
                  </span>
                </div>
                <p className="text-lg font-black text-gray-900 font-mono">
                  {stage.totalAmount.toLocaleString()} ج.م
                </p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`${stage.color} h-full rounded-full`}
                    style={{
                      width: kpis.openDealsValue > 0 ? `${Math.min(100, (stage.totalAmount / kpis.openDealsValue) * 100)}%` : "0%",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2-Column Section: Follow-ups and Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Urgent Follow-ups */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-amber-600" />
                  <h3 className="text-sm font-bold text-gray-900">المتابعات والمهام المستحقة</h3>
                </div>
                <Link href="/crm/follow-ups" className="text-xs font-bold text-[#5932A8] hover:underline">
                  عرض كل المهام ←
                </Link>
              </div>

              <div className="space-y-3">
                {upcomingFollowUps.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-8">لا توجد متابعات معلقة حالياً.</p>
                ) : (
                  upcomingFollowUps.map((fu) => (
                    <div
                      key={fu.id}
                      className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1 hover:border-gray-200 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900">{fu.title}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            fu.priority === "HIGH" || fu.priority === "URGENT"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {fu.priority === "HIGH" ? "أولوية مرتفعة" : fu.type}
                        </span>
                      </div>
                      {fu.customer && (
                        <p className="text-[11px] text-gray-600">
                          العميل: <strong>{fu.customer.companyName || fu.customer.name}</strong> •{" "}
                          <span className="font-mono text-gray-500">{fu.customer.phone}</span>
                        </p>
                      )}
                      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
                        <span>المسؤول: {fu.assignedTo || "غير محدد"}</span>
                        <span className="font-mono">
                          الموعد: {new Date(fu.dueDate).toLocaleDateString("ar-EG")}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100">
              <Link
                href="/crm/follow-ups"
                className="w-full flex items-center justify-center gap-2 py-2 bg-purple-50 text-[#5932A8] hover:bg-purple-100 rounded-xl text-xs font-bold transition"
              >
                <Plus className="w-4 h-4" />
                إضافة مهمة متابعة جديدة
              </Link>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <h3 className="text-sm font-bold text-gray-900">سجل التفاعلات والأنشطة الأخيرة</h3>
                </div>
                <Link href="/crm/activities" className="text-xs font-bold text-[#5932A8] hover:underline">
                  السجل الكامل ←
                </Link>
              </div>

              <div className="space-y-3">
                {recentActivities.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-8">لا توجد أنشطة مسجلة مؤخراً.</p>
                ) : (
                  recentActivities.map((act) => (
                    <div key={act.id} className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#5932A8] bg-purple-50 px-2 py-0.5 rounded">
                          {act.type}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {new Date(act.createdAt).toLocaleDateString("ar-EG", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-800 line-clamp-2">{act.description}</p>
                      <p className="text-[10px] text-gray-500">
                        العميل: {act.customer.companyName || act.customer.name}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100">
              <Link
                href="/crm/marketplace-requests"
                className="w-full flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition"
              >
                <ShoppingBag className="w-4 h-4" />
                استعراض طلبات سوق سايسل مصر المربوطة
              </Link>
            </div>
          </div>
        </div>

        {/* Top Strategic Customers Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">أبرز العملاء والشركات الاستراتيجية</h2>
            <Link href="/crm/customers" className="text-xs font-bold text-[#5932A8] hover:underline">
              عرض جميع العملاء ({kpis.totalCustomers}) ←
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">اسم العميل / الشركة</th>
                  <th className="py-3 px-4">رقم الهاتف</th>
                  <th className="py-3 px-4">المصدر</th>
                  <th className="py-3 px-4">إجمالي المشتريات</th>
                  <th className="py-3 px-4">عدد الطلبات</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4">الملف والتواصل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {topCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-3 px-4">
                      <span className="font-bold text-gray-900 block">{c.companyName || c.name}</span>
                      {c.companyName && <span className="text-[10px] text-gray-400">{c.name}</span>}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-gray-700">
                      <a href={`tel:${c.phone}`} className="hover:underline flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#079B62]" />
                        <span>{c.phone}</span>
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          c.source === "MARKETPLACE"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {c.source === "MARKETPLACE" ? "سوق سايسل مصر B2B" : c.source}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700 text-sm">
                      {c.totalSpend.toLocaleString()} ج.م
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      {c.ordersCount} طلب
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/crm/customers/${c.id}`}
                        className="px-2.5 py-1 bg-purple-50 text-[#5932A8] hover:bg-purple-100 border border-purple-200 rounded-lg text-[10px] font-bold transition flex items-center gap-1 w-fit"
                      >
                        <span>الملف والنشاط</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
