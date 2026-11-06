"use client";

import React, { useState } from "react";
import { Search, Menu, Repeat } from "lucide-react";
import { NotificationDropdown } from "./NotificationDropdown";
import { DashboardUser } from "./DashboardSidebar";

interface DashboardHeaderProps {
  user: DashboardUser;
  currentRole: "ADMIN" | "FACTORY" | "BUYER";
  onSwitchRole?: (role: "FACTORY" | "BUYER") => void;
  onOpenMobileSidebar?: () => void;
}

export function DashboardHeader({
  user,
  currentRole,
  onSwitchRole,
  onOpenMobileSidebar,
}: DashboardHeaderProps) {
  const [searchVal, setSearchVal] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchVal.trim()) return;
    if (currentRole === "FACTORY") {
      window.location.href = `/factory/rfqs?q=${encodeURIComponent(searchVal.trim())}`;
    } else {
      window.location.href = `/factories?q=${encodeURIComponent(searchVal.trim())}`;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-[#E5EAF2] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Right side: Mobile Menu Button & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
          aria-label="القائمة"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar matching Dashboard.jpg */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <input
            type="text"
            placeholder="ابحث في الطلبات، المنتجات، المصانع..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full bg-[#F5F7FB] border border-[#E5EAF2] text-[#17233F] rounded-xl pr-9 pl-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#5932A8]/20 focus:border-[#5932A8] transition-all"
          />
          <Search className="w-4 h-4 text-[#718096] absolute right-3 top-2.5" />
        </form>
      </div>

      {/* Left side: Role Switcher, Notifications, Profile Avatar */}
      <div className="flex items-center gap-3">
        {/* Quick Role Switcher Chip for multi-role accounts */}
        {user.isFactory && user.isBuyer && currentRole !== "ADMIN" && (
          <div className="hidden sm:flex items-center gap-1.5 bg-[#F5F7FB] border border-[#E5EAF2] p-1 rounded-xl text-xs">
            <span className="text-slate-500 font-bold px-2">الوضع الحالي:</span>
            {currentRole === "BUYER" ? (
              <button
                type="button"
                onClick={() => onSwitchRole?.("FACTORY")}
                className="bg-[#079B62] hover:bg-[#068453] text-white text-[11px] font-bold px-3 py-1 rounded-lg flex items-center gap-1 shadow-sm transition-all"
              >
                <Repeat className="w-3 h-3" />
                <span>التبديل إلى المصنع</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSwitchRole?.("BUYER")}
                className="bg-[#5932A8] hover:bg-[#482888] text-white text-[11px] font-bold px-3 py-1 rounded-lg flex items-center gap-1 shadow-sm transition-all"
              >
                <Repeat className="w-3 h-3" />
                <span>التبديل إلى المشتري</span>
              </button>
            )}
          </div>
        )}

        {/* Notifications Popover */}
        <NotificationDropdown />

        {/* User Mini Avatar */}
        <div className="flex items-center gap-2 pr-2 border-r border-[#E5EAF2]">
          <div className="w-8 h-8 rounded-full bg-purple-100 text-[#5932A8] font-bold text-xs flex items-center justify-center border border-purple-200 shrink-0">
            {user.name.slice(0, 1)}
          </div>
          <span className="text-xs font-bold text-[#17233F] hidden md:inline truncate max-w-[120px]">
            {user.name}
          </span>
        </div>
      </div>
    </header>
  );
}
