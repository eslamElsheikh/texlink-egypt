import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function Hero() {
  return (
    <section className="relative bg-[#0b1320] text-white overflow-hidden py-16 md:py-24 border-b border-slate-800">
      {/* Background Graphic & Texture */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&auto=format&fit=crop&q=80"
          alt="صناعة التريكو في مصر"
          className="w-full h-full object-cover object-left opacity-35 md:opacity-40"
        />
        {/* Dark Navy to Transparent Gradient Overlay (RTL from right to left) */}
        <div className="absolute inset-0 bg-gradient-to-l from-[#0b1320] via-[#0b1320]/85 to-transparent"></div>
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#0b1320]/70"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Main Slogan & Headline (RTL Right side) */}
          <div className="lg:col-span-8 space-y-6 text-right">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight md:leading-tight">
              منصة ربط مصانع التريكو في مصر
              <span className="block mt-2">
                بالمشترين{" "}
                <span className="text-[#a855f7] font-black drop-shadow-sm">
                  بسهولة وموثوقية
                </span>
              </span>
            </h1>

            <p className="text-slate-300 text-base md:text-xl font-medium tracking-wide">
              اعرض منتجاتك • اطلب عرض سعر • قارن واختر الأفضل
            </p>

            <div className="pt-2 flex items-center gap-4">
              <Link
                href="/rfqs/new"
                className="bg-[#6b38c9] hover:bg-[#542cb7] text-white font-bold text-base md:text-lg px-8 py-3.5 rounded-full inline-flex items-center gap-2.5 shadow-lg shadow-purple-900/40 hover:shadow-purple-900/60 hover:-translate-y-0.5 transition-all"
              >
                <span>ابدأ الآن</span>
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Side Stamp on Yarn Spools (Left side in visual) */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="text-right select-none pr-4 md:pr-0">
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white/90 drop-shadow-lg font-serif italic tracking-wide block transform -rotate-3">
                صناعة مصرية .. بجودة أعلى
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
