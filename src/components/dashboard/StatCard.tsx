import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "purple" | "green" | "blue" | "amber";
  trend?: {
    value: string | number;
    positive?: boolean;
    label?: string;
  };
  sparklineData?: number[];
}

export function StatCard({
  title,
  value,
  icon: Icon,
  variant = "purple",
  trend,
  sparklineData = [12, 18, 14, 22, 19, 28, 24, 32],
}: StatCardProps) {
  const variantStyles = {
    purple: {
      iconBg: "bg-[#F1ECFF]",
      iconColor: "text-[#5932A8]",
      waveStroke: "#5932A8",
    },
    green: {
      iconBg: "bg-[#E8F7F0]",
      iconColor: "text-[#079B62]",
      waveStroke: "#079B62",
    },
    blue: {
      iconBg: "bg-[#EBF3FF]",
      iconColor: "text-[#2563EB]",
      waveStroke: "#2563EB",
    },
    amber: {
      iconBg: "bg-[#FEF3C7]",
      iconColor: "text-[#D97706]",
      waveStroke: "#D97706",
    },
  }[variant];

  // Generate SVG path for mini sparkline
  const max = Math.max(...sparklineData);
  const min = Math.min(...sparklineData);
  const range = max - min || 1;
  const width = 80;
  const height = 28;
  const points = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="bg-white rounded-2xl border border-[#E5EAF2] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-[#718096] block">
            {title}
          </span>
          <h3 className="text-2xl font-black text-[#17233F] tracking-tight">
            {value}
          </h3>
        </div>

        {/* Icon in pastel container */}
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${variantStyles.iconBg} ${variantStyles.iconColor}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#F1F4F9] flex items-center justify-between">
        {trend ? (
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className={`inline-flex items-center gap-0.5 font-bold ${
                trend.positive !== false
                  ? "text-emerald-600"
                  : "text-rose-600"
              }`}
            >
              {trend.positive !== false ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>{trend.value}</span>
            </span>
            <span className="text-slate-400 text-[11px]">
              {trend.label || "مقارنة بالفترة السابقة"}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400">بيانات نشطة</span>
        )}

        {/* Mini sparkline curve matching Dashboard.jpg */}
        <div className="w-20 h-7 overflow-hidden shrink-0">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible"
            fill="none"
          >
            <polyline
              points={points}
              stroke={variantStyles.waveStroke}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
