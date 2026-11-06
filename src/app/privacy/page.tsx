import React from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopBar />
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-sm space-y-6">
          <div className="border-b pb-4">
            <h1 className="text-2xl font-black text-slate-900">
              سياسة الخصوصية وسرية البيانات
            </h1>
            <p className="text-xs text-slate-500 mt-1">آخر تحديث: 2026</p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h3 className="font-bold text-slate-900 text-base">1. جمع المعلومات واستخدامها</h3>
            <p>
              نقوم بجمع البيانات اللازمة لإنشاء الحسابات وتوثيق المصانع، بما يشمل الاسم، البريد الإلكتروني، رقم الهاتف، والمستندات الصناعية. تُستخدم هذه البيانات حصرياً لتمكين خدمات المنصة والتحقق من الهوية وإرسال الإشعارات.
            </p>

            <h3 className="font-bold text-slate-900 text-base">2. حماية المستندات الرسمية</h3>
            <p>
              تُعامل صور السجلات التجارية والبطاقات الضريبية بسرية تامة وتُخزن في بيئة مشفرة ولا تُشارك علناً مع المشترين، بل تُستخدم فقط للتدقيق الداخلي ومنح شارة المصنع المعتمد.
            </p>

            <h3 className="font-bold text-slate-900 text-base">3. سرية التصاميم وملفات الـ Tech Pack</h3>
            <p>
              التصاميم والملفات الفنية المرفوعة في طلبات الـ RFQ هي ملكية فكرية خاصة بالمشتري، ولا يحق للمصانع استغلالها أو تصنيعها لأي جهة أخرى دون إذن رسمي مسبق.
            </p>

            <h3 className="font-bold text-slate-900 text-base">4. أمن البيانات والتشفير</h3>
            <p>
              نطبق معايير أمنية متقدمة لحماية قواعد البيانات وكلمات المرور المشفرة (Bcrypt) والجلسات الآمنة لحماية مستخدمينا من أي وصول غير مصرح به.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
