"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Users,
  Plus,
  RefreshCw,
  Search,
  Phone,
  Building,
  MapPin,
  ArrowRight,
  X,
  DollarSign,
  Tag,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface Customer {
  id: string;
  name: string;
  companyName: string | null;
  email: string | null;
  phone: string;
  whatsapp: string | null;
  governorate: string | null;
  city: string | null;
  source: string;
  status: string;
  totalSpend: number;
  ordersCount: number;
  tags: string;
  notes: string | null;
}

export default function CrmCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [governorate, setGovernorate] = useState("القاهرة");
  const [city, setCity] = useState("");
  const [source, setSource] = useState("DIRECT");
  const [status, setStatus] = useState("ACTIVE");
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

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (search) queryParams.set("q", search);
      if (statusFilter) queryParams.set("status", statusFilter);

      const [res, meRes] = await Promise.all([
        fetch(`/api/crm/customers?${queryParams.toString()}`),
        fetch("/api/auth/me").catch(() => null),
      ]);

      const json = await res.json();
      if (res.ok && json.customers) {
        setCustomers(json.customers);
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
    fetchCustomers();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/crm/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          companyName,
          phone,
          email,
          governorate,
          city,
          source,
          status,
          notes,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل إضافة العميل");

      setSuccessMsg("تم إضافة العميل الجديد بنجاح في مساحة CRM ✓");
      setModalOpen(false);
      setName("");
      setCompanyName("");
      setPhone("");
      setEmail("");
      setNotes("");
      fetchCustomers();
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
                <Users className="w-6 h-6" />
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">سجل العملاء والشركات (CRM Customers)</h1>
            </div>
            <p className="text-gray-500 text-xs md:text-sm mt-1">
              إدارة العملاء الاستراتيجيين، المشترين من سوق تكس لينك، سجل المشتريات، وتفاصيل الاتصال.
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
            إضافة عميل جديد
          </button>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold">
            {successMsg}
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="ابحث بالاسم، الشركة، أو رقم الهاتف..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-9 pl-4 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
            />
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
          </form>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
            >
              <option value="">جميع الحالات</option>
              <option value="ACTIVE">نشط (Active)</option>
              <option value="PROSPECT">عميل واعد (Prospect)</option>
              <option value="LEAD">عميل محتمل (Lead)</option>
              <option value="INACTIVE">غير نشط</option>
            </select>

            <button
              onClick={fetchCustomers}
              className="p-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl transition"
              title="تحديث"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">اسم العميل والشركة</th>
                  <th className="py-3 px-4">رقم الهاتف والتواصل</th>
                  <th className="py-3 px-4">الموقع والمحافظة</th>
                  <th className="py-3 px-4">مصدر العميل</th>
                  <th className="py-3 px-4">إجمالي المشتريات</th>
                  <th className="py-3 px-4">عدد الطلبات</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4">الملف والتفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      لا يوجد عملاء يطابقون خيارات البحث.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/70 transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-900 block">{c.companyName || c.name}</span>
                        {c.companyName && <span className="text-[10px] text-gray-500">{c.name}</span>}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-gray-700">
                        <a href={`tel:${c.phone}`} className="hover:underline flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#079B62]" />
                          <span>{c.phone}</span>
                        </a>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {c.governorate ? `${c.governorate} ${c.city ? `• ${c.city}` : ""}` : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            c.source === "MARKETPLACE"
                              ? "bg-blue-100 text-blue-800"
                              : c.source === "DIRECT"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {c.source === "MARKETPLACE" ? "سوق تكس لينك B2B" : c.source}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700 text-sm">
                        {c.totalSpend.toLocaleString()} ج.م
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-gray-900">
                        {c.ordersCount} طلب
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            c.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800"
                              : c.status === "PROSPECT"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {c.status === "ACTIVE" ? "نشط" : c.status === "PROSPECT" ? "واعد" : c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/crm/customers/${c.id}`}
                          className="px-3 py-1 bg-purple-50 text-[#5932A8] hover:bg-purple-100 border border-purple-200 rounded-lg text-xs font-bold transition flex items-center gap-1 w-fit"
                        >
                          <span>عرض الملف</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Customer Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 bg-gradient-to-l from-[#14264A] to-[#5932A8] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-300" />
                  <h3 className="font-bold text-base">إضافة عميل جديد لمساحة CRM</h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCustomer} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">اسم العميل المسؤول *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="أ. طارق الشاذلي"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">اسم الشركة أو البراند</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="شركة القاهرة للملابس"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">رقم الهاتف *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="01012345678"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="buyer@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">المحافظة</label>
                    <input
                      type="text"
                      value={governorate}
                      onChange={(e) => setGovernorate(e.target.value)}
                      placeholder="القاهرة / الإسكندرية..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">مصدر العميل</label>
                    <select
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
                    >
                      <option value="DIRECT">تواصل مباشر</option>
                      <option value="MARKETPLACE">سوق تكس لينك B2B</option>
                      <option value="REFERRAL">ترشيح وتوصية</option>
                      <option value="EXHIBITION">معرض تجاري</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ملاحظات حول العميل</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="اهتمامات العميل، حجم الطلبيات المتوقعة، أو متطلبات خاصة..."
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
                    {submitting ? "جاري الإضافة..." : "حفظ ملف العميل"}
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
