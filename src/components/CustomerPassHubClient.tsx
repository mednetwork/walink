"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  Smartphone,
  Gift,
  Bell,
  BellRing,
  MapPin,
  Star,
  ExternalLink,
  ChevronDown,
  Clock,
  Check,
  CheckCircle2,
  Radio,
  ArrowRight,
  Share2,
  Download,
  Code,
  X,
  Compass,
  Coins,
} from "lucide-react";
import WalletPassPreview from "@/components/WalletPassPreview";
import { formatTimeAgoArabic } from "@/lib/utils";
import { soundEngine } from "@/lib/sound";
import { Locale, translations } from "@/lib/i18n/translations";
import { detectPhoneLocale } from "@/lib/i18n/context";

interface CustomerData {
  id: string;
  name: string;
  phone: string;
  memberCode: string;
  passSerial: string;
  loyaltyType?: "STAMPS" | "CASHBACK";
  stamps: number;
  cashbackBalance?: number;
  totalCashbackEarned?: number;
  totalSpent?: number;
  totalVisits: number;
  rewardsRedeemed: number;
  lastVisitAt: string | Date;
  walletType: string;
  pushSubscription: string | null;
}

interface MerchantData {
  id: string;
  name: string;
  slug: string;
  niche: string;
  city: string;
  primaryColor: string;
  bgGradient: string;
  stampsRequired: number;
  rewardName: string;
  customerPrefix: string;
  loyaltyMode?: string;
  cashbackRate?: number;
  currency?: string;
  latitude: number | null;
  longitude: number | null;
  radarMessage: string;
  googleMapsUrl: string | null;
  autoReview: boolean;
  autoRadar: boolean;
  autoWinback: boolean;
}

interface TransactionData {
  id: string;
  type: string;
  stampsDelta: number;
  billAmount?: number | null;
  cashbackDelta?: number | null;
  note: string | null;
  createdAt: string | Date;
}

interface CampaignData {
  id: string;
  title: string;
  message: string;
  createdAt: string | Date;
}

interface NotificationData {
  id: string;
  type: string;
  title: string;
  body: string;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: string | Date;
}

interface CustomerPassHubClientProps {
  initialCustomer: CustomerData;
  initialMerchant: MerchantData;
  initialTransactions: TransactionData[];
  initialCampaign: CampaignData | null;
  initialNotifications?: NotificationData[];
}

interface NotificationBanner {
  id: string;
  title: string;
  message: string;
  time: string;
  icon: "stamp" | "reward" | "radar" | "gift" | "cashback";
  actionUrl?: string;
}

