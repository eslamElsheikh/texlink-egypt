"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  UserPlus,
  Plus,
  RefreshCw,
  Phone,
  Mail,
  DollarSign,
  ArrowRight,
  X,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

interface Lead {
  id: string;
  title: string;
  contactName: string;
  phone: string;
  email: string | null;
  estimatedValue: number | null;
  productInterest: string | null;
  source: string;
  status: string;
  notes: string | null;
  createdAt: string;
  customer?: { id: string; name: string; companyName: string | null } | null;
}

export default function CrmLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [productInterest, setProductInterest] = useState("");
  const [source, setSource] = useState("DIRECT_CALL");
  const [notes, setNotes] = useState("");

  const [user, setUser] = useState({
    id: "crm-user",
    name: "إدارة المبيعات",
    email: "",
    role: "FACTORY" as const,
    isFactory: true,
    isBuyer: false,
    factorySlug: "",
  });

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const [res, meRes] = await Promise.all([
        fetch("/api/crm/leads"),
        fetch("/api/auth/me").catch(() => null),
      ]);
      const json = await res.json();
      if (res.ok && json.leads) {
        setLeads(json.leads);
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
    fetchLeads();
  }, []);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          contactName,
          phone,
          email,
          estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
          productInterest,
          source,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل إضافة الفرصة");

      setSuccessMsg("تم إضافة العميل المحتمل بنجاح ✓");
      setModalOpen(false);
      setTitle("");
      setContactName("");
      setPhone("");
      fetchLeads();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConvertToDeal = async (leadId: string) => {
    try {
      setConvertingId(leadId);
      const res = await fetch("/api/crm/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, action: "CONVERT_TO_DEAL" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل تحويل الفرصة");

      setSuccessMsg("تم تحويل العميل المحتمل بنجاح إلى عميل وصفقة في خط سير المبيعات ✓");
      fetchLeads();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setConvertingId(null);
    }
  };

  return (
    <DashboardLayout user={user} currentRole="FACTORY">
      <div className="space-y-6 pb-12 font-sans" dir="rtl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <UserPlus className="w-6 h-6" />
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">العملاء المحتملون وفرص التوريد (Leads)</h1>
            </div>
            <p className="text-gray-500 text-xs md:text-sm mt-1">
              متابعة طلبات عروض الأسعار الجديدة، الاستفسارات الهاتفية، وتحويلها لصفقات مبيعات بضغطة واحدة.
            </p>
          </div>

          <button
            onClick={() => {
              setErrorMsg(null);
              setModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-sm"
          >
            <Plus className="w-5 h-5" />
            إضافة فرصة محتملة
          </button>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold">
            {successMsg}
          </div>
        )}

        {/* Leads Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">قائمة الفرص والعملاء المحتملين</h2>
            <button
              onClick={fetchLeads}
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
                  <th className="py-3 px-4">عنوان الفرصة</th>
                  <th className="py-3 px-4">جهة الاتصال</th>
                  <th className="py-3 px-4">رقم الهاتف</th>
                  <th className="py-3 px-4">المنتج المهتم به</th>
                  <th className="py-3 px-4">القيمة التقديرية</th>
                  <th className="py-3 px-4">المصدر</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4">التحويل لصفقة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      لا يوجد عملاء محتملون حالياً.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50/70 transition">
                      <td className="py-3 px-4 font-bold text-gray-900">{lead.title}</td>
                      <td className="py-3 px-4 font-semibold text-gray-700">{lead.contactName}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-gray-800">
                        <a href={`tel:${lead.phone}`} className="hover:underline flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#079B62]" />
                          <span>{lead.phone}</span>
                        </a>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{lead.productInterest || "-"}</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                        {lead.estimatedValue ? `${lead.estimatedValue.toLocaleString()} ج.م` : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800">
                          {lead.source}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            lead.status === "CONVERTED"
                              ? "bg-emerald-100 text-emerald-800"
                              : lead.status === "QUALIFIED"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {lead.status === "CONVERTED" ? "تم التحويل ✓" : lead.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {lead.status !== "CONVERTED" ? (
                          <button
                            onClick={() => handleConvertToDeal(lead.id)}
                            disabled={convertingId === lead.id}
                            className="px-3 py-1 bg-[#5932A8] text-white rounded-lg text-[10px] font-bold hover:bg-[#49278f] transition flex items-center gap-1 shadow-sm disabled:opacity-50"
                          >
                            <Sparkles className="w-3 h-3 text-purple-200" />
                            <span>{convertingId === lead.id ? "جاري التحويل..." : "تحويل لصفقة"}</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-semibold">محسمة في الصفقات</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Lead Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 bg-gradient-to-l from-[#14264A] to-blue-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-300" />
                  <h3 className="font-bold text-base">إضافة عميل محتمل جديد (Lead)</h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateLead} className="p-6 space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">عنوان الفرصة أو الطلب *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="طلب توريد 5000 تيشيرت صيفي لشركة..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">اسم جهة الاتصال *</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      required
                      placeholder="م. شريف نور"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">رقم الهاتف *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="01012345678"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">القيمة التقديرية (ج.م)</label>
                    <input
                      type="number"
                      min="0"
                      value={estimatedValue}
                      onChange={(e) => setEstimatedValue(e.target.value)}
                      placeholder="150000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">المصدر</label>
                    <select
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="DIRECT_CALL">اتصال هاتفي مباشر</option>
                      <option value="MARKETPLACE_RFQ">طلب شراء من سوق سايسل مصر</option>
                      <option value="WHATSAPP">رسالة واتساب</option>
                      <option value="WEBSITE">استمارة الموقع</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">المنتج أو الخامة المهتم بها</label>
                  <input
                    type="text"
                    value={productInterest}
                    onChange={(e) => setProductInterest(e.target.value)}
                    placeholder="تيشيرت بولو بيكيه 220 جم، أوفر سايز..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {submitting ? "جاري الحفظ..." : "حفظ الفرصة"}
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
