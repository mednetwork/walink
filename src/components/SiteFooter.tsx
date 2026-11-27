"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function SiteFooter() {
  const { locale, dir, t } = useI18n();
  const isRtl = dir === "rtl";

  return (
    <footer
      dir={dir}
      className="relative border-t border-white/10 bg-[#161514] text-white"
    >
      <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <div
          className={`grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-12 ${
            isRtl ? "text-right" : "text-left"
          }`}
        >
          {/* Column 1: Brand & Morocco Identity */}
          <div className="lg:col-span-5 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-white no-underline"
              aria-label="Walink.ma"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F85B04] text-lg font-black text-white shadow-sm">
                W
              </span>
              <span className="text-lg font-extrabold tracking-tight text-white">
                walink.ma
              </span>
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-white/65">
              {t.footer.brandTagline}
            </p>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-xs font-bold text-[#FA7F3B]">
              <span>{t.footer.moroccoBadge}</span>
            </div>

            <div className="pt-1">
              <LanguageSwitcher size="sm" variant="dark" />
            </div>
          </div>

          {/* Column 2: Platform */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
              {t.footer.colPlatform}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/#demo"
                  className="inline-block py-1 text-white/65 transition hover:text-[#FA7F3B]"
                >
                  {t.footer.demoLink}
                </Link>
              </li>
              <li>
                <Link
                  href="/#features"
                  className="inline-block py-1 text-white/65 transition hover:text-[#FA7F3B]"
                >
                  {t.footer.enginesLink}
                </Link>
              </li>
              <li>
                <Link
                  href="/#roi"
                  className="inline-block py-1 text-white/65 transition hover:text-[#FA7F3B]"
                >
                  {t.footer.roiLink}
                </Link>
              </li>
              <li>
                <Link
                  href="/#faq"
                  className="inline-block py-1 text-white/65 transition hover:text-[#FA7F3B]"
                >
                  {t.footer.faqLink}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Pricing */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
              {t.footer.colPricing}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/#pricing"
                  className="inline-block py-1 text-white/65 transition hover:text-[#FA7F3B]"
                >
                  {t.footer.starterPack}
                </Link>
              </li>
              <li>
                <Link
                  href="/#pricing"
                  className="inline-block py-1 font-bold text-[#FA7F3B] transition hover:text-white"
                >
                  {t.footer.growthPack}
                </Link>
              </li>
              <li>
                <Link
                  href="/#pricing"
                  className="inline-block py-1 text-white/65 transition hover:text-[#FA7F3B]"
                >
                  {t.footer.multiPack}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Essential Pages & Support (Stealth Mode: zero /admin links) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
              {t.footer.colEssential}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/support"
                  className="inline-block py-1 text-white/65 transition hover:text-[#FA7F3B]"
                >
                  {t.footer.supportLink}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="inline-block py-1 text-white/65 transition hover:text-[#FA7F3B]"
                >
                  {t.footer.privacyLink}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="inline-block py-1 text-white/65 transition hover:text-[#FA7F3B]"
                >
                  {t.footer.termsLink}
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/212661848790"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-bold text-white transition hover:border-[#F85B04] hover:bg-[#F85B04]"
                >
                  <span>💬</span>
                  <span dir="ltr">{t.footer.supportWa}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & CNDP Notice */}
        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p>© {new Date().getFullYear()} Walink.ma — {t.footer.copyright}</p>
            <p className="text-[11px] text-white/40">{t.footer.cndpNotice}</p>
          </div>
          <p className="font-mono text-[11px] text-white/40">
            {locale === "fr"
              ? "Apple Wallet • Google Wallet • Web Push"
              : locale === "es"
              ? "Apple Wallet • Google Wallet • Web Push"
              : "Apple Wallet • Google Wallet • Web Push"}
          </p>
        </div>
      </div>
    </footer>
  );
}
