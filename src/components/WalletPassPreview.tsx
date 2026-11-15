"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  Coffee,
  Scissors,
  Utensils,
  Car,
  Sparkles,
  Shirt,
  Store,
  Gift,
  Check,
  QrCode as QrIcon,
} from "lucide-react";

interface WalletPassPreviewProps {
  name?: string;
  niche?: string;
  primaryColor?: string;
  bgGradient?: string;
  stamps?: number;
  stampsRequired?: number;
  rewardName?: string;
  memberCode?: string;
  compact?: boolean;
  qrValue?: string;
}

export default function WalletPassPreview({
  name = "Café Atlas",
  niche = "cafe",
  primaryColor = "#5b3519",
  bgGradient = "linear-gradient(150deg, #6b4226 0%, #3d2414 100%)",
  stamps = 4,
  stampsRequired = 5,
  rewardName = "قهوة فابور",
  memberCode = "4821",
  compact = false,
  qrValue,
}: WalletPassPreviewProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    const payload = qrValue || `WALINK:${memberCode || "0000"}`;

    QRCode.toDataURL(payload, {
      width: compact ? 140 : 200,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H",
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR Code generation error:", err));
  }, [qrValue, memberCode, compact]);

  const getNicheIcon = () => {
    switch (niche) {
      case "barber":
        return <Scissors className="w-5 h-5 text-amber-300" />;
      case "snack":
        return <Utensils className="w-5 h-5 text-amber-300" />;
      case "wash":
        return <Car className="w-5 h-5 text-amber-300" />;
      case "beauty":
        return <Sparkles className="w-5 h-5 text-amber-300" />;
      case "laundry":
        return <Shirt className="w-5 h-5 text-amber-300" />;
      case "other":
        return <Store className="w-5 h-5 text-amber-300" />;
      case "cafe":
      default:
        return <Coffee className="w-5 h-5 text-amber-300" />;
    }
  };

  const safeStampsRequired = Math.max(3, Math.min(10, stampsRequired || 5));
  const safeStamps = Math.max(0, Math.min(safeStampsRequired, stamps || 0));

  return (
    <div
      className={`relative w-full max-w-[360px] mx-auto rounded-[28px] overflow-hidden text-white shadow-2xl border border-white/20 select-none transition-all duration-300 ${
        compact ? "p-4 text-xs" : "p-6"
      }`}
      style={{
        background: bgGradient || primaryColor || "#1e293b",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.3)",
      }}
    >
      {/* Apple Wallet Top Foil Shimmer Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[28px]">
        <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transform -rotate-45 animate-shimmer" />
      </div>

      {/* Header: Logo, Merchant Name & Apple Wallet Counter */}
      <div className="flex items-center justify-between pb-4 border-b border-white/15 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-black/30 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
            {getNicheIcon()}
          </div>
          <div>
            <h3 className="font-bold text-base tracking-wide leading-tight text-white drop-shadow">
              {name}
            </h3>
            <span className="text-[11px] font-medium text-white/70 block">
              بطاقة الوفاء الرقمية
            </span>
          </div>
        </div>

        <div className="text-left bg-black/35 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 shadow-sm">
          <div className="text-[10px] text-white/70">الطوابع</div>
          <div className="text-sm font-bold text-emerald-400 font-mono tracking-tight">
            {safeStamps} / {safeStampsRequired}
          </div>
        </div>
      </div>

      {/* Stamps Progress Strip */}
      <div className="my-5 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-white/90">
            اجمع {safeStampsRequired} طوابع وربح:
          </span>
          <span className="text-xs font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-lg border border-amber-300/30">
            {rewardName}
          </span>
        </div>

        {/* Circular Embossed Stamp Slots Grid */}
        <div className="grid grid-cols-5 gap-2.5 pt-2">
          {Array.from({ length: safeStampsRequired }).map((_, index) => {
            const isCollected = index < safeStamps;
            const isGiftSlot = index === safeStampsRequired - 1;

            if (isGiftSlot) {
              return (
                <div
                  key={index}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 relative ${
                    isCollected
                      ? "bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-lg shadow-amber-500/30 ring-2 ring-amber-300 scale-105"
                      : "bg-black/35 border-2 border-dashed border-amber-400/50 text-amber-300/80"
                  }`}
                >
                  <Gift className={`w-5 h-5 ${isCollected ? "animate-bounce" : ""}`} />
                  <span className="text-[9px] font-bold mt-0.5">هدية</span>
                </div>
              );
            }

            return (
              <div
                key={index}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 relative ${
                  isCollected
                    ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 font-bold shadow-md shadow-emerald-500/25 ring-2 ring-emerald-300/80"
                    : "bg-black/30 border border-white/20 text-white/40"
                }`}
                style={{
                  boxShadow: isCollected
                    ? "inset 0 2px 4px rgba(255, 255, 255, 0.4), 0 4px 8px rgba(0,0,0,0.4)"
                    : "inset 0 2px 4px rgba(0, 0, 0, 0.6)",
                }}
              >
                {isCollected ? (
                  <Check className="w-5 h-5 stroke-[3]" />
                ) : (
                  <span className="text-xs font-semibold">{index + 1}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pass Footer & Member QR Section */}
      <div className="mt-4 pt-4 border-t border-white/15 bg-black/40 -mx-6 -mb-6 p-5 rounded-b-[28px] backdrop-blur-md relative z-10 flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-3 text-xs">
          <div>
            <span className="text-[10px] text-white/60 block">رقم العضوية</span>
            <span className="font-mono font-bold tracking-widest text-emerald-400 text-sm">
              #{memberCode}
            </span>
          </div>
          <div className="text-left">
            <span className="text-[10px] text-white/60 block">نوع المحفظة</span>
            <span className="text-xs font-medium text-white/90">Apple & Google Pass</span>
          </div>
        </div>

        {/* Crisp High-Contrast Scannable QR Code Canvas */}
        <div className="bg-white p-2.5 rounded-2xl shadow-xl flex flex-col items-center justify-center">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt={`QR Code for ${memberCode}`}
              width={compact ? 112 : 144}
              height={compact ? 112 : 144}
              className={compact ? "w-28 h-28 aspect-square" : "w-36 h-36 aspect-square"}
            />
          ) : (
            <div className="w-36 h-36 flex items-center justify-center bg-gray-100 text-gray-500">
              <QrIcon className="w-8 h-8 animate-pulse" />
            </div>
          )}
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-white/70 font-mono tracking-wider">
          <span className="text-emerald-400 font-bold">WALINK #{memberCode}</span>
          <span className="text-white/30">•</span>
          <span>سكاني عند الخلاص</span>
        </div>
      </div>
    </div>
  );
}
