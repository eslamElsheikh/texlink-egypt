"use client";

import React from "react";
import Link from "next/link";
import { Phone, User, UserPlus } from "lucide-react";

export function TopBar() {
  return (
    <div className="bg-[#0b1320] text-slate-300 text-xs md:text-sm py-2 px-4 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Right side in RTL (Auth links) */}
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
            {/* WhatsApp SVG Icon */}
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
