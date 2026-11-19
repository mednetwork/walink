"use client";

import React, { useState, useRef, useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";
import { Locale } from "@/lib/i18n/translations";

interface LanguageOption {
  key: Locale;
  label: string;
  nativeName: string;
  flag: string;
  code: string;
}

const LANGUAGES: LanguageOption[] = [
  { key: "ar", label: "العربية", nativeName: "العربية", flag: "🇲🇦", code: "AR" },
  { key: "fr", label: "Français", nativeName: "Français", flag: "🇫🇷", code: "FR" },
  { key: "es", label: "Español", nativeName: "Español", flag: "🇪🇸", code: "ES" },
];

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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.key === locale) || LANGUAGES[0];

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (key: Locale) => {
    setLocale(key);
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      className={`walink-lang-dropdown ${variant === "dark" ? "dark" : "light"} ${
        size === "sm" ? "sm" : ""
      } ${className}`}
    >
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        className={`lang-trigger-btn ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Select Language"
      >
        <span className="lang-globe-icon" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="15"
            height="15"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </span>
        <span className="lang-trigger-flag">{currentLang.flag}</span>
        <span className="lang-trigger-name">{currentLang.label}</span>
        <span className="lang-trigger-chevron" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="12"
            height="12"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {/* Dropdown Popover Menu */}
      {isOpen && (
        <div
          className="lang-menu-popover"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="lang-menu-header">
            <span>
              {locale === "fr"
                ? "Choisir la langue"
                : locale === "es"
                ? "Seleccionar idioma"
                : "اختر لغة العرض"}
            </span>
          </div>
          <div className="lang-menu-list">
            {LANGUAGES.map((lang) => {
              const isSelected = locale === lang.key;
              return (
                <button
                  key={lang.key}
                  type="button"
                  role="menuitem"
                  onClick={() => handleSelect(lang.key)}
                  className={`lang-menu-item ${isSelected ? "active" : ""}`}
                >
                  <span className="lang-item-flag">{lang.flag}</span>
                  <div className="lang-item-info">
                    <span className="lang-item-name">{lang.nativeName}</span>
                    <span className="lang-item-code">{lang.code}</span>
                  </div>
                  {isSelected && (
                    <span className="lang-item-check" aria-hidden="true">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        width="14"
                        height="14"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
