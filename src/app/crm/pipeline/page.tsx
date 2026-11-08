"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  TrendingUp,
  Plus,
  RefreshCw,
  DollarSign,
  Building,
  CheckCircle2,
  X,
  ArrowRight,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import Link from "next/link";

interface Deal {
  id: string;
  title: string;
  stage: string;
  amount: number;
  expectedCloseDate: string | null;
  notes: string | null;
  customer: {
    id: string;
    name: string;
    companyName: string | null;
    phone: string;
  };
}

const STAGES = [
  { id: "DISCOVERY", title: "1. استكشاف وتواصل", color: "border-blue-500 bg-blue-50/30 text-blue-900" },
  { id: "PROPOSAL", title: "2. تقديم عرض أسعار", color: "border-purple-500 bg-purple-50/30 text-purple-900" },
  { id: "NEGOTIATION", title: "3. تفاوض واعتماد", color: "border-amber-500 bg-amber-50/30 text-amber-900" },
  { id: "WON", title: "4. صفقات محسومة ✓", color: "border-emerald-500 bg-emerald-50/30 text-emerald-900" },
  { id: "LOST", title: "5. صفقات ملغاة", color: "border-red-500 bg-red-50/30 text-red-900" },
];

export default function CrmPipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [customers, setCustomers] = useState<Array<{ id: string; name: string; companyName: string | null }>>([]);
  const [stats, setStats] = useState({ totalDeals: 0, totalPipelineValue: 0, wonValue: 0 });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [customerId, setCustomerId] = useState("");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [stage, setStage] = useState("DISCOVERY");
  const [expectedCloseDate, setExpectedCloseDate] = useState("");
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

  const fetchPipeline = async () => {
    try {
      setLoading(true);
      const [res, meRes] = await Promise.all([
        fetch("/api/crm/pipeline"),
        fetch("/api/auth/me").catch(() => null),
      ]);
      const json = await res.json();
      if (res.ok) {
        setDeals(json.deals || []);
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
    fetchPipeline();
  }, []);

  const handleStageChange = async (dealId: string, newStage: string) => {
    try {
      const res = await fetch("/api/crm/pipeline", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: dealId, stage: newStage }),
      });
      if (res.ok) {
        fetchPipeline();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/crm/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          title,
          amount,
          stage,
          expectedCloseDate: expectedCloseDate || null,
          notes,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل إنشاء الصفقة");

      setSuccessMsg("تم إضافة الصفقة الجديدة في خط سير المبيعات بنجاح ✓");
      setModalOpen(false);
      setTitle("");
      setAmount("");
      fetchPipeline();
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
                <TrendingUp className="w-6 h-6" />
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                لوحة كانبان الصفقات ومراحل المبيعات (Sales Pipeline)
              </h1>
            </div>
            <p className="text-gray-500 text-xs md:text-sm mt-1">
              إدارة الفرص البيعية، متابعة تفاوض الأسعار، وترقية الصفقات حتى التوقيع والحسم النهائي.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setErrorMsg(null);
                setModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#5932A8] text-white rounded-xl font-bold text-sm hover:bg-[#49278f] transition shadow-sm"
            >
              <Plus className="w-5 h-5" />
              فتح صفقة جديدة
            </button>
            <button
              onClick={fetchPipeline}
              className="p-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl transition"
              title="تحديث"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">إجمالي الصفقات المفتوحة</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{deals.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">قيمة الصفقات المتوقعة (Pipeline Value)</p>
            <p className="text-2xl font-black text-[#5932A8] mt-1 font-mono">
              {stats.totalPipelineValue.toLocaleString()} ج.م
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">الصفقات المحسومة بنجاح (Won)</p>
            <p className="text-2xl font-black text-emerald-700 mt-1 font-mono">
              {stats.wonValue.toLocaleString()} ج.م
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold">
            {successMsg}
          </div>
        )}

        {/* Kanban Board Columns */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
          {STAGES.map((col) => {
            const colDeals = deals.filter((d) => d.stage === col.id);
            const colTotal = colDeals.reduce((s, d) => s + d.amount, 0);

            return (
              <div
                key={col.id}
                className={`bg-gray-50/80 rounded-2xl border-t-4 p-3 space-y-3 min-w-[240px] shadow-xs ${col.color}`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
                  <span className="text-xs font-black">{col.title}</span>
                  <span className="text-[10px] font-extrabold bg-white px-2 py-0.5 rounded-full border border-gray-200">
                    {colDeals.length}
                  </span>
                </div>

                <div className="font-mono text-xs font-bold text-gray-700 bg-white/60 p-2 rounded-lg text-center">
                  {colTotal.toLocaleString()} ج.م
                </div>

                {/* Cards List */}
                <div className="space-y-2.5">
                  {colDeals.length === 0 ? (
                    <div className="p-6 text-center text-[11px] text-gray-400 border border-dashed border-gray-200 rounded-xl">
                      لا توجد صفقات في هذه المرحلة
                    </div>
                  ) : (
                    colDeals.map((d) => (
                      <div
                        key={d.id}
                        className="bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-xs hover:shadow-md transition space-y-2"
                      >
                        <div>
                          <h4 className="text-xs font-black text-gray-900 leading-snug">{d.title}</h4>
                          <Link
                            href={`/crm/customers/${d.customer.id}`}
                            className="text-[11px] text-[#5932A8] hover:underline font-bold block mt-1"
                          >
                            {d.customer.companyName || d.customer.name}
                          </Link>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <span className="font-mono font-black text-sm text-emerald-700">
                            {d.amount.toLocaleString()} ج.م
                          </span>

                          {/* Quick Stage Transitions */}
                          <div className="flex items-center gap-1">
                            {col.id !== "WON" && (
                              <button
                                onClick={() => {
                                  const currentIdx = STAGES.findIndex((s) => s.id === col.id);
                                  if (currentIdx < STAGES.length - 2) {
                                    handleStageChange(d.id, STAGES[currentIdx + 1].id);
                                  } else {
                                    handleStageChange(d.id, "WON");
                                  }
                                }}
                                className="px-2 py-0.5 bg-[#5932A8] hover:bg-[#49278f] text-white rounded text-[10px] font-bold"
                                title="ترقية المرحلة التالية"
                              >
                                تقديم ←
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Create Deal Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 bg-gradient-to-l from-[#14264A] to-[#5932A8] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-300" />
                  <h3 className="font-bold text-base">فتح صفقة مبيعات جديدة (Deal)</h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateDeal} className="p-6 space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">العميل المستهدف *</label>
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
                  <label className="block text-xs font-bold text-gray-700 mb-1">عنوان الصفقة *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="توريد دفعة بولو صيفي 10,000 قطعة..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">قيمة الصفقة (ج.م) *</label>
                    <input
                      type="number"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      placeholder="250000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">مرحلة البداية</label>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
                    >
                      <option value="DISCOVERY">استكشاف وتواصل</option>
                      <option value="PROPOSAL">تقديم عرض أسعار</option>
                      <option value="NEGOTIATION">تفاوض واعتماد</option>
                      <option value="WON">محسومة ومؤكدة</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">تاريخ الحسم المتوقع</label>
                  <input
                    type="date"
                    value={expectedCloseDate}
                    onChange={(e) => setExpectedCloseDate(e.target.value)}
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
                    {submitting ? "جاري الحفظ..." : "فتح الصفقة"}
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
