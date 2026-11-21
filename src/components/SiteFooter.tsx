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
      className="bg-[#0B0F17] text-white border-t border-white/10 relative z-20"
      dir={isRTL ? "rtl" : "ltr"}
      aria-label={t.footer.colEssential}
    >
      {/* Top Subtle Emerald Glow */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00A884]/40 to-transparent pointer-events-none" />

      {/* Main Container - Strictly Centered on Wide Screens */}
      <div
        className="footer-wrap mx-auto px-4 sm:px-6 pt-14 pb-12"
        style={{ marginInline: "auto" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* Column 1: Brand Info & Identity (4 Cols on LG) */}
          <div className="lg:col-span-4 space-y-5">
            <Link
              href="/"
              className="inline-flex items-center gap-2 group focus:outline-none focus:ring-2 focus:ring-[#00A884] rounded-xl"
              aria-label="Walink.ma"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00A884] to-[#008069] flex items-center justify-center text-white font-bold shadow-md shadow-[#008069]/20 group-hover:scale-105 transition">
                <Sparkles className="w-5 h-5 flex-shrink-0" />
              </div>
              <div className="flex items-baseline gap-1.5 font-bold tracking-tight">
                <span className="text-xl text-white font-mono">
                  walink<span className="text-[#00A884]">.ma</span>
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/80 font-medium border border-white/10">
                  {t.brand.arabicName}
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-sm">
              {t.footer.brandTagline}
            </p>

            {/* Moroccan Pride Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/80">
              <span className="text-sm">🇲🇦</span>
              <span>{t.footer.moroccoBadge}</span>
            </div>

            {/* Tech Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-white/60">
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1.5">
                <span>🍏</span> Apple Wallet
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1.5">
                <span>🤖</span> Google Wallet
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 flex-shrink-0 text-[#00A884]" /> NFC & QR
              </span>
            </div>

            {/* Official WhatsApp Contact Button */}
            <div className="pt-1">
              <a
                href="https://wa.me/212661848790"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00A884]/15 hover:bg-[#00A884]/25 text-[#00A884] border border-[#00A884]/30 text-xs font-semibold transition hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>💬</span>
                <span>{t.footer.supportWa}</span>
                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
              </a>
            </div>
          </div>

          {/* Column 2: Essential Pages & Support (3 Cols on LG) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/90 flex items-center gap-2 pb-1 border-b border-white/10">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 text-[#00A884]" />
              <span>{t.footer.colEssential}</span>
            </h3>
            <ul className="space-y-2.5 text-xs text-white/70">
              <li>
                <Link
                  href="/support"
                  className="hover:text-[#00A884] transition flex items-center gap-2 group py-1"
                >
                  <HelpCircle className="w-3.5 h-3.5 flex-shrink-0 text-white/40 group-hover:text-[#00A884] transition" />
                  <span className="font-semibold text-white/90 group-hover:text-[#00A884]">
                    {t.footer.supportLink}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                    24/7
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-[#00A884] transition flex items-center gap-2 group py-1"
                >
                  <Lock className="w-3.5 h-3.5 flex-shrink-0 text-white/40 group-hover:text-[#00A884] transition" />
                  <span>{t.footer.privacyLink}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-[#00A884] transition flex items-center gap-2 group py-1"
                >
                  <FileText className="w-3.5 h-3.5 flex-shrink-0 text-white/40 group-hover:text-[#00A884] transition" />
                  <span>{t.footer.termsLink}</span>
                </Link>
              </li>
              <li>
                <a
                  href="#faq"
                  className="hover:text-[#00A884] transition flex items-center gap-2 group py-1"
                >
                  <HelpCircle className="w-3.5 h-3.5 flex-shrink-0 text-white/40 group-hover:text-[#00A884] transition" />
                  <span>{t.footer.faqLink}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform & Features (3 Cols on LG) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/90 flex items-center gap-2 pb-1 border-b border-white/10">
              <Radio className="w-4 h-4 flex-shrink-0 text-[#00A884]" />
              <span>{t.footer.colPlatform}</span>
            </h3>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <a href="#demo" className="hover:text-[#00A884] transition block py-1 font-medium">
                  {t.footer.demoLink}
                </a>
              </li>
              <li>
                <a href="#engines" className="hover:text-[#00A884] transition block py-1 font-medium">
                  {t.footer.enginesLink}
                </a>
              </li>
              <li>
                <a href="#engines" className="hover:text-[#00A884] transition block py-1 font-medium">
                  {t.footer.radarLink}
                </a>
              </li>
              <li>
                <a href="#stand" className="hover:text-[#00A884] transition block py-1 font-medium">
                  {t.footer.standLink}
                </a>
              </li>
              <li>
                <a href="#roi" className="hover:text-[#00A884] transition block py-1 font-medium">
                  {t.footer.roiLink}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Pricing & Admin Portal (2 Cols on LG) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/90 flex items-center gap-2 pb-1 border-b border-white/10">
              <Coins className="w-4 h-4 flex-shrink-0 text-[#00A884]" />
              <span>{t.footer.colPricing}</span>
            </h3>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <a href="#pricing" className="hover:text-[#00A884] transition block py-1 font-medium">
                  {t.footer.growthPack}
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-[#00A884] transition block py-1 font-medium">
                  {t.footer.starterPack}
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-[#00A884] transition block py-1 font-medium">
                  {t.footer.multiPack}
                </a>
              </li>
              <li className="pt-2 border-t border-white/10">
                <Link
                  href="/admin"
                  className="hover:text-[#00A884] transition font-bold text-white flex items-center gap-1.5 py-1"
                >
                  <Lock className="w-3.5 h-3.5 flex-shrink-0 text-[#00A884]" />
                  <span>{t.footer.adminLink}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/outreach"
                  className="hover:text-white transition block py-1 text-white/60 font-medium"
                >
                  {t.footer.outreachLink}
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Sub-Footer Bar - Strictly Centered on Wide Screens */}
      <div className="bg-[#080B11] border-t border-white/10">
        <div
          className="footer-wrap mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ marginInline: "auto" }}
        >
          {/* Copyright & CNDP Compliance */}
          <div className="text-center md:text-start space-y-1">
            <p className="text-xs text-white/60">
              © {new Date().getFullYear()} Walink (walink.ma) • {t.footer.copyright}
            </p>
            <p className="text-[11px] text-white/40">
              {t.footer.cndpNotice}
            </p>
          </div>

          {/* Language Switcher & Scroll to top */}
          <div className="flex items-center gap-3">
            <div className="walink-footer-lang">
              <LanguageSwitcher size="sm" variant="dark" />
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              aria-label="الرجوع للأعلى"
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition shadow-sm hover:scale-105 active:scale-95"
            >
              <ArrowUp className="w-4 h-4 flex-shrink-0 text-[#00A884]" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
