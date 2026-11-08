"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  FileText,
  AlertCircle,
  ExternalLink,
  Search,
  Eye,
} from "lucide-react";
import Link from "next/link";

interface FactoryDoc {
  id: string;
  type: string;
  fileName: string;
  fileUrl: string;
  status: string;
}

interface AdminFactory {
  id: string;
  slug: string;
  nameAr: string;
  governorate: string;
  city: string;
  phone: string;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  rejectionReason?: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  documents: FactoryDoc[];
}

export default function AdminFactoriesPage() {
  const [factories, setFactories] = useState<AdminFactory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "VERIFIED" | "REJECTED">("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const user = {
    id: "admin",
    name: "إدارة منصة سايسل مصر",
    email: "admin@texlink-egypt.com",
    role: "ADMIN" as const,
    isFactory: false,
    isBuyer: true,
  };

  useEffect(() => {
    fetchFactories();
  }, []);

  const fetchFactories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/factories");
      const json = await res.json();
      if (json.success) {
        setFactories(json.factories);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string, status: "VERIFIED" | "REJECTED") => {
    let reason: string | undefined;
    if (status === "REJECTED") {
      const input = prompt("يرجى كتابة سبب الرفض لتوضيحه للمصنع:");
      if (!input) return;
      reason = input;
    }

    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/factories/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reason }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل تحديث الحالة");

      // Update state locally
      setFactories((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, verificationStatus: status, rejectionReason: reason } : f
        )
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ";
      alert(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredFactories = factories.filter((f) => {
    if (filter === "ALL") return true;
    return f.verificationStatus === filter;
  });

  const pendingCount = factories.filter((f) => f.verificationStatus === "PENDING").length;

  return (
    <DashboardLayout user={user} currentRole="ADMIN">
      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>لوحة تحكم الإدارة • التحقق من المنشآت</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#17233F]">
            إدارة وتوثيق المصانع المصرية
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] mt-1">
            مراجعة وتدقيق السجلات التجارية والبطاقات الضريبية لمنح شارة التوثيق.
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs px-4 py-2 rounded-xl flex items-center gap-2 font-bold w-fit">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>هناك {pendingCount} مصانع بانتظار المراجعة والاعتماد</span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-[#E5EAF2] pb-3 overflow-x-auto">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            filter === "ALL"
              ? "bg-[#17233F] text-white"
              : "text-[#718096] hover:bg-slate-200"
          }`}
        >
          جميع المصانع ({factories.length})
        </button>
        <button
          onClick={() => setFilter("PENDING")}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
            filter === "PENDING"
              ? "bg-amber-600 text-white"
              : "text-amber-800 bg-amber-50 hover:bg-amber-100"
          }`}
        >
          <span>قيد المراجعة</span>
          <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">
            {pendingCount}
          </span>
        </button>
        <button
          onClick={() => setFilter("VERIFIED")}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            filter === "VERIFIED"
              ? "bg-[#059669] text-white"
              : "text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
          }`}
        >
          المعتمدة (
          {factories.filter((f) => f.verificationStatus === "VERIFIED").length}
          )
        </button>
        <button
          onClick={() => setFilter("REJECTED")}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            filter === "REJECTED"
              ? "bg-rose-600 text-white"
              : "text-rose-800 bg-rose-50 hover:bg-rose-100"
          }`}
        >
          المرفوضة (
          {factories.filter((f) => f.verificationStatus === "REJECTED").length}
          )
        </button>
      </div>

      {/* Factories Table/List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-[#542cb7] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs">جاري تحميل سجلات المصانع...</p>
        </div>
      ) : filteredFactories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5EAF2] p-12 text-center text-slate-500 text-sm">
          لا توجد مصانع في هذا التصنيف حالياً.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFactories.map((factory) => (
            <div
              key={factory.id}
              className="bg-white rounded-2xl border border-[#E5EAF2] p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-slate-300 transition-colors"
            >
              {/* Details */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-[#17233F]">
                    {factory.nameAr}
                  </h3>

                  {factory.verificationStatus === "VERIFIED" && (
                    <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      معتمد رسمياً
                    </span>
                  )}

                  {factory.verificationStatus === "PENDING" && (
                    <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      بانتظار المراجعة
                    </span>
                  )}

                  {factory.verificationStatus === "REJECTED" && (
                    <span className="bg-rose-100 text-rose-800 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-rose-600" />
                      مرفوض
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#718096]">
                  المالك: <span className="font-semibold text-slate-800">{factory.user.name}</span> •{" "}
                  الهاتف: <span className="font-sans" dir="ltr">{factory.phone}</span> •{" "}
                  المحافظة: <span className="text-slate-800 font-medium">{factory.city} - {factory.governorate}</span>
                </p>

                {/* Documents Attached */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-[11px] text-slate-400 font-medium">المستندات المرفقة:</span>
                  {factory.documents.length === 0 ? (
                    <span className="text-[11px] text-slate-400 italic">لا توجد ملفات مرفقة</span>
                  ) : (
                    factory.documents.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-[#542cb7] border border-slate-200 text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors"
                      >
                        <FileText className="w-3 h-3 text-slate-500" />
                        <span>{doc.fileName}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                      </a>
                    ))
                  )}
                </div>

                {factory.rejectionReason && (
                  <p className="text-xs text-rose-700 bg-rose-50 p-2 rounded-lg mt-2">
                    سبب الرفض: {factory.rejectionReason}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                <Link
                  href={`/factories/${factory.slug}`}
                  target="_blank"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-all flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>معاينة الملف</span>
                </Link>

                {factory.verificationStatus !== "VERIFIED" && (
                  <button
                    onClick={() => handleVerify(factory.id, "VERIFIED")}
                    disabled={actionLoading === factory.id}
                    className="bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>اعتماد وتوثيق</span>
                  </button>
                )}

                {factory.verificationStatus !== "REJECTED" && (
                  <button
                    onClick={() => handleVerify(factory.id, "REJECTED")}
                    disabled={actionLoading === factory.id}
                    className="bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 transition-all disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>رفض</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
