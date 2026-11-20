"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  Sparkles,
  Target,
  PlusCircle,
  ExternalLink,
  HelpCircle,
  FileText,
  Shield,
  LogOut,
  X,
  Server,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n/context";

interface AdminSidebarNavProps {
  onClose?: () => void;
  isMobileDrawer?: boolean;
}

export default function AdminSidebarNav({
  onClose,
  isMobileDrawer = false,
}: AdminSidebarNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, isRTL } = useI18n();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      if (onClose) onClose();
      router.push("/admin/login");
      router.refresh();
    }
  };

  const s = t.admin?.sidebar || {
    mainMenu: "القائمة الرئيسية",
    dashboard: "لوحة التحكم المركزية",
    dashboardDesc: "نظرة عامة على المتاجر والأرصدة",
    automations: "محرك الأتمتة والذكاء",
    automationsDesc: "رادار القرب، التقييمات، والإشعارات",
    outreach: "استوديو المبيعات والتسويق",
    outreachDesc: "توليد كروت الهبوط وحملات العملاء",
    newMerchant: "إضافة متجر جديد",
    newMerchantDesc: "تسجيل كافيه، مطعم أو صالون",
    serverStatus: "خادم الإنتاج",
    serverConnected: "متصل 99.9%",
    serverNode: "Casablanca Node 22 (Hostinger Cloud)",
    quickLinks: "بوابة الزوار والروابط السريعة",
    developerPortal: "بوابة المطورين والرئيسية",
    support: "مركز الدعم الفني",
    terms: "شروط الخدمة",
    privacy: "سياسة الخصوصية",
    logout: "تسجيل الخروج من المنصة",
    closeMenu: "إغلاق القائمة",
    openMenu: "فتح القائمة الجانبية",
    superAdminSuite: "Super Admin Suite v2.5",
    viewWebsite: "عرض الموقع",
    navHome: "الرئيسية",
    navAutomations: "الأتمتة",
    navOutreach: "المبيعات",
    navNewMerchant: "متجر جديد",
    addShort: "متجر",
  };

  const mainNavItems = [
    {
      href: "/admin",
      label: s.dashboard,
      description: s.dashboardDesc,
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      href: "/admin/automations",
      label: s.automations,
      description: s.automationsDesc,
      icon: Sparkles,
      active: pathname === "/admin/automations",
    },
    {
      href: "/admin/outreach",
      label: s.outreach,
      description: s.outreachDesc,
      icon: Target,
      active: pathname === "/admin/outreach",
    },
    {
      href: "/admin/merchants/new",
      label: s.newMerchant,
      description: s.newMerchantDesc,
      icon: PlusCircle,
      active: pathname === "/admin/merchants/new",
      highlight: true,
    },
  ];

  const quickLinks = [
    {
      href: "/",
      label: s.developerPortal,
      icon: ExternalLink,
      target: "_blank",
    },
    {
      href: "/support",
      label: s.support,
      icon: HelpCircle,
      target: "_blank",
    },
    {
      href: "/terms",
      label: s.terms,
      icon: FileText,
      target: "_blank",
    },
    {
      href: "/privacy",
      label: s.privacy,
      icon: Shield,
      target: "_blank",
    },
  ];

  return (
    <div className="h-full flex flex-col justify-between bg-[#0B141A] text-white selection:bg-[#008069] selection:text-white border-e border-[#1F2C34]">
      {/* Top Header & Branding */}
      <div className="p-5 border-b border-[#1F2C34] flex items-center justify-between">
        <Link
          href="/admin"
          onClick={onClose}
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00A884] to-[#008069] flex items-center justify-center text-white font-bold shadow-lg shadow-[#008069]/30 group-hover:scale-105 transition-transform duration-200 flex-shrink-0">
            <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg text-white tracking-tight">
                walink<span className="text-[#00A884]">.ma</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#008069]/20 text-[#00A884] border border-[#008069]/40 font-bold">
                PRO
              </span>
            </div>
            <span className="text-[11px] text-neutral-400 font-medium">
              {s.superAdminSuite}
            </span>
          </div>
        </Link>

        {isMobileDrawer && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition"
            aria-label={s.closeMenu}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
        {/* Core Navigation Group */}
        <div>
          <span className="px-3 text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
            {s.mainMenu}
          </span>
          <nav className="space-y-1.5">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150 ${
                    item.active
                      ? "bg-[#008069] text-white shadow-md shadow-[#008069]/30 font-bold"
                      : item.highlight
                      ? "bg-[#008069]/10 text-[#00A884] hover:bg-[#008069]/20 border border-[#008069]/30"
                      : "text-neutral-300 hover:text-white hover:bg-[#111B21] border border-transparent"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                      item.active
                        ? "text-white"
                        : item.highlight
                        ? "text-[#00A884]"
                        : "text-neutral-400 group-hover:text-white"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="block truncate">{item.label}</span>
                    <span
                      className={`text-[10px] block truncate font-normal ${
                        item.active
                          ? "text-emerald-100"
                          : "text-neutral-500 group-hover:text-neutral-400"
                      }`}
                    >
                      {item.description}
                    </span>
                  </div>
                  {item.active && (
                    <span className="w-1.5 h-4 rounded-full bg-white flex-shrink-0" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Server & Cloud Monitor Pill */}
        <div className="p-3 rounded-2xl bg-[#111B21] border border-[#1F2C34] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-200 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-[#00A884]" />
              <span>{s.serverStatus}</span>
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              {s.serverConnected}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-neutral-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00A884] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00A884]"></span>
            </span>
            <span>{s.serverNode}</span>
          </div>
        </div>

        {/* Secondary / External Pages Group */}
        <div>
          <span className="px-3 text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
            {s.quickLinks}
          </span>
          <nav className="space-y-1">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  target={link.target}
                  onClick={onClose}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-400 hover:text-white hover:bg-[#111B21] transition font-medium"
                >
                  <Icon className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                  <span className="truncate">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Profile & Logout Area */}
      <div className="p-4 border-t border-[#1F2C34] bg-[#0E171E] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00A884] to-[#008069] flex items-center justify-center font-bold text-xs text-white flex-shrink-0 shadow-sm">
              AD
            </div>
            <div className="truncate">
              <span className="font-bold text-xs text-white block truncate">
                Super Administrator
              </span>
              <span className="text-[10px] text-neutral-400 block truncate">
                admin@walink.ma
              </span>
            </div>
          </div>
          <LanguageSwitcher size="sm" />
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-[0.98]"
        >
          <LogOut className="w-4 h-4" />
          <span>{s.logout}</span>
        </button>
      </div>
    </div>
  );
}
