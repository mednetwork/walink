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
  ShieldCheck,
  KeyRound,
  X,
} from "lucide-react";
import WalletPassPreview from "@/components/WalletPassPreview";
import { isValidMoroccanPhone } from "@/lib/utils";
import { Locale, translations } from "@/lib/i18n/translations";
import { detectPhoneLocale } from "@/lib/i18n/context";
import { getPassUrl } from "@/lib/urls";

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
  const [customPin, setCustomPin] = useState("");
  const [showPinInput, setShowPinInput] = useState(false);
  const [refCode, setRefCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Security Recovery PIN Modal State
  const [pinModal, setPinModal] = useState<{
    isOpen: boolean;
    maskedName?: string;
    maskedPhone?: string;
    attemptsRemaining: number;
    locked?: boolean;
    minsRemaining?: number;
    errorMsg?: string | null;
  }>({
    isOpen: false,
    attemptsRemaining: 5,
  });
  const [pinCode, setPinCode] = useState("");
  const [verifyingPin, setVerifyingPin] = useState(false);

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

  const handleVerifyPin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pinCode || pinCode.trim().length !== 4) {
      setPinModal((prev) => ({
        ...prev,
        errorMsg:
          locale === "ar"
            ? "يرجى إدخال رمز الأمان المكون من 4 أرقام"
            : locale === "fr"
            ? "Veuillez entrer le code PIN à 4 chiffres"
            : "Por favor introduce el código PIN de 4 dígitos",
      }));
      return;
    }

    setVerifyingPin(true);
    setPinModal((prev) => ({ ...prev, errorMsg: null }));

    try {
      const res = await fetch(`/api/join/${merchant.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          securityPin: pinCode.trim(),
        }),
      });

      const data = await res.json();

      if (res.status === 423 || data.locked) {
        setPinModal((prev) => ({
          ...prev,
          locked: true,
          attemptsRemaining: 0,
          minsRemaining: data.minsRemaining || 15,
          errorMsg:
            data.error ||
            (locale === "ar"
              ? "تم قفل محاولات الاسترجاع مؤقتاً لمدة 15 دقيقة لحماية الحساب."
              : "Compte verrouillé temporairement pendant 15 minutes."),
        }));
        setVerifyingPin(false);
        return;
      }

      if (!res.ok) {
        setPinModal((prev) => ({
          ...prev,
          attemptsRemaining:
            typeof data.attemptsRemaining === "number"
              ? data.attemptsRemaining
              : Math.max(0, prev.attemptsRemaining - 1),
          errorMsg:
            data.error ||
            (locale === "ar" ? "رمز الأمان غير صحيح" : "Code PIN incorrect"),
        }));
        setVerifyingPin(false);
        return;
      }

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("walink_customer_locale", locale);
        } catch (err) {
          console.warn("localStorage locale save error:", err);
        }
      }

      // Smooth cross-subdomain transition from wjoin.walink.ma to wclient.walink.ma
      window.location.assign(getPassUrl(data.passSerial, locale));
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "حدث خطأ أثناء التحقق من الرمز";
      setPinModal((prev) => ({ ...prev, errorMsg: msg }));
      setVerifyingPin(false);
    }
  };

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
          ref: refCode || undefined,
          refCode: refCode || undefined,
          securityPin: customPin.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (res.status === 423 || data.locked) {
        setPinModal({
          isOpen: true,
          locked: true,
          attemptsRemaining: 0,
          minsRemaining: data.minsRemaining || 15,
          errorMsg: data.error,
        });
        setLoading(false);
        return;
      }

      if (data.requiresPin) {
        setPinModal({
          isOpen: true,
          maskedName: data.maskedName,
          maskedPhone: data.maskedPhone,
          attemptsRemaining: data.attemptsRemaining ?? 5,
          locked: false,
          errorMsg: null,
        });
        setLoading(false);
        return;
      }

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

      // Smooth cross-subdomain transition from wjoin.walink.ma to wclient.walink.ma
      window.location.assign(getPassUrl(data.passSerial, locale));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء إنشاء البطاقة";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="w-full max-w-[460px] mx-auto min-h-screen bg-[#FAF7F2] flex flex-col justify-between p-4 sm:p-6 text-[#173E30] selection:bg-[#008069] selection:text-white"
    >
      <div className="bg-[#FFFDF7] rounded-2xl p-5 sm:p-7 border border-[#DCE0D4] shadow-sm space-y-6">
        {/* Top Header Badge & Language Pill */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8F5E9] border border-[#A7F3D0] text-[#008069] text-xs font-bold tracking-tight shadow-xs">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#00A884] to-[#008069] flex items-center justify-center text-white flex-shrink-0 shadow-xs">
              <Sparkles className="w-2.5 h-2.5" />
            </div>
            <span dir="ltr" className="font-mono text-[13px] font-extrabold text-[#173E30] tracking-tight">
              walink<span className="text-[#00A884]">.ma</span>
            </span>
          </div>

          {/* Quick Corner Language Selector */}
          <div className="flex items-center gap-1 bg-[#FAF7F2] border border-[#DCE0D4] rounded-full p-0.5 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => changeLocale("ar")}
              className={`px-2.5 py-0.5 rounded-full transition ${
                locale === "ar"
                  ? "bg-[#008069] text-white shadow-sm"
                  : "text-[#5F655D] hover:text-[#173E30]"
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
                  : "text-[#5F655D] hover:text-[#173E30]"
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
                  : "text-[#5F655D] hover:text-[#173E30]"
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173E30] tracking-tight leading-tight">
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
        </div>

        {/* Live Morphing Wallet Pass Preview */}
        <div className="py-1">
          <WalletPassPreview
            name={merchant.name}
            niche={merchant.niche}
            logoIcon={merchant.logoIcon}
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
            <span className="text-xs font-bold text-[#173E30] block">
              {t.onboarding.chooseProgram}
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedLoyaltyType("STAMPS")}
                className={`p-3.5 rounded-2xl text-start transition-all border ${
                  selectedLoyaltyType === "STAMPS"
                    ? "bg-[#E8F5E9] border-[#008069] shadow-sm ring-1 ring-[#008069]"
                    : "bg-[#FFFDF7] border-[#DCE0D4] hover:bg-[#F7F8FA] text-[#5F655D]"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#008069]">
                  <Gift className="w-4 h-4" />
                  <span>{t.onboarding.stampsProgramTitle}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedLoyaltyType("CASHBACK")}
                className={`p-3.5 rounded-2xl text-start transition-all border ${
                  selectedLoyaltyType === "CASHBACK"
                    ? "bg-[#FFFBEB] border-[#D97706] shadow-sm ring-1 ring-[#D97706]"
                    : "bg-[#FFFDF7] border-[#DCE0D4] hover:bg-[#F7F8FA] text-[#5F655D]"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#B45309]">
                  <Coins className="w-4 h-4" />
                  <span>
                    {t.onboarding.cashbackProgramTitle.replace(
                      "{rate}",
                      String(cashbackRate)
                    )}
                  </span>
                </div>
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
            <label className="text-xs font-bold text-[#173E30] block">
              {t.onboarding.nameLabel}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.onboarding.namePlaceholder}
              className="w-full px-4 py-3 rounded-2xl bg-[#FFFDF7] border-2 border-[#DCE0D4] hover:border-[#C8D1BE] text-[#173E30] placeholder-[#8696A0] focus:outline-none focus:border-[#008069] focus:ring-2 focus:ring-[#008069]/20 transition text-base font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#173E30] block">
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
                className="w-full px-4 py-3 rounded-2xl bg-[#FFFDF7] border-2 border-[#DCE0D4] hover:border-[#C8D1BE] text-[#173E30] placeholder-[#8696A0] focus:outline-none focus:border-[#008069] focus:ring-2 focus:ring-[#008069]/20 transition text-base font-mono font-medium"
              />
              <Smartphone className={`w-4 h-4 text-[#8696A0] absolute ${isRTL ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 pointer-events-none`} />
            </div>
          </div>

          {/* Optional Security PIN Creation for New Pass */}
          <div className="space-y-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => setShowPinInput(!showPinInput)}
              className="text-[11px] font-bold text-[#008069] hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>
                {showPinInput
                  ? (locale === "ar" ? "إخفاء رمز الأمان (PIN)" : locale === "fr" ? "Masquer code PIN" : "Ocultar PIN")
                  : (locale === "ar" ? "+ تعيين رمز أمان مخصص للبطاقة (PIN اختياري)" : locale === "fr" ? "+ Définir un code PIN personnalisé (optionnel)" : "+ Definir PIN personalizado (opcional)")}
              </span>
            </button>

            {showPinInput && (
              <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#DCE0D4] space-y-1.5 animate-in fade-in duration-150">
                <label className="text-[11px] font-bold text-[#173E30] flex items-center justify-between">
                  <span>{locale === "ar" ? "رمز أمان البطاقة (4 أرقام):" : locale === "fr" ? "Code PIN de sécurité (4 chiffres):" : "Código PIN de seguridad (4 dígitos):"}</span>
                  <span className="text-[10px] text-[#5F655D] font-normal">{locale === "ar" ? "اختياري" : "Optionnel"}</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    pattern="[0-9]*"
                    value={customPin}
                    onChange={(e) => setCustomPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder={locale === "ar" ? "مثال: 1234 (الافتراضي كود العضوية)" : "Ex: 1234"}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-[#DCE0D4] hover:border-[#C8D1BE] text-[#173E30] placeholder-[#8696A0] focus:outline-none focus:border-[#008069] focus:ring-1 focus:ring-[#008069] text-base font-mono tracking-widest"
                  />
                  <Lock className={`w-3.5 h-3.5 text-[#8696A0] absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 pointer-events-none`} />
                </div>
                <p className="text-[10px] text-[#5F655D] leading-snug">
                  {locale === "ar"
                    ? "يُستخدم هذا الرمز لحماية رصيدك واسترجاع بطاقتك إذا قمت بحذفها أو غيرت هاتفك. في حال عدم إدخاله، سيكون رمزك هو كود عضويتك."
                    : locale === "fr"
                    ? "Utilisé pour protéger vos récompenses et récupérer votre pass. Par défaut, votre code sera votre numéro d'adhérent."
                    : "Usado para proteger tus puntos y recuperar tu tarjeta. Por defecto, será tu código de socio."}
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-full font-bold text-sm bg-gradient-to-r from-[#00A884] to-[#008069] hover:from-[#009071] hover:to-[#006D59] text-white shadow-md shadow-[#008069]/25 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
      <div className="pt-6 pb-2 text-center space-y-2 text-[11px] text-[#5F655D] font-medium">
        <div className="flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5 text-[#008069]" />
          <span>Apple Wallet &amp; Google Wallet • مشفّرة 100%</span>
        </div>
        <p>© {new Date().getFullYear()} {merchant.name}</p>
      </div>

      {/* Security PIN Verification Modal for Existing Customers */}
      {pinModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            dir={isRTL ? "rtl" : "ltr"}
            className="relative w-full max-w-sm bg-white border border-[#DCE0D4] rounded-3xl shadow-2xl p-6 text-[#173E30] space-y-4"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE0D4]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E8F5E9] text-[#008069] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#173E30]">
                    {locale === "ar"
                      ? "استرجاع البطاقة وتأكيد الهوية"
                      : locale === "fr"
                      ? "Récupération sécurisée du pass"
                      : "Recuperación segura de tarjeta"}
                  </h3>
                  <span className="text-[10px] text-[#5F655D] block">
                    {merchant.name} • Walink Security
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setPinModal({
                    isOpen: false,
                    attemptsRemaining: 5,
                    errorMsg: null,
                  })
                }
                className="p-1.5 rounded-xl hover:bg-[#FAF7F2] text-[#5F655D]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Locked State Alert */}
            {pinModal.locked ? (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-red-900">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>
                    {locale === "ar"
                      ? "تم قفل محاولات الاسترجاع مؤقتاً"
                      : "Compte temporairement verrouillé"}
                  </span>
                </div>
                <p className="text-[11px] text-red-700 leading-relaxed">
                  {pinModal.errorMsg ||
                    (locale === "ar"
                      ? `لحماية رصيدك من محاولات التخمين، تم قفل الحساب لمدة ${
                          pinModal.minsRemaining || 15
                        } دقيقة. يمكنك مراجعة الكاشير في المتجر لإلغاء القفل فوراً.`
                      : "Compte verrouillé pour 15 min. Contactez le caissier pour débloquer immédiatement.")}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setPinModal({
                      isOpen: false,
                      attemptsRemaining: 5,
                      errorMsg: null,
                    })
                  }
                  className="w-full mt-2 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition"
                >
                  {locale === "ar" ? "حسناً، فهمت" : "Compris"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerifyPin} className="space-y-4">
                {/* Masked Customer Identity */}
                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#DCE0D4] space-y-2">
                  <span className="text-[11px] text-[#5F655D] block">
                    {locale === "ar"
                      ? "تم العثور على بطاقة مسجلة بهذا الرقم:"
                      : "Un pass existe déjà pour ce numéro :"}
                  </span>
                  <div className="flex items-center justify-between text-xs font-bold text-[#173E30]">
                    <span>
                      {locale === "ar" ? "الاسم:" : "Nom :"} {pinModal.maskedName || "••••"}
                    </span>
                    <span className="font-mono text-[#008069]">
                      {pinModal.maskedPhone || phone}
                    </span>
                  </div>
                </div>

                {/* Error Banner */}
                {pinModal.errorMsg && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{pinModal.errorMsg}</span>
                  </div>
                )}

                {/* PIN Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#173E30] flex items-center justify-between">
                    <span>
                      {locale === "ar"
                        ? "أدخل رمز الأمان (PIN من 4 أرقام):"
                        : "Entrez votre code PIN (4 chiffres) :"}
                    </span>
                    <span className="text-[10px] font-bold text-amber-600">
                      {locale === "ar"
                        ? `متبقي ${pinModal.attemptsRemaining} محاولات`
                        : `${pinModal.attemptsRemaining} essais restants`}
                    </span>
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    pattern="[0-9]*"
                    autoFocus
                    required
                    value={pinCode}
                    onChange={(e) =>
                      setPinCode(e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    placeholder="••••"
                    className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3 rounded-2xl bg-white border-2 border-[#DCE0D4] hover:border-[#C8D1BE] focus:border-[#008069] focus:outline-none transition font-bold"
                  />
                </div>

                {/* Helpful Hint */}
                <p className="text-[11px] text-[#5F655D] leading-snug">
                  {locale === "ar"
                    ? "💡 رمز الأمان الافتراضي هو كود عضويتك المكون من 4 أرقام (#xxxx) الموجود على بطاقتك السابقة أو إشعار المتجر، أو الرمز المخصص الذي اخترته."
                    : "💡 Le code PIN par défaut est votre code membre (#xxxx) à 4 chiffres."}
                </p>

                {/* Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setPinModal({
                        isOpen: false,
                        attemptsRemaining: 5,
                        errorMsg: null,
                      })
                    }
                    className="flex-1 py-3 px-4 rounded-xl border border-[#C8D1BE] text-xs font-bold text-[#5F655D] hover:bg-[#FAF7F2] transition"
                  >
                    {locale === "ar" ? "إلغاء" : "Annuler"}
                  </button>
                  <button
                    type="submit"
                    disabled={verifyingPin || pinCode.length !== 4}
                    className="flex-2 py-3 px-5 rounded-xl bg-gradient-to-r from-[#00A884] to-[#008069] hover:from-[#009071] hover:to-[#006D59] text-white text-xs font-bold shadow-md shadow-[#008069]/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {verifyingPin ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>
                          {locale === "ar"
                            ? "تأكيد واسترجاع البطاقة"
                            : "Vérifier & Récupérer"}
                        </span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
