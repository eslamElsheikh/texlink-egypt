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
  BarChart3,
  User,
  Wrench,
  AlertTriangle,
  Boxes,
  Scissors,
  ShoppingBag,
  DollarSign,
  Truck,
  Cpu,
  Calculator,
  Factory,
  TrendingUp,
  UserPlus,
  CheckSquare,
} from "lucide-react";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string | null;
  role: "ADMIN" | "FACTORY" | "BUYER";
  isFactory: boolean;
  isBuyer: boolean;
  factorySlug?: string | null;
  marketplaceEnabled?: boolean;
  usageMode?: string;
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
      logoHref: "/admin/dashboard",
      profileHref: "/admin/profile",
    },
    FACTORY: {
      title: "لوحة تحكم المصنع",
      badge: "مصنع معتمد",
      activeBg: "bg-[#E8F7F0] text-[#079B62] border-r-4 border-r-[#079B62]",
      activeIcon: "text-[#079B62]",
      logoHref: "/factory/dashboard",
      profileHref: user.factorySlug ? `/factories/${user.factorySlug}` : "/factory/dashboard",
    },
    BUYER: {
      title: "لوحة تحكم المشتري",
      badge: "مشتري / براند",
      activeBg: "bg-[#F1ECFF] text-[#5932A8] border-r-4 border-r-[#5932A8]",
      activeIcon: "text-[#5932A8]",
      logoHref: "/buyer/dashboard",
      profileHref: "/buyer/dashboard",
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
            {
              title: "التحليلات والإحصائيات",
              href: "/admin/analytics",
              icon: BarChart3,
            },
          ],
        },
        {
          label: "إدارة المنصة والتواصل",
          items: [
            {
              title: "التصنيفات والخامات",
              href: "/admin/categories",
              icon: Layers,
            },
            {
              title: "الرسائل والبلاغات",
              href: "/admin/messages",
              icon: MessageSquare,
              badge: unreadCount > 0 ? unreadCount : undefined,
            },
            {
              title: "الملف الشخصي",
              href: "/admin/profile",
              icon: User,
            },
            {
              title: "إعدادات المنصة",
              href: "/admin/settings",
              icon: Settings,
            },
            {
              title: "معاينة الموقع الرئيسي (نافذة جديدة)",
              href: "/",
              icon: ExternalLink,
              external: true,
            },
          ],
        },
      ];
    }

    // 1. CRM Workspace Navigation (/crm/*)
    if (pathname.startsWith("/crm")) {
      return [
        {
          label: "نظرة عامة والصفقات",
          items: [
            {
              title: "لوحة تحكم CRM",
              href: "/crm/dashboard",
              icon: LayoutDashboard,
            },
            {
              title: "خط سير الصفقات (Pipeline)",
              href: "/crm/pipeline",
              icon: TrendingUp,
            },
          ],
        },
        {
          label: "إدارة العملاء والفرص",
          items: [
            {
              title: "العملاء والشركات",
              href: "/crm/customers",
              icon: Users,
            },
            {
              title: "العملاء المحتملون (Leads)",
              href: "/crm/leads",
              icon: UserPlus,
            },
            {
              title: "عروض الأسعار والمقايسات",
              href: "/crm/quotations",
              icon: FileText,
            },
          ],
        },
        {
          label: "المتابعات والتواصل",
          items: [
            {
              title: "المهام والتذكيرات",
              href: "/crm/follow-ups",
              icon: CheckSquare,
            },
            {
              title: "سجل الأنشطة والمكالمات",
              href: "/crm/activities",
              icon: Clock,
            },
            {
              title: "طلبات عملاء السوق",
              href: "/crm/marketplace-requests",
              icon: ShoppingBag,
            },
            {
              title: "المحادثات والرسائل",
              href: "/messages",
              icon: MessageSquare,
              badge: unreadCount > 0 ? unreadCount : undefined,
            },
          ],
        },
        {
          label: "التقارير والإعدادات",
          items: [
            {
              title: "تقارير المبيعات وCRM",
              href: "/crm/reports",
              icon: BarChart3,
            },
            {
              title: "إعدادات CRM",
              href: "/crm/settings",
              icon: Settings,
            },
          ],
        },
      ];
    }

    // 2. Marketplace Workspace Navigation (/marketplace/*, /factory/rfqs, /factory/quotes, /factory/orders)
    if (
      pathname.startsWith("/marketplace") ||
      pathname.startsWith("/factory/rfqs") ||
      pathname.startsWith("/factory/quotes") ||
      pathname.startsWith("/factory/orders")
    ) {
      return [
        {
          label: "سوق تكس لينك التجاري B2B",
          items: [
            {
              title: "لوحة تحكم السوق",
              href: "/marketplace/dashboard",
              icon: LayoutDashboard,
            },
            {
              title: "طلبات الشراء وRFQs",
              href: "/factory/rfqs",
              icon: FileText,
            },
            {
              title: "صفقات وأوامر السوق",
              href: "/factory/orders",
              icon: Truck,
            },
            {
              title: "كتالوج المنتجات الجاهزة",
              href: "/factory/products",
              icon: Package,
            },
            {
              title: "عروض الأسعار المقدمة",
              href: "/factory/quotes",
              icon: Clock,
            },
            {
              title: "دليل مصانع مصر",
              href: "/factories",
              icon: Building2,
            },
            {
              title: "المحادثات والتفاوض",
              href: "/messages",
              icon: MessageSquare,
              badge: unreadCount > 0 ? unreadCount : undefined,
            },
          ],
        },
      ];
    }

    // 3. Factory Management Workspace Navigation (/factory/*)
    if (currentRole === "FACTORY" || pathname.startsWith("/factory")) {
      return [
        {
          label: "التشغيل والإنتاج",
          items: [
            {
              title: "لوحة التحكم التشغيلية",
              href: "/factory/dashboard",
              icon: LayoutDashboard,
            },
            {
              title: "إدارة الإنتاج والتشغيل",
              href: "/factory/production",
              icon: Layers,
            },
            {
              title: "أوامر الإنتاج والدفعات",
              href: "/factory/production-orders",
              icon: CheckCircle2,
            },
            {
              title: "الماكينات والمعدات",
              href: "/factory/machines",
              icon: Cpu,
            },
            {
              title: "الأعطال والصيانة",
              href: "/factory/maintenance",
              icon: Wrench,
            },
            {
              title: "الهالك والفاقد",
              href: "/factory/waste",
              icon: AlertTriangle,
            },
            {
              title: "فحص الجودة",
              href: "/factory/quality",
              icon: ShieldCheck,
            },
          ],
        },
        {
          label: "المخازن وسلاسل الإمداد",
          items: [
            {
              title: "المخازن والخامات",
              href: "/factory/inventory",
              icon: Boxes,
            },
            {
              title: "استهلاك الخامات",
              href: "/factory/material-consumption",
              icon: Scissors,
            },
            {
              title: "الموردون",
              href: "/factory/suppliers",
              icon: ShoppingBag,
            },
            {
              title: "أوامر الشراء والتوريد",
              href: "/factory/purchases",
              icon: Truck,
            },
          ],
        },
        {
          label: "العمالة والتكاليف",
          items: [
            {
              title: "العمال والموظفون",
              href: "/factory/employees",
              icon: Users,
            },
            {
              title: "إدارة الورديات",
              href: "/factory/shifts",
              icon: Clock,
            },
            {
              title: "الحضور والغياب",
              href: "/factory/attendance",
              icon: Clock,
            },
            {
              title: "المصروفات التشغيلية",
              href: "/factory/expenses",
              icon: DollarSign,
            },
            {
              title: "تكاليف أوامر الإنتاج",
              href: "/factory/costs",
              icon: Calculator,
            },
            {
              title: "التقارير والإحصائيات",
              href: "/factory/reports",
              icon: BarChart3,
            },
          ],
        },
        {
          label: "الإعدادات والملف",
          items: [
            {
              title: "ملف المصنع",
              href: "/factory/profile",
              icon: Building2,
            },
            {
              title: "إعدادات المصنع",
              href: "/factory/settings",
              icon: Settings,
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
            title: "معاينة الموقع (نافذة جديدة)",
            href: "/",
            icon: ExternalLink,
            external: true,
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
        {/* Brand Header */}
        <div className="p-4 border-b border-[#F1F4F9] flex items-center justify-between">
          <Logo size="sm" href={roleConfig.logoHref} />
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {roleConfig.badge}
          </span>
        </div>

        {/* Persistent Workspace Switcher (Factory OS / CRM / Marketplace) */}
        <div className="p-3 border-b border-[#F1F4F9]">
          <WorkspaceSwitcher user={user} currentRole={currentRole} variant="sidebar" />
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

                if (item.external) {
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#718096] hover:text-[#17233F] hover:bg-[#F5F7FB] transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span>{item.title}</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  );
                }

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

        {/* User Card Pill linking to Profile */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#E5EAF2] hover:border-purple-300 transition-colors">
          <Link
            href={roleConfig.profileHref}
            className="flex items-center gap-2.5 overflow-hidden flex-1 group"
          >
            <div className="w-8 h-8 rounded-full bg-purple-100 text-[#5932A8] font-bold text-xs flex items-center justify-center shrink-0 border border-purple-200 overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.slice(0, 1)
              )}
            </div>
            <div className="overflow-hidden text-right">
              <span className="text-xs font-bold text-[#17233F] group-hover:text-[#5932A8] transition-colors block truncate">
                {user.name}
              </span>
              <span className="text-[10px] text-[#718096] block truncate">
                {roleConfig.badge}
              </span>
            </div>
          </Link>

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
