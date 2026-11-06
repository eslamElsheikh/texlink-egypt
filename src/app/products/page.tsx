"use client";

import React, { useEffect, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Package,
  Search,
  Building2,
  Tag,
  MapPin,
  ArrowLeft,
  SlidersHorizontal,
  Layers,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface ProductPriceTier {
  id: string;
  minQuantity: number;
  maxQuantity: number | null;
  pricePerPiece: number;
}

interface ProductItem {
  id: string;
  nameAr: string;
  descriptionAr: string;
  fabric: string;
  gsm?: number | null;
  colors: string[];
  sizes: string[];
  moq: number;
  leadTimeDays: number;
  basePrice: number;
  images: string[];
  isFeatured: boolean;
  factory: {
    id: string;
    nameAr: string;
    slug: string;
    governorate: string;
    rating: number;
  };
  category: {
    nameAr: string;
    slug: string;
  };
  priceTiers: ProductPriceTier[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("ALL");
  const [fabric, setFabric] = useState("ALL");

  const categories = [
    { slug: "ALL", nameAr: "جميع الأقسام" },
    { slug: "t-shirts", nameAr: "تيشيرتات وبولو" },
    { slug: "hoodies", nameAr: "هوديز وسويت شيرت" },
    { slug: "pants", nameAr: "بنطلونات رياضية" },
    { slug: "socks", nameAr: "شرابات وجوارب" },
    { slug: "fabrics", nameAr: "أقمشة وتريكو خام" },
  ];

  const fabrics = ["ALL", "قطن", "ميلتون", "بيكيه", "إنترلوك", "فرنش تيري"];

  useEffect(() => {
    fetchProducts();
  }, [category, fabric]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (category !== "ALL") params.set("category", category);
      if (fabric !== "ALL") params.set("fabric", fabric);

      const res = await fetch(`/api/products?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setProducts(json.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopBar />
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/" className="hover:text-purple-600">
                الرئيسية
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-semibold">المنتجات الجاهزة</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#0b1320]">
              كتالوج المنتجات الجاهزة للتوريد الفوري بالجملة
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              استكشف بضاعة حاضرة بمخازن مصانع المحلة وشبرا والعاشر بأسعار جملة متدرجة حسب الكمية.
            </p>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => setCategory(c.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                category === c.slug
                  ? "bg-[#542cb7] text-white shadow-sm"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {c.nameAr}
            </button>
          ))}
        </div>

        {/* Search & Fabric Filter */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="ابحث عن منتج: تيشيرت، هودي، بولو، جوارب..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#542cb7]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5" />
          </form>

          <div className="flex items-center gap-2 shrink-0 text-xs">
            <span className="text-slate-500 font-medium">الخامة:</span>
            <select
              value={fabric}
              onChange={(e) => setFabric(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700"
            >
              <option value="ALL">جميع الخامات</option>
              {fabrics.slice(1).map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-[#542cb7] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs">جاري تحميل المنتجات...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">لا توجد منتجات مطابقة</h3>
            <p className="text-slate-500 text-sm mt-1">جرب تغيير القسم أو البحث عن خامة أخرى.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => {
              const bestTier = p.priceTiers[p.priceTiers.length - 1];
              const lowestPrice = bestTier ? bestTier.pricePerPiece : p.basePrice;

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="h-48 bg-slate-100 relative overflow-hidden">
                      <img
                        src={p.images[0] || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400"}
                        alt={p.nameAr}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Factory Badge */}
                      <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur text-slate-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        <Building2 className="w-3 h-3 text-[#542cb7]" />
                        <span>{p.factory.nameAr}</span>
                      </div>

                      {p.priceTiers.length > 0 && (
                        <div className="absolute bottom-2.5 left-2.5 bg-[#542cb7] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                          خصومات كمية
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                        {p.category.nameAr}
                      </span>

                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#542cb7] transition-colors line-clamp-1">
                        {p.nameAr}
                      </h3>

                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        الخامة: {p.fabric} {p.gsm ? `(${p.gsm} GSM)` : ""}
                      </p>

                      <div className="pt-2 flex items-baseline justify-between border-t border-slate-100">
                        <div>
                          <span className="text-xs text-slate-400 block text-[10px]">يبدأ من:</span>
                          <span className="text-base font-black text-[#542cb7]">
                            {lowestPrice} ج.م
                          </span>
                        </div>

                        <div className="text-left">
                          <span className="text-[10px] text-slate-400 block">أقل كمية (MOQ):</span>
                          <span className="text-xs font-bold text-slate-700">{p.moq} قطعة</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <Link
                      href={`/products/${p.id}`}
                      className="w-full bg-purple-50 hover:bg-[#542cb7] text-[#542cb7] hover:text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      <span>تفاصيل المنتج وطلب الشراء</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
