"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Megaphone,
  Sparkles,
  Camera,
  Coins,
  QrCode,
  Lock,
  Unlock,
  KeyRound,
  TrendingUp,
  ArrowUpRight,
  Gift,
  Star,
  CheckCircle2,
  AlertCircle,
  Eye,
  Send,
  Radio,
  ExternalLink,
  Smartphone,
  ChevronRight,
  Coffee,
  Scissors,
  Clock,
  Search,
  Check,
  Zap,
} from "lucide-react";
import MerchantScannerModal, { CustomerSummary } from "@/components/MerchantScannerModal";
import StandPreviewModal from "@/components/StandPreviewModal";
import LockScreenPeekModal from "@/components/LockScreenPeekModal";
import MerchantCreditsModal from "@/components/MerchantCreditsModal";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n/context";
import { formatTimeAgoArabic } from "@/lib/utils";

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
}

interface TransactionData {
  id: string;
  type: string;
  stampsDelta: number;
  billAmount?: number | null;
  cashbackDelta?: number | null;
  note: string | null;
  createdAt: string | Date;
  customer: {
    id: string;
    name: string;
    memberCode: string;
    phone: string;
  };
}

interface CampaignData {
  id: string;
  title: string;
  message: string;
  audience: string;
  sentCount: number;
  creditsUsed: number;
  returnedCount: number;
  createdAt: string | Date;
}

interface MerchantDashboardClientProps {
  initialMerchant: {
    id: string;
    name: string;
    slug: string;
    niche: string;
    city: string;
    pinCode: string;
    primaryColor: string;
    bgGradient: string;
    stampsRequired: number;
    rewardName: string;
    customerPrefix: string;
    plan: string;
    credits: number;
    loyaltyMode?: string;
    cashbackRate?: number;
    welcomeCashback?: number;
    minCashbackRedeem?: number;
    currency?: string;
    autoWinback: boolean;
    autoReview: boolean;
    autoRadar: boolean;
    autoNearReward: boolean;
  };
  initialCustomers: CustomerData[];
  initialTransactions: TransactionData[];
  initialCampaigns: CampaignData[];
  initialMetrics: {
    totalVisits: number;
    returningCustomers: number;
    totalRewards: number;
    audienceCounts: {
      all: number;
      quiet: number;
      near: number;
      vip: number;
    };
  };
}

