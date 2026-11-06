"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  MessageSquare,
  Send,
  ShieldCheck,
  ShieldAlert,
  Building2,
  Clock,
  ArrowRight,
  Lock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface ConversationSummary {
  id: string;
  orderNumber?: string;
  rfqTitle?: string;
  partnerName: string;
  lastMessage: string;
  lastMessageAt: string;
  hasActiveOrder: boolean;
}

interface MessageItem {
  id: string;
  senderId: string;
  senderName: string;
  isMe: boolean;
  content: string;
  containsContactInfo: boolean;
  isMasked: boolean;
  createdAt: string;
}

interface ActiveConversation {
  id: string;
  partnerName: string;
  isContactAllowed: boolean;
  orderId?: string | null;
  orderNumber?: string | null;
  rfqTitle?: string | null;
  messages: MessageItem[];
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const initialConvId = searchParams.get("id");

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(initialConvId);
  const [activeConv, setActiveConv] = useState<ActiveConversation | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConvId) {
      fetchActiveConversation(activeConvId);
    }
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages]);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/conversations");
      const json = await res.json();
      if (json.success) {
        setConversations(json.conversations);
        if (!activeConvId && json.conversations.length > 0) {
          setActiveConvId(json.conversations[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  const fetchActiveConversation = async (id: string) => {
    setLoadingChat(true);
    try {
      const res = await fetch(`/api/conversations/${id}`);
      const json = await res.json();
      if (json.success) {
        setActiveConv(json.conversation);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConvId) return;

    setSending(true);
    setWarning(null);
    const content = inputMessage.trim();
    setInputMessage("");

    try {
      const res = await fetch(`/api/conversations/${activeConvId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل إرسال الرسالة");

      if (json.message.warning) {
        setWarning(json.message.warning);
      }

      if (activeConv) {
        setActiveConv({
          ...activeConv,
          messages: [
            ...activeConv.messages,
            {
              id: json.message.id,
              senderId: json.message.senderId,
              senderName: "أنا",
              isMe: true,
              content: json.message.content,
              containsContactInfo: json.message.containsContactInfo,
              isMasked: json.message.isMasked,
              createdAt: json.message.createdAt,
            },
          ],
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل الإرسال";
      alert(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-[720px]">
      {/* Right Column: Conversations List */}
      <div className="w-full md:w-80 border-l border-slate-200 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#542cb7]" />
            <span>المحادثات والرسائل</span>
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {loadingList ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              جاري تحميل المحادثات...
            </div>
          ) : conversations.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs p-4">
              لا توجد محادثات نشطة حالياً. تبدأ المحادثات عند تقديم عروض أسعار أو اعتماد الطلبات.
            </div>
          ) : (
            conversations.map((c) => {
              const isSelected = c.id === activeConvId;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveConvId(c.id)}
                  className={`w-full text-right p-4 transition-all flex flex-col gap-1.5 ${
                    isSelected
                      ? "bg-purple-50/80 border-r-4 border-r-[#542cb7]"
                      : "hover:bg-slate-100/70"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {c.partnerName}
                    </span>
                    {c.hasActiveOrder && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                        طلب سارٍ
                      </span>
                    )}
                  </div>

                  {c.orderNumber && (
                    <span className="text-[10px] font-mono text-purple-600">
                      #{c.orderNumber}
                    </span>
                  )}

                  <p className="text-xs text-slate-500 line-clamp-1">
                    {c.lastMessage}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Left Column: Active Chat */}
      <div className="flex-1 flex flex-col bg-white">
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {activeConv.partnerName}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {activeConv.orderNumber
                    ? `أمر تصنيع: #${activeConv.orderNumber}`
                    : activeConv.rfqTitle || "محادثة استفسار"}
                </p>
              </div>

              {/* Anti-Bypass Status Indicator */}
              {activeConv.isContactAllowed ? (
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>التواصل المباشر مفتوح (صفقة معتمدة)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-purple-50 text-[#542cb7] text-xs font-bold px-3 py-1 rounded-full border border-purple-200">
                  <Lock className="w-3.5 h-3.5" />
                  <span>حماية المعاملة نشطة (قبل قبول العرض)</span>
                </div>
              )}
            </div>

            {/* Anti-Bypass Warning Banner */}
            {warning && (
              <div className="bg-amber-50 border-b border-amber-200 p-2.5 px-4 text-xs text-amber-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{warning}</span>
              </div>
            )}

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
              {loadingChat ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  جاري تحميل الرسائل...
                </div>
              ) : activeConv.messages.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  لا توجد رسائل سابقة. ابدأ المحادثة الآن.
                </div>
              ) : (
                activeConv.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.isMe ? "items-start" : "items-end"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                        m.isMe
                          ? "bg-[#542cb7] text-white rounded-br-none"
                          : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                      }`}
                    >
                      {!m.isMe && (
                        <span className="block text-[10px] font-bold text-slate-400 mb-1">
                          {m.senderName}
                        </span>
                      )}
                      <p className="whitespace-pre-wrap">{m.content}</p>

                      {m.isMasked && (
                        <div className="mt-1.5 pt-1.5 border-t border-white/20 text-[10px] text-amber-200 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" />
                          <span>تم تنقيح معلومات الاتصال التزاماً بسياسة المنصة</span>
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {new Date(m.createdAt).toLocaleTimeString("ar-EG", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-slate-200 bg-white space-y-2"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="اكتب رسالتك هنا..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#542cb7]"
                />
                <button
                  type="submit"
                  disabled={sending || !inputMessage.trim()}
                  className="bg-[#542cb7] hover:bg-[#45209c] disabled:opacity-50 text-white p-2.5 sm:px-5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">إرسال</span>
                </button>
              </div>

              <p className="text-[10px] text-slate-400 text-center">
                🔒 المنصة تراقب تلقائياً الرسائل لحظر تبادل أرقام الهواتف أو الروابط قبل قبول عرض السعر حفاظاً على حقوق الجميع.
              </p>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mb-2" />
            <h3 className="font-bold text-sm text-slate-700">اختر محادثة من القائمة للبدء</h3>
            <p className="text-xs text-slate-400 mt-1">
              يمكنك التواصل المباشر مع المصانع بخصوص تفاصيل وعينات طلبات التصنيع.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopBar />
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        <Suspense
          fallback={
            <div className="py-20 text-center text-slate-400 text-xs">
              جاري تجهيز الرسائل...
            </div>
          }
        >
          <MessagesContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
