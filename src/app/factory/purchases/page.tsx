"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  ShoppingBag,
  Plus,
  RefreshCw,
  Boxes,
  CheckCircle2,
  Clock,
  ArrowDownLeft,
  X,
  Trash2,
  DollarSign,
} from "lucide-react";

interface PurchaseOrder {
  id: string;
  poNumber: string;
  orderDate: string;
  expectedDeliveryDate: string | null;
  status: string;
  totalAmount: number;
  notes: string | null;
  supplier: {
    id: string;
    name: string;
    phone: string;
  };
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    receivedQuantity: number;
    unitPrice: number;
    totalPrice: number;
    inventoryItemId: string | null;
    inventoryItem?: {
      id: string;
      name: string;
      unit: string;
    } | null;
  }>;
}

export default function PurchasesPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [options, setOptions] = useState<{
    suppliers: Array<{ id: string; name: string; category: string }>;
    inventoryItems: Array<{ id: string; name: string; unit: string; currentStock: number }>;
  }>({ suppliers: [], inventoryItems: [] });
  const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, totalPurchases: 0 });

  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [receivedQtyNow, setReceivedQtyNow] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [supplierId, setSupplierId] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [items, setItems] = useState<Array<{ description: string; quantity: string; unitPrice: string; inventoryItemId: string }>>([
    { description: "", quantity: "100", unitPrice: "50", inventoryItemId: "" },
  ]);

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
        fetch("/api/factory/purchases"),
        fetch("/api/auth/me").catch(() => null),
      ]);
      const json = await res.json();
      if (res.ok) {
        setOrders(json.orders || []);
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

  const handleAddItemRow = () => {
    setItems([...items, { description: "", quantity: "100", unitPrice: "50", inventoryItemId: "" }]);
  };

  const handleRemoveItemRow = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/factory/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId,
          poNumber,
          expectedDeliveryDate: expectedDate || null,
          items: items.map((it) => ({
            description: it.description,
            quantity: parseFloat(it.quantity),
            unitPrice: parseFloat(it.unitPrice),
            inventoryItemId: it.inventoryItemId || null,
          })),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل إنشاء أمر الشراء");

      setSuccessMsg("تم إصدار أمر الشراء بنجاح ✓");
      setCreateModalOpen(false);
      setPoNumber("");
      fetchData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReceiveGoods = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO || !selectedItemId) return;
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/factory/purchases", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RECEIVE_ITEMS",
          purchaseOrderId: selectedPO.id,
          itemId: selectedItemId,
          receivedQuantityNow: receivedQtyNow,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل استلام البضاعة");

      setSuccessMsg("تم استلام البضاعة وإضافتها لرصيد المخزن في دفتر الأستاذ بنجاح ✓");
      setReceiveModalOpen(false);
      setSelectedPO(null);
      setReceivedQtyNow("");
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
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">أوامر الشراء واستلام التوريدات (Purchasing & Receiving)</h1>
            </div>
            <p className="text-gray-500 text-xs md:text-sm mt-1">
              إصدار أوامر الشراء للموردين، واستلام الخامات مباشرة في مستودعات المصنع بدون ازدواج.
            </p>
          </div>

          <button
            onClick={() => {
              setErrorMsg(null);
              setCreateModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#079B62] text-white rounded-xl font-bold text-sm hover:bg-[#068453] transition shadow-sm"
          >
            <Plus className="w-5 h-5" />
            أمر شراء جديد
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">إجمالي أوامر الشراء</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{stats.totalOrders}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">أوامر معلقة وبانتظار الاستلام</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{stats.pendingOrders}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">إجمالي قيمة التوريدات</p>
            <p className="text-2xl font-black text-[#079B62] mt-1">
              {stats.totalPurchases.toLocaleString()} ج.م
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold">
            {successMsg}
          </div>
        )}

        {/* Purchases Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">سجل أوامر الشراء والتوريد</h2>
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
                  <th className="py-3 px-4">رقم الأمر</th>
                  <th className="py-3 px-4">المورد</th>
                  <th className="py-3 px-4">تاريخ الأمر</th>
                  <th className="py-3 px-4">عدد البنود</th>
                  <th className="py-3 px-4">إجمالي القيمة</th>
                  <th className="py-3 px-4">حالة الاستلام</th>
                  <th className="py-3 px-4">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      لا توجد أوامر شراء مسجلة حتى الآن.
                    </td>
                  </tr>
                ) : (
                  orders.map((po) => (
                    <tr key={po.id} className="hover:bg-gray-50/70 transition">
                      <td className="py-3 px-4 font-bold text-gray-900">{po.poNumber}</td>
                      <td className="py-3 px-4 font-semibold text-gray-800">{po.supplier.name}</td>
                      <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                        {new Date(po.orderDate).toLocaleDateString("ar-EG", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-4 font-mono">{po.items.length} بنود</td>
                      <td className="py-3 px-4 font-mono font-bold text-gray-900">
                        {po.totalAmount.toLocaleString()} ج.م
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            po.status === "RECEIVED"
                              ? "bg-emerald-100 text-emerald-800"
                              : po.status === "PARTIALLY_RECEIVED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {po.status === "RECEIVED"
                            ? "مستلم بالكامل ✓"
                            : po.status === "PARTIALLY_RECEIVED"
                            ? "مستلم جزئياً"
                            : "قيد التوريد"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {po.status !== "RECEIVED" && (
                          <button
                            onClick={() => {
                              setSelectedPO(po);
                              if (po.items.length > 0) setSelectedItemId(po.items[0].id);
                              setReceiveModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-[#079B62] text-white rounded-lg text-[10px] font-bold hover:bg-[#068453] transition"
                          >
                            استلام بضاعة بالمخزن
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

        {/* Create PO Modal */}
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 bg-gradient-to-l from-[#14264A] to-[#079B62] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-300" />
                  <h3 className="font-bold text-base">إصدار أمر شراء خامات جديد</h3>
                </div>
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePO} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">المورد *</label>
                    <select
                      value={supplierId}
                      onChange={(e) => setSupplierId(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                    >
                      <option value="">اختر المورد...</option>
                      {options.suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">رقم أمر الشراء (PO#) *</label>
                    <input
                      type="text"
                      value={poNumber}
                      onChange={(e) => setPoNumber(e.target.value)}
                      required
                      placeholder="PO-2026-005"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold uppercase focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">بنود وخامات أمر الشراء:</span>
                    <button
                      type="button"
                      onClick={handleAddItemRow}
                      className="text-xs font-bold text-[#079B62] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      إضافة بند
                    </button>
                  </div>

                  {items.map((it, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] text-gray-500 mb-0.5">وصف الخامة أو البند *</label>
                          <input
                            type="text"
                            value={it.description}
                            onChange={(e) => {
                              const next = [...items];
                              next[idx].description = e.target.value;
                              setItems(next);
                            }}
                            required
                            placeholder="خيط قطن 30/1 ممشط"
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-500 mb-0.5">الكمية *</label>
                          <input
                            type="number"
                            min="1"
                            value={it.quantity}
                            onChange={(e) => {
                              const next = [...items];
                              next[idx].quantity = e.target.value;
                              setItems(next);
                            }}
                            required
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-500 mb-0.5">سعر الوحدة (ج.م) *</label>
                          <input
                            type="number"
                            min="0"
                            value={it.unitPrice}
                            onChange={(e) => {
                              const next = [...items];
                              next[idx].unitPrice = e.target.value;
                              setItems(next);
                            }}
                            required
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-bold"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-200/60">
                        <div className="flex-1">
                          <select
                            value={it.inventoryItemId}
                            onChange={(e) => {
                              const next = [...items];
                              next[idx].inventoryItemId = e.target.value;
                              setItems(next);
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded-lg text-[11px] text-gray-600"
                          >
                            <option value="">ربط بصنف المخزن (لتحديث الرصيد عند الاستلام)...</option>
                            {options.inventoryItems.map((inv) => (
                              <option key={inv.id} value={inv.id}>
                                {inv.name} ({inv.unit})
                              </option>
                            ))}
                          </select>
                        </div>

                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-[#079B62] text-white rounded-xl text-xs font-bold hover:bg-[#068453] transition disabled:opacity-50"
                  >
                    {submitting ? "جاري الإصدار..." : "إصدار أمر الشراء"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Receive Goods Modal */}
        {receiveModalOpen && selectedPO && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 bg-gradient-to-l from-[#14264A] to-[#079B62] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-emerald-300" />
                  <h3 className="font-bold text-base">استلام بضاعة وإضافتها للمخزن</h3>
                </div>
                <button
                  onClick={() => setReceiveModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleReceiveGoods} className="p-6 space-y-4">
                <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1">
                  <p className="font-bold text-gray-900">أمر الشراء: {selectedPO.poNumber}</p>
                  <p className="text-gray-600">المورد: {selectedPO.supplier.name}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">البند المطلوب استلامه *</label>
                  <select
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                  >
                    {selectedPO.items.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.description} (مطلوب: {it.quantity} - مستلم سابقاً: {it.receivedQuantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">الكمية المستلمة الآن *</label>
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    value={receivedQtyNow}
                    onChange={(e) => setReceivedQtyNow(e.target.value)}
                    required
                    placeholder="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    سيتم قيد حركة PURCHASE_IN فورية وزيادة رصيد المخزن في دفتر الأستاذ.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setReceiveModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-[#079B62] text-white rounded-xl text-xs font-bold hover:bg-[#068453] transition disabled:opacity-50"
                  >
                    {submitting ? "جاري الاستلام..." : "تأكيد إذن الاستلام"}
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
