"use client";

import React, { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Phone, Mail, MapPin, Send, CheckCircle2, Headphones } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopBar />
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-12">
        <div className="text-center mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3.5 py-1 rounded-full text-xs font-bold">
            <Headphones className="w-4 h-4 text-[#542cb7]" />
            <span>فريق خدمة العملاء والمصانع</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-[#0b1320]">
            تواصل مع فريق سايسل مصر (Cysle)
          </h1>
          <p className="text-slate-600 text-xs md:text-sm max-w-lg mx-auto">
            نحن هنا لمساعدتك في نشر طلبات التصنيع، تسجيل مصنعك، أو حل أي استفسارات تجارية وفنية.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* WhatsApp Direct Card */}
            <div className="bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl p-6 space-y-3">
              <span className="bg-[#25D366] text-white text-xs font-bold px-3 py-1 rounded-full inline-block">
                متاح 24/7
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                محادثة واتساب فورية مع الدعم الفني
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                تحدث مباشرة مع مستشاري المنصة للمساعدة في تجهيز مواصفات الـ RFQ أو التحقق من مستندات مصنعك.
              </p>
              <a
                href="https://wa.me/201012345678?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20Cysle%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%AA%D9%88%D8%A7%D8%B5%D9%84%20%D9%85%D8%B9%20%D9%81%D8%B1%D9%8A%D9%82%20%D8%A7%D9%84%D8%AF%D8%B9%D9%85"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs py-2.5 px-4 rounded-xl inline-flex items-center gap-2 shadow-sm transition-all"
              >
                <span>بدء محادثة واتساب الآن</span>
              </a>
            </div>

            {/* Direct Phone */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 bg-purple-50 text-[#542cb7] rounded-xl flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block">الهاتف المباشر:</span>
                <a href="tel:01012345678" className="font-bold text-slate-900 text-sm font-sans" dir="ltr">
                  010 1234 5678
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 bg-purple-50 text-[#542cb7] rounded-xl flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block">البريد الإلكتروني:</span>
                <a href="mailto:support@texlink-egypt.com" className="font-bold text-slate-900 text-sm font-sans" dir="ltr">
                  support@texlink-egypt.com
                </a>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 bg-purple-50 text-[#542cb7] rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block">المقر الرئيسي:</span>
                <span className="font-bold text-slate-900 text-xs">
                  القرية الذكية، الجيزة، جمهورية مصر العربية
                </span>
              </div>
            </div>
          </div>

          {/* Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 border-b pb-3 mb-4">
              أرسل لنا استفسارك وسنعاود الاتصال بك
            </h2>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-emerald-900">تم استلام رسالتك بنجاح!</h3>
                <p className="text-xs text-emerald-700 leading-relaxed max-w-sm mx-auto">
                  شكراً لتواصلك مع سايسل مصر. سيقوم أحد مستشارينا بالرد على رسالتك خلال ساعتي عمل.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكامل *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="اسمك الكريم"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#542cb7]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف (واتساب) *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="010XXXXXXXX"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-left focus:outline-none focus:ring-2 focus:ring-[#542cb7]"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-left focus:outline-none focus:ring-2 focus:ring-[#542cb7]"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">موضوع الرسالة</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="طلب تصنيع، تسجيل مصنع، شكوى..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#542cb7]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نص الرسالة *</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="اكتب تفاصيل استفسارك أو طلبك هنا..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs focus:outline-none focus:ring-2 focus:ring-[#542cb7]"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="bg-[#542cb7] hover:bg-[#45209c] text-white font-bold text-xs py-2.5 px-6 rounded-xl inline-flex items-center gap-2 shadow-sm transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال الرسالة</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
