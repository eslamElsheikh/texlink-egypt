"use client";

import React, { useEffect, useState, use } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Building2,
  MapPin,
  Star,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Phone,
  MessageSquare,
  Package,
  Calendar,
  Layers,
  Wrench,
  Sparkles,
  ArrowRight,
  Send,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { INDUSTRIAL_AREAS_BY_SLUG } from "@/config/locations";
interface ProductTier {
  minQuantity: number;
  maxQuantity: number | null;
  pricePerPiece: number;
}

interface Product {
  id: string;
  nameAr: string;
  descriptionAr: string;
  fabric: string;
  gsm: number | null;
  basePrice: number;
  moq: number;
  images: string[];
  priceTiers: ProductTier[];
}

interface Review {
  id: string;
  rating: number;
  commentAr: string;
  createdAt: string;
  author: {
    name: string;
    buyerProfile?: { companyName: string } | null;
  };
}

interface FactoryDetail {
  id: string;
  slug: string;
  nameAr: string;
  governorate: string;
  industrialArea?: string | null;
  city: string;
  address: string;
  bioAr: string;
  logoUrl?: string;
  coverUrl?: string;
  verificationStatus: string;
  commercialRegStatus?: string;
  taxRegStatus?: string;
  verifiedAt?: string;
  workerCount?: number;
  machineCount?: number;
  sizeSegment?: {
    key: string;
    labelAr: string;
  };
  minOrderQuantity: number;
  monthlyCapacity: number | null;
  establishedYear: number | null;
  rating: number;
  reviewCount: number;
  specialties: string[];
  machines: string[];
  fabrics: string[];
  gallery: string[];
  products: Product[];
  reviews: Review[];
  canViewContact: boolean;
  phone: string | null;
  whatsapp: string | null;
}

