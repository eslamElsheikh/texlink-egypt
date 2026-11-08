"use client";

import React, { useEffect, useState, use } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  Star,
  Truck,
  ArrowRight,
  ShieldCheck,
  Send,
  AlertCircle,
  Calendar,
  Layers,
} from "lucide-react";
import Link from "next/link";

interface Milestone {
  id: string;
  step: "SAMPLE" | "SAMPLE_APPROVAL" | "PRODUCTION" | "READY" | "SHIPPED" | "DELIVERED";
  titleAr: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  completedAt?: string | null;
  notes?: string | null;
}

interface OrderReview {
  id: string;
  rating: number;
  commentAr: string;
  createdAt: string;
  author: { name: string };
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  totalAmount: number;
  quantity: number;
  unitPrice: number;
  paymentTerms: string;
  status: string;
  agreedDeliveryDate?: string | null;
  isBuyer: boolean;
  isFactory: boolean;
  isAdmin: boolean;
  buyer: {
    id: string;
    name: string;
    phone: string;
    email: string;
    buyerProfile?: { companyName: string; governorate: string };
  };
  factory: {
    id: string;
    nameAr: string;
    slug: string;
    phone: string;
    whatsapp: string;
    address: string;
    city: string;
    governorate: string;
    rating: number;
  };
  rfq?: {
    id: string;
    titleAr: string;
    productType: string;
    fabricDetails: string;
    gsm?: number | null;
  };
  milestones: Milestone[];
  reviews: OrderReview[];
  conversation?: { id: string } | null;
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Review state
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Milestone advance loading
  const [advancingStep, setAdvancingStep] = useState<string | null>(null);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "الطلب غير موجود");
      setOrder(json.order);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل جلب الطلب";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceMilestone = async (
    step: Milestone["step"],
    status: "IN_PROGRESS" | "COMPLETED",
    notes?: string
  ) => {
    setAdvancingStep(step);
    try {
      const res = await fetch(`/api/orders/${id}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step, status, notes }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل تحديث المرحلة");

      fetchOrder();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ";
      alert(msg);
    } finally {
      setAdvancingStep(null);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/orders/${id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: ratingInput, commentAr: commentInput }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل إرسال التقييم");

      setReviewSuccess(true);
      fetchOrder();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ";
      alert(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <TopBar />
        <Header />
        <div className="flex-1 py-32 text-center text-slate-400">
          <div className="w-10 h-10 border-4 border-[#542cb7] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">جاري تحميل أمر التصنيع...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <TopBar />
        <Header />
        <div className="flex-1 max-w-lg mx-auto py-24 text-center px-4">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">أمر التصنيع غير موجود</h2>
          <p className="text-slate-500 text-sm mb-6">{error || "تعذر العثور على الطلب."}</p>
          <Link
            href="/"
            className="bg-[#542cb7] text-white px-6 py-2.5 rounded-xl text-sm font-semibold"
          >
            العودة للرئيسية
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isDelivered = order.status === "DELIVERED";
  const hasReviewed = order.reviews && order.reviews.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopBar />
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {/* Header Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 mb-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono bg-purple-100 text-[#542cb7] font-bold text-xs px-3 py-1 rounded-full">
                #{order.orderNumber}
              </span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  isDelivered
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {isDelivered ? "مكتمل ومستلم" : "أمر تصنيع سارٍ"}
              </span>
            </div>

            <h1 className="text-2xl font-black text-slate-900">
              {order.rfq?.titleAr || `أمر توريد #${order.orderNumber}`}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              المصنع المنفذ: <strong className="text-slate-800">{order.factory.nameAr}</strong> •{" "}
              المشتري: <strong className="text-slate-800">{order.buyer.buyerProfile?.companyName || order.buyer.name}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {order.conversation && (
              <Link
                href={`/messages?id=${order.conversation.id}`}
                className="bg-purple-50 hover:bg-purple-100 text-[#542cb7] font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all border border-purple-200/60"
              >
                <MessageSquare className="w-4 h-4" />
                <span>المحادثة المباشرة</span>
              </Link>
            )}

            <a
              href={`https://wa.me/2${order.factory.whatsapp}?text=${encodeURIComponent(
                `مرحباً، بخصوص أمر التصنيع #${order.orderNumber} من منصة سايسل مصر (Cysle Egypt):`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all"
            >
              <span>واتساب المصنع المباشر</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main 2 Cols: Milestone Tracker */}
          <div className="lg:col-span-2 space-y-6">
            {/* Interactive Timeline Stepper */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 border-b pb-3 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#542cb7]" />
                <span>الجدول الزمني ومراحل الإنتاج والتسليم</span>
              </h2>

              <div className="space-y-6 relative before:absolute before:right-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {order.milestones.map((m, idx) => {
                  const isDone = m.status === "COMPLETED";
                  const isCurrent = m.status === "IN_PROGRESS";

                  return (
                    <div key={m.id} className="relative pr-10 flex flex-col gap-1.5">
                      {/* Step Circle Marker */}
                      <div
                        className={`absolute right-2 -translate-x-1/2 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                          isDone
                            ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                            : isCurrent
                            ? "bg-[#542cb7] text-white ring-4 ring-purple-100 animate-pulse"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {isDone ? "✓" : idx + 1}
                      </div>

                      {/* Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4
                          className={`text-sm font-bold ${
                            isDone
                              ? "text-slate-900"
                              : isCurrent
                              ? "text-[#542cb7]"
                              : "text-slate-400"
                          }`}
                        >
                          {m.titleAr}
                        </h4>

                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            isDone
                              ? "bg-emerald-100 text-emerald-800"
                              : isCurrent
                              ? "bg-purple-100 text-purple-800"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {isDone
                            ? "مكتملة بنجاح"
                            : isCurrent
                            ? "قيد التشغيل الآن"
                            : "في الانتظار"}
                        </span>
                      </div>

                      {m.notes && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          {m.notes}
                        </p>
                      )}

                      {/* Step Advancement Buttons */}
                      <div className="pt-2">
                        {/* Factory actions */}
                        {order.isFactory && isCurrent && (
                          <button
                            onClick={() =>
                              handleAdvanceMilestone(
                                m.step,
                                "COMPLETED",
                                "تم إنجاز المرحلة والانتقال للخطوة التالية بنجاح"
                              )
                            }
                            disabled={advancingStep === m.step}
                            className="bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold px-4 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-all shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>تأكيد إنجاز هذه المرحلة ←</span>
                          </button>
                        )}

                        {/* Buyer action: Sample Approval */}
                        {order.isBuyer && m.step === "SAMPLE_APPROVAL" && isCurrent && (
                          <button
                            onClick={() =>
                              handleAdvanceMilestone(
                                "SAMPLE_APPROVAL",
                                "COMPLETED",
                                "تم اعتماد وفحص عينة ما قبل الإنتاج من قبل المشتري"
                              )
                            }
                            disabled={advancingStep === m.step}
                            className="bg-[#542cb7] hover:bg-[#45209c] text-white text-xs font-bold px-4 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-all shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>اعتماد العينة وبدء تشغيل الكمية</span>
                          </button>
                        )}

                        {/* Buyer action: Delivery Confirmation */}
                        {order.isBuyer && m.step === "DELIVERED" && isCurrent && (
                          <button
                            onClick={() =>
                              handleAdvanceMilestone(
                                "DELIVERED",
                                "COMPLETED",
                                "تم استلام الشحنة وفحص البضاعة بنجاح"
                              )
                            }
                            disabled={advancingStep === m.step}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2 rounded-xl inline-flex items-center gap-2 transition-all shadow-md"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>تأكيد استلام الطلبية بالكامل</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mutual Reviews Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b pb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span>تقييم المعاملة والخدمة</span>
              </h2>

              {order.reviews.length > 0 ? (
                <div className="space-y-3">
                  {order.reviews.map((r) => (
                    <div key={r.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-slate-900">{r.author.name}</span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < r.rating
                                  ? "text-amber-500 fill-amber-500"
                                  : "text-slate-200 fill-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{r.commentAr}</p>
                    </div>
                  ))}
                </div>
              ) : isDelivered && order.isBuyer ? (
                /* Buyer Review Form */
                reviewSuccess ? (
                  <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-center text-xs font-bold">
                    شكراً لتقييمك! تم تسجيل رأيك لدعم مجتمع المصنعين والتجار.
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <p className="text-xs text-slate-600">
                      تم استلام الطلبية بنجاح! شارك تجربتك حول التزام المصنع بالمواصفات والمواعيد وجودة الخامات:
                    </p>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">تقييمك:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            type="button"
                            key={s}
                            onClick={() => setRatingInput(s)}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                s <= ratingInput
                                  ? "text-amber-500 fill-amber-500"
                                  : "text-slate-200 fill-slate-200"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      rows={3}
                      placeholder="اكتب ملاحظاتك وتقييمك لجودة التصنيع والتعامل..."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#542cb7]"
                    ></textarea>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="bg-[#542cb7] hover:bg-[#45209c] text-white text-xs font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submittingReview ? "جاري الحفظ..." : "نشر التقييم"}</span>
                    </button>
                  </form>
                )
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">
                  يتاح تقييم المصنع فور استلام الشحنة بالكامل وتأكيد الاستلام.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar: Unmasked Contact & Order Financials */}
          <div className="space-y-6">
            {/* Direct Contact Card (Unmasked) */}
            <div className="bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm border-b border-emerald-200 pb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>بيانات التواصل المباشر مع المصنع</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">اسم المصنع:</span>
                  <span className="font-bold text-slate-900 text-sm">{order.factory.nameAr}</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">رقم الهاتف المباشر:</span>
                  <a
                    href={`tel:${order.factory.phone}`}
                    className="font-bold text-[#542cb7] text-sm font-sans"
                    dir="ltr"
                  >
                    {order.factory.phone}
                  </a>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">العنوان الدقيق للورشة / المصنع:</span>
                  <span className="font-semibold text-slate-800 leading-relaxed block">
                    {order.factory.address}
                  </span>
                </div>

                <div className="pt-2">
                  <a
                    href={`https://wa.me/2${order.factory.whatsapp}?text=${encodeURIComponent(
                      `مرحباً، أنا مشتري أمر التصنيع #${order.orderNumber}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs shadow-sm transition-all"
                  >
                    <span>فتح محادثة واتساب فورية</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Financial & Terms Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b pb-2">تفاصيل العقد والمواصفات</h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">الكمية الإجمالية:</span>
                  <span className="font-bold text-slate-900">{order.quantity.toLocaleString()} قطعة</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">سعر القطعة المتفق عليه:</span>
                  <span className="font-bold text-[#542cb7] text-sm">{order.unitPrice} ج.م</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-700">إجمالي قيمة الصفقة:</span>
                  <span className="font-black text-slate-900 text-base">{order.totalAmount.toLocaleString()} ج.م</span>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-500 block text-[11px]">شروط الدفع المتفق عليها:</span>
                  <p className="font-semibold text-slate-800 mt-0.5 leading-relaxed bg-slate-50 p-2 rounded-lg">
                    {order.paymentTerms}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
