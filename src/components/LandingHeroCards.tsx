"use client";

import React from "react";
import { QrCode, Smartphone, Sparkles, Stamp } from "lucide-react";

interface LandingHeroCardsProps {
  storeName: string;
  stickerLeft: string;
  stickerRight: string;
  dir: "rtl" | "ltr";
  locale: "ar" | "fr" | "es";
}

export default function LandingHeroCards({
  storeName,
  stickerLeft,
  stickerRight,
  dir,
  locale,
}: LandingHeroCardsProps) {
  const displayStore = storeName.trim() || "Café Atlas";

  const labels =
    locale === "fr"
      ? {
          frontProg: "CARTE FIDÉLITÉ",
          frontReward: "6e café offert",
          frontStamps: "4 / 6 tampons",
          leftName: "Salon Élégance",
          leftBadge: "Cashback 10%",
          leftBalance: "64 DH",
          rightName: "Burger House",
          rightBadge: "VIP Membre",
          rightStamps: "8 / 10",
        }
      : locale === "es"
      ? {
          frontProg: "TARJETA FIDELIDAD",
          frontReward: "6.º café gratis",
          frontStamps: "4 / 6 sellos",
          leftName: "Salón Élégance",
          leftBadge: "Cashback 10%",
          leftBalance: "64 DH",
          rightName: "Burger House",
          rightBadge: "Miembro VIP",
          rightStamps: "8 / 10",
        }
      : {
          frontProg: "بطاقة الوفاء",
          frontReward: "القهوة 6 مجاناً",
          frontStamps: "4 / 6 أختام",
          leftName: "Salon Élégance",
          leftBadge: "كاش باك 10%",
          leftBalance: "64 DH",
          rightName: "Burger House",
          rightBadge: "عضو VIP",
          rightStamps: "8 / 10",
        };

  return (
    <div
      className="relative mx-auto flex min-h-[380px] w-full max-w-[460px] items-center justify-center pt-6 pb-8 md:min-h-[430px]"
      dir={dir}
    >
      {/* Subtle Ambient Light Behind Fan */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-6 rounded-full bg-white/15 blur-3xl"
      />

      {/* Tilted Top Sticker Badge */}
      <div className="shadow-sticker font-script absolute top-0 left-2 z-30 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-base font-bold text-[#161514] -rotate-6 sm:left-4">
        <Smartphone className="h-3.5 w-3.5 text-[#F85B04]" aria-hidden="true" />
        <span>{stickerLeft}</span>
      </div>

      {/* Back Left Card (Forest Emerald Cashback Card) */}
      <div
        aria-hidden="true"
        className="absolute top-14 z-10 -translate-x-20 sm:-translate-x-28 -rotate-6"
      >
        <div className="fan-left shadow-float w-[196px] sm:w-[220px] rounded-[24px] border border-white/15 bg-[#124532] p-4 text-white">
          <div className="flex items-center justify-between text-[11px] font-bold text-white/80">
            <span className="truncate">{labels.leftName}</span>
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px]">
              {labels.leftBadge}
            </span>
          </div>
          <div className="mt-5">
            <p className="text-[10px] uppercase tracking-wider text-white/60">WALLET PASS</p>
            <p className="mt-0.5 text-2xl font-extrabold tabular-nums">{labels.leftBalance}</p>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-white/15 pt-3">
            <span className="text-[10px] text-white/70">NFC • QR</span>
            <Sparkles className="h-4 w-4 text-[#FA7F3B]" />
          </div>
        </div>
      </div>

      {/* Back Right Card (Dark Ink VIP Card) */}
      <div
        aria-hidden="true"
        className="absolute top-14 z-10 translate-x-20 sm:translate-x-28 rotate-6"
      >
        <div className="fan-right shadow-float w-[196px] sm:w-[220px] rounded-[24px] border border-white/10 bg-[#161514] p-4 text-white">
          <div className="flex items-center justify-between text-[11px] font-bold text-white/80">
            <span className="truncate">{labels.rightName}</span>
            <span className="rounded-full bg-[#F85B04] px-2 py-0.5 text-[10px] text-white">
              {labels.rightBadge}
            </span>
          </div>
          <div className="mt-5 flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((idx) => (
              <span
                key={idx}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F85B04] text-[10px] font-bold text-white"
              >
                ✓
              </span>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3">
            <span className="text-[10px] text-white/65">Apple & Google</span>
            <span className="text-xs font-extrabold tabular-nums text-[#FA7F3B]">
              {labels.rightStamps}
            </span>
          </div>
        </div>
      </div>

      {/* Center Front Card (Dynamic Live Store Name Preview!) */}
      <div className="fan-center shadow-float relative z-20 w-[236px] sm:w-[260px] rounded-[28px] border border-[#161514]/10 bg-white p-5 text-[#161514]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F85B04] text-sm font-black text-white">
              {displayStore.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold leading-tight text-[#161514]">
                {displayStore}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#DA5004]">
                {labels.frontProg}
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-[#EFEAE4] px-2.5 py-1 text-[10px] font-extrabold tabular-nums text-[#161514]">
            {labels.frontStamps}
          </span>
        </div>

        {/* Visual Stamp Dots */}
        <div className="mt-4 grid grid-cols-6 gap-1.5 rounded-2xl bg-[#EFEAE4] p-2.5">
          {[1, 2, 3, 4, 5, 6].map((dot) => {
            const active = dot <= 4;
            return (
              <div
                key={dot}
                className={`flex aspect-square items-center justify-center rounded-full text-[11px] font-bold ${
                  active
                    ? "bg-[#F85B04] text-white"
                    : "border border-dashed border-[#161514]/25 bg-white text-[#161514]/35"
                }`}
              >
                {active ? <Stamp className="h-3.5 w-3.5" aria-hidden="true" /> : dot}
              </div>
            );
          })}
        </div>

        {/* Reward Row */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="font-semibold text-[#161514]/65">{labels.frontReward}</span>
          <span className="font-extrabold text-[#DA5004]">VIP ★</span>
        </div>

        {/* Realistic QR Footer */}
        <div className="mt-4 flex flex-col items-center rounded-2xl border border-[#161514]/10 bg-[#FAF8F5] py-3 px-4">
          <QrCode className="h-14 w-14 text-[#161514]" strokeWidth={1.6} aria-hidden="true" />
          <span className="mt-1.5 font-mono text-[10px] tracking-widest text-[#161514]/55">
            WALINK-8492
          </span>
        </div>
      </div>

      {/* Tilted Bottom Right Sticker Badge */}
      <div className="shadow-sticker font-script absolute bottom-2 right-2 z-30 inline-flex items-center gap-1.5 rounded-full bg-[#161514] px-4 py-1.5 text-base font-bold text-white rotate-3 sm:right-4">
        <span className="h-2 w-2 rounded-full bg-[#F85B04]" />
        <span>{stickerRight}</span>
      </div>
    </div>
  );
}
