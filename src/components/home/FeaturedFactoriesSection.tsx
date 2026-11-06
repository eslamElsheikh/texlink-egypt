import React from "react";
import Link from "next/link";
import { Star, MapPin, Eye, Crown, ArrowLeft } from "lucide-react";

interface FactoryItem {
  id: string;
  slug: string;
  nameAr: string;
  governorate: string;
  rating: number;
  specialtyText: string;
  imageUrl: string;
}

interface FeaturedFactoriesProps {
  factories?: FactoryItem[];
}

export function FeaturedFactoriesSection({ factories }: FeaturedFactoriesProps) {
  // Default data matching the design reference screenshot
  const defaultFactories: FactoryItem[] = [
    {
      id: "f-1",
      slug: "al-khalij-tricot",
      nameAr: "مصنع الخليج للتريكو",
      governorate: "المنوفية",
      rating: 4.5,
      specialtyText: "جميع أنواع التريكو",
      imageUrl:
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&auto=format&fit=crop&q=80",
    },
    {
      id: "f-2",
      slug: "al-amal-garments",
      nameAr: "مصنع الأمل للملابس",
      governorate: "شبرا الخيمة",
      rating: 4.6,
      specialtyText: "تيشيرتات وبولو",
      imageUrl:
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&auto=format&fit=crop&q=80",
    },
    {
      id: "f-3",
      slug: "el-nasr-tricot",
      nameAr: "مصنع النصر للتريكو",
      governorate: "المحلة الكبرى",
      rating: 4.8,
      specialtyText: "ملابس جاهزة - جودة عالية",
      imageUrl:
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&auto=format&fit=crop&q=80",
    },
  ];

  const items = factories && factories.length > 0 ? factories : defaultFactories;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-500 fill-amber-500" />
          <span>مصانع مميزة</span>
        </h2>

        <Link
          href="/factories"
          className="text-xs font-semibold text-[#542cb7] hover:text-[#45209c] flex items-center gap-1 transition-colors"
        >
          <span>عرض الكل</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 3 Factory Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {items.map((factory) => (
          <div
            key={factory.id}
            className="border border-slate-200/80 rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col group bg-white"
          >
            {/* Image & Badge Overlay */}
            <div className="h-28 bg-slate-100 relative overflow-hidden">
              <img
                src={factory.imageUrl}
                alt={factory.nameAr}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Rating & Location Tag */}
              <div className="absolute top-2 right-2 bg-white/95 backdrop-blur text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>{factory.rating.toFixed(1)}</span>
                <span className="text-slate-300">|</span>
                <MapPin className="w-3 h-3 text-purple-600" />
                <span>{factory.governorate}</span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-3 flex-1 flex flex-col justify-between text-center">
              <div>
                <h3 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-[#542cb7] transition-colors">
                  {factory.nameAr}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                  {factory.specialtyText}
                </p>
              </div>

              {/* Outline Button */}
              <div className="mt-3 pt-2 border-t border-slate-100">
                <Link
                  href={`/factories/${factory.slug}`}
                  className="w-full border border-purple-200 hover:border-[#542cb7] bg-purple-50/50 hover:bg-[#542cb7] text-[#542cb7] hover:text-white text-[11px] font-bold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>عرض الملف</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
