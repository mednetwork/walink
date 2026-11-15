"use client";

import React from "react";
import { X, Coins, Zap, Check, MessageSquare } from "lucide-react";
import { TOPUP_PACKAGES } from "@/lib/constants";

interface MerchantCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credits: number;
  merchantName: string;
}

export default function MerchantCreditsModal({
  isOpen,
  onClose,
  credits,
  merchantName,
}: MerchantCreditsModalProps) {
  if (!isOpen) return null;

  const whatsappMessage = encodeURIComponent(
    `السلام عليكم Walink، بغيت نشحن الكريدي لـ محل ${merchantName}.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-[#0F172A] border border-white/10 rounded-3xl shadow-2xl p-6 text-white space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Coins className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base text-white">رصيد الكريدي والشحن</h3>
              <p className="text-[11px] text-white/50">{merchantName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/70"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <span className="text-xs text-white/70">رصيدك المتاح حالياً:</span>
          <span className="text-lg font-bold text-amber-400 font-mono">
            {credits.toLocaleString()} كريدي
          </span>
        </div>

        {/* Info */}
        <p className="text-xs text-white/70 leading-relaxed text-right">
          الكريدي كيتستعمل لإرسال العروض الترويجية واسترجاع الزبائن الغابرين بعد 15 يوماً.
          كل 1 كريدي = 1 إشعار كيوصل لشاشة هاتف الزبون.
        </p>

        {/* Pricing Packs */}
        <div className="space-y-2">
          {TOPUP_PACKAGES.map((pkg) => (
            <div
              key={pkg.credits}
              className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-white block">{pkg.label}</span>
                <span className="text-[10px] text-white/50">
                  {pkg.credits} إشعار ورادار
                </span>
              </div>
              <div className="flex items-center gap-2">
                {pkg.popular && (
                  <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                    الأكثر طلباً
                  </span>
                )}
                <span className="font-bold text-amber-400 font-mono">
                  {pkg.price} درهم
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Action: WhatsApp Reload */}
        <div className="pt-2 space-y-2">
          <a
            href={`https://wa.me/212600000000?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition"
          >
            <MessageSquare className="w-4 h-4" />
            <span>طلب شحن الكريدي عبر WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-semibold text-xs transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}

