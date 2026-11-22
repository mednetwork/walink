"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Smartphone,
  Gift,
  Coins,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Lock,
} from "lucide-react";
import WalletPassPreview from "@/components/WalletPassPreview";
import { isValidMoroccanPhone } from "@/lib/utils";
import { Locale, translations } from "@/lib/i18n/translations";
import { detectPhoneLocale } from "@/lib/i18n/context";

interface JoinFormMerchant {
  name: string;
  slug: string;
  niche: string;
  city: string;
  logoIcon: string;
  primaryColor: string;
  bgGradient: string;
  stampsRequired: number;
  rewardName: string;
  customerPrefix: string;
  loyaltyMode?: string; // STAMPS, CASHBACK, BOTH
  cashbackRate?: number;
  welcomeCashback?: number;
  currency?: string;
}

interface JoinFormClientProps {
  merchant: JoinFormMerchant;
}

export default function JoinFormClient({ merchant }: JoinFormClientProps) {
  const router = useRouter();

  // Mode B: Detect phone OS language on mount & sync with localStorage/URL
  const [locale, setLocale] = useState<Locale>("ar");

  useEffect(() => {
    let initialLocale: Locale = "ar";
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get("lang") as Locale | null;
      if (urlLang && (urlLang === "ar" || urlLang === "fr" || urlLang === "es")) {
        initialLocale = urlLang;
      } else {
        const stored = localStorage.getItem("walink_customer_locale") as Locale | null;
        if (stored && (stored === "ar" || stored === "fr" || stored === "es")) {
          initialLocale = stored;
        } else {
          initialLocale = detectPhoneLocale("fr");
        }
      }
      try {
        localStorage.setItem("walink_customer_locale", initialLocale);
      } catch (err) {
        console.warn("localStorage locale save error:", err);
      }
    }
    setLocale(initialLocale);
  }, []);

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("walink_customer_locale", newLocale);
      } catch (err) {
        console.warn("localStorage locale save error:", err);
      }
    }
  };

  const t = translations[locale] || translations.ar;
  const isRTL = locale === "ar";

  const loyaltyMode = merchant.loyaltyMode || "BOTH";
  const defaultType: "STAMPS" | "CASHBACK" =
    loyaltyMode === "CASHBACK" ? "CASHBACK" : "STAMPS";

  const [selectedLoyaltyType, setSelectedLoyaltyType] =
    useState<"STAMPS" | "CASHBACK">(defaultType);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [refCode, setRefCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const r = params.get("ref");
      if (r && /^\d{4}$/.test(r.trim())) {
        setRefCode(r.trim());
      }
    }
  }, []);

  const isCashback = selectedLoyaltyType === "CASHBACK";
  const cashbackRate = merchant.cashbackRate || 10;
  const welcomeCashback = merchant.welcomeCashback ?? 5;
  const currency = merchant.currency || "DH";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(
        locale === "ar"
          ? "يرجى كتابة الاسم الكامل"
          : locale === "fr"
          ? "Veuillez entrer votre nom complet"
          : "Por favor introduce tu nombre completo"
      );
      return;
    }

    if (!isValidMoroccanPhone(phone)) {
      setError(
        locale === "ar"
          ? "رقم الهاتف غير صحيح (مثال: 0612345678 أو +212612345678)"
          : locale === "fr"
          ? "Numéro de téléphone marocain invalide (ex: 0612345678)"
          : "Número de teléfono marroquí no válido (ej: 0612345678)"
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/join/${merchant.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          loyaltyType: selectedLoyaltyType,
          refCode: refCode || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create pass");
      }

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("walink_customer_locale", locale);
        } catch (err) {
          console.warn("localStorage locale save error:", err);
        }
      }

      router.push(`/pass/${data.passSerial}?lang=${locale}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء إنشاء البطاقة";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="w-full max-w-[460px] mx-auto min-h-screen bg-[#F0F2F5] flex flex-col justify-between p-4 sm:p-6 text-[#111B21] selection:bg-[#008069] selection:text-white"
    >
      <div className="bg-[#FFFFFF] rounded-2xl p-5 sm:p-7 border border-[#E9EDEF] shadow-sm space-y-6">
        {/* Top Header Badge & Language Pill */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F5E9] border border-[#C8E6C9] text-[#008069] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{merchant.city} • Walink</span>
          </div>

          {/* Quick Corner Language Selector */}
          <div className="flex items-center gap-1 bg-[#F0F2F5] border border-[#E9EDEF] rounded-full p-0.5 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => changeLocale("ar")}
              className={`px-2.5 py-0.5 rounded-full transition ${
                locale === "ar"
                  ? "bg-[#008069] text-white shadow-sm"
                  : "text-[#54656F] hover:text-[#111B21]"
              }`}
            >
              عربي
            </button>
            <button
              type="button"
              onClick={() => changeLocale("fr")}
              className={`px-2.5 py-0.5 rounded-full transition ${
                locale === "fr"
                  ? "bg-[#008069] text-white shadow-sm"
                  : "text-[#54656F] hover:text-[#111B21]"
              }`}
            >
              FR
            </button>
            <button
              type="button"
              onClick={() => changeLocale("es")}
              className={`px-2.5 py-0.5 rounded-full transition ${
                locale === "es"
                  ? "bg-[#008069] text-white shadow-sm"
                  : "text-[#54656F] hover:text-[#111B21]"
              }`}
            >
              ES
            </button>
          </div>
        </div>

        {refCode && (
          <div className="p-3.5 rounded-2xl bg-[#FFFBEB] border border-[#FCD34D] text-[#92400E] text-xs font-bold flex items-center gap-2.5 shadow-sm">
            <Gift className="w-4 h-4 text-[#D97706] shrink-0" />
            <span>{t.walletEnterprise.referral.referredBanner}</span>
          </div>
        )}

        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111B21] tracking-tight leading-tight">
            {locale === "ar" ? (
              <>
                احصل على بطاقة ولاء <span className="text-[#008069]">{merchant.name}</span> في ثوانٍ
              </>
            ) : locale === "fr" ? (
              <>
                Obtenez votre carte <span className="text-[#008069]">{merchant.name}</span> en 5s
              </>
            ) : (
              <>
                Obtén tu tarjeta de <span className="text-[#008069]">{merchant.name}</span> en 5s
              </>
            )}
          </h1>
          <p className="text-xs text-[#54656F] max-w-xs mx-auto font-medium">
            {isCashback
              ? t.onboarding.welcomeGiftCashback.replace(
                  "{amount}",
                  String(welcomeCashback)
                ).replace("{currency}", currency)
              : t.onboarding.welcomeGiftStamps}
          </p>
        </div>

        {/* Live Morphing Wallet Pass Preview */}
        <div className="py-1">
          <WalletPassPreview
            name={merchant.name}
            niche={merchant.niche}
            primaryColor={merchant.primaryColor}
            bgGradient={merchant.bgGradient}
            loyaltyType={selectedLoyaltyType}
            stampsRequired={merchant.stampsRequired}
            rewardName={merchant.rewardName}
            cashbackRate={cashbackRate}
            cashbackBalance={welcomeCashback}
            currency={currency}
            stamps={1}
            memberCode="----"
            compact
            locale={locale}
          />
        </div>

        {/* Dual Loyalty Program Choice (If merchant has BOTH) */}
        {loyaltyMode === "BOTH" && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#111B21] block">
              {t.onboarding.chooseProgram}
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedLoyaltyType("STAMPS")}
                className={`p-3.5 rounded-2xl text-start transition-all border ${
                  selectedLoyaltyType === "STAMPS"
                    ? "bg-[#E8F5E9] border-[#008069] shadow-sm ring-1 ring-[#008069]"
                    : "bg-[#FFFFFF] border-[#E9EDEF] hover:bg-[#F7F8FA] text-[#54656F]"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#008069] mb-1">
                  <Gift className="w-4 h-4" />
                  <span>{t.onboarding.stampsProgramTitle}</span>
                </div>
                <p className="text-[11px] text-[#54656F] leading-snug">
                  {t.onboarding.stampsProgramDesc
                    .replace("{stamps}", String(merchant.stampsRequired))
                    .replace("{reward}", merchant.rewardName)}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedLoyaltyType("CASHBACK")}
                className={`p-3.5 rounded-2xl text-start transition-all border ${
                  selectedLoyaltyType === "CASHBACK"
                    ? "bg-[#FFFBEB] border-[#D97706] shadow-sm ring-1 ring-[#D97706]"
                    : "bg-[#FFFFFF] border-[#E9EDEF] hover:bg-[#F7F8FA] text-[#54656F]"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#B45309] mb-1">
                  <Coins className="w-4 h-4" />
                  <span>
                    {t.onboarding.cashbackProgramTitle.replace(
                      "{rate}",
                      String(cashbackRate)
                    )}
                  </span>
                </div>
                <p className="text-[11px] text-[#54656F] leading-snug">
                  {t.onboarding.cashbackProgramDesc.replace(
                    "{rate}",
                    String(cashbackRate)
                  )}
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Customer Onboarding Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B] text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#111B21] block">
              {t.onboarding.nameLabel}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.onboarding.namePlaceholder}
              className="w-full px-4 py-3 rounded-2xl bg-[#FFFFFF] border-1.5 border-[#D1D7DB] text-[#111B21] placeholder-[#8696A0] focus:outline-none focus:border-[#008069] focus:ring-2 focus:ring-[#008069]/20 transition text-sm font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#111B21] block">
              {t.onboarding.phoneLabel}
            </label>
            <div className="relative">
              <input
                type="tel"
                inputMode="tel"
                pattern="[0-9]*"
                autoComplete="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.onboarding.phonePlaceholder}
                className="w-full px-4 py-3 rounded-2xl bg-[#FFFFFF] border-1.5 border-[#D1D7DB] text-[#111B21] placeholder-[#8696A0] focus:outline-none focus:border-[#008069] focus:ring-2 focus:ring-[#008069]/20 transition text-sm font-mono font-medium"
              />
              <Smartphone className={`w-4 h-4 text-[#8696A0] absolute ${isRTL ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 pointer-events-none`} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#00A884] to-[#008069] hover:from-[#009071] hover:to-[#006D59] text-white shadow-md shadow-[#008069]/25 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{t.onboarding.submitBtn}</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer Security Badges */}
      <div className="pt-6 pb-2 text-center space-y-2 text-[11px] text-[#54656F] font-medium">
        <div className="flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5 text-[#008069]" />
          <span>Apple Wallet & Google Wallet • مشفّرة 100%</span>
        </div>
        <p>© {new Date().getFullYear()} Walink (walink.ma)</p>
      </div>
    </div>
  );
}
