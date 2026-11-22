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
  Copy,
  ShieldCheck,
  KeyRound,
  Lock,
} from "lucide-react";
import WalletPassPreview from "@/components/WalletPassPreview";
import { formatTimeAgoArabic } from "@/lib/utils";
import { soundEngine } from "@/lib/sound";
import { Locale, translations } from "@/lib/i18n/translations";
import { detectPhoneLocale } from "@/lib/i18n/context";
import { getJoinUrl } from "@/lib/urls";

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
  isVip?: boolean;
  referredByCode?: string | null;
  referralsCount?: number;
  lastVisitAt: string | Date;
  walletType: string;
  pushSubscription: string | null;
  securityPin?: string;
  failedPinAttempts?: number;
  pinLockedUntil?: string | null;
}

interface MerchantData {
  id: string;
  name: string;
  slug: string;
  niche: string;
  city: string;
  phone?: string | null;
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
  vipVisitsThreshold?: number;
  vipCashbackBonus?: number;
  referralBonus?: number;
  radarZones?: string;
  menuUrl?: string | null;
  instagramUrl?: string | null;
  termsText?: string;
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

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

function isStandaloneNavigator(nav: Navigator): nav is NavigatorWithStandalone {
  return "standalone" in nav;
}

function OfficialGoogleWalletIcon({ className = "w-10 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 50 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="3" width="40" height="24" rx="4" fill="#EA4335" />
      <rect x="5" y="6.5" width="40" height="22" rx="4" fill="#FBBC04" />
      <rect x="5" y="10" width="40" height="20" rx="4" fill="#34A853" />
      <path
        d="M5 15C5 12.7909 6.79086 11 9 11H41C43.2091 11 45 12.7909 45 15V29C45 31.2091 43.2091 33 41 33H9C6.79086 33 5 31.2091 5 29V15Z"
        fill="#4285F4"
      />
      <path
        d="M9 15H41V19C41 19 35 21 25 21C15 21 9 19 9 19V15Z"
        fill="#1A73E8"
        opacity="0.85"
      />
    </svg>
  );
}

function OfficialAppleWalletIcon({ className = "w-10 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 52 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="2" width="44" height="26" rx="4" fill="#007AFF" />
      <rect x="4" y="5.5" width="44" height="24" rx="4" fill="#FF9500" />
      <rect x="4" y="9" width="44" height="22" rx="4" fill="#FFCC00" />
      <rect x="4" y="12.5" width="44" height="20" rx="4" fill="#34C759" />
      <path
        d="M4 16C4 13.7909 5.79086 12 8 12H44C46.2091 12 48 13.7909 48 16V32C48 34.2091 46.2091 36 44 36H8C5.79086 36 4 34.2091 4 32V16Z"
        fill="#E5E5EA"
      />
      <path
        d="M19 12C19 15.866 22.134 19 26 19C29.866 19 33 15.866 33 12H19Z"
        fill="#FF3B30"
      />
    </svg>
  );
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

  // Mode B: Detect language from URL search param > localStorage > phone OS
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
        console.warn("localStorage locale error:", err);
      }
    }
    setLocale(initialLocale);
  }, []);

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("walink_customer_locale", newLocale);
        const url = new URL(window.location.href);
        url.searchParams.set("lang", newLocale);
        window.history.replaceState({}, "", url.toString());
      } catch (err) {
        console.warn("localStorage locale update error:", err);
      }
    }
  };

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

  // Google Wallet State & Modal
  const [isGoogleWalletLoading, setIsGoogleWalletLoading] = useState(false);
  const [googleWalletModal, setGoogleWalletModal] = useState<{
    isOpen: boolean;
    configured: boolean;
    mode: string;
    saveUrl: string | null;
    previewPayload: {
      loyaltyClass?: Record<string, unknown>;
      loyaltyObject?: Record<string, unknown>;
    } | null;
  }>({
    isOpen: false,
    configured: false,
    mode: "mock",
    saveUrl: null,
    previewPayload: null,
  });
  const [copiedGooglePayload, setCopiedGooglePayload] = useState(false);
  const [showGoogleJsonInspector, setShowGoogleJsonInspector] = useState(false);

  // Rotating Security QR Token
  const [timeToken, setTimeToken] = useState(() =>
    Math.floor(Date.now() / 60000).toString(36)
  );
  const [copiedRef, setCopiedRef] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const token = Math.floor(now / 60000).toString(36);
      setTimeToken(token);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Push notifications state
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "granted"
  );

  // Card Security & Recovery State
  const [isPinChangeModalOpen, setIsPinChangeModalOpen] = useState(false);
  const [oldPinInput, setOldPinInput] = useState("");
  const [newPinInput, setNewPinInput] = useState("");
  const [confirmPinInput, setConfirmPinInput] = useState("");
  const [pinChangeError, setPinChangeError] = useState<string | null>(null);
  const [pinChangeSuccess, setPinChangeSuccess] = useState<string | null>(null);
  const [isSavingPin, setIsSavingPin] = useState(false);
  const [currentSecurityPin, setCurrentSecurityPin] = useState(
    customer.securityPin || customer.memberCode
  );

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeError(null);
    setPinChangeSuccess(null);

    if (!newPinInput || !/^\d{4}$/.test(newPinInput.trim())) {
      setPinChangeError(
        locale === "ar"
          ? "رمز PIN الجديد يجب أن يتكون من 4 أرقام حصراً (مثال: 1234)"
          : locale === "fr"
          ? "Le nouveau PIN doit comporter 4 chiffres (ex: 1234)"
          : "El nuevo PIN debe tener 4 dígitos (ej: 1234)"
      );
      return;
    }

    if (newPinInput.trim() !== confirmPinInput.trim()) {
      setPinChangeError(
        locale === "ar"
          ? "تأكيد الرمز غير متطابق"
          : locale === "fr"
          ? "Les codes PIN ne correspondent pas"
          : "Los códigos PIN no coinciden"
      );
      return;
    }

    setIsSavingPin(true);

    try {
      const res = await fetch(`/api/pass/${customer.passSerial}/pin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPin: oldPinInput.trim() || undefined,
          newPin: newPinInput.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "فشل تغيير الرمز");
      }

      const updatedPin = data.securityPin || newPinInput.trim();
      setCurrentSecurityPin(updatedPin);
      setCustomer((prev) => ({ ...prev, securityPin: updatedPin }));
      setPinChangeSuccess(
        data.message ||
          (locale === "ar"
            ? "تم تحديث رمز PIN بنجاح!"
            : locale === "fr"
            ? "Code PIN mis à jour avec succès !"
            : "¡PIN actualizado con éxito!")
      );
      setTimeout(() => {
        setIsPinChangeModalOpen(false);
        setOldPinInput("");
        setNewPinInput("");
        setConfirmPinInput("");
        setPinChangeSuccess(null);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء حفظ الرمز";
      setPinChangeError(msg);
    } finally {
      setIsSavingPin(false);
    }
  };

  // Android PWA Direct Home Screen Installation State
  const [isAndroid, setIsAndroid] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isAndroidInstallModalOpen, setIsAndroidInstallModalOpen] = useState(false);
  const [showStandalonePushPrompt, setShowStandalonePushPrompt] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent || "";
      const isAndroidDevice = /android/i.test(ua);
      setIsAndroid(isAndroidDevice);

      // Check if already in standalone display mode
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (isStandaloneNavigator(navigator) && navigator.standalone === true);
      if (isStandaloneMode) {
        setIsInstalled(true);
        if ("Notification" in window && Notification.permission === "default") {
          const timer = setTimeout(() => {
            setShowStandalonePushPrompt(true);
          }, 1200);
          return () => {
            clearTimeout(timer);
          };
        }
      }

      // Ensure dynamic per-pass manifest link is injected in document head
      const existingLink = document.querySelector<HTMLLinkElement>("link[rel='manifest']");
      const manifestUrl = `/api/pass/${customer.passSerial}/manifest`;
      if (existingLink) {
        existingLink.href = manifestUrl;
      } else {
        const link = document.createElement("link");
        link.rel = "manifest";
        link.href = manifestUrl;
        document.head.appendChild(link);
      }

      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredInstallPrompt(e as BeforeInstallPromptEvent);
      };

      const handleAppInstalled = () => {
        setIsInstalled(true);
        setDeferredInstallPrompt(null);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.addEventListener("appinstalled", handleAppInstalled);

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.removeEventListener("appinstalled", handleAppInstalled);
      };
    }
  }, [customer.passSerial]);

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

  // Handle Push Permission (Trilingual with Immediate Status Sync)
  const handleEnablePush = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      alert("المتصفح لا يدعم الإشعارات المباشرة");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
        setShowStandalonePushPrompt(false);

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
          title:
            locale === "fr"
              ? "Notifications activées 🔔"
              : locale === "es"
              ? "Notificaciones activadas 🔔"
              : "تم تفعيل الإشعارات بنجاح 🔔",
          message:
            locale === "fr"
              ? "Vous recevrez des notifications directes pour vos tampons et cadeaux."
              : locale === "es"
              ? "Recibirás notificaciones directas para tus sellos y recompensas."
              : "ستتلقى إشعاراً فورياً على شاشة هاتفك عند إضافة ختم، كاش باك، أو عروض خاصة.",
          time: "الآن",
          icon: "stamp",
        });
      }
    } catch (err) {
      console.error("Notification permission error:", err);
    }
  }, [customer.passSerial, locale, showBanner]);

  // Handle Android PWA Direct Home Screen Installation with Smart Push Chaining
  const handleInstallAndroidApp = useCallback(async () => {
    if (isInstalled) {
      showBanner({
        id: "already-installed",
        title: locale === "ar" ? "البطاقة مثبتة" : locale === "fr" ? "Carte installée" : "Tarjeta instalada",
        message:
          locale === "ar"
            ? "البطاقة مثبتة بالفعل على شاشتك الرئيسية!"
            : locale === "fr"
            ? "La carte est déjà installée sur votre écran d'accueil !"
            : "¡La tarjeta ya está instalada en tu pantalla de inicio!",
        time: "الآن",
        icon: "reward",
      });
      return;
    }

    if (deferredInstallPrompt) {
      // Case A: Native install prompt is available
      try {
        // 1. Call prompt() FIRST to preserve the active user gesture for the native PWA install dialog
        await deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
          setDeferredInstallPrompt(null);
          showBanner({
            id: "install-success",
            title: locale === "ar" ? "تم التثبيت بنجاح!" : locale === "fr" ? "Installation réussie !" : "¡Instalado con éxito!",
            message:
              locale === "ar"
                ? "تمت إضافة البطاقة إلى شاشتك الرئيسية بنجاح!"
                : locale === "fr"
                ? "La carte a été ajoutée à votre écran d'accueil !"
                : "¡La tarjeta se ha añadido a tu pantalla de inicio!",
            time: "الآن",
            icon: "reward",
          });

          // 2. Chained Push Notification Request after installation accepted
          if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
            try {
              const res = await Notification.requestPermission();
              if (res === "granted") {
                await handleEnablePush();
              } else if (res === "default") {
                // If browser requires separate click gesture, show sleek floating banner
                setShowStandalonePushPrompt(true);
              }
            } catch (pErr) {
              console.warn("Notification request after install caught:", pErr);
              setShowStandalonePushPrompt(true);
            }
          }
        }
      } catch (err) {
        console.warn("Failed to prompt install:", err);
        setIsAndroidInstallModalOpen(true);
      }
    } else {
      // Case B: deferredInstallPrompt is null (Fallback Visual Guide Modal)
      // Since no native install dialog is competing for the user gesture,
      // trigger Notification.requestPermission() IMMEDIATELY on this same click!
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
        void handleEnablePush();
      }
      setIsAndroidInstallModalOpen(true);
    }
  }, [
    deferredInstallPrompt,
    handleEnablePush,
    isInstalled,
    locale,
    showBanner,
  ]);

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

  // Handle Add to Google Wallet
  const handleAddToGoogleWallet = async () => {
    setIsGoogleWalletLoading(true);
    try {
      const res = await fetch(
        `/api/pass/${customer.passSerial}/google-wallet?lang=${locale}&activate=1`,
        { signal: AbortSignal.timeout(10000) }
      );
      const data = await res.json();
      if (data.ok && data.configured && data.saveUrl) {
        // Direct redirect / open Google Wallet save URL
        window.location.href = data.saveUrl;
      } else {
        // Diagnostic or fallback preview modal
        setGoogleWalletModal({
          isOpen: true,
          configured: Boolean(data.configured),
          mode: data.mode || "mock",
          saveUrl: data.saveUrl || null,
          previewPayload: data.previewPayload || null,
        });
      }
    } catch (err) {
      console.error("Error generating Google Wallet link:", err);
      alert("تعذر الاتصال بخادم Google Wallet، يرجى المحاولة لاحقاً");
    } finally {
      setIsGoogleWalletLoading(false);
    }
  };

  const isRewardReady = customer.stamps >= merchant.stampsRequired;

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="w-full max-w-[430px] mx-auto min-h-screen bg-[#F0F2F5] flex flex-col justify-between p-4 sm:p-5 text-[#111B21] selection:bg-[#008069] selection:text-white relative border-x border-[#E9EDEF]"
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 0%, rgba(0, 128, 105, 0.04) 0%, transparent 60%), radial-gradient(rgba(17, 27, 33, 0.04) 1px, transparent 1px)",
        backgroundSize: "100% 100%, 24px 24px",
      }}
    >
      {/* iOS 18 Floating Notification Banner Stack */}
      {activeBanner && (
        <div className="fixed top-3 left-0 right-0 z-50 px-4 max-w-[430px] mx-auto animate-in slide-in-from-top-4 duration-300">
          <div className="p-3.5 rounded-3xl border border-[#E9EDEF] shadow-xl flex items-start gap-3 bg-white/95 backdrop-blur-md">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00A884] to-[#008069] text-white flex items-center justify-center flex-shrink-0 shadow-md">
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
                <span className="font-bold text-xs text-[#111B21] truncate">
                  {activeBanner.title}
                </span>
                <span className="text-[10px] text-[#54656F] font-mono">
                  {activeBanner.time}
                </span>
              </div>
              <p className="text-[11px] text-[#54656F] mt-0.5 leading-relaxed">
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
              className="text-[#54656F] hover:text-[#111B21] p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Standalone Home Screen Push Notification Prompt Banner */}
      {showStandalonePushPrompt && !notificationsEnabled && (
        <div className="fixed top-3 left-0 right-0 z-50 px-4 max-w-[430px] mx-auto animate-in slide-in-from-top-4 duration-300">
          <div className="p-3.5 rounded-3xl border border-[#00A884]/30 bg-[#0B141A]/95 text-white shadow-2xl backdrop-blur-md flex items-center justify-between gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#00A884] to-[#008069] flex items-center justify-center flex-shrink-0 shadow-md">
              <BellRing className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div className={`flex-1 min-w-0 ${isRTL ? "text-right" : "text-left"}`}>
              <p className="text-xs font-bold truncate">
                {locale === "fr"
                  ? "Activer les notifications 🔔"
                  : locale === "es"
                  ? "Activar notificaciones 🔔"
                  : "تفعيل إشعارات الرصيد والعروض 🔔"}
              </p>
              <p className="text-[10px] text-white/70 leading-tight mt-0.5">
                {locale === "fr"
                  ? "Recevez vos tampons et cadeaux en direct"
                  : locale === "es"
                  ? "Recibe tus sellos y recompensas al instante"
                  : "لتصلك أختامك وكاشباك مشترياتك فورياً على الشاشة"}
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={async () => {
                  await handleEnablePush();
                  setShowStandalonePushPrompt(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#00A884] hover:bg-[#008069] text-white text-xs font-bold shadow-md transition active:scale-95 flex items-center gap-1"
              >
                <span>{locale === "fr" ? "Activer" : locale === "es" ? "Activar" : "تفعيل"}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowStandalonePushPrompt(false)}
                className="w-7 h-7 rounded-xl bg-white/10 hover:bg-white/20 text-white/60 hover:text-white flex items-center justify-center transition"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="space-y-4 pt-1">
        {/* Top Header: Merchant, Customer Name & Language Switcher */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-sm text-white shadow-sm border border-black/10"
              style={{ background: merchant.bgGradient || merchant.primaryColor }}
            >
              {merchant.name.slice(0, 2)}
            </div>
            <div>
              <h1 className="font-bold text-sm text-[#111B21]">{merchant.name}</h1>
              <span className="text-[11px] text-[#008069] font-semibold">
                {merchant.customerPrefix} {customer.name} 👋
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Corner Language Selector Pill */}
            <div className="flex items-center gap-1 bg-[#E9EDEF] border border-[#D1D7DB] rounded-full p-0.5 text-[10px] font-semibold">
              <button
                type="button"
                onClick={() => changeLocale("ar")}
                className={`px-1.5 py-0.5 rounded-full transition ${locale === "ar"
                  ? "bg-white text-[#008069] shadow-sm font-bold"
                  : "text-[#54656F] hover:text-[#111B21]"
                  }`}
              >
                عربي
              </button>
              <button
                type="button"
                onClick={() => changeLocale("fr")}
                className={`px-1.5 py-0.5 rounded-full transition ${locale === "fr"
                  ? "bg-white text-[#008069] shadow-sm font-bold"
                  : "text-[#54656F] hover:text-[#111B21]"
                  }`}
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => changeLocale("es")}
                className={`px-1.5 py-0.5 rounded-full transition ${locale === "es"
                  ? "bg-white text-[#008069] shadow-sm font-bold"
                  : "text-[#54656F] hover:text-[#111B21]"
                  }`}
              >
                ES
              </button>
            </div>

            <div className="text-start bg-white border border-[#D1D7DB] px-2.5 py-1 rounded-xl shadow-sm">
              <span className="text-xs font-mono font-bold text-[#008069]">
                #{customer.memberCode}
              </span>
            </div>
          </div>
        </div>

        {/* Glowing Status Banner when Cashback > 0 */}
        {isCashback && Number(customer.cashbackBalance || 0) > 0 && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5 shadow-sm">
            <Coins className="w-5 h-5 flex-shrink-0 text-amber-600 animate-pulse" />
            <span className="leading-relaxed font-semibold">
              {t.pass.cashbackBanner
                .replace("{balance}", Number(customer.cashbackBalance).toFixed(2))
                .replace("{currency}", currency)}
            </span>
          </div>
        )}

        {/* Golden Reward Ready Banner for Stamps */}
        {!isCashback && isRewardReady && (
          <div className="p-4 rounded-2xl bg-amber-100 border border-amber-300 text-amber-950 shadow-md animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
                <Gift className="w-6 h-6 animate-bounce" />
              </div>
              <div className={isRTL ? "text-right" : "text-left"}>
                <h2 className="font-bold text-sm text-amber-900">
                  {t.pass.rewardUnlockedTitle}
                </h2>
                <p className="text-xs text-amber-900/90 mt-0.5">
                  وصلت إلى {customer.stamps} أختام! أظهر هذه البطاقة للكاشير لاستلام:{" "}
                  <strong className="underline text-amber-950 font-bold">
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
            qrValue={`WALINK:${customer.passSerial}:${timeToken}`}
            isVip={Boolean(customer.isVip || (customer.totalVisits >= (merchant.vipVisitsThreshold || 10)))}
            totalVisits={customer.totalVisits}
            vipVisitsThreshold={merchant.vipVisitsThreshold || 10}
            vipCashbackBonus={merchant.vipCashbackBonus || 5}
            compact={false}
            locale={locale}
          />
        </div>

        {/* Google Maps 5-Star Review Prompt (Conditional) */}
        {merchant.autoReview &&
          (isRewardReady || customer.rewardsRedeemed > 0) && (
            <div
              className={`p-4 rounded-2xl border border-amber-200 bg-white space-y-2 shadow-sm ${isRTL ? "text-right" : "text-left"
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>هل أعجبتك الخدمة في {merchant.name}؟</span>
                </div>
                <span className="text-[10px] text-amber-800 bg-amber-100 font-semibold px-2 py-0.5 rounded-md">
                  Google Maps
                </span>
              </div>
              <p className="text-xs text-[#54656F] leading-relaxed">
                ساعدنا بتقييم متجرنا على خرائط جوجل بـ 5 نجوم لمساعدة الآخرين على
                اكتشافنا! ⭐
              </p>
              <a
                href={merchant.googleMapsUrl || "https://maps.google.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition shadow-sm"
              >
                <span>تقييم في خرائط Google</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

        {/* Official Full-Width Wallet Action Buttons (Apple Wallet + Google Wallet + Notifications) */}
        <div className="space-y-3 pt-1">
          {/* Apple Wallet Official Full-Width Button */}
          <button
            type="button"
            onClick={handleOpenWalletModal}
            className="w-full h-[58px] rounded-2xl bg-black hover:bg-neutral-900 text-white flex items-center justify-center gap-3.5 border border-white/20 shadow-md transition-all active:scale-[0.98]"
            dir="ltr"
          >
            <OfficialAppleWalletIcon className="w-10 h-8 flex-shrink-0" />
            <div className="flex flex-col text-left leading-tight text-white select-none">
              <span className="text-[11px] font-normal tracking-tight text-neutral-300">
                {locale === "ar" ? "إضافة إلى" : locale === "fr" ? "Ajouter à" : locale === "es" ? "Añadir a" : "Add to"}
              </span>
              <span className="text-[17px] font-bold tracking-tight text-white -mt-0.5">
                Apple Wallet
              </span>
            </div>
          </button>

          {/* Google Wallet Official Full-Width Pill Button */}
          <button
            type="button"
            disabled={isGoogleWalletLoading}
            onClick={handleAddToGoogleWallet}
            className="w-full h-[58px] rounded-full bg-black hover:bg-neutral-900 text-white flex items-center justify-center gap-3.5 border border-white/20 shadow-md transition-all active:scale-[0.98] disabled:opacity-60"
            dir="ltr"
          >
            {isGoogleWalletLoading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <OfficialGoogleWalletIcon className="w-10 h-8 flex-shrink-0" />
            )}
            <div className="flex flex-col text-left leading-tight text-white select-none">
              <span className="text-[11px] font-normal tracking-tight text-neutral-300">
                {locale === "ar" ? "إضافة إلى" : locale === "fr" ? "Ajouter à" : locale === "es" ? "Añadir a" : "Add to"}
              </span>
              <span className="text-[17px] font-bold tracking-tight text-white -mt-0.5">
                Google Wallet
              </span>
            </div>
          </button>

          {/* Android-Only Direct Home Screen Installation Button (PWA) */}
          {isAndroid && (
            <button
              type="button"
              onClick={handleInstallAndroidApp}
              className="w-full h-[58px] rounded-2xl bg-gradient-to-r from-[#0F5132] via-[#008069] to-[#0A4738] hover:from-[#0B3D26] hover:to-[#006D59] text-white flex items-center justify-center gap-3.5 border border-emerald-400/40 shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0 border border-white/20">
                <Smartphone className="w-5 h-5 text-emerald-200" />
              </div>
              <div className="flex flex-col text-start leading-tight select-none">
                <span className="text-[11px] font-normal tracking-tight text-emerald-200">
                  {locale === "ar"
                    ? "تثبيت البطاقة كتطبيق بدون Wallet"
                    : locale === "fr"
                    ? "Installer l'application sans Wallet"
                    : "Instalar aplicación sin Wallet"}
                </span>
                <span className="text-[15px] font-bold tracking-tight text-white -mt-0.5">
                  {isInstalled
                    ? (locale === "ar"
                        ? "✅ البطاقة مثبتة في شاشتك الرئيسية"
                        : locale === "fr"
                        ? "✅ Carte déjà installée sur l'écran"
                        : "✅ Tarjeta instalada en inicio")
                    : (locale === "ar"
                        ? "📲 إضافة إلى الشاشة الرئيسية (Android)"
                        : locale === "fr"
                        ? "📲 Ajouter à l'écran d'accueil"
                        : "📲 Añadir a la pantalla de inicio")}
                </span>
              </div>
            </button>
          )}

          {/* Browser Notifications Pill */}
          <button
            type="button"
            onClick={handleEnablePush}
            className={`w-full py-2.5 px-3.5 rounded-2xl border font-semibold text-xs flex items-center justify-center gap-2 transition shadow-sm ${notificationsEnabled
              ? "bg-[#008069]/10 border-[#008069]/30 text-[#008069]"
              : "bg-white border-[#D1D7DB] text-[#54656F] hover:bg-[#F0F2F5]"
              }`}
          >
            {notificationsEnabled ? (
              <>
                <BellRing className="w-4 h-4 text-[#008069]" />
                <span>الإشعارات الفورية مفعّلة على هذا الجهاز</span>
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 text-amber-500" />
                <span>تفعيل إشعارات الشاشة والقرب (Push Notifications)</span>
              </>
            )}
          </button>
        </div>

        {/* Viral Customer Referral Card */}
        <div className={`p-4 rounded-2xl bg-white border border-[#E9EDEF] space-y-3 shadow-sm ${isRTL ? "text-right" : "text-left"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#008069] font-bold text-xs">
              <Gift className="w-4 h-4 text-[#008069]" />
              <span>{t.walletEnterprise.referral.title}</span>
            </div>
            <span className="text-[10px] font-semibold text-[#008069] bg-[#008069]/10 px-2.5 py-0.5 rounded-full border border-[#008069]/20">
              {t.walletEnterprise.referral.friendsJoined}: {customer.referralsCount || 0}
            </span>
          </div>
          <p className="text-xs text-[#54656F] leading-relaxed">
            {isCashback
              ? t.walletEnterprise.referral.cashbackDesc
                .replace("{bonus}", String(merchant.referralBonus || 10))
                .replace("{currency}", currency)
              : t.walletEnterprise.referral.stampsDesc}
          </p>
          <div className="flex items-center gap-2 pt-1">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `${merchant.name}: تفضل بطاقة ولاء رقمية مجانية واحصل على هدية ترحيبية فورية! سجل عبر هذا الرابط: ${getJoinUrl(merchant.slug, customer.memberCode)}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#00A884] to-[#008069] hover:from-[#008069] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#008069]/20 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t.walletEnterprise.referral.inviteFriend}</span>
            </a>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  const url = getJoinUrl(merchant.slug, customer.memberCode);
                  navigator.clipboard.writeText(url);
                  setCopiedRef(true);
                  setTimeout(() => setCopiedRef(false), 2000);
                }
              }}
              className="py-2.5 px-3 rounded-xl bg-[#F0F2F5] hover:bg-[#E9EDEF] text-[#111B21] font-semibold text-xs flex items-center gap-1.5 transition border border-[#D1D7DB]"
            >
              {copiedRef ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#008069]" />
                  <span className="text-[#008069]">{t.walletEnterprise.referral.linkCopied}</span>
                </>
              ) : (
                <>
                  <Code className="w-3.5 h-3.5 text-[#54656F]" />
                  <span>{t.walletEnterprise.referral.copyLink}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Back-of-Pass Smart Interactive Tiles */}
        <div className={`p-4 rounded-2xl bg-white border border-[#E9EDEF] space-y-3 shadow-sm ${isRTL ? "text-right" : "text-left"}`}>
          <div className="flex items-center gap-2 text-[#111B21] font-bold text-xs">
            <Compass className="w-4 h-4 text-[#008069]" />
            <span>{t.walletEnterprise.backPass.flipPass}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {merchant.menuUrl && (
              <a
                href={merchant.menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-[#F0F2F5] hover:bg-[#E9EDEF] border border-[#E9EDEF] flex items-center gap-2 transition text-[#111B21] font-medium"
              >
                <span>{t.walletEnterprise.backPass.menu}</span>
                <ExternalLink className="w-3 h-3 text-[#54656F] ms-auto" />
              </a>
            )}
            {merchant.phone && (
              <a
                href={`https://wa.me/${merchant.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-[#F0F2F5] hover:bg-[#E9EDEF] border border-[#E9EDEF] flex items-center gap-2 transition text-[#111B21] font-medium"
              >
                <span>{t.walletEnterprise.backPass.whatsapp}</span>
                <ExternalLink className="w-3 h-3 text-[#54656F] ms-auto" />
              </a>
            )}
            {merchant.instagramUrl && (
              <a
                href={merchant.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-[#F0F2F5] hover:bg-[#E9EDEF] border border-[#E9EDEF] flex items-center gap-2 transition text-[#111B21] font-medium"
              >
                <span>{t.walletEnterprise.backPass.instagram}</span>
                <ExternalLink className="w-3 h-3 text-[#54656F] ms-auto" />
              </a>
            )}
            <a
              href={merchant.googleMapsUrl || `https://maps.google.com/?q=${merchant.latitude || 33.5731},${merchant.longitude || -7.5898}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-[#F0F2F5] hover:bg-[#E9EDEF] border border-[#E9EDEF] flex items-center gap-2 transition text-[#111B21] font-medium"
            >
              <span>{t.walletEnterprise.backPass.directions}</span>
              <ExternalLink className="w-3 h-3 text-[#54656F] ms-auto" />
            </a>
          </div>
          {merchant.termsText && (
            <div className="pt-2 text-[11px] text-[#54656F] leading-relaxed border-t border-[#E9EDEF]">
              <span className="font-semibold text-[#111B21] block mb-0.5">{t.walletEnterprise.backPass.terms}:</span>
              {merchant.termsText}
            </div>
          )}
        </div>

        {/* Card Security & Smart Recovery Section */}
        <div className={`p-4 rounded-2xl bg-white border border-[#E9EDEF] space-y-3 shadow-sm ${isRTL ? "text-right" : "text-left"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#111B21] font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-[#008069]" />
              <span>
                {locale === "ar"
                  ? "أمان واسترجاع البطاقة الذكية"
                  : locale === "fr"
                  ? "Sécurité & Récupération du pass"
                  : "Seguridad y Recuperación del pass"}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#008069] border border-[#C8E6C9]">
              {locale === "ar" ? "محمية 100%" : locale === "fr" ? "100% Sécurisé" : "100% Protegido"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#F0F2F5] border border-[#E9EDEF] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#54656F] text-[11px]">
                {locale === "ar"
                  ? "رمز استرجاع البطاقة (PIN):"
                  : locale === "fr"
                  ? "Code PIN de récupération :"
                  : "Código PIN de recuperación:"}
              </span>
              <span className="font-mono font-bold text-[#111B21] tracking-widest text-sm bg-white px-2.5 py-0.5 rounded-lg border border-[#E9EDEF]">
                {currentSecurityPin}
              </span>
            </div>
            <p className="text-[11px] text-[#54656F] leading-snug">
              {currentSecurityPin === customer.memberCode
                ? locale === "ar"
                  ? `💡 رمز الأمان الافتراضي هو كود عضويتك (#${customer.memberCode}). يُستخدم لاسترجاع بطاقتك فوراً في حال تغيير هاتفك أو مسح البطاقة.`
                  : locale === "fr"
                  ? `💡 Votre code PIN par défaut est votre code membre (#${customer.memberCode}). Il sert à récupérer votre pass à tout moment.`
                  : `💡 Tu código PIN por defecto es tu código de socio (#${customer.memberCode}).`
                : locale === "ar"
                ? "🔐 تم تفعيل رمز أمان PIN مخصص لحماية رصيدك وبطاقتك من أي محاولة استرجاع غير مصرح بها."
                : locale === "fr"
                ? "🔐 Votre pass est protégé par un code PIN personnalisé."
                : "🔐 Tu tarjeta está protegida con un código PIN personalizado."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {/* WhatsApp 1-tap personal backup button */}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                locale === "ar"
                  ? `🔐 رابط بطاقة الولاء الخاصة بي في ${merchant.name}:\n${
                      typeof window !== "undefined"
                        ? window.location.href
                        : `https://walink.ma/pass/${customer.passSerial}`
                    }\n\n💡 رمز الاسترجاع (PIN): ${currentSecurityPin}`
                  : `🔐 Lien de mon pass fidélité chez ${merchant.name} :\n${
                      typeof window !== "undefined"
                        ? window.location.href
                        : `https://walink.ma/pass/${customer.passSerial}`
                    }\n\n💡 Code PIN de récupération : ${currentSecurityPin}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#075E54] text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>
                {locale === "ar"
                  ? "📲 حفظ الرابط في واتسابي"
                  : locale === "fr"
                  ? "📲 Sauvegarder sur WhatsApp"
                  : "📲 Guardar en WhatsApp"}
              </span>
            </a>

            {/* Change PIN button */}
            <button
              type="button"
              onClick={() => {
                setOldPinInput("");
                setNewPinInput("");
                setConfirmPinInput("");
                setPinChangeError(null);
                setPinChangeSuccess(null);
                setIsPinChangeModalOpen(true);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-[#008069]/10 hover:bg-[#008069]/20 border border-[#008069]/30 text-[#008069] text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>
                {locale === "ar"
                  ? "تغيير رمز PIN"
                  : locale === "fr"
                  ? "Modifier le code PIN"
                  : "Cambiar código PIN"}
              </span>
            </button>
          </div>
        </div>

        {/* Pass Details & Recent Activity Drawer */}
        <div className={`p-5 rounded-2xl bg-white border border-[#E9EDEF] space-y-4 shadow-sm ${isRTL ? "text-right" : "text-left"}`}>
          <h2 className="text-xs font-bold text-[#111B21] flex items-center justify-between pb-2 border-b border-[#E9EDEF]">
            <span>{t.pass.activityDrawerTitle}</span>
            <span className="text-[10px] font-mono text-[#54656F]">
              {customer.totalVisits} {t.pass.totalVisits}
            </span>
          </h2>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {isCashback ? (
              <>
                <div className="p-3 rounded-xl bg-[#F0F2F5] border border-[#E9EDEF]">
                  <span className="text-[10px] text-[#54656F] block">
                    {t.pass.balanceAvailable}:
                  </span>
                  <span className="font-mono font-bold text-[#008069]">
                    {Number(customer.cashbackBalance || 0).toFixed(2)} {currency}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#F0F2F5] border border-[#E9EDEF]">
                  <span className="text-[10px] text-[#54656F] block">
                    {t.pass.totalEarned}
                  </span>
                  <span className="font-mono font-bold text-[#008069]">
                    {Number(customer.totalCashbackEarned || 0).toFixed(2)} {currency}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="p-3 rounded-xl bg-[#F0F2F5] border border-[#E9EDEF]">
                  <span className="text-[10px] text-[#54656F] block">
                    {t.pass.lastVisitLabel}:
                  </span>
                  <span className="font-semibold text-[#111B21]">
                    {formatTimeAgoArabic(customer.lastVisitAt)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#F0F2F5] border border-[#E9EDEF]">
                  <span className="text-[10px] text-[#54656F] block">المكافآت المستفاد منها:</span>
                  <span className="font-mono font-bold text-amber-600">
                    {customer.rewardsRedeemed} مكافأة
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Transactions List */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-semibold text-[#111B21] block">
              العمليات الأخيرة:
            </span>

            {transactions.length === 0 ? (
              <p className="text-[11px] text-[#54656F]">لا توجد عمليات سابقة</p>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-2.5 rounded-xl bg-[#F0F2F5] border border-[#E9EDEF] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#008069] flex-shrink-0" />
                    <div>
                      <span className="font-medium text-[#111B21] block">
                        {tx.note || tx.type}
                      </span>
                      <span className="text-[10px] text-[#54656F]">
                        {formatTimeAgoArabic(tx.createdAt)}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`font-mono font-bold text-xs ${(tx.cashbackDelta && tx.cashbackDelta > 0) ||
                      tx.stampsDelta > 0
                      ? "text-[#008069]"
                      : "text-amber-600"
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
      <footer className="py-6 text-center text-xs text-[#54656F] space-y-2">
        <Link
          href="/"
          className="hover:text-[#008069] font-medium transition inline-flex items-center gap-1.5"
        >
          <span>منصة والينك (walink.ma)</span>
          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
        </Link>
        <p className="text-[10px] text-[#54656F]">
          البطاقة الرقمية الرسمية لـ {merchant.name}
        </p>
      </footer>

      {/* Add to Wallet Modal & Spec Inspector */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white border border-[#E9EDEF] rounded-3xl shadow-2xl p-6 text-[#111B21] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9EDEF]">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#008069]" />
                <h3 className="font-bold text-base text-[#111B21]">حفظ البطاقة في الهاتف</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWalletModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-[#F0F2F5] text-[#54656F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Smart PWA Install Guide */}
            <div className={`space-y-3 ${isRTL ? "text-right" : "text-left"}`}>
              <div className="p-3.5 rounded-2xl bg-[#F0F2F5] border border-[#E9EDEF] space-y-2">
                <span className="font-bold text-xs text-[#008069] block">
                  🍎 على هواتف iPhone (Safari):
                </span>
                <p className="text-xs text-[#54656F] leading-relaxed">
                  اضغط على زر المشاركة <strong>(Share ⎋)</strong> أسفل الشاشة، ثم اختر{" "}
                  <strong>&quot;إضافة إلى الشاشة الرئيسية&quot; (Add to Home Screen)</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F0F2F5] border border-[#E9EDEF] space-y-2">
                <span className="font-bold text-xs text-[#008069] block">
                  🤖 على هواتف Android (Chrome):
                </span>
                <p className="text-xs text-[#54656F] leading-relaxed">
                  اضغط على القائمة (⋮) أعلى اليمين، ثم اختر <strong>&quot;تثبيت التطبيق&quot; (Install App)</strong> أو إضافة إلى الشاشة.
                </p>
              </div>
            </div>

            {/* Developer PassKit Spec Inspector */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowJsonInspector(!showJsonInspector)}
                className="w-full py-2 px-3 rounded-xl bg-[#F0F2F5] hover:bg-[#E9EDEF] border border-[#D1D7DB] text-[#54656F] text-xs flex items-center justify-between transition"
              >
                <span className="flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-amber-600" />
                  <span>معاينة كود Apple Wallet (pass.json)</span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${showJsonInspector ? "rotate-180" : ""
                    }`}
                />
              </button>

              {showJsonInspector && pkpassJson && (
                <div className="mt-2 p-3 bg-slate-900 rounded-xl border border-slate-800 text-[10px] font-mono text-emerald-400 max-h-48 overflow-y-auto text-left dir-ltr">
                  <pre>{JSON.stringify(pkpassJson, null, 2)}</pre>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsWalletModalOpen(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00A884] to-[#008069] text-white font-bold text-xs shadow-md transition"
            >
              فهمت، شكراً
            </button>
          </div>
        </div>
      )}

      {/* Google Wallet Modal (Diagnostic & Direct Save Link) */}
      {googleWalletModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white border border-[#E9EDEF] rounded-3xl shadow-2xl p-6 text-[#111B21] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9EDEF]">
              <div className="flex items-center gap-2">
                <OfficialGoogleWalletIcon className="w-6 h-5 flex-shrink-0" />
                <h3 className="font-bold text-base text-[#111B21]">Google Wallet (Android)</h3>
              </div>
              <button
                type="button"
                onClick={() => setGoogleWalletModal((prev) => ({ ...prev, isOpen: false }))}
                className="p-1.5 rounded-xl hover:bg-[#F0F2F5] text-[#54656F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {googleWalletModal.configured && googleWalletModal.saveUrl ? (
              <div className={`space-y-3 ${isRTL ? "text-right" : "text-left"}`}>
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Google Wallet متصل ومفعل في الإنتاج بنجاح!</span>
                </div>
                <p className="text-xs text-[#54656F] leading-relaxed">
                  اضغط أدناه لفتح الرابط وإضافة البطاقة مباشرة إلى تطبيق Google Wallet على هاتفك:
                </p>
                <a
                  href={googleWalletModal.saveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-[#111B21] hover:bg-[#202C33] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
                >
                  <OfficialGoogleWalletIcon className="w-5 h-4" />
                  <span>{t.pass.addToGoogleWallet}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <div className={`space-y-3 ${isRTL ? "text-right" : "text-left"}`}>
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Google Wallet جاهز برمجياً ومربوط بـ Walink API</span>
                </div>
                <p className="text-xs text-[#54656F] leading-relaxed">
                  تم توليد معمارية البطاقة (LoyaltyClass &amp; LoyaltyObject) بنجاح مع دعم الأختام والكاش باك والتنبيهات المباشرة.
                </p>

                {/* Developer Payload Inspector */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowGoogleJsonInspector(!showGoogleJsonInspector)}
                    className="w-full py-2 px-3 rounded-xl bg-[#F0F2F5] hover:bg-[#E9EDEF] border border-[#D1D7DB] text-[#54656F] text-xs flex items-center justify-between transition"
                  >
                    <span className="flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-[#008069]" />
                      <span>معاينة حزمة Google Wallet Payload</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${showGoogleJsonInspector ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  {showGoogleJsonInspector && googleWalletModal.previewPayload && (
                    <div className="mt-2 space-y-2">
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[10px] font-mono text-emerald-400 max-h-48 overflow-y-auto text-left dir-ltr">
                        <pre>{JSON.stringify(googleWalletModal.previewPayload, null, 2)}</pre>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (googleWalletModal.previewPayload) {
                            navigator.clipboard.writeText(
                              JSON.stringify(googleWalletModal.previewPayload, null, 2)
                            );
                            setCopiedGooglePayload(true);
                            setTimeout(() => setCopiedGooglePayload(false), 2000);
                          }
                        }}
                        className="w-full py-1.5 px-3 rounded-lg bg-[#E9EDEF] hover:bg-[#D1D7DB] text-xs font-medium text-[#111B21] flex items-center justify-center gap-1.5 transition"
                      >
                        {copiedGooglePayload ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#008069]" />
                            <span>تم نسخ البيانات!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>نسخ كود JSON</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setGoogleWalletModal((prev) => ({ ...prev, isOpen: false }))}
              className="w-full py-2.5 rounded-xl bg-[#F0F2F5] hover:bg-[#E9EDEF] text-[#111B21] font-semibold text-xs transition"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Change PIN Modal */}
      {isPinChangeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            dir={isRTL ? "rtl" : "ltr"}
            className="relative w-full max-w-sm bg-white border border-[#E9EDEF] rounded-3xl shadow-2xl p-6 text-[#111B21] space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E9EDEF]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E8F5E9] text-[#008069] flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#111B21]">
                    {locale === "ar"
                      ? "تغيير رمز أمان البطاقة (PIN)"
                      : locale === "fr"
                      ? "Modifier le code PIN"
                      : "Cambiar código PIN"}
                  </h3>
                  <span className="text-[10px] text-[#54656F] block">
                    {merchant.name} • Walink Security
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPinChangeModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-[#F0F2F5] text-[#54656F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {pinChangeError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {pinChangeError}
              </div>
            )}

            {pinChangeSuccess && (
              <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-green-600" />
                <span>{pinChangeSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSavePin} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111B21] block">
                  {locale === "ar"
                    ? "رمز الأمان الحالي (أو كود العضوية):"
                    : "Code PIN actuel (ou code membre) :"}
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={oldPinInput}
                  onChange={(e) => setOldPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder={`الافتراضي: ${customer.memberCode}`}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F0F2F5] border border-[#D1D7DB] text-[#111B21] placeholder-[#8696A0] focus:bg-white focus:outline-none focus:border-[#008069] text-xs font-mono tracking-widest"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111B21] block">
                  {locale === "ar"
                    ? "رمز الأمان الجديد (4 أرقام):"
                    : "Nouveau code PIN (4 chiffres) :"}
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  required
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#D1D7DB] text-[#111B21] placeholder-[#8696A0] focus:outline-none focus:border-[#008069] text-xs font-mono tracking-widest text-center text-lg font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111B21] block">
                  {locale === "ar"
                    ? "تأكيد الرمز الجديد:"
                    : "Confirmer le nouveau code PIN :"}
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  required
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#D1D7DB] text-[#111B21] placeholder-[#8696A0] focus:outline-none focus:border-[#008069] text-xs font-mono tracking-widest text-center text-lg font-bold"
                />
              </div>

              <p className="text-[10px] text-[#54656F] leading-snug">
                {locale === "ar"
                  ? "احفظ هذا الرمز جيداً. ستطلبه المنصة عند استرجاع بطاقتك على أي هاتف جديد لحماية رصيد مكافآتك."
                  : "Gardez ce code précieusement. Il vous sera demandé pour récupérer votre carte."}
              </p>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPinChangeModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-[#D1D7DB] text-xs font-bold text-[#54656F] hover:bg-[#F0F2F5] transition"
                >
                  {locale === "ar" ? "إلغاء" : "Annuler"}
                </button>
                <button
                  type="submit"
                  disabled={isSavingPin || newPinInput.length !== 4}
                  className="flex-2 py-2.5 px-4 rounded-xl bg-[#008069] hover:bg-[#006D59] text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isSavingPin ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{locale === "ar" ? "حفظ رمز PIN" : "Enregistrer"}</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Android PWA Visual Guide Modal (Fallback when prompt not immediately triggered) */}
      {isAndroidInstallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            dir={isRTL ? "rtl" : "ltr"}
            className="relative w-full max-w-sm bg-white border border-[#E9EDEF] rounded-3xl shadow-2xl p-6 text-[#111B21] space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E9EDEF]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E8F5E9] text-[#008069] flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#111B21]">
                    {locale === "ar"
                      ? "تثبيت البطاقة على الشاشة الرئيسية"
                      : locale === "fr"
                      ? "Installer sur l'écran d'accueil"
                      : "Instalar en la pantalla de inicio"}
                  </h3>
                  <span className="text-[10px] text-[#54656F] block">
                    {merchant.name} (Android)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAndroidInstallModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-[#F0F2F5] text-[#54656F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-[11px] text-[#54656F] leading-relaxed">
                {locale === "ar"
                  ? "لإضافة بطاقتك مباشرة إلى شاشة هاتفك والوصول إليها بنقرة واحدة كأي تطبيق:"
                  : "Pour ajouter votre carte à l'écran d'accueil et y accéder en un clic :"}
              </p>

              {/* Step 1 */}
              <div className="p-3 rounded-2xl bg-[#F0F2F5] border border-[#E9EDEF] flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#008069] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div className="space-y-0.5">
                  <span className="font-bold text-[#111B21] block">
                    {locale === "ar"
                      ? "اضغط على زر القائمة (⋮)"
                      : "Appuyez sur le menu (⋮)"}
                  </span>
                  <span className="text-[11px] text-[#54656F] block">
                    {locale === "ar"
                      ? "في الزاوية العليا لمتصفح Chrome أو Samsung Internet."
                      : "En haut à droite de votre navigateur Chrome."}
                  </span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3 rounded-2xl bg-[#F0F2F5] border border-[#E9EDEF] flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#008069] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div className="space-y-0.5">
                  <span className="font-bold text-[#111B21] block">
                    {locale === "ar"
                      ? 'اختر "إضافة إلى الشاشة الرئيسية" أو "تثبيت التطبيق"'
                      : 'Choisissez "Ajouter à l\'écran d\'accueil" ou "Installer"'}
                  </span>
                  <span className="text-[11px] text-[#54656F] block">
                    {locale === "ar"
                      ? `ستظهر أيقونة ${merchant.name} في شاشتك وتفتح بطاقتك مباشرة!`
                      : `L'icône ${merchant.name} apparaîtra sur votre écran d'accueil !`}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAndroidInstallModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#008069] hover:bg-[#006D59] text-white font-bold text-xs shadow-sm transition cursor-pointer"
            >
              {locale === "ar" ? "حسناً، فهمت" : "Compris"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
