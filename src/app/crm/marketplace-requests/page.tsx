"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  ShoppingBag,
  ExternalLink,
  RefreshCw,
  Clock,
  ArrowRight,
  Users,
  Search,
  CheckCircle2,
  Building,
} from "lucide-react";
import Link from "next/link";

interface MarketplaceRequest {
  id: string;
  titleAr: string;
  productType: string;
  totalQuantity: number;
  fabricDetails: string;
  targetBudgetPerPiece: number | null;
  targetGovernorate: string;
  deadlineDays: number;
  createdAt: string;
  buyer: {
    id: string;
    name: string;
    phone: string;
    buyerProfile?: { companyName: string } | null;
  };
  crmCustomerId?: string | null;
}

export default function CrmMarketplaceRequestsPage() {
  const [requests, setRequests] = useState<MarketplaceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState({
    id: "crm-user",
    name: "إدارة المبيعات",
    email: "elnasr@mahalla-textile.com",
    role: "FACTORY" as const,
    isFactory: true,
    isBuyer: false,
    factorySlug: "el-nasr-tricot",
  });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const [rfqRes, meRes] = await Promise.all([
        fetch("/api/rfqs"),
        fetch("/api/auth/me").catch(() => null),
      ]);
      const json = await rfqRes.json();
      if (rfqRes.ok && json.rfqs) {
        setRequests(json.rfqs);
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
    fetchRequests();
  }, []);

  return (
    <DashboardLayout user={user} currentRole="FACTORY">
      <div className="space-y-6 pb-12 font-sans" dir="rtl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <ShoppingBag className="w-6 h-6" />
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                طلبات سوق تكس لينك المتكاملة مع CRM (Marketplace Requests)
              </h1>
            </div>
            <p className="text-gray-500 text-xs md:text-sm mt-1">
              ربط تلقائي لطلبات الشراء والـ RFQs القادمة من مشترين السوق بحسابات العملاء والفرص البيعية داخل CRM.
            </p>
          </div>

          <button
            onClick={fetchRequests}
            className="p-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl transition"
            title="تحديث"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">طلبات الشراء النشطة من المشترين والبراندات</h2>
            <span className="text-xs text-gray-400">{requests.length} طلبات متاحة</span>
          </div>

          <div className="divide-y divide-gray-100">
            {requests.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-400">لا توجد طلبات شراء متاحة حالياً.</div>
            ) : (
              requests.map((r) => (
                <div
                  key={r.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/70 transition"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                        {r.productType}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">
                        {new Date(r.createdAt).toLocaleDateString("ar-EG")}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-gray-900">{r.titleAr}</h3>

                    <p className="text-xs text-gray-600">
                      المشتري: <strong>{r.buyer?.buyerProfile?.companyName || r.buyer?.name}</strong> •{" "}
                      الكمية: <span className="font-bold font-mono text-gray-900">{r.totalQuantity.toLocaleString()} قطعة</span> •{" "}
                      الخامة: {r.fabricDetails}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Link
                      href={`/rfqs/${r.id}`}
                      className="px-4 py-2 bg-[#5932A8] text-white hover:bg-[#49278f] rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
                    >
                      <span>تقديم عرض أسعار</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
