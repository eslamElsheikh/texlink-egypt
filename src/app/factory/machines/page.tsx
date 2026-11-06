"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Cpu,
  Plus,
  RefreshCw,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Clock,
  X,
  Play,
  Pause,
  AlertCircle,
  BarChart3,
  DollarSign,
} from "lucide-react";

interface Machine {
  id: string;
  code: string;
  name: string;
  type: string;
  brand: string;
  model: string | null;
  status: string;
  hourlyOperatingCost: number;
  maintenanceIntervalDays: number;
  totalDowntimeMinutes: number;
  totalMaintenanceCost: number;
  totalProduced: number;
  totalGood: number;
  totalDefect: number;
  wasteRate: number;
  hasActiveBreakdown: boolean;
  notes: string | null;
}

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("CIRCULAR_KNITTING");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [hourlyOperatingCost, setHourlyOperatingCost] = useState("120");
  const [maintenanceIntervalDays, setMaintenanceIntervalDays] = useState("30");
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
        fetch("/api/factory/machines"),
        fetch("/api/auth/me").catch(() => null),
      ]);
      const json = await res.json();
      if (res.ok) {
        setMachines(json.machines || []);
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

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "RUNNING" ? "STOPPED" : "RUNNING";
    try {
      const res = await fetch("/api/factory/machines", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMachine = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/factory/machines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          name,
          type,
          brand,
          model,
          hourlyOperatingCost,
          maintenanceIntervalDays,
          notes,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "فشل إضافة الماكينة");
      }

      setSuccessMsg("تم إضافة الماكينة بنجاح إلى صالة المصنع ✓");
      setModalOpen(false);
      setCode("");
      setName("");
      setBrand("");
      setModel("");
      fetchData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  const readyCount = machines.filter((m) => m.status === "RUNNING").length;
  const stoppedCount = machines.filter((m) => m.status === "STOPPED").length;
  const maintCount = machines.filter((m) => m.status === "UNDER_MAINTENANCE" || m.status === "OUT_OF_SERVICE").length;

  return (
    <DashboardLayout user={user} currentRole="FACTORY">
      <div className="space-y-6 pb-12 font-sans" dir="rtl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-50 text-[#079B62] rounded-xl">
                <Cpu className="w-6 h-6" />
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">إدارة الماكينات والمعدات الصناعية</h1>
            </div>
            <p className="text-gray-500 text-xs md:text-sm mt-1">
              متابعة حالة التشغيل الفورية، سجل الصيانة وتكاليف قطع الغيار، ومؤشر ربحية وكفاءة كل ماكينة.
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
            إضافة ماكينة جديدة
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">إجمالي الماكينات</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{machines.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">جاهزة وتعمل (RUNNING)</p>
            <p className="text-2xl font-black text-[#079B62] mt-1">{readyCount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">متوقفة مؤقتاً (STOPPED)</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{stoppedCount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">تحت الصيانة (MAINTENANCE)</p>
            <p className="text-2xl font-black text-red-600 mt-1">{maintCount}</p>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold">
            {successMsg}
          </div>
        )}

        {/* Machines List Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">سجل المعدات ومؤشرات الربحية والكفاءة</h2>
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
                  <th className="py-3 px-4">كود واسم الماكينة</th>
                  <th className="py-3 px-4">النوع والماركة</th>
                  <th className="py-3 px-4">حالة التشغيل</th>
                  <th className="py-3 px-4">الإنتاج السليم</th>
                  <th className="py-3 px-4">نسبة الهالك</th>
                  <th className="py-3 px-4">وقت التوقف</th>
                  <th className="py-3 px-4">تكلفة الصيانة</th>
                  <th className="py-3 px-4">تكلفة التشغيل/ساعة</th>
                  <th className="py-3 px-4">تبديل الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {machines.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-400">
                      لا توجد ماكينات مسجلة حالياً.
                    </td>
                  </tr>
                ) : (
                  machines.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50/70 transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-900 block">{m.code}</span>
                        <span className="text-[11px] text-gray-600 line-clamp-1">{m.name}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        <span className="font-semibold text-gray-800 block">{m.brand}</span>
                        <span className="text-[10px] text-gray-400">{m.model || m.type}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            m.status === "RUNNING"
                              ? "bg-emerald-100 text-emerald-800"
                              : m.status === "STOPPED"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {m.status === "RUNNING"
                            ? "تعمل بانتظام"
                            : m.status === "STOPPED"
                            ? "متوقفة"
                            : "تحت الصيانة ⚠️"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-700">
                        {m.totalGood > 0 ? `${m.totalGood.toLocaleString()} قطعة` : "-"}
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-700">
                        {m.totalProduced > 0 ? (
                          <span className={m.wasteRate > 5 ? "text-red-600" : "text-gray-900"}>
                            {m.wasteRate}%
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600 font-mono text-[11px]">
                        {m.totalDowntimeMinutes > 0
                          ? `${Math.round(m.totalDowntimeMinutes / 60)} س (${m.totalDowntimeMinutes} د)`
                          : "0 د"}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-gray-900">
                        {m.totalMaintenanceCost.toLocaleString()} ج.م
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-600">
                        {m.hourlyOperatingCost} ج.م
                      </td>
                      <td className="py-3 px-4">
                        {m.status !== "UNDER_MAINTENANCE" && (
                          <button
                            onClick={() => handleToggleStatus(m.id, m.status)}
                            className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                              m.status === "RUNNING"
                                ? "bg-amber-50 text-amber-800 hover:bg-amber-100"
                                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                            }`}
                            title={m.status === "RUNNING" ? "إيقاف مؤقت" : "تشغيل"}
                          >
                            {m.status === "RUNNING" ? (
                              <>
                                <Pause className="w-3.5 h-3.5" />
                                <span>إيقاف</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5" />
                                <span>تشغيل</span>
                              </>
                            )}
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

        {/* Add Machine Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 bg-gradient-to-l from-[#14264A] to-[#079B62] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-emerald-300" />
                  <h3 className="font-bold text-base">إضافة ماكينة جديدة لصالة المصنع</h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddMachine} className="p-6 space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">كود الماكينة *</label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="M-TRICOT-05"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold uppercase focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">اسم الماكينة *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="ماكينة تريكو دائري ماير 30 بوصة"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">النوع / القسم *</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                    >
                      <option value="CIRCULAR_KNITTING">تريكو دائري (Circular Knitting)</option>
                      <option value="FLAT_KNITTING">تريكو مستقيم / تريكوتراج</option>
                      <option value="OVERLOCK">أوفرلوك 4 / 5 فتلة</option>
                      <option value="SEWING_SINGER">سنجر خياطة إبرة واحدة</option>
                      <option value="CUTTING_LASER">مقص شريط / ليزر</option>
                      <option value="IRONING">كوي ومكابس بخار</option>
                      <option value="EMBROIDERY">تطريز كمبيوتر</option>
                      <option value="OTHER">أخرى</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">الماركة المصنعة *</label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="Mayer & Cie / Juki / Brother"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">الموديل والطراز</label>
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="Relanit 3.2 II"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">تكلفة التشغيل بالساعة (ج.م)</label>
                    <input
                      type="number"
                      min="0"
                      value={hourlyOperatingCost}
                      onChange={(e) => setHourlyOperatingCost(e.target.value)}
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
                    {submitting ? "جاري الإضافة..." : "حفظ الماكينة"}
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
