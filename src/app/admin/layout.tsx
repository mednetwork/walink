"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Store,
  PlusCircle,
  LayoutDashboard,
  ExternalLink,
  Radio,
  Sparkles,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

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
      href: "/admin/merchants/new",
      label: "إضافة محل جديد",
      icon: PlusCircle,
      active: pathname === "/admin/merchants/new",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col font-arabic text-slate-100 antialiased selection:bg-emerald-500 selection:text-black">
      {/* Top Glass Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0B0F17]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
                <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg text-white tracking-tight">
                    walink<span className="text-emerald-400">.ma</span>
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    والينك
                  </span>
                </div>
                <span className="text-[10px] text-white/50 -mt-0.5 font-medium">
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
                        ? "bg-white/10 text-emerald-400 border border-white/10 shadow-inner"
                        : "text-white/70 hover:text-white hover:bg-white/5"
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
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>خادم الدار البيضاء نشط</span>
            </div>

            <Link
              href="/admin/merchants/new"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">إضافة محل جديد</span>
              <span className="sm:hidden">إضافة</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-white/40">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Walink (walink.ma) • جميع الحقوق محفوظة لرواد الأعمال في المغرب 🇲🇦</p>
          <div className="flex items-center gap-4 text-white/50">
            <Link href="/" className="hover:text-emerald-400 transition">
              بوابة المطورين
            </Link>
            <span>•</span>
            <Link href="/m/cafe-atlas" className="hover:text-emerald-400 transition">
              تجربة لوحة التاجر
            </Link>
            <span>•</span>
            <Link href="/join/cafe-atlas" className="hover:text-emerald-400 transition">
              تجربة انضمام الزبون
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

