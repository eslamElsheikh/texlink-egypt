"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Scissors,
  Plus,
  RefreshCw,
  Boxes,
  CheckCircle2,
  AlertTriangle,
  X,
  Layers,
  DollarSign,
} from "lucide-react";

interface MaterialConsumption {
  id: string;
  plannedQuantity: number;
  issuedQuantity: number;
  returnedQuantity: number;
  actualConsumed: number;
  unitCost: number;
  totalCost: number;
  createdAt: string;
  productionOrder: {
    id: string;
    orderNumber: string;
    productNameSnapshot: string;
  };
  inventoryItem: {
    id: string;
    name: string;
    sku: string | null;
    unit: string;
    currentStock: number;
  };
}

export default function MaterialConsumptionPage() {
  const [consumptions, setConsumptions] = useState<MaterialConsumption[]>([]);
  const [options, setOptions] = useState<{
    orders: Array<{ id: string; orderNumber: string; productNameSnapshot: string }>;
    inventoryItems: Array<{ id: string; name: string; sku: string | null; unit: string; currentStock: number; unitCost: number }>;
  }>({ orders: [], inventoryItems: [] });
  const [stats, setStats] = useState({ totalRecords: 0, totalConsumedCost: 0 });

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [orderId, setOrderId] = useState("");
  const [inventoryItemId, setInventoryItemId] = useState("");
  const [plannedQuantity, setPlannedQuantity] = useState("");
  const [issuedQuantity, setIssuedQuantity] = useState("");

  const [user, setUser] = useState({
    id: "factory-user",
    name: "إدارة المصنع",
    email: "elnasr@mahalla-textile.com",
    role: "FACTORY" as const,
    isFactory: true,
    isBuyer: false,
    factorySlug: "el-nasr-tricot",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [res, meRes] = await Promise.all([
        fetch("/api/factory/material-consumption"),
        fetch("/api/auth/me").catch(() => null),
      ]);
      const json = await res.json();
      if (res.ok) {
        setConsumptions(json.consumptions || []);
        if (json.options) setOptions(json.options);
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

  const handleIssueMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/factory/material-consumption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productionOrderId: orderId,
          inventoryItemId,
          plannedQuantity,
          issuedQuantity: issuedQuantity || plannedQuantity,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل صرف الخامات");

      setSuccessMsg("تم صرف الخامات وخصمها من رصيد المستودع بنجاح ✓");
      setModalOpen(false);
      setPlannedQuantity("");
      setIssuedQuantity("");
      fetchData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedItem = options.inventoryItems.find((i) => i.id === inventoryItemId);

  return (
    <DashboardLayout user={user} currentRole="FACTORY">
      <div className="space-y-6 pb-12 font-sans" dir="rtl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-50 text-[#079B62] rounded-xl">
                <Scissors className="w-6 h-6" />
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">استهلاك وصرف الخامات لأوامر الإنتاج</h1>
            </div>
            <p className="text-gray-500 text-xs md:text-sm mt-1">
              تخصيص وصرف الغزول والأقمشة والإكسسوارات لأوامر التشغيل، والتحقق التلقائي من كفاية الأرصدة.
            </p>
          </div>

          <button
            onClick={() => {
              setErrorMsg(null);
              setModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#079B62] text-white rounded-xl font-bold text-sm hover:bg-[#068453] transition shadow-sm"
          >
            <Plus className="w-5 h-5" />
            صرف خامات لأمر تشغيل
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">إجمالي عمليات صرف الخامات</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{stats.totalRecords}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">إجمالي تكلفة الخامات المصروفة</p>
            <p className="text-2xl font-black text-[#079B62] mt-1">
              {stats.totalConsumedCost.toLocaleString()} ج.م
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold">
            {successMsg}
          </div>
        )}

        {/* Consumptions Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">سجل استهلاك الخامات الفعلي</h2>
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
                  <th className="py-3 px-4">الخامة المصروفة</th>
                  <th className="py-3 px-4">الكمية المخططة</th>
                  <th className="py-3 px-4">الكمية المصروفة</th>
                  <th className="py-3 px-4">المستهلك الفعلي</th>
                  <th className="py-3 px-4">سعر الوحدة</th>
                  <th className="py-3 px-4">إجمالي التكلفة</th>
                  <th className="py-3 px-4">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {consumptions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      لا توجد أذون صرف خامات حتى الآن.
                    </td>
                  </tr>
                ) : (
                  consumptions.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/70 transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-900 block">{c.productionOrder.orderNumber}</span>
                        <span className="text-[10px] text-gray-400 line-clamp-1">
                          {c.productionOrder.productNameSnapshot}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-800">
                        {c.inventoryItem.name}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {c.plannedQuantity.toLocaleString()} {c.inventoryItem.unit}
                      </td>
                      <td className="py-3 px-4 font-bold font-mono text-gray-900">
                        {c.issuedQuantity.toLocaleString()} {c.inventoryItem.unit}
                      </td>
                      <td className="py-3 px-4 font-bold font-mono text-emerald-700">
                        {c.actualConsumed.toLocaleString()} {c.inventoryItem.unit}
                      </td>
                      <td className="py-3 px-4 font-mono">{c.unitCost.toLocaleString()} ج.م</td>
                      <td className="py-3 px-4 font-bold font-mono text-gray-900">
                        {c.totalCost.toLocaleString()} ج.م
                      </td>
                      <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                        {new Date(c.createdAt).toLocaleDateString("ar-EG", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Issue Material Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 bg-gradient-to-l from-[#14264A] to-[#079B62] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-emerald-300" />
                  <h3 className="font-bold text-base">صرف خامات لأمر تشغيل</h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleIssueMaterial} className="p-6 space-y-4">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                  >
                    <option value="">اختر أمر الإنتاج...</option>
                    {options.orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.orderNumber} - {o.productNameSnapshot}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">الخامة من المستودع *</label>
                  <select
                    value={inventoryItemId}
                    onChange={(e) => setInventoryItemId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                  >
                    <option value="">اختر الخامة المطلوبة...</option>
                    {options.inventoryItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} (متوفر: {item.currentStock} {item.unit})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedItem && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
                    <span>الرصيد المتاح بالمستودع:</span>
                    <strong className="font-mono text-sm">
                      {selectedItem.currentStock} {selectedItem.unit}
                    </strong>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      الكمية المخططة ({selectedItem?.unit || "وحدة"}) *
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      step="any"
                      value={plannedQuantity}
                      onChange={(e) => {
                        setPlannedQuantity(e.target.value);
                        if (!issuedQuantity) setIssuedQuantity(e.target.value);
                      }}
                      required
                      placeholder="500"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      الكمية المصروفة فعلياً ({selectedItem?.unit || "وحدة"}) *
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      step="any"
                      value={issuedQuantity}
                      onChange={(e) => setIssuedQuantity(e.target.value)}
                      required
                      placeholder="500"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#079B62] focus:outline-none"
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
                    className="px-6 py-2 bg-[#079B62] text-white rounded-xl text-xs font-bold hover:bg-[#068453] transition disabled:opacity-50"
                  >
                    {submitting ? "جاري الصرف..." : "تأكيد إذن الصرف"}
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
