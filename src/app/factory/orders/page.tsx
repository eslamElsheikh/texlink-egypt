"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Eye,
  Phone,
  Layers,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface B2BOrder {
  id: string;
  orderNumber: string;
  buyerName: string;
  buyerPhone: string;
  productName: string;
  fabric: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: string;
  agreedDeliveryDate: string | null;
  createdAt: string;
  isConvertedToProduction: boolean;
  productionOrderId: string | null;
  productionOrderStatus: string | null;
}

export default function FactoryOrdersPage() {
  const [orders, setOrders] = useState<B2BOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [user, setUser] = useState({
    id: "factory-user",
    name: "إدارة المصنع",
    email: "elnasr@mahalla-textile.com",
    role: "FACTORY" as const,
    isFactory: true,
    isBuyer: false,
    factorySlug: "el-nasr-tricot",
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const [res, meRes] = await Promise.all([
        fetch("/api/factory/orders"),
        fetch("/api/auth/me").catch(() => null),
      ]);
      const json = await res.json();
      if (res.ok && json.orders) {
        setOrders(json.orders);
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
    fetchOrders();
  }, []);

  const handleConvertToProduction = async (orderId: string) => {
    try {
      setConvertingId(orderId);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await fetch("/api/factory/orders/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, priority: "HIGH" }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل تحويل الطلب");

      setSuccessMsg(json.message || "تم تحويل الطلب بنجاح إلى أمر تشغيل صناعي في Factory OS ✓");
      fetchOrders();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "حدث خطأ أثناء التحويل");
    } finally {
      setConvertingId(null);
    }
  };

  return (
    <DashboardLayout user={user} currentRole="FACTORY">
      <div className="space-y-6 pb-12 font-sans" dir="rtl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-50 text-[#079B62] rounded-xl">
                <Truck className="w-6 h-6" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-[#17233F]">
                صفقات سوق تكس لينك وأوامر التوريد B2B
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#718096] mt-1">
              متابعة طلبات المشترين المعتمدة، وتحويل الصفقات مباشرة بضغطة زر إلى أوامر إنتاج صناعية في خطوط التشغيل.
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="p-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl transition"
            title="تحديث"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <Link
              href="/factory/production-orders"
              className="text-xs font-bold text-emerald-800 underline hover:text-emerald-900"
            >
              عرض أوامر الإنتاج ←
            </Link>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Orders List */}
        <div className="bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">جاري تحميل صفقات السوق...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              لا توجد صفقات مؤكدة حالياً في السوق التجاري.
            </div>
          ) : (
            <div className="divide-y divide-[#F1F4F9]">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#5932A8]">
                        #{o.orderNumber}
                      </span>
                      <StatusBadge status={o.status} />
                      {o.isConvertedToProduction && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-[#5932A8]">
                          <Layers className="w-3 h-3" />
                          محول للتشغيل الصناعي ✓
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-[#17233F]">
                      {o.productName}
                    </h3>

                    <p className="text-xs text-[#718096]">
                      المشتري: <strong className="text-slate-800">{o.buyerName}</strong> • الكمية:{" "}
                      <span className="font-bold text-gray-900">{o.quantity.toLocaleString()} قطعة</span> • القيمة:{" "}
                      <span className="font-bold text-emerald-700 font-mono">
                        {o.totalAmount.toLocaleString()} ج.م
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* One-Click Convert Button */}
                    {!o.isConvertedToProduction ? (
                      <button
                        onClick={() => handleConvertToProduction(o.id)}
                        disabled={convertingId === o.id}
                        className="bg-[#5932A8] hover:bg-[#49278f] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                      >
                        <Sparkles className="w-4 h-4 text-purple-300" />
                        <span>{convertingId === o.id ? "جاري التحويل..." : "تحويل لأمر إنتاج صناعي"}</span>
                      </button>
                    ) : (
                      <Link
                        href="/factory/production-orders"
                        className="bg-purple-50 hover:bg-purple-100 text-[#5932A8] border border-purple-200 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all"
                      >
                        <Layers className="w-4 h-4" />
                        <span>عرض في أوامر الإنتاج</span>
                      </Link>
                    )}

                    <Link
                      href={`/orders/${o.id}`}
                      className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-bold px-3 py-2.5 rounded-xl flex items-center gap-1.5 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>تفاصيل الصفقة</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
