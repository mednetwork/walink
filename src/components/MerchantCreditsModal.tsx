"use client";

import React, { useState } from "react";
import { X, Coins, Zap, Check, MessageSquare } from "lucide-react";
import { TOPUP_PACKAGES, CREDIT_PRICE_MAD } from "@/lib/constants";
import { Locale } from "@/lib/i18n/translations";

interface MerchantCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credits: number;
  merchantName: string;
  locale?: Locale;
}

export default function MerchantCreditsModal({
  isOpen,
  onClose,
  credits,
  merchantName,
  locale = "ar",
}: MerchantCreditsModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<number>(1000);

  if (!isOpen) return null;

  const isRTL = locale === "ar";
  const chosenPkg =
    TOPUP_PACKAGES.find((p) => p.credits === selectedPackage) || TOPUP_PACKAGES[1];

  const whatsappText =
    locale === "fr"
      ? `Bonjour Walink, je souhaite recharger le pack de ${chosenPkg.credits.toLocaleString()} crédits (${chosenPkg.price} DH) pour mon commerce ${merchantName}.`
      : locale === "es"
      ? `Hola Walink, deseo recargar el pack de ${chosenPkg.credits.toLocaleString()} créditos (${chosenPkg.price} DH) para mi negocio ${merchantName}.`
      : `السلام عليكم Walink، بغيت نشحن باقة ${chosenPkg.credits.toLocaleString()} كريدي (${chosenPkg.price} درهم) لـ محل ${merchantName}.`;

  const whatsappMessage = encodeURIComponent(whatsappText);
  const dhEquivalent = (credits * CREDIT_PRICE_MAD).toFixed(1);

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-sm bg-white border border-[#E9EDEF] rounded-3xl shadow-2xl p-5 sm:p-6 text-[#111B21] space-y-3.5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E9EDEF]">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-sm">
              <Coins className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base text-[#111B21]">
                {locale === "ar"
                  ? "رصيد الكريدي والشحن"
                  : locale === "fr"
                  ? "Solde et Recharge Crédits"
                  : "Saldo y Recarga de Créditos"}
              </h3>
              <p className="text-[11px] text-[#54656F]">{merchantName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={locale === "ar" ? "إغلاق" : locale === "fr" ? "Fermer" : "Cerrar"}
            className="p-1.5 rounded-xl hover:bg-[#F0F2F5] text-[#54656F]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unified Rate Badge */}
        <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-amber-800">
            <Zap className="w-4 h-4 text-amber-600 fill-amber-600" />
            <span>
              {locale === "ar"
                ? "سعر موحد:"
                : locale === "fr"
                ? "Tarif fixe :"
                : "Tarifa fija:"}
            </span>
          </div>
          <span className="font-mono font-bold text-[11px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-lg shadow-sm">
            {locale === "ar"
              ? "1 كريدي = 0.10 درهم (10 = 1 DH)"
              : locale === "fr"
              ? "1 crédit = 0,10 DH (10 = 1 DH)"
              : "1 crédito = 0,10 DH (10 = 1 DH)"}
          </span>
        </div>

        {/* Current Balance */}
        <div className="p-3.5 rounded-2xl bg-[#F0F2F5] border border-[#E9EDEF] flex items-center justify-between">
          <span className="text-xs text-[#54656F] font-semibold">
            {locale === "ar"
              ? "رصيدك المتاح حالياً:"
              : locale === "fr"
              ? "Votre solde disponible :"
              : "Su saldo disponible:"}
          </span>
          <div className="text-right">
            <span className="text-base font-bold text-amber-600 font-mono block">
              {credits.toLocaleString()}{" "}
              <span className="text-xs font-semibold">
                {locale === "ar" ? "كريدي" : locale === "fr" ? "crédits" : "créditos"}
              </span>
            </span>
            <span className="text-[10px] text-[#54656F] font-mono font-semibold">
              ≈ {dhEquivalent} DH
            </span>
          </div>
        </div>

        {/* Info */}
        <p className="text-[11px] text-[#54656F] leading-relaxed">
          {locale === "ar"
            ? "يُستخدم الكريدي في إضافة الطوابع، استبدال الجوائز، معاملات الكاش باك، وإرسال العروض الترويجية لزبائنك."
            : locale === "fr"
            ? "Le crédit sert pour les tampons, récompenses, cashback, et les campagnes de fidélisation/relance."
            : "El crédito se utiliza para sellos, premios, cashback y campañas de fidelización/reactivación."}
        </p>

        {/* Pricing Packs (Selectable) */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-[#111B21] block">
            {locale === "ar"
              ? "اختر باقة الشحن المطلوبة:"
              : locale === "fr"
              ? "Choisissez un pack de recharge :"
              : "Elija un pack de recarga:"}
          </label>
          <div className="space-y-1.5">
            {TOPUP_PACKAGES.map((pkg) => {
              const isSelected = selectedPackage === pkg.credits;
              return (
                <button
                  key={pkg.credits}
                  type="button"
                  onClick={() => setSelectedPackage(pkg.credits)}
                  className={`w-full p-2.5 rounded-xl border text-right transition flex items-center justify-between text-xs cursor-pointer ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-400 text-amber-950 ring-1 ring-amber-400/50 shadow-sm"
                      : "bg-[#F0F2F5] border-[#E9EDEF] hover:bg-[#E9EDEF] text-[#111B21]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "border-amber-600 bg-amber-600 text-white"
                          : "border-[#D1D7DB] bg-white"
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <div>
                      <span className="font-bold text-[#111B21] block">{pkg.label}</span>
                      <span className="text-[10px] text-[#54656F]">
                        {pkg.credits.toLocaleString()}{" "}
                        {locale === "ar"
                          ? "عملية أو إشعار"
                          : locale === "fr"
                          ? "opérations ou notifs"
                          : "operaciones o avisos"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {pkg.popular && (
                      <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold border border-amber-300">
                        {locale === "ar"
                          ? "الأكثر طلباً"
                          : locale === "fr"
                          ? "Populaire"
                          : "Popular"}
                      </span>
                    )}
                    <span className="font-bold text-amber-600 font-mono text-sm">
                      {pkg.price} DH
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action: WhatsApp Reload */}
        <div className="pt-1.5 space-y-2">
          <a
            href={`https://wa.me/212600000000?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#00A884] to-[#008069] hover:from-[#008069] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#008069]/20 transition cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>
              {locale === "ar"
                ? `طلب باقة (${chosenPkg.price} درهم) عبر واتساب`
                : locale === "fr"
                ? `Commander (${chosenPkg.price} DH) via WhatsApp`
                : `Pedir pack (${chosenPkg.price} DH) por WhatsApp`}
            </span>
          </a>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-[#F0F2F5] hover:bg-[#E9EDEF] text-[#54656F] text-xs font-semibold border border-[#D1D7DB] transition cursor-pointer"
          >
            {locale === "ar" ? "إغلاق" : locale === "fr" ? "Fermer" : "Cerrar"}
          </button>
        </div>
      </div>
    </div>
  );
}
