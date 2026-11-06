"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { MessageSquare, ShieldAlert, CheckCircle2, Search, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ConversationItem {
  id: string;
  orderNumber?: string;
  rfqTitle?: string;
  partnerName: string;
  lastMessage: string;
  lastMessageAt: string;
}

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const user = {
    id: "admin",
    name: "إدارة منصة تكس لينك",
    email: "admin@texlink-egypt.com",
    role: "ADMIN" as const,
    isFactory: false,
    isBuyer: true,
  };

  useEffect(() => {
    fetch("/api/conversations")
      .then((res) => res.json())
      .then((data) => {
        if (data.conversations) {
          setConversations(data.conversations);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout user={user} currentRole="ADMIN">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#17233F]">
            سجل المحادثات والرسائل والرقابة
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] mt-1">
            مراقبة الرسائل المتبادلة بين المشترين والمصانع للتحقق من منع التجاوز وحل الخلافات.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#F1F4F9] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#17233F] flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#5932A8]" />
            <span>المحادثات النشطة على المنصة ({conversations.length})</span>
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">جاري تحميل سجل المحادثات...</div>
        ) : conversations.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            لا توجد محادثات مسجلة حالياً.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {conversations.map((c) => (
              <div
                key={c.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <div className="space-y-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">
                      {c.partnerName}
                    </span>
                    {c.orderNumber && (
                      <span className="font-mono text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                        أمر: #{c.orderNumber}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-1">
                    {c.lastMessage}
                  </p>
                </div>

                <Link
                  href={`/messages?id=${c.id}`}
                  target="_blank"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg inline-flex items-center gap-1 shrink-0"
                >
                  <span>فتح نافذة الدردشة</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
