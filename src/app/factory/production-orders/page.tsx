"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  CheckCircle2,
  Plus,
  RefreshCw,
  Clock,
  Package,
  Calendar,
  AlertCircle,
  X,
  Play,
  Check,
  Pause,
  Layers,
  QrCode,
} from "lucide-react";
import { JobTrackingCard } from "@/components/factory/JobTrackingCard";

interface ProductionOrder {
  id: string;
  orderNumber: string;
  batchNumber: string | null;
  productName: string;
  targetQuantity: number;
  totalProduced: number;
  totalGood: number;
  totalDefect: number;
  progressPercentage: number;
  priority: string;
  status: string;
  plannedStartDate: string;
  plannedEndDate: string;
  cost?: {
    costPerGoodUnit: number;
    totalCost: number;
  } | null;
  notes: string | null;
}

export default function ProductionOrdersPage() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [trackingCardOrder, setTrackingCardOrder] = useState<ProductionOrder | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [orderNumber, setOrderNumber] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [targetQuantity, setTargetQuantity] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [plannedStartDate, setPlannedStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [plannedEndDate, setPlannedEndDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
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
        fetch("/api/factory/production-orders"),
        fetch("/api/auth/me").catch(() => null),
      ]);
      const json = await res.json();
      if (res.ok) {
        setOrders(json.orders || []);
        if (json.products) setProducts(json.products);
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

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/factory/production-orders", {
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

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/factory/production-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber,
          batchNumber,
          productId: productId || null,
          productName,
          targetQuantity,
          priority,
          plannedStartDate,
          plannedEndDate,
          notes,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "فشل إنشاء أمر الإنتاج");
      }

      setSuccessMsg("تم إنشاء أمر الإنتاج الجديد بنجاح ✓");
      setModalOpen(false);
      setOrderNumber("");
      setBatchNumber("");
      setProductName("");
      setTargetQuantity("");
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
              <span className="p-2 bg-purple-50 text-[#5932A8] rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">أوامر الإنتاج وتشغيل الدفعات</h1>
            </div>
            <p className="text-gray-500 text-xs md:text-sm mt-1">
              متابعة أوامر التشغيل الصناعي، نسب الإنجاز، أرقام اللوط والتشغيل، وتكلفة القطعة التقديرية.
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
            أمر إنتاج جديد
          </button>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold">
            {successMsg}
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">قائمة أوامر الإنتاج النشطة والسابقة</h2>
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
                  <th className="py-3 px-4">رقم الأمر واللوط</th>
                  <th className="py-3 px-4">المنتج المستهدف</th>
                  <th className="py-3 px-4">الكمية المستهدفة</th>
                  <th className="py-3 px-4">المنجز السليم</th>
                  <th className="py-3 px-4">نسبة الإنجاز</th>
                  <th className="py-3 px-4">الأولوية</th>
                  <th className="py-3 px-4">تاريخ التسليم</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-400">
                      لا توجد أوامر إنتاج حتى الآن. اضغط على زر "أمر إنتاج جديد" لإنشاء أمر تشغيل.
                    </td>
                  </tr>
                ) : (
                  orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-gray-50/70 transition">
                      <td className="py-3 px-4 font-medium">
                        <span className="font-bold text-gray-900 block">{ord.orderNumber}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{ord.batchNumber || "-"}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-800">{ord.productName}</td>
                      <td className="py-3 px-4 font-bold text-gray-900">{ord.targetQuantity.toLocaleString()} قطعة</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">
                        {ord.totalGood.toLocaleString()} قطعة
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden mb-1">
                          <div
                            className="bg-[#5932A8] h-full rounded-full transition-all duration-300"
                            style={{ width: `${ord.progressPercentage}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500">{ord.progressPercentage}%</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ord.priority === "URGENT"
                              ? "bg-red-100 text-red-800"
                              : ord.priority === "HIGH"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {ord.priority === "URGENT"
                            ? "عاجل جداً"
                            : ord.priority === "HIGH"
                            ? "أولوية عالية"
                            : "عادي"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                        {new Date(ord.plannedEndDate).toLocaleDateString("ar-EG", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            ord.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800"
                              : ord.status === "IN_PROGRESS"
                              ? "bg-blue-100 text-blue-800"
                              : ord.status === "PAUSED"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {ord.status === "COMPLETED"
                            ? "مكتمل ✓"
                            : ord.status === "IN_PROGRESS"
                            ? "قيد التشغيل"
                            : ord.status === "PAUSED"
                            ? "متوقف مؤقتاً"
                            : "مخطط"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setTrackingCardOrder(ord)}
                            className="p-1.5 bg-purple-50 text-[#5932A8] hover:bg-purple-100 rounded-lg transition"
                            title="عرض وطباعة بطاقة التتبع والباركود"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                          {ord.status !== "COMPLETED" && (
                            <>
                              {ord.status !== "IN_PROGRESS" && (
                                <button
                                  onClick={() => handleStatusChange(ord.id, "IN_PROGRESS")}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                  title="بدء التشغيل"
                                >
                                  <Play className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleStatusChange(ord.id, "COMPLETED")}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                title="إتمام الأمر"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Creation Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 bg-gradient-to-l from-[#14264A] to-[#5932A8] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-300" />
                  <h3 className="font-bold text-base">إنشاء أمر إنتاج جديد</h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">رقم أمر الإنتاج *</label>
                    <input
                      type="text"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      placeholder="ORD-1026"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">رقم الدفعة / اللوط</label>
                    <input
                      type="text"
                      value={batchNumber}
                      onChange={(e) => setBatchNumber(e.target.value)}
                      placeholder="BATCH-2026-1026"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">المنتج من الكتالوج</label>
                    <select
                      value={productId}
                      onChange={(e) => {
                        setProductId(e.target.value);
                        const sel = products.find((p) => p.id === e.target.value);
                        if (sel) setProductName(sel.name);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
                    >
                      <option value="">منتج مخصص أو اختر من الكتالوج...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">اسم المنتج أو الموديل *</label>
                    <input
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="تيشيرت بولو بيكيه قطن"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">الكمية المستهدفة (قطعة) *</label>
                    <input
                      type="number"
                      min="1"
                      value={targetQuantity}
                      onChange={(e) => setTargetQuantity(e.target.value)}
                      placeholder="2500"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">درجة الأولوية</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
                    >
                      <option value="LOW">عادي / منخفض</option>
                      <option value="MEDIUM">متوسط</option>
                      <option value="HIGH">أولوية مرتفعة</option>
                      <option value="URGENT">عاجل جداً</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">تاريخ بدء التشغيل</label>
                    <input
                      type="date"
                      value={plannedStartDate}
                      onChange={(e) => setPlannedStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">الموعد المستهدف للتسليم</label>
                    <input
                      type="date"
                      value={plannedEndDate}
                      onChange={(e) => setPlannedEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ملاحظات ومواصفات التشغيل</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="تعليمات خاصة بالغسيل، التطريز، أو مواصفات التغليف..."
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
                    {submitting ? "جاري الإنشاء..." : "اعتماد أمر الإنتاج"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Printable Job Tracking Card Modal */}
        {trackingCardOrder && (
          <JobTrackingCard
            orderNumber={trackingCardOrder.orderNumber}
            batchNumber={trackingCardOrder.batchNumber || `BATCH-${trackingCardOrder.orderNumber}`}
            productName={trackingCardOrder.productName}
            targetQuantity={trackingCardOrder.targetQuantity}
            plannedStartDate={trackingCardOrder.plannedStartDate}
            plannedEndDate={trackingCardOrder.plannedEndDate}
            priority={trackingCardOrder.priority}
            onClose={() => setTrackingCardOrder(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
