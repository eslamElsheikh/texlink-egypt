"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Settings, Save, CheckCircle2, Users, Bell, DollarSign } from "lucide-react";

export default function CrmSettingsPage() {
  const [leadThreshold, setLeadThreshold] = useState("100000");
  const [autoConvertMarketplace, setAutoConvertMarketplace] = useState(true);
  const [reminderDays, setReminderDays] = useState("3");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [user, setUser] = useState({
    id: "crm-user",
    name: "إدارة المبيعات",
    email: "",
    role: "FACTORY" as const,
    isFactory: true,
    isBuyer: false,
    factorySlug: "",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("تم حفظ إعدادات إدارة علاقات العملاء (CRM) بنجاح ✓");
  };

  return (
    <DashboardLayout user={user} currentRole="FACTORY">
      <div className="space-y-6 pb-12 font-sans max-w-3xl" dir="rtl">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-purple-50 text-[#5932A8] rounded-xl">
              <Settings className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">إعدادات إدارة المبيعات والعملاء (CRM Settings)</h1>
              <p className="text-gray-500 text-xs md:text-sm mt-1">
                تخصيص قواعد تتبع الفرص، التنبيهات التلقائية، وربط عملاء سوق سايسل مصر بـ CRM.
              </p>
            </div>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div>
                <p className="text-sm font-bold text-gray-900">الربط التلقائي لمشتري السوق بـ CRM</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  إنشاء وتحديث ملفات العملاء تلقائياً عند اعتماد عروض الأسعار أو استلام طلبات الشراء.
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoConvertMarketplace}
                onChange={(e) => setAutoConvertMarketplace(e.target.checked)}
                className="w-5 h-5 text-[#5932A8] rounded focus:ring-[#5932A8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                الحد الأدنى لقيمة الفرصة الكبيرة (ج.م)
              </label>
              <input
                type="number"
                value={leadThreshold}
                onChange={(e) => setLeadThreshold(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
              />
              <p className="text-[10px] text-gray-400 mt-1">يُصنف العميل كـ "عميل استراتيجي" إذا تجاوز هذا المبلغ.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                التنبيه الدوري لمتابعة عروض الأسعار (أيام)
              </label>
              <input
                type="number"
                min="1"
                value={reminderDays}
                onChange={(e) => setReminderDays(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#5932A8] focus:outline-none"
              />
              <p className="text-[10px] text-gray-400 mt-1">توليد تذكير متابعة تلقائي في حالة عدم رد العميل بعد هذا العدد من الأيام.</p>
            </div>
          </div>

          <div className="flex items-center justify-end pt-3 border-t border-gray-100">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-[#5932A8] text-white rounded-xl font-bold text-sm hover:bg-[#49278f] transition shadow-sm"
            >
              <Save className="w-4 h-4" />
              حفظ إعدادات CRM
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
