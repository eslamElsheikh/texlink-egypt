"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Building2,
  FileText,
  Package,
  Info,
  Headphones,
  Search,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { Logo } from "../brand/Logo";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/factories?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const navLinks = [
    {
      title: "الرئيسية",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
      isPill: true,
    },
    {
      title: "المصانع",
      href: "/factories",
      icon: Building2,
      hasDropdown: true,
      isActive: pathname.startsWith("/factories"),
    },
    {
      title: "الطلبات (RFQ)",
      href: "/rfqs",
      icon: FileText,
      hasDropdown: true,
      isActive: pathname.startsWith("/rfqs"),
    },
    {
      title: "المنتجات الجاهزة",
      href: "/products",
      icon: Package,
      hasDropdown: true,
      isActive: pathname.startsWith("/products"),
    },
    {
      title: "عن المنصة",
      href: "/about",
      icon: Info,
      isActive: pathname === "/about",
    },
    {
      title: "تواصل معنا",
      href: "/contact",
      icon: Headphones,
      isActive: pathname === "/contact",
    },
  ];

  return (
    <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Right (Logo in RTL) */}
        <div className="flex items-center gap-8">
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1.5 font-medium text-sm">
            {navLinks.map((item) => {
              const Icon = item.icon;
              if (item.isPill && item.isActive) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="bg-[#542cb7] text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-sm font-semibold transition-all hover:bg-[#45209c]"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                    item.isActive
                      ? "text-[#542cb7] font-bold bg-purple-50"
                      : "text-slate-700 hover:text-[#542cb7] hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{item.title}</span>
                  {item.hasDropdown && (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 -mr-0.5" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Left (Search Bar & Mobile Menu Toggle) */}
        <div className="flex items-center gap-3">
          <form
            onSubmit={handleSearch}
            className="hidden sm:flex relative items-center"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن مصانع أو منتجات..."
              className="bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg pr-9 pl-4 py-1.5 w-60 lg:w-72 focus:outline-none focus:ring-2 focus:ring-[#542cb7]/20 focus:border-[#542cb7] transition-all"
            />
            <button
              type="submit"
              className="absolute right-2.5 text-slate-400 hover:text-[#542cb7] transition-colors"
              aria-label="بحث"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            aria-label="القائمة"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-3 shadow-lg">
          <form onSubmit={handleSearch} className="relative flex items-center mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن مصانع أو منتجات..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg pr-9 pl-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#542cb7]"
            />
            <button type="submit" className="absolute right-3 text-slate-400">
              <Search className="w-4 h-4" />
            </button>
          </form>

          <div className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    item.isActive
                      ? "bg-purple-50 text-[#542cb7] font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-5 h-5 text-slate-500" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
