import React from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopBar />
      <Header />
      <main className="flex-1">
        <div className="py-20 text-center">
          <h1 className="text-3xl font-bold text-slate-800">TexLink Egypt</h1>
          <p className="text-slate-500 mt-2">منصة ربط مصانع التريكو في مصر بالمشترين</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