export default function FactoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [factory, setFactory] = useState<FactoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFactory();
  }, [slug]);

  const fetchFactory = async () => {
    try {
      const res = await fetch(`/api/factories/${slug}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "المصنع غير موجود");
      setFactory(json.factory);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "فشل جلب المصنع";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <TopBar />
        <Header />
        <div className="flex-1 py-32 text-center text-slate-400">
          <div className="w-10 h-10 border-4 border-[#542cb7] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">جاري تحميل الملف التعريفي للمصنع...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !factory) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <TopBar />
        <Header />
        <div className="flex-1 max-w-lg mx-auto py-24 text-center px-4">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">عذراً، المصنع غير موجود</h2>
          <p className="text-slate-500 text-sm mb-6">{error || "لم نتمكن من العثور على الصفحة المطلوبة."}</p>
          <Link
            href="/factories"
            className="bg-[#542cb7] text-white px-6 py-2.5 rounded-xl text-sm font-semibold"
          >
            العودة إلى دليل المصانع
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopBar />
      <Header />

      <main className="flex-1 pb-16">
        {/* Cover Banner */}
        <div className="relative h-60 md:h-80 bg-slate-800">
          <img
            src={factory.coverUrl || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200"}
            alt={factory.nameAr}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent"></div>

          {/* Quick back link */}
          <div className="absolute top-4 right-4 max-w-7xl mx-auto">
            <Link
              href="/factories"
              className="bg-white/80 hover:bg-white text-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur flex items-center gap-1.5 transition-all"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>دليل المصانع</span>
            </Link>
          </div>
        </div>

        {/* Profile Card Header Container */}
        <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-10">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border-4 border-white bg-slate-100 shadow-md overflow-hidden shrink-0">
                <img
                  src={factory.logoUrl || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200"}
                  alt={factory.nameAr}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                    {factory.nameAr}
                  </h1>

                  {factory.verificationStatus === "VERIFIED" && (
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      مصنع موثق ميدانياً
                    </span>
                  )}

                  {factory.commercialRegStatus === "VERIFIED" && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      سجل تجاري موثق
                    </span>
                  )}

                  {factory.sizeSegment && (
                    <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {factory.sizeSegment.labelAr}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#542cb7]" />
                    <span>
                      الموقع: {factory.governorate}
                      {factory.industrialArea ? ` — ${INDUSTRIAL_AREAS_BY_SLUG[factory.industrialArea]?.nameAr || factory.industrialArea}` : ""}
                    </span>
                  </span>
                  {factory.establishedYear != null && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      تأسس عام {factory.establishedYear}
                    </span>
                  )}
                  <span>•</span>
                  <span className="flex items-center gap-1 font-bold text-slate-800">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    {factory.rating.toFixed(1)} ({factory.reviewCount} تقييم حقيقي)
                  </span>
                </div>
              </div>
            </div>

            {/* Direct RFQ Action */}
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Link
                href={`/rfqs/new?factoryId=${factory.id}&factoryName=${encodeURIComponent(factory.nameAr)}`}
                className="w-full sm:w-auto bg-[#542cb7] hover:bg-[#45209c] text-white font-bold px-6 py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Send className="w-4 h-4" />
                <span>اطلب عرض سعر خاص (RFQ)</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Content Tabs & Main Grid */}
        <div className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main 2 Cols */}
          <div className="lg:col-span-2 space-y-8">
            {/* About & Bio */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 border-b pb-3 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#542cb7]" />
                <span>نبذة عن المصنع وتاريخه</span>
              </h2>
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                {factory.bioAr}
              </p>
            </div>

            {/* Capabilities & Machinery */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b pb-3 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#542cb7]" />
                <span>القدرات الصناعية والتجهيزات</span>
              </h2>

              {/* Specialties */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 mb-2">التخصصات والمنتجات المصنعة:</h4>
                <div className="flex flex-wrap gap-2">
                  {factory.specialties.map((spec, i) => (
                    <span
                      key={i}
                      className="bg-purple-50 text-purple-800 border border-purple-200/60 text-xs font-semibold px-3 py-1 rounded-lg"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Fabrics */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 mb-2">الأقمشة والخامات المعتمدة:</h4>
                <div className="flex flex-wrap gap-2">
                  {factory.fabrics.map((fab, i) => (
                    <span
                      key={i}
                      className="bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-xs font-semibold px-3 py-1 rounded-lg"
                    >
                      {fab}
                    </span>
                  ))}
                </div>
              </div>

              {/* Machinery */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 mb-2">الماكينات وخطوط الإنتاج:</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  {factory.machines.map((mach, i) => (
                    <li key={i} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{mach}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Ready Products by this Factory */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#542cb7]" />
                  <span>المنتجات الجاهزة للتوريد الفوري ({factory.products.length})</span>
                </h2>
              </div>

              {factory.products.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">لا توجد منتجات جاهزة معروضة حالياً.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {factory.products.map((p) => (
                    <div
                      key={p.id}
                      className="border border-slate-200 rounded-xl p-3 hover:shadow-md transition-shadow flex gap-3"
                    >
                      <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                        <img
                          src={p.images[0] || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200"}
                          alt={p.nameAr}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{p.nameAr}</h4>
                          <span className="text-[11px] text-slate-500">{p.fabric}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                          <span className="text-xs font-extrabold text-[#542cb7]">
                            {p.basePrice} جنيه <span className="text-[10px] font-normal text-slate-500">/ قطعة</span>
                          </span>
                          <Link
                            href={`/products/${p.id}`}
                            className="text-[11px] font-semibold text-[#059669] hover:underline"
                          >
                            اطلب الآن ←
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Verified Reviews */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 border-b pb-3 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span>تقييمات التجار والمشترين ({factory.reviews.length})</span>
              </h2>

              {factory.reviews.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">لا توجد تقييمات مسجلة بعد لهذا المصنع.</p>
              ) : (
                <div className="space-y-4">
                  {factory.reviews.map((rev) => (
                    <div key={rev.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-slate-800">
                          {rev.author.buyerProfile?.companyName || rev.author.name}
                        </span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < rev.rating
                                  ? "text-amber-500 fill-amber-500"
                                  : "text-slate-200 fill-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{rev.commentAr}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar (1 Col) */}
          <div className="space-y-6">
            {/* Anti-Bypass Contact Information Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#542cb7]" />
                <span>بيانات التواصل والمصنع</span>
              </h3>

              {factory.canViewContact ? (
                <div className="space-y-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>تم فتح التواصل المباشر (طلب/عرض سارٍ)</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">العنوان الدقيق:</span>
                    <span className="font-semibold text-slate-900">{factory.address}</span>
                  </div>

                  {factory.phone && (
                    <div>
                      <span className="text-slate-500 block">الهاتف المباشر:</span>
                      <a href={`tel:${factory.phone}`} className="font-bold text-[#542cb7] text-sm" dir="ltr">
                        {factory.phone}
                      </a>
                    </div>
                  )}

                  {factory.whatsapp && (
                    <a
                      href={`https://wa.me/2${factory.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-2 px-3 rounded-lg flex items-center justify-center gap-2 font-bold text-xs shadow-sm transition-all"
                    >
                      <span>محادثة واتساب مباشرة مع المصنع</span>
                    </a>
                  )}
                </div>
              ) : (
                <div className="space-y-3 bg-purple-50/70 border border-purple-200 rounded-xl p-4 text-xs">
                  <div className="flex items-start gap-2 text-purple-900 leading-relaxed font-medium">
                    <Lock className="w-4 h-4 text-[#542cb7] shrink-0 mt-0.5" />
                    <span>
                      العنوان التفصيلي ورقم الهاتف محجوبان لحماية الصفقات. يتم كشف بيانات التواصل فور قبول عرض السعر وبدء الطلب.
                    </span>
                  </div>

                  <div className="pt-2 border-t border-purple-200/60 text-slate-600">
                    <span className="text-[11px] block text-slate-500">المنطقة الجغرافية:</span>
                    <span className="font-bold text-slate-800">{factory.city} - {factory.governorate}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b pb-2">مؤشرات الأداء والتشغيل</h3>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">الحد الأدنى للطلب (MOQ):</span>
                <span className="font-bold text-slate-900">{factory.minOrderQuantity} قطعة</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">الطاقة الإنتاجية الشهرية:</span>
                <span className="font-bold text-slate-900">
                  {factory.monthlyCapacity != null
                    ? `${factory.monthlyCapacity.toLocaleString()} قطعة`
                    : "غير محدد بعد"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">نسبة الالتزام بالمواعيد:</span>
                <span className="font-bold text-emerald-600">98% ممتاز</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">متوسط سرعة الرد على العروض:</span>
                <span className="font-bold text-purple-700">خلال 3 ساعات</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
