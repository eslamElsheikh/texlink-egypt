"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Building2,
  Save,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { ALL_GOVERNORATE_NAMES_AR, getIndustrialAreasForGovernorate } from "@/config/locations";
export default function FactoryProfilePage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [nameAr, setNameAr] = useState("");
  const [slug, setSlug] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [industrialArea, setIndustrialArea] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [bioAr, setBioAr] = useState("");
  const [minOrderQuantity, setMinOrderQuantity] = useState("50");
  const [monthlyCapacity, setMonthlyCapacity] = useState("35000");
  const [specialtiesText, setSpecialtiesText] = useState("");
  const [machinesText, setMachinesText] = useState("");
  const [fabricsText, setFabricsText] = useState("");

  const [user, setUser] = useState({
    id: "factory-user",
    name: "إدارة المصنع",
    email: "elnasr@mahalla-textile.com",
    role: "FACTORY" as const,
    isFactory: true,
    isBuyer: false,
    factorySlug: "el-nasr-tricot",
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const [res, meRes] = await Promise.all([
        fetch("/api/factory/profile"),
        fetch("/api/auth/me").catch(() => null),
      ]);
      const json = await res.json();
      if (res.ok && json.factory) {
        const f = json.factory;
        setNameAr(f.nameAr || "");
        setSlug(f.slug || "");
        setGovernorate(f.governorate || "");
        setIndustrialArea(f.industrialArea || "");
        setCity(f.city || "");
        setPhone(f.phone || "");
        setWhatsapp(f.whatsapp || "");
        setBioAr(f.bioAr || "");
        setMinOrderQuantity(String(f.minOrderQuantity || 50));
        setMonthlyCapacity(String(f.monthlyCapacity || 5000));

        try {
          const s = JSON.parse(f.specialties || "[]");
          setSpecialtiesText(Array.isArray(s) ? s.join("، ") : f.specialties);
        } catch {
          setSpecialtiesText(f.specialties || "");
        }

        try {
          const m = JSON.parse(f.machines || "[]");
          setMachinesText(Array.isArray(m) ? m.join("، ") : f.machines);
        } catch {
          setMachinesText(f.machines || "");
        }

        try {
          const fb = JSON.parse(f.fabrics || "[]");
          setFabricsText(Array.isArray(fb) ? fb.join("، ") : f.fabrics);
        } catch {
          setFabricsText(f.fabrics || "");
        }
      }
      if (meRes && meRes.ok) {
        const me = await meRes.json();
        if (me.user) setUser({ ...me.user, role: "FACTORY" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const specialtiesArr = specialtiesText.split("،").map((s) => s.trim()).filter(Boolean);
    const machinesArr = machinesText.split("،").map((m) => m.trim()).filter(Boolean);
    const fabricsArr = fabricsText.split("،").map((f) => f.trim()).filter(Boolean);

    try {
      const res = await fetch("/api/factory/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameAr,
          governorate,
          industrialArea,
          city,
          address,
          phone,
          whatsapp,
          bioAr,
          minOrderQuantity,
          monthlyCapacity,
          specialties: JSON.stringify(specialtiesArr),
          machines: JSON.stringify(machinesArr),
          fabrics: JSON.stringify(fabricsArr),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل حفظ الملف");

      setSuccessMsg("تم حفظ وتحديث ملف المصنع بنجاح ✓");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout user={user} currentRole="FACTORY">
      <div className="space-y-6 pb-12 font-sans max-w-4xl" dir="rtl">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-emerald-50 text-[#079B62] rounded-xl">
              <Building2 className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">ملف المصنع وبيانات التشغيل</h1>
              <p className="text-gray-500 text-xs md:text-sm mt-1">
                تحديث العنوان، بيانات الاتصال، الطاقة الإنتاجية الشهرية، وتجهيزات الماكينات.
              </p>
            </div>
          </div>

          {slug && (
            <Link
              href={`/factories/${slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold transition"
            >
              <ExternalLink className="w-4 h-4" />
              معاينة الصفحة العامة
            </Link>
          )}
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">اسم المصنع بالعربية *</label>
              <input
                type="text"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#079B62] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">المحافظة (27 محافظة) *</label>
              <select
                value={governorate}
                onChange={(e) => {
                  const newGov = e.target.value;
                  const areas = getIndustrialAreasForGovernorate(newGov);
                  setGovernorate(newGov);
                  setIndustrialArea(areas.length > 0 ? areas[0].slug : "");
                }}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#079B62] focus:outline-none bg-white"
              >
                <option value="">اختر المحافظة</option>
                {ALL_GOVERNORATE_NAMES_AR.map((gov) => (
                  <option key={gov} value={gov}>
                    {gov}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Industrial Area if available for governorate */}
          {getIndustrialAreasForGovernorate(governorate).length > 0 && (
            <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-xl">
              <label className="block text-xs font-bold text-emerald-950 mb-1">
                المنطقة الصناعية المعتمدة في {governorate}
              </label>
              <select
                value={industrialArea}
                onChange={(e) => setIndustrialArea(e.target.value)}
                className="w-full px-3 py-2 border border-emerald-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#079B62] focus:outline-none bg-white"
              >
                {getIndustrialAreasForGovernorate(governorate).map((a) => (
                  <option key={a.slug} value={a.slug}>
                    {a.nameAr}
                  </option>
                ))}
                <option value="">منطقة أخرى بالمحافظة</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">المدينة والحي *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">العنوان التفصيلي للعنبر</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">رقم الهاتف الرسمي *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#079B62] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">رقم الواتساب</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">الحد الأدنى للطلب (MOQ)</label>
              <input
                type="number"
                min="1"
                value={minOrderQuantity}
                onChange={(e) => setMinOrderQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#079B62] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">الطاقة الإنتاجية الشهرية (قطعة)</label>
              <input
                type="number"
                min="100"
                value={monthlyCapacity}
                onChange={(e) => setMonthlyCapacity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#079B62] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">نبذة عن المصنع وتاريخه</label>
            <textarea
              value={bioAr}
              onChange={(e) => setBioAr(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              المنتجات التخصصية (افصل بينها بفاصلة عربية ،)
            </label>
            <input
              type="text"
              value={specialtiesText}
              onChange={(e) => setSpecialtiesText(e.target.value)}
              placeholder="تيشيرتات قطن، بولو شيرت، هودي شتوي"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              تجهيزات الماكينات الرئيسية (افصل بينها بفاصلة عربية ،)
            </label>
            <input
              type="text"
              value={machinesText}
              onChange={(e) => setMachinesText(e.target.value)}
              placeholder="24 ماكينة تريكو دائري ماير، 40 ماكينة سنجر جوكي، مقص ليزر"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              أنواع الأقمشة التي يتعامل معها المصنع (افصل بفاصلة ،)
            </label>
            <input
              type="text"
              value={fabricsText}
              onChange={(e) => setFabricsText(e.target.value)}
              placeholder="قطن 100% مشط، سينجل جيرسي، ميلتون مبطن، بيكيه"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#079B62] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end pt-3 border-t border-gray-100">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#079B62] text-white rounded-xl font-bold text-sm hover:bg-[#068453] transition shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {submitting ? "جاري الحفظ..." : "حفظ ملف المصنع"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
