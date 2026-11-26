"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  ShoppingBag,
  FileText,
  Truck,
  Package,
  Clock,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Building2,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

interface MarketplaceData {
  factory: {
    id: string;
    nameAr: string;
    slug: string;
  };
  kpis: {
    openRfqsCount: number;
    submittedQuotesCount: number;
    acceptedQuotesCount: number;
    pendingQuotesCount: number;
    marketplaceOrdersCount: number;
    totalMarketplaceVolume: number;
    catalogProductsCount: number;
  };
  recentRfqs: Array<{
    id: string;
    titleAr: string;
    productType: string;
    totalQuantity: number;
    targetGovernorate: string;
    deadlineDays: number;
    buyer: {
      name: string;
      buyerProfile?: { companyName: string } | null;
    };
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    quantity: number;
    totalAmount: number;
    status: string;
    buyer: { name: string };
  }>;
}

export default function MarketplaceDashboardPage() {
  const [data, setData] = useState<MarketplaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [user, setUser] = useState({
    id: "marketplace-user",
    name: "إدارة مبيعات السوق",
    email: "",
    role: "FACTORY" as const,
    isFactory: true,
    isBuyer: false,
    factorySlug: "",
  });

  useEffect(() => {
    fetch("/api/marketplace/dashboard")
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || "غير مصرح بالوصول إلى لوحة السوق التجاري");
          return;
        }
        if (json.kpis) setData(json);
      })
      .catch((err) => {
        console.error(err);
        setError("تعذر تحميل بيانات السوق التجاري");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout user={user} currentRole="FACTORY">
      <div className="space-y-6 pb-12 font-sans" dir="rtl">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-[#14264A] via-[#1e3a6d] to-[#1e5aa0] text-white p-6 md:p-8 shadow-sm">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium text-blue-200 border border-white/15">
                <ShoppingBag className="w-3.5 h-3.5 text-blue-300" />
                سوق سايسل مصر التجاري B2B (Marketplace Workspace)
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                لوحة صفقات وعروض السوق التجاري
              </h1>
              <p className="text-white/80 text-xs md:text-sm max-w-xl">
                استقبال طلبات الشراء (RFQ)، تقديم عروض الأسعار للمشترين، وإدارة صفقات التوريد بالجملة.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/factory/rfqs"
                className="px-5 py-2.5 bg-[#079B62] hover:bg-[#068453] text-white rounded-xl font-bold text-xs shadow-sm transition"
              >
                تصفح طلبات RFQ المطابقة
              </Link>
            </div>
          </div>
        </div>

        {/* Error banner for MANAGEMENT_ONLY / unverified / unauthorized */}
        {error && !loading && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl text-sm font-semibold">
            {error}
          </div>
        )}

        {/* KPIs */}
        {data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs font-medium text-gray-500">طلبات الشراء المتاحة (RFQ)</p>
              <p className="text-2xl font-black text-blue-600 mt-1">{data.kpis.openRfqsCount}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs font-medium text-gray-500">عروض الأسعار المقدمة</p>
              <p className="text-2xl font-black text-[#5932A8] mt-1">{data.kpis.submittedQuotesCount}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs font-medium text-gray-500">العروض المقبولة</p>
              <p className="text-2xl font-black text-emerald-700 mt-1">{data.kpis.acceptedQuotesCount}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs font-medium text-gray-500">حجم تعاملات السوق</p>
              <p className="text-2xl font-black text-gray-900 mt-1 font-mono">
                {data.kpis.totalMarketplaceVolume.toLocaleString()} ج.م
              </p>
            </div>
          </div>
        )}

        {/* 2-Column Section */}
        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent RFQs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>أحدث طلبات الشراء المناسبة للمصنع</span>
                </h3>
                <Link href="/factory/rfqs" className="text-xs font-bold text-blue-600 hover:underline">
                  عرض الكل ←
                </Link>
              </div>

              <div className="divide-y divide-gray-100">
                {data.recentRfqs.map((rfq) => (
                  <div key={rfq.id} className="p-4 flex items-center justify-between text-xs hover:bg-gray-50">
                    <div>
                      <span className="font-bold text-gray-900 block">{rfq.titleAr}</span>
                      <span className="text-gray-500 text-[11px]">
                        الكمية: {rfq.totalQuantity.toLocaleString()} قطعة • {rfq.targetGovernorate}
                      </span>
                    </div>
                    <Link
                      href={`/rfqs/${rfq.id}`}
                      className="px-3 py-1.5 bg-[#079B62] text-white rounded-lg text-[10px] font-bold hover:bg-[#068453]"
                    >
                      تقديم عرض
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Marketplace Orders */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#5932A8]" />
                  <span>أحدث صفقات وأوامر السوق</span>
                </h3>
                <Link href="/factory/orders" className="text-xs font-bold text-[#5932A8] hover:underline">
                  عرض الصفقات ←
                </Link>
              </div>

              <div className="divide-y divide-gray-100">
                {data.recentOrders.map((o) => (
                  <div key={o.id} className="p-4 flex items-center justify-between text-xs hover:bg-gray-50">
                    <div>
                      <span className="font-bold text-gray-900 block">أمر توريد #{o.orderNumber}</span>
                      <span className="text-gray-500 text-[11px]">
                        المشتري: {o.buyer.name} • القيمة: {o.totalAmount.toLocaleString()} ج.م
                      </span>
                    </div>
                    <Link
                      href="/factory/orders"
                      className="px-3 py-1.5 bg-purple-50 text-[#5932A8] border border-purple-200 rounded-lg text-[10px] font-bold"
                    >
                      تفاصيل الأمر
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
