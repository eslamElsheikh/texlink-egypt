"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Clock,
  Plus,
  RefreshCw,
  Phone,
  MessageSquare,
  FileText,
  ShoppingBag,
  X,
  User,
  Building,
} from "lucide-react";
import Link from "next/link";

interface Activity {
  id: string;
  type: string;
  description: string;
  performedBy: string | null;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    companyName: string | null;
    phone: string;
  };
  deal?: {
    id: string;
    title: string;
  } | null;
}

export default function CrmActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [customers, setCustomers] = useState<Array<{ id: string; name: string; companyName: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [customerId, setCustomerId] = useState("");
  const [type, setType] = useState("CALL");
  const [description, setDescription] = useState("");

  const [user, setUser] = useState({
    id: "crm-user",
    name: "إدارة المبيعات",
    email: "",
    role: "FACTORY" as const,
    isFactory: true,
    isBuyer: false,
    factorySlug: "",
  });

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const [res, meRes] = await Promise.all([
        fetch("/api/crm/activities"),
        fetch("/api/auth/me").catch(() => null),
      ]);
      const json = await res.json();
      if (res.ok) {
        setActivities(json.activities || []);
        if (json.customers) setCustomers(json.customers);
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
    fetchActivities();
  }, []);

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/crm/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          type,
          description,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل تسجيل النشاط");

      setSuccessMsg("تم تسجيل التفاعل بنجاح في السجل الزمني للعميل ✓");
      setModalOpen(false);
      setDescription("");
      fetchActivities();
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
              <span className="p-2 bg-purple-50 text-[#5932A8] rounded-xl">
                <Clock className="w-6 h-6" />
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">سجل الأنشطة والتواصل مع العملاء</h1>
            </div>
            <p className="text-gray-500 text-xs md:text-sm mt-1">
              تسجيل المكالمات الهاتفية، ملخصات الاجتماعات، والتفاعلات اللحظية القادمة من سوق سايسل مصر.
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
            تسجيل نشاط / مكالمة
          </button>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold">
            {successMsg}
          </div>
        )}

        {/* Timeline Activities List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">الجدول الزمني للتفاعلات (Activities Timeline)</h2>
            <button
              onClick={fetchActivities}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
              title="تحديث"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {activities.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-400">لا توجد أنشطة مسجلة حتى الآن.</div>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="p-4 hover:bg-gray-50/70 transition flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#5932A8] flex items-center justify-center shrink-0 mt-0.5">
                    {act.type === "CALL" ? (
                      <Phone className="w-4 h-4 text-[#079B62]" />
                    ) : act.type === "MARKETPLACE_ORDER" || act.type === "MARKETPLACE_RFQ" ? (
                      <ShoppingBag className="w-4 h-4 text-blue-600" />
                    ) : (
                      <MessageSquare className="w-4 h-4 text-[#5932A8]" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/crm/customers/${act.customer.id}`}
                          className="font-bold text-gray-900 text-xs hover:text-[#5932A8] hover:underline"
                        >
                          {act.customer.companyName || act.customer.name}
                        </Link>
                        <span className="px-2 py-0.2 bg-purple-50 text-[#5932A8] rounded text-[10px] font-bold">
                          {act.type}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {new Date(act.createdAt).toLocaleDateString("ar-EG", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-gray-700">{act.description}</p>
                    {act.performedBy && (
                      <span className="text-[10px] text-gray-400 block">بواسطة: {act.performedBy}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Create Activity Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 bg-gradient-to-l from-[#14264A] to-[#5932A8] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-300" />
                  <h3 className="font-bold text-base">تسجيل تفاعل أو مكالمة جديدة</h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateActivity} className="p-6 space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">العميل *</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
                  >
                    <option value="">اختر العميل...</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName ? `${c.companyName} (${c.name})` : c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">نوع التفاعل</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
                  >
                    <option value="CALL">مكالمة هاتفية</option>
                    <option value="MEETING">اجتماع / مقابلة شخصية</option>
                    <option value="NOTE">ملاحظة داخلية</option>
                    <option value="EMAIL">مراسلة بريد إلكتروني</option>
                    <option value="QUOTATION_SENT">إرسال مقايسة أسعار</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">تفاصيل وموجز التفاعل *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={3}
                    placeholder="تم الاتصال بالعميل وأبدى اهتمامه بطلب 3000 قطعة بولو مع تطريز، يطلب مهلة للرد..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
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
                    {submitting ? "جاري الحفظ..." : "حفظ التفاعل"}
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
