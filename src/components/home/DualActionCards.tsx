import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Building2, ShoppingCart, CheckCircle2, ArrowLeft } from "lucide-react";

export function DualActionCards() {
  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: For Buyers (للمشترين) */}
          <div className="bg-[#f5f3ff] border border-[#ddd6fe] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {/* Visual Image */}
            <div className="w-full sm:w-44 h-44 rounded-2xl overflow-hidden shrink-0 shadow-sm bg-white relative">
              <Image
                src="/images/buyer-promo.jpg"
                alt="ملابس وتيشيرتات تريكو وبولو معتمدة في مصر"
                fill
                sizes="(max-width: 640px) 100vw, 176px"
                className="object-cover"
                priority
              />
            </div>
            {/* Content */}
            <div className="flex-1 space-y-4 text-right">
              <div>
                <span className="bg-[#4f28a6] text-white text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>للمشترين</span>
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2.5 leading-snug">
                  ابحث عن أفضل المصانع أو اطلب منتجك حسب الطلب
                </h2>
              </div>

              <ul className="space-y-2 text-xs sm:text-sm text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#4f28a6] shrink-0 fill-purple-100" />
                  <span>تصفح كتالوج المنتجات الجاهزة</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#4f28a6] shrink-0 fill-purple-100" />
                  <span>انشر طلبك (RFQ) بمواصفاتك</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#4f28a6] shrink-0 fill-purple-100" />
                  <span>قارن العروض واختر الأنسب</span>
                </li>
              </ul>

              <div className="pt-1">
                <Link
                  href="/rfqs/new"
                  className="bg-[#4f28a6] hover:bg-[#3e1f85] text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-full inline-flex items-center gap-2 shadow transition-all hover:gap-3"
                >
                  <span>إبدأ طلب جديد</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: For Factories (للمصانع) */}
          <div className="bg-[#eefaf3] border border-[#bbf7d0] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {/* Visual Image */}
            <div className="w-full sm:w-44 h-44 rounded-2xl overflow-hidden shrink-0 shadow-sm bg-white relative">
              <Image
                src="/images/factory-promo.jpg"
                alt="مصنع نسيج وتريكو وماكينات تصنيع حديثة في مصر"
                fill
                sizes="(max-width: 640px) 100vw, 176px"
                className="object-cover"
                priority
              />
            </div>
            {/* Content */}
            <div className="flex-1 space-y-4 text-right">
              <div>
                <span className="bg-[#008a4b] text-white text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>للمصانع</span>
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2.5 leading-snug">
                  اعرض منتجاتك ووصل لمشترين جدد
                </h2>
              </div>

              <ul className="space-y-2 text-xs sm:text-sm text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#008a4b] shrink-0 fill-emerald-100" />
                  <span>أضف كتالوج منتجاتك الجاهزة</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#008a4b] shrink-0 fill-emerald-100" />
                  <span>استقبل طلبات (RFQ) بمواصفات العملاء</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#008a4b] shrink-0 fill-emerald-100" />
                  <span>تابع العروض والطلبات من لوحة التحكم</span>
                </li>
              </ul>

              <div className="pt-1">
                <Link
                  href="/factories/register"
                  className="bg-[#008a4b] hover:bg-[#00703c] text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-full inline-flex items-center gap-2 shadow transition-all hover:gap-3"
                >
                  <span>سجل مصنعك الآن</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
