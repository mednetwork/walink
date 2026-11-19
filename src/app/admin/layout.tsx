"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldCheck,
  Store,
  PlusCircle,
  LayoutDashboard,
  ExternalLink,
  Radio,
  Sparkles,
  Target,
  LogOut,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  };

  const navLinks = [
    {
      href: "/admin",
      label: "لوحة التحكم",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      href: "/admin/automations",
      label: "محرك الأتمتة",
      icon: Sparkles,
      active: pathname === "/admin/automations",
    },
    {
      href: "/admin/outreach",
      label: "استوديو المبيعات",
      icon: Target,
      active: pathname === "/admin/outreach",
    },
    {
      href: "/admin/merchants/new",
      label: "إضافة متجر جديد",
      icon: PlusCircle,
      active: pathname === "/admin/merchants/new",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col font-arabic text-[#111B21] antialiased selection:bg-[#008069] selection:text-white">
      {/* Top Navigation Bar - Meta Business Suite Light Style */}
      <header className="sticky top-0 z-40 w-full border-b border-[#E9EDEF] bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00A884] to-[#008069] flex items-center justify-center text-white font-bold shadow-md shadow-[#008069]/20 group-hover:scale-105 transition-transform duration-200">
                <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg text-[#111B21] tracking-tight">
                    walink<span className="text-[#008069]">.ma</span>
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#008069]/10 text-[#008069] border border-[#008069]/20 font-bold">
                    والينك
                  </span>
                </div>
                <span className="text-[10px] text-[#54656F] -mt-0.5 font-medium">
                  لوحة إدارة المنصة (Super Admin)
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 mr-6">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                      link.active
                        ? "bg-[#008069]/10 text-[#008069] border border-[#008069]/20 shadow-sm"
                        : "text-[#54656F] hover:text-[#111B21] hover:bg-[#F0F2F5]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Header Status Badges & Quick Action */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher size="sm" />

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00A884] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#008069]"></span>
              </span>
              <span>خادم الدار البيضاء نشط</span>
            </div>

            <Link
              href="/admin/merchants/new"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#00A884] to-[#008069] hover:from-[#008069] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#008069]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">إضافة متجر جديد</span>
              <span className="sm:hidden">إضافة</span>
            </Link>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
              title="تسجيل الخروج من لوحة الإدارة"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E9EDEF] bg-white py-6 text-center text-xs text-[#54656F]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Walink (walink.ma) • جميع الحقوق محفوظة لرواد الأعمال في المغرب 🇲🇦</p>
          <div className="flex items-center gap-4 text-[#54656F]">
            <Link href="/" className="hover:text-[#008069] font-medium transition">
              بوابة المطورين
            </Link>
            <span>•</span>
            <Link href="/m/cafe-atlas" className="hover:text-[#008069] font-medium transition">
              تجربة لوحة التاجر
            </Link>
            <span>•</span>
            <Link href="/join/cafe-atlas" className="hover:text-[#008069] font-medium transition">
              تجربة انضمام الزبون
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

