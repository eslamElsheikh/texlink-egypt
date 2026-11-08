"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Boxes,
  Plus,
  RefreshCw,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  X,
  History,
  Layers,
  Building,
} from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  sku: string | null;
  batchNumber: string | null;
  category: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  unitCost: number;
  totalValuation: number;
  warehouse: {
    id: string;
    name: string;
    type: string;
  };
}

interface StockMovement {
  id: string;
  movementType: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  unitCost: number;
  referenceOrderNumber: string | null;
  notes: string | null;
  createdAt: string;
  inventoryItem: {
    id: string;
    name: string;
    sku: string | null;
    unit: string;
  };
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Array<{ id: string; name: string; type: string }>>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [stats, setStats] = useState({
    totalItemsCount: 0,
    totalValuation: 0,
    lowStockCount: 0,
    warehousesCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [selectedItemForMovement, setSelectedItemForMovement] = useState<InventoryItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Movement Form
  const [movementType, setMovementType] = useState("PURCHASE_IN");
  const [movementQty, setMovementQty] = useState("");
  const [movementNotes, setMovementNotes] = useState("");

  // Item Form
  const [warehouseId, setWarehouseId] = useState("");
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [category, setCategory] = useState("YARN");
  const [unit, setUnit] = useState("KG");
  const [initialStock, setInitialStock] = useState("100");
  const [minimumStock, setMinimumStock] = useState("50");
  const [unitCost, setUnitCost] = useState("120");

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
        fetch("/api/factory/inventory"),
        fetch("/api/auth/me").catch(() => null),
      ]);
      const json = await res.json();
      if (res.ok) {
        setItems(json.items || []);
        if (json.warehouses) {
          setWarehouses(json.warehouses);
          if (json.warehouses.length > 0 && !warehouseId) {
            setWarehouseId(json.warehouses[0].id);
          }
        }
        if (json.movements) setMovements(json.movements);
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

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/factory/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_ITEM",
          warehouseId,
          name,
          sku,
          batchNumber,
          category,
          unit,
          initialStock,
          minimumStock,
          unitCost,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل إضافة الصنف");

      setSuccessMsg("تم إضافة الصنف الجديد وتحديث رصيد المخزن بنجاح ✓");
      setItemModalOpen(false);
      setName("");
      setSku("");
      fetchData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForMovement) return;
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/factory/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "STOCK_MOVEMENT",
          inventoryItemId: selectedItemForMovement.id,
          movementType,
          quantity: movementQty,
          notes: movementNotes,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل تسجيل حركة المخزون");

      setSuccessMsg("تم تسجيل الحركة المخزنية وتحديث الرصيد بدقة في دفتر الأستاذ ✓");
      setMovementModalOpen(false);
      setMovementQty("");
      setMovementNotes("");
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
                <Boxes className="w-6 h-6" />
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">المخازن والخامات ودفتر الأستاذ (Stock Ledger)</h1>
            </div>
            <p className="text-gray-500 text-xs md:text-sm mt-1">
              متابعة الأرصدة الحية للغزول والأقمشة وقطع الغيار، تنبيهات النواقص، ودفتر الحركات غير القابل للتلاعب.
            </p>
          </div>

