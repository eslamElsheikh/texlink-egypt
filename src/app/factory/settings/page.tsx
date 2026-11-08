"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Settings,
  ShieldCheck,
  ShoppingBag,
  AlertTriangle,
  Boxes,
  Save,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

export default function FactorySettingsPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Settings state
  const [marketplaceEnabled, setMarketplaceEnabled] = useState(true);
  const [autoMatchEnabled, setAutoMatchEnabled] = useState(true);
  const [wasteThresholdPct, setWasteThresholdPct] = useState("5.0");
  const [lowStockAlertThreshold, setLowStockAlertThreshold] = useState("50");
  const [currency, setCurrency] = useState("EGP");

  const [user, setUser] = useState({
    id: "factory-user",
    name: "إدارة المصنع",
    email: "",
    role: "FACTORY" as const,
    isFactory: true,
    isBuyer: false,
    factorySlug: "",
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [res, meRes] = await Promise.all([
        fetch("/api/factory/settings"),
        fetch("/api/auth/me").catch(() => null),
      ]);
      const json = await res.json();
      if (res.ok && json.settings) {
        setMarketplaceEnabled(json.settings.marketplaceEnabled);
        setAutoMatchEnabled(json.settings.autoMatchEnabled);
        setWasteThresholdPct(String(json.settings.wasteThresholdPct));
        setLowStockAlertThreshold(String(json.settings.lowStockAlertThreshold));
        setCurrency(json.settings.currency || "EGP");
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
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/factory/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marketplaceEnabled,
          autoMatchEnabled,
          wasteThresholdPct: parseFloat(wasteThresholdPct),
          lowStockAlertThreshold: parseInt(lowStockAlertThreshold, 10),
          currency,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل حفظ الإعدادات");

      setSuccessMsg("تم حفظ وتحديث إعدادات المصنع بنجاح ✓");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout user={user} currentRole="FACTORY">
      <div className="space-y-6 pb-12 font-sans max-w-4xl" dir="rtl">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-gray-100 text-gray-800 rounded-xl">
              <Settings className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">إعدادات نظام المصنع (Factory OS Settings)</h1>
              <p className="text-gray-500 text-xs md:text-sm mt-1">
                التحكم في تشغيل المصنع كنظام ERP مستقل، تخصيص تنبيهات الهالك والمخزون، والربط مع السوق التجاري.
              </p>
            </div>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Marketplace Integration & Dual Mode Status */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#079B62]" />
                <h2 className="text-sm font-bold text-gray-900">وضع الاشتراك والتكامل مع سوق تكس لينك التجاري B2B</h2>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black ${
                  marketplaceEnabled
                    ? "bg-purple-100 text-[#542cb7]"
                    : "bg-emerald-100 text-[#079B62]"
                }`}
              >
                {marketplaceEnabled
                  ? "إدارة المصنع + السوق التجاري (Full Access)"
                  : "إدارة المصنع فقط (Management Only)"}
              </span>
            </div>

            {/* Status Information Banner */}
            {!marketplaceEnabled ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#079B62] shrink-0" />
                  <p className="font-extrabold text-emerald-900 text-sm">
                    أنت تستخدم حالياً وضع إدارة المصنع الداخلي فقط (Management Only)
                  </p>
                </div>
                <p className="text-emerald-900/80 leading-relaxed">
                  يعمل حسابك كنظام ERP وتشغيل صناعي مستقل تماماً. لا يتم عرض منتجاتك أو بياناتك في السوق العام، ولا يستقبل مصنعك طلبات شراء عامة. جميع سجلات الماكينات والمخزون والتكاليف والإنتاج خاصة بك ومحمية.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-950 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#542cb7] shrink-0" />
                  <p className="font-extrabold text-purple-900 text-sm">
                    وضع السوق التجاري مفعل (Marketplace Active)
                  </p>
                </div>
                <p className="text-purple-900/80 leading-relaxed">
                  مصنعك يظهر في دليل مصانع مصر، ويمكن للمشترين إرسال طلبات تصنيع (RFQs)، ولديك وصول كامل لمساحة إدارة المبيعات والعملاء (CRM Workspace).
                </p>
              </div>
            )}

            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div>
                <p className="text-sm font-bold text-gray-900">تفعيل المشاركة في سوق تكس لينك التجاري B2B</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  عند إلغاء التفعيل، يعمل النظام كبرنامج ERP داخلي وتُخفى مساحة السوق وطلبات RFQ دون فقدان أي بيانات تشغيلية.
                </p>
              </div>
              <input
                type="checkbox"
                checked={marketplaceEnabled}
                onChange={(e) => setMarketplaceEnabled(e.target.checked)}
                className="w-5 h-5 text-[#079B62] rounded focus:ring-[#079B62]"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div>
                <p className="text-sm font-bold text-gray-900">المطابقة الذكية لطلبات الشراء (Auto-Matching)</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  تلقي تنبيهات بالصفقات والمقايسات المطابقة لقدرات ماكينات مصنعك بصورة تلقائية.
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoMatchEnabled}
                disabled={!marketplaceEnabled}
                onChange={(e) => setAutoMatchEnabled(e.target.checked)}
                className="w-5 h-5 text-[#079B62] rounded focus:ring-[#079B62] disabled:opacity-40"
              />
            </div>
          </div>

          {/* Section 2: Operational Thresholds */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h2 className="text-sm font-bold text-gray-900">حدود التنبيه والرقابة الصناعية</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  الحد الأقصى المستهدف لنسبة الهالك (%) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="50"
                  value={wasteThresholdPct}
                  onChange={(e) => setWasteThresholdPct(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                />
                <p className="text-[10px] text-gray-400 mt-1">يُطلق تنبيه إذا تجاوزت نسبة الهالك هذا المعدل.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  الحد الأدنى الافتراضي لتنبيه نواقص المخزون *
                </label>
                <input
                  type="number"
                  min="1"
                  value={lowStockAlertThreshold}
                  onChange={(e) => setLowStockAlertThreshold(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                />
                <p className="text-[10px] text-gray-400 mt-1">الكمية التي يظهر عندها وسم "منخفض ⚠️" على الخامات.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">العملة الافتراضية للحسابات *</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#079B62] focus:outline-none"
                >
                  <option value="EGP">جنيه مصري (EGP)</option>
                  <option value="USD">دولار أمريكي (USD)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#079B62] text-white rounded-xl font-bold text-sm hover:bg-[#068453] transition shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {submitting ? "جاري الحفظ..." : "حفظ الإعدادات"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
