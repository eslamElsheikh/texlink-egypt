"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  ShieldCheck,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  Calendar,
  Layers,
} from "lucide-react";

interface QualityInspection {
  id: string;
  stage: string;
  inspectedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  reworkQuantity: number;
  defectReasons: string | null;
  status: string;
  inspectorName: string | null;
  inspectionDate: string;
  productionOrder: {
    id: string;
    orderNumber: string;
    productNameSnapshot: string;
  };
}

export default function QualityControlPage() {
  const [inspections, setInspections] = useState<QualityInspection[]>([]);
  const [orders, setOrders] = useState<Array<{ id: string; orderNumber: string; productNameSnapshot: string }>>([]);
  const [stats, setStats] = useState({
    totalInspections: 0,
    totalInspected: 0,
    totalAccepted: 0,
    totalRejected: 0,
    passRate: 100,
  });

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [orderId, setOrderId] = useState("");
  const [stage, setStage] = useState("FINISHING");
  const [inspectedQty, setInspectedQty] = useState("");
  const [acceptedQty, setAcceptedQty] = useState("");
  const [rejectedQty, setRejectedQty] = useState("0");
  const [reworkQty, setReworkQty] = useState("0");
  const [status, setStatus] = useState("PASSED");
  const [inspectorName, setInspectorName] = useState("مراقب الجودة");
  const [defectReasons, setDefectReasons] = useState("");

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
        fetch("/api/factory/quality"),
        fetch("/api/auth/me").catch(() => null),
      ]);
      const json = await res.json();
      if (res.ok) {
        setInspections(json.inspections || []);
        if (json.orders) setOrders(json.orders);
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

  const handleInspectedChange = (val: string) => {
    setInspectedQty(val);
    const tot = parseInt(val, 10) || 0;
    const rej = parseInt(rejectedQty, 10) || 0;
    setAcceptedQty(String(Math.max(0, tot - rej)));
  };

  const handleRejectedChange = (val: string) => {
    setRejectedQty(val);
    const tot = parseInt(inspectedQty, 10) || 0;
    const rej = parseInt(val, 10) || 0;
    setAcceptedQty(String(Math.max(0, tot - rej)));
    if (rej > 0) {
      setStatus("PASSED_WITH_CONDITIONS");
    } else {
      setStatus("PASSED");
    }
  };

  const handleCreateInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/factory/quality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productionOrderId: orderId,
          stage,
          inspectedQuantity: inspectedQty,
          acceptedQuantity: acceptedQty,
          rejectedQuantity: rejectedQty,
          reworkQuantity: reworkQty,
          status,
          inspectorName,
          defectReasons,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل تسجيل فحص الجودة");

      setSuccessMsg("تم تسجيل محضر فحص الجودة بنجاح ✓");
      setModalOpen(false);
      setInspectedQty("");
      setAcceptedQty("");
      setRejectedQty("0");
      setDefectReasons("");
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
              <span className="p-2 bg-emerald-50 text-[#079B62] rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">إدارة وفحص الجودة (QC & QA)</h1>
            </div>
            <p className="text-gray-500 text-xs md:text-sm mt-1">
              محاضر الفحص المرحلي والنهائي، نسبة المطابقة للمواصفات التصديرية، وتصاريح استلام المخازن.
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
            فحص جودة جديد
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">إجمالي القطع المفحوصة</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{stats.totalInspected.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">القطع المقبولة والمطابقة</p>
            <p className="text-2xl font-black text-[#079B62] mt-1">{stats.totalAccepted.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">القطع المرفوضة</p>
            <p className="text-2xl font-black text-red-600 mt-1">{stats.totalRejected.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">معدل اجتياز الجودة (Pass Rate)</p>
            <p className="text-2xl font-black text-[#079B62] mt-1">{stats.passRate}%</p>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold">
            {successMsg}
          </div>
        )}

        {/* Inspections Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">سجل محاضر فحص الجودة</h2>
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
                  <th className="py-3 px-4">الكمية المفحوصة</th>
                  <th className="py-3 px-4">القطع المقبولة</th>
                  <th className="py-3 px-4">القطع المرفوضة</th>
                  <th className="py-3 px-4">المراقب</th>
                  <th className="py-3 px-4">نتيجة الفحص</th>
                  <th className="py-3 px-4">أسباب الرفض والملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {inspections.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-400">
                      لا توجد محاضر فحص جودة مسجلة حتى الآن.
                    </td>
                  </tr>
                ) : (
                  inspections.map((i) => (
                    <tr key={i.id} className="hover:bg-gray-50/70 transition">
                      <td className="py-3 px-4 font-mono text-[11px] text-gray-500">
                        {new Date(i.inspectionDate).toLocaleDateString("ar-EG", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900">
                        {i.productionOrder.orderNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold text-[10px]">
                          {i.stage}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900">{i.inspectedQuantity.toLocaleString()}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">{i.acceptedQuantity.toLocaleString()}</td>
                      <td className="py-3 px-4 font-bold text-red-600">
                        {i.rejectedQuantity > 0 ? i.rejectedQuantity.toLocaleString() : "0"}
                      </td>
                      <td className="py-3 px-4 text-gray-700">{i.inspectorName || "-"}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            i.status === "PASSED"
                              ? "bg-emerald-100 text-emerald-800"
                              : i.status === "PASSED_WITH_CONDITIONS"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {i.status === "PASSED"
                            ? "مطابق للمواصفات ✓"
                            : i.status === "PASSED_WITH_CONDITIONS"
                            ? "مقبول مع معالجة"
                            : "مرفوض"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-[11px] max-w-xs truncate">
                        {i.defectReasons || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quality Inspection Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 bg-gradient-to-l from-[#14264A] to-[#079B62] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-300" />
                  <h3 className="font-bold text-base">تسجيل محضر فحص جودة جديد</h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateInspection} className="p-6 space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">أمر الإنتاج *</label>
                    <select
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                    >
                      <option value="">اختر أمر الإنتاج...</option>
                      {orders.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.orderNumber} - {o.productNameSnapshot}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">مرحلة الفحص *</label>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                    >
                      <option value="KNITTING">فحص خام التريكو</option>
                      <option value="CUTTING">فحص القص والماركر</option>
                      <option value="SEWING">فحص تجميع الخياطة</option>
                      <option value="FINISHING">فحص الكوي والتشطيب</option>
                      <option value="FINAL_INSPECTION">فحص نهائي قبل الشحن</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">الكمية المفحوصة *</label>
                    <input
                      type="number"
                      min="1"
                      value={inspectedQty}
                      onChange={(e) => handleInspectedChange(e.target.value)}
                      required
                      placeholder="500"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-700 mb-1">القطع المقبولة *</label>
                    <input
                      type="number"
                      min="0"
                      value={acceptedQty}
                      onChange={(e) => setAcceptedQty(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-emerald-300 bg-emerald-50/50 rounded-lg text-xs font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-red-700 mb-1">القطع المرفوضة</label>
                    <input
                      type="number"
                      min="0"
                      value={rejectedQty}
                      onChange={(e) => handleRejectedChange(e.target.value)}
                      className="w-full px-3 py-2 border border-red-300 bg-red-50/50 rounded-lg text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">اسم مراقب الجودة</label>
                    <input
                      type="text"
                      value={inspectorName}
                      onChange={(e) => setInspectorName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">قرار الفحص</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                    >
                      <option value="PASSED">مطابق تماماً (PASSED)</option>
                      <option value="PASSED_WITH_CONDITIONS">مقبول مع شروط ومعالجة</option>
                      <option value="REJECTED">مرفوض بالكامل (REJECTED)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">أسباب العيوب وتوصيات التحسين</label>
                  <textarea
                    value={defectReasons}
                    onChange={(e) => setDefectReasons(e.target.value)}
                    rows={2}
                    placeholder="ملاحظات حول دقة الخياطة، ثبات المقاسات، أو نظافة الخيوط..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
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
                    className="px-6 py-2 bg-[#079B62] text-white rounded-xl text-xs font-bold hover:bg-[#068453] transition disabled:opacity-50"
                  >
                    {submitting ? "جاري الاعتماد..." : "اعتماد محضر الفحص"}
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
