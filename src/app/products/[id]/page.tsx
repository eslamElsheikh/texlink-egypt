"use client";

import React, { useEffect, useState, use } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Package,
  Building2,
  MapPin,
  Star,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Truck,
  Send,
  AlertCircle,
  Layers,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PriceTier {
  id: string;
  minQuantity: number;
  maxQuantity: number | null;
  pricePerPiece: number;
}

interface ProductDetail {
  id: string;
  nameAr: string;
  descriptionAr: string;
  fabric: string;
  gsm?: number | null;
  colors: string[];
  sizes: string[];
  moq: number;
  leadTimeDays: number;
  stockQuantity: number;
  basePrice: number;
  images: string[];
  factory: {
    id: string;
    nameAr: string;
    slug: string;
    governorate: string;
    rating: number;
    reviewCount: number;
    logoUrl?: string;
  };
  category: {
    nameAr: string;
    slug: string;
  };
  priceTiers: PriceTier[];
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Order form state
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [deliveryAddress, setDeliveryAddress] = useState<string>("القاهرة - مدينة نصر");
  const [notes, setNotes] = useState<string>("");
  const [ordering, setOrdering] = useState(false);
  const [orderError, setOrderError] = useState("");

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "المنتج غير موجود");
      setProduct(json.product);
      setQuantity(Math.max(1, json.product.moq || 1));
      if (json.product.colors?.[0]) setSelectedColor(json.product.colors[0]);
      if (json.product.sizes?.[0]) setSelectedSize(json.product.sizes[0]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل جلب المنتج";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Calculate live tiered price
  const calculateTierPrice = (qty: number): number => {
    if (!product) return 0;
    if (!product.priceTiers || product.priceTiers.length === 0) {
      return product.basePrice;
    }

    for (const tier of product.priceTiers) {
      if (
        qty >= tier.minQuantity &&
        (tier.maxQuantity === null || qty <= tier.maxQuantity)
      ) {
        return tier.pricePerPiece;
      }
    }

    return product.basePrice;
  };

  const currentUnitPrice = calculateTierPrice(quantity);
  const totalAmount = currentUnitPrice * quantity;

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    const minAllowed = Math.max(1, product.moq || 1);
    if (quantity < minAllowed) {
      setOrderError(`الحد الأدنى لطلب هذا المنتج هو ${minAllowed} قطعة`);
      return;
    }
    setOrderError("");
    setOrdering(true);

    try {
      const res = await fetch(`/api/products/${product.id}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity,
          selectedColors: selectedColor,
          selectedSizes: selectedSize,
          deliveryAddress,
          notes,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل إرسال طلب الشراء");

      router.push(`/orders/${json.order.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء الطلب";
      setOrderError(msg);
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <TopBar />
        <Header />
        <div className="flex-1 py-32 text-center text-slate-400">
          <div className="w-10 h-10 border-4 border-[#542cb7] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">جاري تحميل بيانات المنتج...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <TopBar />
        <Header />
        <div className="flex-1 max-w-lg mx-auto py-24 text-center px-4">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">المنتج غير موجود</h2>
          <p className="text-slate-500 text-sm mb-6">{error || "تعذر العثور على المنتج المطلوب."}</p>
          <Link
            href="/products"
            className="bg-[#542cb7] text-white px-6 py-2.5 rounded-xl text-sm font-semibold"
          >
            العودة لكتالوج المنتجات
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        <div className="mb-4">
          <Link
            href="/products"
            className="text-xs font-semibold text-slate-500 hover:text-[#542cb7] flex items-center gap-1 transition-colors w-fit"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة لكتالوج المنتجات</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Right 7 Cols: Images & Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="h-80 sm:h-96 bg-slate-100 overflow-hidden relative">
                <img
                  src={product.images[0] || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800"}
                  alt={product.nameAr}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 md:p-8 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="bg-purple-50 text-[#542cb7] text-xs font-bold px-3 py-1 rounded-full">
                    {product.category.nameAr}
                  </span>
                  <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    بضاعة حاضرة بالمخزن
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
                  {product.nameAr}
                </h1>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {product.descriptionAr}
                </p>

                {/* Specs Details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">نوع القماش:</span>
                    <span className="font-bold text-slate-800">{product.fabric}</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">وزن الخامة:</span>
                    <span className="font-bold text-slate-800">{product.gsm ? `${product.gsm} GSM` : "قياسي"}</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">مدة التجهيز للشحن:</span>
                    <span className="font-bold text-slate-800">خلال {product.leadTimeDays} أيام</span>
                  </div>
                </div>

                {/* Colors & Sizes Badges */}
                <div className="space-y-3 pt-4 border-t border-slate-100 text-xs">
                  <div>
                    <span className="font-bold text-slate-700 block mb-1.5">الألوان المتاحة:</span>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((c, i) => (
                        <span key={i} className="bg-slate-100 text-slate-800 px-3 py-1 rounded-lg font-medium">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-slate-700 block mb-1.5">المقاسات المتوفرة:</span>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((s, i) => (
                        <span key={i} className="bg-purple-50 text-purple-800 border border-purple-200/60 px-3 py-1 rounded-lg font-bold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Factory Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                  <img
                    src={product.factory.logoUrl || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=150"}
                    alt={product.factory.nameAr}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{product.factory.nameAr}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1 font-bold text-slate-800">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {product.factory.rating.toFixed(1)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#542cb7]" />
                      {product.factory.governorate}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href={`/factories/${product.factory.slug}`}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2 rounded-xl transition-colors shrink-0"
              >
                زيارة المصنع
              </Link>
            </div>
          </div>

          {/* Left 5 Cols: Price Tiers & Order Form */}
          <div className="lg:col-span-5 space-y-6">
            {/* Price Tiers Table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="border-b pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#542cb7]" />
                  <span>شرائح أسعار الجملة حسب الكمية</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  كلما زادت الكمية، انخفض سعر القطعة تلقائياً.
                </p>
              </div>

              <div className="divide-y divide-slate-100 border rounded-xl overflow-hidden text-xs">
                {product.priceTiers.map((tier) => {
                  const isCurrent =
                    quantity >= tier.minQuantity &&
                    (tier.maxQuantity === null || quantity <= tier.maxQuantity);

                  return (
                    <div
                      key={tier.id}
                      className={`p-3.5 flex items-center justify-between transition-colors ${
                        isCurrent
                          ? "bg-purple-100/70 border-r-4 border-r-[#542cb7] font-bold"
                          : "bg-white"
                      }`}
                    >
                      <span className="text-slate-800">
                        {tier.minQuantity}
                        {tier.maxQuantity ? ` - ${tier.maxQuantity}` : "+"} قطعة
                      </span>
                      <span className="text-sm font-black text-[#542cb7]">
                        {tier.pricePerPiece} ج.م <span className="text-[10px] font-normal text-slate-500">/ قطعة</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Direct Order Form */}
            <form
              onSubmit={handleOrderSubmit}
              className="bg-white rounded-2xl border-2 border-purple-200 p-6 shadow-md space-y-4"
            >
              <div className="border-b pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#059669]" />
                  <span>طلب توريد فوري من المصنع</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  أدخل الكمية المطلوبة وتفاصيل الشحن لبدء أمر التوريد.
                </p>
              </div>

              {orderError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{orderError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الكمية المطلوبة (الحد الأدنى {product.moq} قطعة) *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={Math.max(1, product.moq || 1)}
                    step={1}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || product.moq || 1))}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#542cb7]"
                  />
                  <div className="bg-purple-50 text-[#542cb7] border border-purple-200 px-3 py-2.5 rounded-xl font-bold text-xs shrink-0">
                    {currentUnitPrice} ج.م للقطعة
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اللون المفضل</label>
                  <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#542cb7]"
                  >
                    {product.colors.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المقاس</label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#542cb7]"
                  >
                    {product.sizes.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  مكان الاستلام / عنوان التوصيل *
                </label>
                <input
                  type="text"
                  required
                  placeholder="المحافظة، المدينة، اسم المحل أو المخزن"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#542cb7]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ملاحظات للمصنع (اختياري)
                </label>
                <textarea
                  rows={2}
                  placeholder="توزيع الألوان أو مواعيد محددة للاستلام..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#542cb7]"
                ></textarea>
              </div>

              {/* Total Summary */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">إجمالي قيمة التوريد:</span>
                  <span className="text-xl font-black text-slate-900">
                    {totalAmount.toLocaleString()} ج.م
                  </span>
                </div>

                <div className="text-left text-[11px] text-slate-500">
                  <span>الدفع عند الاستلام</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={ordering}
                className="w-full bg-[#542cb7] hover:bg-[#45209c] text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all hover:shadow-lg disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{ordering ? "جاري إنشاء أمر التوريد..." : "إرسال طلب الشراء للمصنع الآن"}</span>
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
