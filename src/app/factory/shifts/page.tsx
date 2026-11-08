"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Clock,
  Plus,
  RefreshCw,
  Sun,
  Sunset,
  Moon,
  CheckCircle2,
  X,
  Edit,
  Layers,
} from "lucide-react";

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  hours: number;
  isActive: boolean;
  _count: {
    productionEntries: number;
    attendanceRecords: number;
  };
}

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("16:00");
  const [hours, setHours] = useState("8.0");

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
        fetch("/api/factory/shifts"),
        fetch("/api/auth/me").catch(() => null),
      ]);
      const json = await res.json();
      if (res.ok) {
        setShifts(json.shifts || []);
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

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/factory/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          startTime,
          endTime,
          hours: parseFloat(hours),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل إضافة الوردية");

      setSuccessMsg("تم إضافة الوردية الجديدة بنجاح ✓");
      setModalOpen(false);
      setName("");
      fetchData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  const getShiftIcon = (name: string) => {
    if (name.includes("صباح")) return <Sun className="w-5 h-5 text-amber-500" />;
    if (name.includes("مساء")) return <Sunset className="w-5 h-5 text-orange-500" />;
    return <Moon className="w-5 h-5 text-indigo-500" />;
  };

  return (
    <DashboardLayout user={user} currentRole="FACTORY">
      <div className="space-y-6 pb-12 font-sans" dir="rtl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-purple-50 text-[#5932A8] rounded-xl">
                <Clock className="w-6 h-6" />
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">إدارة الورديات ومواعيد التشغيل</h1>
            </div>
            <p className="text-gray-500 text-xs md:text-sm mt-1">
              تحديد ساعات الورديات الصباحية والمسائية والليلية، وربطها بعمليات الإنتاج وسجلات الحضور.
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
            إضافة وردية جديدة
          </button>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold">
            {successMsg}
          </div>
        )}

        {/* Shifts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {shifts.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                    {getShiftIcon(s.name)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{s.name}</h3>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {s.isActive ? "نشطة وتعمل" : "متوقفة"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 text-xs text-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">وقت البدء والانتهاء:</span>
                  <span className="font-mono font-bold text-gray-900">
                    {s.startTime} إلى {s.endTime}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">إجمالي الساعات:</span>
                  <span className="font-bold text-gray-900">{s.hours} ساعات</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>{s._count.productionEntries} تسجيل إنتاج</span>
                <span>{s._count.attendanceRecords} سجل حضور</span>
              </div>
            </div>
          ))}
        </div>

        {/* Add Shift Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 bg-gradient-to-l from-[#14264A] to-[#5932A8] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-300" />
                  <h3 className="font-bold text-base">إضافة وردية عمل جديدة</h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateShift} className="p-6 space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">اسم الوردية *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="وردية صباحية، وردية إضافية..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">وقت البدء *</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">وقت الانتهاء *</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">عدد الساعات الفعلية</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    step="0.5"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
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
                    className="px-6 py-2 bg-[#5932A8] text-white rounded-xl text-xs font-bold hover:bg-[#49278f] transition disabled:opacity-50"
                  >
                    {submitting ? "جاري الحفظ..." : "حفظ الوردية"}
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
