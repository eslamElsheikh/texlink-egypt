import React from "react";
import Link from "next/link";
import { Logo } from "../brand/Logo";
import { MapPin, Phone, Mail, ShieldCheck, Heart } from "lucide-react";
import { BRAND } from "@/config/brand";
export function Footer() {
  return (
    <footer className="bg-[#0b1320] text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Col 1: About & Logo */}
          <div className="lg:col-span-2 space-y-4">
            <Logo variant="light" size="lg" />
            <p className="text-sm leading-relaxed text-slate-400 max-w-md pt-2">
              المنصة الرقمية الأولى المتخصصة في ربط مصانع التريكو والغزل والنسيج
              في جمهورية مصر العربية بتجار الجملة وأصحاب العلامات التجارية محلياً
              وإقليمياً، لدعم وتطوير سلاسل الإمداد للقطاع الصناعي المصري.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-3 py-2 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>معتمدة للمصانع والمنشآت الصناعية المصرية المسجلة</span>
            </div>
          </div>

          {/* Col 2: Services */}
          <div>
            <h4 className="text-white font-bold text-base mb-4">خدمات المنصة</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/factories"
                  className="hover:text-purple-400 transition-colors"
                >
                  دليل المصانع المعتمدة
                </Link>
              </li>
              <li>
                <Link
                  href="/rfqs"
                  className="hover:text-purple-400 transition-colors"
                >
                  طلبات الشراء والتصنيع (RFQ)
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="hover:text-purple-400 transition-colors"
                >
                  كتالوج المنتجات الجاهزة
                </Link>
              </li>
              <li>
                <Link
                  href="/rfqs/new"
                  className="hover:text-purple-400 transition-colors"
                >
                  انشر طلب تصنيع جديد
                </Link>
              </li>
              <li>
                <Link
                  href="/factories/register"
                  className="hover:text-purple-400 transition-colors text-emerald-400 font-medium"
                >
                  سجل مصنعك الآن
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Industrial Hubs */}
          <div>
            <h4 className="text-white font-bold text-base mb-4">
              المناطق الصناعية
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/factories?governorate=dakahlia&area=mansoura-salamon"
                  className="flex items-center gap-1.5 text-purple-300 hover:text-white transition-colors font-medium"
                >
                  <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>مصانع المنصورة – سلامون</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/factories?governorate=dakahlia&area=mansoura-tanamil"
                  className="flex items-center gap-1.5 text-purple-300 hover:text-white transition-colors font-medium"
                >
                  <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>مصانع المنصورة – طنامل</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/factories?governorate=gharbia"
                  className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>المحلة الكبرى (الغربية)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/factories?governorate=qalyubia"
                  className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>شبرا الخيمة (القليوبية)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/factories?governorate=sharqia"
                  className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>العاشر من رمضان (الشرقية)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Help */}
          <div>
            <h4 className="text-white font-bold text-base mb-4">الدعم والتواصل</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="tel:01012345678"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                  dir="ltr"
                >
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>010 1234 5678</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@texlink-egypt.com"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                  dir="ltr"
                >
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>support@texlink-egypt.com</span>
                </a>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-purple-400 transition-colors"
                >
                  مركز المساعدة وتواصل معنا
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-purple-400 transition-colors"
                >
                  الأسئلة الشائعة
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <span>{BRAND.copyright}</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/terms"
              className="hover:text-slate-300 transition-colors"
            >
              شروط الاستخدام
            </Link>
            <Link
              href="/privacy"
              className="hover:text-slate-300 transition-colors"
            >
              سياسة الخصوصية
            </Link>
            <Link
              href="/about"
              className="hover:text-slate-300 transition-colors"
            >
              عن المنصة
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