          <button
            onClick={() => {
              setErrorMsg(null);
              setItemModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#079B62] text-white rounded-xl font-bold text-sm hover:bg-[#068453] transition shadow-sm"
          >
            <Plus className="w-5 h-5" />
            إضافة خامة / صنف جديد
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">إجمالي الأصناف بالمخازن</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{stats.totalItemsCount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">إجمالي تقييم المخزون</p>
            <p className="text-2xl font-black text-[#079B62] mt-1">
              {stats.totalValuation.toLocaleString()} ج.م
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">أصناف قاربت على النفاد</p>
            <p className="text-2xl font-black text-red-600 mt-1">{stats.lowStockCount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">عدد المستودعات النشطة</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{stats.warehousesCount}</p>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold">
            {successMsg}
          </div>
        )}

        {/* Inventory Items Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">الأرصدة الحية بالمخازن</h2>
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
                  <th className="py-3 px-4">اسم الصنف والرمز</th>
                  <th className="py-3 px-4">المستودع</th>
                  <th className="py-3 px-4">التصنيف</th>
                  <th className="py-3 px-4">الرصيد الحالي</th>
                  <th className="py-3 px-4">الحد الأدنى</th>
                  <th className="py-3 px-4">سعر الوحدة</th>
                  <th className="py-3 px-4">إجمالي القيمة</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4">حركة مخزنية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-400">
                      لا توجد أصناف مسجلة حتى الآن.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const isLow = item.currentStock <= item.minimumStock;
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/70 transition">
                        <td className="py-3 px-4">
                          <span className="font-bold text-gray-900 block">{item.name}</span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {item.sku || item.batchNumber || "-"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700 font-medium">
                          {item.warehouse.name}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-semibold">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-900">
                          {item.currentStock.toLocaleString()} {item.unit}
                        </td>
                        <td className="py-3 px-4 text-gray-500 font-mono">
                          {item.minimumStock.toLocaleString()} {item.unit}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-gray-900">
                          {item.unitCost.toLocaleString()} ج.م
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#079B62]">
                          {(item.totalValuation || item.currentStock * item.unitCost).toLocaleString()} ج.م
                        </td>
                        <td className="py-3 px-4">
                          {isLow ? (
                            <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 font-extrabold text-[10px]">
                              رصيد منخفض ⚠️
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                              متوفر كافي ✓
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => {
                              setSelectedItemForMovement(item);
                              setMovementModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-emerald-50 text-[#079B62] border border-emerald-200 rounded-lg text-[10px] font-bold hover:bg-emerald-100 transition"
                          >
                            توريد / صرف
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Movements Ledger Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-gray-600" />
              <h2 className="text-base font-bold text-gray-900">دفتر حركات المخزن غير القابل للتعديل (Audit Ledger)</h2>
            </div>
            <span className="text-xs text-gray-400">آخر 50 حركة مسجلة</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">وقت الحركة</th>
                  <th className="py-3 px-4">الصنف</th>
                  <th className="py-3 px-4">نوع الحركة</th>
                  <th className="py-3 px-4">الكمية</th>
                  <th className="py-3 px-4">الرصيد السابق</th>
                  <th className="py-3 px-4">الرصيد الجديد</th>
                  <th className="py-3 px-4">المرجع</th>
                  <th className="py-3 px-4">ملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      لا توجد حركات مخزنية سابقة.
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => {
                    const isPlus =
                      m.movementType === "PURCHASE_IN" ||
                      m.movementType === "PRODUCTION_RETURN" ||
                      m.movementType === "ADJUSTMENT_IN";
                    return (
                      <tr key={m.id} className="hover:bg-gray-50/70 transition">
                        <td className="py-3 px-4 font-mono text-[11px] text-gray-500">
                          {new Date(m.createdAt).toLocaleDateString("ar-EG", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-900">
                          {m.inventoryItem.name}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              isPlus
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {m.movementType}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold font-mono">
                          <span className={isPlus ? "text-emerald-600" : "text-amber-600"}>
                            {isPlus ? "+" : "-"}
                            {m.quantity.toLocaleString()} {m.inventoryItem.unit}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 font-mono">{m.previousStock.toLocaleString()}</td>
                        <td className="py-3 px-4 font-bold text-gray-900 font-mono">{m.newStock.toLocaleString()}</td>
                        <td className="py-3 px-4 font-mono text-gray-600 text-[11px]">
                          {m.referenceOrderNumber || "-"}
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-[11px] max-w-xs truncate">
                          {m.notes || "-"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Record Stock Movement Modal */}
        {movementModalOpen && selectedItemForMovement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 bg-gradient-to-l from-[#14264A] to-[#079B62] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-emerald-300" />
                  <h3 className="font-bold text-base">تسجيل حركة مخزنية (صرف / توريد)</h3>
                </div>
                <button
                  onClick={() => setMovementModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRecordMovement} className="p-6 space-y-4">
                <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1">
                  <p className="font-bold text-gray-900">{selectedItemForMovement.name}</p>
                  <p className="text-gray-600">
                    الرصيد المتوفر حالياً: <strong>{selectedItemForMovement.currentStock} {selectedItemForMovement.unit}</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">نوع الحركة *</label>
                  <select
                    value={movementType}
                    onChange={(e) => setMovementType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                  >
                    <option value="PURCHASE_IN">توريد مشتريات جديد (+)</option>
                    <option value="PRODUCTION_ISSUE">صرف لخط الإنتاج (-)</option>
                    <option value="PRODUCTION_RETURN">مرتجع خامات من الإنتاج (+)</option>
                    <option value="ADJUSTMENT_IN">تسوية جردية بالزيادة (+)</option>
                    <option value="ADJUSTMENT_OUT">تسوية جردية بالنقص (-)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    الكمية ({selectedItemForMovement.unit}) *
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    value={movementQty}
                    onChange={(e) => setMovementQty(e.target.value)}
                    required
                    placeholder="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ملاحظات الحركة والسبب</label>
                  <input
                    type="text"
                    value={movementNotes}
                    onChange={(e) => setMovementNotes(e.target.value)}
                    placeholder="رقم إذن الاستلام، فاتورة المورد، أو أمر التشغيل..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setMovementModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-[#079B62] text-white rounded-xl text-xs font-bold hover:bg-[#068453] transition disabled:opacity-50"
                  >
                    {submitting ? "جاري التسجيل..." : "تأكيد الحركة المخزنية"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Inventory Item Modal */}
        {itemModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 bg-gradient-to-l from-[#14264A] to-[#079B62] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-emerald-300" />
                  <h3 className="font-bold text-base">إضافة خامة / صنف جديد للمستودع</h3>
                </div>
                <button
                  onClick={() => setItemModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateItem} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">المستودع *</label>
                    <select
                      value={warehouseId}
                      onChange={(e) => setWarehouseId(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                    >
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">التصنيف *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                    >
                      <option value="YARN">غزول وخيوط تريكو</option>
                      <option value="FABRIC">أقمشة نسيج وتريكو خام</option>
                      <option value="NEEDLES">إبر ومستلزمات ماكينات</option>
                      <option value="SPARE_PARTS">قطع غيار ميكانيكا وكهرباء</option>
                      <option value="ACCESSORIES">إكسسوارات خياطة وسوست</option>
                      <option value="PACKAGING">مواد تعبئة وتغليف وكرتون</option>
                      <option value="FINISHED_GOODS">منتجات تامة الصنع</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">اسم الصنف أو الخامة *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="خيوط قطن مصري 30/1 سوبر مشط"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">رمز الصنف (SKU)</label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="YRN-COT-301"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">وحدة القياس *</label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                    >
                      <option value="KG">كيلوجرام (KG)</option>
                      <option value="METERS">متر طولي (Meters)</option>
                      <option value="PIECES">قطعة (Pieces)</option>
                      <option value="ROLLS">توب / رول (Rolls)</option>
                      <option value="BOXES">كرتونة / علبة (Boxes)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">رصيد افتتاحي</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={initialStock}
                      onChange={(e) => setInitialStock(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">حد أدنى للتنبيه</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={minimumStock}
                      onChange={(e) => setMinimumStock(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">سعر الوحدة (ج.م)</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={unitCost}
                      onChange={(e) => setUnitCost(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setItemModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-[#079B62] text-white rounded-xl text-xs font-bold hover:bg-[#068453] transition disabled:opacity-50"
                  >
                    {submitting ? "جاري الإضافة..." : "حفظ الخامة في المستودع"}
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
