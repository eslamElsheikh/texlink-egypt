"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Layers,
  Wrench,
  ShieldCheck,
  QrCode,
  ArrowRight,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
  User,
  Sparkles,
} from "lucide-react";

export default function ShopFloorPWAPage() {
  const [activeMode, setActiveMode] = useState<"PROD" | "BREAKDOWN" | "QC">("PROD");
  const [orders, setOrders] = useState<Array<{ id: string; orderNumber: string; productNameSnapshot: string }>>([]);
  const [machines, setMachines] = useState<Array<{ id: string; code: string; name: string; status: string }>>([]);
  const [employees, setEmployees] = useState<Array<{ id: string; code: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "SUCCESS" | "ERROR"; msg: string } | null>(null);

  // Production Form State
  const [orderId, setOrderId] = useState("");
  const [machineId, setMachineId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [stage, setStage] = useState("KNITTING");
  const [goodCount, setGoodCount] = useState(100);
  const [defectCount, setDefectCount] = useState(0);

  // Breakdown Form State
  const [maintMachineId, setMaintMachineId] = useState("");
  const [issueType, setIssueType] = useState("NEEDLE_BREAKAGE");
  const [priority, setPriority] = useState("HIGH");
  const [issueDesc, setIssueDesc] = useState("");

  // QC Form State
  const [qcOrderId, setQcOrderId] = useState("");
  const [qcInspected, setQcInspected] = useState(100);
  const [qcRejected, setQcRejected] = useState(0);
  const [qcStatus, setQcStatus] = useState("PASSED");

  useEffect(() => {
    fetchFloorData();
  }, []);

  const fetchFloorData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/factory/production");
      const json = await res.json();
      if (res.ok && json.options) {
        setOrders(json.options.orders || []);
        setMachines(json.options.machines || []);
        setEmployees(json.options.employees || []);
        if (json.options.orders?.length > 0 && !orderId) {
          setOrderId(json.options.orders[0].id);
          setQcOrderId(json.options.orders[0].id);
        }
        if (json.options.machines?.length > 0 && !machineId) {
          setMachineId(json.options.machines[0].id);
          setMaintMachineId(json.options.machines[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const bumpGood = (amount: number) => {
    setGoodCount((prev) => Math.max(0, prev + amount));
  };

  const bumpDefect = (amount: number) => {
    setDefectCount((prev) => Math.max(0, prev + amount));
  };

  const handleProductionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    try {
      const total = goodCount + defectCount;
      const res = await fetch("/api/factory/production", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productionOrderId: orderId,
          machineId: machineId || null,
          employeeId: employeeId || null,
          stage,
          producedQuantity: total,
          goodQuantity: goodCount,
          defectiveQuantity: defectCount,
          defectType: "KNITTING_DEFECT",
          notes: "إدخال سريع من تطبيق صالة التشغيل PWA",
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل تسجيل الإنتاج");

      setFeedback({
        type: "SUCCESS",
        msg: `✓ تم تسجيل ${total} قطعة (${goodCount} سليم) بنجاح في خط التشغيل!`,
      });
      // Vibrate device if supported
      if (typeof window !== "undefined" && window.navigator && "vibrate" in window.navigator) {
        window.navigator.vibrate([100, 50, 100]);
      }
    } catch (err: unknown) {
      setFeedback({
        type: "ERROR",
        msg: err instanceof Error ? err.message : "حدث خطأ أثناء التسجيل",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBreakdownSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/factory/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          machineId: maintMachineId,
          issueType,
          priority,
          description: issueDesc || "بلاغ عطل عاجل من صالة التشغيل",
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل تسجيل البلاغ");

      setFeedback({
        type: "SUCCESS",
        msg: "✓ تم إيقاف الماكينة وتسجيل بلاغ العطل لفريق الصيانة!",
      });
      setIssueDesc("");
      fetchFloorData();
    } catch (err: unknown) {
      setFeedback({
        type: "ERROR",
        msg: err instanceof Error ? err.message : "حدث خطأ أثناء الإبلاغ",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleQCSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    try {
      const accepted = Math.max(0, qcInspected - qcRejected);
      const res = await fetch("/api/factory/quality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productionOrderId: qcOrderId,
          stage: "FINISHING",
          inspectedQuantity: qcInspected,
          acceptedQuantity: accepted,
          rejectedQuantity: qcRejected,
          status: qcStatus,
          inspectorName: "مشرف الصالة (Floor PWA)",
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل تسجيل فحص الجودة");

      setFeedback({
        type: "SUCCESS",
        msg: `✓ تم اعتماد محضر الجودة (${accepted} قطعة مقبولة) بنجاح!`,
      });
    } catch (err: unknown) {
      setFeedback({
        type: "ERROR",
        msg: err instanceof Error ? err.message : "حدث خطأ أثناء اعتماد الجودة",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1A33] text-white flex flex-col font-sans select-none" dir="rtl">
      {/* PWA Mobile Header */}
      <header className="p-4 bg-[#14264A] border-b border-white/10 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
              <span>صالة التشغيل السريعة</span>
              <span className="text-[10px] bg-[#079B62] px-1.5 py-0.5 rounded font-mono">PWA</span>
            </h1>
            <p className="text-[10px] text-white/60">TexLink Factory Floor Supervisor Mode</p>
          </div>
        </div>

        <Link
          href="/factory/dashboard"
          className="text-xs font-bold text-white/80 hover:text-white bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 transition flex items-center gap-1"
        >
          <span>لوحة التحكم الكاملة</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Mode Switcher Tabs */}
      <nav className="p-2 bg-[#12213F] border-b border-white/10 flex gap-1">
        <button
          onClick={() => {
            setActiveMode("PROD");
            setFeedback(null);
          }}
          className={`flex-1 py-3 px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
            activeMode === "PROD"
              ? "bg-[#079B62] text-white shadow-lg scale-[1.02]"
              : "text-white/70 hover:bg-white/5"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>تسجيل إنتاج فوري</span>
        </button>

        <button
          onClick={() => {
            setActiveMode("BREAKDOWN");
            setFeedback(null);
          }}
          className={`flex-1 py-3 px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
            activeMode === "BREAKDOWN"
              ? "bg-amber-500 text-white shadow-lg scale-[1.02]"
              : "text-white/70 hover:bg-white/5"
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>عطل ماكينة</span>
        </button>

        <button
          onClick={() => {
            setActiveMode("QC");
            setFeedback(null);
          }}
          className={`flex-1 py-3 px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
            activeMode === "QC"
              ? "bg-[#5932A8] text-white shadow-lg scale-[1.02]"
              : "text-white/70 hover:bg-white/5"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>فحص جودة</span>
        </button>
      </nav>

      {/* Main Container */}
      <main className="flex-1 p-4 max-w-lg mx-auto w-full space-y-4">
        {feedback && (
          <div
            className={`p-4 rounded-2xl text-xs font-extrabold flex items-center gap-2 animate-in fade-in slide-in-from-top duration-200 shadow-md ${
              feedback.type === "SUCCESS"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-red-500/20 text-red-300 border border-red-500/40"
            }`}
          >
            <span>{feedback.msg}</span>
          </div>
        )}

        {/* 1. Fast Production Mode */}
        {activeMode === "PROD" && (
          <form onSubmit={handleProductionSubmit} className="space-y-4">
            <div className="bg-[#14264A] p-4 rounded-2xl border border-white/10 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-white/70 mb-1">أمر الإنتاج المستهدف *</label>
                <select
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  required
                  className="w-full p-3 bg-[#0E1A33] border border-white/20 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                >
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.orderNumber} - {o.productNameSnapshot}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">الماكينة *</label>
                  <select
                    value={machineId}
                    onChange={(e) => setMachineId(e.target.value)}
                    className="w-full p-2.5 bg-[#0E1A33] border border-white/20 rounded-xl text-xs text-white"
                  >
                    {machines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.code} ({m.name.slice(0, 18)}...)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">المرحلة *</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full p-2.5 bg-[#0E1A33] border border-white/20 rounded-xl text-xs text-white"
                  >
                    <option value="KNITTING">تريكو وحياكة</option>
                    <option value="CUTTING">قص وتفصيل</option>
                    <option value="SEWING">خياطة وأوفرلوك</option>
                    <option value="FINISHING">كوي وتشطيب</option>
                    <option value="PACKAGING">تعبئة وتغليف</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Big Touch Quantities */}
            <div className="bg-[#14264A] p-4 rounded-2xl border border-white/10 space-y-4">
              {/* Good Pieces Counter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-400">قطع سليمة مطابقة (Good)</span>
                  <span className="text-2xl font-black font-mono text-emerald-400">{goodCount}</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => bumpGood(10)}
                    className="py-2.5 bg-emerald-600/30 hover:bg-emerald-600/50 active:scale-95 text-emerald-300 font-bold rounded-xl text-xs border border-emerald-500/30"
                  >
                    +10
                  </button>
                  <button
                    type="button"
                    onClick={() => bumpGood(50)}
                    className="py-2.5 bg-emerald-600/30 hover:bg-emerald-600/50 active:scale-95 text-emerald-300 font-bold rounded-xl text-xs border border-emerald-500/30"
                  >
                    +50
                  </button>
                  <button
                    type="button"
                    onClick={() => bumpGood(100)}
                    className="py-2.5 bg-emerald-600 text-white active:scale-95 font-black rounded-xl text-xs shadow-md"
                  >
                    +100
                  </button>
                  <button
                    type="button"
                    onClick={() => bumpGood(-50)}
                    className="py-2.5 bg-white/5 hover:bg-white/10 active:scale-95 text-white/70 font-bold rounded-xl text-xs border border-white/10"
                  >
                    -50
                  </button>
                </div>
              </div>

              {/* Defect Counter */}
              <div className="space-y-2 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-amber-400">قطع تالفة / هالك (Defective)</span>
                  <span className="text-2xl font-black font-mono text-amber-400">{defectCount}</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => bumpDefect(1)}
                    className="py-2.5 bg-amber-600/30 hover:bg-amber-600/50 active:scale-95 text-amber-300 font-bold rounded-xl text-xs border border-amber-500/30"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => bumpDefect(5)}
                    className="py-2.5 bg-amber-600/30 hover:bg-amber-600/50 active:scale-95 text-amber-300 font-bold rounded-xl text-xs border border-amber-500/30"
                  >
                    +5
                  </button>
                  <button
                    type="button"
                    onClick={() => bumpDefect(10)}
                    className="py-2.5 bg-amber-600 text-white active:scale-95 font-black rounded-xl text-xs shadow-md"
                  >
                    +10
                  </button>
                  <button
                    type="button"
                    onClick={() => setDefectCount(0)}
                    className="py-2.5 bg-white/5 hover:bg-white/10 active:scale-95 text-white/70 font-bold rounded-xl text-xs border border-white/10"
                  >
                    تصفير
                  </button>
                </div>
              </div>
            </div>

            {/* Big Action Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-[#079B62] hover:bg-[#068453] active:scale-[0.99] text-white rounded-2xl text-base font-black transition shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{submitting ? "جاري الحفظ والترحيل..." : "تأكيد وتسجيل الإنتاج الفوري"}</span>
            </button>
          </form>
        )}

        {/* 2. Fast Breakdown Mode */}
        {activeMode === "BREAKDOWN" && (
          <form onSubmit={handleBreakdownSubmit} className="space-y-4">
            <div className="bg-[#14264A] p-4 rounded-2xl border border-white/10 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-white/70 mb-1">الماكينة المتعطلة *</label>
                <select
                  value={maintMachineId}
                  onChange={(e) => setMaintMachineId(e.target.value)}
                  required
                  className="w-full p-3 bg-[#0E1A33] border border-white/20 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.code} - {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">نوع العطل *</label>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="w-full p-2.5 bg-[#0E1A33] border border-white/20 rounded-xl text-xs text-white"
                  >
                    <option value="NEEDLE_BREAKAGE">كسر إبر أو عيوب سلندر</option>
                    <option value="MOTOR_FAILURE">عطل محرك سيرفو أو باور</option>
                    <option value="BELT_WEAR">تآكل سيور ونقل حركة</option>
                    <option value="ELECTRICAL">عطل كهربائي</option>
                    <option value="SCHEDULED_PREVENTIVE">صيانة وقائية دورية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">الأولوية</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full p-2.5 bg-[#0E1A33] border border-white/20 rounded-xl text-xs text-white"
                  >
                    <option value="HIGH">مرتفعة (توقف الخط)</option>
                    <option value="URGENT">طوارئ فورية</option>
                    <option value="MEDIUM">متوسطة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/70 mb-1">وصف العطل السريع</label>
                <input
                  type="text"
                  value={issueDesc}
                  onChange={(e) => setIssueDesc(e.target.value)}
                  placeholder="مثال: صوت احتكاك شديد بالسلندر الرابع أو كسر إبرة..."
                  className="w-full p-3 bg-[#0E1A33] border border-white/20 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-white rounded-2xl text-base font-black transition shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-5 h-5" />
              <span>{submitting ? "جاري الإبلاغ..." : "إيقاف الماكينة وإبلاغ الصيانة فوراً"}</span>
            </button>
          </form>
        )}

        {/* 3. Fast QC Mode */}
        {activeMode === "QC" && (
          <form onSubmit={handleQCSubmit} className="space-y-4">
            <div className="bg-[#14264A] p-4 rounded-2xl border border-white/10 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-white/70 mb-1">أمر الإنتاج المفحوص *</label>
                <select
                  value={qcOrderId}
                  onChange={(e) => setQcOrderId(e.target.value)}
                  required
                  className="w-full p-3 bg-[#0E1A33] border border-white/20 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
                >
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.orderNumber} - {o.productNameSnapshot}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1">عينة الفحص (قطعة)</label>
                  <input
                    type="number"
                    min="1"
                    value={qcInspected}
                    onChange={(e) => setQcInspected(parseInt(e.target.value, 10) || 1)}
                    className="w-full p-2.5 bg-[#0E1A33] border border-white/20 rounded-xl text-sm font-bold text-white text-center"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-red-400 mb-1">مرفوض (معيب)</label>
                  <input
                    type="number"
                    min="0"
                    value={qcRejected}
                    onChange={(e) => setQcRejected(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-2.5 bg-[#0E1A33] border border-red-500/30 rounded-xl text-sm font-bold text-red-300 text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/70 mb-1">قرار الجودة</label>
                <select
                  value={qcStatus}
                  onChange={(e) => setQcStatus(e.target.value)}
                  className="w-full p-2.5 bg-[#0E1A33] border border-white/20 rounded-xl text-xs font-bold text-white"
                >
                  <option value="PASSED">مطابق تماماً ومقبول للتسليم ✓</option>
                  <option value="PASSED_WITH_CONDITIONS">مقبول مع شروط ومعالجة ⚠️</option>
                  <option value="REJECTED">مرفوض بالكامل ✗</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-[#5932A8] hover:bg-[#49278f] active:scale-[0.99] text-white rounded-2xl text-base font-black transition shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>{submitting ? "جاري الاعتماد..." : "اعتماد محضر الجودة الفوري"}</span>
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
