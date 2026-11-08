"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { CheckCircle2, Search, ArrowRight, Eye, ExternalLink } from "lucide-react";
import Link from "next/link";

interface AdminOrder {
  id: string;
  orderNumber: string;
  buyerName: string;
  factoryName: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  unitPrice: number;
  status: string;
  createdAt: string;
  completedMilestonesCount: number;
  totalMilestonesCount: number;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const user = {
    id: "admin",
    name: "إدارة منصة سايسل مصر",
    email: "admin@texlink-egypt.com",
    role: "ADMIN" as const,
    isFactory: false,
    isBuyer: true,
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const json = await res.json();
      if (json.success) {
        setOrders(json.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = orders.filter(
    (o) =>
      o.orderNumber.includes(q) ||
      o.buyerName.includes(q) ||
      o.factoryName.includes(q) ||
      o.productName.includes(q)
  );

  return (
    <DashboardLayout user={user} currentRole="ADMIN">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#17233F]">
            سجل أوامر التصنيع والصفقات المنفذة
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] mt-1">
            متابعة مراحل التنفيذ، قيم التعاقدات المالية، والالتزام بالمواعيد بين المصانع والمشترين.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5EAF2] shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="ابحث برقم الطلب، المصنع، أو المشتري..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl pr-9 pl-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#5932A8]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        <span className="text-xs text-[#718096] font-bold">
          العدد: {filtered.length} أمر تصنيع
        </span>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            جاري تحميل أوامر التصنيع...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            لا توجد أوامر مسجلة حالياً.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E5EAF2] text-[#718096]">
                  <th className="p-3.5 font-bold">رقم الأمر</th>
                  <th className="p-3.5 font-bold">المشتري</th>
                  <th className="p-3.5 font-bold">المصنع المنفذ</th>
                  <th className="p-3.5 font-bold">الكمية</th>
                  <th className="p-3.5 font-bold">إجمالي القيمة</th>
                  <th className="p-3.5 font-bold">المراحل</th>
                  <th className="p-3.5 font-bold">الحالة</th>
                  <th className="p-3.5 font-bold text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F4F9]">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/70">
                    <td className="p-3.5 font-mono font-bold text-[#5932A8]">
                      #{o.orderNumber}
                    </td>
                    <td className="p-3.5 font-bold text-[#17233F]">
                      {o.buyerName}
                    </td>
                    <td className="p-3.5 text-[#17233F]">{o.factoryName}</td>
                    <td className="p-3.5">{o.quantity.toLocaleString()} قطعة</td>
                    <td className="p-3.5 font-black text-emerald-700">
                      {o.totalAmount.toLocaleString()} ج.م
                    </td>
                    <td className="p-3.5">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-mono">
                        {o.completedMilestonesCount} / {o.totalMilestonesCount}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="p-3.5 text-center">
                      <Link
                        href={`/orders/${o.id}`}
                        target="_blank"
                        className="bg-slate-100 hover:bg-slate-200 p-1.5 rounded-lg text-slate-700 inline-flex transition-colors"
                        title="معاينة شاشة الأمر والجدول الزمني"
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
    </DashboardLayout>
  );
}
