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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white border border-[#E9EDEF] rounded-3xl shadow-2xl p-6 text-[#111B21] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E9EDEF]">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-sm">
              <Coins className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base text-[#111B21]">رصيد الكريدي والشحن</h3>
              <p className="text-[11px] text-[#54656F]">{merchantName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#F0F2F5] text-[#54656F]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance */}
        <div className="p-4 rounded-2xl bg-[#F0F2F5] border border-[#E9EDEF] flex items-center justify-between">
          <span className="text-xs text-[#54656F] font-semibold">رصيدك المتاح حالياً:</span>
          <span className="text-lg font-bold text-amber-600 font-mono">
            {credits.toLocaleString()} كريدي
          </span>
        </div>

        {/* Info */}
        <p className="text-xs text-[#54656F] leading-relaxed text-right">
          الكريدي كيتستعمل لإرسال العروض الترويجية واسترجاع الزبائن الغابرين بعد 15 يوماً.
          كل 1 كريدي = 1 إشعار كيوصل لشاشة هاتف الزبون.
        </p>

        {/* Pricing Packs */}
        <div className="space-y-2">
          {TOPUP_PACKAGES.map((pkg) => (
            <div
              key={pkg.credits}
              className="p-3 rounded-xl bg-[#F0F2F5] border border-[#E9EDEF] flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-[#111B21] block">{pkg.label}</span>
                <span className="text-[10px] text-[#54656F]">
                  {pkg.credits} إشعار ورادار
                </span>
              </div>
              <div className="flex items-center gap-2">
                {pkg.popular && (
                  <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold border border-amber-300">
                    الأكثر طلباً
                  </span>
                )}
                <span className="font-bold text-amber-600 font-mono">
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
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00A884] to-[#008069] hover:from-[#008069] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#008069]/20 transition"
          >
            <MessageSquare className="w-4 h-4" />
            <span>طلب شحن الكريدي عبر WhatsApp</span>
          </a>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#F0F2F5] hover:bg-[#E9EDEF] text-[#54656F] text-xs font-semibold border border-[#D1D7DB] transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}

