"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { formatStamps, roundStamps } from "@/lib/utils";
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
  Coins,
  QrCode as QrIcon,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Gem,
  Pizza,
  Cake,
  IceCream2,
  CupSoda,
  Flower2,
  Heart,
  Stethoscope,
  Dumbbell,
  Smile,
  Wrench,
  Camera,
  Glasses,
  Smartphone,
  Laptop,
  PawPrint,
  Dog,
  BookOpen,
  Briefcase,
  Trophy,
  Crown,
  Flame,
  Star,
  type LucideIcon,
} from "lucide-react";
import { Locale } from "@/lib/i18n/translations";

export const MERCHANT_ICON_MAP: Record<string, LucideIcon> = {
  // Retail & Shopping
  store: Store,
  shoppingbag: ShoppingBag,
  "shopping-bag": ShoppingBag,
  shoppingcart: ShoppingCart,
  "shopping-cart": ShoppingCart,
  tag: Tag,
  gem: Gem,
  gift: Gift,

  // Food & Beverage
  coffee: Coffee,
  cafe: Coffee,
  utensils: Utensils,
  snack: Utensils,
  restaurant: Utensils,
  pizza: Pizza,
  cake: Cake,
  bakery: Cake,
  icecream: IceCream2,
  icecream2: IceCream2,
  "ice-cream-2": IceCream2,
  "ice-cream": IceCream2,
  cupsoda: CupSoda,
  "cup-soda": CupSoda,

  // Beauty, Wellness & Health
  scissors: Scissors,
  barber: Scissors,
  sparkles: Sparkles,
  beauty: Sparkles,
  flower2: Flower2,
  "flower-2": Flower2,
  spa: Flower2,
  heart: Heart,
  stethoscope: Stethoscope,
  clinic: Stethoscope,
  pharmacy: Stethoscope,
  dumbbell: Dumbbell,
  gym: Dumbbell,
  fitness: Dumbbell,
  smile: Smile,
  dental: Smile,

  // Automotive, Tech & Services
  car: Car,
  wash: Car,
  carwash: Car,
  wrench: Wrench,
  mechanic: Wrench,
  repair: Wrench,
  shirt: Shirt,
  laundry: Shirt,
  camera: Camera,
  photography: Camera,
  glasses: Glasses,
  optics: Glasses,
  smartphone: Smartphone,
  phone: Smartphone,
  electronics: Smartphone,
  laptop: Laptop,
  computer: Laptop,
  pawprint: PawPrint,
  "paw-print": PawPrint,
  dog: Dog,
  pet: Dog,
  bookopen: BookOpen,
  "book-open": BookOpen,
  library: BookOpen,
  bookstore: BookOpen,
  briefcase: Briefcase,
  agency: Briefcase,
  services: Briefcase,
  trophy: Trophy,
  sports: Trophy,
  crown: Crown,
  vip: Crown,
  flame: Flame,
  grill: Flame,
  star: Star,
};

export function getMerchantLucideIcon(iconOrNiche?: string): LucideIcon {
  if (!iconOrNiche) return Store;
  const raw = String(iconOrNiche).trim().toLowerCase();
  const cleanKey = raw.replace(/[\s_-]+/g, "");
  return MERCHANT_ICON_MAP[raw] || MERCHANT_ICON_MAP[cleanKey] || Store;
}

export interface WalletPassPreviewProps {
  name?: string;
  niche?: string;
  logoIcon?: string;
  primaryColor?: string;
  bgGradient?: string;
  loyaltyType?: "STAMPS" | "CASHBACK";
  stamps?: number;
  stampsRequired?: number;
  rewardName?: string;
  cashbackRate?: number;
  cashbackBalance?: number;
  totalCashbackEarned?: number;
  currency?: string;
  memberCode?: string;
  compact?: boolean;
  qrValue?: string;
  locale?: Locale;
  isVip?: boolean;
  totalVisits?: number;
  vipVisitsThreshold?: number;
  vipCashbackBonus?: number;
}

