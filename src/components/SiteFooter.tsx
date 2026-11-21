"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Sparkles,
  HelpCircle,
  FileText,
  Lock,
  ArrowUp,
  Radio,
  Coins,
  QrCode,
  ExternalLink,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function SiteFooter() {
  const { t, isRTL } = useI18n();

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer
      className="bg-white text-[#111B21] border-t border-[#E9EDEF] relative z-20"
      dir={isRTL ? "rtl" : "ltr"}
      aria-label={t.footer.colEssential}
    >
      {/* Top Accent Emerald Hairline */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#008069]/35 to-transparent pointer-events-none" />

      {/* Main Container - Matches Universal 1160px .wrap Parity */}
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 pt-14 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* Column 1: Brand Info & Identity (4 Cols on LG) */}
          <div className="lg:col-span-4 space-y-5">
            <Link
              href="/"
              className="inline-flex items-center gap-2 group focus:outline-none focus:ring-2 focus:ring-[#008069] rounded-xl"
              aria-label="Walink.ma"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00A884] to-[#008069] flex items-center justify-center text-white font-bold shadow-sm shadow-[#008069]/20 group-hover:scale-105 transition">
                <Sparkles className="w-5 h-5 flex-shrink-0" />
              </div>
              <div className="flex items-baseline gap-1.5 font-bold tracking-tight">
                <span className="text-xl text-[#111B21] font-mono">
                  walink<span className="text-[#008069]">.ma</span>
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#F0F2F5] text-[#54656F] font-semibold border border-[#E9EDEF]">
                  {t.brand.arabicName}
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-[#54656F] leading-relaxed max-w-sm">
              {t.footer.brandTagline}
            </p>

            {/* Moroccan Pride Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F0F2F5] border border-[#E9EDEF] text-xs text-[#111B21] font-medium shadow-sm">
              <span className="text-sm">🇲🇦</span>
              <span>{t.footer.moroccoBadge}</span>
            </div>

            {/* Tech Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[#54656F]">
              <span className="px-2.5 py-1 rounded-lg bg-[#F7F8FA] border border-[#E9EDEF] flex items-center gap-1.5 font-medium">
                <span>🍏</span> Apple Wallet
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#F7F8FA] border border-[#E9EDEF] flex items-center gap-1.5 font-medium">
                <span>🤖</span> Google Wallet
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#F7F8FA] border border-[#E9EDEF] flex items-center gap-1.5 font-medium">
                <QrCode className="w-3.5 h-3.5 flex-shrink-0 text-[#008069]" /> NFC & QR
              </span>
            </div>

            {/* Official WhatsApp Contact Button */}
            <div className="pt-1">
              <a
                href="https://wa.me/212661848790"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E8F5E9] hover:bg-[#D4EDDA] text-[#008069] border border-[#008069]/30 text-xs font-bold transition hover:scale-[1.02] active:scale-[0.98] shadow-sm"
              >
                <span>💬</span>
                <span>{t.footer.supportWa}</span>
                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
              </a>
            </div>
          </div>

          {/* Column 2: Essential Pages & Support (3 Cols on LG) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111B21] flex items-center gap-2 pb-1 border-b border-[#F0F2F5]">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 text-[#008069]" />
              <span>{t.footer.colEssential}</span>
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  href="/support"
                  className="hover:text-[#008069] transition flex items-center gap-2 group py-1"
                >
                  <HelpCircle className="w-3.5 h-3.5 flex-shrink-0 text-[#8696A0] group-hover:text-[#008069] transition" />
                  <span className="font-semibold text-[#111B21] group-hover:text-[#008069] transition">
                    {t.footer.supportLink}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E8F5E9] text-[#008069] font-mono font-bold">
                    24/7
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-[#008069] transition flex items-center gap-2 group py-1"
                >
                  <Lock className="w-3.5 h-3.5 flex-shrink-0 text-[#8696A0] group-hover:text-[#008069] transition" />
                  <span className="text-[#54656F] group-hover:text-[#008069] transition">
                    {t.footer.privacyLink}
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-[#008069] transition flex items-center gap-2 group py-1"
                >
                  <FileText className="w-3.5 h-3.5 flex-shrink-0 text-[#8696A0] group-hover:text-[#008069] transition" />
                  <span className="text-[#54656F] group-hover:text-[#008069] transition">
                    {t.footer.termsLink}
                  </span>
                </Link>
              </li>
              <li>
                <a
                  href="#faq"
                  className="hover:text-[#008069] transition flex items-center gap-2 group py-1"
                >
                  <HelpCircle className="w-3.5 h-3.5 flex-shrink-0 text-[#8696A0] group-hover:text-[#008069] transition" />
                  <span className="text-[#54656F] group-hover:text-[#008069] transition">
                    {t.footer.faqLink}
                  </span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform & Features (3 Cols on LG) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111B21] flex items-center gap-2 pb-1 border-b border-[#F0F2F5]">
              <Radio className="w-4 h-4 flex-shrink-0 text-[#008069]" />
              <span>{t.footer.colPlatform}</span>
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#demo" className="text-[#54656F] hover:text-[#008069] transition block py-1 font-medium">
                  {t.footer.demoLink}
                </a>
              </li>
              <li>
                <a href="#engines" className="text-[#54656F] hover:text-[#008069] transition block py-1 font-medium">
                  {t.footer.enginesLink}
                </a>
              </li>
              <li>
                <a href="#engines" className="text-[#54656F] hover:text-[#008069] transition block py-1 font-medium">
                  {t.footer.radarLink}
                </a>
              </li>
              <li>
                <a href="#stand" className="text-[#54656F] hover:text-[#008069] transition block py-1 font-medium">
                  {t.footer.standLink}
                </a>
              </li>
              <li>
                <a href="#roi" className="text-[#54656F] hover:text-[#008069] transition block py-1 font-medium">
                  {t.footer.roiLink}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Pricing & Admin Portal (2 Cols on LG) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111B21] flex items-center gap-2 pb-1 border-b border-[#F0F2F5]">
              <Coins className="w-4 h-4 flex-shrink-0 text-[#008069]" />
              <span>{t.footer.colPricing}</span>
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#pricing" className="text-[#54656F] hover:text-[#008069] transition block py-1 font-medium">
                  {t.footer.growthPack}
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-[#54656F] hover:text-[#008069] transition block py-1 font-medium">
                  {t.footer.starterPack}
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-[#54656F] hover:text-[#008069] transition block py-1 font-medium">
                  {t.footer.multiPack}
                </a>
              </li>
              <li className="pt-2 border-t border-[#F0F2F5]">
                <Link
                  href="/admin"
                  className="hover:text-[#008069] transition font-bold text-[#111B21] flex items-center gap-1.5 py-1"
                >
                  <Lock className="w-3.5 h-3.5 flex-shrink-0 text-[#008069]" />
                  <span>{t.footer.adminLink}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/outreach"
                  className="text-[#8696A0] hover:text-[#008069] transition block py-1 font-medium"
                >
                  {t.footer.outreachLink}
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Sub-Footer Bar with Light Background */}
      <div className="bg-[#F7F8FA] border-t border-[#E9EDEF]">
        <div className="max-w-[1160px] mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Copyright & CNDP Compliance */}
          <div className="text-center md:text-start space-y-1">
            <p className="text-xs text-[#54656F] font-medium">
              © {new Date().getFullYear()} Walink (walink.ma) • {t.footer.copyright}
            </p>
            <p className="text-[11px] text-[#8696A0]">
              {t.footer.cndpNotice}
            </p>
          </div>

          {/* Language Switcher & Scroll to top */}
          <div className="flex items-center gap-3">
            <div className="walink-footer-lang">
              <LanguageSwitcher size="sm" variant="light" />
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              aria-label="الرجوع للأعلى"
              className="w-9 h-9 rounded-xl bg-white hover:bg-[#F0F2F5] border border-[#D1D7DB] flex items-center justify-center text-[#54656F] hover:text-[#111B21] transition shadow-sm hover:scale-105 active:scale-95"
            >
              <ArrowUp className="w-4 h-4 flex-shrink-0 text-[#008069]" />
            </button>
          </div>

        </div>
      </div>
    </footer>
  );
}
