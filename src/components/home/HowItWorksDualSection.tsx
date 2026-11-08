"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Building2,
  FileText,
  Truck,
  CheckCircle2,
  ArrowLeft,
  Factory,
  Cpu,
  Boxes,
  Users,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";

export function HowItWorksDualSection() {
  const [activeAudience, setActiveAudience] = useState<"BUYERS" | "FACTORIES">("FACTORIES");

  const buyerSteps = [
    {
      stepNumber: "01",
      icon: Search,
      title: "اكتشف المصانع والمنتجات",
      desc: "استكشف مئات المصانع المتخصصة في التريكو الدائري والملابس الجاهزة في المحلة الكبرى وشبرا الخيمة والعاشر من رمضان.",
    },
    {
      stepNumber: "02",
      icon: Building2,
      title: "تصفح الكتالوج والتجهيزات",
      desc: "اطلع على أنواع الماكينات، تجهيزات خطوط الإنتاج، عينات الأقمشة، وسجل التقييمات الموثقة من مشترين سابقين.",
    },
    {
      stepNumber: "03",
      icon: FileText,
      title: "أرسل طلب تصنيع أو مقايسة (RFQ)",
      desc: "حدد مواصفات القماش، أوزان الجراماج، الألوان، المقاسات، والكميات المطلوبة للحصول على عروض أسعار منافسة.",
    },
    {
      stepNumber: "04",
      icon: Truck,
      title: "قارن العروض وتابع التنفيذ",
      desc: "تواصل مباشرة مع إدارة المصنع بدون وسطاء، اعتمد عينات ما قبل الإنتاج، وتابع مراحل التصنيع خطوة بخطوة حتى الاستلام.",
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-[#F8FAFC] border-y border-slate-200/80 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[#542cb7] border border-purple-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#542cb7]" />
            <span>كيف تعمل منصة سايسل مصر (Cysle Egypt)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            حلول مصممة خصيصاً للمشترين والمصانع
          </h2>
          <p className="text-sm md:text-base text-slate-600">
            سواء كنت براند تبحث عن تصنيع عالي الجودة، أو مصنعاً يبحث عن برنامج إدارة تشغيل صناعي مستقل أو زيادة مبيعاتك.
          </p>

          {/* Audience Switcher Tabs */}
          <div className="inline-flex items-center p-1.5 bg-slate-200/70 rounded-2xl gap-1 mt-4">
            <button
              type="button"
              onClick={() => setActiveAudience("FACTORIES")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
                activeAudience === "FACTORIES"
                  ? "bg-[#079B62] text-white shadow-md scale-[1.02]"
                  : "text-slate-700 hover:text-slate-900"
              }`}
            >
              <Factory className="w-4 h-4" />
              <span>لأصحاب المصانع ومديري التشغيل</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveAudience("BUYERS")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
                activeAudience === "BUYERS"
                  ? "bg-[#542cb7] text-white shadow-md scale-[1.02]"
                  : "text-slate-700 hover:text-slate-900"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>للمشترين وأصحاب البراندات</span>
            </button>
          </div>
        </div>

        {/* SECTION A: FOR BUYERS */}
        {activeAudience === "BUYERS" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center max-w-2xl mx-auto space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                ابحث عن مصنع التريكو والملابس المناسب. اشترِ وتورّد بثقة وأمان.
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                أربع خطوات بسيطة للوصول المباشر إلى مصانع الغزل والنسيج المصرية المعتمدة وتأمين صفقات التوريد.
              </p>
            </div>

            {/* 4 Steps Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {buyerSteps.map((st, idx) => {
                const Icon = st.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group relative overflow-hidden"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#542cb7] flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-black font-mono text-slate-200">
                          {st.stepNumber}
                        </span>
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                        {st.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {st.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center gap-1 text-[11px] font-bold text-[#542cb7]">
                      <span>الخطوة {st.stepNumber}</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/factories"
                className="px-6 py-3 bg-[#542cb7] hover:bg-[#432096] text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-sm flex items-center gap-2"
              >
                <span>استكشف المصانع المعتمدة</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <Link
                href="/rfqs/new"
                className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2"
              >
                <span>طلب تصنيع وتوريد خاص (RFQ)</span>
              </Link>
            </div>
          </div>
        )}

        {/* SECTION B: FOR FACTORIES (DUAL USAGE MODES) */}
        {activeAudience === "FACTORIES" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center max-w-2xl mx-auto space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                أدِر مصنعك باحترافية صناعية. ونمِّ مبيعاتك مع سايسل مصر.
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                نوفر لك حرية الاختيار بين استخدام المنصة كنظام ERP داخلي متكامل أو الربط مع سوق B2B لزيادة الصفقات.
              </p>
            </div>

            {/* The 2 Usage Options Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              {/* Option 1: Factory Management Only */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/50 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-6 relative overflow-hidden">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-[#079B62] border border-emerald-200">
                      الخيار الأول: نظام إدارة وتشغيل المصنع فقط
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">Factory OS</span>
                  </div>

                  <div>
                    <h4 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                      برنامج إدارة وتشغيل صناعي داخلي (Manufacturing ERP)
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                      مصمم للمصانع والورش المصرية التي تبحث عن نظام رقمي متقدم لضبط العمليات اليومية في صالة التشغيل والمخازن.
                    </p>
                  </div>

                  {/* Highlights Box */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-950 font-semibold space-y-1">
                    <p className="font-extrabold flex items-center gap-1.5 text-emerald-900">
                      <ShieldCheck className="w-4 h-4 text-[#079B62]" />
                      استقلالية تشغيلية تامة:
                    </p>
                    <p className="text-[11px] text-emerald-900/90 leading-relaxed">
                      "يمكنك استخدام سايسل مصر لإدارة مصنعك بالكامل دون الحاجة لعرض منتجاتك، أو الانضمام للسوق التجاري، أو استقبال طلبات شراء عامة."
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-slate-700 block">ما يتضمنه هذا الوضع:</span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#079B62] shrink-0" />
                        <span>تسجيل الإنتاج اليومي السريع بصالة المصنع</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#079B62] shrink-0" />
                        <span>أوامر الإنتاج وتشغيل الدفعات (Batches)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#079B62] shrink-0" />
                        <span>إدارة الماكينات ومتابعة التوقف والصيانة</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#079B62] shrink-0" />
                        <span>تتبع الهالك والفاقد وفصل الـ Rework</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#079B62] shrink-0" />
                        <span>دفتر حركات المخزون غير القابل للتعديل</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#079B62] shrink-0" />
                        <span>حساب التكلفة الصناعية للقطعة السليمة</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Link
                    href="/factories/register?mode=MANAGEMENT_ONLY"
                    className="w-full py-3.5 px-6 bg-[#079B62] hover:bg-[#068453] text-white rounded-2xl text-xs sm:text-sm font-black transition shadow-md flex items-center justify-center gap-2"
                  >
                    <span>ابدأ إدارة مصنعك الداخلي الآن</span>
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                  <p className="text-[10px] text-center text-slate-400 mt-2">
                    لا يتطلب أي نشر علني في السوق • تفعيل فوري لمساحة تشغيل المصنع
                  </p>
                </div>
              </div>

              {/* Option 2: Factory Management + Marketplace */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-purple-500/50 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-6 relative overflow-hidden">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3.5 py-1 rounded-full text-xs font-black bg-purple-50 text-[#542cb7] border border-purple-200">
                      الخيار الثاني: إدارة المصنع + السوق التجاري B2B
                    </span>
                    <span className="text-xs font-mono font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                      الأكثر طلباً
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                      إدارة تشغيل متكاملة + نافذة مبيعات وطلبيات بالجملة
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                      للمصانع الراغبة في الجمع بين كفاءة تشغيل الصالة الداخلية وفتح قنوات بيع جديدة لبراندات وتجار مصر والدول المجاورة.
                    </p>
                  </div>

                  {/* Highlights Box */}
                  <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/80 text-xs text-purple-950 font-semibold space-y-1">
                    <p className="font-extrabold flex items-center gap-1.5 text-purple-900">
                      <TrendingUp className="w-4 h-4 text-[#542cb7]" />
                      كل مزايا إدارة المصنع + قنوات بيع حقيقية:
                    </p>
                    <p className="text-[11px] text-purple-900/90 leading-relaxed">
                      يشمل كافة أدوات Factory OS التشغيلية بالكامل، مع فتح ملف مصنعك في سوق سايسل مصر واستقبال طلبات عروض الأسعار (RFQs).
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-slate-700 block">إضافات السوق التجاري:</span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#542cb7] shrink-0" />
                        <span>ملف مصنع عام وموثق معتمد في دليل مصر</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#542cb7] shrink-0" />
                        <span>عرض كتالوج المنتجات الجاهزة والأسعار</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#542cb7] shrink-0" />
                        <span>استقبال طلبات الشراء والمقايسات (RFQs)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#542cb7] shrink-0" />
                        <span>إدارة مبيعات العملاء (CRM Workspace)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#542cb7] shrink-0" />
                        <span>تحويل صفقات السوق لأوامر إنتاج بضغطة زر</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#542cb7] shrink-0" />
                        <span>تواصل ومحادثات مباشرة مع مديري المشتريات</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Link
                    href="/factories/register?mode=FULL_ACCESS"
                    className="w-full py-3.5 px-6 bg-[#542cb7] hover:bg-[#432096] text-white rounded-2xl text-xs sm:text-sm font-black transition shadow-md flex items-center justify-center gap-2"
                  >
                    <span>انضم لسوق سايسل مصر والمصنع</span>
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                  <p className="text-[10px] text-center text-slate-400 mt-2">
                    تفعيل مساحات المصنع والـ CRM والسوق التجاري معاً
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
