"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Users,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface CustomerDetails {
  id: string;
  name: string;
  companyName: string | null;
  email: string | null;
  phone: string;
  whatsapp: string | null;
  governorate: string | null;
  city: string | null;
  address: string | null;
  source: string;
  status: string;
  totalSpend: number;
  ordersCount: number;
  tags: string;
  notes: string | null;
  createdAt: string;
  buyer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  } | null;
  deals: Array<{
    id: string;
    title: string;
    stage: string;
    amount: number;
    createdAt: string;
    rfq?: { titleAr: string } | null;
    order?: { orderNumber: string } | null;
  }>;
  followUps: Array<{
    id: string;
    title: string;
    dueDate: string;
    type: string;
    priority: string;
    status: string;
  }>;
  activities: Array<{
    id: string;
    type: string;
    description: string;
    performedBy: string | null;
    createdAt: string;
  }>;
}

interface MarketplaceActivity {
  orders: Array<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    quantity: number;
    status: string;
    createdAt: string;
  }>;
  quotes: Array<{
    id: string;
    unitPrice: number;
    totalAmount: number;
    status: string;
    createdAt: string;
    rfq: { id: string; titleAr: string; totalQuantity: number };
  }>;
  rfqs: Array<{
    id: string;
    titleAr: string;
    productType: string;
    totalQuantity: number;
    status: string;
    createdAt: string;
  }>;
}

