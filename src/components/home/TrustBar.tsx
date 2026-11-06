import React from "react";
import Link from "next/link";
import { ShieldCheck, Handshake, Truck, Star, ArrowLeft } from "lucide-react";

export function TrustBar() {
  return (
    <section className="pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-[#f1f5f9] border border-slate-200/90 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          {/* 4 Trust Points */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 flex-1 text-xs md:text-sm font-bold text-slate-800">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#542cb7] shrink-0" />
              <span>معاملات آمنة وموثوقة</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Handshake className="w-5 h-5 text-[#542cb7] shrink-0" />
              <span>دعم فني ومساعدة مستمرة</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Truck className="w-5 h-5 text-[#542cb7] shrink-0" />
              <span>ربط مباشر بين المصانع والمشترين</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Star className="w-5 h-5 text-[#542cb7] shrink-0" />
              <span>تقييمات حقيقية للمصانع</span>
            </div>
          </div>

          {/* Action Button */}
          <Link
            href="/about"
            className="bg-[#542cb7] hover:bg-[#45209c] text-white text-xs font-bold px-5 py-2.5 rounded-xl inline-flex items-center gap-1.5 transition-all shadow-sm shrink-0"
          >
            <span>اكتشف المزيد</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
