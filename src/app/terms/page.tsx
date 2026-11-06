import React from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopBar />
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-sm space-y-6">
          <div className="border-b pb-4">
            <h1 className="text-2xl font-black text-slate-900">
              الشروط والأحكام العامة لاستخدام منصة تكس لينك مصر
            </h1>
            <p className="text-xs text-slate-500 mt-1">آخر تحديث: 2026</p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h3 className="font-bold text-slate-900 text-base">1. مقدمة وقبول الشروط</h3>
            <p>
              أهلاً بكم في منصة TexLink Egypt. تحكم هذه الشروط والأحكام استخدامك للمنصة وخدمات الوساطة الرقمية بين المصانع والمشترين. باستخدامك للمنصة أو التسجيل فيها، فإنك توافق التزامك الكامل بهذه الشروط.
            </p>

            <h3 className="font-bold text-slate-900 text-base">2. تسجيل وتوثيق المصانع</h3>
            <p>
              يلتزم كل مصنع بتقديم مستندات رسمية صحيحة وسارية (السجل التجاري والبطاقة الضريبية). يحق لإدارة المنصة رفض أو تعليق أي حساب مصنع يثبت عدم صحة مستنداته أو عدم وجود منشأة إنتاجية فعلية.
            </p>

            <h3 className="font-bold text-slate-900 text-base">3. عروض الأسعار والطلبات (RFQ)</h3>
            <p>
              تعتبر عروض الأسعار المقدمة من المصانع التزاماً تجارياً بمواصفات السعر والكمية والمدة وشروط الدفع المذكورة في العرض عند قبوله من المشتري، ولا يجوز تعديل الأسعار بعد الاعتماد إلا بموافقة الطرفين المكتوبة.
            </p>

            <h3 className="font-bold text-slate-900 text-base">4. سياسة حماية المعاملات ومنع التجاوز (Anti-Bypass)</h3>
            <p>
              لحماية حقوق المعاملات وتوفير بيئة تجارية آمنة، تُحجب أرقام الهواتف والروابط الخارجية والعناوين التفصيلية في الرسائل والملفات التعريفية العامة قبل اعتماد عرض السعر. يُحظر محاولة تبادل معلومات الاتصال الخارجية قبل قبول العرض رسمياً عبر المنصة.
            </p>

            <h3 className="font-bold text-slate-900 text-base">5. عينات ما قبل الإنتاج والفحص</h3>
            <p>
              في حال اشتراط المشتري لعينة ما قبل الإنتاج، يلتزم المصنع بتجهيزها وإرسالها للمشتري للاعتماد قبل البدء في خطوط الإنتاج. يعتبر اعتماد المشتري للعينة ملزماً لكلا الطرفين كمقياس لجودة البضاعة المسلمة.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