export default function CustomerProfilePage() {
  const params = useParams();
  const id = params?.id as string;

  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [marketplace, setMarketplace] = useState<MarketplaceActivity>({ orders: [], quotes: [], rfqs: [] });
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "MARKETPLACE" | "DEALS" | "FOLLOWUPS" | "TIMELINE">("MARKETPLACE");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [user, setUser] = useState({
    id: "crm-user",
    name: "إدارة المبيعات",
    email: "elnasr@mahalla-textile.com",
    role: "FACTORY" as const,
    isFactory: true,
    isBuyer: false,
    factorySlug: "el-nasr-tricot",
  });

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const [res, meRes] = await Promise.all([
        fetch(`/api/crm/customers/${id}`),
        fetch("/api/auth/me").catch(() => null),
      ]);

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "تعذر تحميل ملف العميل");
      }

      const json = await res.json();
      setCustomer(json.customer);
      if (json.marketplaceActivity) {
        setMarketplace(json.marketplaceActivity);
      }
      if (meRes && meRes.ok) {
        const me = await meRes.json();
        if (me.user) setUser({ ...me.user, role: "FACTORY" });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCustomerDetails();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout user={user} currentRole="FACTORY">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="w-12 h-12 border-4 border-[#5932A8] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium text-sm">جاري تحميل ملف العميل ونشاط السوق التجاري...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !customer) {
    return (
      <DashboardLayout user={user} currentRole="FACTORY">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-lg mx-auto mt-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-red-900 mb-2">تعذر فتح ملف العميل</h2>
          <p className="text-red-700 text-sm mb-6">{error || "العميل غير موجود"}</p>
          <Link
            href="/crm/customers"
            className="px-6 py-2.5 bg-[#5932A8] text-white rounded-xl font-bold text-xs"
          >
            العودة لقائمة العملاء
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} currentRole="FACTORY">
      <div className="space-y-6 pb-12 font-sans" dir="rtl">
        {/* Back navigation & quick actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/crm/customers"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900"
          >
            <span>← العودة لقائمة العملاء</span>
          </Link>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${customer.phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-100 transition"
            >
              <Phone className="w-3.5 h-3.5 text-[#079B62]" />
              <span>اتصال هاتف</span>
            </a>
            {customer.whatsapp && (
              <a
                href={`https://wa.me/${customer.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>واتساب</span>
              </a>
            )}
          </div>
        </div>

        {/* Customer Header Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-[#5932A8] flex items-center justify-center shrink-0 border border-purple-100">
                <Building className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-black text-gray-900">
                    {customer.companyName || customer.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                    {customer.status}
                  </span>
                  {customer.buyer && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3" />
                      مربوط بمشتري تكس لينك B2B
                    </span>
                  )}
                </div>
                {customer.companyName && (
                  <p className="text-xs text-gray-500 font-semibold mt-0.5">
                    مسؤول الاتصال: <strong className="text-gray-800">{customer.name}</strong>
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-3">
                  <span>هاتف: {customer.phone}</span>
                  {customer.email && <span>بريد: {customer.email}</span>}
                  {customer.governorate && <span>الموقع: {customer.governorate}</span>}
                </p>
              </div>
            </div>

            {/* Total spend / orders */}
            <div className="flex items-center gap-4 bg-gray-50 p-3.5 rounded-xl border border-gray-100 self-start md:self-auto">
              <div className="text-right">
                <span className="text-[10px] text-gray-400 block font-bold">إجمالي المشتريات:</span>
                <span className="text-lg font-black text-emerald-700 font-mono">
                  {customer.totalSpend.toLocaleString()} ج.م
                </span>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="text-right">
                <span className="text-[10px] text-gray-400 block font-bold">عدد الطلبات:</span>
                <span className="text-lg font-black text-gray-900 font-mono">
                  {customer.ordersCount} طلب
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab("MARKETPLACE")}
            className={`pb-3 px-4 text-xs font-bold transition whitespace-nowrap border-b-2 flex items-center gap-1.5 ${
              activeTab === "MARKETPLACE"
                ? "border-[#079B62] text-[#079B62]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>نشاط السوق التجاري (Marketplace Activity)</span>
            <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-mono">
              {marketplace.orders.length + marketplace.quotes.length + marketplace.rfqs.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("OVERVIEW")}
            className={`pb-3 px-4 text-xs font-bold transition whitespace-nowrap border-b-2 ${
              activeTab === "OVERVIEW"
                ? "border-[#5932A8] text-[#5932A8]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            نظرة عامة وبيانات العميل
          </button>
          <button
            onClick={() => setActiveTab("DEALS")}
            className={`pb-3 px-4 text-xs font-bold transition whitespace-nowrap border-b-2 ${
              activeTab === "DEALS"
                ? "border-[#5932A8] text-[#5932A8]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            الصفقات والفرص ({customer.deals.length})
          </button>
          <button
            onClick={() => setActiveTab("FOLLOWUPS")}
            className={`pb-3 px-4 text-xs font-bold transition whitespace-nowrap border-b-2 ${
              activeTab === "FOLLOWUPS"
                ? "border-[#5932A8] text-[#5932A8]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            المهام والمتابعات ({customer.followUps.length})
          </button>
          <button
            onClick={() => setActiveTab("TIMELINE")}
            className={`pb-3 px-4 text-xs font-bold transition whitespace-nowrap border-b-2 ${
              activeTab === "TIMELINE"
                ? "border-[#5932A8] text-[#5932A8]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            سجل التفاعلات ({customer.activities.length})
          </button>
        </div>

        {/* TAB 1: MARKETPLACE ACTIVITY (Core Requirement) */}
        {activeTab === "MARKETPLACE" && (
          <div className="space-y-6">
            {/* Orders section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-xs font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#079B62]" />
                  <span>طلبات وصفقات السوق مع هذا العميل ({marketplace.orders.length})</span>
                </h3>
                <Link href="/factory/orders" className="text-xs font-bold text-[#079B62] hover:underline">
                  عرض أوامر السوق ←
                </Link>
              </div>

              <div className="divide-y divide-gray-100">
                {marketplace.orders.length === 0 ? (
                  <p className="p-6 text-center text-xs text-gray-400">لا توجد طلبات سوق مؤكدة من هذا المشتري بعد.</p>
                ) : (
                  marketplace.orders.map((ord) => (
                    <div key={ord.id} className="p-4 flex items-center justify-between text-xs hover:bg-gray-50">
                      <div>
                        <span className="font-bold text-gray-900">أمر شراء #{ord.orderNumber}</span>
                        <span className="text-gray-500 block text-[11px]">
                          الكمية: {ord.quantity.toLocaleString()} قطعة • القيمة: {ord.totalAmount.toLocaleString()} ج.م
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {ord.status}
                        </span>
                        <Link
                          href={`/orders/${ord.id}`}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[10px] font-bold flex items-center gap-1"
                        >
                          <span>فتح الطلب بالسوق</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Submitted Quotes section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-xs font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>عروض الأسعار المقدمة لهذا العميل ({marketplace.quotes.length})</span>
                </h3>
                <Link href="/factory/quotes" className="text-xs font-bold text-blue-600 hover:underline">
                  عرض كل العروض ←
                </Link>
              </div>

              <div className="divide-y divide-gray-100">
                {marketplace.quotes.length === 0 ? (
                  <p className="p-6 text-center text-xs text-gray-400">لا توجد عروض أسعار مقدمة لهذا العميل بعد.</p>
                ) : (
                  marketplace.quotes.map((q) => (
                    <div key={q.id} className="p-4 flex items-center justify-between text-xs hover:bg-gray-50">
                      <div>
                        <span className="font-bold text-gray-900">{q.rfq.titleAr}</span>
                        <span className="text-gray-500 block text-[11px]">
                          السعر المعروض: {q.unitPrice} ج.م/قطعة • الإجمالي: {q.totalAmount.toLocaleString()} ج.م
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          {q.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* RFQs section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-xs font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-purple-600" />
                  <span>طلبات الشراء (RFQ) المنشورة من المشتري ({marketplace.rfqs.length})</span>
                </h3>
              </div>

              <div className="divide-y divide-gray-100">
                {marketplace.rfqs.length === 0 ? (
                  <p className="p-6 text-center text-xs text-gray-400">لا توجد طلبات RFQ مسجلة من هذا المشتري.</p>
                ) : (
                  marketplace.rfqs.map((rfq) => (
                    <div key={rfq.id} className="p-4 flex items-center justify-between text-xs hover:bg-gray-50">
                      <div>
                        <span className="font-bold text-gray-900">{rfq.titleAr}</span>
                        <span className="text-gray-500 block text-[11px]">
                          المنتج: {rfq.productType} • الكمية المطلوبة: {rfq.totalQuantity.toLocaleString()} قطعة
                        </span>
                      </div>
                      <Link
                        href={`/rfqs/${rfq.id}`}
                        className="px-2.5 py-1 bg-purple-50 text-[#5932A8] hover:bg-purple-100 rounded-lg text-[10px] font-bold flex items-center gap-1"
                      >
                        <span>معاينة الطلب</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: OVERVIEW */}
        {activeTab === "OVERVIEW" && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 text-xs">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">بيانات العميل الكاملة</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <span className="text-gray-400 block text-[10px]">الاسم المسؤول:</span>
                <span className="font-bold text-gray-800">{customer.name}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">الشركة / البراند:</span>
                <span className="font-bold text-gray-800">{customer.companyName || "-"}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">رقم الهاتف:</span>
                <span className="font-bold text-gray-800 font-mono">{customer.phone}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">المحافظة والمدينة:</span>
                <span className="font-bold text-gray-800">{customer.governorate || "-"} {customer.city}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">مصدر العميل:</span>
                <span className="font-bold text-gray-800">{customer.source}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">تاريخ الإضافة:</span>
                <span className="font-bold text-gray-800">{new Date(customer.createdAt).toLocaleDateString("ar-EG")}</span>
              </div>
            </div>

            {customer.notes && (
              <div className="pt-3 border-t border-gray-100">
                <span className="text-gray-400 block text-[10px] mb-1">ملاحظات داخلية:</span>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">{customer.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DEALS */}
        {activeTab === "DEALS" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-900">الصفقات والفرص المسجلة مع هذا العميل</h3>
              <Link href="/crm/pipeline" className="text-xs font-bold text-[#5932A8] hover:underline">
                فتح خط سير الصفقات (Pipeline) ←
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {customer.deals.length === 0 ? (
                <p className="p-6 text-center text-xs text-gray-400">لا توجد صفقات مفتوحة مع هذا العميل.</p>
              ) : (
                customer.deals.map((d) => (
                  <div key={d.id} className="p-4 flex items-center justify-between text-xs hover:bg-gray-50">
                    <div>
                      <span className="font-bold text-gray-900">{d.title}</span>
                      <span className="text-gray-500 block text-[11px] font-mono">
                        القيمة: {d.amount.toLocaleString()} ج.م
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                      مرحلة: {d.stage}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: FOLLOWUPS */}
        {activeTab === "FOLLOWUPS" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-900">مهام المتابعة والتذكيرات للعميل</h3>
              <Link href="/crm/follow-ups" className="text-xs font-bold text-[#5932A8] hover:underline">
                إدارة كل المتابعات ←
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {customer.followUps.length === 0 ? (
                <p className="p-6 text-center text-xs text-gray-400">لا توجد مهام متابعة مسجلة.</p>
              ) : (
                customer.followUps.map((fu) => (
                  <div key={fu.id} className="p-4 flex items-center justify-between text-xs hover:bg-gray-50">
                    <div>
                      <span className="font-bold text-gray-900">{fu.title}</span>
                      <span className="text-gray-500 block text-[10px]">
                        النوع: {fu.type} • الموعد: {new Date(fu.dueDate).toLocaleDateString("ar-EG")}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        fu.status === "COMPLETED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {fu.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: TIMELINE */}
        {activeTab === "TIMELINE" && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-2">سجل التفاعلات الزمني</h3>
            <div className="space-y-3">
              {customer.activities.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">لا توجد أنشطة مسجلة لهذا العميل.</p>
              ) : (
                customer.activities.map((act) => (
                  <div key={act.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#5932A8] bg-purple-50 px-2 py-0.5 rounded text-[10px]">
                        {act.type}
                      </span>
                      <span className="text-gray-400 font-mono text-[10px]">
                        {new Date(act.createdAt).toLocaleDateString("ar-EG", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-gray-800">{act.description}</p>
                    {act.performedBy && <p className="text-[10px] text-gray-400">بواسطة: {act.performedBy}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
