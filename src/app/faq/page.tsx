import React from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HelpCircle, ChevronDown } from "lucide-react";
import Link from "next/link";

export default function FaqPage() {
  const faqs = [
    {
      q: "ما هو نظام طلبات عروض الأسعار (RFQ) وكيف يعمل؟",
      a: "نظام RFQ (Request For Quotation) يتيح لك كمشترٍ أو صاحب براند نشر مواصفات طلبك الخاصة (نوع المنتج، خامة القماش، الجراماج، جدول المقاسات، والكمية المطلوبة). تقوم المنصة تلقائياً بمطابقة طلبك مع المصانع المؤهلة التي ترسل عروض أسعارها، ويمكنك مقارنتها جنباً إلى جنب في جدول واحد واختيار الأنسب.",
    },
    {
      q: "لماذا تظهر أرقام الهواتف والعناوين محجوبة في البداية؟",
      a: "لحماية الصفقات وحقوق كل من المصنع والمشتري وضمان الجدية ومنع التجاوز العشوائي. بمجرد قبول المشتري لعرض سعر رسمي من أحد المصانع، يتم فتح أرقام الهواتف والتواصل المباشر والواتساب والعنوان التفصيلي فوراً لكلا الطرفين.",
    },
    {
      q: "كيف تضمن المنصة مصداقية وجودة المصانع المسجلة؟",
      a: "تخضع جميع المصانع — بدءاً من المصنع الفردي بماكينة واحدة وحتى المصانع الكبرى — لعملية تحقق ميداني من وجود مقرها وماكيناتها الفعلية للحصول على شارة 'مصنع موثق ومعتمد'، بينما تُعرض حالة المستندات القانونية (السجل التجاري والبطاقة الضريبية) كحالة مستقلة متى توفرت.",
    },
    {
      q: "هل يمكنني طلب عينة مطابقة قبل بدء الإنتاج الكامل؟",
      a: "نعم بكل تأكيد! يمكنك تحديد شرط 'طلب عينة معتمدة مسبقاً' في نموذج الـ RFQ. ويقدم المصنع تكلفة العينة ومدة تسليمها (غالباً من 2-4 أيام). ولا يبدأ تشغيل خطوط الإنتاج الفعلية إلا بعد موافقتك واعتمادك للعينة.",
    },
    {
      q: "ما هي شروط وطرق الدفع المتبعة في الصفقات؟",
      a: "يتم الاتفاق على شروط الدفع مسبقاً في عرض السعر (مثلاً 30% دفعة مقدمة و70% عند الفحص والاستلام). وتُسجل هذه الشروط والمراحل رسمياً في أمر التصنيع لمتابعة التنفيذ خطوة بخطوة.",
    },
    {
      q: "كيف أشتري منتجات جاهزة للتوريد الفوري؟",
      a: "يمكنك تصفح قسم 'المنتجات الجاهزة' حيث تعرض المصانع بضاعتها الحاضرة بالمخازن بأسعار جملة متدرجة حسب الكمية (50، 200، 500+ قطعة). يمكنك إرسال طلب توريد فوري وسيتم التنسيق معك للشحن خلال أيام قليلة.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopBar />
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
        <div className="text-center mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3.5 py-1 rounded-full text-xs font-bold">
            <HelpCircle className="w-4 h-4 text-[#542cb7]" />
            <span>مركز المساعدة والأسئلة الشائعة</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-[#0b1320]">
            كل ما تحتاج لمعرفته حول منصة سايسل مصر (Cysle Egypt)
          </h1>
          <p className="text-slate-600 text-xs md:text-sm">
            إجابات شاملة عن الأسئلة الأكثر تكراراً للمشترين والمصانع
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-2"
            >
              <h3 className="text-base font-bold text-slate-900 flex items-center justify-between">
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1 border-t border-slate-100">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center bg-purple-50 border border-purple-200 rounded-2xl p-8 space-y-3">
          <h3 className="text-base font-bold text-purple-900">
            هل لديك استفسار آخر لم تجد إجابته هنا؟
          </h3>
          <p className="text-xs text-purple-700 max-w-md mx-auto">
            فريق الدعم الفني جاهز للإجابة على جميع استفساراتك ومساعدتك في إتمام صفقاتك بنجاح.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="bg-[#542cb7] hover:bg-[#45209c] text-white text-xs font-bold px-6 py-2.5 rounded-xl inline-block shadow transition-all"
            >
              تواصل مع الدعم الفني
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
