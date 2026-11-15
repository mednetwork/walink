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
  Calendar,
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

  // Mode B: Detect phone OS language on mount
  const [locale, setLocale] = useState<Locale>("ar");

  useEffect(() => {
    const detected = detectPhoneLocale("fr");
    setLocale(detected);
  }, []);

  const t = translations[locale] || translations.ar;
  const isRTL = locale === "ar";

  const loyaltyMode = merchant.loyaltyMode || "BOTH";
  const defaultType: "STAMPS" | "CASHBACK" =
    loyaltyMode === "CASHBACK" ? "CASHBACK" : "STAMPS";

  const [selectedLoyaltyType, setSelectedLoyaltyType] =
    useState<"STAMPS" | "CASHBACK">(defaultType);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          ? "رقم الهاتف غير صحيح (مثال: 0612345678)"
          : locale === "fr"
          ? "Numéro de téléphone invalide (ex: 0612345678)"
          : "Número de teléfono no válido (ej: 0612345678)"
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
          phone,
          birthday,
          loyaltyType: selectedLoyaltyType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "تعذر تفعيل البطاقة");
      }

      // Smooth transition to Customer Live Pass
      router.push(`/pass/${data.passSerial}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          locale === "ar"
            ? "حدث خطأ غير متوقع، يرجى إعادة المحاولة"
            : "Une erreur est survenue, veuillez réessayer"
        );
      }
      setLoading(false);
    }
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="w-full max-w-[430px] mx-auto min-h-screen flex flex-col justify-between p-4 sm:p-6 text-white selection:bg-emerald-500 selection:text-black"
    >
      <div className="space-y-6 pt-2">
        {/* Top Header Badge & Language Pill */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{merchant.city} • Walink</span>
          </div>

          {/* Quick Corner Language Selector */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setLocale("ar")}
              className={`px-2 py-0.5 rounded-full transition ${
                locale === "ar"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              عربي
            </button>
            <button
              type="button"
              onClick={() => setLocale("fr")}
              className={`px-2 py-0.5 rounded-full transition ${
                locale === "fr"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              FR
            </button>
            <button
              type="button"
              onClick={() => setLocale("es")}
              className={`px-2 py-0.5 rounded-full transition ${
                locale === "es"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ES
            </button>
          </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            {locale === "ar" ? (
              <>
                احصل على بطاقة ولاء <span className="text-emerald-400">{merchant.name}</span> في ثوانٍ
              </>
            ) : locale === "fr" ? (
              <>
                Obtenez votre carte <span className="text-emerald-400">{merchant.name}</span> en 5s
              </>
            ) : (
              <>
                Obtén tu tarjeta de <span className="text-emerald-400">{merchant.name}</span> en 5s
              </>
            )}
          </h1>
          <p className="text-xs text-white/70 max-w-xs mx-auto">
            {isCashback
              ? t.onboarding.welcomeGiftCashback.replace(
                  "{amount}",
                  String(welcomeCashback)
                ).replace("{currency}", currency)
              : t.onboarding.welcomeGiftStamps}
          </p>
        </div>

        {/* Live Morphing Wallet Pass Preview */}
        <div className="py-2">
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
            <span className="text-xs font-semibold text-slate-300 block">
              {t.onboarding.chooseProgram}
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedLoyaltyType("STAMPS")}
                className={`p-3 rounded-2xl text-start transition-all border ${
                  selectedLoyaltyType === "STAMPS"
                    ? "bg-emerald-500/15 border-emerald-500/40 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40"
                    : "bg-white/5 border-white/10 hover:bg-white/10 text-white/70"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-400 mb-1">
                  <Gift className="w-4 h-4" />
                  <span>{t.onboarding.stampsProgramTitle}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  {t.onboarding.stampsProgramDesc
                    .replace("{stamps}", String(merchant.stampsRequired))
                    .replace("{reward}", merchant.rewardName)}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedLoyaltyType("CASHBACK")}
                className={`p-3 rounded-2xl text-start transition-all border ${
                  selectedLoyaltyType === "CASHBACK"
                    ? "bg-amber-500/15 border-amber-500/40 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40"
                    : "bg-white/5 border-white/10 hover:bg-white/10 text-white/70"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-300 mb-1">
                  <Coins className="w-4 h-4" />
                  <span>
                    {t.onboarding.cashbackProgramTitle.replace(
                      "{rate}",
                      String(cashbackRate)
                    )}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
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
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/80 block">
              {t.onboarding.nameLabel}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.onboarding.namePlaceholder}
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/80 block">
              {t.onboarding.phoneLabel}
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.onboarding.phonePlaceholder}
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition text-sm font-mono"
              />
              <Smartphone className={`w-4 h-4 text-white/40 absolute ${isRTL ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 pointer-events-none`} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/80 block">
              {t.onboarding.birthdayLabel}
            </label>
            <div className="relative">
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition text-sm font-mono"
              />
              <Calendar className={`w-4 h-4 text-white/40 absolute ${isRTL ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 pointer-events-none`} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 shadow-lg shadow-emerald-500/25 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
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
      <div className="pt-6 pb-2 text-center space-y-2 text-[11px] text-white/50">
        <div className="flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Apple Wallet & Google Wallet • مشفّرة 100%</span>
        </div>
        <p>© {new Date().getFullYear()} Walink (walink.ma)</p>
      </div>
    </div>
  );
}
