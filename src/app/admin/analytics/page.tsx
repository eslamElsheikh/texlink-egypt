"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityBarChart, DonutBreakdownChart } from "@/components/dashboard/Charts";
import { BarChart3, TrendingUp, Users, DollarSign, FileText, Building2 } from "lucide-react";

export default function AdminAnalyticsPage() {
  const user = {
    id: "admin",
    name: "إدارة منصة تكس لينك",
    email: "admin@texlink-egypt.com",
    role: "ADMIN" as const,
    isFactory: false,
    isBuyer: true,
  };

  const volumeGrowthData = [
    { label: "الأسبوع 1", value: 24000 },
    { label: "الأسبوع 2", value: 36000 },
    { label: "الأسبوع 3", value: 31000 },
    { label: "الأسبوع 4", value: 48500 },
  ];

  return (
    <DashboardLayout user={user} currentRole="ADMIN">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#17233F]">
            التحليلات ومؤشرات نمو المنصة
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] mt-1">
            مؤشرات نمو المصانع، حجم الصفقات الشهرية، ومعدلات قبول عروض الأسعار.
          </p>
        </div>
      </div>

      {/* Analytics KPI StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="معدل قبول العروض"
          value="64.8%"
          icon={TrendingUp}
          variant="green"
          trend={{ value: "↑ 4.2%", positive: true, label: "هذا الشهر" }}
        />
        <StatCard
          title="متوسط قيمة التعاقد"
          value="42,500 ج.م"
          icon={DollarSign}
          variant="purple"
          trend={{ value: "↑ 8.1%", positive: true, label: "متوسط الـ RFQ" }}
        />
        <StatCard
          title="سرعة رد المصانع"
          value="2.8 ساعة"
          icon={TrendingUp}
          variant="blue"
          trend={{ value: "↓ 25 دقيقة", positive: true, label: "أسرع من المعدل" }}
        />
        <StatCard
          title="نسبة الالتزام بالمواعيد"
          value="97.4%"
          icon={Building2}
          variant="amber"
          trend={{ value: "ممتاز", positive: true, label: "فحص العينات" }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <ActivityBarChart
            title="نمو حجم الصفقات الأسبوعية (EGP)"
            totalDisplay="139,500 ج.م"
            trendText="↑ 16.4% هذا الشهر"
            data={volumeGrowthData}
            accentColor="#5932A8"
          />
        </div>

        <div className="lg:col-span-4">
          <DonutBreakdownChart
            title="توزيع طلبات التصنيع حسب المحافظة"
            totalDisplay="100%"
            totalSubtext="التوزيع الجغرافي"
            segments={[
              { name: "المحلة الكبرى (الغربية)", value: 45, percentage: 45, color: "#5932A8" },
              { name: "شبرا الخيمة (القليوبية)", value: 25, percentage: 25, color: "#079B62" },
              { name: "العاشر من رمضان", value: 18, percentage: 18, color: "#2563EB" },
              { name: "المنوفية وبرج العرب", value: 12, percentage: 12, color: "#D97706" },
            ]}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
