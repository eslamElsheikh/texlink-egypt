"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Building2,
  Search,
  MapPin,
  Star,
  CheckCircle2,
  Filter,
  Eye,
  SlidersHorizontal,
  Layers,
  Calendar,
  LayoutDashboard,
  PlusCircle,
  ShieldCheck,
  Factory as FactoryIcon,
} from "lucide-react";
import Link from "next/link";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import {
  EGYPT_GOVERNORATES,
  GOVERNORATES_BY_KEY,
  getIndustrialAreasForGovernorate,
  INDUSTRIAL_AREAS_BY_SLUG,
} from "@/config/locations";
import { BRAND } from "@/config/brand";

interface Factory {
  id: string;
  slug: string;
  nameAr: string;
  governorate: string;
  city: string;
  industrialArea?: string | null;
  bioAr: string;
  logoUrl?: string;
  coverUrl?: string;
  verificationStatus: string;
  minOrderQuantity: number;
  monthlyCapacity: number;
  establishedYear: number;
  rating: number;
  reviewCount: number;
  specialties: string[];
  machines: string[];
  fabrics: string[];
  featured: boolean;
  productCount: number;
}

/**
 * Contextual CTA based on authentication and user role
 * - Guest -> "سجل مصنعك الآن"
 * - Factory Owner / Employee -> "لوحة تحكم المصنع"
 * - Buyer -> "انشر طلب تصنيع (RFQ)" & "لوحة المشتري"
 * - Admin -> "لوحة تحكم الإدارة"
 */
function FactoryDirectoryCta() {
  const { user, loading, isAuthenticated, isFactory, isBuyer, isAdmin } = useCurrentUser();

  if (loading) {
    return (
      <div className="h-10 w-36 bg-slate-200 animate-pulse rounded-xl shrink-0" />
    );
  }

  // 1. Factory Owner or Employee
  if (isFactory) {
    return (
      <Link
        href="/factory/dashboard"
        className="inline-flex items-center gap-2 bg-[#542cb7] hover:bg-[#432194] text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all shrink-0"
      >
        <LayoutDashboard className="w-4 h-4" />
        <span>لوحة تحكم المصنع</span>
      </Link>
    );
  }

  // 2. Authenticated Buyer
  if (isBuyer) {
    return (
      <div className="flex items-center gap-2.5 shrink-0">
        <Link
          href="/rfqs/new"
          className="inline-flex items-center gap-2 bg-[#542cb7] hover:bg-[#432194] text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>انشر طلب تصنيع (RFQ)</span>
        </Link>
        <Link
          href="/buyer/dashboard"
          className="inline-flex items-center gap-2 bg-purple-50 text-[#542cb7] border border-purple-200 hover:bg-purple-100 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>لوحة المشتري</span>
        </Link>
      </div>
    );
  }

  // 3. Platform Admin
  if (isAdmin) {
    return (
      <Link
        href="/admin/dashboard"
        className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all shrink-0"
      >
        <ShieldCheck className="w-4 h-4" />
        <span>لوحة تحكم الإدارة</span>
      </Link>
    );
  }

  // 4. Guest / Unauthenticated Visitor
  return (
    <Link
      href="/factories/register"
      className="inline-flex items-center gap-2 bg-[#059669] hover:bg-[#047857] text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all shrink-0"
    >
      <Building2 className="w-4 h-4" />
      <span>سجل مصنعك الآن</span>
    </Link>
  );
}

