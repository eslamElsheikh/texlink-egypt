"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import {
  LayoutDashboard,
  Building2,
  FileText,
  Package,
  Layers,
  MessageSquare,
  ShieldCheck,
  PlusCircle,
  Clock,
  CheckCircle2,
  LogOut,
  ChevronDown,
  Repeat,
  ExternalLink,
  Users,
  Star,
  Settings,
  Scale,
} from "lucide-react";

export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "FACTORY" | "BUYER";
  isFactory: boolean;
  isBuyer: boolean;
  factorySlug?: string | null;
}

interface DashboardSidebarProps {
  user: DashboardUser;
  currentRole: "ADMIN" | "FACTORY" | "BUYER";
  onSwitchRole?: (role: "FACTORY" | "BUYER") => void;
  unreadCount?: number;
  onCloseMobile?: () => void;
}

export function DashboardSidebar({
  user,
  currentRole,
  onSwitchRole,
  unreadCount = 0,
  onCloseMobile,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  // Role Accent configuration
  const roleConfig = {
    ADMIN: {
      title: "لوحة تحكم الإدارة",
      badge: "مدير المنصة",
      activeBg: "bg-indigo-50 text-indigo-900 border-r-4 border-r-indigo-700",
      activeIcon: "text-indigo-700",
    },
    FACTORY: {
      title: "لوحة تحكم المصنع",
      badge: "مصنع معتمد",
      activeBg: "bg-[#E8F7F0] text-[#079B62] border-r-4 border-r-[#079B62]",
      activeIcon: "text-[#079B62]",
    },
    BUYER: {
      title: "لوحة تحكم المشتري",
      badge: "مشتري / براند",
      activeBg: "bg-[#F1ECFF] text-[#5932A8] border-r-4 border-r-[#5932A8]",
      activeIcon: "text-[#5932A8]",
    },
  }[currentRole];

  // Navigation Links based on role
  const getNavSections = () => {
    if (currentRole === "ADMIN") {
      return [
        {
          label: "الرئيسية والعمليات",
          items: [
            {
              title: "نظرة عامة",
              href: "/admin/dashboard",
              icon: LayoutDashboard,
            },
            {
              title: "المصانع والتوثيق",
              href: "/admin/factories",
              icon: Building2,
            },
            {
              title: "طلبات الشراء (RFQ)",
              href: "/admin/rfqs",
              icon: FileText,
            },
            {
              title: "أوامر التصنيع والصفقات",
              href: "/admin/orders",
              icon: CheckCircle2,
            },
          ],
        },
        {
          label: "التواصل والمنصة",
          items: [
            {
              title: "الرسائل والبلاغات",
              href: "/messages",
              icon: MessageSquare,
              badge: unreadCount > 0 ? unreadCount : undefined,
            },
            {
              title: "الكتالوج العام",
              href: "/products",
              icon: Package,
            },
            {
              title: "معاينة الموقع الرئيسي",
              href: "/",
              icon: ExternalLink,
            },
          ],
        },
      ];
    }

    if (currentRole === "FACTORY") {
      return [
        {
          label: "إدارة المصنع",
          items: [
            {
              title: "الرئيسية",
              href: "/factory/dashboard",
              icon: LayoutDashboard,
            },
            {
              title: "الطلبات المناسبة (RFQ)",
              href: "/factory/rfqs",
              icon: FileText,
            },
            {
              title: "عروض الأسعار المقدمة",
              href: "/factory/quotes",
              icon: Clock,
            },
            {
              title: "إدارة الإنتاج والطلبات",
              href: "/factory/orders",
              icon: CheckCircle2,
            },
          ],
        },
        {
          label: "الكتالوج والملف",
          items: [
            {
              title: "المنتجات الجاهزة",
              href: "/factory/products",
              icon: Package,
            },
            {
              title: "ملف مصنعي",
              href: user.factorySlug ? `/factories/${user.factorySlug}` : "/factories",
              icon: Building2,
            },
            {
              title: "الرسائل والمحادثات",
              href: "/messages",
              icon: MessageSquare,
              badge: unreadCount > 0 ? unreadCount : undefined,
            },
            {
              title: "الرئيسية للموقع",
              href: "/",
              icon: ExternalLink,
            },
          ],
        },
      ];
    }

    // BUYER Role
    return [
      {
        label: "المشتريات والطلبات",
        items: [
          {
            title: "الرئيسية",
            href: "/buyer/dashboard",
            icon: LayoutDashboard,
          },
          {
            title: "طلباتي (RFQ)",
            href: "/buyer/rfqs",
            icon: FileText,
          },
          {
            title: "نشر طلب تصنيع جديد",
            href: "/rfqs/new",
            icon: PlusCircle,
          },
          {
            title: "عروض الأسعار المستلمة",
            href: "/buyer/quotes",
            icon: Scale,
          },
          {
            title: "متابعة التصنيع والطلبات",
            href: "/buyer/orders",
            icon: CheckCircle2,
          },
        ],
      },
      {
        label: "الاستكشاف والتواصل",
        items: [
          {
            title: "دليل المصانع",
            href: "/factories",
            icon: Building2,
          },
          {
            title: "المنتجات الجاهزة",
            href: "/products",
            icon: Package,
          },
          {
            title: "الرسائل والمحادثات",
            href: "/messages",
            icon: MessageSquare,
            badge: unreadCount > 0 ? unreadCount : undefined,
          },
          {
            title: "الرئيسية للموقع",
            href: "/",
            icon: ExternalLink,
          },
        ],
      },
    ];
  };

  const navSections = getNavSections();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <aside className="w-64 bg-white border-l border-[#E5EAF2] h-full flex flex-col justify-between select-none">
      <div>
        {/* Brand Header matching Dashboard.jpg */}
        <div className="p-5 border-b border-[#F1F4F9] flex items-center justify-between">
          <Logo size="sm" />
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {roleConfig.badge}
          </span>
        </div>

        {/* Navigation Groups */}
        <div className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-190px)]">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <span className="text-[11px] font-bold text-[#A0AEC0] uppercase tracking-wider px-3 block mb-2">
                {section.label}
              </span>

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? roleConfig.activeBg
                        : "text-[#718096] hover:text-[#17233F] hover:bg-[#F5F7FB]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? roleConfig.activeIcon : "text-slate-400"
                        }`}
                      />
                      <span>{item.title}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom User Profile Card & Role Switcher */}
      <div className="p-3 border-t border-[#F1F4F9] bg-[#FDFDFE] space-y-2">
        {/* Multi-role Account Switcher (if user is both Buyer and Factory) */}
        {user.isFactory && user.isBuyer && currentRole !== "ADMIN" && (
          <div className="bg-[#F5F7FB] p-2 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-600 font-bold flex items-center gap-1.5">
              <Repeat className="w-3.5 h-3.5 text-purple-600" />
              <span>التبديل إلى:</span>
            </span>

            {currentRole === "BUYER" ? (
              <button
                type="button"
                onClick={() => onSwitchRole?.("FACTORY")}
                className="bg-[#079B62] hover:bg-[#058051] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors shadow-sm"
              >
                وضع المصنع 🏭
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSwitchRole?.("BUYER")}
                className="bg-[#5932A8] hover:bg-[#482888] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors shadow-sm"
              >
                وضع المشتري 🛍️
              </button>
            )}
          </div>
        )}

        {/* User Card Pill matching Dashboard.jpg */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#E5EAF2]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-[#5932A8] font-bold text-xs flex items-center justify-center shrink-0 border border-purple-200">
              {user.name.slice(0, 1)}
            </div>
            <div className="overflow-hidden text-right">
              <span className="text-xs font-bold text-[#17233F] block truncate">
                {user.name}
              </span>
              <span className="text-[10px] text-[#718096] block truncate">
                {user.email}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="تسجيل الخروج"
            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-50 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
