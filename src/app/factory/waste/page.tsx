"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  AlertTriangle,
  Plus,
  RefreshCw,
  Repeat,
  Trash2,
  DollarSign,
  PieChart,
  ShieldAlert,
  X,
  Layers,
} from "lucide-react";

interface WasteRecord {
  id: string;
  stage: string;
  defectType: string;
  quantity: number;
  reworkQuantity: number;
  reworkAccepted: number;
  scrappedQuantity: number;
  estimatedCost: number;
  notes: string | null;
  createdAt: string;
  productionOrder: {
    id: string;
    orderNumber: string;
    productNameSnapshot: string;
  } | null;
  machine: {
    id: string;
    code: string;
    name: string;
  } | null;
}

export default function WasteManagementPage() {
  const [records, setRecords] = useState<WasteRecord[]>([]);
  const [options, setOptions] = useState<{
    orders: Array<{ id: string; orderNumber: string; productNameSnapshot: string }>;
    machines: Array<{ id: string; code: string; name: string }>;
  }>({ orders: [], machines: [] });
  const [stats, setStats] = useState<{
    totalDefective: number;
    totalRework: number;
    totalReworkAccepted: number;
    totalScrapped: number;
    totalEstimatedLoss: number;
    thresholdPct: number;
    byDefectType: Record<string, number>;
  }>({
    totalDefective: 0,
    totalRework: 0,
    totalReworkAccepted: 0,
    totalScrapped: 0,
    totalEstimatedLoss: 0,
    thresholdPct: 5.0,
    byDefectType: {},
  });

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [orderId, setOrderId] = useState("");
  const [machineId, setMachineId] = useState("");
  const [stage, setStage] = useState("KNITTING");
  const [defectType, setDefectType] = useState("KNITTING_DEFECT");
  const [quantity, setQuantity] = useState("");
  const [reworkQuantity, setReworkQuantity] = useState("0");
  const [reworkAccepted, setReworkAccepted] = useState("0");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [notes, setNotes] = useState("");

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
        fetch("/api/factory/waste"),
        fetch("/api/auth/me").catch(() => null),
      ]);
      const json = await res.json();
      if (res.ok) {
        setRecords(json.records || []);
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

  const handleCreateWaste = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/factory/waste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productionOrderId: orderId || null,
          machineId: machineId || null,
          stage,
          defectType,
          quantity,
          reworkQuantity,
          reworkAccepted,
          estimatedCost,
          notes,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل تسجيل الهالك");

      setSuccessMsg("تم تسجيل بيانات الهالك وحساب الفاقد بنجاح ✓");
      setModalOpen(false);
      setQuantity("");
      setNotes("");
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
              <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">الهالك والفاقد وإعادة التشغيل (Rework)</h1>
            </div>
            <p className="text-gray-500 text-xs md:text-sm mt-1">
              مراقبة نسب الفاقد حسب المرحلة، تصنيف عيوب التريكو والخياطة، وتتبع القطع المعالجة والسكراب النهائي.
            </p>
          </div>

          <button
            onClick={() => {
              setErrorMsg(null);
              setModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition shadow-sm"
          >
            <Plus className="w-5 h-5" />
            تسجيل هالك يدوي
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">إجمالي القطع المعيبة</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{stats.totalDefective.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">قطع دخلت إعادة تشغيل (Rework)</p>
            <p className="text-2xl font-black text-blue-600 mt-1">{stats.totalRework.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">تم إنقاذها بعد المعالجة</p>
            <p className="text-2xl font-black text-[#079B62] mt-1">{stats.totalReworkAccepted.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">سكراب نهائي تالف</p>
            <p className="text-2xl font-black text-red-600 mt-1">{stats.totalScrapped.toLocaleString()}</p>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold">
            {successMsg}
          </div>
        )}

        {/* Waste Records Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">سجل عيوب الإنتاج والفاقد</h2>
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
                  <th className="py-3 px-4">التاريخ</th>
                  <th className="py-3 px-4">أمر الإنتاج</th>
                  <th className="py-3 px-4">المرحلة</th>
                  <th className="py-3 px-4">نوع العيب</th>
                  <th className="py-3 px-4">الماكينة</th>
                  <th className="py-3 px-4">الكمية المعيبة</th>
                  <th className="py-3 px-4">معاد تشغيله</th>
                  <th className="py-3 px-4">سكراب نهائي</th>
                  <th className="py-3 px-4">التكلفة التقديرية</th>
                  <th className="py-3 px-4">ملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-gray-400">
                      لا توجد سجلات هالك حتى الآن.
                    </td>
                  </tr>
                ) : (
                  records.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/70 transition">
                      <td className="py-3 px-4 font-mono text-[11px] text-gray-500">
                        {new Date(r.createdAt).toLocaleDateString("ar-EG", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {r.productionOrder ? r.productionOrder.orderNumber : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-semibold">
                          {r.stage}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold">
                          {r.defectType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {r.machine ? r.machine.code : "-"}
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900">{r.quantity.toLocaleString()}</td>
                      <td className="py-3 px-4 font-bold text-blue-600">
                        {r.reworkQuantity > 0 ? `${r.reworkQuantity} (${r.reworkAccepted} ناجح)` : "0"}
                      </td>
                      <td className="py-3 px-4 font-bold text-red-600">
                        {r.scrappedQuantity.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-gray-900">
                        {r.estimatedCost.toLocaleString()} ج.م
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-[11px] max-w-xs truncate">
                        {r.notes || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fast Waste Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 bg-gradient-to-l from-[#14264A] to-amber-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-300" />
                  <h3 className="font-bold text-base">تسجيل هالك وعيوب تصنيع</h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateWaste} className="p-6 space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">أمر الإنتاج</label>
                    <select
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="">عام / غير محدد</option>
                      {options.orders.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.orderNumber}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">الماكينة المتسببة</label>
                    <select
                      value={machineId}
                      onChange={(e) => setMachineId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="">غير محدد...</option>
                      {options.machines.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.code} - {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">المرحلة *</label>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="KNITTING">تريكو دائري</option>
                      <option value="CUTTING">قص وتفصيل</option>
                      <option value="SEWING">خياطة وأوفرلوك</option>
                      <option value="PRINTING">طباعة وتطريز</option>
                      <option value="FINISHING">كوي وتشطيب</option>
                      <option value="PACKAGING">تعبئة وتغليف</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">نوع العيب *</label>
                    <select
                      value={defectType}
                      onChange={(e) => setDefectType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="BROKEN_NEEDLE">كسر إبر وتنسيل</option>
                      <option value="KNITTING_DEFECT">عيوب نسيج وغرز مفقودة</option>
                      <option value="OIL_STAIN">بقع زيت وتشحيم</option>
                      <option value="FABRIC_DEFECT">ثقوب وشوائب بالقماش</option>
                      <option value="SEWING_DEFECT">أخطاء خياطة وتجميع</option>
                      <option value="SIZE_MISMATCH">اختلاف مقاسات</option>
                      <option value="OTHER">أخرى</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">إجمالي الهالك *</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                      placeholder="50"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-blue-700 mb-1">إعادة تشغيل</label>
                    <input
                      type="number"
                      min="0"
                      value={reworkQuantity}
                      onChange={(e) => setReworkQuantity(e.target.value)}
                      className="w-full px-3 py-2 border border-blue-300 bg-blue-50/50 rounded-lg text-xs font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-700 mb-1">معالج بنجاح</label>
                    <input
                      type="number"
                      min="0"
                      value={reworkAccepted}
                      onChange={(e) => setReworkAccepted(e.target.value)}
                      className="w-full px-3 py-2 border border-emerald-300 bg-emerald-50/50 rounded-lg text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">التكلفة التقديرية للفاقد (ج.م)</label>
                  <input
                    type="number"
                    min="0"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    placeholder="1500"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ملاحظات وسبب العيب</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
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
                    className="px-6 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition disabled:opacity-50"
                  >
                    {submitting ? "جاري الحفظ..." : "تسجيل الهالك"}
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