function FactoriesContent() {
  const searchParams = useSearchParams();
  const [factories, setFactories] = useState<Factory[]>([]);
  const [loading, setLoading] = useState(true);

  // Read URL parameters on initial load
  const initialQ = searchParams.get("q") || "";
  const initialGovParam = searchParams.get("governorate") || "";
  const initialAreaParam = searchParams.get("area") || "";

  // Normalize initial governorate
  const matchedGov = initialGovParam
    ? GOVERNORATES_BY_KEY[initialGovParam.toLowerCase()] || GOVERNORATES_BY_KEY[initialGovParam]
    : null;

  // Filters
  const [q, setQ] = useState(initialQ);
  const [governorate, setGovernorate] = useState(matchedGov ? matchedGov.nameAr : initialGovParam);
  const [area, setArea] = useState(initialAreaParam);
  const [specialty, setSpecialty] = useState("");
  const [fabric, setFabric] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const specialties = [
    "الكل",
    "تيشيرتات وبولو",
    "هوديز وسويت شيرت",
    "شرابات وجوارب",
    "جميع أنواع التريكو",
    "سويت بانتس",
  ];

  const fabrics = ["الكل", "قطن 100%", "ميلتون", "بيكيه", "إنترلوك"];

  // Industrial areas for current governorate selection
  const currentGovAreas = governorate ? getIndustrialAreasForGovernorate(governorate) : [];

  useEffect(() => {
    fetchFactories();
  }, [governorate, area, specialty, fabric, verifiedOnly]);

  const fetchFactories = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (governorate && governorate !== "الكل") params.set("governorate", governorate);
      if (area && area !== "الكل") params.set("area", area);
      if (specialty && specialty !== "الكل") params.set("specialty", specialty);
      if (fabric && fabric !== "الكل") params.set("fabric", fabric);
      if (verifiedOnly) params.set("verified", "true");

      const res = await fetch(`/api/factories?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setFactories(json.factories);
      }
    } catch (err) {
      console.error("Error fetching factories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFactories();
  };

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
      {/* Breadcrumb & Header with Contextual CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/" className="hover:text-purple-600">
              الرئيسية
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">دليل المصانع</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0b1320]">
            مصانع التريكو والملابس المعتمدة في مصر
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            تصفح وتواصل مع مصانع الملابس الجاهزة والتريكو المعتمدة في {BRAND.fullNameAr} واطلب عروض أسعار مباشرة.
          </p>
        </div>

        {/* Dynamic Contextual CTA */}
        <FactoryDirectoryCta />
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-8 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="ابحث باسم المصنع، التخصص، أو نوع القماش..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#542cb7]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
          </div>

          <button
            type="submit"
            className="bg-[#542cb7] hover:bg-[#45209c] text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0"
          >
            بحث
          </button>
        </form>

        {/* Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* 1. All 27 Governorates */}
          <div>
            <label className="block text-slate-500 font-medium mb-1">المحافظة (27 محافظة)</label>
            <select
              value={governorate}
              onChange={(e) => {
                setGovernorate(e.target.value);
                setArea(""); // Reset area when governorate changes
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700"
            >
              <option value="">كل المحافظات</option>
              {EGYPT_GOVERNORATES.map((g) => (
                <option key={g.slug} value={g.nameAr}>
                  {g.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Industrial Area (Shown for selected governorate if available or if area is set) */}
          <div>
            <label className="block text-slate-500 font-medium mb-1">المنطقة الصناعية</label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              disabled={currentGovAreas.length === 0 && !area}
              className={`w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 ${
                currentGovAreas.length === 0 && !area ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <option value="">كل المناطق</option>
              {currentGovAreas.map((a) => (
                <option key={a.slug} value={a.slug}>
                  {a.nameAr}
                </option>
              ))}
              {/* If area was selected via query param but governorate was not Dakahlia */}
              {area && !currentGovAreas.some((a) => a.slug === area) && (
                <option value={area}>
                  {INDUSTRIAL_AREAS_BY_SLUG[area]?.nameAr || area}
                </option>
              )}
            </select>
          </div>

          {/* 3. Specialty */}
          <div>
            <label className="block text-slate-500 font-medium mb-1">التخصص</label>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700"
            >
              {specialties.map((s) => (
                <option key={s} value={s === "الكل" ? "" : s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Fabric */}
          <div>
            <label className="block text-slate-500 font-medium mb-1">نوع القماش</label>
            <select
              value={fabric}
              onChange={(e) => setFabric(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700"
            >
              {fabrics.map((f) => (
                <option key={f} value={f === "الكل" ? "" : f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Verified Toggle */}
          <div className="flex flex-col justify-end col-span-2 sm:col-span-1">
            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 rounded-lg p-2 hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 text-[#542cb7] rounded border-slate-300 focus:ring-[#542cb7]"
              />
              <span className="text-slate-700 font-medium text-xs">المصانع الموثقة فقط</span>
            </label>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-[#542cb7] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">جاري تحميل بيانات المصانع...</p>
        </div>
      ) : factories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">لا توجد مصانع مطابقة للبحث</h3>
          <p className="text-slate-500 text-sm mt-1">جرب تغيير معايير البحث أو اختيار محافظة أخرى.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {factories.map((factory) => {
            const areaDisplay = factory.industrialArea
              ? INDUSTRIAL_AREAS_BY_SLUG[factory.industrialArea]?.nameAr || factory.industrialArea
              : null;

            return (
              <div
                key={factory.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                {/* Cover & Badges */}
                <div className="h-44 bg-slate-200 relative overflow-hidden">
                  <img
                    src={factory.coverUrl || "/images/factory-promo.jpg"}
                    alt={factory.nameAr}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                  {/* Top Badges */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{factory.rating.toFixed(1)}</span>
                    <span className="text-slate-400 text-[10px]">({factory.reviewCount})</span>
                  </div>

                  <div className="absolute top-3 left-3 bg-[#0b1320]/80 backdrop-blur text-white px-2.5 py-1 rounded-full text-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-purple-300" />
                    <span>
                      {factory.governorate}
                      {areaDisplay ? ` — ${areaDisplay}` : ""}
                    </span>
                  </div>

                  {/* Verified Tag at Bottom Cover */}
                  {factory.verificationStatus === "VERIFIED" && (
                    <div className="absolute bottom-3 right-3 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>موثق ومعتمد</span>
                    </div>
                  )}
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#542cb7] transition-colors">
                      {factory.nameAr}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {factory.bioAr}
                    </p>

                    {/* Specialties Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {factory.specialties.slice(0, 3).map((spec, i) => (
                        <span
                          key={i}
                          className="bg-purple-50 text-purple-700 text-[11px] font-medium px-2 py-0.5 rounded-md"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>

                    {/* Meta stats */}
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                      <div>
                        <span className="text-slate-400 block text-[10px]">الحد الأدنى (MOQ):</span>
                        <span className="font-bold text-slate-800">{factory.minOrderQuantity} قطعة</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">الطاقة الشهرية:</span>
                        <span className="font-bold text-slate-800">{factory.monthlyCapacity.toLocaleString()} قطعة</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-slate-100">
                    <Link
                      href={`/factories/${factory.slug}`}
                      className="w-full bg-purple-50 hover:bg-[#542cb7] text-[#542cb7] hover:text-white font-semibold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <Eye className="w-4 h-4" />
                      <span>عرض الملف الكامل والكتالوج</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default function FactoriesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopBar />
      <Header />
      <Suspense
        fallback={
          <div className="py-20 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-[#542cb7] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm">جاري تحميل دليل المصانع...</p>
          </div>
        }
      >
        <FactoriesContent />
      </Suspense>
      <Footer />
    </div>
  );
}
