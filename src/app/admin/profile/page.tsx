"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  User,
  Mail,
  Phone,
  Lock,
  Upload,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Calendar,
  KeyRound,
  Eye,
  EyeOff,
  Camera,
  Trash2,
} from "lucide-react";

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Profile save feedback
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState("");
  const [passError, setPassError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/admin/profile");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل تحميل الملف الشخصي");

      setProfile(json.profile);
      setName(json.profile.name);
      setEmail(json.profile.email);
      setPhone(json.profile.phone);
      setAvatarUrl(json.profile.avatarUrl || null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ";
      setProfileError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("يرجى اختيار ملف صورة صالح (PNG, JPG)");
      return;
    }

    setAvatarUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل رفع الصورة");

      setAvatarUrl(json.url);
      setProfileSuccess("تم رفع الصورة، انقر على 'حفظ التغييرات' لتثبيتها");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل رفع الصورة";
      alert(msg);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setSavingProfile(true);

    try {
      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, avatarUrl }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل تحديث البيانات");

      setProfileSuccess("تم تحديث بياناتك بنجاح.");
      setProfile(json.profile);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء الحفظ";
      setProfileError(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    if (newPassword !== confirmPassword) {
      setPassError("كلمة المرور الجديدة وتأكيدها غير متطابقين");
      return;
    }

    setChangingPass(true);
    try {
      const res = await fetch("/api/admin/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل تغيير كلمة المرور");

      setPassSuccess("تم تغيير كلمة المرور بنجاح.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء تغيير كلمة المرور";
      setPassError(msg);
    } finally {
      setChangingPass(false);
    }
  };

  const userContext = {
    id: profile?.id || "admin",
    name: profile?.name || "إدارة منصة تكس لينك",
    email: profile?.email || "admin@texlink-egypt.com",
    avatarUrl: avatarUrl || profile?.avatarUrl || null,
    role: "ADMIN" as const,
    isFactory: false,
    isBuyer: true,
  };

  return (
    <DashboardLayout user={userContext} currentRole="ADMIN">
      {/* Header Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#17233F]">
            الملف الشخصي وإدارة الحساب
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] mt-1">
            إدارة بيانات حساب مسؤول المنصة وتحديث إعدادات الأمان وكلمة المرور.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E5EAF2] p-12 text-center text-xs text-slate-400">
          جاري تحميل بيانات الملف الشخصي...
        </div>
      ) : profile ? (
        <div className="space-y-6">
          {/* Profile Identity Card */}
          <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-right">
              {/* Avatar with Upload Badge */}
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-purple-100 text-[#5932A8] font-black text-2xl flex items-center justify-center border-2 border-purple-200 overflow-hidden shadow-sm">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    name.slice(0, 1)
                  )}
                </div>

                <label className="absolute -bottom-2 -left-2 bg-[#5932A8] hover:bg-[#482888] text-white p-2 rounded-xl shadow cursor-pointer transition-all">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </label>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
                  <span className="bg-indigo-50 text-indigo-800 border border-indigo-200/60 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" />
                    <span>مدير المنصة</span>
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-mono" dir="ltr">
                  {profile.email}
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    عضو منذ {new Date(profile.createdAt).toLocaleDateString("ar-EG")}
                  </span>
                  <span>•</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    حساب نشط وموثق
                  </span>
                </div>
              </div>
            </div>

            {avatarUrl && (
              <button
                type="button"
                onClick={() => setAvatarUrl(null)}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1.5 p-2 rounded-xl border border-rose-100 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>إزالة الصورة</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Section A: Personal Information (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E5EAF2] p-6 shadow-sm space-y-4">
              <div className="border-b border-[#F1F4F9] pb-3">
                <h3 className="text-base font-bold text-[#17233F] flex items-center gap-2">
                  <User className="w-4 h-4 text-[#5932A8]" />
                  <span>البيانات الشخصية</span>
                </h3>
                <p className="text-xs text-[#718096] mt-0.5">
                  قم بتعديل بيانات التواصل والاسم الظاهر في المنصة.
                </p>
              </div>

              {profileSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {profileError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    الاسم بالكامل *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl px-4 py-2.5 text-xs text-[#17233F] focus:outline-none focus:ring-2 focus:ring-[#5932A8]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl px-4 py-2.5 text-xs text-[#17233F] text-left focus:outline-none focus:ring-2 focus:ring-[#5932A8]"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    رقم الهاتف المحمول *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl px-4 py-2.5 text-xs text-[#17233F] text-left focus:outline-none focus:ring-2 focus:ring-[#5932A8]"
                    dir="ltr"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setName(profile.name);
                      setEmail(profile.email);
                      setPhone(profile.phone);
                      setAvatarUrl(profile.avatarUrl || null);
                      setProfileSuccess("");
                      setProfileError("");
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold"
                  >
                    إلغاء التعديل
                  </button>

                  <button
                    type="submit"
                    disabled={savingProfile || avatarUploading}
                    className="bg-[#5932A8] hover:bg-[#482888] disabled:opacity-50 text-white px-6 py-2 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{savingProfile ? "جاري الحفظ..." : "حفظ التغييرات"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Section B: Account Security & Password (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E5EAF2] p-6 shadow-sm space-y-4">
              <div className="border-b border-[#F1F4F9] pb-3">
                <h3 className="text-base font-bold text-[#17233F] flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#5932A8]" />
                  <span>أمان الحساب وكلمة المرور</span>
                </h3>
                <p className="text-xs text-[#718096] mt-0.5">
                  قم بتعيين كلمة مرور قوية لحماية حسابك الإداري.
                </p>
              </div>

              {passSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{passSuccess}</span>
                </div>
              )}

              {passError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{passError}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    كلمة المرور الحالية *
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl px-4 py-2 text-xs text-[#17233F] text-left pr-10 focus:outline-none focus:ring-2 focus:ring-[#5932A8]"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    كلمة المرور الجديدة (6 أحرف على الأقل) *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl px-4 py-2 text-xs text-[#17233F] text-left pr-10 focus:outline-none focus:ring-2 focus:ring-[#5932A8]"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    تأكيد كلمة المرور الجديدة *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl px-4 py-2 text-xs text-[#17233F] text-left focus:outline-none focus:ring-2 focus:ring-[#5932A8]"
                    dir="ltr"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={changingPass}
                    className="w-full bg-[#17233F] hover:bg-[#0f172a] disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{changingPass ? "جاري التحديث..." : "تحديث كلمة المرور"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Section C: Read-Only Account Details */}
          <div className="bg-white rounded-2xl border border-[#E5EAF2] p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#17233F] border-b border-[#F1F4F9] pb-2">
              معلومات الحساب الفنية (للقراءة فقط)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-[#F5F7FB] p-3 rounded-xl border border-[#E5EAF2]">
                <span className="text-[#718096] block text-[10px]">معرف الحساب (Account ID):</span>
                <span className="font-mono text-[#17233F] font-bold truncate block">{profile.id}</span>
              </div>

              <div className="bg-[#F5F7FB] p-3 rounded-xl border border-[#E5EAF2]">
                <span className="text-[#718096] block text-[10px]">مستوى الصلاحية (Role):</span>
                <span className="text-purple-700 font-bold block">إدارة كاملة (ADMIN)</span>
              </div>

              <div className="bg-[#F5F7FB] p-3 rounded-xl border border-[#E5EAF2]">
                <span className="text-[#718096] block text-[10px]">تاريخ الإنشاء:</span>
                <span className="text-[#17233F] font-bold block">
                  {new Date(profile.createdAt).toLocaleString("ar-EG")}
                </span>
              </div>

              <div className="bg-[#F5F7FB] p-3 rounded-xl border border-[#E5EAF2]">
                <span className="text-[#718096] block text-[10px]">آخر تحديث:</span>
                <span className="text-[#17233F] font-bold block">
                  {new Date(profile.updatedAt).toLocaleString("ar-EG")}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
}
