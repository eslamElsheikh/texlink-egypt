import React from "react";

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E5EAF2] p-5 shadow-sm animate-pulse space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-3 w-20 bg-slate-200 rounded"></div>
          <div className="h-7 w-28 bg-slate-300 rounded"></div>
        </div>
        <div className="w-11 h-11 bg-slate-200 rounded-xl"></div>
      </div>
      <div className="h-4 w-36 bg-slate-200 rounded pt-2"></div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5EAF2] p-5 shadow-sm animate-pulse space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="h-5 w-32 bg-slate-200 rounded"></div>
        <div className="h-8 w-44 bg-slate-200 rounded-xl"></div>
      </div>
      <div className="space-y-3">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
            <div className="h-4 w-40 bg-slate-200 rounded"></div>
            <div className="h-4 w-24 bg-slate-200 rounded"></div>
            <div className="h-4 w-16 bg-slate-200 rounded-full"></div>
            <div className="h-4 w-20 bg-slate-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
