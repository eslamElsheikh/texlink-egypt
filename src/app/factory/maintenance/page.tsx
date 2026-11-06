"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Wrench,
  Plus,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  X,
  Check,
  Cpu,
  DollarSign,
} from "lucide-react";

interface MaintenanceTicket {
  id: string;
  issueType: string;
  priority: string;
  description: string;
  startTime: string;
  endTime: string | null;
  downtimeMinutes: number;
  sparePartsUsed: string | null;
  laborCost: number;
  sparePartsCost: number;
  totalCost: number;
  status: string;
  resolvedBy: string | null;
  machine: {
    id: string;
    code: string;
    name: string;
    type: string;
    status: string;
  };
}

export default function MaintenancePage() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [machines, setMachines] = useState<Array<{ id: string; code: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Report Form State
  const [machineId, setMachineId] = useState("");
  const [issueType, setIssueType] = useState("NEEDLE_BREAKAGE");
  const [priority, setPriority] = useState("HIGH");
  const [description, setDescription] = useState("");

  // Resolve Form State
  const [sparePartsUsed, setSparePartsUsed] = useState("");
  const [laborCost, setLaborCost] = useState("150");
  const [sparePartsCost, setSparePartsCost] = useState("350");
  const [resolvedBy, setResolvedBy] = useState("فني الصيانة");

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
        fetch("/api/factory/maintenance"),
        fetch("/api/auth/me").catch(() => null),
      ]);
      const json = await res.json();
      if (res.ok) {
        setTickets(json.tickets || []);
        if (json.machines) setMachines(json.machines);
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

  const handleReportBreakdown = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/factory/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          machineId,
          issueType,
          priority,
          description,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل تسجيل البلاغ");

      setSuccessMsg("تم تسجيل بلاغ العطل وتحويل حالة الماكينة إلى تحت الصيانة ✓");
      setReportModalOpen(false);
      setDescription("");
      fetchData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/factory/maintenance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedTicket.id,
          status: "RESOLVED",
          sparePartsUsed,
          laborCost,
          sparePartsCost,
          resolvedBy,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل إغلاق تذكرة الصيانة");

      setSuccessMsg("تم إغلاق البلاغ وتحديث سجل الماكينة بنجاح ✓");
      setResolveModalOpen(false);
      setSelectedTicket(null);
      fetchData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  const openTickets = tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS");
  const totalDowntime = tickets.reduce((s, t) => s + (t.downtimeMinutes || 0), 0);
  const totalRepairCost = tickets.reduce((s, t) => s + (t.totalCost || 0), 0);

  return (
    <DashboardLayout user={user} currentRole="FACTORY">
      <div className="space-y-6 pb-12 font-sans" dir="rtl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Wrench className="w-6 h-6" />
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">الأعطال والصيانة وقطع الغيار</h1>
            </div>
            <p className="text-gray-500 text-xs md:text-sm mt-1">
              إدارة بلاغات التوقف المفاجئ، حساب أوقات التعطل، وسجل قطع الغيار وتكاليف الإصلاح.
            </p>
          </div>

          <button
            onClick={() => {
              setErrorMsg(null);
              setReportModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition shadow-sm"
          >
            <Plus className="w-5 h-5" />
            إبلاغ عن عطل ماكينة
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">البلاغات المفتوحة حالياً</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{openTickets.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">إجمالي وقت التوقف</p>
            <p className="text-2xl font-black text-gray-900 mt-1">
              {Math.round((totalDowntime / 60) * 10) / 10} ساعة
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">إجمالي تكلفة قطع الغيار والإصلاح</p>
            <p className="text-2xl font-black text-gray-900 mt-1">
              {totalRepairCost.toLocaleString()} ج.م
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold">
            {successMsg}
          </div>
        )}

        {/* Tickets Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">سجل بلاغات الأعطال والتدخلات الفنية</h2>
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
                  <th className="py-3 px-4">الماكينة</th>
                  <th className="py-3 px-4">نوع المشكلة</th>
                  <th className="py-3 px-4">وصف العطل</th>
                  <th className="py-3 px-4">تاريخ ووقت البلاغ</th>
                  <th className="py-3 px-4">وقت التوقف</th>
                  <th className="py-3 px-4">قطع الغيار المستخدمة</th>
                  <th className="py-3 px-4">التكلفة الإجمالية</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-400">
                      لا توجد بلاغات صيانة مسجلة حتى الآن.
                    </td>
                  </tr>
                ) : (
                  tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50/70 transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-900 block">{t.machine.code}</span>
                        <span className="text-[10px] text-gray-500">{t.machine.name}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-700">
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px]">
                          {t.issueType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-800 max-w-xs">{t.description}</td>
                      <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                        {new Date(t.startTime).toLocaleDateString("ar-EG", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-gray-800">
                        {t.downtimeMinutes > 0 ? `${t.downtimeMinutes} دقيقة` : "قيد الحساب"}
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-[11px]">
                        {t.sparePartsUsed || "-"}
                      </td>
                      <td className="py-3 px-4 font-bold font-mono text-gray-900">
                        {t.totalCost > 0 ? `${t.totalCost.toLocaleString()} ج.م` : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            t.status === "RESOLVED" || t.status === "CLOSED"
                              ? "bg-emerald-100 text-emerald-800"
                              : t.status === "IN_PROGRESS"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {t.status === "RESOLVED" || t.status === "CLOSED"
                            ? "تم الإصلاح ✓"
                            : t.status === "IN_PROGRESS"
                            ? "قيد الإصلاح"
                            : "مفتوح"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {t.status !== "RESOLVED" && t.status !== "CLOSED" && (
                          <button
                            onClick={() => {
                              setSelectedTicket(t);
                              setResolveModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700 transition"
                          >
                            إغلاق البلاغ
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Report Breakdown Modal */}
        {reportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 bg-gradient-to-l from-[#14264A] to-amber-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-300" />
                  <h3 className="font-bold text-base">تسجيل بلاغ عطل / صيانة ماكينة</h3>
                </div>
                <button
                  onClick={() => setReportModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleReportBreakdown} className="p-6 space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">الماكينة المتعطلة *</label>
                  <select
                    value={machineId}
                    onChange={(e) => setMachineId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="">اختر الماكينة...</option>
                    {machines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.code} - {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">نوع المشكلة *</label>
                    <select
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="NEEDLE_BREAKAGE">كسر إبر أو عيوب سلندر</option>
                      <option value="MOTOR_FAILURE">عطل محرك سيرفو أو باور</option>
                      <option value="BELT_WEAR">تآكل سيور ونقل حركة</option>
                      <option value="ELECTRICAL">عطل كهربائي أو لوحة تحكم</option>
                      <option value="SCHEDULED_PREVENTIVE">صيانة وقائية دورية</option>
                      <option value="CALIBRATION">معايرة وضبط شد الخيط</option>
                      <option value="OTHER">عطل آخر</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">الأولوية</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="LOW">منخفضة</option>
                      <option value="MEDIUM">متوسطة</option>
                      <option value="HIGH">مرتفعة (توقف خط الإنتاج)</option>
                      <option value="URGENT">طوارئ</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">وصف العطل بالتفصيل *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    required
                    placeholder="اشرح المشكلة: مكان صوت الاحتكاك، كسر الإبر، أو رسالة الخطأ على الشاشة..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition disabled:opacity-50"
                  >
                    {submitting ? "جاري التسجيل..." : "تأكيد وإيقاف الماكينة"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Resolve Ticket Modal */}
        {resolveModalOpen && selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 bg-gradient-to-l from-[#14264A] to-emerald-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                  <h3 className="font-bold text-base">إغلاق بلاغ الصيانة وإعادة تشغيل الماكينة</h3>
                </div>
                <button
                  onClick={() => setResolveModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleResolveTicket} className="p-6 space-y-4">
                <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1">
                  <p className="font-bold text-gray-900">{selectedTicket.machine.code} - {selectedTicket.machine.name}</p>
                  <p className="text-gray-600">{selectedTicket.description}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">قطع الغيار المستخدمة</label>
                  <input
                    type="text"
                    value={sparePartsUsed}
                    onChange={(e) => setSparePartsUsed(e.target.value)}
                    placeholder="مثال: 12 إبرة ماير، سير نقل حركة 150 مم"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">تكلفة قطع الغيار (ج.م)</label>
                    <input
                      type="number"
                      min="0"
                      value={sparePartsCost}
                      onChange={(e) => setSparePartsCost(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">أجر الفني / المصنعية (ج.م)</label>
                    <input
                      type="number"
                      min="0"
                      value={laborCost}
                      onChange={(e) => setLaborCost(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">اسم الفني / المهندس القائم بالإصلاح</label>
                  <input
                    type="text"
                    value={resolvedBy}
                    onChange={(e) => setResolvedBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setResolveModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition disabled:opacity-50"
                  >
                    {submitting ? "جاري الإغلاق..." : "اعتماد الإصلاح وتشغيل الماكينة"}
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
