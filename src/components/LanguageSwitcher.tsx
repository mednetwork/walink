"use client";

import React from "react";
import { useI18n } from "@/lib/i18n/context";
import { Locale } from "@/lib/i18n/translations";

export function LanguageSwitcher({
  className = "",
  size = "md",
  variant = "light",
}: {
  className?: string;
  size?: "sm" | "md";
  variant?: "light" | "dark";
}) {
  const { locale, setLocale } = useI18n();

  const locales: { key: Locale; label: string }[] = [
    { key: "ar", label: "عربي" },
    { key: "fr", label: "FR" },
    { key: "es", label: "ES" },
  ];

  return (
    <div
      className={`walink-lang-switcher ${variant === "dark" ? "dark" : "light"} ${
        size === "sm" ? "sm" : ""
      } ${className}`}
      role="radiogroup"
      aria-label="Language Selector"
      dir="ltr"
    >
      {locales.map((item) => {
        const isActive = locale === item.key;
        return (
          <button
            key={item.key}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setLocale(item.key)}
            className={`lang-pill ${isActive ? "active" : ""}`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
