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
import { formatTimeAgoArabic } from "@/lib/utils";

interface CustomerData {
  id: string;
  name: string;
  phone: string;
  memberCode: string;
  passSerial: string;
  stamps: number;
  totalVisits: number;
  rewardsRedeemed: number;
  lastVisitAt: string | Date;
}

interface TransactionData {
  id: string;
  type: string;
  stampsDelta: number;
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
    autoWinback: boolean;
    autoBirthday: boolean;
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
  const [automations, setAutomations] = useState({
    autoWinback: merchant.autoWinback,
    autoBirthday: merchant.autoBirthday,
    autoReview: merchant.autoReview,
    autoRadar: merchant.autoRadar,
    autoNearReward: merchant.autoNearReward,
  });
  const [savingSettings, setSavingSettings] = useState(false);

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
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-4 text-white">
        <div className="w-full max-w-xs glass-panel p-6 rounded-3xl border border-white/10 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mx-auto flex items-center justify-center">
            <KeyRound className="w-7 h-7" />
          </div>

          <div>
            <h2 className="font-bold text-lg text-white">{merchant.name}</h2>
            <p className="text-xs text-white/50 mt-0.5">لوحة تشغيل التاجر • دخل كود الـ PIN</p>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center gap-1.5">
            <span>كود التجربة السريع:</span>
            <strong className="font-mono text-sm tracking-widest">{merchant.pinCode}</strong>
          </div>

          <div className="space-y-3">
            <input
              type="password"
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
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 text-center text-xl font-mono tracking-widest text-emerald-400 focus:outline-none focus:border-emerald-500"
            />

            {pinError && (
              <p className="text-xs text-red-400 font-semibold">
                الكود غير صحيح، عاود المحاولة
              </p>
            )}

