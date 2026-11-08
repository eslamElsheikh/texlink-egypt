"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  BarChart3,
  Download,
  RefreshCw,
  Layers,
  Cpu,
  ShieldCheck,
  DollarSign,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Boxes,
  User,
  Clock,
  Sparkles,
} from "lucide-react";

interface ReportData {
  summary: {
    totalProduced: number;
    totalGood: number;
    totalDefect: number;
    overallWasteRate: number;
    totalOrdersCount: number;
    totalInventoryValuation: number;
  };
  machines: Array<{
    id: string;
    code: string;
    name: string;
    status: string;
    totalOutput: number;
    goodOutput: number;
    downtimeMinutes: number;
    maintenanceCost: number;
    operatingCostPerHour: number;
  }>;
  costs: Array<{
    id: string;
    materialCost: number;
    directLaborCost: number;
    machineCost: number;
    totalCost: number;
    goodUnitsCount: number;
    costPerGoodUnit: number;
    productionOrder: {
      orderNumber: string;
      productNameSnapshot: string;
    };
  }>;
  orderOptions: Array<{
    id: string;
    orderNumber: string;
    productName: string;
  }>;
  traceData: {
    orderId: string;
    orderNumber: string;
    batchNumber: string;
    productName: string;
    targetQuantity: number;
    status: string;
    plannedDates: { start: string; end: string };
    rawMaterials: Array<{
      itemName: string;
      sku: string | null;
      batchNumber: string;
      consumed: number;
      unit: string;
      cost: number;
    }>;
    stagesAndMachines: Array<{
      stage: string;
      date: string;
      machine: string;
      employee: string;
      shift: string;
      produced: number;
      good: number;
      defect: number;
    }>;
    qualitySignoffs: Array<{
      stage: string;
      status: string;
      inspector: string;
      inspected: number;
      accepted: number;
      rejected: number;
      date: string;
    }>;
    defectsAndWaste: Array<{
      stage: string;
      type: string;
      quantity: number;
      scrapped: number;
      estimatedCost: number;
    }>;
    costing: {
      totalCost: number;
      costPerGoodUnit: number;
      goodUnits: number;
    } | null;
  } | null;
}