export default function WalletPassPreview({
  name = "Café Atlas",
  niche = "cafe",
  logoIcon,
  primaryColor = "#5b3519",
  bgGradient = "linear-gradient(150deg, #5c371d 0%, #2a170b 100%)",
  loyaltyType = "STAMPS",
  stamps = 4,
  stampsRequired = 5,
  rewardName = "قهوة مجانية",
  cashbackRate = 10,
  cashbackBalance = 35.5,
  totalCashbackEarned = 55.5,
  currency = "DH",
  memberCode = "4821",
  compact = false,
  qrValue,
  locale = "ar",
  isVip = false,
  totalVisits,
  vipVisitsThreshold = 10,
  vipCashbackBonus = 5,
}: WalletPassPreviewProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    const payload = qrValue || `WALINK:${memberCode || "0000"}`;

    QRCode.toDataURL(payload, {
      width: compact ? 140 : 200,
      margin: 1,
      color: {
        dark: "#05080E",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H",
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR Code generation error:", err));
  }, [qrValue, memberCode, compact]);

  const MerchantIconComponent = getMerchantLucideIcon(logoIcon || niche);

  const safeStampsRequired = Math.max(3, Math.min(10, stampsRequired || 5));
  const rawDisplayStamps = Math.max(0, roundStamps(stamps || 0));
  const safeStamps = Math.max(0, Math.min(safeStampsRequired, rawDisplayStamps));

  const isVipCustomer = Boolean(
    isVip ||
      (totalVisits !== undefined &&
        vipVisitsThreshold !== undefined &&
        totalVisits >= vipVisitsThreshold)
  );
  const effectiveCashbackRate = isVipCustomer
    ? cashbackRate + (vipCashbackBonus || 5)
    : cashbackRate;

  const isCashback = loyaltyType === "CASHBACK";
  const isRTL = locale === "ar";

  // Localized Labels
  const labels = {
    passSubtitle:
      locale === "ar"
        ? isCashback
          ? "بطاقة كاش باك رقمية"
          : "بطاقة ولاء رقمية"
        : locale === "fr"
        ? isCashback
          ? "Carte Cashback Digitale"
          : "Carte de Fidélité Digitale"
        : isCashback
        ? "Tarjeta Cashback Digital"
        : "Tarjeta de Fidelidad Digital",
    stampsHeader: locale === "ar" ? "الأختام" : locale === "fr" ? "TAMPONS" : "SELLOS",
    cashbackHeader: locale === "ar" ? "نسبة الاسترداد" : "CASHBACK",
    availableBalance:
      locale === "ar"
        ? "الرصيد المتاح للصرف"
        : locale === "fr"
        ? "SOLDE DISPONIBLE"
        : "SALDO DISPONIBLE",
    onEveryPurchase:
      locale === "ar"
        ? "على كل فاتورة"
        : locale === "fr"
        ? "sur chaque achat"
        : "en cada compra",
    collectReward:
      locale === "ar"
        ? `اجمع ${safeStampsRequired} أختام واحصل على:`
        : locale === "fr"
        ? `Cumulez ${safeStampsRequired} tampons et obtenez :`
        : `Acumula ${safeStampsRequired} sellos y llévate:`,
    giftSlot: locale === "ar" ? "هدية" : locale === "fr" ? "Cadeau" : "Premio",
    memberNumber: locale === "ar" ? "رقم العضوية" : locale === "fr" ? "N° MEMBRE" : "N° SOCIO",
    walletTypeLabel: locale === "ar" ? "نوع المحفظة" : locale === "fr" ? "Type" : "Tipo",
    scanHint:
      locale === "ar"
        ? "امسح الرمز عند الدفع"
        : locale === "fr"
        ? "Scannez lors du paiement"
        : "Escanea al pagar",
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={`relative w-full max-w-[360px] mx-auto rounded-[28px] overflow-hidden text-white select-none transition-all duration-300 border ${
        isVipCustomer
          ? "border-amber-400/50 shadow-[0_24px_50px_-12px_rgba(245,158,11,0.35)] ring-1 ring-amber-300/40"
          : "border-white/[0.12] border-t-white/[0.24] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.85)]"
      } ${compact ? "p-4 text-xs" : "p-6"}`}
      style={{
        background: bgGradient || primaryColor || "#141c2b",
        boxShadow: isVipCustomer
          ? "0 24px 50px -12px rgba(245, 158, 11, 0.35), inset 0 1px 0 rgba(255, 235, 150, 0.45)"
          : "0 24px 50px -12px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.22)",
      }}
    >
      {/* Subtle Optical Specular Light Line (Apple Wallet Finish) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[28px]">
        <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent transform -rotate-45" />
      </div>

      {/* Header: Logo, Merchant Name & Program Indicator */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.12] relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
            <MerchantIconComponent className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-base tracking-tight leading-tight text-white drop-shadow-sm">
                {name}
              </h3>
              {isVipCustomer && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-sm border border-amber-300/80">
                  👑 VIP GOLD
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium text-white/70 block mt-0.5">
              {labels.passSubtitle}
            </span>
          </div>
        </div>

        {isCashback ? (
          <div className="text-center bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-400/35 shadow-sm">
            <div className="text-[10px] text-amber-300/80 font-medium">
              {labels.cashbackHeader}
            </div>
            <div className="text-sm font-bold text-amber-300 font-mono tracking-tight flex items-center justify-center gap-1">
              <Coins className="w-3.5 h-3.5" />
              <span>{effectiveCashbackRate}%</span>
            </div>
          </div>
        ) : (
          <div className="text-center bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 shadow-sm">
            <div className="text-[10px] text-white/70 font-medium">{labels.stampsHeader}</div>
            <div className="text-sm font-bold text-sky-400 font-mono tracking-tight">
              {formatStamps(rawDisplayStamps)} / {safeStampsRequired}
            </div>
          </div>
        )}
      </div>

      {/* Program Middle Strip: Stamps Grid OR Cashback Balance Card */}
      {isCashback ? (
        <div className="my-5 relative z-10">
          <div className="p-4 rounded-2xl bg-black/55 backdrop-blur-md border border-amber-400/25 shadow-inner">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-white/70">
                {labels.availableBalance}
              </span>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-300/30">
                +{effectiveCashbackRate}% {labels.onEveryPurchase}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-extrabold font-mono tracking-tight text-amber-300 drop-shadow-sm">
                {Number(cashbackBalance || 0).toFixed(2)}
              </span>
              <span className="text-sm font-bold text-amber-200/90">{currency}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="my-5 relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-white/90">
              {labels.collectReward}
            </span>
            <span className="text-xs font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-lg border border-amber-300/30">
              {rewardName}
            </span>
          </div>

          {/* Circular Embossed Stamp Slots Grid */}
          <div className="grid grid-cols-5 gap-2.5 pt-2">
            {Array.from({ length: safeStampsRequired }).map((_, index) => {
              const slotFill = Math.max(0, Math.min(1, safeStamps - index));
              const isCollected = slotFill >= 0.99;
              const isHalfCollected = !isCollected && slotFill >= 0.25;
              const isGiftSlot = index === safeStampsRequired - 1;

              if (isGiftSlot) {
                return (
                  <div
                    key={index}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden ${
                      isCollected
                        ? "bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/25 ring-1 ring-amber-200 scale-105"
                        : isHalfCollected
                        ? "bg-black/40 border border-amber-300/70 text-white shadow-md"
                        : "bg-black/40 border border-dashed border-amber-400/50 text-amber-300/80"
                    }`}
                  >
                    {isHalfCollected && (
                      <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500/90 pointer-events-none" />
                    )}
                    <Gift className={`w-5 h-5 relative z-10 ${isCollected ? "animate-pulse" : ""}`} />
                    <span className="text-[9px] font-bold mt-0.5 relative z-10">
                      {isHalfCollected ? "½" : labels.giftSlot}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={index}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden ${
                    isCollected
                      ? "bg-gradient-to-br from-emerald-300 via-emerald-400 to-emerald-600 text-slate-950 font-bold shadow-md shadow-emerald-500/25 ring-1 ring-emerald-200/80"
                      : isHalfCollected
                      ? "bg-black/35 border border-emerald-300/70 text-white shadow-sm ring-1 ring-emerald-300/40"
                      : "bg-black/35 border border-white/10 text-white/40"
                  }`}
                  style={{
                    boxShadow: isCollected
                      ? "inset 0 1px 1px rgba(255, 255, 255, 0.8), 0 3px 6px rgba(0,0,0,0.4)"
                      : "inset 0 3px 6px rgba(0, 0, 0, 0.75), inset 0 0 0 1px rgba(255,255,255,0.06)",
                  }}
                >
                  {isHalfCollected && (
                    <>
                      <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-br from-emerald-300 via-emerald-400 to-emerald-600 pointer-events-none" />
                      <div className="relative z-10 flex flex-col items-center justify-center">
                        <MerchantIconComponent className="w-4 h-4 text-white drop-shadow-sm" />
                        <span className="text-[9px] font-black leading-none mt-0.5 text-emerald-100 drop-shadow-sm">
                          ½
                        </span>
                      </div>
                    </>
                  )}
                  {isCollected && <Check className="w-5 h-5 stroke-[3]" />}
                  {!isCollected && !isHalfCollected && (
                    <MerchantIconComponent className="w-5 h-5 text-white/40 drop-shadow-sm transition-transform duration-200 hover:scale-110" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pass Footer & Member QR Section */}
      <div className="mt-4 pt-4 border-t border-white/[0.12] bg-black/45 -mx-6 -mb-6 p-5 rounded-b-[28px] backdrop-blur-md relative z-10 flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-3 text-xs">
          <div>
            <span className="text-[10px] text-white/60 block">{labels.memberNumber}</span>
            <span className="font-mono font-bold tracking-widest text-sky-400 text-sm">
              #{memberCode}
            </span>
          </div>
          <div className="text-start">
            <span className="text-[10px] text-white/60 block">{labels.walletTypeLabel}</span>
            <span className="text-xs font-medium text-white/90">Apple & Google Pass</span>
          </div>
        </div>

        {/* Crisp High-Contrast Scannable QR Code Canvas */}
        <div className="bg-white p-2.5 rounded-2xl shadow-xl flex flex-col items-center justify-center border border-white/10">
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
          <span className="text-sky-400 font-bold">WALINK #{memberCode}</span>
          <span className="text-white/30">•</span>
          <span>{labels.scanHint}</span>
        </div>
      </div>
    </div>
  );
}
