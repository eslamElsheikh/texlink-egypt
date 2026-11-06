import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TexLink Egypt | منصة ربط مصانع التريكو في مصر بالمشترين",
  description:
    "المنصة الأولى لربط مصانع التريكو والملابس الجاهزة في مصر بأصحاب البراندات وتجار الجملة. اطلب عروض أسعار لمواصفاتك الخاصة أو اطلب منتجات جاهزة بالجملة.",
  keywords: [
    "مصانع تريكو",
    "ملابس جاهزة مصر",
    "المحلة الكبرى",
    "شبرا الخيمة",
    "تصنيع ملابس",
    "توريد جملة",
    "تيشيرتات بالجملة",
    "RFQ مصر",
  ],
  authors: [{ name: "TexLink Egypt" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="min-h-screen flex flex-col font-sans bg-white text-slate-900 antialiased selection:bg-purple-100 selection:text-purple-900">
        {children}
      </body>
    </html>
  );
}
