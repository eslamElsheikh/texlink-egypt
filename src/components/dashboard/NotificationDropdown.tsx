"use client";

import React, { useEffect, useState, useRef } from "react";
import { Bell, CheckCheck, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";

interface NotificationItem {
  id: string;
  titleAr: string;
  bodyAr: string;
  type: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const json = await res.json();
      if (json.success) {
        setNotifications(json.notifications);
        setUnreadCount(json.unreadCount);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative p-2.5 rounded-xl text-[#718096] hover:text-[#17233F] hover:bg-slate-100 transition-colors"
        aria-label="الإشعارات"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
        )}
      </button>

      {/* Popover Menu */}
      {open && (
        <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-[#E5EAF2] shadow-xl z-50 overflow-hidden animate-in fade-in duration-200">
          <div className="p-4 border-b border-[#F1F4F9] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-[#17233F]">الإشعارات</h4>
              {unreadCount > 0 && (
                <span className="bg-purple-100 text-[#5932A8] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} جديد
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-[#5932A8] hover:underline font-semibold flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>تحديد الكل كمقروء</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 text-right">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                لا توجد إشعارات جديدة حالياً
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 transition-colors ${
                    n.isRead ? "bg-white" : "bg-purple-50/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-xs font-bold text-slate-900 leading-snug">
                      {n.titleAr}
                    </h5>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(n.createdAt).toLocaleDateString("ar-EG")}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    {n.bodyAr}
                  </p>

                  {n.link && (
                    <Link
                      href={n.link}
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5932A8] hover:underline mt-2"
                    >
                      <span>عرض التفاصيل</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
