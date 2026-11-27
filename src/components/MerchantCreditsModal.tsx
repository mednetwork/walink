"use client";

import React from "react";
import { X, Coins, Receipt, Building2, Wrench } from "lucide-react";
import {
  POINT_PRICE_MAD,
  INSTALLATION_FEE_MAD,
  computeMonthlySubscriptionFee,
  computePointsFee,
} from "@/lib/pricing";
import { Locale } from "@/lib/i18n/translations";

interface MerchantCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyPointsUsed: number;
  plan?: string;
  maxBranches?: number;
  merchantName: string;
  locale?: Locale;
}

export default function MerchantCreditsModal({
  isOpen,
  onClose,
  monthlyPointsUsed,
  plan = "GROWTH",
  maxBranches = 1,
  merchantName,
  locale = "ar",
}: MerchantCreditsModalProps) {
  if (!isOpen) return null;

  const isRTL = locale === "ar";
  const pointsFee = computePointsFee(monthlyPointsUsed);
  const subscriptionFee = computeMonthlySubscriptionFee(plan, maxBranches);
  const estimatedMonthlyTotal = Number((subscriptionFee + pointsFee).toFixed(2));

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-sm bg-white border border-[#161514]/10 rounded-3xl shadow-2xl p-5 sm:p-6 text-[#161514] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#161514]/10">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#F85B04]/10 text-[#F85B04] border border-[#F85B04]/25 shadow-sm">
              <Coins className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base text-[#161514]">
                {locale === "ar"
                  ? "استهلاك النقاط وفاتورة الشهر"
                  : locale === "fr"
                  ? "Consommation & Facture Mensuelle"
                  : "Consumo de Puntos y Factura"}
              </h3>
              <p className="text-[11px] text-[#161514]/65">{merchantName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={locale === "ar" ? "إغلاق" : locale === "fr" ? "Fermer" : "Cerrar"}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-[#EFEAE4] text-[#161514]/65 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Postpaid Point Rate Notice */}
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 text-xs flex items-center justify-between">
          <span className="font-bold text-amber-800">
            {locale === "ar"
              ? "تعريفة النقاط (آخر الشهر):"
              : locale === "fr"
              ? "Tarif points (fin de mois) :"
              : "Tarifa puntos (fin de mes):"}
          </span>
          <span className="font-mono font-bold text-[11px] bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-lg shadow-sm tabular-nums">
            1 = {POINT_PRICE_MAD.toFixed(1)} DH
          </span>
        </div>

        {/* Current Month Points Usage */}
        <div className="p-4 rounded-2xl bg-[#EFEAE4] border border-[#161514]/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#161514]/65 font-semibold">
              {locale === "ar"
                ? "نقاط الشهر الحالي:"
                : locale === "fr"
                ? "Points consommés ce mois :"
                : "Puntos consumidos este mes:"}
            </span>
            <div className="text-end">
              <span className="text-lg font-black text-amber-600 font-mono tabular-nums block">
                {monthlyPointsUsed.toLocaleString()}{" "}
                <span className="text-xs font-semibold">
                  {locale === "ar" ? "نقطة" : locale === "fr" ? "pts" : "pts"}
                </span>
              </span>
              <span className="text-[11px] text-[#161514]/65 font-mono font-bold tabular-nums">
                = {pointsFee.toFixed(2)} DH
              </span>
            </div>
          </div>

          <div className="h-px bg-[#161514]/10" />

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#161514]/65 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#F85B04]" />
              <span>
                {locale === "ar"
                  ? "الاشتراك الشهري:"
                  : locale === "fr"
                  ? "Abonnement mensuel :"
                  : "Suscripción mensual:"}
              </span>
            </span>
            <span className="font-mono font-bold text-[#161514] tabular-nums">
              {subscriptionFee} DH
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#161514]/65 flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-[#F85B04]" />
              <span>
                {locale === "ar"
                  ? "التقدير الشهري الحالي:"
                  : locale === "fr"
                  ? "Estimation mensuelle :"
                  : "Total estimado del mes:"}
              </span>
            </span>
            <span className="font-mono font-black text-sm text-[#DA5004] tabular-nums">
              {estimatedMonthlyTotal.toFixed(2)} DH
            </span>
          </div>
        </div>

        {/* Info Note */}
        <div className="p-3 rounded-2xl bg-[#F85B04]/5 border border-[#F85B04]/20 text-[11px] text-[#161514]/70 leading-relaxed space-y-1">
          <p className="font-semibold text-[#161514] flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-[#F85B04]" />
            <span>
              {locale === "ar"
                ? "نظام الدفع الشهري الآجل (بدون تعبئة مسبقة)"
                : locale === "fr"
                ? "Facturation mensuelle sans prépaiement"
                : "Facturación mensual sin prepago"}
            </span>
          </p>
          <p>
            {locale === "ar"
              ? `لا يتوقف مسح البطاقات أبداً. يتم احتساب كل ختم أو إشعار نقطة واحدة (${POINT_PRICE_MAD} درهم) وتُضاف إلى الاشتراك الشهري عند التسديد آخر الشهر (إضافة إلى ${INSTALLATION_FEE_MAD} درهم للتثبيت أول شهر فقط).`
              : locale === "fr"
              ? `Aucune interruption de service. Chaque tampon ou campagne est comptabilisé à ${POINT_PRICE_MAD} DH/point et réglé en fin de mois avec votre abonnement.`
              : `Sin interrupciones. Cada sello o campaña se registra a ${POINT_PRICE_MAD} DH/punto para liquidación a fin de mes.`}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[44px] py-2.5 rounded-full bg-[#161514] hover:bg-[#2A2826] text-white font-bold text-xs transition cursor-pointer shadow-sm"
        >
          {locale === "ar" ? "إغلاق" : locale === "fr" ? "Fermer" : "Cerrar"}
        </button>
      </div>
    </div>
  );
}
