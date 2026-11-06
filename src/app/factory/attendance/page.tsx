"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Clock,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  X,
} from "lucide-react";

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  overtimeHours: number;
  employee: {
    id: string;
    code: string;
    name: string;
    jobTitle: string;
  };
  shift: {
    id: string;
    name: string;
  } | null;
}

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [options, setOptions] = useState<{
    employees: Array<{ id: string; code: string; name: string; jobTitle: string }>;
    shifts: Array<{ id: string; name: string }>;
  }>({ employees: [], shifts: [] });
  const [stats, setStats] = useState({
    totalRecords: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    totalOvertime: 0,
  });

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [employeeId, setEmployeeId] = useState("");
  const [shiftId, setShiftId] = useState("");
  const [checkIn, setCheckIn] = useState("08:00");
  const [checkOut, setCheckOut] = useState("16:00");
  const [status, setStatus] = useState("PRESENT");
  const [overtimeHours, setOvertimeHours] = useState("0");

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
        fetch("/api/factory/attendance"),
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

  const handleRecordAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/factory/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          shiftId: shiftId || null,
          checkIn,
          checkOut,
          status,
          overtimeHours,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل تسجيل الحضور");

      setSuccessMsg("تم تسجيل الحضور بنجاح ✓");
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
              <span className="p-2 bg-emerald-50 text-[#079B62] rounded-xl">
                <Clock className="w-6 h-6" />
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">الحضور والغياب والورديات</h1>
            </div>
            <p className="text-gray-500 text-xs md:text-sm mt-1">
              تسجيل بصمة الحضور والانصراف، ساعات العمل الإضافي، ومعدلات الالتزام اليومية للعمال.
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
            تسجيل حضور عامل
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">حضور منتظم</p>
            <p className="text-2xl font-black text-[#079B62] mt-1">{stats.presentCount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">غياب</p>
            <p className="text-2xl font-black text-red-600 mt-1">{stats.absentCount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">تأخير</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{stats.lateCount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">ساعات إضافي (Overtime)</p>
            <p className="text-2xl font-black text-purple-700 mt-1">{stats.totalOvertime} ساعة</p>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold">
            {successMsg}
          </div>
        )}

        {/* Attendance Records Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">سجل الحضور اليومي</h2>
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
                  <th className="py-3 px-4">العامل</th>
                  <th className="py-3 px-4">الوردية</th>
                  <th className="py-3 px-4">وقت الحضور</th>
                  <th className="py-3 px-4">وقت الانصراف</th>
                  <th className="py-3 px-4">ساعات الإضافي</th>
                  <th className="py-3 px-4">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      لا توجد تسجيلات حضور سابقة.
                    </td>
                  </tr>
                ) : (
                  records.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/70 transition">
                      <td className="py-3 px-4 font-mono text-[11px] text-gray-500">
                        {new Date(r.date).toLocaleDateString("ar-EG", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-900 block">{r.employee.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{r.employee.code}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{r.shift?.name || "-"}</td>
                      <td className="py-3 px-4 font-mono text-gray-800">{r.checkIn || "-"}</td>
                      <td className="py-3 px-4 font-mono text-gray-800">{r.checkOut || "-"}</td>
                      <td className="py-3 px-4 font-mono font-bold text-purple-700">
                        {r.overtimeHours > 0 ? `${r.overtimeHours} س` : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            r.status === "PRESENT"
                              ? "bg-emerald-100 text-emerald-800"
                              : r.status === "LATE"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {r.status === "PRESENT"
                            ? "حاضر ✓"
                            : r.status === "LATE"
                            ? "متأخر"
                            : "غائب"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Record Attendance Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 bg-gradient-to-l from-[#14264A] to-[#079B62] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-300" />
                  <h3 className="font-bold text-base">تسجيل حضور / انصراف</h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRecordAttendance} className="p-6 space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">العامل *</label>
                  <select
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
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

                <div className="grid grid-cols-2 gap-4">
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
                    <label className="block text-xs font-bold text-gray-700 mb-1">الحالة *</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                    >
                      <option value="PRESENT">حاضر منتظم</option>
                      <option value="LATE">متأخر</option>
                      <option value="OVERTIME">إضافي</option>
                      <option value="ABSENT">غائب</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">وقت الحضور</label>
                    <input
                      type="time"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">وقت الانصراف</label>
                    <input
                      type="time"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ساعات العمل الإضافي</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={overtimeHours}
                    onChange={(e) => setOvertimeHours(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#079B62] focus:outline-none"
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
                    {submitting ? "جاري الحفظ..." : "تأكيد التسجيل"}
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
