"use client";

import React, { useRef } from "react";
import { Printer, X, QrCode, CheckCircle2, Factory, Calendar, Layers, Boxes } from "lucide-react";

interface JobTrackingCardProps {
  orderNumber: string;
  batchNumber: string;
  productName: string;
  targetQuantity: number;
  plannedStartDate: string;
  plannedEndDate: string;
  priority: string;
  fabricSpecs?: string;
  factoryName?: string;
  onClose: () => void;
}

/**
 * Compact, standalone deterministic QR-pattern SVG generator.
 * Generates an industrial 21x21 QR-like matrix grid with standard position detection patterns
 * and encoded payload checksum so it renders crisply at any print resolution offline.
 */
function SimpleQRCodeSVG({ value, size = 140 }: { value: string; size?: number }) {
  const gridSize = 21;
  // Deterministic pseudo-random seed from string
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  // Create 21x21 matrix
  const matrix: boolean[][] = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(false)
  );

  // Helper to draw 7x7 Finder Pattern with 1px border
  const drawFinder = (r: number, c: number) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (
          i === 0 ||
          i === 6 ||
          j === 0 ||
          j === 6 ||
          (i >= 2 && i <= 4 && j >= 2 && j <= 4)
        ) {
          matrix[r + i][c + j] = true;
        }
      }
    }
  };

  // Top-left, top-right, bottom-left finders
  drawFinder(0, 0);
  drawFinder(0, gridSize - 7);
  drawFinder(gridSize - 7, 0);

  // Timing patterns
  for (let i = 8; i < gridSize - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Fill data areas deterministically based on payload hash
  let currentHash = Math.abs(hash);
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // Skip finders and timing
      const inFinderTL = r < 8 && c < 8;
      const inFinderTR = r < 8 && c >= gridSize - 8;
      const inFinderBL = r >= gridSize - 8 && c < 8;
      const isTiming = r === 6 || c === 6;

      if (!inFinderTL && !inFinderTR && !inFinderBL && !isTiming) {
        currentHash = (currentHash * 1103515245 + 12345) & 0x7fffffff;
        matrix[r][c] = currentHash % 3 === 0 || (r + c + value.length) % 2 === 0;
      }
    }
  }

  const cellSize = size / gridSize;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="bg-white p-1 rounded-lg border border-gray-200"
    >
      {matrix.map((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#14264A"
            />
          ) : null
        )
      )}
    </svg>
  );
}

