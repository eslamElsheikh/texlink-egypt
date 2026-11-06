"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  DollarSign,
  Plus,
  RefreshCw,
  PieChart,
  Calculator,
  Layers,
  Cpu,
  X,
  CreditCard,
  Building,
} from "lucide-react";

interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod: string;
  description: string;
  relatedMachine: { code: string; name: string } | null;
  relatedProductionOrder: { orderNumber: string } | null;
}

interface CostRecord {
  id: string;
  materialCost: number;
  directLaborCost: number;
  machineCost: number;
  maintenanceCost: number;
  overheadCost: number;
  totalCost: number;
  goodUnitsCount: number;
  costPerGoodUnit: number;
  productionOrder: {
    id: string;
    orderNumber: string;
    productNameSnapshot: string;
    targetQuantity: number;
    status: string;
  };
}

export default function ExpensesAndCostsPage() {
  const [activeTab, setActiveTab] = useState<"EXPENSES" | "COSTING">("EXPENSES");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [costs, setCosts] = useState<CostRecord[]>([]);
  const [options, setOptions] = useState<{
    machines: Array<{ id: string; code: string; name: string }>;
    orders: Array<{ id: string; orderNumber: string; productNameSnapshot: string }>;
  }>({ machines: [], orders: [] });

  const [loading, setLoading] = useState(true);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [costModalOpen, setCostModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Expense Form
  const [category, setCategory] = useState("ELECTRICITY");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [description, setDescription] = useState("");
  const [relatedMachineId, setRelatedMachineId] = useState("");
  const [relatedOrderId, setRelatedOrderId] = useState("");

  // Cost Form
  const [costOrderId, setCostOrderId] = useState("");
  const [materialCost, setMaterialCost] = useState("");
  const [directLaborCost, setDirectLaborCost] = useState("");
  const [machineCost, setMachineCost] = useState("");
  const [maintenanceCost, setMaintenanceCost] = useState("");
  const [overheadCost, setOverheadCost] = useState("");

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
      const [expRes, costRes, meRes] = await Promise.all([
        fetch("/api/factory/expenses"),
        fetch("/api/factory/costs"),
        fetch("/api/auth/me").catch(() => null),
      ]);

      const expJson = await expRes.json();
      const costJson = await costRes.json();

      if (expRes.ok) {
        setExpenses(expJson.expenses || []);
        if (expJson.options) setOptions(expJson.options);
      }
      if (costRes.ok) {
        setCosts(costJson.costs || []);
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

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/factory/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          amount,
          paymentMethod,
          description,
          relatedMachineId: relatedMachineId || null,
          relatedProductionOrderId: relatedOrderId || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل تسجيل المصروف");

      setSuccessMsg("تم تسجيل المصروف بنجاح ✓");
      setExpenseModalOpen(false);
      setAmount("");
      setDescription("");
      fetchData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleComputeCost = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/factory/costs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productionOrderId: costOrderId,
          materialCost: materialCost || undefined,
          directLaborCost: directLaborCost || undefined,
          machineCost: machineCost || undefined,
          maintenanceCost: maintenanceCost || undefined,
          overheadCost: overheadCost || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل احتساب التكلفة");

      setSuccessMsg("تم احتساب تكلفة أمر الإنتاج وسعر القطعة السليمة بنجاح ✓");
      setCostModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  const totalExpenseAmount = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <DashboardLayout user={user} currentRole="FACTORY">
      <div className="space-y-6 pb-12 font-sans" dir="rtl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-50 text-[#079B62] rounded-xl">
                <DollarSign className="w-6 h-6" />
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">المصروفات التشغيلية وحساب تكلفة القطعة</h1>
            </div>
            <p className="text-gray-500 text-xs md:text-sm mt-1">
              إدارة بنود فواتير الكهرباء، الصيانة، الأجور، واحتساب التكلفة الصناعية الدقيقة لكل قطعة منتجة.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setErrorMsg(null);
                setExpenseModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#079B62] text-white rounded-xl font-bold text-xs hover:bg-[#068453] transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              تسجيل مصروف جديد
            </button>
            <button
              onClick={() => {
                setErrorMsg(null);
                setCostModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5932A8] text-white rounded-xl font-bold text-xs hover:bg-[#49278f] transition shadow-sm"
            >
              <Calculator className="w-4 h-4" />
              احتساب تكلفة أمر إنتاج
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("EXPENSES")}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 ${
              activeTab === "EXPENSES"
                ? "border-[#079B62] text-[#079B62]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            المصروفات التشغيلية المباشرة
          </button>
          <button
            onClick={() => setActiveTab("COSTING")}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 ${
              activeTab === "COSTING"
                ? "border-[#5932A8] text-[#5932A8]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            محرك تكاليف أوامر الإنتاج (Costing Engine)
          </button>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold">
            {successMsg}
          </div>
        )}

        {/* TAB 1: Expenses */}
        {activeTab === "EXPENSES" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-500">إجمالي المصروفات المسجلة</p>
                <p className="text-2xl font-black text-gray-900 mt-1">
                  {totalExpenseAmount.toLocaleString()} ج.م
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-500">عدد بنود المصروفات</p>
                <p className="text-2xl font-black text-gray-900 mt-1">{expenses.length}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-500">متوسط المصروف اليومي</p>
                <p className="text-2xl font-black text-[#079B62] mt-1">
                  {Math.round(totalExpenseAmount / 30).toLocaleString()} ج.م
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">سجل المصروفات التشغيلية</h2>
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
                      <th className="py-3 px-4">البند والتصنيف</th>
                      <th className="py-3 px-4">المبلغ</th>
                      <th className="py-3 px-4">طريقة الدفع</th>
                      <th className="py-3 px-4">البيان والوصف</th>
                      <th className="py-3 px-4">الماكينة / الأمر المرتبط</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-800">
                    {expenses.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-400">
                          لا توجد مصروفات مسجلة حتى الآن.
                        </td>
                      </tr>
                    ) : (
                      expenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-gray-50/70 transition">
                          <td className="py-3 px-4 font-mono text-[11px] text-gray-500">
                            {new Date(exp.date).toLocaleDateString("ar-EG", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold">
                              {exp.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-gray-900 text-sm">
                            {exp.amount.toLocaleString()} ج.م
                          </td>
                          <td className="py-3 px-4 text-gray-600">{exp.paymentMethod}</td>
                          <td className="py-3 px-4 text-gray-700 max-w-sm">{exp.description}</td>
                          <td className="py-3 px-4 text-gray-500 text-[11px]">
                            {exp.relatedMachine
                              ? `ماكينة: ${exp.relatedMachine.code}`
                              : exp.relatedProductionOrder
                              ? `أمر: ${exp.relatedProductionOrder.orderNumber}`
                              : "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Costing Engine */}
        {activeTab === "COSTING" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">تكلفة أوامر الإنتاج وسعر القطعة النهائي</h2>
                <p className="text-xs text-gray-500">
                  توزيع مباشر: خامات + عمالة مباشرة + تشغيل ماكينات + صيانة + مصاريف عمومية.
                </p>
              </div>
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
                    <th className="py-3 px-4">أمر الإنتاج</th>
                    <th className="py-3 px-4">تكلفة الخامات</th>
                    <th className="py-3 px-4">أجور العمالة</th>
                    <th className="py-3 px-4">تشغيل الماكينات</th>
                    <th className="py-3 px-4">نصيب الصيانة</th>
                    <th className="py-3 px-4">المصاريف غير المباشرة</th>
                    <th className="py-3 px-4">إجمالي التكلفة</th>
                    <th className="py-3 px-4">القطع السليمة</th>
                    <th className="py-3 px-4">تكلفة القطعة السليمة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {costs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-gray-400">
                        لا توجد احتسابات تكلفة مسجلة حتى الآن.
                      </td>
                    </tr>
                  ) : (
                    costs.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/70 transition">
                        <td className="py-3 px-4 font-bold text-gray-900">
                          {c.productionOrder.orderNumber}
                          <span className="block text-[10px] text-gray-400 font-normal">
                            {c.productionOrder.productNameSnapshot}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono">{c.materialCost.toLocaleString()} ج.م</td>
                        <td className="py-3 px-4 font-mono">{c.directLaborCost.toLocaleString()} ج.م</td>
                        <td className="py-3 px-4 font-mono">{c.machineCost.toLocaleString()} ج.م</td>
                        <td className="py-3 px-4 font-mono">{c.maintenanceCost.toLocaleString()} ج.م</td>
                        <td className="py-3 px-4 font-mono">{c.overheadCost.toLocaleString()} ج.م</td>
                        <td className="py-3 px-4 font-mono font-bold text-gray-900">
                          {c.totalCost.toLocaleString()} ج.م
                        </td>
                        <td className="py-3 px-4 font-mono text-emerald-600 font-bold">
                          {c.goodUnitsCount.toLocaleString()} قطعة
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-900 rounded-lg font-mono font-black text-sm">
                            {c.costPerGoodUnit} ج.م / قطعة
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Record Expense Modal */}
        {expenseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 bg-gradient-to-l from-[#14264A] to-[#079B62] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-300" />
                  <h3 className="font-bold text-base">تسجيل مصروف تشغيلي جديد</h3>
                </div>
                <button
                  onClick={() => setExpenseModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateExpense} className="p-6 space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">بند المصروف *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                    >
                      <option value="ELECTRICITY">كهرباء وطاقة المصنع</option>
                      <option value="MAINTENANCE">صيانة دورية وإصلاحات</option>
                      <option value="SPARE_PARTS">قطع غيار وإبر</option>
                      <option value="LABOR">أجور عمالة ومكافآت</option>
                      <option value="RENT">إيجار عنبر المصنع</option>
                      <option value="TRANSPORTATION">نقل وتوصيل وشحن</option>
                      <option value="RAW_MATERIALS">شراء خامات نقدية</option>
                      <option value="OTHER">مصروفات أخرى</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">المبلغ (ج.م) *</label>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      placeholder="1500"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">طريقة السداد</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                    >
                      <option value="CASH">نقدي (كاش الخزينة)</option>
                      <option value="BANK_TRANSFER">تحويل بنكي</option>
                      <option value="CHEQUE">شيك</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">الماكينة المرتبطة (اختياري)</label>
                    <select
                      value={relatedMachineId}
                      onChange={(e) => setRelatedMachineId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                    >
                      <option value="">غير مرتبط بماكينة</option>
                      {options.machines.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.code} - {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">البيان والوصف *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={2}
                    placeholder="بيان الفاتورة، رقم الإيصال، اسم المورد أو التفاصيل..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setExpenseModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-[#079B62] text-white rounded-xl text-xs font-bold hover:bg-[#068453] transition disabled:opacity-50"
                  >
                    {submitting ? "جاري الحفظ..." : "حفظ المصروف"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Costing Engine Modal */}
        {costModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 bg-gradient-to-l from-[#14264A] to-[#5932A8] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-purple-300" />
                  <h3 className="font-bold text-base">احتساب تكلفة أمر إنتاج وسعر القطعة</h3>
                </div>
                <button
                  onClick={() => setCostModalOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleComputeCost} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">أمر الإنتاج المستهدف *</label>
                  <select
                    value={costOrderId}
                    onChange={(e) => setCostOrderId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
                  >
                    <option value="">اختر أمر الإنتاج...</option>
                    {options.orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.orderNumber} - {o.productNameSnapshot}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">تكلفة الخامات المباشرة (ج.م)</label>
                    <input
                      type="number"
                      min="0"
                      value={materialCost}
                      onChange={(e) => setMaterialCost(e.target.value)}
                      placeholder="تلقائي من المخزن"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">أجور العمالة المباشرة (ج.م)</label>
                    <input
                      type="number"
                      min="0"
                      value={directLaborCost}
                      onChange={(e) => setDirectLaborCost(e.target.value)}
                      placeholder="15000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">تشغيل الماكينات</label>
                    <input
                      type="number"
                      min="0"
                      value={machineCost}
                      onChange={(e) => setMachineCost(e.target.value)}
                      placeholder="12000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">نصيب الصيانة</label>
                    <input
                      type="number"
                      min="0"
                      value={maintenanceCost}
                      onChange={(e) => setMaintenanceCost(e.target.value)}
                      placeholder="3000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">مصاريف غير مباشرة</label>
                    <input
                      type="number"
                      min="0"
                      value={overheadCost}
                      onChange={(e) => setOverheadCost(e.target.value)}
                      placeholder="8000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setCostModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-[#5932A8] text-white rounded-xl text-xs font-bold hover:bg-[#49278f] transition disabled:opacity-50"
                  >
                    {submitting ? "جاري الاحتساب..." : "حساب واعتماد التكلفة"}
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
