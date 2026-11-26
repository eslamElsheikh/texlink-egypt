import React from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, Target, Heart, Award, Users, Building2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopBar />
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-[#0b1320] text-white py-16 md:py-20 border-b border-slate-800 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 relative z-10 text-center space-y-4">
            <span className="bg-purple-900/60 text-purple-300 text-xs font-bold px-4 py-1.5 rounded-full inline-block border border-purple-700/50">
              صناعة مصرية .. ريادة إقليمية
            </span>
            <h1 className="text-3xl md:text-5xl font-black">
              عن منصة سايسل مصر (Cysle Egypt)
            </h1>
            <p className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              المنصة الرقمية المتخصصة في تحديث ورقمنة سلاسل إمداد قطاع التريكو والغزل والنسيج في مصر، وربط المصانع الوطنية بأكبر شبكة من المشترين وأصحاب العلامات التجارية.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-[#542cb7]">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">رؤيتنا</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                أن نكون البوابة الرقمية الأولى لصناعة النسيج والملابس في الشرق الأوسط وأفريقيا، ورفع كفاءة استغلال الطاقات الإنتاجية لمصانع التريكو المصرية.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-[#059669]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">رسالتنا</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                توفير بيئة تجارية موثوقة وآمنة تمكّن المصنعين من الوصول المباشر للطلبيات، وتضمن للمشترين جودة الخامات والتزام المواعيد وأفضل الأسعار دون وسطاء.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">قيمنا</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                الشفافية في الأسعار، توثيق الكيانات الصناعية الرسمية، الالتزام بمواصفات العينات، ودعم شعار "صنع في مصر" بأعلى معايير الجودة العالمية.
              </p>
            </div>
          </div>
        </section>

        {/* Textile Hubs in Egypt */}
        <section className="bg-slate-50 py-16 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                قلاع صناعة التريكو المغطاة عبر المنصة
              </h2>
              <p className="text-slate-600 text-xs md:text-sm">
                نغطي أهم المراكز الصناعية النسيجية في مصر بأعلى معايير التدقيق
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xl font-black text-[#542cb7] block">سلامون القماش — الدقهلية</span>
                <span className="text-xs text-slate-500 mt-1 block">سوق التريكو المسطح والأقطان في مركز المنصورة</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xl font-black text-[#542cb7] block">طنامل — مركز أجا</span>
                <span className="text-xs text-slate-500 mt-1 block">قلعة تصنيع البلوفر والتريكو والملابس الشتوية</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xl font-black text-[#542cb7] block">المحلة وشبرا الخيمة</span>
                <span className="text-xs text-slate-500 mt-1 block">مراكز الغزل والتفصيل والطباعة وتجهيز الأقمشة</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xl font-black text-[#542cb7] block">العاشر وبقية المحافظات</span>
                <span className="text-xs text-slate-500 mt-1 block">مصانع الميلتون والملابس الجاهزة وخطوط التصدير</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
