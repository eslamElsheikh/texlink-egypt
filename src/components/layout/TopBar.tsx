"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Phone,
  User,
  UserPlus,
  ShieldCheck,
  Building2,
  LogOut,
  MessageSquare,
  LayoutDashboard,
} from "lucide-react";

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: "BUYER" | "FACTORY" | "ADMIN";
  isFactory: boolean;
  isBuyer: boolean;
  factoryProfile?: {
    id: string;
    slug: string;
    nameAr: string;
  } | null;
}

export function TopBar() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch((err) => console.error("Error fetching auth user:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="bg-[#0b1320] text-slate-300 text-xs md:text-sm py-2 px-4 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Right side in RTL (Auth links / User Profile / Dashboard Link) */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-4 w-28 bg-slate-800 animate-pulse rounded"></div>
          ) : user ? (
            <div className="flex items-center gap-2.5">
              {/* 1. ADMIN Dashboard Button */}
              {user.role === "ADMIN" && (
                <Link
                  href="/admin/dashboard"
                  className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 hover:bg-amber-500/30 transition-colors shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>لوحة تحكم الإدارة</span>
                </Link>
              )}

              {/* 2. FACTORY Dashboard Button (Takes factory owner directly to /factory/dashboard) */}
              {user.isFactory && (
                <Link
                  href="/factory/dashboard"
                  className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 hover:bg-emerald-500/30 transition-colors shadow-sm"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
                  <span>لوحة تحكم المصنع</span>
                </Link>
              )}

              {/* 3. BUYER Dashboard Button */}
              {user.isBuyer && !user.isFactory && user.role !== "ADMIN" && (
                <Link
                  href="/buyer/dashboard"
                  className="bg-purple-500/20 text-purple-300 border border-purple-500/40 px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 hover:bg-purple-500/30 transition-colors shadow-sm"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-purple-400" />
                  <span>لوحة تحكم المشتري</span>
                </Link>
              )}

              {/* If dual role (Buyer + Factory): also allow jumping to buyer dashboard */}
              {user.isFactory && user.isBuyer && user.role !== "ADMIN" && (
                <Link
                  href="/buyer/dashboard"
                  className="bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-purple-500/30 transition-colors text-xs"
                  title="التبديل إلى لوحة المشتري"
                >
                  <span>لوحة المشتري 🛍️</span>
                </Link>
              )}

              <Link
                href="/messages"
                className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
                title="الرسائل والمحادثات"
              >
                <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">الرسائل</span>
              </Link>

              <span className="text-slate-600">|</span>

              <span className="flex items-center gap-1.5 text-white font-semibold">
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span>مرحباً، {user.name}</span>
              </span>

              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors mr-1"
                title="تسجيل الخروج"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">خروج</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>تسجيل الدخول</span>
              </Link>
              <span className="text-slate-600">|</span>
              <Link
                href="/register"
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5 text-slate-400" />
                <span>إنشاء حساب جديد</span>
              </Link>
            </div>
          )}
        </div>

        {/* Left side in RTL (Support & WhatsApp) */}
        <div className="flex items-center gap-4">
          <a
            href="tel:01012345678"
            className="flex items-center gap-1.5 hover:text-white transition-colors direction-ltr"
            dir="ltr"
          >
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-sans">010 1234 5678</span>
          </a>

          <a
            href="https://wa.me/201012345678?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20TexLink%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
          >
            <svg
              className="w-4 h-4 fill-current text-[#25D366]"
              viewBox="0 0 24 24"
            >
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.588-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.299.144.35.491 1.199.534 1.286.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.178.181-.077.355.101.173.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086.159.058 1.011.477 1.184.564.173.087.289.13.332.202.043.073.043.419-.101.824z" />
            </svg>
            <span>دعم عبر واتساب</span>
          </a>
        </div>
      </div>
    </div>
  );
}
