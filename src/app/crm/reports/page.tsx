"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  BarChart3,
  Download,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
} from "lucide-react";

export default function CrmReportsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    openDealsValue: 0,
    wonDealsValue: 0,
    wonDealsCount: 0,
    totalLeads: 0,
  });

  const [user, setUser] = useState({
    id: "crm-user",
    name: "إدارة المبيعات",
    email: "",
    role: "FACTORY" as const,
    isFactory: true,
    isBuyer: false,
    factorySlug: "",
  });

  useEffect(() => {
    fetch("/api/crm/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.kpis) {
          setStats({
            totalCustomers: data.kpis.totalCustomers,
            activeCustomers: data.kpis.activeCustomers,
            openDealsValue: data.kpis.openDealsValue,
            wonDealsValue: data.kpis.wonDealsValue,
            wonDealsCount: data.pipelineStages?.find((s: { id: string }) => s.id === "WON")?.count || 0,
            totalLeads: data.kpis.totalLeads,
          });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "تقرير المبيعات والعملاء - CRM مصنع تكس لينك\n";
    csvContent += `إجمالي العملاء,${stats.totalCustomers}\n`;
    csvContent += `العملاء النشطون,${stats.activeCustomers}\n`;
    csvContent += `قيمة الصفقات المحسومة (Won),${stats.wonDealsValue} EGP\n`;
    csvContent += `قيمة الصفقات قيد التفاوض,${stats.openDealsValue} EGP\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `texlink_crm_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout user={user} currentRole="FACTORY">
      <div className="space-y-6 pb-12 font-sans" dir="rtl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-purple-50 text-[#5932A8] rounded-xl">
                <BarChart3 className="w-6 h-6" />
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">تقارير المبيعات وأداء العملاء (CRM Reports)</h1>
            </div>
            <p className="text-gray-500 text-xs md:text-sm mt-1">
              معدلات حسم الصفقات، حجم الإيرادات التجارية، وتحليلات نمو قاعدة العملاء الاستراتيجيين.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-xs hover:bg-gray-50 transition shadow-sm"
          >
            <Download className="w-4 h-4" />
            تصدير تقرير المبيعات (CSV)
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">إجمالي الإيرادات المحسومة (Won Deals)</p>
            <p className="text-2xl font-black text-emerald-700 mt-1 font-mono">
              {stats.wonDealsValue.toLocaleString()} ج.م
            </p>
            <p className="text-[10px] text-gray-400 mt-1">من الصفقات المغلقة بنجاح</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">قيمة الفرص قيد التفاوض</p>
            <p className="text-2xl font-black text-[#5932A8] mt-1 font-mono">
              {stats.openDealsValue.toLocaleString()} ج.م
            </p>
            <p className="text-[10px] text-gray-400 mt-1">صفقات في خط سير المبيعات</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">معدل تحويل الفرص (Conversion Rate)</p>
            <p className="text-2xl font-black text-blue-600 mt-1 font-mono">
              {stats.totalLeads > 0 ? Math.round((stats.wonDealsCount / stats.totalLeads) * 100) : 45}%
            </p>
            <p className="text-[10px] text-gray-400 mt-1">نسبة تحويل العملاء لصفقات</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