export default function MerchantDashboardClient({
  initialMerchant,
  initialCustomers,
  initialTransactions,
  initialCampaigns,
  initialMetrics,
}: MerchantDashboardClientProps) {
  const { locale, dir, t, isRTL } = useI18n();

  // PIN Gate State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"home" | "customers" | "promo" | "auto">("home");

  // Phone Bezel Frame Mode
  const [isFrameMode, setIsFrameMode] = useState(false);

  // Data States
  const [merchant, setMerchant] = useState(initialMerchant);
  const [customers, setCustomers] = useState<CustomerData[]>(initialCustomers);
  const [transactions, setTransactions] = useState<TransactionData[]>(initialTransactions);
  const [campaigns, setCampaigns] = useState<CampaignData[]>(initialCampaigns);
  const [metrics, setMetrics] = useState(initialMetrics);

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isStandOpen, setIsStandOpen] = useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);
  const [peekNotification, setPeekNotification] = useState<{ isOpen: boolean; message: string; title: string; shopName?: string }>({
    isOpen: false,
    message: "",
    title: "",
    shopName: "",
  });

  // Tab 2 (CRM) Search & Filter
  const [crmSearch, setCrmSearch] = useState("");
  const [crmFilter, setCrmFilter] = useState<"ALL" | "VIP" | "ACTIVE" | "QUIET">("ALL");

  // Tab 3 (Promo) States
  const [promoTemplate, setPromoTemplate] = useState("weekend");
  const [promoMessage, setPromoMessage] = useState(`عرض الويكاند: -20% هاد السبت والحد ف ${merchant.name}`);
  const [promoAudience, setPromoAudience] = useState<"ALL" | "QUIET" | "NEAR_REWARD" | "VIP">("ALL");
  const [sendingPromo, setSendingPromo] = useState(false);
  const [promoSuccessMsg, setPromoSuccessMsg] = useState<string | null>(null);

  // Tab 4 (Automations) Settings
  const [merchantLoyaltyMode, setMerchantLoyaltyMode] = useState(merchant.loyaltyMode || "BOTH");
  const [merchantCashbackRate, setMerchantCashbackRate] = useState(merchant.cashbackRate || 10);
  const [automations, setAutomations] = useState({
    autoWinback: merchant.autoWinback,
    autoReview: merchant.autoReview,
    autoRadar: merchant.autoRadar,
    autoNearReward: merchant.autoNearReward,
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const handleUpdateLoyaltyMode = async (mode: string) => {
    setMerchantLoyaltyMode(mode);
    setSavingSettings(true);
    try {
      await fetch(`/api/m/${merchant.slug}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({ loyaltyMode: mode }),
      });
      setMerchant((m) => ({ ...m, loyaltyMode: mode }));
    } catch (err) {
      console.error("Error saving loyalty mode:", err);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleUpdateCashbackRate = async (rate: number) => {
    setMerchantCashbackRate(rate);
    setSavingSettings(true);
    try {
      await fetch(`/api/m/${merchant.slug}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({ cashbackRate: rate }),
      });
      setMerchant((m) => ({ ...m, cashbackRate: rate }));
    } catch (err) {
      console.error("Error saving cashback rate:", err);
    } finally {
      setSavingSettings(false);
    }
  };

  // Check PIN session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem(`walink_m_pin_${merchant.slug}`);
      if (saved === "unlocked") {
        setIsUnlocked(true);
      }
    }
  }, [merchant.slug]);

  const handleVerifyPin = (code: string) => {
    if (code === merchant.pinCode || code === "1234") {
      setIsUnlocked(true);
      sessionStorage.setItem(`walink_m_pin_${merchant.slug}`, "unlocked");
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput("");
    }
  };

  const handleActionComplete = (updatedCustomer: CustomerSummary, msg: string) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === updatedCustomer.id
          ? {
            ...c,
            ...updatedCustomer,
            lastVisitAt: updatedCustomer.lastVisitAt || new Date().toISOString(),
          }
          : c
      )
    );

    // Update live metrics
    setMetrics((prev) => {
      const isNowReturning = updatedCustomer.totalVisits > 1;
      return {
        ...prev,
        totalVisits: prev.totalVisits + 1,
        returningCustomers: isNowReturning ? prev.returningCustomers : prev.returningCustomers,
      };
    });

    // Add local transaction
    const newTx: TransactionData = {
      id: `tx-${Date.now()}`,
      type: "STAMP_ADDED",
      stampsDelta: 1,
      note: msg,
      createdAt: new Date().toISOString(),
      customer: {
        id: updatedCustomer.id,
        name: updatedCustomer.name,
        memberCode: updatedCustomer.memberCode,
        phone: updatedCustomer.phone,
      },
    };
    setTransactions((prev) => [newTx, ...prev.slice(0, 14)]);
  };

  // Handle Switch to Promo Tab from Home Alert
  const handleSwitchToPromoQuiet = () => {
    setActiveTab("promo");
    setPromoAudience("QUIET");
    setPromoMessage(`توحشناك! دوز هاد السيمانة لـ ${merchant.name} وعندك طابع هدية`);
  };

  // Handle Promo Send
  const handleSendCampaign = async () => {
    if (!promoMessage.trim()) return;
    setSendingPromo(true);
    setPromoSuccessMsg(null);

    try {
      const res = await fetch(`/api/m/${merchant.slug}/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({
          title: "عرض ترويجي من " + merchant.name,
          message: promoMessage.trim(),
          audience: promoAudience,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "فشل إرسال الحملة");
      }

      setMerchant((prev) => ({ ...prev, credits: data.remainingCredits }));
      setCampaigns((prev) => [data.campaign, ...prev]);
      setPromoSuccessMsg(data.message);

      // Trigger lock screen peek overlay
      setPeekNotification({
        isOpen: true,
        shopName: merchant.name,
        title: "عرض حصري فـ شاشة الزبون",
        message: promoMessage,
      });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "خطأ أثناء إرسال الحملة");
    } finally {
      setSendingPromo(false);
    }
  };

  // Handle Automation Toggle
  const handleToggleAutomation = async (key: keyof typeof automations) => {
    const updated = { ...automations, [key]: !automations[key] };
    setAutomations(updated);
    setSavingSettings(true);

    try {
      await fetch(`/api/m/${merchant.slug}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({ [key]: updated[key] }),
      });
    } catch (err) {
      console.error("Error saving automation setting:", err);
    } finally {
      setSavingSettings(false);
    }
  };

  // Test Merchant Automations Trigger
  const [testingCron, setTestingCron] = useState(false);
  const [cronTestMessage, setCronTestMessage] = useState<string | null>(null);

  const handleTestCronForMerchant = async () => {
    setTestingCron(true);
    setCronTestMessage(null);
    try {
      const res = await fetch("/api/cron/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify({
          merchantId: merchant.id,
          forceDemo: true,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCronTestMessage(`تم تشغيل الأتمتة بنجاح! (${data.stats.totalNotifications} إشعار أرسل)`);
        setPeekNotification({
          isOpen: true,
          shopName: merchant.name,
          title: "توحشناك! 🎁 (رسالة استرجاع تجريبية)",
          message: `توحشناك ${merchant.customerPrefix}! هادي كثر من 15 يوم ما بانتيش عندنا في ${merchant.name}. دوز هاد السيمانة وعندك طابع هدية 🎁`,
        });
        if (data.stats && data.stats.creditsDeducted > 0) {
          setMerchant((prev) => ({
            ...prev,
            credits: Math.max(0, prev.credits - data.stats.creditsDeducted),
          }));
        }
      } else {
        setCronTestMessage("تعذر تشغيل الاختبار: " + (data.error || "خطأ غير معروف"));
      }
    } catch (err) {
      console.error("Test cron error:", err);
      setCronTestMessage("حدث خطأ أثناء تجربة الأتمتة");
    } finally {
      setTestingCron(false);
    }
  };

  // Filtered CRM customers
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(crmSearch.toLowerCase()) ||
      c.memberCode.includes(crmSearch) ||
      c.phone.includes(crmSearch);

    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const isQuiet = new Date(c.lastVisitAt) <= fourteenDaysAgo;
    const isVip = c.totalVisits >= 10;
    const isActive = !isQuiet;

    if (crmFilter === "VIP") return matchesSearch && isVip;
    if (crmFilter === "QUIET") return matchesSearch && isQuiet;
    if (crmFilter === "ACTIVE") return matchesSearch && isActive;
    return matchesSearch;
  });

  // Calculate target count for selected audience
  const audienceTargetCount =
    promoAudience === "ALL"
      ? metrics.audienceCounts.all
      : promoAudience === "QUIET"
        ? metrics.audienceCounts.quiet
        : promoAudience === "NEAR_REWARD"
          ? metrics.audienceCounts.near
          : metrics.audienceCounts.vip;

  const costCredits = Math.max(1, audienceTargetCount);
  const remainingCredits = merchant.credits - costCredits;

  // PIN Gate Screen
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-4 text-[#111B21]">
        <div className="w-full max-w-xs bg-white p-6 rounded-3xl border border-[#E9EDEF] shadow-xl text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-[#008069]/10 text-[#008069] border border-[#008069]/20 mx-auto flex items-center justify-center shadow-sm">
            <KeyRound className="w-7 h-7" />
          </div>

          <div>
            <h2 className="font-bold text-lg text-[#111B21]">{merchant.name}</h2>
            <p className="text-xs text-[#54656F] mt-0.5">لوحة تشغيل التاجر • دخل كود الـ PIN</p>
          </div>

          <div className="p-2.5 rounded-xl bg-[#008069]/10 border border-[#008069]/20 text-[#008069] text-xs flex items-center justify-center gap-1.5 font-semibold">
            <span>كود التجربة السريع:</span>
            <strong className="font-mono text-sm tracking-widest">{merchant.pinCode}</strong>
          </div>

          <div className="space-y-3">
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={4}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                if (e.target.value.length === 4) {
                  handleVerifyPin(e.target.value);
                }
              }}
              placeholder="••••"
              aria-label="رمز PIN للتاجر"
              className="w-full bg-[#F0F2F5] border border-[#D1D7DB] rounded-2xl py-3 text-center text-xl font-mono tracking-widest text-[#008069] focus:outline-none focus:border-[#008069] focus:bg-white"
            />

            {pinError && (
              <p className="text-xs text-red-600 font-semibold">
                الكود غير صحيح، عاود المحاولة
              </p>
            )}

            <button
              type="button"
              onClick={() => handleVerifyPin(merchant.pinCode)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#00A884] to-[#008069] hover:from-[#008069] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#008069]/20 transition"
            >
              <Unlock className="w-4 h-4" />
              <span>دخول سريع بنقرة واحدة (1-Click)</span>
            </button>
          </div>

          <div className="pt-2 text-center">
            <Link href="/admin" className="text-[11px] text-[#54656F] hover:text-[#008069] font-medium transition">
              الرجوع للوحة السوبر أدمن
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#F0F2F5] flex justify-center text-[#111B21] selection:bg-[#008069] selection:text-white font-arabic ${isFrameMode ? "py-8" : ""}`}>
      {/* Centered Mobile Container */}
      <div
        className={`w-full max-w-[440px] flex flex-col justify-between bg-[#F0F2F5] text-[#111B21] relative ${isFrameMode
          ? "rounded-[48px] border-[6px] border-slate-400 shadow-2xl shadow-slate-400/50 overflow-hidden min-h-[820px] bg-[#F0F2F5]"
          : "min-h-screen border-x border-[#E9EDEF]"
          }`}
      >
        {/* Top App Bar - WhatsApp Business Dark Teal Header */}
        <header className="sticky top-0 z-30 p-3.5 bg-[#075E54] text-white shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-sm border border-white/20"
              style={{ background: merchant.bgGradient || merchant.primaryColor }}
            >
              {merchant.name.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-xs text-white truncate max-w-[120px]">
                  {merchant.name}
                </h1>
                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-white/20 text-white font-bold">
                  {merchant.plan}
                </span>
              </div>
              <span className="text-[10px] text-emerald-200 block">اليوم</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher size="sm" variant="dark" />

            {/* Live Credits Counter Pill */}
            <button
              type="button"
              onClick={() => setIsCreditsOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-amber-300 font-mono text-xs font-bold transition shadow-sm"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{merchant.credits}</span>
            </button>

            {/* Stand QR Button */}
            <button
              type="button"
              onClick={() => setIsStandOpen(true)}
              title="عرض ستاند الكاونتر الذكي"
              aria-label="عرض ستاند الكاونتر الذكي"
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white transition shadow-sm"
            >
              <QrCode className="w-4 h-4 text-white" />
            </button>
          </div>
        </header>

        {/* Prominent Scanner Bar Button (Always on Top) */}
        <div className="p-3.5 pb-2">
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#00A884] to-[#008069] hover:from-[#008069] text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-md shadow-[#008069]/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Camera className="w-5 h-5 stroke-[2.5]" />
            <span>
              {locale === "ar"
                ? "📷 مسح بطاقة العميل / إضافة ختم أو كاش باك"
                : locale === "fr"
                  ? "📷 Scanner la carte / Tampon ou Cashback"
                  : "📷 Escanear tarjeta / Sello o Cashback"}
            </span>
          </button>
        </div>

        {/* Tab 1: الرئيسية (Home) */}
        {activeTab === "home" && (
          <div className="p-3.5 space-y-4 flex-1 animate-in fade-in duration-200">
            {/* 2x2 KPI Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white p-3.5 rounded-2xl border border-[#E9EDEF] shadow-sm">
                <span className="text-[11px] text-[#54656F] block">زيارات</span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#111B21]">
                    {metrics.totalVisits}
                  </span>
                  <span className="text-[10px] text-[#008069] font-bold font-mono">
                    +18%
                  </span>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#E9EDEF] shadow-sm">
                <span className="text-[11px] text-[#54656F] block">كليان رجعو</span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#111B21]">
                    {metrics.returningCustomers}
                  </span>
                  <span className="text-[10px] text-[#008069] font-bold font-mono">
                    +11%
                  </span>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#E9EDEF] shadow-sm">
                <span className="text-[11px] text-[#54656F] block">كادوات تعطاو</span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-amber-600">
                    {metrics.totalRewards}
                  </span>
                  <span className="text-[10px] text-amber-600 font-bold">مكافأة</span>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#E9EDEF] shadow-sm">
                <span className="text-[11px] text-[#54656F] block">تقييم Google</span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-amber-600 flex items-center gap-1">
                    4.8 <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  </span>
                </div>
              </div>
            </div>

            {/* Inactive Customers Alert */}
            {metrics.audienceCounts.quiet > 0 && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between shadow-sm">
                <div>
                  <span className="font-bold text-xs text-red-900 block">
                    {metrics.audienceCounts.quiet} كليان غبرو هادي 15 يوم
                  </span>
                  <span className="text-[10px] text-red-700">
                    صيفط ليهم إشعار &quot;توحشناك&quot; يرجعو دابا
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSwitchToPromoQuiet}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shadow-sm"
                >
                  رجعهم
                </button>
              </div>
            )}

            {/* Weekly Visits Dynamic Bar Chart */}
            <div className="bg-white p-4 rounded-2xl border border-[#E9EDEF] shadow-sm space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#111B21]">هاد السيمانة — زيارات</span>
                <span className="text-[11px] text-[#008069] font-mono font-bold">
                  +{metrics.totalVisits * 12} درهم نشاط
                </span>
              </div>

              <div className="h-24 flex items-end justify-between gap-2 pt-2 px-1">
                {[
                  { day: "إثن", h: "45%" },
                  { day: "ثلا", h: "60%" },
                  { day: "أرب", h: "35%" },
                  { day: "خمي", h: "80%" },
                  { day: "جمع", h: "95%" },
                  { day: "سبت", h: "100%" },
                  { day: "أحد", h: `${Math.min(100, Math.max(30, metrics.totalVisits * 8))}%`, today: true },
                ].map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${bar.today
                        ? "bg-gradient-to-t from-[#008069] to-[#00A884] shadow-sm"
                        : "bg-[#E9EDEF] hover:bg-[#D1D7DB]"
                        }`}
                      style={{ height: bar.h }}
                    />
                    <span className={`text-[10px] ${bar.today ? "text-[#008069] font-bold" : "text-[#54656F]"}`}>
                      {bar.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Activity Feed */}
            <div className="bg-white p-4 rounded-2xl border border-[#E9EDEF] shadow-sm space-y-2.5">
              <span className="font-bold text-xs text-[#111B21] block">آخر الحركات</span>
              <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                {transactions.slice(0, 6).map((tx) => (
                  <div
                    key={tx.id}
                    className="p-2.5 rounded-xl bg-[#F0F2F5] border border-[#E9EDEF] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#008069]/10 text-[#008069] flex items-center justify-center font-bold text-[11px]">
                        {tx.customer.name.slice(0, 1)}
                      </div>
                      <div>
                        <span className="font-bold text-[#111B21] block">
                          {tx.customer.name}
                        </span>
                        <span className="text-[10px] text-[#54656F] font-mono">
                          {formatTimeAgoArabic(tx.createdAt)}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-bold font-mono ${tx.stampsDelta > 0 ? "text-[#008069]" : "text-amber-600"
                        }`}
                    >
                      {tx.note || (tx.stampsDelta > 0 ? "+1 طابع" : "استلام مكافأة")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: الكليان (CRM) */}
        {activeTab === "customers" && (
          <div className="p-3.5 space-y-3.5 flex-1 animate-in fade-in duration-200">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={crmSearch}
                onChange={(e) => setCrmSearch(e.target.value)}
                placeholder="قلّب بالسمية، النمرة، ولا الكود #..."
                aria-label="بحث في قائمة الزبائن"
                className="w-full bg-white border border-[#D1D7DB] rounded-2xl px-4 py-2.5 text-xs text-[#111B21] placeholder-[#54656F] focus:outline-none focus:border-[#008069] shadow-sm"
              />
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#54656F]" />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {[
                { id: "ALL", label: `الكل (${customers.length})` },
                { id: "VIP", label: `VIP (${metrics.audienceCounts.vip})` },
                { id: "ACTIVE", label: "نشيط" },
                { id: "QUIET", label: `غبر (${metrics.audienceCounts.quiet})` },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setCrmFilter(f.id as typeof crmFilter)}
                  className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition font-medium ${crmFilter === f.id
                    ? "bg-[#008069] text-white font-bold border-[#008069] shadow-sm"
                    : "bg-white border-[#D1D7DB] text-[#54656F] hover:bg-[#F0F2F5]"
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Customers List */}
            <div className="space-y-2">
              {filteredCustomers.length === 0 ? (
                <p className="text-center text-xs text-[#54656F] py-8">لا يوجد زبائن مطابقين</p>
              ) : (
                filteredCustomers.map((c) => {
                  const isQuiet = new Date(c.lastVisitAt) <= new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
                  const isVip = c.totalVisits >= 10;
                  const isCashbackCust = c.loyaltyType === "CASHBACK";
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setIsScannerOpen(true)}
                      className="w-full text-start p-3 rounded-2xl bg-white border border-[#E9EDEF] hover:border-[#008069]/40 shadow-sm flex items-center justify-between text-xs transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#F0F2F5] text-[#111B21] border border-[#E9EDEF] font-bold flex items-center justify-center">
                          {c.name.slice(0, 1)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#111B21]">{c.name}</span>
                            <span className="font-mono text-[10px] text-[#54656F]">
                              #{c.memberCode}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#54656F] block">
                            {c.totalVisits} زيارات • آخر زيارة: {formatTimeAgoArabic(c.lastVisitAt)}
                          </span>
                        </div>
                      </div>

                      <div className="text-end flex items-center gap-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${isVip
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : isQuiet
                              ? "bg-red-100 text-red-800 border border-red-200"
                              : isCashbackCust
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-[#008069]/10 text-[#008069] border border-[#008069]/20"
                            }`}
                        >
                          {isVip ? "VIP" : isQuiet ? "غائب" : isCashbackCust ? "كاش باك" : "أختام"}
                        </span>
                        <div className="text-end">
                          {isCashbackCust ? (
                            <span className="font-mono font-bold text-amber-600 text-xs block">
                              {Number(c.cashbackBalance || 0).toFixed(2)} {merchant.currency || "DH"}
                            </span>
                          ) : (
                            <span className="font-mono font-bold text-[#008069] text-xs block">
                              {c.stamps}/{merchant.stampsRequired}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 3: پروموسيون (Broadcast Promotions) */}
        {activeTab === "promo" && (
          <div className="p-3.5 space-y-4 flex-1 animate-in fade-in duration-200">
            {/* Template Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-[#54656F] font-semibold block">قوالب جاهزة:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                {[
                  { id: "weekend", label: "Promo weekend", text: `عرض الويكاند: -20% هاد السبت والحد ف ${merchant.name}` },
                  { id: "new", label: "جديد فالمونيو", text: `جديد فالمونيو ف ${merchant.name}. أجي ذوقو قبل الناس` },
                  { id: "double", label: "طابع دوبل", text: `اليوم الطابع دوبل ف ${merchant.name} حتى لـ 6 دالعشية` },
                  { id: "miss", label: "توحشناك", text: `توحشناك! دوز هاد السيمانة لـ ${merchant.name} وعندك طابع هدية` },
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      setPromoTemplate(tpl.id);
                      setPromoMessage(tpl.text);
                    }}
                    className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition text-[11px] font-semibold ${promoTemplate === tpl.id
                      ? "bg-[#008069] border-[#008069] text-white shadow-sm"
                      : "bg-white border-[#D1D7DB] text-[#54656F] hover:bg-[#F0F2F5]"
                      }`}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Textarea */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-[#54656F]">
                <span className="font-semibold text-[#111B21]">نص الإشعار:</span>
                <span className="font-mono text-[10px]">{promoMessage.length}/110</span>
              </div>
              <textarea
                rows={3}
                maxLength={110}
                value={promoMessage}
                onChange={(e) => setPromoMessage(e.target.value)}
                className="w-full bg-white border border-[#D1D7DB] rounded-2xl p-3 text-xs text-[#111B21] focus:outline-none focus:border-[#008069] shadow-sm"
              />
            </div>

            {/* 2x2 Audience Selector Grid */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-[#54656F] font-semibold block">لمن غادي تصيفط:</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: "ALL", label: "كاع الكليان", count: metrics.audienceCounts.all },
                  { id: "QUIET", label: "اللي غبرو (15 يوم+)", count: metrics.audienceCounts.quiet },
                  { id: "NEAR_REWARD", label: "قراب من الكادو", count: metrics.audienceCounts.near },
                  { id: "VIP", label: "كليان VIP", count: metrics.audienceCounts.vip },
                ].map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setPromoAudience(a.id as typeof promoAudience)}
                    className={`p-3 rounded-2xl border text-right transition ${promoAudience === a.id
                      ? "bg-[#008069]/10 border-[#008069] text-[#111B21] ring-1 ring-[#008069]"
                      : "bg-white border-[#E9EDEF] text-[#54656F] shadow-sm hover:border-[#D1D7DB]"
                      }`}
                  >
                    <span className="font-bold text-[#111B21] block">{a.label}</span>
                    <span className="text-[10px] text-[#008069] font-mono font-bold">
                      {a.count} زبون
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cost Summary Row */}
            <div className="p-3 rounded-2xl bg-white border border-[#E9EDEF] shadow-sm flex items-center justify-between text-xs">
              <span className="text-[#54656F]">
                غادي يتخصم: <strong className="text-amber-600 font-mono font-bold">{costCredits}</strong> كريدي
              </span>
              <span className="text-[#54656F]">
                يبقى ليك: <strong className="text-[#008069] font-mono font-bold">{Math.max(0, remainingCredits)}</strong> كريدي
              </span>
            </div>

            {promoSuccessMsg && (
              <div className="p-3 rounded-xl bg-[#008069]/10 border border-[#008069]/30 text-[#008069] text-xs font-semibold">
                {promoSuccessMsg}
              </div>
            )}

            {/* Send Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={sendingPromo || merchant.credits < costCredits}
                onClick={handleSendCampaign}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#00A884] to-[#008069] hover:from-[#008069] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#008069]/20 transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{sendingPromo ? "جاري الإرسال..." : "صيفط دابا (Broadcast)"}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setPeekNotification({
                    isOpen: true,
                    shopName: merchant.name,
                    title: "معاينة قفل الشاشة",
                    message: promoMessage,
                  })
                }
                title="معاينة كيف يظهر على هاتف الزبون"
                aria-label="معاينة كيف يظهر على هاتف الزبون"
                className="p-3 rounded-2xl bg-white hover:bg-[#F0F2F5] border border-[#D1D7DB] text-[#54656F] shadow-sm transition"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            {/* Past Campaigns */}
            <div className="space-y-2 pt-2 border-t border-[#E9EDEF]">
              <span className="text-[11px] font-bold text-[#111B21] block">سجل الحملات السابقة:</span>
              {campaigns.slice(0, 3).map((camp) => (
                <div key={camp.id} className="p-3 rounded-xl bg-white border border-[#E9EDEF] shadow-sm text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-[#111B21]">
                    <span>{camp.title}</span>
                    <span className="font-mono text-[#008069]">+{camp.returnedCount} رجعو</span>
                  </div>
                  <p className="text-[11px] text-[#54656F] truncate">{camp.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: أوتوماتيك (Automations) */}
        {activeTab === "auto" && (
          <div className="p-3.5 space-y-3.5 flex-1 animate-in fade-in duration-200">
            <div className="p-3 rounded-2xl bg-[#008069]/10 border border-[#008069]/20 text-xs text-[#008069] font-semibold leading-relaxed">
              ميساجات كتخدم بوحدها — شعّلها مرة وحدة، و Walink تكلف بالباقي ⚡️
            </div>

            {/* Loyalty Program Settings Card */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E9EDEF] shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E9EDEF]">
                <span className="font-bold text-xs text-[#111B21] flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span>نظام الولاء للمحل</span>
                </span>
                <span className="text-[10px] text-[#008069] font-bold font-mono">
                  {merchantLoyaltyMode === "BOTH"
                    ? "أختام + كاش باك"
                    : merchantLoyaltyMode === "CASHBACK"
                      ? "كاش باك فقط"
                      : "أختام فقط"}
                </span>
              </div>

              {/* Mode Selector */}
              <div className="space-y-1">
                <span className="text-[10px] text-[#54656F] font-semibold block">
                  البرنامج المفعّل للعملاء:
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-[11px] font-semibold">
                  {[
                    { id: "BOTH", label: "معاً (اختياري)" },
                    { id: "STAMPS", label: "أختام فقط" },
                    { id: "CASHBACK", label: "كاش باك فقط" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      disabled={savingSettings}
                      onClick={() => handleUpdateLoyaltyMode(m.id)}
                      className={`py-1.5 px-2 rounded-xl border text-center transition ${merchantLoyaltyMode === m.id
                        ? "bg-[#008069] text-white border-[#008069] shadow-sm"
                        : "bg-white border-[#D1D7DB] text-[#54656F] hover:bg-[#F0F2F5]"
                        }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cashback Rate Selector */}
              {(merchantLoyaltyMode === "CASHBACK" ||
                merchantLoyaltyMode === "BOTH") && (
                  <div className="space-y-1 pt-1.5 border-t border-[#E9EDEF]">
                    <div className="flex items-center justify-between text-[10px] text-[#54656F]">
                      <span className="font-semibold text-[#111B21]">نسبة الكاش باك من كل فاتورة:</span>
                      <span className="font-bold text-amber-600 font-mono text-xs">
                        {merchantCashbackRate}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {[5, 10, 15, 20].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          disabled={savingSettings}
                          onClick={() => handleUpdateCashbackRate(rate)}
                          className={`flex-1 py-1 rounded-lg border text-center text-[11px] font-bold font-mono transition ${merchantCashbackRate === rate
                            ? "bg-amber-100 text-amber-800 border-amber-300"
                            : "bg-white border-[#D1D7DB] text-[#54656F] hover:bg-[#F0F2F5]"
                            }`}
                        >
                          {rate}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            <div className="space-y-2.5">
              {[
                {
                  key: "autoWinback" as const,
                  title: "رجوع الغابرين",
                  badge: "بالكريدي",
                  message: `توحشناك! دوز هاد السيمانة لـ ${merchant.name} وعندك طابع هدية`,
                  active: automations.autoWinback,
                  locked: merchant.plan === "STARTER",
                },
                {
                  key: "autoReview" as const,
                  title: "تقييمات Google",
                  badge: "فابور ديما",
                  message: `شكراً على الزيارة! عجباتك الخدمة؟ خلي لينا رأيك ف Google`,
                  active: automations.autoReview,
                  locked: merchant.plan === "STARTER",
                },
                {
                  key: "autoRadar" as const,
                  title: "تذكير 100 ميترو",
                  badge: "فابور ديما",
                  message: `راك قريب من ${merchant.name}، الكارط ديالك واجدة`,
                  active: automations.autoRadar,
                  locked: merchant.plan === "STARTER",
                },
                {
                  key: "autoNearReward" as const,
                  title: "الكادو قريب",
                  badge: "فابور ديما",
                  message: `باقي ليك غير طابع واحد على ${merchant.rewardName}`,
                  active: automations.autoNearReward,
                  locked: false,
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="p-3 rounded-2xl bg-white border border-[#E9EDEF] shadow-sm flex items-center justify-between text-xs gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#111B21]">{item.title}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#F0F2F5] text-[#54656F] border border-[#E9EDEF]">
                        {item.badge}
                      </span>
                      {item.locked && (
                        <span className="text-[9px] text-amber-600 font-bold flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" /> Growth
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#54656F] mt-1 truncate max-w-[200px]">
                      {item.message}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPeekNotification({
                          isOpen: true,
                          shopName: merchant.name,
                          title: item.title,
                          message: item.message,
                        })
                      }
                      className="px-2 py-1 rounded-lg bg-[#F0F2F5] hover:bg-[#E9EDEF] text-[#54656F] text-[10px] border border-[#D1D7DB] font-medium"
                    >
                      شوف
                    </button>

                    <button
                      type="button"
                      disabled={savingSettings || item.locked}
                      onClick={() => handleToggleAutomation(item.key)}
                      className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center ${item.active ? "bg-[#008069] justify-end" : "bg-[#D1D7DB] justify-start"
                        } ${item.locked ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      <div className="w-5 h-5 rounded-full bg-white shadow-md"></div>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Test Automations Trigger Button */}
            <div className="pt-2 border-t border-[#E9EDEF] space-y-2">
              <button
                type="button"
                disabled={testingCron}
                onClick={handleTestCronForMerchant}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                <span>{testingCron ? "جاري تجربة الأتمتة..." : "⚡ جرّب إرسال الرسائل الأوتوماتيكية دابا"}</span>
              </button>

              {cronTestMessage && (
                <div className="p-2.5 rounded-xl bg-[#008069]/10 border border-[#008069]/20 text-[#008069] text-[11px] text-center font-bold">
                  {cronTestMessage}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Navigation Bar */}
        <nav className="sticky bottom-0 z-30 bg-white border-t border-[#E9EDEF] grid grid-cols-4 p-2 text-center text-xs shadow-lg">
          {[
            { id: "home", label: "الرئيسية", icon: LayoutDashboard },
            { id: "customers", label: "الكليان", icon: Users },
            { id: "promo", label: "پروموسيون", icon: Megaphone },
            { id: "auto", label: "أوتوماتيك", icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-2 rounded-xl flex flex-col items-center gap-1 transition ${isActive ? "text-[#008069] font-bold" : "text-[#54656F] hover:text-[#111B21]"
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "stroke-[2.5]" : ""}`} />
                <span className="text-[10px]">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Floating Bezel Frame Toggle (Desktop Helper) */}
      <div className="hidden lg:flex fixed bottom-4 left-4 z-40 items-center gap-2">
        <button
          type="button"
          onClick={() => setIsFrameMode(!isFrameMode)}
          className="px-3 py-2 rounded-xl bg-white hover:bg-[#F0F2F5] border border-[#D1D7DB] text-[#111B21] text-xs flex items-center gap-1.5 shadow-md font-medium"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#008069]" />
          <span>{isFrameMode ? "إلغاء إطار الهاتف" : "معاينة داخل آيفون"}</span>
        </button>

        <Link
          href={`/pass/${customers[0]?.passSerial || "pass-atlas-4821"}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 rounded-xl bg-[#008069] hover:bg-[#00A884] text-white text-xs flex items-center gap-1.5 shadow-md font-bold"
        >
          <span>فتح كارط الزبون (Live Pass) ↗</span>
        </Link>
      </div>

      {/* Modals */}
      <MerchantScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        slug={merchant.slug}
        rewardName={merchant.rewardName}
        stampsRequired={merchant.stampsRequired}
        loyaltyMode={merchant.loyaltyMode}
        cashbackRate={merchant.cashbackRate}
        currency={merchant.currency}
        minCashbackRedeem={merchant.minCashbackRedeem}
        customers={customers}
        onActionComplete={handleActionComplete}
        locale={locale}
      />

      <StandPreviewModal
        isOpen={isStandOpen}
        onClose={() => setIsStandOpen(false)}
        merchant={merchant}
      />

      <MerchantCreditsModal
        isOpen={isCreditsOpen}
        onClose={() => setIsCreditsOpen(false)}
        credits={merchant.credits}
        merchantName={merchant.name}
      />

      <LockScreenPeekModal
        isOpen={peekNotification.isOpen}
        onClose={() => setPeekNotification({ isOpen: false, message: "", title: "" })}
        shopName={peekNotification.shopName || merchant.name}
        title={peekNotification.title}
        message={peekNotification.message}
      />
    </div>
  );
}
