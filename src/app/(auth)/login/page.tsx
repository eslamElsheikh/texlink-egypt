"use client";

import React, { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Logo } from "@/components/brand/Logo";
import { User, Lock, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل تسجيل الدخول");

      setSuccessMsg("تم تسجيل الدخول بنجاح! جاري تحويلك...");

      // Choose destination according to role
      let destination = "/";
      if (json.user?.role === "ADMIN") {
        destination = "/admin/factories";
      } else if (json.user?.role === "FACTORY" && json.user?.factorySlug) {
        destination = `/factories/${json.user.factorySlug}`;
      }

      // Hard redirect to ensure full cookie propagation
      setTimeout(() => {
        window.location.href = destination;
      }, 300);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء تسجيل الدخول";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopBar />
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <Logo className="justify-center" />
            <h1 className="text-xl font-bold text-slate-900 pt-2">
              تسجيل الدخول إلى حسابك
            </h1>
            <p className="text-xs text-slate-500">
              ادخل بريدك الإلكتروني وكلمة المرور لمتابعة طلباتك وعروضك
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-left focus:outline-none focus:ring-2 focus:ring-[#542cb7]"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-left focus:outline-none focus:ring-2 focus:ring-[#542cb7]"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#542cb7] hover:bg-[#45209c] disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>{loading ? "جاري الدخول..." : "تسجيل الدخول"}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins Helper */}
          <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-3.5 text-xs text-slate-700 space-y-2">
            <span className="font-bold text-purple-900 block">
              حسابات تجريبية سريعة (انقر للتعبئة التلقائية):
            </span>
            <div className="grid grid-cols-1 gap-1.5 font-medium text-xs">
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@texlink-egypt.com");
                  setPassword("123456");
                }}
                className="text-right bg-white p-2 rounded-lg border border-purple-100 hover:border-purple-300 hover:bg-purple-50 transition-colors flex items-center justify-between"
              >
                <span>👑 إدارة المنصة (Admin)</span>
                <span className="text-[11px] text-purple-700 font-mono">admin@texlink-egypt.com</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail("buyer1@cairo-apparel.com");
                  setPassword("123456");
                }}
                className="text-right bg-white p-2 rounded-lg border border-purple-100 hover:border-purple-300 hover:bg-purple-50 transition-colors flex items-center justify-between"
              >
                <span>🛍️ مشتري / براند (Buyer)</span>
                <span className="text-[11px] text-purple-700 font-mono">buyer1@cairo-apparel.com</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail("elnasr@mahalla-textile.com");
                  setPassword("123456");
                }}
                className="text-right bg-white p-2 rounded-lg border border-purple-100 hover:border-purple-300 hover:bg-purple-50 transition-colors flex items-center justify-between"
              >
                <span>🏭 مصنع النصر للتريكو (Factory)</span>
                <span className="text-[11px] text-purple-700 font-mono">elnasr@mahalla-textile.com</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>ليس لديك حساب بعد؟ </span>
            <Link
              href="/register"
              className="font-bold text-[#542cb7] hover:underline"
            >
              إنشاء حساب جديد
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
