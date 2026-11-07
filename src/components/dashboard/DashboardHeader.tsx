"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Menu,
  Repeat,
  User as UserIcon,
  Settings,
  LayoutDashboard,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { NotificationDropdown } from "./NotificationDropdown";
import { DashboardUser } from "./DashboardSidebar";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import Link from "next/link";

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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchVal.trim()) return;
    if (currentRole === "ADMIN") {
      window.location.href = `/admin/rfqs?q=${encodeURIComponent(searchVal.trim())}`;
    } else if (currentRole === "FACTORY") {
      window.location.href = `/factory/rfqs?q=${encodeURIComponent(searchVal.trim())}`;
    } else {
      window.location.href = `/factories?q=${encodeURIComponent(searchVal.trim())}`;
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
    }
  };

  const profileHref =
    currentRole === "ADMIN"
      ? "/admin/profile"
      : currentRole === "FACTORY"
      ? user.factorySlug
        ? `/factories/${user.factorySlug}`
        : "/factory/dashboard"
      : "/buyer/dashboard";

  const settingsHref =
    currentRole === "ADMIN"
      ? "/admin/settings"
      : currentRole === "FACTORY"
      ? "/factory/dashboard"
      : "/buyer/dashboard";

  const dashboardHref =
    currentRole === "ADMIN"
      ? "/admin/dashboard"
      : currentRole === "FACTORY"
      ? "/factory/dashboard"
      : "/buyer/dashboard";

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

      {/* Left side: Workspace Switcher, Role Switcher, Notifications, Profile Menu */}
      <div className="flex items-center gap-3">
        {/* Persistent Workspace Switcher (Factory OS, CRM Sales, Marketplace) */}
        <WorkspaceSwitcher user={user} currentRole={currentRole} variant="header" />

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

        {/* User Account Dropdown Menu */}
        <div className="relative pr-2 border-r border-[#E5EAF2]" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-purple-100 text-[#5932A8] font-bold text-xs flex items-center justify-center border border-purple-200 shrink-0 overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.slice(0, 1)
              )}
            </div>
            <span className="text-xs font-bold text-[#17233F] hidden md:inline truncate max-w-[120px]">
              {user.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Dropdown Popup */}
          {userMenuOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl border border-[#E5EAF2] shadow-xl z-50 py-2 divide-y divide-slate-100 animate-in fade-in duration-150 text-right">
              <div className="p-3 text-right">
                <span className="text-xs font-bold text-slate-900 block truncate">
                  {user.name}
                </span>
                <span className="text-[11px] text-slate-500 block truncate">
                  {user.email}
                </span>
                <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                  currentRole === "FACTORY" && user.verificationStatus !== "VERIFIED"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-purple-50 text-[#5932A8]"
                }`}>
                  {currentRole === "ADMIN"
                    ? "مدير المنصة"
                    : currentRole === "FACTORY"
                    ? user.verificationStatus === "VERIFIED"
                      ? "مصنع معتمد ✓"
                      : "قيد التوثيق ⏳"
                    : "مشتري / براند"}
                </span>
              </div>

              <div className="py-1">
                <Link
                  href={profileHref}
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#5932A8] transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span>الملف الشخصي</span>
                </Link>

                <Link
                  href={settingsHref}
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#5932A8] transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>إعدادات الحساب</span>
                </Link>

                <Link
                  href={dashboardHref}
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#5932A8] transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-400" />
                  <span>لوحة التحكم الرئيسية</span>
                </Link>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
