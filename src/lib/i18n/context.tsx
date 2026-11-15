"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Locale, translations, TranslationDictionary } from "./translations";

interface I18nContextType {
  locale: Locale;
  dir: "rtl" | "ltr";
  isRTL: boolean;
  t: TranslationDictionary;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextType>({
  locale: "ar",
  dir: "rtl",
  isRTL: true,
  t: translations.ar,
  setLocale: () => {},
});

export function detectPhoneLocale(fallback: Locale = "fr"): Locale {
  if (typeof navigator === "undefined") return fallback;
  const langs = navigator.languages || [navigator.language || ""];
  for (const l of langs) {
    const lower = l.toLowerCase();
    if (lower.startsWith("fr")) return "fr";
    if (lower.startsWith("es")) return "es";
    if (lower.startsWith("ar")) return "ar";
  }
  return fallback;
}

export function getSavedLocale(): Locale {
  if (typeof window === "undefined") return "ar";
  try {
    const local = localStorage.getItem("walink_locale") as Locale;
    if (local && (local === "ar" || local === "fr" || local === "es")) {
      return local;
    }
    const match = document.cookie.match(/walink_locale=(ar|fr|es)/);
    if (match && match[1]) {
      return match[1] as Locale;
    }
  } catch {
    // ignore
  }
  return "ar";
}

export function I18nProvider({
  children,
  initialLocale,
  autoDetectPhone = false,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
  autoDetectPhone?: boolean;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || "ar");

  useEffect(() => {
    let chosen: Locale;
    if (autoDetectPhone) {
      // Mode B: detect phone OS language
      const saved = getSavedLocale();
      if (saved && localStorage.getItem("walink_locale_manual")) {
        chosen = saved;
      } else {
        chosen = detectPhoneLocale("fr");
      }
    } else {
      // Mode A: user preference
      chosen = getSavedLocale();
    }
    setLocaleState(chosen);
    applyDocAttributes(chosen);

    const onLocaleChange = (e: Event) => {
      const custom = e as CustomEvent<Locale>;
      if (custom.detail) {
        setLocaleState(custom.detail);
        applyDocAttributes(custom.detail);
      }
    };
    window.addEventListener("walink_locale_change", onLocaleChange as EventListener);
    return () => {
      window.removeEventListener("walink_locale_change", onLocaleChange as EventListener);
    };
  }, [autoDetectPhone]);

  const applyDocAttributes = (l: Locale) => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = l;
      document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    }
  };

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    applyDocAttributes(newLocale);
    try {
      localStorage.setItem("walink_locale", newLocale);
      localStorage.setItem("walink_locale_manual", "true");
      document.cookie = `walink_locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // ignore
    }
    window.dispatchEvent(
      new CustomEvent("walink_locale_change", { detail: newLocale })
    );
  };

  const dir: "rtl" | "ltr" = locale === "ar" ? "rtl" : "ltr";
  const isRTL = dir === "rtl";
  const t = translations[locale] || translations.ar;

  return (
    <I18nContext.Provider value={{ locale, dir, isRTL, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
