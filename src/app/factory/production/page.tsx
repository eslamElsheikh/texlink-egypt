"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Layers,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Clock,
  User,
  Cpu,
  X,
  Sparkles,
  QrCode,
  ScanLine,
} from "lucide-react";

interface ProductionEntry {
  id: string;
  stage: string;
  productionDate: string;
  producedQuantity: number;
  goodQuantity: number;
  defectiveQuantity: number;
  notes: string | null;
  productionOrder: {
    id: string;
    orderNumber: string;
    productNameSnapshot: string;
  };
  machine: {
    id: string;
    code: string;
    name: string;
  } | null;
  employee: {
    id: string;
    code: string;
    name: string;
  } | null;
  shift: {
    id: string;
    name: string;
  } | null;
}

export default function ProductionTrackingPage() {
  const [entries, setEntries] = useState<ProductionEntry[]>([]);
  const [options, setOptions] = useState<{
    orders: Array<{ id: string; orderNumber: string; productNameSnapshot: string }>;
    machines: Array<{ id: string; code: string; name: string }>;
    employees: Array<{ id: string; code: string; name: string; jobTitle: string }>;
    shifts: Array<{ id: string; name: string }>;
  }>({ orders: [], machines: [], employees: [], shifts: [] });

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [scanInput, setScanInput] = useState("");
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  // Form State
  const [orderId, setOrderId] = useState("");
  const [machineId, setMachineId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [shiftId, setShiftId] = useState("");
  const [stage, setStage] = useState("KNITTING");
  const [producedQty, setProducedQty] = useState("");
  const [goodQty, setGoodQty] = useState("");
  const [defectiveQty, setDefectiveQty] = useState("0");
  const [defectType, setDefectType] = useState("KNITTING_DEFECT");
  const [notes, setNotes] = useState("");

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
        fetch("/api/factory/production"),
        fetch("/api/auth/me").catch(() => null),
      ]);
      const json = await res.json();
      if (res.ok) {
        setEntries(json.entries || []);
        if (json.options) setOptions(json.options);
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

  const handleTotalChange = (val: string) => {
    setProducedQty(val);
    const tot = parseInt(val, 10) || 0;
    const def = parseInt(defectiveQty, 10) || 0;
    setGoodQty(String(Math.max(0, tot - def)));
  };

  const handleDefectChange = (val: string) => {
    setDefectiveQty(val);
    const tot = parseInt(producedQty, 10) || 0;
    const def = parseInt(val, 10) || 0;
    setGoodQty(String(Math.max(0, tot - def)));
  };
  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setScanFeedback(null);
    const cleaned = scanInput.trim().toUpperCase();

    const matched = options.orders.find((o) => {
      const ordUpper = o.orderNumber.toUpperCase();
      return cleaned.includes(ordUpper) || cleaned.includes(o.id.toUpperCase());
    });

    if (matched) {
      setOrderId(matched.id);
      setScanModalOpen(false);
      setScanInput("");
      setModalOpen(true);
      setSuccessMsg(`تم مسح الباركود بنجاح والتعرف على: ${matched.orderNumber} (${matched.productNameSnapshot})`);
    } else {
      setScanFeedback(`لم يتم العثور على أمر تشغيل نشط يطابق الكود: "${scanInput}"`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/factory/production", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productionOrderId: orderId,
          machineId: machineId || null,
          employeeId: employeeId || null,
          shiftId: shiftId || null,
          stage,
          producedQuantity: producedQty,
          goodQuantity: goodQty,
          defectiveQuantity: defectiveQty,
          defectType,
          notes,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "فشل تسجيل الإنتاج");
      }

      setSuccessMsg("تم تسجيل الإنتاج اليومي وتحديث أوامر الإنتاج بنجاح ✓");
      setModalOpen(false);
      // Reset form
      setProducedQty("");
      setGoodQty("");
      setDefectiveQty("0");
      setNotes("");
      fetchData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  const totalProduced = entries.reduce((s, e) => s + e.producedQuantity, 0);
  const totalGood = entries.reduce((s, e) => s + e.goodQuantity, 0);
  const totalDefect = entries.reduce((s, e) => s + e.defectiveQuantity, 0);

  return (
    <DashboardLayout user={user} currentRole="FACTORY">
      <div className="space-y-6 pb-12 font-sans" dir="rtl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-50 text-[#079B62] rounded-xl">
                <Layers className="w-6 h-6" />
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">إدارة الإنتاج والتشغيل اليومي</h1>
            </div>
            <p className="text-gray-500 text-xs md:text-sm mt-1">
              تسجيل سريع لإنتاج الورديات، ربط الماكينات بالعمال، والتحقق الفوري من سلامة القطع.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setScanFeedback(null);
                setScanInput("");
                setScanModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-50 text-[#5932A8] hover:bg-purple-100 border border-purple-200 rounded-xl font-bold text-sm transition shadow-sm"
              title="مسح كود الدفعة بالكاميرا أو القارئ"
            >
              <QrCode className="w-5 h-5" />
              <span>مسح باركود الدفعة</span>
            </button>

            <button
              onClick={() => {
                setErrorMsg(null);
                setSuccessMsg(null);
                setModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#079B62] text-white rounded-xl font-bold text-sm hover:bg-[#068453] transition shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span>تسجيل إنتاج يدوي</span>
            </button>
          </div>
        </div>
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">إجمالي الإنتاج المسجل</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{totalProduced.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">القطع السليمة المطابقة</p>
            <p className="text-2xl font-extrabold text-[#079B62] mt-1">{totalGood.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">القطع التالفة / المعيبة</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">{totalDefect.toLocaleString()}</p>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold">
            {successMsg}
          </div>
        )}

        {/* Entries Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">سجل الإدخالات اليومية</h2>
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
                  <th className="py-3 px-4">التاريخ والوقت</th>
                  <th className="py-3 px-4">أمر الإنتاج</th>
                  <th className="py-3 px-4">المرحلة</th>
                  <th className="py-3 px-4">الماكينة</th>
                  <th className="py-3 px-4">المشغل / العامل</th>
                  <th className="py-3 px-4">الوردية</th>
                  <th className="py-3 px-4">الإنتاج الكلي</th>
                  <th className="py-3 px-4">السليم</th>
                  <th className="py-3 px-4">التالف</th>
                  <th className="py-3 px-4">ملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-gray-400">
                      لا توجد تسجيلات إنتاج حتى الآن. اضغط على زر "تسجيل إنتاج يومي" لبدء الإدخال.
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50/70 transition">
                      <td className="py-3 px-4 font-mono text-[11px] text-gray-500">
                        {new Date(entry.productionDate).toLocaleDateString("ar-EG", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-900">{entry.productionOrder.orderNumber}</span>
                        <span className="block text-[10px] text-gray-400 line-clamp-1">
                          {entry.productionOrder.productNameSnapshot}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold text-[10px]">
                          {entry.stage}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-700">
                        {entry.machine ? `${entry.machine.code} - ${entry.machine.name}` : "-"}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {entry.employee ? entry.employee.name : "-"}
                      </td>
                      <td className="py-3 px-4 text-gray-500">{entry.shift?.name || "-"}</td>
                      <td className="py-3 px-4 font-bold text-gray-900">{entry.producedQuantity.toLocaleString()}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">{entry.goodQuantity.toLocaleString()}</td>
                      <td className="py-3 px-4 font-bold text-amber-600">
                        {entry.defectiveQuantity > 0 ? entry.defectiveQuantity.toLocaleString() : "0"}
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-[11px] max-w-xs truncate">
                        {entry.notes || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fast Floor Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 bg-gradient-to-l from-[#14264A] to-[#254682] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-base">تسجيل إنتاج يومي جديد (صالة المصنع)</h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">أمر الإنتاج *</label>
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
                    <label className="block text-xs font-bold text-gray-700 mb-1">المرحلة التشغيلية *</label>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                    >
                      <option value="MATERIAL_PREP">تجهيز الغزول والخامات</option>
                      <option value="KNITTING">حياكة وتريكو دائري</option>
                      <option value="CUTTING">قص وتفصيل</option>
                      <option value="SEWING">خياطة وتجميع (أوفر وسنجر)</option>
                      <option value="PRINTING">طباعة وتطريز</option>
                      <option value="FINISHING">كوي وتشطيب</option>
                      <option value="QUALITY_INSPECTION">فحص جودة نهائي</option>
                      <option value="PACKAGING">تعبئة وتغليف</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">الماكينة (اختياري)</label>
                    <select
                      value={machineId}
                      onChange={(e) => setMachineId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                    >
                      <option value="">اختر الماكينة...</option>
                      {options.machines.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.code} - {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">المشغل / العامل</label>
                    <select
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                    >
                      <option value="">اختر العامل...</option>
                      {options.employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.code} - {emp.name} ({emp.jobTitle})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">الوردية</label>
                    <select
                      value={shiftId}
                      onChange={(e) => setShiftId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                    >
                      <option value="">اختر الوردية...</option>
                      {options.shifts.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">نوع العيب (عند وجود هالك)</label>
                    <select
                      value={defectType}
                      onChange={(e) => setDefectType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                    >
                      <option value="KNITTING_DEFECT">عيوب نسيج وتريكو</option>
                      <option value="BROKEN_NEEDLE">كسر إبرة وتنسيل</option>
                      <option value="OIL_STAIN">بقع زيت وتشحيم</option>
                      <option value="FABRIC_DEFECT">ثقوب وشوائب بالقماش</option>
                      <option value="SEWING_DEFECT">أخطاء خياطة وتجميع</option>
                      <option value="SIZE_MISMATCH">اختلاف مقاسات وتلبيس</option>
                    </select>
                  </div>
                </div>

                {/* Quantities with live invariant validation */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                  <p className="text-xs font-bold text-gray-800">
                    توزيع الكميات (قاعدة التوازن: إجمالي = سليم + تالف)
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">إجمالي المنتج *</label>
                      <input
                        type="number"
                        min="0"
                        value={producedQty}
                        onChange={(e) => handleTotalChange(e.target.value)}
                        required
                        placeholder="1000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#079B62]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-emerald-700 mb-1">قطع سليمة *</label>
                      <input
                        type="number"
                        min="0"
                        value={goodQty}
                        onChange={(e) => setGoodQty(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-emerald-300 bg-emerald-50/50 rounded-lg text-sm font-bold text-emerald-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-amber-700 mb-1">قطع تالفة / هالك</label>
                      <input
                        type="number"
                        min="0"
                        value={defectiveQty}
                        onChange={(e) => handleDefectChange(e.target.value)}
                        className="w-full px-3 py-2 border border-amber-300 bg-amber-50/50 rounded-lg text-sm font-bold text-amber-800 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ملاحظات التشغيل</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="ملاحظات حول جودة الغزل، سرعة الماكينة، أو استبدال الإبر..."
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
                    {submitting ? "جاري الحفظ..." : "تأكيد وتسجيل الإنتاج"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* QR / Barcode Floor Scanner Modal */}
        {scanModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 bg-gradient-to-l from-[#14264A] to-[#5932A8] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ScanLine className="w-5 h-5 text-purple-300" />
                  <h3 className="font-bold text-base">مسح باركود بطاقة تتبع الدفعة</h3>
                </div>
                <button
                  onClick={() => setScanModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleScanSubmit} className="p-6 space-y-4">
                <div className="text-center space-y-2 py-2">
                  <div className="w-16 h-16 rounded-2xl bg-purple-50 border-2 border-dashed border-purple-300 flex items-center justify-center mx-auto text-[#5932A8]">
                    <QrCode className="w-8 h-8 animate-pulse" />
                  </div>
                  <p className="text-xs text-gray-600">
                    وجّه قارئ الباركود أو اكتب كود الدفعة / رقم أمر الإنتاج (مثل: <strong>ORD-1025</strong>)
                  </p>
                </div>

                {scanFeedback && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold">
                    {scanFeedback}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    كود الباركود / اللوط الممسوح *
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    placeholder="امسح هنا أو اكتب ORD-1025..."
                    className="w-full px-4 py-2.5 border-2 border-purple-300 rounded-xl text-sm font-mono font-bold text-center focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setScanModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#5932A8] text-white rounded-xl text-xs font-bold hover:bg-[#49278f] transition"
                  >
                    التعرف على الدفعة ومتابعة الإدخال
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
