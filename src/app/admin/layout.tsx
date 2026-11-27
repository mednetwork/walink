"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  PlusCircle,
  LayoutDashboard,
  Receipt,
  Sparkles,
  Target,
  ExternalLink,
} from "lucide-react";
import AdminSidebarNav from "@/components/AdminSidebarNav";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n/context";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, isRTL } = useI18n();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileDrawerOpen]);

  // Handle escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileDrawerOpen) {
        setMobileDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileDrawerOpen]);

  // Bypass layout for admin login (supports both /admin/login and /login on wadmin subdomain)
  const isLoginPage =
    pathname === "/admin/login" ||
    pathname === "/login" ||
    pathname?.endsWith("/login") ||
    pathname?.endsWith("/login/");

  if (isLoginPage) {
    return <>{children}</>;
  }

  const s = t.admin?.sidebar || {
    dashboard: "لوحة الإدارة المركزية",
    viewWebsite: "عرض الموقع",
    newMerchant: "إضافة متجر جديد",
    navHome: "الرئيسية",
    navAutomations: "الأتمتة",
    navOutreach: "المبيعات",
    navNewMerchant: "متجر جديد",
    addShort: "متجر",
    openMenu: "فتح القائمة الجانبية",
    closeMenu: "إغلاق القائمة",
    developerPortal: "بوابة المطورين",
    support: "الدعم الفني",
    terms: "الشروط",
    privacy: "الخصوصية",
  };

  const bottomNavItems = [
    {
      href: "/admin",
      label: s.navHome,
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      href: "/admin/billing",
      label: "الفوترة",
      icon: Receipt,
      active: pathname === "/admin/billing",
    },
    {
      href: "/admin/automations",
      label: s.navAutomations,
      icon: Sparkles,
      active: pathname === "/admin/automations",
    },
    {
      href: "/admin/outreach",
      label: s.navOutreach,
      icon: Target,
      active: pathname === "/admin/outreach",
    },
    {
      href: "/admin/merchants/new",
      label: s.navNewMerchant,
      icon: PlusCircle,
      active: pathname === "/admin/merchants/new",
    },
  ];

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-[#EFEAE4] flex font-arabic text-[#161514] antialiased selection:bg-[#F85B04] selection:text-white relative"
    >
      {/* 1. Desktop Fixed Deep Ink Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 start-0 z-30 w-64 xl:w-72 shadow-xl">
        <AdminSidebarNav />
      </aside>

      {/* 2. Mobile Slide-Over Drawer & Backdrop */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <button
            type="button"
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200 cursor-default"
            onClick={() => setMobileDrawerOpen(false)}
            aria-label={s.closeMenu}
            tabIndex={-1}
          />

          {/* Drawer Panel */}
          <div
            className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-start duration-300"
            role="dialog"
            aria-modal="true"
            aria-label="قائمة التنقل الجانبية"
          >
            <AdminSidebarNav
              isMobileDrawer={true}
              onClose={() => setMobileDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 3. Main Content Viewport */}
      <div className="flex-1 lg:ps-64 xl:ps-72 flex flex-col min-h-screen w-full">
        {/* Mobile Sticky Top Header (< lg) */}
        <header className="sticky top-0 z-20 lg:hidden w-full h-16 bg-[#161514] text-white border-b border-white/10 px-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center -ms-2 rounded-xl text-white/75 hover:text-white hover:bg-white/10 transition"
              aria-label={s.openMenu}
              aria-expanded={mobileDrawerOpen}
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/admin" className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-mark.png"
                alt="Walink Logo"
                width={32}
                height={32}
                className="w-8 h-8 rounded-xl object-contain shadow-sm"
              />
              <span className="font-bold text-sm tracking-tight text-white">
                walink<span className="text-[#FA7F3B]">.ma</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher size="sm" variant="dark" />
            <Link
              href="/admin/merchants/new"
              className="min-h-[44px] px-3 py-1.5 rounded-xl bg-[#F85B04] hover:bg-[#E25102] text-white font-bold text-xs flex items-center gap-1 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{s.addShort}</span>
            </Link>
          </div>
        </header>

        {/* Desktop Sticky Header Bar (lg:) */}
        <header className="hidden lg:flex sticky top-0 z-20 w-full h-16 bg-white/95 backdrop-blur-md border-b border-[#161514]/10 px-6 lg:px-8 items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>{s.dashboard}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="min-h-[44px] px-3.5 py-2 rounded-xl border border-[#161514]/15 hover:border-[#161514]/30 bg-white text-[#161514]/75 hover:text-[#161514] text-xs font-medium flex items-center gap-1.5 transition shadow-sm"
            >
              <span>{s.viewWebsite}</span>
              <ExternalLink className="w-3 h-3 text-[#161514]/50" />
            </Link>

            <Link
              href="/admin/merchants/new"
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#F85B04] hover:bg-[#E25102] text-white font-bold text-xs flex items-center gap-2 shadow-[0_3px_0_#C14703] transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{s.newMerchant}</span>
            </Link>
          </div>
        </header>

        {/* Page Main Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 lg:pb-10">
          {children}
        </main>

        {/* Desktop Footer */}
        <footer className="border-t border-[#161514]/10 bg-white py-4 px-6 lg:px-8 text-xs text-[#161514]/65 hidden sm:block">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>© {new Date().getFullYear()} Walink.ma • {t.footer.copyright}</p>
            <div className="flex items-center gap-4 text-[#161514]/65">
              <Link href="/" target="_blank" className="hover:text-[#DA5004] font-medium transition">
                {s.developerPortal}
              </Link>
              <span>•</span>
              <Link href="/support" target="_blank" className="hover:text-[#DA5004] font-medium transition">
                {s.support}
              </Link>
              <span>•</span>
              <Link href="/terms" target="_blank" className="hover:text-[#DA5004] font-medium transition">
                {s.terms}
              </Link>
              <span>•</span>
              <Link href="/privacy" target="_blank" className="hover:text-[#DA5004] font-medium transition">
                {s.privacy}
              </Link>
            </div>
          </div>
        </footer>

        {/* 4. Mobile Floating Bottom Navigation Dock (< lg) */}
        <nav
          className="fixed bottom-0 inset-x-0 z-30 lg:hidden bg-white/95 backdrop-blur-md border-t border-[#161514]/10 shadow-2xl h-16 px-2 flex items-center justify-around"
          aria-label="شريط التنقل السريع للهاتف"
        >
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[44px] rounded-xl px-2 py-1 transition-all ${
                  item.active
                    ? "text-[#DA5004] font-bold"
                    : "text-[#161514]/55 hover:text-[#161514] font-medium"
                }`}
              >
                <div
                  className={`p-1 rounded-xl transition ${
                    item.active
                      ? "bg-[#F85B04]/10 text-[#F85B04]"
                      : "text-[#161514]/55"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