            <button
              type="button"
              onClick={() => handleVerifyPin(merchant.pinCode)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition"
            >
              <Unlock className="w-4 h-4" />
              <span>دخول سريع بنقرة واحدة (1-Click)</span>
            </button>
          </div>

          <div className="pt-2 text-center">
            <Link href="/admin" className="text-[11px] text-white/40 hover:text-white transition">
              الرجوع للوحة السوبر أدمن
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#0B0F17] flex justify-center text-white selection:bg-emerald-500 selection:text-black font-arabic ${isFrameMode ? "py-8" : ""}`}>
      {/* Centered Mobile Container */}
      <div
        className={`w-full max-w-[440px] flex flex-col justify-between bg-[#0B0F17] text-white relative ${
          isFrameMode
            ? "rounded-[48px] border-[6px] border-slate-700 shadow-2xl shadow-black overflow-hidden min-h-[820px]"
            : "min-h-screen border-x border-white/5"
        }`}
      >
        {/* Top App Bar */}
        <header className="sticky top-0 z-30 p-3.5 bg-[#0B0F17]/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow"
              style={{ background: merchant.bgGradient || merchant.primaryColor }}
            >
              {merchant.name.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-xs text-white truncate max-w-[120px]">
                  {merchant.name}
                </h1>
                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  {merchant.plan}
                </span>
              </div>
              <span className="text-[10px] text-white/40 block">اليوم</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Credits Counter Pill */}
            <button
              type="button"
              onClick={() => setIsCreditsOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold transition"
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
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </header>

        {/* Prominent Scanner Bar Button (Always on Top) */}
        <div className="p-3.5 pb-2">
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Camera className="w-5 h-5 stroke-[2.5]" />
            <span>📷 سكاني كارط الكليان / زيد طابع</span>
          </button>
        </div>

        {/* Tab 1: الرئيسية (Home) */}
        {activeTab === "home" && (
          <div className="p-3.5 space-y-4 flex-1 animate-in fade-in duration-200">
            {/* 2x2 KPI Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="glass-panel p-3.5 rounded-2xl border border-white/10">
                <span className="text-[11px] text-white/50 block">زيارات</span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-white">
                    {metrics.totalVisits}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold font-mono">
                    +18%
                  </span>
                </div>
              </div>

              <div className="glass-panel p-3.5 rounded-2xl border border-white/10">
                <span className="text-[11px] text-white/50 block">كليان رجعو</span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-white">
                    {metrics.returningCustomers}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold font-mono">
                    +11%
                  </span>
                </div>
              </div>

              <div className="glass-panel p-3.5 rounded-2xl border border-white/10">
                <span className="text-[11px] text-white/50 block">كادوات تعطاو</span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-amber-300">
                    {metrics.totalRewards}
                  </span>
                  <span className="text-[10px] text-amber-400">مكافأة</span>
                </div>
              </div>

              <div className="glass-panel p-3.5 rounded-2xl border border-white/10">
                <span className="text-[11px] text-white/50 block">تقييم Google</span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-amber-400 flex items-center gap-1">
                    4.8 <Star className="w-4 h-4 fill-amber-400" />
                  </span>
                </div>
              </div>
            </div>

            {/* Inactive Customers Alert */}
            {metrics.audienceCounts.quiet > 0 && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-500/20 to-red-600/10 border border-red-500/30 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-red-300 block">
                    {metrics.audienceCounts.quiet} كليان غبرو هادي 15 يوم
                  </span>
                  <span className="text-[10px] text-white/60">
                    صيفط ليهم إشعار &quot;توحشناك&quot; يرجعو دابا
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSwitchToPromoQuiet}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow"
                >
                  رجعهم
                </button>
              </div>
            )}

            {/* Weekly Visits Dynamic Bar Chart */}
            <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">هاد السيمانة — زيارات</span>
                <span className="text-[11px] text-emerald-400 font-mono">
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
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        bar.today
                          ? "bg-gradient-to-t from-emerald-500 to-emerald-400 shadow-lg shadow-emerald-500/30"
                          : "bg-white/10 hover:bg-white/20"
                      }`}
                      style={{ height: bar.h }}
                    />
                    <span className={`text-[10px] ${bar.today ? "text-emerald-400 font-bold" : "text-white/40"}`}>
                      {bar.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Activity Feed */}
            <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-2.5">
              <span className="font-bold text-xs text-white block">آخر الحركات</span>
              <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                {transactions.slice(0, 6).map((tx) => (
                  <div
                    key={tx.id}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px]">
                        {tx.customer.name.slice(0, 1)}
                      </div>
                      <div>
                        <span className="font-bold text-white block">
                          {tx.customer.name}
                        </span>
                        <span className="text-[10px] text-white/40 font-mono">
                          {formatTimeAgoArabic(tx.createdAt)}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-bold font-mono ${
                        tx.stampsDelta > 0 ? "text-emerald-400" : "text-amber-400"
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
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-emerald-500"
              />
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-white/40" />
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
                  className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition font-medium ${
                    crmFilter === f.id
                      ? "bg-emerald-500 text-slate-950 font-bold border-emerald-400"
                      : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Customers List */}
            <div className="space-y-2">
              {filteredCustomers.length === 0 ? (
                <p className="text-center text-xs text-white/40 py-8">لا يوجد زبائن مطابقين</p>
              ) : (
                filteredCustomers.map((c) => {
                  const isQuiet = new Date(c.lastVisitAt) <= new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
                  const isVip = c.totalVisits >= 10;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setIsScannerOpen(true)}
                      className="w-full text-right p-3 rounded-2xl glass-panel border border-white/10 hover:border-emerald-500/30 flex items-center justify-between text-xs transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-white/10 text-white font-bold flex items-center justify-center">
                          {c.name.slice(0, 1)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white">{c.name}</span>
                            <span className="font-mono text-[10px] text-white/40">
                              #{c.memberCode}
                            </span>
                          </div>
                          <span className="text-[10px] text-white/50 block">
                            {c.totalVisits} زيارات • آخر زيارة: {formatTimeAgoArabic(c.lastVisitAt)}
                          </span>
                        </div>
                      </div>

                      <div className="text-left flex items-center gap-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                            isVip
                              ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                              : isQuiet
                              ? "bg-red-500/20 text-red-300 border border-red-500/30"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          {isVip ? "VIP" : isQuiet ? "غبر" : "نشيط"}
                        </span>
                        <div className="text-right">
                          <span className="font-mono font-bold text-emerald-400 text-xs block">
                            {c.stamps}/{merchant.stampsRequired}
                          </span>
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
              <span className="text-[11px] text-white/70 block">قوالب جاهزة:</span>
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
                    className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition text-[11px] font-semibold ${
                      promoTemplate === tpl.id
                        ? "bg-white/15 border-white/30 text-white shadow"
                        : "bg-white/5 border-white/10 text-white/70"
                    }`}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Textarea */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>نص الإشعار:</span>
                <span className="font-mono text-[10px]">{promoMessage.length}/110</span>
              </div>
              <textarea
                rows={3}
                maxLength={110}
                value={promoMessage}
                onChange={(e) => setPromoMessage(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* 2x2 Audience Selector Grid */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-white/70 block">لمن غادي تصيفط:</span>
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
                    className={`p-3 rounded-2xl border text-right transition ${
                      promoAudience === a.id
                        ? "bg-emerald-500/20 border-emerald-400 text-white ring-1 ring-emerald-400"
                        : "bg-white/5 border-white/10 text-white/70"
                    }`}
                  >
                    <span className="font-bold block">{a.label}</span>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {a.count} زبون
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cost Summary Row */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
              <span className="text-white/70">
                غادي يتخصم: <strong className="text-amber-400 font-mono">{costCredits}</strong> كريدي
              </span>
              <span className="text-white/70">
                يبقى ليك: <strong className="text-emerald-400 font-mono">{Math.max(0, remainingCredits)}</strong> كريدي
              </span>
            </div>

            {promoSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                {promoSuccessMsg}
              </div>
            )}

            {/* Send Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={sendingPromo || merchant.credits < costCredits}
                onClick={handleSendCampaign}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
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
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            {/* Past Campaigns */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <span className="text-[11px] font-bold text-white/70 block">سجل الحملات السابقة:</span>
              {campaigns.slice(0, 3).map((camp) => (
                <div key={camp.id} className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>{camp.title}</span>
                    <span className="font-mono text-emerald-400">+{camp.returnedCount} رجعو</span>
                  </div>
                  <p className="text-[11px] text-white/60 truncate">{camp.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: أوتوماتيك (Automations) */}
        {activeTab === "auto" && (
          <div className="p-3.5 space-y-3.5 flex-1 animate-in fade-in duration-200">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-white/80 leading-relaxed">
              ميساجات كتخدم بوحدها — شعّلها مرة وحدة، و Walink تكلف بالباقي ⚡️
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
                  key: "autoBirthday" as const,
                  title: "عيد الميلاد",
                  badge: "بالكريدي",
                  message: `عيد ميلاد سعيد! ${merchant.name} عندها ليك ${merchant.rewardName} اليوم`,
                  active: automations.autoBirthday,
                  locked: false,
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
                  className="p-3 rounded-2xl glass-panel border border-white/10 flex items-center justify-between text-xs gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{item.title}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-white/60">
                        {item.badge}
                      </span>
                      {item.locked && (
                        <span className="text-[9px] text-amber-400 flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" /> Growth
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-white/50 mt-1 truncate max-w-[200px]">
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
                      className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-[10px]"
                    >
                      شوف
                    </button>

                    <button
                      type="button"
                      disabled={savingSettings || item.locked}
                      onClick={() => handleToggleAutomation(item.key)}
                      className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                        item.active ? "bg-emerald-500 justify-end" : "bg-white/20 justify-start"
                      } ${item.locked ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      <div className="w-5 h-5 rounded-full bg-white shadow-md"></div>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Test Automations Trigger Button */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <button
                type="button"
                disabled={testingCron}
                onClick={handleTestCronForMerchant}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                <span>{testingCron ? "جاري تجربة الأتمتة..." : "⚡ جرّب إرسال الرسائل الأوتوماتيكية دابا"}</span>
              </button>

              {cronTestMessage && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] text-center font-medium">
                  {cronTestMessage}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Navigation Bar */}
        <nav className="sticky bottom-0 z-30 bg-[#0B0F17]/95 backdrop-blur-xl border-t border-white/10 grid grid-cols-4 p-2 text-center text-xs">
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
                className={`py-2 rounded-xl flex flex-col items-center gap-1 transition ${
                  isActive ? "text-emerald-400 font-bold" : "text-white/50 hover:text-white"
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
          className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs flex items-center gap-1.5 backdrop-blur-md shadow-lg"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{isFrameMode ? "إلغاء إطار الهاتف" : "معاينة داخل آيفون"}</span>
        </button>

        <Link
          href={`/pass/${customers[0]?.passSerial || "pass-atlas-4821"}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5 backdrop-blur-md shadow-lg font-bold"
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
        customers={customers}
        onActionComplete={handleActionComplete}
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