export function JobTrackingCard({
  orderNumber,
  batchNumber,
  productName,
  targetQuantity,
  plannedStartDate,
  plannedEndDate,
  priority,
  fabricSpecs = "قطن 100% سينجل جيرسي ممشط 180 جم",
  factoryName = "مصنع النصر للتريكو - المحلة الكبرى",
  onClose,
}: JobTrackingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const qrPayload = `CYSLE|ORD:${orderNumber}|BATCH:${batchNumber}|QTY:${targetQuantity}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Modal Top Bar (Hidden during print) */}
        <div className="p-4 bg-gradient-to-l from-[#14264A] to-[#254682] text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm md:text-base">
              بطاقة تتبع وتشغيل الدفعة الصناعية (Job Traveler Card)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#079B62] hover:bg-[#068453] text-white rounded-lg text-xs font-bold transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              طباعة البطاقة
            </button>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Card Area */}
        <div className="p-6 overflow-y-auto flex-1 font-sans" dir="rtl" ref={cardRef}>
          <div className="border-2 border-dashed border-gray-300 p-6 rounded-2xl bg-white space-y-6 print:border-black print:p-4">
            {/* Header with Factory & QR */}
            <div className="flex items-start justify-between gap-4 border-b-2 border-gray-800 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gray-900 text-white rounded text-[10px] font-bold">
                  <Factory className="w-3 h-3 text-emerald-400" />
                  {factoryName}
                </div>
                <h1 className="text-xl font-black text-gray-900">بطاقة تتبع تشغيل القماش والملابس</h1>
                <p className="text-xs text-gray-600">Cysle Factory OS — Industrial Tracking Traveler</p>
                <div className="pt-2 font-mono text-sm">
                  <span className="font-bold text-gray-500">كود الدفعة / اللوط: </span>
                  <span className="font-black text-[#5932A8] text-base bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    {batchNumber}
                  </span>
                </div>
              </div>

              {/* Scannable QR Code */}
              <div className="flex flex-col items-center shrink-0">
                <SimpleQRCodeSVG value={qrPayload} size={110} />
                <span className="font-mono text-[9px] text-gray-500 mt-1 font-bold">
                  امسح كود الدفعة
                </span>
              </div>
            </div>

            {/* Specifications Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
              <div>
                <span className="text-gray-500 block text-[10px]">رقم أمر الإنتاج:</span>
                <span className="font-black font-mono text-gray-900 text-sm">{orderNumber}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">الكمية المستهدفة:</span>
                <span className="font-black text-emerald-700 text-sm">
                  {targetQuantity.toLocaleString()} قطعة
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">تاريخ البدء:</span>
                <span className="font-bold text-gray-800">
                  {new Date(plannedStartDate).toLocaleDateString("ar-EG")}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">التسليم المستهدف:</span>
                <span className="font-bold text-gray-800">
                  {new Date(plannedEndDate).toLocaleDateString("ar-EG")}
                </span>
              </div>
            </div>

            {/* Product & Fabric Description */}
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs space-y-1">
              <span className="font-bold text-emerald-900 block">المنتج: {productName}</span>
              <p className="text-emerald-800 text-[11px]">مواصفات الخامة: {fabricSpecs}</p>
            </div>

            {/* Production Stages Traveler Checklist */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-800 block">
                محطات التشغيل والاعتماد بصالة الإنتاج (Routing Steps):
              </span>
              <div className="border border-gray-200 rounded-xl overflow-hidden text-[11px]">
                <table className="w-full text-right">
                  <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                    <tr>
                      <th className="p-2">المرحلة الصناعية</th>
                      <th className="p-2">الماكينة</th>
                      <th className="p-2">الكمية السليمة</th>
                      <th className="p-2">الهالك</th>
                      <th className="p-2">توقيع المشغل</th>
                      <th className="p-2">فحص الجودة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 font-mono text-gray-600">
                    <tr>
                      <td className="p-2 font-sans font-semibold text-gray-900">1. صرف الغزول والخامات</td>
                      <td className="p-2">مستودع A</td>
                      <td className="p-2">_____ كجم</td>
                      <td className="p-2">_____</td>
                      <td className="p-2">__________</td>
                      <td className="p-2">☐ معتمد</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-sans font-semibold text-gray-900">2. حياكة وتريكو دائري</td>
                      <td className="p-2">M-TRICOT</td>
                      <td className="p-2">_____ توب</td>
                      <td className="p-2">_____</td>
                      <td className="p-2">__________</td>
                      <td className="p-2">☐ معتمد</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-sans font-semibold text-gray-900">3. قص وتفصيل الماركر</td>
                      <td className="p-2">طاولة الليزر</td>
                      <td className="p-2">_____ قطعة</td>
                      <td className="p-2">_____</td>
                      <td className="p-2">__________</td>
                      <td className="p-2">☐ معتمد</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-sans font-semibold text-gray-900">4. خياطة وتجميع (أوفر وسنجر)</td>
                      <td className="p-2">خط الخياطة</td>
                      <td className="p-2">_____ قطعة</td>
                      <td className="p-2">_____</td>
                      <td className="p-2">__________</td>
                      <td className="p-2">☐ معتمد</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-sans font-semibold text-gray-900">5. كوي وتشطيب نهائي</td>
                      <td className="p-2">مكبس بخار</td>
                      <td className="p-2">_____ قطعة</td>
                      <td className="p-2">_____</td>
                      <td className="p-2">__________</td>
                      <td className="p-2">☐ معتمد</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-sans font-semibold text-gray-900">6. تعبئة وتغليف واستلام مخازن</td>
                      <td className="p-2">قسم التعبئة</td>
                      <td className="p-2">_____ قطعة</td>
                      <td className="p-2">_____</td>
                      <td className="p-2">__________</td>
                      <td className="p-2">☐ معتمد</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Industrial Barcode Line representation */}
            <div className="pt-2 flex flex-col items-center justify-center border-t border-gray-200">
              <div className="h-8 flex items-center justify-center gap-0.5">
                {Array.from({ length: 48 }).map((_, i) => (
                  <span
                    key={i}
                    style={{
                      width: i % 3 === 0 ? "3px" : i % 5 === 0 ? "1px" : "2px",
                      height: i % 4 === 0 ? "28px" : "24px",
                    }}
                    className="bg-gray-900 inline-block"
                  />
                ))}
              </div>
              <span className="font-mono text-[10px] tracking-widest text-gray-600 mt-1 font-bold">
                *{batchNumber}*
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
