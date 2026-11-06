"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Settings, ShieldCheck, Bell, Sliders, CheckCircle2, Percent, Globe } from "lucide-react";

export default function AdminSettingsPage() {
  const [commissionRate, setCommissionRate] = useState("2.5");
  const [autoMatchThreshold, setAutoMatchThreshold] = useState("50");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const user = {
    id: "admin",
    name: "إدارة منصة تكس لينك",
    email: "admin@texlink-egypt.com",
    role: "ADMIN" as const,
    isFactory: false,
    isBuyer: true,
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardLayout user={user} currentRole="ADMIN">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#17233F]">
            إعدادات المنصة وتفضيلات النظام
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] mt-1">
            فصل إعدادات الحساب الشخصي عن إعدادات تشغيل وسياسات منصة تكس لينك مصر.
          </p>
        </div>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>تم حفظ الإعدادات بنجاح.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Platform Settings */}
        <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6 shadow-sm space-y-4">
          <div className="border-b border-[#F1F4F9] pb-3">
            <h3 className="text-sm font-bold text-[#17233F] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#5932A8]" />
              <span>إعدادات وسياسات المنصة العامة (Platform Settings)</span>
            </h3>
            <p className="text-xs text-[#718096] mt-0.5">
              تؤثر على خوارزميات المطابقة ونسب المعاملات.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                نسبة عمولة المنصة المعتمدة (%)
              </label>
              <input
                type="text"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl px-4 py-2 text-xs font-bold text-[#5932A8]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                تطبق على الصفقات المكتملة بعد اعتماد استلام الشحنة.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                الحد الأدنى لدرجة مطابقة المصانع بالطلب (%)
              </label>
              <input
                type="number"
                min={20}
                max={90}
                value={autoMatchThreshold}
                onChange={(e) => setAutoMatchThreshold(e.target.value)}
                className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl px-4 py-2 text-xs font-bold text-[#17233F]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                المصانع التي تحقق هذه النسبة يتم إشعارها فوراً بطلب التصنيع.
              </span>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded text-[#5932A8] w-4 h-4"
                />
                <span>إلزامية مراجعة السجل التجاري قبل منح شارة التوثيق</span>
              </label>
            </div>
          </div>
        </div>

        {/* Card 2: Notification & Personal Preferences */}
        <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6 shadow-sm space-y-4">
          <div className="border-b border-[#F1F4F9] pb-3">
            <h3 className="text-sm font-bold text-[#17233F] flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#5932A8]" />
              <span>تفضيلات الإشعارات والتنبيهات (Admin Preferences)</span>
            </h3>
            <p className="text-xs text-[#718096] mt-0.5">
              تحديد قنوات التنبيه فور تسجيل مصانع جديدة أو تقديم بلاغات.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <label className="flex items-start gap-2.5 cursor-pointer p-3 rounded-xl bg-slate-50 border border-slate-100">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded text-[#5932A8] w-4 h-4 mt-0.5"
              />
              <div>
                <span className="font-bold text-slate-800 block">إشعارات البريد الإلكتروني</span>
                <span className="text-[11px] text-slate-500">إرسال تقرير فوري عند رفع مصنع جديد لمستنداته الرسمية.</span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer p-3 rounded-xl bg-slate-50 border border-slate-100">
              <input
                type="checkbox"
                checked={whatsappAlerts}
                onChange={(e) => setWhatsappAlerts(e.target.checked)}
                className="rounded text-[#5932A8] w-4 h-4 mt-0.5"
              />
              <div>
                <span className="font-bold text-slate-800 block">تنبيهات الواتساب الفورية</span>
                <span className="text-[11px] text-slate-500">تنبيه فريق الإدارة عبر WhatsApp adapter عند حدوث خلافات في الطلبات.</span>
              </div>
            </label>

            <div className="pt-4 border-t flex justify-end">
              <button
                type="submit"
                className="bg-[#5932A8] hover:bg-[#482888] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm transition-all"
              >
                حفظ كافة الإعدادات
              </button>
            </div>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
