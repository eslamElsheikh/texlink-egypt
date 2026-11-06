"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Building2,
  FileCheck,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Clock,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

function FactoryRegisterForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    usageMode: "FULL_ACCESS" as "MANAGEMENT_ONLY" | "FULL_ACCESS",
    // User credentials (for guest)
    name: "",
    email: "",
    password: "",
    phone: "",

    // Factory details
    factoryNameAr: "",
    governorate: "المحلة الكبرى",
    city: "",
    address: "",
    whatsapp: "",
    bioAr: "",
    establishedYear: 2018,
    monthlyCapacity: 20000,
    minOrderQuantity: 50,

    // Capabilities
    specialties: ["تيشيرتات وبولو"] as string[],
    machines: ["ماكينات خياطة سنجر وأوفرلوك"] as string[],
    fabrics: ["قطن مصري 100%"] as string[],

    // Documents
    commercialRegisterUrl: "",
    commercialRegisterName: "",
    taxCardUrl: "",
    taxCardName: "",
    industrialRegisterUrl: "",
    industrialRegisterName: "",
  });

  const searchParams = useSearchParams();

  useEffect(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam === "MANAGEMENT_ONLY" || modeParam === "FULL_ACCESS") {
      setFormData((prev) => ({ ...prev, usageMode: modeParam }));
    }
  }, [searchParams]);
  const governorates = [
    "المحلة الكبرى",
    "شبرا الخيمة",
    "العاشر من رمضان",
    "المنوفية",
    "الإسكندرية",
    "القاهرة",
    "الجيزة",
    "الشرقية",
    "القليوبية",
    "الغربية",
    "بني سويف",
    "بورسعيد",
  ];

  const availableSpecialties = [
    "تيشيرتات وبولو",
    "هوديز وسويت شيرت",
    "سويت بانتس وشورتات",
    "شرابات وجوارب",
    "ملابس أطفال",
    "ملابس داخلية قطنية",
    "أقمشة تريكو دائري",
    "طباعة سلك سكرين",
    "تطريز كمبيوتر",
  ];

  const availableFabrics = [
    "قطن مصري 100%",
    "سينجل جيرسي ليكرا",
    "ميلتون 3 فتلة مبطن",
    "فرنش تيري قطن",
    "بيكيه قطن 100%",
    "إنترلوك قطن",
    "ريب مضلع 1*1 و 2*2",
  ];

  const toggleSpecialty = (spec: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(spec)
        ? prev.specialties.filter((s) => s !== spec)
        : [...prev.specialties, spec],
    }));
  };

  const toggleFabric = (fab: string) => {
    setFormData((prev) => ({
      ...prev,
      fabrics: prev.fabrics.includes(fab)
        ? prev.fabrics.filter((f) => f !== fab)
        : [...prev.fabrics, fab],
    }));
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "cr" | "tax" | "industrial"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    data.append("isPrivate", "true");
    data.append("type", "DOCUMENT");

    try {
      const res = await fetch("/api/upload", {
        body: data,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل رفع الملف");

      if (type === "cr") {
        setFormData((prev) => ({
          ...prev,
          commercialRegisterUrl: json.url,
          commercialRegisterName: json.fileName,
        }));
      } else if (type === "tax") {
        setFormData((prev) => ({
          ...prev,
          taxCardUrl: json.url,
          taxCardName: json.fileName,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          industrialRegisterUrl: json.url,
          industrialRegisterName: json.fileName,
        }));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "فشل رفع الملف";
      alert(message);
    }
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/factories/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "فشل تسجيل المصنع");
      }

      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopBar />
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10">
        {/* Title & Trust Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-1.5 rounded-full text-xs font-semibold mb-3">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>تسجيل وتوثيق المنشآت الصناعية</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0b1320]">
            انضم كـ مصنع معتمد في شبكة تكس لينك مصر
          </h1>
          <p className="text-slate-600 text-sm mt-2 max-w-lg mx-auto">
            احصل على طلبات تصنيع (RFQ) حقيقية بمواصفات دقيقة من كبار تجار الجملة
            وأصحاب البراندات محلياً وإقليمياً.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
          <div className="grid grid-cols-3 gap-2 text-center text-xs md:text-sm font-semibold">
            <div
              className={`pb-2 border-b-2 transition-colors ${
                step >= 1
                  ? "border-[#059669] text-[#059669]"
                  : "border-slate-200 text-slate-400"
              }`}
            >
              1. البيانات الأساسية
            </div>
            <div
              className={`pb-2 border-b-2 transition-colors ${
                step >= 2
                  ? "border-[#059669] text-[#059669]"
                  : "border-slate-200 text-slate-400"
              }`}
            >
              2. التخصصات والقدرات
            </div>
            <div
              className={`pb-2 border-b-2 transition-colors ${
                step >= 3
                  ? "border-[#059669] text-[#059669]"
                  : "border-slate-200 text-slate-400"
              }`}
            >
              3. مستندات التوثيق
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center gap-3 text-sm mb-6">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Screen */}
        {success ? (
          <div className="bg-white rounded-2xl border border-emerald-200 p-8 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              {formData.usageMode === "MANAGEMENT_ONLY"
                ? "تم تفعيل حساب مصنعك بنجاح!"
                : "تم استلام طلب تسجيل مصنعك بنجاح!"}
            </h2>
            <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
              {formData.usageMode === "MANAGEMENT_ONLY"
                ? "مساحة إدارة وتشغيل المصنع (Factory OS) مفعلة وجاهزة للعمل فوراً. يمكنك الآن البدء في تسجيل الماكينات، أوامر الإنتاج، المخازن، والعمالة."
                : "طلبك الآن في مرحلة التدقيق لدى إدارة تكس لينك للتأكد من السجل التجاري والبيانات الصناعية. ستتلقى إشعاراً بالموافقة وتفعيل شارة المصنع المعتمد خلال 24 ساعة عمل."}
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/factory/dashboard"
                className="bg-[#079B62] hover:bg-[#068453] text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>الدخول إلى لوحة تشغيل المصنع</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-6 py-2.5 rounded-xl transition-all"
              >
                العودة للرئيسية
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-6">
                {/* 1. Usage Mode Selection */}
                <div className="space-y-3 pb-6 border-b border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <label className="block text-sm font-black text-slate-900">
                      كيف ترغب في استخدام منصة تكس لينك؟ *
                    </label>
                    <span className="text-[11px] font-bold text-slate-400">يمكنك تعديل هذا الخيار لاحقاً من الإعدادات</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Mode A: Management Only */}
                    <div
                      onClick={() => setFormData((p) => ({ ...p, usageMode: "MANAGEMENT_ONLY" }))}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2.5 ${
                        formData.usageMode === "MANAGEMENT_ONLY"
                          ? "border-[#079B62] bg-emerald-50/50 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-[#079B62]">
                          نظام إدارة المصنع فقط (Factory OS)
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            formData.usageMode === "MANAGEMENT_ONLY"
                              ? "border-[#079B62] bg-[#079B62]"
                              : "border-slate-300"
                          }`}
                        >
                          {formData.usageMode === "MANAGEMENT_ONLY" && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900">
                        برنامج إدارة وتشغيل صناعي داخلي (ERP)
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        استخدام أدوات تشغيل المصنع، تسجيل الإنتاج، الماكينات، المخازن، والعمالة دون عرض منتجاتي أو الانضمام للسوق التجاري.
                      </p>
                      <span className="text-[10px] font-bold text-emerald-800 block pt-1">
                        ✓ تفعيل فوري بدون انتظار مراجعة مستندات النشر
                      </span>
                    </div>

                    {/* Mode B: Full Access */}
                    <div
                      onClick={() => setFormData((p) => ({ ...p, usageMode: "FULL_ACCESS" }))}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2.5 ${
                        formData.usageMode === "FULL_ACCESS"
                          ? "border-[#542cb7] bg-purple-50/50 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-[#542cb7]">
                          إدارة المصنع + السوق التجاري B2B
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            formData.usageMode === "FULL_ACCESS"
                              ? "border-[#542cb7] bg-[#542cb7]"
                              : "border-slate-300"
                          }`}
                        >
                          {formData.usageMode === "FULL_ACCESS" && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900">
                        إدارة مصنع متكاملة + فرص وطلبيات توريد
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        الحصول على أدوات إدارة المصنع بالإضافة لنشر كتالوج المنتجات، واستقبال طلبات الشراء والمقايسات (RFQs) من المشترين.
                      </p>
                      <span className="text-[10px] font-bold text-[#542cb7] block pt-1">
                        ✓ يشمل مساحة إدارة العملاء والمبيعات (CRM)
                      </span>
                    </div>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 border-b pb-3">
                  بيانات المصنع والتواصل الأساسية
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      اسم المصنع أو الشركة باللغة العربية *
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: مصنع الفرسان للتريكو والملابس"
                      value={formData.factoryNameAr}
                      onChange={(e) =>
                        setFormData({ ...formData, factoryNameAr: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      المحافظة أو المدينة الصناعية *
                    </label>
                    <select
                      value={formData.governorate}
                      onChange={(e) =>
                        setFormData({ ...formData, governorate: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
                    >
                      {governorates.map((gov) => (
                        <option key={gov} value={gov}>
                          {gov}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      المنطقة الصناعية أو الحي *
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: مجمع المصانع، المنطقة الرابعة"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      العنوان التفصيلي للمصنع *
                    </label>
                    <input
                      type="text"
                      placeholder="العنوان التفصيلي (محمي ولن يظهر للعامة إلا بعد اعتماد الصفقات)"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      رقم هاتف المصنع / المسؤول *
                    </label>
                    <input
                      type="tel"
                      placeholder="010XXXXXXXX"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-left focus:outline-none focus:ring-2 focus:ring-[#059669]"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      رقم الواتساب لاستقبال العروض والإشعارات *
                    </label>
                    <input
                      type="tel"
                      placeholder="010XXXXXXXX"
                      value={formData.whatsapp}
                      onChange={(e) =>
                        setFormData({ ...formData, whatsapp: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-left focus:outline-none focus:ring-2 focus:ring-[#059669]"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      اسم المسؤول أو المدير *
                    </label>
                    <input
                      type="text"
                      placeholder="الاسم الثلاثي"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      البريد الإلكتروني لتسجيل الدخول *
                    </label>
                    <input
                      type="email"
                      placeholder="factory@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-left focus:outline-none focus:ring-2 focus:ring-[#059669]"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      كلمة المرور *
                    </label>
                    <input
                      type="password"
                      placeholder="لا تقل عن 6 أحرف"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-left focus:outline-none focus:ring-2 focus:ring-[#059669]"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      سنة تأسيس المصنع
                    </label>
                    <input
                      type="number"
                      value={formData.establishedYear}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          establishedYear: parseInt(e.target.value) || 2020,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    نبذة تعريفية عن المصنع وإمكانياته *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="اكتب نبذة عن تاريخ المصنع وخبراته ومجالات التميز التي تخدم المشترين..."
                    value={formData.bioAr}
                    onChange={(e) =>
                      setFormData({ ...formData, bioAr: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
                  ></textarea>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.factoryNameAr || !formData.email || !formData.phone) {
                        setError("يرجى ملء كافة الحقول الأساسية المطلوبة");
                        return;
                      }
                      setError("");
                      setStep(2);
                    }}
                    className="bg-[#059669] hover:bg-[#047857] text-white px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
                  >
                    <span>التالي: التخصصات والقدرات</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Capabilities */}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900 border-b pb-3">
                  القدرات الإنتاجية والتخصصات
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    المنتجات والتخصصات الرئيسية (اختر ما ينطبق) *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {availableSpecialties.map((spec) => {
                      const selected = formData.specialties.includes(spec);
                      return (
                        <button
                          type="button"
                          key={spec}
                          onClick={() => toggleSpecialty(spec)}
                          className={`p-3 rounded-xl border text-xs font-medium text-right transition-all flex items-center justify-between ${
                            selected
                              ? "bg-emerald-50 border-emerald-400 text-emerald-800 font-bold"
                              : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <span>{spec}</span>
                          {selected && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    أنواع الأقمشة التي يجيد المصنع التعامل معها *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {availableFabrics.map((fab) => {
                      const selected = formData.fabrics.includes(fab);
                      return (
                        <button
                          type="button"
                          key={fab}
                          onClick={() => toggleFabric(fab)}
                          className={`p-3 rounded-xl border text-xs font-medium text-right transition-all flex items-center justify-between ${
                            selected
                              ? "bg-emerald-50 border-emerald-400 text-emerald-800 font-bold"
                              : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <span>{fab}</span>
                          {selected && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      الطاقة الإنتاجية الشهرية التقديرية (قطعة) *
                    </label>
                    <input
                      type="number"
                      step={1000}
                      value={formData.monthlyCapacity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          monthlyCapacity: parseInt(e.target.value) || 5000,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      الحد الأدنى للطلب المخصص (MOQ) *
                    </label>
                    <input
                      type="number"
                      step={10}
                      value={formData.minOrderQuantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minOrderQuantity: parseInt(e.target.value) || 50,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>السابق</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="bg-[#059669] hover:bg-[#047857] text-white px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
                  >
                    <span>التالي: مستندات التوثيق</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Documents */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 text-xs text-emerald-800 leading-relaxed">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm mb-1">
                      لماذا نطلب مستندات رسمية؟
                    </p>
                    تكس لينك منصة موثوقة حصرياً للمصانع والورش والمنشآت المسجلة
                    لحماية حقوق التجار والمصنعين وتجنب الوسطاء غير الجادين.
                  </div>
                </div>

                {/* Commercial Register */}
                <div className="border border-dashed border-slate-300 rounded-xl p-5 text-center bg-slate-50 hover:bg-slate-100/60 transition-colors">
                  <FileCheck className="w-8 h-8 text-[#059669] mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-800">
                    صورة السجل التجاري الحديث (موصى به للتوثيق السريع)
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 mb-3">
                    ملف PDF أو صورة واضحة (الحد الأقصى 10 ميجابايت)
                  </p>
                  {formData.commercialRegisterName ? (
                    <div className="bg-emerald-100 text-emerald-800 text-xs py-1.5 px-3 rounded-lg inline-flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{formData.commercialRegisterName}</span>
                    </div>
                  ) : (
                    <label className="cursor-pointer bg-white border border-slate-300 hover:border-emerald-500 text-slate-700 text-xs font-semibold py-2 px-4 rounded-lg inline-flex items-center gap-2 shadow-sm transition-all">
                      <Upload className="w-4 h-4" />
                      <span>اختر الملف</span>
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "cr")}
                      />
                    </label>
                  )}
                </div>

                {/* Tax Card */}
                <div className="border border-dashed border-slate-300 rounded-xl p-5 text-center bg-slate-50 hover:bg-slate-100/60 transition-colors">
                  <FileCheck className="w-8 h-8 text-[#059669] mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-800">
                    صورة البطاقة الضريبية السارية
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 mb-3">
                    ملف PDF أو صورة واضحة (الحد الأقصى 10 ميجابايت)
                  </p>
                  {formData.taxCardName ? (
                    <div className="bg-emerald-100 text-emerald-800 text-xs py-1.5 px-3 rounded-lg inline-flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{formData.taxCardName}</span>
                    </div>
                  ) : (
                    <label className="cursor-pointer bg-white border border-slate-300 hover:border-emerald-500 text-slate-700 text-xs font-semibold py-2 px-4 rounded-lg inline-flex items-center gap-2 shadow-sm transition-all">
                      <Upload className="w-4 h-4" />
                      <span>اختر الملف</span>
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "tax")}
                      />
                    </label>
                  )}
                </div>

                {/* Industrial Register (Optional) */}
                <div className="border border-dashed border-slate-300 rounded-xl p-5 text-center bg-slate-50 hover:bg-slate-100/60 transition-colors">
                  <FileCheck className="w-8 h-8 text-[#059669] mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-800">
                    السجل الصناعي أو رخصة التشغيل (اختياري)
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 mb-3">
                    يعطي مصنعك أولوية الظهور في نتائج البحث وطلبات التصدير
                  </p>
                  {formData.industrialRegisterName ? (
                    <div className="bg-emerald-100 text-emerald-800 text-xs py-1.5 px-3 rounded-lg inline-flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{formData.industrialRegisterName}</span>
                    </div>
                  ) : (
                    <label className="cursor-pointer bg-white border border-slate-300 hover:border-emerald-500 text-slate-700 text-xs font-semibold py-2 px-4 rounded-lg inline-flex items-center gap-2 shadow-sm transition-all">
                      <Upload className="w-4 h-4" />
                      <span>اختر الملف</span>
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "industrial")}
                      />
                    </label>
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>السابق</span>
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleSubmit}
                    className="bg-[#059669] hover:bg-[#047857] disabled:opacity-50 text-white px-8 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md transition-all"
                  >
                    {loading ? (
                      <span>جاري إرسال الطلب...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>إرسال طلب التسجيل والتوثيق</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function FactoryRegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-sans">جاري التحميل...</div>}>
      <FactoryRegisterForm />
    </Suspense>
  );
}
