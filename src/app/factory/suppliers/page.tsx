"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  ShoppingBag,
  Plus,
  RefreshCw,
  Phone,
  MapPin,
  User,
  DollarSign,
  X,
  Building,
} from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  category: string;
  contactPerson: string | null;
  phone: string;
  address: string | null;
  outstandingBalance: number;
  _count?: {
    purchaseOrders: number;
  };
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stats, setStats] = useState({ totalSuppliers: 0, totalOutstanding: 0 });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("YARN");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [outstandingBalance, setOutstandingBalance] = useState("0");

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
        fetch("/api/factory/suppliers"),
        fetch("/api/auth/me").catch(() => null),
      ]);
      const json = await res.json();
      if (res.ok) {
        setSuppliers(json.suppliers || []);
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

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/factory/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          contactPerson,
          phone,
          address,
          outstandingBalance,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل إضافة المورد");

      setSuccessMsg("تم إضافة المورد الجديد بنجاح ✓");
      setModalOpen(false);
      setName("");
      setPhone("");
      setContactPerson("");
      setAddress("");
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
                <ShoppingBag className="w-6 h-6" />
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">الموردون وسلاسل الإمداد والتوريد</h1>
            </div>
            <p className="text-gray-500 text-xs md:text-sm mt-1">
              دليل شركات الغزل، تجار الأقمشة، مستوردي الإبر ومستلزمات الإنتاج مع تتبع الأرصدة المستحقة.
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
            إضافة مورد جديد
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">إجمالي الموردين المعتمدين</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{stats.totalSuppliers}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">إجمالي الأرصدة المستحقة للموردين</p>
            <p className="text-2xl font-black text-amber-600 mt-1">
              {stats.totalOutstanding.toLocaleString()} ج.م
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold">
            {successMsg}
          </div>
        )}

        {/* Suppliers Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">دليل الموردين وشركاء الإنتاج</h2>
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
                  <th className="py-3 px-4">اسم المورد والشركة</th>
                  <th className="py-3 px-4">التصنيف</th>
                  <th className="py-3 px-4">مسؤول الاتصال</th>
                  <th className="py-3 px-4">رقم الهاتف</th>
                  <th className="py-3 px-4">العنوان والمدينة</th>
                  <th className="py-3 px-4">الرصيد المستحق</th>
                  <th className="py-3 px-4">أوامر التوريد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      لا يوجد موردون مسجلون حتى الآن.
                    </td>
                  </tr>
                ) : (
                  suppliers.map((sup) => (
                    <tr key={sup.id} className="hover:bg-gray-50/70 transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-900 block">{sup.name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold text-[10px]">
                          {sup.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{sup.contactPerson || "-"}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-gray-900">
                        <a href={`tel:${sup.phone}`} className="hover:underline flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#079B62]" />
                          <span>{sup.phone}</span>
                        </a>
                      </td>
                      <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{sup.address || "-"}</td>
                      <td className="py-3 px-4 font-mono font-bold text-gray-900">
                        {sup.outstandingBalance > 0 ? (
                          <span className="text-amber-700">{sup.outstandingBalance.toLocaleString()} ج.م</span>
                        ) : (
                          <span className="text-emerald-700">خالص ✓</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-500">
                        {sup._count?.purchaseOrders || 0} طلب
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Supplier Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 bg-gradient-to-l from-[#14264A] to-[#079B62] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-300" />
                  <h3 className="font-bold text-base">إضافة مورد جديد</h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSupplier} className="p-6 space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">اسم المورد أو الشركة *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="شركة الدلتا للغزل والنسيج"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">التصنيف الرئيسي *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                    >
                      <option value="YARN">غزول وخيوط</option>
                      <option value="FABRIC">أقمشة خام ومجهزة</option>
                      <option value="ACCESSORIES">إكسسوارات وسوست وأزرار</option>
                      <option value="DYES">صباغة وكيماويات</option>
                      <option value="PACKAGING">تعبئة وتغليف وكرتون</option>
                      <option value="SPARE_PARTS">قطع غيار ماكينات</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">مسؤول الاتصال</label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="أ. مدحت الشناوي"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">رقم الهاتف / واتساب *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="01011223344"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">الرصيد الافتتاحي المستحق (ج.م)</label>
                    <input
                      type="number"
                      min="0"
                      value={outstandingBalance}
                      onChange={(e) => setOutstandingBalance(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">العنوان والمدينة</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="المنطقة الصناعية الأولى، المحلة الكبرى"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
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
                    {submitting ? "جاري الإضافة..." : "حفظ المورد"}
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
