"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Package, Plus, Search, Eye, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

interface ProductTier {
  id: string;
  minQuantity: number;
  maxQuantity: number | null;
  pricePerPiece: number;
}

interface FactoryProduct {
  id: string;
  nameAr: string;
  descriptionAr: string;
  fabric: string;
  gsm?: number | null;
  basePrice: number;
  moq: number;
  stockQuantity: number;
  isActive: boolean;
  category: { nameAr: string };
  priceTiers: ProductTier[];
}

export default function FactoryProductsPage() {
  const [products, setProducts] = useState<FactoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [nameAr, setNameAr] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [fabric, setFabric] = useState("قطن 100% سينجل جيرسي");
  const [gsm, setGsm] = useState<number | undefined>(180);
  const [basePrice, setBasePrice] = useState(65);
  const [moq, setMoq] = useState(1);
  const [stockQuantity, setStockQuantity] = useState(500);
  const [submitting, setSubmitting] = useState(false);

  const user = {
    id: "factory",
    name: "صاحب المصنع",
    email: "factory@texlink-egypt.com",
    role: "FACTORY" as const,
    isFactory: true,
    isBuyer: true,
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/factory/products");
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

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/factory/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameAr,
          descriptionAr,
          fabric,
          gsm,
          basePrice: Number(basePrice),
          moq: Number(moq),
          stockQuantity: Number(stockQuantity),
          categorySlug: "t-shirts",
          priceTiers: [
            { minQuantity: moq, maxQuantity: moq * 4, pricePerPiece: basePrice },
            { minQuantity: moq * 4 + 1, maxQuantity: null, pricePerPiece: basePrice - 5 },
          ],
        }),
      });

      if (!res.ok) throw new Error("فشل إنشاء المنتج");

      setShowAddModal(false);
      setNameAr("");
      setDescriptionAr("");
      fetchProducts();
    } catch (err) {
      alert("حدث خطأ أثناء إضافة المنتج");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout user={user} currentRole="FACTORY">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#17233F]">
            كتالوج المنتجات الجاهزة للتوريد الفوري
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] mt-1">
            أضف بضاعتك الجاهزة في المخازن مع شرائح أسعار الجملة لجذب المشترين.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="bg-[#079B62] hover:bg-[#068453] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة منتج جاهز جديد</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">جاري تحميل المنتجات...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            لم تضف أي منتجات جاهزة بعد. انقر على "إضافة منتج جاهز" لعرض بضاعتك.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E5EAF2] text-[#718096]">
                  <th className="p-3.5 font-bold">المنتج</th>
                  <th className="p-3.5 font-bold">القسم</th>
                  <th className="p-3.5 font-bold">الخامة</th>
                  <th className="p-3.5 font-bold">السعر الأساسي</th>
                  <th className="p-3.5 font-bold">أقل كمية (MOQ)</th>
                  <th className="p-3.5 font-bold">المخزون المتاح</th>
                  <th className="p-3.5 font-bold text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F4F9]">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="p-3.5 font-bold text-[#17233F]">
                      {p.nameAr}
                    </td>
                    <td className="p-3.5 text-[#718096]">{p.category?.nameAr || "ملابس"}</td>
                    <td className="p-3.5 text-[#718096]">{p.fabric}</td>
                    <td className="p-3.5 font-black text-[#079B62]">
                      {p.basePrice} ج.م
                    </td>
                    <td className="p-3.5">{p.moq} قطعة</td>
                    <td className="p-3.5 font-bold text-slate-800">{p.stockQuantity} قطعة</td>
                    <td className="p-3.5 text-center">
                      <Link
                        href={`/products/${p.id}`}
                        target="_blank"
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 rounded-lg inline-flex"
                        title="معاينة المنتج"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl space-y-4 text-right">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2">
              إضافة منتج جاهز جديد في المخزن
            </h3>

            <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المنتج *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تيشيرت صيفي قطن 100% سينجل جيرسي"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#079B62]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">وصف المنتج ومميزاته *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="مواصفات الخياطة، الألوان، جودة الصباغة..."
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#079B62]"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الخامة *</label>
                  <input
                    type="text"
                    required
                    value={fabric}
                    onChange={(e) => setFabric(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#079B62]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الجراماج (GSM)</label>
                  <input
                    type="number"
                    value={gsm || ""}
                    onChange={(e) => setGsm(parseInt(e.target.value) || undefined)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#079B62]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">السعر (ج.م) *</label>
                  <input
                    type="number"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#079B62] focus:outline-none focus:ring-2 focus:ring-[#079B62]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الحد الأدنى (MOQ) *</label>
                  <input
                    type="number"
                    required
                    value={moq}
                    onChange={(e) => setMoq(parseInt(e.target.value) || 10)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#079B62]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المخزون المتاح *</label>
                  <input
                    type="number"
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(parseInt(e.target.value) || 100)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#079B62]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#079B62] hover:bg-[#068453] text-white px-5 py-2 rounded-xl text-xs font-bold shadow"
                >
                  {submitting ? "جاري الإضافة..." : "حفظ ونشر في الكتالوج"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
