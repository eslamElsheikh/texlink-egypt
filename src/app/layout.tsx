import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-white text-slate-900 antialiased selection:bg-purple-100 selection:text-purple-900">
        {children}
      </body>
    </html>
  );
}
