"use client";

import React, { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  FileText,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SizeRow {
  id: string;
  size: string;
  color: string;
  quantity: number;
}

interface UploadedAttachment {
  fileUrl: string;
  fileType: string;
  fileName: string;
}

export default function NewRfqPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successResult, setSuccessResult] = useState<{
    id: string;
    matchedCount: number;
  } | null>(null);

  // Form State
  const [titleAr, setTitleAr] = useState("");
  const [productType, setProductType] = useState("تيشيرت قطن 100%");
  const [totalQuantity, setTotalQuantity] = useState(200);
  const [fabricDetails, setFabricDetails] = useState("قطن مصري ممشط 100% سينجل جيرسي");
  const [gsm, setGsm] = useState<number | undefined>(180);
  const [colors, setColors] = useState("أسود، أبيض، كحلي");
  const [printingEmbroidery, setPrintingEmbroidery] = useState("طباعة سلك سكرين لوجو أمامي");
  const [targetBudgetPerPiece, setTargetBudgetPerPiece] = useState<number | undefined>(45);
  const [deadlineDays, setDeadlineDays] = useState(15);
  const [sampleRequired, setSampleRequired] = useState(true);
  const [targetGovernorate, setTargetGovernorate] = useState("الدقهلية");
  const [notesAr, setNotesAr] = useState("");

  // Size breakdown table
  const [sizeRows, setSizeRows] = useState<SizeRow[]>([
    { id: "1", size: "M", color: "أسود", quantity: 50 },
    { id: "2", size: "L", color: "أسود", quantity: 50 },
    { id: "3", size: "XL", color: "كحلي", quantity: 50 },
    { id: "4", size: "XXL", color: "أبيض", quantity: 50 },
  ]);

  // Uploaded files
  const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);
  const [uploading, setUploading] = useState(false);

  const productTypes = [
    "تيشيرت قطن 100%",
    "تي شيرت بولو بيكيه",
    "تيشيرت أوفر سايز دروب شولدر",
    "هودي كابيشو ميلتون 3 فتلة",
    "سويت شيرت كرو نيك",
    "سويت بانتس وشورت رياضي",
    "جوارب وشرابات قطنية",
    "بيجامات وتريكو منزلي",
    "أقمشة وتريكو خام",
    "أخرى (مخصص)",
  ];

  const governorates = [
    "الدقهلية",
    "سلامون القماش – مركز المنصورة",
    "طنامل – مركز أجا",
    "القاهرة",
    "الجيزة",
    "الغربية",
    "القليوبية",
    "الشرقية",
    "الإسكندرية",
    "المنوفية",
    "أي محافظة في مصر",
  ];

  const addSizeRow = () => {
    setSizeRows((prev) => [
      ...prev,
      { id: Date.now().toString(), size: "L", color: "أسود", quantity: 50 },
    ]);
  };

  const removeSizeRow = (id: string) => {
    if (sizeRows.length <= 1) return;
    setSizeRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateSizeRow = (id: string, field: keyof SizeRow, value: string | number) => {
    setSizeRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  // Recalculate total from breakdown if rows exist
  const breakdownSum = sizeRows.reduce((acc, row) => acc + (Number(row.quantity) || 0), 0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل رفع الملف");

      setAttachments((prev) => [
        ...prev,
        {
          fileUrl: json.url,
          fileName: json.fileName,
          fileType: file.type || "file",
        },
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل الرفع";
      alert(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        titleAr: titleAr || `${totalQuantity} قطعة ${productType}`,
        productType,
        totalQuantity: breakdownSum > 0 ? breakdownSum : totalQuantity,
        fabricDetails,
        gsm: gsm ? Number(gsm) : undefined,
        colors,
        printingEmbroidery,
        targetBudgetPerPiece: targetBudgetPerPiece ? Number(targetBudgetPerPiece) : undefined,
        deadlineDays: Number(deadlineDays),
        sampleRequired,
        targetGovernorate: targetGovernorate === "أي محافظة في مصر" ? undefined : targetGovernorate,
        notesAr,
        sizeBreakdown: sizeRows.map((r) => ({
          size: r.size,
          color: r.color,
          quantity: Number(r.quantity),
        })),
        attachments,
      };

      const res = await fetch("/api/rfqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "فشل نشر الطلب");

      setSuccessResult({
        id: json.rfq.id,
        matchedCount: json.matchedFactoriesCount || 0,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopBar />
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3.5 py-1 rounded-full text-xs font-bold mb-2">
            <FileText className="w-4 h-4 text-[#542cb7]" />
            <span>طلب عرض سعر مخصص (RFQ)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0b1320]">
            انشر مواصفات طلبك وتلقّ عروض المصانع المصرية
          </h1>
          <p className="text-slate-600 text-sm mt-1 max-w-md mx-auto">
            حدد الكمية، نوع القماش، جدول المقاسات، وارفع تصميمك. سيتم إشعار المصانع المطابقة فوراً لتقديم عروض أسعارها.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center gap-3 text-sm mb-6">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Screen */}
        {successResult ? (
          <div className="bg-white rounded-2xl border border-purple-200 p-8 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto text-[#542cb7]">
              <Sparkles className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              تم نشر طلبك بنجاح!
            </h2>
            <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
              تمت مطابقة مواصفاتك بنجاح وإشعار{" "}
              <strong className="text-purple-700 font-extrabold text-base">
                {successResult.matchedCount} مصانع معتمدة
              </strong>{" "}
              تطابق نوع القماش والقدرة الإنتاجية في المحافظة. ستتلقى عروض الأسعار
              تباعاً.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/rfqs/${successResult.id}`}
                className="bg-[#542cb7] hover:bg-[#45209c] text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow"
              >
                معاينة صفحة الطلب
              </Link>
              <Link
                href="/rfqs"
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-2.5 rounded-xl text-sm transition-all"
              >
                تصفح بورصة الطلبات
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6"
          >
            {/* Step 1: Basic Product Information */}
            <div>
              <h2 className="text-base font-bold text-slate-900 border-b pb-2 mb-4">
                1. مواصفات القطعة والمنتج
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    نوع المنتج أو الموديل *
                  </label>
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#542cb7]"
                  >
                    {productTypes.map((pt) => (
                      <option key={pt} value={pt}>
                        {pt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    عنوان مختصر للطلب (اختياري)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: 500 قطعة تيشيرت قطن ممشط للشركات"
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#542cb7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    نوع الخامة والقماش المطلوب بالتفصيل *
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: قطن 100% سينجل جيرسي ممشط"
                    value={fabricDetails}
                    onChange={(e) => setFabricDetails(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#542cb7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    وزن القماش التقديري (GSM جرام لكل متر)
                  </label>
                  <input
                    type="number"
                    placeholder="مثال: 180 أو 220 أو 320"
                    value={gsm || ""}
                    onChange={(e) => setGsm(parseInt(e.target.value) || undefined)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#542cb7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    الألوان المطلوبة
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: أسود، أبيض، كحلي، أحمر"
                    value={colors}
                    onChange={(e) => setColors(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#542cb7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    الطباعة والتطريز والتشطيب
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: طباعة سلك سكرين، تطريز كمبيوتر 3D"
                    value={printingEmbroidery}
                    onChange={(e) => setPrintingEmbroidery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#542cb7]"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Size Breakdown Table */}
            <div>
              <div className="flex items-center justify-between border-b pb-2 mb-3">
                <h2 className="text-base font-bold text-slate-900">
                  2. جدول المقاسات والكميات (المجموع: {breakdownSum} قطعة)
                </h2>
                <button
                  type="button"
                  onClick={addSizeRow}
                  className="bg-purple-50 hover:bg-purple-100 text-[#542cb7] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة مقاس</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-100/70 text-slate-700">
                      <th className="p-2.5 rounded-r-lg font-bold">المقاس (Size)</th>
                      <th className="p-2.5 font-bold">اللون</th>
                      <th className="p-2.5 font-bold">الكمية (قطعة)</th>
                      <th className="p-2.5 rounded-l-lg text-center font-bold">حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sizeRows.map((row) => (
                      <tr key={row.id}>
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.size}
                            onChange={(e) =>
                              updateSizeRow(row.id, "size", e.target.value)
                            }
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs w-28 focus:outline-none focus:ring-1 focus:ring-[#542cb7]"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.color}
                            onChange={(e) =>
                              updateSizeRow(row.id, "color", e.target.value)
                            }
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs w-36 focus:outline-none focus:ring-1 focus:ring-[#542cb7]"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min={1}
                            value={row.quantity}
                            onChange={(e) =>
                              updateSizeRow(
                                row.id,
                                "quantity",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs w-28 focus:outline-none focus:ring-1 focus:ring-[#542cb7]"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeSizeRow(row.id)}
                            disabled={sizeRows.length <= 1}
                            className="text-slate-400 hover:text-rose-500 disabled:opacity-30 p-1"
                          >
                            <Trash2 className="w-4 h-4 mx-auto" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Step 3: Tech Pack & File Uploads */}
            <div>
              <h2 className="text-base font-bold text-slate-900 border-b pb-2 mb-3">
                3. رفع صور الموديل أو ملف المواصفات (Tech Pack)
              </h2>

              <div className="border border-dashed border-slate-300 rounded-xl p-5 text-center bg-slate-50 hover:bg-slate-100/60 transition-colors">
                <ImageIcon className="w-8 h-8 text-[#542cb7] mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-800">
                  ارفع تصميم الموديل، جداول المقاسات، أو عينات الألوان
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 mb-3">
                  يقبل صور JPG / PNG وملفات PDF التوضيحية
                </p>

                <label className="cursor-pointer bg-white border border-slate-300 hover:border-purple-500 text-slate-700 text-xs font-semibold py-2 px-4 rounded-lg inline-flex items-center gap-2 shadow-sm transition-all">
                  <Upload className="w-4 h-4" />
                  <span>{uploading ? "جاري الرفع..." : "اختر ملفاً من جهازك"}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>

                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center mt-3">
                    {attachments.map((att, i) => (
                      <span
                        key={i}
                        className="bg-purple-100 text-[#542cb7] text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{att.fileName}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Step 4: Budget, Deadline & Location */}
            <div>
              <h2 className="text-base font-bold text-slate-900 border-b pb-2 mb-4">
                4. الميزانية والمواعيد
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    الميزانية التقديرية للقطعة (جنيه مصري)
                  </label>
                  <input
                    type="number"
                    placeholder="مثال: 45 جنيه للقطعة"
                    value={targetBudgetPerPiece || ""}
                    onChange={(e) =>
                      setTargetBudgetPerPiece(parseFloat(e.target.value) || undefined)
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#542cb7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    الموعد النهائي المطلوب للتسليم (أيام) *
                  </label>
                  <input
                    type="number"
                    min={3}
                    value={deadlineDays}
                    onChange={(e) => setDeadlineDays(parseInt(e.target.value) || 15)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#542cb7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    المحافظة المفضلة للتصنيع
                  </label>
                  <select
                    value={targetGovernorate}
                    onChange={(e) => setTargetGovernorate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#542cb7]"
                  >
                    {governorates.map((gov) => (
                      <option key={gov} value={gov}>
                        {gov}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sample Checkbox */}
              <div className="pt-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={sampleRequired}
                    onChange={(e) => setSampleRequired(e.target.checked)}
                    className="rounded text-[#542cb7] focus:ring-[#542cb7] w-4 h-4"
                  />
                  <span>
                    أشترط إعداد واعتماد عينة ما قبل الإنتاج (Pre-production Sample) قبل البدء في التشغيل الكامل
                  </span>
                </label>
              </div>

              {/* Additional notes */}
              <div className="pt-4">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ملاحظات أو اشتراطات خاصة للجودة والتعبئة والتغليف
                </label>
                <textarea
                  rows={3}
                  placeholder="اكتب أي متطلبات خاصة: مثلاً خياطة مزدوجة، أكياس بولي مفردة، تغليف كرتوني، باركود..."
                  value={notesAr}
                  onChange={(e) => setNotesAr(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#542cb7]"
                ></textarea>
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-4 border-t flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#542cb7] hover:bg-[#45209c] text-white font-bold px-8 py-3 rounded-xl text-sm flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span>جاري نشر ومطابقة الطلب...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>نشر الطلب ومطابقة المصانع فوراً</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
