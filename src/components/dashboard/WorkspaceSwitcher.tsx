"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Factory,
  Users,
  ShoppingBag,
  ChevronDown,
  Check,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";
import { DashboardUser } from "./DashboardSidebar";

export type WorkspaceType = "FACTORY" | "CRM" | "MARKETPLACE" | "ADMIN" | "BUYER";

interface WorkspaceSwitcherProps {
  user: DashboardUser;
  currentRole: "ADMIN" | "FACTORY" | "BUYER";
  variant?: "header" | "sidebar";
}

export function WorkspaceSwitcher({
  user,
  currentRole,
  variant = "header",
}: WorkspaceSwitcherProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determine current active workspace from URL pathname
  let activeWorkspace: WorkspaceType = "FACTORY";
  if (pathname.startsWith("/crm")) {
    activeWorkspace = "CRM";
  } else if (pathname.startsWith("/admin")) {
    activeWorkspace = "ADMIN";
  } else if (pathname.startsWith("/buyer")) {
    activeWorkspace = "BUYER";
  } else if (
    pathname.startsWith("/factory/rfqs") ||
    pathname.startsWith("/factory/quotes") ||
    pathname.startsWith("/factory/orders")
  ) {
    activeWorkspace = "MARKETPLACE";
  } else if (pathname.startsWith("/factory")) {
    activeWorkspace = "FACTORY";
  } else {
    activeWorkspace = currentRole === "ADMIN" ? "ADMIN" : currentRole === "FACTORY" ? "FACTORY" : "BUYER";
  }

  // Define accessible workspaces by role
  const isFactoryUser = user.isFactory || currentRole === "FACTORY" || currentRole === "ADMIN";
  const isAdminUser = currentRole === "ADMIN" || user.role === "ADMIN";

  if (!isFactoryUser && !isAdminUser) {
    // Regular buyers only see Marketplace badge
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-[#5932A8] rounded-xl border border-purple-100 text-xs font-bold">
        <ShoppingBag className="w-4 h-4 text-[#5932A8]" />
        <span>سوق سايسل مصر للمشتريات</span>
      </div>
    );
  }

  let workspaces = [
    {
      id: "FACTORY" as WorkspaceType,
      title: "إدارة المصنع والتشغيل",
      subtitle: "المصنع والماكينات والمخازن",
      href: "/factory/dashboard",
      icon: Factory,
      badge: "Factory OS",
      color: "text-[#079B62]",
      activeBg: "bg-emerald-50 text-[#079B62] border-emerald-300",
      dotColor: "bg-emerald-500",
    },
    {
      id: "CRM" as WorkspaceType,
      title: "إدارة العملاء والمبيعات",
      subtitle: "العملاء، الصفقات، والمتابعات",
      href: "/crm/dashboard",
      icon: Users,
      badge: "CRM Sales",
      color: "text-[#5932A8]",
      activeBg: "bg-purple-50 text-[#5932A8] border-purple-300",
      dotColor: "bg-purple-600",
    },
    {
      id: "MARKETPLACE" as WorkspaceType,
      title: "سوق سايسل مصر B2B",
      subtitle: "طلبات RFQ وصفقات السوق",
      href: "/marketplace/dashboard",
      icon: ShoppingBag,
      badge: "Marketplace",
      color: "text-blue-600",
      activeBg: "bg-blue-50 text-blue-700 border-blue-300",
      dotColor: "bg-blue-600",
    },
  ];

  // If factory disabled marketplace participation, hide Marketplace from switcher
  if (user.marketplaceEnabled === false && !isAdminUser) {
    workspaces = workspaces.filter((w) => w.id !== "MARKETPLACE");
  }
  if (isAdminUser) {
    workspaces.unshift({
      id: "ADMIN" as WorkspaceType,
      title: "لوحة تحكم إدارة المنصة",
      subtitle: "إدارة المصانع، التوثيق، والمشرفين",
      href: "/admin/dashboard",
      icon: Shield,
      badge: "Platform Admin",
      color: "text-indigo-700",
      activeBg: "bg-indigo-50 text-indigo-900 border-indigo-300",
      dotColor: "bg-indigo-600",
    });
  }

  const currentWs = workspaces.find((w) => w.id === activeWorkspace) || workspaces[0];
  const CurrentIcon = currentWs.icon;

  if (variant === "sidebar") {
    return (
      <div className="relative w-full" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition text-right"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${currentWs.activeBg}`}>
              <CurrentIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-gray-400 block tracking-wider uppercase">مساحة العمل</span>
              <p className="text-xs font-black text-gray-900 truncate">{currentWs.title}</p>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl p-1.5 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-1.5 text-[10px] font-extrabold text-gray-400 border-b border-gray-100">
              تبديل مساحة العمل (Workspaces)
            </div>
            {workspaces.map((ws) => {
              const Icon = ws.icon;
              const isActive = ws.id === activeWorkspace;
              return (
                <Link
                  key={ws.id}
                  href={ws.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition ${
                    isActive ? ws.activeBg : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className={`w-4 h-4 ${ws.color}`} />
                    <div>
                      <p className="text-xs font-bold text-gray-900">{ws.title}</p>
                      <p className="text-[10px] text-gray-400 font-normal">{ws.subtitle}</p>
                    </div>
                  </div>
                  {isActive && <Check className="w-4 h-4 text-current shrink-0" />}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Header Variant
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 hover:border-gray-300 shadow-sm transition text-right"
      >
        <span className={`w-2 h-2 rounded-full ${currentWs.dotColor} animate-pulse`} />
        <CurrentIcon className={`w-4 h-4 ${currentWs.color}`} />
        <div className="hidden sm:block text-right">
          <span className="text-[10px] text-gray-400 block font-semibold leading-tight">مساحة العمل</span>
          <span className="text-xs font-extrabold text-gray-900 leading-tight">{currentWs.title}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[10px] font-extrabold text-gray-400 border-b border-gray-100 flex items-center justify-between">
            <span>مساحات العمل المتاحة</span>
            <span className="font-mono text-gray-500">3 Workspaces</span>
          </div>
          {workspaces.map((ws) => {
            const Icon = ws.icon;
            const isActive = ws.id === activeWorkspace;
            return (
              <Link
                key={ws.id}
                href={ws.href}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between p-2.5 rounded-xl transition ${
                  isActive ? ws.activeBg : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-xs">
                    <Icon className={`w-4 h-4 ${ws.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-gray-900">{ws.title}</p>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 font-mono">
                        {ws.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400">{ws.subtitle}</p>
                  </div>
                </div>
                {isActive && <Check className="w-4 h-4 text-current shrink-0" />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
