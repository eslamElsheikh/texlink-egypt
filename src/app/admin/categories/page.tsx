"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Layers, Package, Plus, CheckCircle2 } from "lucide-react";

interface CategoryItem {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  productCount?: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([
    { id: "1", nameAr: "تيشيرتات وبولو", nameEn: "T-Shirts & Polos", slug: "t-shirts", productCount: 6 },
    { id: "2", nameAr: "هوديز وسويت شيرت", nameEn: "Hoodies & Sweatshirts", slug: "hoodies", productCount: 4 },
    { id: "3", nameAr: "بنطلونات رياضية وسويت بانتس", nameEn: "Sweatpants", slug: "pants", productCount: 3 },
    { id: "4", nameAr: "شرابات وجوارب", nameEn: "Socks & Hosiery", slug: "socks", productCount: 3 },
    { id: "5", nameAr: "أقمشة وتريكو خام", nameEn: "Fabrics & Knits", slug: "fabrics", productCount: 2 },
  ]);

  const user = {
    id: "admin",
    name: "إدارة منصة سايسل مصر",
    email: "admin@texlink-egypt.com",
    role: "ADMIN" as const,
    isFactory: false,
    isBuyer: true,
  };

  return (
    <DashboardLayout user={user} currentRole="ADMIN">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#17233F]">
            أقسام وتصنيفات منتجات التريكو والملابس
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] mt-1">
            إدارة التصنيفات الرئيسية وأنواع الأقمشة المعتمدة في خوارزميات الـ RFQ.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Categories Card */}
        <div className="bg-white rounded-2xl border border-[#E5EAF2] p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#17233F] border-b pb-2 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#5932A8]" />
            <span>الأقسام الرئيسية الحالية ({categories.length})</span>
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            {categories.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">{c.nameAr}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{c.slug} ({c.nameEn})</span>
                </div>
                <span className="bg-purple-50 text-[#5932A8] px-2.5 py-1 rounded-lg font-bold">
                  {c.productCount || 0} منتجات
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Fabrics Reference Card */}
        <div className="bg-white rounded-2xl border border-[#E5EAF2] p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#17233F] border-b pb-2 flex items-center gap-2">
            <Package className="w-4 h-4 text-[#079B62]" />
            <span>الخامات المعتمدة في التريكو المصري</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <strong className="text-slate-800 block">قطن 100% مصري ممشط</strong>
                <span className="text-[10px] text-slate-500">سينجل جيرسي، خيوط 24/1 و 30/1</span>
              </div>
              <span className="text-emerald-700 font-bold text-[11px]">معتمد للمحلة وشبرا</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <strong className="text-slate-800 block">ميلتون 3 فتلة مبطن بوبرة</strong>
                <span className="text-[10px] text-slate-500">300 - 350 GSM للهوديز الشتوي</span>
              </div>
              <span className="text-emerald-700 font-bold text-[11px]">العاشر من رمضان</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <strong className="text-slate-800 block">بيكيه قطني 100% أو مخلوط</strong>
                <span className="text-[10px] text-slate-500">220 GSM لقمصان البولو والزي الموحد</span>
              </div>
              <span className="text-emerald-700 font-bold text-[11px]">شبرا والمحلة</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <strong className="text-slate-800 block">إنترلوك وريب مضلع 2*2</strong>
                <span className="text-[10px] text-slate-500">للأساور والياقات وملابس الأطفال</span>
              </div>
              <span className="text-emerald-700 font-bold text-[11px]">المنوفية</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