export default function CustomerPassHubClient({
  initialCustomer,
  initialMerchant,
  initialTransactions,
  initialCampaign,
  initialNotifications = [],
}: CustomerPassHubClientProps) {
  const [customer, setCustomer] = useState<CustomerData>(initialCustomer);
  const [merchant] = useState<MerchantData>(initialMerchant);
  const [transactions, setTransactions] =
    useState<TransactionData[]>(initialTransactions);
  const [latestCampaign, setLatestCampaign] =
    useState<CampaignData | null>(initialCampaign);

  // Mode B: Detect phone OS language on mount
  const [locale, setLocale] = useState<Locale>("ar");

  useEffect(() => {
    const detected = detectPhoneLocale("fr");
    setLocale(detected);
  }, []);

  const t = translations[locale] || translations.ar;
  const isRTL = locale === "ar";

  const isCashback = customer.loyaltyType === "CASHBACK";
  const currency = merchant.currency || "DH";
  const cashbackRate = merchant.cashbackRate || 10;

  // Notifications banner stack
  const [activeBanner, setActiveBanner] = useState<NotificationBanner | null>(null);

  // Modals & Sheets
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [pkpassJson, setPkpassJson] = useState<Record<string, unknown> | null>(null);
  const [showJsonInspector, setShowJsonInspector] = useState(false);

  // Radar state
  const [isRadarActive, setIsRadarActive] = useState(merchant.autoRadar);
  const [simulatingRadar, setSimulatingRadar] = useState(false);

  // Push notifications state
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
  );

  const prevStampsRef = useRef<number>(customer.stamps);
  const prevRewardsRef = useRef<number>(customer.rewardsRedeemed);
  const prevCashbackRef = useRef<number>(customer.cashbackBalance || 0);
  const prevCampaignIdRef = useRef<string | null>(initialCampaign?.id || null);
  const lastKnownNotificationIdRef = useRef<string | null>(
    initialNotifications.length > 0 ? initialNotifications[0].id : null
  );

  // Register PWA Service Worker on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Service Worker registered successfully:", reg.scope);
        })
        .catch((err) => {
          console.warn("Service Worker registration warning:", err);
        });
    }
  }, []);

  // Trigger floating iOS 18 glass notification banner
  const showBanner = useCallback((banner: NotificationBanner) => {
    setActiveBanner(banner);
    if (banner.icon === "reward" || banner.icon === "cashback") {
      soundEngine.playRewardChime();
    } else if (banner.icon === "radar") {
      soundEngine.playRadarPing();
    } else {
      soundEngine.playStampChime();
    }

    setTimeout(() => {
      setActiveBanner((current) => (current?.id === banner.id ? null : current));
    }, 6000);
  }, []);

  // Initial welcome notification on landing
  useEffect(() => {
    const timer = setTimeout(() => {
      showBanner({
        id: "welcome-stamp",
        title:
          locale === "ar"
            ? `مرحباً بك في ${merchant.name}! 🎁`
            : locale === "fr"
            ? `Bienvenue chez ${merchant.name} ! 🎁`
            : `¡Bienvenido a ${merchant.name}! 🎁`,
        message: isCashback
          ? locale === "ar"
            ? `تم تفعيل بطاقة الكاش باك (${cashbackRate}%). رصيدك المتاح: ${Number(
                customer.cashbackBalance || 0
              ).toFixed(2)} ${currency}.`
            : locale === "fr"
            ? `Carte cashback (${cashbackRate}%) activée. Solde disponible : ${Number(
                customer.cashbackBalance || 0
              ).toFixed(2)} ${currency}.`
            : `Tarjeta cashback (${cashbackRate}%) activada. Saldo disponible: ${Number(
                customer.cashbackBalance || 0
              ).toFixed(2)} ${currency}.`
          : locale === "ar"
          ? "حصلت على أول ختم هدية ترحيبية على بطاقة الولاء الخاصة بك."
          : locale === "fr"
          ? "Vous avez reçu votre premier tampon de bienvenue offert."
          : "Has recibido tu primer sello de bienvenida de regalo.",
        time: "الآن",
        icon: isCashback ? "cashback" : "gift",
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [merchant.name, showBanner, isCashback, cashbackRate, customer.cashbackBalance, currency, locale]);

  // Real-time Background Polling every 2.5 seconds
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchLatestPass = async () => {
      if (document.hidden) return;

      try {
        const res = await fetch(`/api/pass/${customer.passSerial}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!res.ok) return;
        const data = await res.json();

        if (isMounted && data.customer) {
          const newStamps = data.customer.stamps;
          const oldStamps = prevStampsRef.current;
          const newRewards = data.customer.rewardsRedeemed;
          const oldRewards = prevRewardsRef.current;
          const newCashback = Number(data.customer.cashbackBalance || 0);
          const oldCashback = prevCashbackRef.current;

          // 1. Detect New Stamp Added
          if (newStamps > oldStamps) {
            prevStampsRef.current = newStamps;
            if (newStamps >= merchant.stampsRequired) {
              showBanner({
                id: `reward-unlocked-${Date.now()}`,
                title: t.pass.rewardUnlockedTitle,
                message: `${t.pass.rewardUnlockedBody} (${merchant.rewardName})`,
                time: "الآن",
                icon: "reward",
              });
            } else {
              showBanner({
                id: `stamp-added-${Date.now()}`,
                title: t.pass.stampAddedTitle,
                message: t.pass.stampAddedBody.replace(
                  "{left}",
                  String(merchant.stampsRequired - newStamps)
                ),
                time: "الآن",
                icon: "stamp",
              });
            }
          } else {
            prevStampsRef.current = newStamps;
          }

          // 2. Detect Reward Redeemed
          if (newRewards > oldRewards) {
            prevRewardsRef.current = newRewards;
            showBanner({
              id: `reward-redeemed-${Date.now()}`,
              title: "🎁 بصحتك المكافأة!",
              message: `تم تسليم ${merchant.rewardName} بنجاح. تم تجديد البطاقة لمواصلة جمع الأختام.`,
              time: "الآن",
              icon: "reward",
            });
          } else {
            prevRewardsRef.current = newRewards;
          }

          // 3. Detect Cashback Earned or Redeemed
          if (Math.abs(newCashback - oldCashback) >= 0.01) {
            if (newCashback > oldCashback) {
              const gained = (newCashback - oldCashback).toFixed(2);
              showBanner({
                id: `cashback-earned-${Date.now()}`,
                title: t.pass.cashbackEarnedTitle,
                message: t.pass.cashbackEarnedBody
                  .replace("{amount}", gained)
                  .replace("{rate}", String(cashbackRate))
                  .replace("{currency}", currency)
                  .replace("{balance}", newCashback.toFixed(2)),
                time: "الآن",
                icon: "cashback",
              });
            } else {
              const spent = (oldCashback - newCashback).toFixed(2);
              showBanner({
                id: `cashback-redeemed-${Date.now()}`,
                title: t.pass.cashbackRedeemedTitle,
                message: t.pass.cashbackRedeemedBody
                  .replace("{amount}", spent)
                  .replace("{currency}", currency)
                  .replace("{balance}", newCashback.toFixed(2)),
                time: "الآن",
                icon: "cashback",
              });
            }
            prevCashbackRef.current = newCashback;
          }

          // 4. Detect Broadcast Campaign Push
          if (
            data.latestCampaign &&
            data.latestCampaign.id !== prevCampaignIdRef.current
          ) {
            prevCampaignIdRef.current = data.latestCampaign.id;
            showBanner({
              id: `promo-broadcast-${data.latestCampaign.id}`,
              title: `📣 ${data.latestCampaign.title || "عرض خاص جديد!"}`,
              message: data.latestCampaign.message,
              time: "الآن",
              icon: "reward",
            });
          }

          // 5. Detect Persisted Queue Notifications
          if (
            Array.isArray(data.notifications) &&
            data.notifications.length > 0
          ) {
            const latestNotif = data.notifications[0] as NotificationData;
            if (lastKnownNotificationIdRef.current === null) {
              lastKnownNotificationIdRef.current = latestNotif.id;
            } else if (latestNotif.id !== lastKnownNotificationIdRef.current) {
              lastKnownNotificationIdRef.current = latestNotif.id;

              let bannerIcon: "stamp" | "reward" | "radar" | "gift" | "cashback" =
                "gift";
              if (latestNotif.type === "STAMP") bannerIcon = "stamp";
              else if (
                latestNotif.type === "REWARD" ||
                latestNotif.type === "REVIEW"
              )
                bannerIcon = "reward";
              else if (latestNotif.type === "RADAR") bannerIcon = "radar";

              showBanner({
                id: latestNotif.id,
                title: latestNotif.title,
                message: latestNotif.body,
                time: "الآن",
                icon: bannerIcon,
                actionUrl: latestNotif.actionUrl || undefined,
              });
            }
          }

          setCustomer(data.customer);
          if (data.transactions) setTransactions(data.transactions);
          if (data.latestCampaign) setLatestCampaign(data.latestCampaign);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Polling error:", err);
        }
      }
    };

    const interval = setInterval(fetchLatestPass, 2500);

    return () => {
      isMounted = false;
      controller.abort();
      clearInterval(interval);
    };
  }, [
    customer.passSerial,
    merchant.stampsRequired,
    merchant.rewardName,
    cashbackRate,
    currency,
    showBanner,
    t,
  ]);

  // Handle Push Permission
  const handleEnablePush = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      alert("المتصفح لا يدعم الإشعارات المباشرة");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);

        await fetch(`/api/pass/${customer.passSerial}/subscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(8000),
          body: JSON.stringify({
            pushSubscription: "browser-active",
            walletType: "WEBPASS",
          }),
        });

        showBanner({
          id: "push-granted",
          title: "تم تفعيل الإشعارات بنجاح 🔔",
          message:
            "ستتلقى إشعاراً فورياً على شاشة هاتفك عند إضافة ختم، كاش باك، أو عروض خاصة.",
          time: "الآن",
          icon: "stamp",
        });
      }
    } catch (err) {
      console.error("Notification permission error:", err);
    }
  };

  // 100m Radar Simulator
  const handleSimulateRadar = async () => {
    setSimulatingRadar(true);

    try {
      await fetch(`/api/pass/${customer.passSerial}/radar`, {
        method: "POST",
        signal: AbortSignal.timeout(8000),
      });
    } catch (err) {
      console.warn("Radar simulator server trigger warning:", err);
    }

    setTimeout(() => {
      setSimulatingRadar(false);
      showBanner({
        id: `radar-ping-${Date.now()}`,
        title: `📍 رادار القرب 100m: ${merchant.name}`,
        message: merchant.radarMessage,
        time: "الآن",
        icon: "radar",
        actionUrl: `/pass/${customer.passSerial}`,
      });
    }, 1200);
  };

  // Fetch PassKit Apple Wallet JSON
  const handleOpenWalletModal = async () => {
    setIsWalletModalOpen(true);
    if (!pkpassJson) {
      try {
        const res = await fetch(
          `/api/pass/${customer.passSerial}/pkpass?lang=${locale}`,
          {
            signal: AbortSignal.timeout(8000),
          }
        );
        const data = await res.json();
        setPkpassJson(data.passJson);
      } catch (err) {
        console.error("Error fetching pkpass spec:", err);
      }
    }
  };

  const isRewardReady = customer.stamps >= merchant.stampsRequired;

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="w-full max-w-[430px] mx-auto min-h-screen bg-[#0B0F17] flex flex-col justify-between p-4 sm:p-5 text-white selection:bg-emerald-500 selection:text-black relative"
    >
      {/* iOS 18 Floating Glass Notification Banner Stack */}
      {activeBanner && (
        <div className="fixed top-3 left-0 right-0 z-50 px-4 max-w-[430px] mx-auto animate-in slide-in-from-top-4 duration-300">
          <div className="glass-panel p-3.5 rounded-3xl border border-white/20 shadow-2xl flex items-start gap-3 bg-[#111827]/95 backdrop-blur-2xl">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-md">
              {activeBanner.icon === "reward" ? (
                <Gift className="w-5 h-5 animate-spin" />
              ) : activeBanner.icon === "cashback" ? (
                <Coins className="w-5 h-5 animate-bounce" />
              ) : activeBanner.icon === "radar" ? (
                <MapPin className="w-5 h-5 animate-pulse" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
            </div>

            <div className={`flex-1 min-w-0 ${isRTL ? "text-right" : "text-left"}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white truncate">
                  {activeBanner.title}
                </span>
                <span className="text-[10px] text-white/50 font-mono">
                  {activeBanner.time}
                </span>
              </div>
              <p className="text-[11px] text-white/80 mt-0.5 leading-relaxed">
                {activeBanner.message}
              </p>
              {activeBanner.actionUrl && (
                <div className="mt-2">
                  <a
                    href={activeBanner.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 font-bold text-[11px] hover:bg-amber-300 transition-colors shadow-sm"
                  >
                    <span>فتح الرابط ⭐</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setActiveBanner(null)}
              className="text-white/40 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="space-y-4 pt-1">
        {/* Top Header: Merchant, Customer Name & Language Switcher */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-sm text-white shadow"
              style={{ background: merchant.bgGradient || merchant.primaryColor }}
            >
              {merchant.name.slice(0, 2)}
            </div>
            <div>
              <h1 className="font-bold text-sm text-white">{merchant.name}</h1>
              <span className="text-[11px] text-emerald-400 font-medium">
                {merchant.customerPrefix} {customer.name} 👋
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Corner Language Selector Pill */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-0.5 text-[10px] font-semibold">
              <button
                type="button"
                onClick={() => setLocale("ar")}
                className={`px-1.5 py-0.5 rounded-full transition ${
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
                className={`px-1.5 py-0.5 rounded-full transition ${
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
                className={`px-1.5 py-0.5 rounded-full transition ${
                  locale === "es"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                ES
              </button>
            </div>

            <div className="text-start bg-white/5 border border-white/10 px-2.5 py-1 rounded-xl">
              <span className="text-xs font-mono font-bold text-emerald-400">
                #{customer.memberCode}
              </span>
            </div>
          </div>
        </div>

        {/* Glowing Status Banner when Cashback > 0 */}
        {isCashback && Number(customer.cashbackBalance || 0) > 0 && (
          <div className="p-3.5 rounded-3xl bg-gradient-to-r from-amber-500/20 via-emerald-500/15 to-amber-500/20 border border-amber-400/30 text-amber-300 text-xs flex items-center gap-2.5 shadow-lg shadow-amber-500/10">
            <Coins className="w-5 h-5 flex-shrink-0 text-amber-300 animate-pulse" />
            <span className="leading-relaxed font-semibold">
              {t.pass.cashbackBanner
                .replace("{balance}", Number(customer.cashbackBalance).toFixed(2))
                .replace("{currency}", currency)}
            </span>
          </div>
        )}

        {/* Golden Reward Ready Banner for Stamps */}
        {!isCashback && isRewardReady && (
          <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/20 via-amber-500/30 to-amber-600/20 border-2 border-amber-400/50 text-white shadow-xl animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold flex-shrink-0 shadow-lg shadow-amber-500/30">
                <Gift className="w-6 h-6 animate-bounce" />
              </div>
              <div className={isRTL ? "text-right" : "text-left"}>
                <h2 className="font-bold text-sm text-amber-300">
                  {t.pass.rewardUnlockedTitle}
                </h2>
                <p className="text-xs text-white/90 mt-0.5">
                  وصلت إلى {customer.stamps} أختام! أظهر هذه البطاقة للكاشير لاستلام:{" "}
                  <strong className="underline text-amber-200">
                    {merchant.rewardName}
                  </strong>
                  .
                </p>
              </div>
            </div>
          </div>
        )}

        {/* The Live Interactive Wallet Pass */}
        <div className="relative">
          <WalletPassPreview
            name={merchant.name}
            niche={merchant.niche}
            primaryColor={merchant.primaryColor}
            bgGradient={merchant.bgGradient}
            loyaltyType={customer.loyaltyType || "STAMPS"}
            stamps={customer.stamps}
            stampsRequired={merchant.stampsRequired}
            rewardName={merchant.rewardName}
            cashbackRate={cashbackRate}
            cashbackBalance={customer.cashbackBalance || 0}
            totalCashbackEarned={customer.totalCashbackEarned || 0}
            currency={currency}
            memberCode={customer.memberCode}
            qrValue={`WALINK:${customer.passSerial}`}
            compact={false}
            locale={locale}
          />
        </div>

        {/* Google Maps 5-Star Review Prompt (Conditional) */}
        {merchant.autoReview &&
          (isRewardReady || customer.rewardsRedeemed > 0) && (
            <div
              className={`glass-panel p-4 rounded-3xl border border-amber-500/30 bg-amber-500/5 space-y-2 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>هل أعجبتك الخدمة في {merchant.name}؟</span>
                </div>
                <span className="text-[10px] text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-md">
                  Google Maps
                </span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed">
                ساعدنا بتقييم متجرنا على خرائط جوجل بـ 5 نجوم لمساعدة الآخرين على
                اكتشافنا! ⭐
              </p>
              <a
                href={merchant.googleMapsUrl || "https://maps.google.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-400/20"
              >
                <span>تقييم في خرائط Google</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

        {/* Wallet Action Buttons (Apple / Google / WebPass) */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleOpenWalletModal}
            className="py-3 px-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md"
          >
            <Smartphone className="w-4 h-4 text-white" />
            <span>{t.pass.addToAppleWallet}</span>
          </button>

          <button
            type="button"
            onClick={handleEnablePush}
            className={`py-3 px-3.5 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition shadow-md ${
              notificationsEnabled
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
            }`}
          >
            {notificationsEnabled ? (
              <>
                <BellRing className="w-4 h-4 text-emerald-400" />
                <span>الإشعارات مفعّلة</span>
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 text-amber-400" />
                <span>تفعيل الإشعارات</span>
              </>
            )}
          </button>
        </div>

        {/* 100m Geofencing Radar Live Tracker & Simulator */}
        {merchant.autoRadar && (
          <div className="glass-panel p-4 rounded-3xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-white">
                  رادار القرب الجغرافي (100m Radar)
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-semibold">
                نشط
              </span>
            </div>

            <p className={`text-[11px] text-white/60 leading-relaxed ${isRTL ? "text-right" : "text-left"}`}>
              كلما اقتربت بـ 100 متر من {merchant.name}، يوقظ الهاتف شاشتك بإشعار لتذكيرك برصيدك ومكافآتك.
            </p>

            <button
              type="button"
              disabled={simulatingRadar}
              onClick={handleSimulateRadar}
              className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <Compass
                className={`w-4 h-4 text-emerald-400 ${
                  simulatingRadar ? "animate-spin" : ""
                }`}
              />
              <span>
                {simulatingRadar ? "جاري قياس المسافة..." : "جرّب رادار الـ 100 متر الآن"}
              </span>
            </button>
          </div>
        )}

        {/* Pass Details & Recent Activity Drawer */}
        <div className={`glass-panel p-5 rounded-3xl border border-white/10 space-y-4 ${isRTL ? "text-right" : "text-left"}`}>
          <h2 className="text-xs font-bold text-white flex items-center justify-between pb-2 border-b border-white/10">
            <span>{t.pass.activityDrawerTitle}</span>
            <span className="text-[10px] font-mono text-white/50">
              {customer.totalVisits} {t.pass.totalVisits}
            </span>
          </h2>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {isCashback ? (
              <>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-white/50 block">
                    {t.pass.balanceAvailable}:
                  </span>
                  <span className="font-mono font-bold text-amber-300">
                    {Number(customer.cashbackBalance || 0).toFixed(2)} {currency}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-white/50 block">
                    {t.pass.totalEarned}
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {Number(customer.totalCashbackEarned || 0).toFixed(2)} {currency}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-white/50 block">
                    {t.pass.lastVisitLabel}:
                  </span>
                  <span className="font-semibold text-white">
                    {formatTimeAgoArabic(customer.lastVisitAt)}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-white/50 block">المكافآت المستفاد منها:</span>
                  <span className="font-mono font-bold text-amber-400">
                    {customer.rewardsRedeemed} مكافأة
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Transactions List */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-semibold text-white/70 block">
              العمليات الأخيرة:
            </span>

            {transactions.length === 0 ? (
              <p className="text-[11px] text-white/40">لا توجد عمليات سابقة</p>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-white block">
                        {tx.note || tx.type}
                      </span>
                      <span className="text-[10px] text-white/40">
                        {formatTimeAgoArabic(tx.createdAt)}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`font-mono font-bold text-xs ${
                      (tx.cashbackDelta && tx.cashbackDelta > 0) ||
                      tx.stampsDelta > 0
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  >
                    {tx.cashbackDelta
                      ? `${tx.cashbackDelta > 0 ? "+" : ""}${tx.cashbackDelta} ${currency}`
                      : `${tx.stampsDelta > 0 ? "+" : ""}${tx.stampsDelta} ختم`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer Return Link */}
      <footer className="py-6 text-center text-xs text-white/40 space-y-2">
        <Link
          href="/"
          className="hover:text-emerald-400 transition inline-flex items-center gap-1.5"
        >
          <span>منصة والينك (walink.ma)</span>
          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
        </Link>
        <p className="text-[10px] text-white/30">
          البطاقة الرقمية الرسمية لـ {merchant.name}
        </p>
      </footer>

      {/* Add to Wallet Modal & Spec Inspector */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[#0F172A] border border-white/10 rounded-3xl shadow-2xl p-6 text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">حفظ البطاقة في الهاتف</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWalletModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Smart PWA Install Guide */}
            <div className={`space-y-3 ${isRTL ? "text-right" : "text-left"}`}>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="font-bold text-xs text-emerald-400 block">
                  🍎 على هواتف iPhone (Safari):
                </span>
                <p className="text-xs text-white/80 leading-relaxed">
                  اضغط على زر المشاركة <strong>(Share ⎋)</strong> أسفل الشاشة، ثم اختر{" "}
                  <strong>&quot;إضافة إلى الشاشة الرئيسية&quot; (Add to Home Screen)</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="font-bold text-xs text-blue-400 block">
                  🤖 على هواتف Android (Chrome):
                </span>
                <p className="text-xs text-white/80 leading-relaxed">
                  اضغط على القائمة (⋮) أعلى اليمين، ثم اختر <strong>&quot;تثبيت التطبيق&quot; (Install App)</strong> أو إضافة إلى الشاشة.
                </p>
              </div>
            </div>

            {/* Developer PassKit Spec Inspector */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowJsonInspector(!showJsonInspector)}
                className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-xs flex items-center justify-between transition"
              >
                <span className="flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-amber-400" />
                  <span>معاينة كود Apple Wallet (pass.json)</span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showJsonInspector ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showJsonInspector && pkpassJson && (
                <div className="mt-2 p-3 bg-black/60 rounded-xl border border-white/10 text-[10px] font-mono text-emerald-300 max-h-48 overflow-y-auto text-left dir-ltr">
                  <pre>{JSON.stringify(pkpassJson, null, 2)}</pre>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsWalletModalOpen(false)}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
            >
              فهمت، شكراً
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
