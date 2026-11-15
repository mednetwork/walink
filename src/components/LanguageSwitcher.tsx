"use client";

import React from "react";
import { useI18n } from "@/lib/i18n/context";
import { Locale } from "@/lib/i18n/translations";

export function LanguageSwitcher({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  const { locale, setLocale } = useI18n();

  const locales: { key: Locale; label: string }[] = [
    { key: "ar", label: "عربي" },
    { key: "fr", label: "FR" },
    { key: "es", label: "ES" },
  ];

  return (
    <div
      className={`inline-flex items-center gap-1 p-1 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-inner ${className}`}
      role="group"
      aria-label="Language Selector"
    >
      {locales.map((item) => {
        const isActive = locale === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => setLocale(item.key)}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
              isActive
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
            } ${size === "sm" ? "px-2 py-0.5 text-[11px]" : ""}`}
            aria-pressed={isActive}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

