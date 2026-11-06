"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  CheckSquare,
  Plus,
  RefreshCw,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Calendar,
  Building,
} from "lucide-react";
import Link from "next/link";

interface FollowUp {
  id: string;
  title: string;
  dueDate: string;
  type: string;
  priority: string;
  status: string;
  completedAt: string | null;
  assignedTo: string | null;
  notes: string | null;
  customer?: {
    id: string;
    name: string;
    companyName: string | null;
    phone: string;
  } | null;
  deal?: {
    id: string;
    title: string;
  } | null;
}

export default function CrmFollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [customers, setCustomers] = useState<Array<{ id: string; name: string; companyName: string | null }>>([]);
  const [stats, setStats] = useState({ total: 0, pendingCount: 0, completedCount: 0, overdueCount: 0 });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [customerId, setCustomerId] = useState("");
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  const [type, setType] = useState("CALL");
  const [priority, setPriority] = useState("MEDIUM");
  const [assignedTo, setAssignedTo] = useState("");
  const [notes, setNotes] = useState("");

  const [user, setUser] = useState({
    id: "crm-user",
    name: "إدارة المبيعات",
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
        fetch("/api/crm/follow-ups"),
        fetch("/api/auth/me").catch(() => null),
      ]);
      const json = await res.json();
      if (res.ok) {
        setFollowUps(json.followUps || []);
        if (json.customers) setCustomers(json.customers);
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

  const handleMarkCompleted = async (id: string) => {
    try {
      const res = await fetch("/api/crm/follow-ups", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "COMPLETED" }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/crm/follow-ups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customerId || null,
          title,
          dueDate,
          type,
          priority,
          assignedTo,
          notes,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل إضافة المهمة");

      setSuccessMsg("تم إضافة التذكير بنجاح ✓");
      setModalOpen(false);
      setTitle("");
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
                <CheckSquare className="w-6 h-6" />
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">المتابعات والمهام والتذكيرات (Tasks & Follow-ups)</h1>
            </div>
            <p className="text-gray-500 text-xs md:text-sm mt-1">
              جدولة المكالمات الدورية للعملاء، متابعة عروض الأسعار المرسلة، والتنبيه بالمهام المتأخرة.
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
            إضافة مهمة جديدة
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">إجمالي المتابعات</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">قيد الانتظار</p>
            <p className="text-2xl font-black text-blue-600 mt-1">{stats.pendingCount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">مهام متأخرة (Overdue)</p>
            <p className="text-2xl font-black text-red-600 mt-1">{stats.overdueCount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">منجزة بنجاح</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">{stats.completedCount}</p>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold">
            {successMsg}
          </div>
        )}

        {/* Follow-ups List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">سجل المهام والمتابعات المجدولة</h2>
            <button
              onClick={fetchData}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
              title="تحديث"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">المهمة</th>
                  <th className="py-3 px-4">العميل المرتبط</th>
                  <th className="py-3 px-4">النوع</th>
                  <th className="py-3 px-4">الموعد المستهدف</th>
                  <th className="py-3 px-4">الأولوية</th>
                  <th className="py-3 px-4">المسؤول</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {followUps.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      لا توجد مهام متابعة مسجلة حالياً.
                    </td>
                  </tr>
                ) : (
                  followUps.map((fu) => {
                    const isOverdue = fu.status === "PENDING" && new Date(fu.dueDate) < new Date();
                    return (
                      <tr key={fu.id} className="hover:bg-gray-50/70 transition">
                        <td className="py-3 px-4 font-bold text-gray-900">{fu.title}</td>
                        <td className="py-3 px-4">
                          {fu.customer ? (
                            <Link
                              href={`/crm/customers/${fu.customer.id}`}
                              className="font-semibold text-[#5932A8] hover:underline"
                            >
                              {fu.customer.companyName || fu.customer.name}
                            </Link>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-700">{fu.type}</td>
                        <td className="py-3 px-4 font-mono font-semibold">
                          <span className={isOverdue ? "text-red-600 font-bold" : "text-gray-800"}>
                            {new Date(fu.dueDate).toLocaleDateString("ar-EG")}
                            {isOverdue && " (متأخر ⚠️)"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              fu.priority === "HIGH" || fu.priority === "URGENT"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {fu.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{fu.assignedTo || "-"}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                              fu.status === "COMPLETED"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {fu.status === "COMPLETED" ? "منجز ✓" : "معلق"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {fu.status !== "COMPLETED" && (
                            <button
                              onClick={() => handleMarkCompleted(fu.id)}
                              className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>إتمام</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add FollowUp Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 bg-gradient-to-l from-[#14264A] to-amber-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-amber-300" />
                  <h3 className="font-bold text-base">إضافة مهمة وتذكير متابعة</h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateFollowUp} className="p-6 space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">العميل المرتبط</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="">عام / بدون ربط عميل...</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName ? `${c.companyName} (${c.name})` : c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">موضوع المتابعة أو المهمة *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="الاتصال هاتفياً لتأكيد استلام عينة القماش..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">نوع المتابعة</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="CALL">مكالمة هاتفية</option>
                      <option value="MEETING">اجتماع / زيارة</option>
                      <option value="EMAIL">بريد إلكتروني</option>
                      <option value="QUOTE_FOLLOWUP">متابعة عرض أسعار</option>
                      <option value="SAMPLE_DELIVERY">تسليم عينات</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">تاريخ الاستحقاق *</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">درجة الأولوية</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="LOW">منخفضة</option>
                      <option value="MEDIUM">متوسطة</option>
                      <option value="HIGH">عالية</option>
                      <option value="URGENT">عاجلة جداً</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">الموظف المسؤول</label>
                    <input
                      type="text"
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      placeholder="مسؤول المبيعات..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
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
                    className="px-6 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition disabled:opacity-50"
                  >
                    {submitting ? "جاري الحفظ..." : "حفظ التذكير"}
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
