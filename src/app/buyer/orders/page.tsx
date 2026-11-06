"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Truck, CheckCircle2, Clock, ArrowRight, Eye, Phone } from "lucide-react";
import Link from "next/link";

interface BuyerOrder {
  id: string;
  orderNumber: string;
  factoryName: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  status: string;
  completedMilestonesCount: number;
  totalMilestonesCount: number;
}

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<BuyerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const user = {
    id: "buyer",
    name: "مشتري معتمد",
    email: "buyer@texlink-egypt.com",
    role: "BUYER" as const,
    isFactory: true,
    isBuyer: true,
  };

  useEffect(() => {
    fetch("/api/buyer/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.activeOrders) {
          setOrders(data.activeOrders);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout user={user} currentRole="BUYER">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#17233F]">
            متابعة تشغيل وتوريد أوامر التصنيع
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] mt-1">
            تابع مراحل إعداد العينة والإنتاج الفعلي والشحن وتأكيد الاستلام مع المصانع.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">جاري تحميل أوامرك...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            لا توجد أوامر تشغيل حالية.
          </div>
        ) : (
          <div className="divide-y divide-[#F1F4F9]">
            {orders.map((o) => (
              <div key={o.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#5932A8]">
                      #{o.orderNumber}
                    </span>
                    <StatusBadge status={o.status} />
                  </div>

                  <h3 className="text-sm font-bold text-[#17233F]">
                    {o.productName}
                  </h3>

                  <p className="text-xs text-[#718096]">
                    المصنع: <strong className="text-slate-800">{o.factoryName}</strong> • الكمية: {o.quantity.toLocaleString()} قطعة • القيمة: {o.totalAmount.toLocaleString()} ج.م
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">المراحل المكتملة:</span>
                    <span className="text-xs font-bold text-[#5932A8]">
                      {o.completedMilestonesCount} من {o.totalMilestonesCount} مراحل
                    </span>
                  </div>

                  <Link
                    href={`/orders/${o.id}`}
                    className="bg-[#5932A8] hover:bg-[#482888] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <span>لوحة تتبع ومراحل الشحنة</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