export default function ReportsAndTraceabilityPage() {
  const [activeTab, setActiveTab] = useState<"PRODUCTION" | "MACHINES" | "COSTS" | "TRACE">("TRACE");
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTraceOrder, setSelectedTraceOrder] = useState("");

  const [user, setUser] = useState({
    id: "factory-user",
    name: "إدارة المصنع",
    email: "",
    role: "FACTORY" as const,
    isFactory: true,
    isBuyer: false,
    factorySlug: "",
  });

  const fetchData = async (traceId?: string) => {
    try {
      setLoading(true);
      const url = traceId
        ? `/api/factory/reports?traceOrderId=${encodeURIComponent(traceId)}`
        : "/api/factory/reports";

      const [res, meRes] = await Promise.all([
        fetch(url),
        fetch("/api/auth/me").catch(() => null),
      ]);

      const json = await res.json();
      if (res.ok) {
        setData(json);
        if (json.traceData && !selectedTraceOrder) {
          setSelectedTraceOrder(json.traceData.orderId);
        }
      }
      if (meRes && meRes.ok) {
        const me = await meRes.json();
        if (me.user) setUser({ ...me.user, role: "FACTORY" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTraceOrderChange = (id: string) => {
    setSelectedTraceOrder(id);
    fetchData(id);
  };

  const handleExportCSV = () => {
    if (!data) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "تقرير الإنتاج والتكاليف - مصنع سايسل مصر\n";
    csvContent += `إجمالي الإنتاج,${data.summary.totalProduced}\n`;
    csvContent += `القطع السليمة,${data.summary.totalGood}\n`;
    csvContent += `القطع المعيبة,${data.summary.totalDefect}\n`;
    csvContent += `نسبة الهالك,${data.summary.overallWasteRate}%\n\n`;

    csvContent += "الماكينة,الكود,الحالة,إجمالي الإنتاج,وقت التوقف (دقيقة),تكلفة الصيانة\n";
    for (const m of data.machines) {
      csvContent += `${m.name},${m.code},${m.status},${m.totalOutput},${m.downtimeMinutes},${m.maintenanceCost}\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cysle_factory_report_${new Date().toISOString().split("T")[0]}.csv`);
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
              <span className="p-2 bg-emerald-50 text-[#079B62] rounded-xl">
                <BarChart3 className="w-6 h-6" />
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">التقارير الشاملة ومسار التتبع (Traceability)</h1>
            </div>
            <p className="text-gray-500 text-xs md:text-sm mt-1">
              تحليلات الإنتاج، كفاءة المعدات، تكاليف التشغيل، وتتبع دورة حياة الدفعة الصناعية من الخيط للمنتج التام.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-xs hover:bg-gray-50 transition shadow-sm"
            >
              <Download className="w-4 h-4" />
              تصدير تقرير (CSV)
            </button>
            <button
              onClick={() => fetchData(selectedTraceOrder)}
              className="p-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
              title="تحديث"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top Summary Cards */}
        {data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500">إجمالي القطع المنتجة</p>
              <p className="text-2xl font-black text-gray-900 mt-1">
                {data.summary.totalProduced.toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500">القطع السليمة المطابقة</p>
              <p className="text-2xl font-black text-[#079B62] mt-1">
                {data.summary.totalGood.toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500">متوسط نسبة الهالك</p>
              <p className="text-2xl font-black text-purple-700 mt-1">
                {data.summary.overallWasteRate}%
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500">قيمة المخزون الحالي</p>
              <p className="text-2xl font-black text-gray-900 mt-1">
                {data.summary.totalInventoryValuation.toLocaleString()} ج.م
              </p>
            </div>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab("TRACE")}
            className={`pb-3 px-4 text-xs font-bold transition whitespace-nowrap border-b-2 ${
              activeTab === "TRACE"
                ? "border-[#079B62] text-[#079B62]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            مسار التتبع الكامل للدفعات (End-to-End Traceability)
          </button>
          <button
            onClick={() => setActiveTab("PRODUCTION")}
            className={`pb-3 px-4 text-xs font-bold transition whitespace-nowrap border-b-2 ${
              activeTab === "PRODUCTION"
                ? "border-[#079B62] text-[#079B62]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            ملخص الإنتاج ومراحل التشغيل
          </button>
          <button
            onClick={() => setActiveTab("MACHINES")}
            className={`pb-3 px-4 text-xs font-bold transition whitespace-nowrap border-b-2 ${
              activeTab === "MACHINES"
                ? "border-[#079B62] text-[#079B62]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            كفاءة الماكينات وأوقات التوقف
          </button>
          <button
            onClick={() => setActiveTab("COSTS")}
            className={`pb-3 px-4 text-xs font-bold transition whitespace-nowrap border-b-2 ${
              activeTab === "COSTS"
                ? "border-[#079B62] text-[#079B62]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            تكاليف الأوامر الصناعية
          </button>
        </div>

        {/* TAB 1: Traceability Inspector */}
        {activeTab === "TRACE" && data && (
          <div className="space-y-6">
            {/* Order Selector */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-[#079B62]" />
                <div>
                  <h3 className="text-sm font-bold text-gray-900">حدد أمر الإنتاج لفحص شجرة التتبع</h3>
                  <p className="text-xs text-gray-500">اختر الدفعة لعرض مراحلها من استلام الغزل حتى الفحص والتسليم</p>
                </div>
              </div>

              <select
                value={selectedTraceOrder}
                onChange={(e) => handleTraceOrderChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#079B62] focus:outline-none"
              >
                {data.orderOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.orderNumber} - {o.productName}
                  </option>
                ))}
              </select>
            </div>

            {data.traceData ? (
              <div className="space-y-6">
                {/* Traceability Header Card */}
                <div className="bg-gradient-to-l from-[#14264A] to-[#254682] text-white p-6 rounded-2xl shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-mono bg-white/10 px-2.5 py-1 rounded-md text-emerald-300">
                        كود اللوط: {data.traceData.batchNumber}
                      </span>
                      <h2 className="text-xl md:text-2xl font-black mt-2">
                        {data.traceData.orderNumber} — {data.traceData.productName}
                      </h2>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-white/20 px-3 py-1.5 rounded-xl font-bold">
                        الكمية المستهدفة: {data.traceData.targetQuantity.toLocaleString()} قطعة
                      </span>
                      <span className="text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-xl font-bold">
                        الحالة: {data.traceData.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Step 1: Raw Materials Issued */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
                    <Boxes className="w-5 h-5 text-[#079B62]" />
                    <span>1. الخامات ومستلزمات الإنتاج المصروفة من المخازن</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {data.traceData.rawMaterials.map((rm, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-200/70 text-xs space-y-1">
                        <p className="font-bold text-gray-900">{rm.itemName}</p>
                        <p className="text-gray-500 text-[11px]">كود الدفعة: {rm.batchNumber}</p>
                        <p className="font-mono font-bold text-emerald-700">
                          الكمية: {rm.consumed.toLocaleString()} {rm.unit}
                        </p>
                        <p className="text-gray-400 font-mono text-[10px]">التكلفة: {rm.cost.toLocaleString()} ج.م</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 2: Production Stages & Machines */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
                    <Layers className="w-5 h-5 text-[#5932A8]" />
                    <span>2. المراحل التشغيلية والماكينات والورديات</span>
                  </div>
                  <div className="space-y-2">
                    {data.traceData.stagesAndMachines.map((sm, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs gap-2"
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded text-[10px]">
                            {sm.stage}
                          </span>
                          <p className="font-semibold text-gray-900 mt-1">الماكينة: {sm.machine}</p>
                          <p className="text-[11px] text-gray-500">المشغل: {sm.employee} ({sm.shift})</p>
                        </div>
                        <div className="text-left font-mono">
                          <span className="text-emerald-700 font-bold block">
                            سليم: {sm.good.toLocaleString()} قطعة
                          </span>
                          {sm.defect > 0 && (
                            <span className="text-amber-700 text-[11px]">
                              تالف: {sm.defect.toLocaleString()} قطعة
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 3: Quality Signoffs */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>3. اعتمادات ومحاضر فحص الجودة (Quality Sign-offs)</span>
                  </div>
                  {data.traceData.qualitySignoffs.length === 0 ? (
                    <p className="text-xs text-gray-400 py-3">لم يتم تسجيل محاضر فحص جودة نهائية بعد لهذا الأمر.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {data.traceData.qualitySignoffs.map((qs, idx) => (
                        <div key={idx} className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-emerald-900">مرحلة: {qs.stage}</span>
                            <span className="font-extrabold text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                              {qs.status}
                            </span>
                          </div>
                          <p className="text-gray-600">المراقب: {qs.inspector}</p>
                          <p className="font-mono font-semibold text-emerald-800">
                            مقبول: {qs.accepted.toLocaleString()} من {qs.inspected.toLocaleString()} قطعة
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Step 4: Finished Costing */}
                {data.traceData.costing && (
                  <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-emerald-800">4. التكلفة الصناعية المعتمدة للدفعة</p>
                      <p className="text-sm font-black mt-0.5">
                        إجمالي تكلفة تصنيع الأمر: {data.traceData.costing.totalCost.toLocaleString()} ج.م
                      </p>
                    </div>
                    <div className="text-left bg-white px-4 py-2.5 rounded-xl border border-emerald-200 shadow-sm">
                      <p className="text-[10px] font-bold text-gray-500">تكلفة القطعة السليمة الجاهزة</p>
                      <p className="text-xl font-black text-emerald-700 font-mono">
                        {data.traceData.costing.costPerGoodUnit} ج.م / قطعة
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
                اختر أمر إنتاج لعرض بيانات التتبع الكاملة.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Machine Efficiency */}
        {activeTab === "MACHINES" && data && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">كفاءة تشغيل الماكينات وأوقات التوقف</h2>
              <span className="text-xs text-gray-400">إجمالي {data.machines.length} ماكينة</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="py-3 px-4">كود واسم الماكينة</th>
                    <th className="py-3 px-4">الحالة الحالية</th>
                    <th className="py-3 px-4">إجمالي الإنتاج</th>
                    <th className="py-3 px-4">الإنتاج السليم</th>
                    <th className="py-3 px-4">وقت التوقف</th>
                    <th className="py-3 px-4">تكلفة الصيانة</th>
                    <th className="py-3 px-4">تكلفة التشغيل/ساعة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {data.machines.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50/70 transition">
                      <td className="py-3 px-4 font-bold text-gray-900">
                        {m.code} - {m.name}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.status === "RUNNING"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold">{m.totalOutput.toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono text-emerald-600 font-bold">{m.goodOutput.toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono text-gray-600">{m.downtimeMinutes} دقيقة</td>
                      <td className="py-3 px-4 font-mono text-gray-900 font-bold">
                        {m.maintenanceCost.toLocaleString()} ج.م
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-600">{m.operatingCostPerHour} ج.م</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
