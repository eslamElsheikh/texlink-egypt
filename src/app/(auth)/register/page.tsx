"use client";

import React, { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Logo } from "@/components/brand/Logo";
import { User, ShoppingCart, Building2, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<"BUYER" | "FACTORY" | "BOTH">("BUYER");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [governorate, setGovernorate] = useState("القاهرة");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountType,
          name,
          companyName,
          email,
          phone,
          password,
          governorate,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل إنشاء الحساب");

      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء التسجيل";
      setError(msg);
    } finally {
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
              إنشاء حساب جديد على تكس لينك
            </h1>
            <p className="text-xs text-slate-500">
              انضم لأكبر شبكة تربط مصانع النسيج والتريكو المصرية بالمشترين
            </p>
          </div>

          {/* Account Role Selector */}
          <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold text-center">
            <button
              type="button"
              onClick={() => setAccountType("BUYER")}
              className={`py-2 rounded-lg transition-all ${
                accountType === "BUYER"
                  ? "bg-white text-[#542cb7] shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              مشتري / تاجر
            </button>
            <button
              type="button"
              onClick={() => setAccountType("FACTORY")}
              className={`py-2 rounded-lg transition-all ${
                accountType === "FACTORY"
                  ? "bg-white text-[#059669] shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              صاحب مصنع
            </button>
            <button
              type="button"
              onClick={() => setAccountType("BOTH")}
              className={`py-2 rounded-lg transition-all ${
                accountType === "BOTH"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              الاثنان معاً
            </button>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الاسم الكامل *
              </label>
              <input
                type="text"
                required
                placeholder="الاسم الثلاثي"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#542cb7]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                اسم الشركة أو النشاط التجاري
              </label>
              <input
                type="text"
                placeholder="اسم البراند أو المحل أو المصنع"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#542cb7]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                البريد الإلكتروني *
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-left focus:outline-none focus:ring-2 focus:ring-[#542cb7]"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رقم الهاتف المحمول (واتساب) *
              </label>
              <input
                type="tel"
                required
                placeholder="010XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-left focus:outline-none focus:ring-2 focus:ring-[#542cb7]"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                كلمة المرور *
              </label>
              <input
                type="password"
                required
                placeholder="لا تقل عن 6 أحرف"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-left focus:outline-none focus:ring-2 focus:ring-[#542cb7]"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#542cb7] hover:bg-[#45209c] disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-all mt-2"
            >
              <span>{loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب الآن"}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>لديك حساب بالفعل؟ </span>
            <Link
              href="/login"
              className="font-bold text-[#542cb7] hover:underline"
            >
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
