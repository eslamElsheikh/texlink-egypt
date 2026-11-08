"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Calculator,
  Plus,
  RefreshCw,
  Layers,
  DollarSign,
  Boxes,
  Cpu,
  Clock,
  X,
  CheckCircle2,
} from "lucide-react";

interface CostRecord {
  id: string;
  materialCost: number;
  directLaborCost: number;
  machineCost: number;
  maintenanceCost: number;
  overheadCost: number;
  totalCost: number;
  goodUnitsCount: number;
  costPerGoodUnit: number;
  productionOrder: {
    id: string;
    orderNumber: string;
    productNameSnapshot: string;
    targetQuantity: number;
    status: string;
  };
}

export default function ProductionCostingPage() {
  const [costs, setCosts] = useState<CostRecord[]>([]);
  const [orders, setOrders] = useState<Array<{ id: string; orderNumber: string; productNameSnapshot: string }>>([]);
  const [stats, setStats] = useState({ totalCostedOrders: 0, totalCalculatedCost: 0, averageCostPerUnit: 0 });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [orderId, setOrderId] = useState("");
  const [materialCost, setMaterialCost] = useState("");
  const [directLaborCost, setDirectLaborCost] = useState("15000");
  const [machineCost, setMachineCost] = useState("12000");
  const [maintenanceCost, setMaintenanceCost] = useState("3000");
  const [overheadCost, setOverheadCost] = useState("8000");

  const [user, setUser] = useState({
    id: "factory-user",
    name: "إدارة المصنع",
    email: "",
    role: "FACTORY" as const,
    isFactory: true,
    isBuyer: false,
    factorySlug: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [res, meRes] = await Promise.all([
        fetch("/api/factory/costs"),
        fetch("/api/auth/me").catch(() => null),
      ]);
      const json = await res.json();
      if (res.ok) {
        setCosts(json.costs || []);
        if (json.options?.orders) setOrders(json.options.orders);
        if (json.stats) setStats(json.stats);
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

  const handleComputeCost = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/factory/costs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productionOrderId: orderId,
          materialCost: materialCost ? parseFloat(materialCost) : undefined,
          directLaborCost: parseFloat(directLaborCost),
          machineCost: parseFloat(machineCost),
          maintenanceCost: parseFloat(maintenanceCost),
          overheadCost: parseFloat(overheadCost),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل احتساب التكلفة");

      setSuccessMsg("تم احتساب تكلفة أمر الإنتاج وسعر القطعة السليمة بدقة ✓");
      setModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout user={user} currentRole="FACTORY">
      <div className="space-y-6 pb-12 font-sans" dir="rtl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-purple-50 text-[#5932A8] rounded-xl">
                <Calculator className="w-6 h-6" />
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">محرك تكاليف الإنتاج الصناعي (Costing Engine)</h1>
            </div>
            <p className="text-gray-500 text-xs md:text-sm mt-1">
              حساب التكلفة الصناعية الحقيقية لأوامر التشغيل: خامات + أجور مباشرة + تشغيل الماكينات + صيانة + مصاريف عمومية.
            </p>
          </div>

          <button
            onClick={() => {
              setErrorMsg(null);
              setModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#5932A8] text-white rounded-xl font-bold text-sm hover:bg-[#49278f] transition shadow-sm"
          >
            <Plus className="w-5 h-5" />
            احتساب تكلفة أمر إنتاج
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">الأوامر المحسوبة</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{stats.totalCostedOrders}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">إجمالي تكاليف التشغيل المعتمدة</p>
            <p className="text-2xl font-black text-gray-900 mt-1">
              {stats.totalCalculatedCost.toLocaleString()} ج.م
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">متوسط تكلفة تصنيع القطعة</p>
            <p className="text-2xl font-black text-[#079B62] mt-1">
              {stats.averageCostPerUnit.toLocaleString()} ج.م / قطعة
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold">
            {successMsg}
          </div>
        )}

        {/* Costs Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">سجل تكلفة الأوامر الصناعية وسعر القطعة</h2>
            <button
              onClick={fetchData}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
              title="تحديث"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">أمر الإنتاج</th>
                  <th className="py-3 px-4">الخامات المباشرة</th>
                  <th className="py-3 px-4">أجور العمالة</th>
                  <th className="py-3 px-4">تشغيل الماكينات</th>
                  <th className="py-3 px-4">نصيب الصيانة</th>
                  <th className="py-3 px-4">المصاريف غير المباشرة</th>
                  <th className="py-3 px-4">إجمالي التكلفة</th>
                  <th className="py-3 px-4">القطع السليمة</th>
                  <th className="py-3 px-4">تكلفة القطعة السليمة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {costs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-400">
                      لا توجد حسابات تكاليف مسجلة حتى الآن.
                    </td>
                  </tr>
                ) : (
                  costs.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/70 transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-900 block">{c.productionOrder.orderNumber}</span>
                        <span className="text-[10px] text-gray-400 line-clamp-1">
                          {c.productionOrder.productNameSnapshot}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono">{c.materialCost.toLocaleString()} ج.م</td>
                      <td className="py-3 px-4 font-mono">{c.directLaborCost.toLocaleString()} ج.م</td>
                      <td className="py-3 px-4 font-mono">{c.machineCost.toLocaleString()} ج.م</td>
                      <td className="py-3 px-4 font-mono">{c.maintenanceCost.toLocaleString()} ج.م</td>
                      <td className="py-3 px-4 font-mono">{c.overheadCost.toLocaleString()} ج.م</td>
                      <td className="py-3 px-4 font-mono font-bold text-gray-900">
                        {c.totalCost.toLocaleString()} ج.م
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                        {c.goodUnitsCount.toLocaleString()} قطعة
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-900 rounded-lg font-mono font-black text-sm">
                          {c.costPerGoodUnit} ج.م / قطعة
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Compute Cost Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 bg-gradient-to-l from-[#14264A] to-[#5932A8] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-purple-300" />
                  <h3 className="font-bold text-base">احتساب تكلفة أمر إنتاج</h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleComputeCost} className="p-6 space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">أمر الإنتاج المستهدف *</label>
                  <select
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
                  >
                    <option value="">اختر أمر الإنتاج...</option>
                    {orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.orderNumber} - {o.productNameSnapshot}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">تكلفة الخامات المباشرة (ج.م)</label>
                    <input
                      type="number"
                      min="0"
                      value={materialCost}
                      onChange={(e) => setMaterialCost(e.target.value)}
                      placeholder="تلقائي من المخزن أو مخصص"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">أجور العمالة المباشرة (ج.م)</label>
                    <input
                      type="number"
                      min="0"
                      value={directLaborCost}
                      onChange={(e) => setDirectLaborCost(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">تشغيل الماكينات</label>
                    <input
                      type="number"
                      min="0"
                      value={machineCost}
                      onChange={(e) => setMachineCost(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">نصيب الصيانة</label>
                    <input
                      type="number"
                      min="0"
                      value={maintenanceCost}
                      onChange={(e) => setMaintenanceCost(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">مصاريف غير مباشرة</label>
                    <input
                      type="number"
                      min="0"
                      value={overheadCost}
                      onChange={(e) => setOverheadCost(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-[#5932A8] text-white rounded-xl text-xs font-bold hover:bg-[#49278f] transition disabled:opacity-50"
                  >
                    {submitting ? "جاري الحساب..." : "حساب واعتماد التكلفة"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
