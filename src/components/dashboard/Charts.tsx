"use client";

import React, { useState } from "react";

export interface BarDataPoint {
  label: string;
  value: number;
}

interface ActivityBarChartProps {
  title: string;
  totalDisplay: string;
  trendText?: string;
  trendPositive?: boolean;
  data: BarDataPoint[];
  periods?: string[];
  activePeriod?: string;
  onPeriodChange?: (period: string) => void;
  accentColor?: string;
}

export function ActivityBarChart({
  title,
  totalDisplay,
  trendText = "↑ 12.5% مقارنة بالشهر السابق",
  trendPositive = true,
  data,
  periods = ["يومي", "أسبوعي", "شهري", "سنوي"],
  activePeriod = "شهري",
  onPeriodChange,
  accentColor = "#5932A8",
}: ActivityBarChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(activePeriod);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxValue = Math.max(...data.map((d) => d.value), 10);
  const chartHeight = 180;

  const handlePeriod = (p: string) => {
    setSelectedPeriod(p);
    onPeriodChange?.(p);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5EAF2] p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#17233F]">{title}</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#17233F] tracking-tight">
              {totalDisplay}
            </span>
            {trendText && (
              <span
                className={`text-xs font-bold ${
                  trendPositive ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {trendText}
              </span>
            )}
          </div>
        </div>

        {/* Period Selector Pills matching Dashboard.jpg */}
        <div className="flex items-center gap-1 bg-[#F5F7FB] p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          {periods.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handlePeriod(p)}
              className={`px-3 py-1 rounded-lg transition-all ${
                selectedPeriod === p
                  ? "bg-white text-[#17233F] shadow-sm font-bold"
                  : "text-[#718096] hover:text-[#17233F]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Bar Chart */}
      <div className="pt-4 relative">
        {/* Y-Axis Guidelines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-300 pr-1">
          <div className="border-b border-slate-100 w-full"></div>
          <div className="border-b border-slate-100 w-full"></div>
          <div className="border-b border-slate-100 w-full"></div>
          <div className="border-b border-slate-100 w-full"></div>
        </div>

        {/* Bars Container */}
        <div className="flex items-end justify-between gap-1 sm:gap-2 h-48 pt-4 px-2 relative z-10">
          {data.map((item, idx) => {
            const barHeightPct = Math.max(8, (item.value / maxValue) * 100);
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-7 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-20">
                    {item.value.toLocaleString()}
                  </div>
                )}

                {/* The Bar */}
                <div
                  style={{
                    height: `${barHeightPct}%`,
                    backgroundColor: isHovered ? accentColor : "#A5B4FC",
                    opacity: isHovered ? 1 : 0.8,
                  }}
                  className="w-full max-w-[20px] rounded-t-md transition-all duration-300 group-hover:scale-y-105"
                />

                {/* Bottom Label */}
                <span className="text-[10px] text-[#718096] mt-2 block truncate max-w-full">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export interface DonutSegment {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface DonutBreakdownChartProps {
  title: string;
  totalDisplay: string;
  totalSubtext?: string;
  segments: DonutSegment[];
  filterLabel?: string;
}

export function DonutBreakdownChart({
  title,
  totalDisplay,
  totalSubtext = "الإجمالي",
  segments,
  filterLabel = "آخر 30 يوم",
}: DonutBreakdownChartProps) {
  // SVG Donut calculation
  const radius = 60;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <div className="bg-white rounded-2xl border border-[#E5EAF2] p-5 shadow-sm space-y-4 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#F1F4F9] pb-3">
        <h3 className="text-sm font-bold text-[#17233F]">{title}</h3>
        <span className="text-xs text-[#718096] bg-[#F5F7FB] px-2.5 py-1 rounded-lg font-medium">
          {filterLabel}
        </span>
      </div>

      {/* Donut Graphic with center text */}
      <div className="flex items-center justify-center py-2 relative">
        <div className="w-44 h-44 relative flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            {segments.map((seg, i) => {
              const strokeDasharray = `${(seg.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
              accumulatedPercent += seg.percentage;

              return (
                <circle
                  key={i}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500 hover:opacity-85"
                />
              );
            })}
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-base font-black text-[#17233F]">
              {totalDisplay}
            </span>
            <span className="text-[11px] text-[#718096] font-medium">
              {totalSubtext}
            </span>
          </div>
        </div>
      </div>

      {/* Legend Items */}
      <div className="space-y-2 pt-2 border-t border-[#F1F4F9] text-xs">
        {segments.map((seg, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                style={{ backgroundColor: seg.color }}
                className="w-2.5 h-2.5 rounded-full shrink-0"
              />
              <span className="text-[#17233F] font-semibold">{seg.name}</span>
            </div>
            <span className="font-bold text-[#718096]">{seg.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
