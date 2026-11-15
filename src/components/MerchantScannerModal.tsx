"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  X,
  Camera,
  Search,
  Sparkles,
  Gift,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  RefreshCw,
  Award,
  Users,
  Coins,
  ArrowRightLeft,
} from "lucide-react";
import { soundEngine } from "@/lib/sound";
import { Locale, translations } from "@/lib/i18n/translations";

export interface CustomerSummary {
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
  lastVisitAt?: string | Date;
}

interface MerchantScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  rewardName: string;
  stampsRequired: number;
  loyaltyMode?: string;
  cashbackRate?: number;
  currency?: string;
  minCashbackRedeem?: number;
  customers: CustomerSummary[];
  onActionComplete: (updatedCustomer: CustomerSummary, message: string) => void;
  locale?: Locale;
}

export default function MerchantScannerModal({
  isOpen,
  onClose,
  slug,
  rewardName,
  stampsRequired,
  loyaltyMode = "BOTH",
  cashbackRate = 10,
  currency = "DH",
  minCashbackRedeem = 0,
  customers,
  onActionComplete,
  locale = "ar",
}: MerchantScannerModalProps) {
  const [activeTab, setActiveTab] = useState<"camera" | "manual">("camera");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Cashback POS Calculator State
  const [posTab, setPosTab] = useState<"earn" | "redeem">("earn");
  const [billAmount, setBillAmount] = useState<string>("150");
  const [redeemAmount, setRedeemAmount] = useState<string>("");
  const [redeemBillTotal, setRedeemBillTotal] = useState<string>("");

  const t = translations[locale] || translations.ar;
  const isRTL = locale === "ar";

  // Camera video ref
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Initialize camera when camera tab is open
  useEffect(() => {
    if (!isOpen || activeTab !== "camera") {
      setCameraActive(false);
      return;
    }

    let stream: MediaStream | null = null;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play().catch(() => {});
            setCameraActive(true);
          }
        })
        .catch((err) => {
          console.warn("Camera access fallback to manual mode:", err);
          setCameraActive(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleSelectCustomer = (c: CustomerSummary) => {
    setSelectedCustomer(c);
    setMessage(null);
    setRedeemAmount(
      c.cashbackBalance && c.cashbackBalance > 0
        ? String(c.cashbackBalance)
        : ""
    );
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/m/${slug}/stamp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({
          identifier: searchQuery.trim(),
          action: "STAMP",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "تعذر العثور على العميل");
      }

      setSelectedCustomer(data.customer);
      setMessage({ text: data.message, type: "success" });
      soundEngine.playStampChime();
      onActionComplete(data.customer, data.message);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطأ أثناء البحث";
      setMessage({ text: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleStampOrRedeem = async (action: "STAMP" | "REDEEM") => {
    if (!selectedCustomer) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/m/${slug}/stamp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({ customerId: selectedCustomer.id, action }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "فشل تنفيذ العملية");
      }

      setSelectedCustomer(data.customer);
      setMessage({ text: data.message, type: "success" });

      if (action === "REDEEM") {
        soundEngine.playRewardChime();
      } else {
        soundEngine.playStampChime();
      }

      onActionComplete(data.customer, data.message);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطأ أثناء التسجيل";
      setMessage({ text: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Handle Cashback Earn
  const handleCashbackEarn = async () => {
    if (!selectedCustomer) return;
    const bill = parseFloat(billAmount);
    if (isNaN(bill) || bill <= 0) {
      setMessage({
        text: "يرجى إدخال مبلغ فاتورة صحيح",
        type: "error",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/m/${slug}/stamp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          action: "CASHBACK_EARN",
          billAmount: bill,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشلت عملية إضافة الكاش باك");

      setSelectedCustomer(data.customer);
      setMessage({ text: data.message, type: "success" });
      soundEngine.playRewardChime();
      onActionComplete(data.customer, data.message);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطأ أثناء الإضافة";
      setMessage({ text: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Handle Cashback Redeem
  const handleCashbackRedeem = async () => {
    if (!selectedCustomer) return;
    const redeem = parseFloat(redeemAmount);
    if (isNaN(redeem) || redeem <= 0) {
      setMessage({
        text: "يرجى إدخال مبلغ صحيح للخصم",
        type: "error",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/m/${slug}/stamp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          action: "CASHBACK_REDEEM",
          redeemAmount: redeem,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشلت عملية خصم الكاش باك");

      setSelectedCustomer(data.customer);
      setMessage({ text: data.message, type: "success" });
      soundEngine.playRewardChime();
      onActionComplete(data.customer, data.message);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطأ أثناء الخصم";
      setMessage({ text: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Handle Switch Customer Loyalty Type
  const handleSwitchType = async () => {
    if (!selectedCustomer) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/m/${slug}/stamp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          action: "SWITCH_TYPE",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل تحويل البرنامج");

      setSelectedCustomer(data.customer);
      setMessage({ text: data.message, type: "success" });
      onActionComplete(data.customer, data.message);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطأ أثناء التحويل";
      setMessage({ text: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const isCashback = selectedCustomer?.loyaltyType === "CASHBACK";
  const isRewardReady = selectedCustomer
    ? selectedCustomer.stamps >= stampsRequired
    : false;

  const calculatedEarned = Number(
    (((parseFloat(billAmount) || 0) * cashbackRate) / 100).toFixed(2)
  );

  const parsedRedeem = parseFloat(redeemAmount) || 0;
  const parsedBillTotal = parseFloat(redeemBillTotal) || 0;
  const remainingCashToPay = Math.max(0, parsedBillTotal - parsedRedeem);

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-[#0F172A] border border-white/10 rounded-3xl shadow-2xl p-5 text-white my-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Camera className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base text-white">
                {t.merchant.scannerBtn}
              </h3>
              <p className="text-[11px] text-white/50">
                امسح الرمز أو اختر عميلاً بالرقم
              </p>
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

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/5 text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab("camera");
              setMessage(null);
            }}
            className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
              activeTab === "camera"
                ? "bg-emerald-500 text-slate-950 shadow-md"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>كاميرا المسح (QR)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("manual");
              setMessage(null);
            }}
            className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
              activeTab === "manual"
                ? "bg-emerald-500 text-slate-950 shadow-md"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Search className="w-4 h-4" />
            <span>إدخال يدوي</span>
          </button>
        </div>

        {/* Camera View Mode */}
        {activeTab === "camera" && (
          <div className="space-y-3">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 flex items-center justify-center">
              {cameraActive ? (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
              ) : (
                <div className="text-center p-4 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto text-white/40">
                    <Camera className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-white/60">
                    جاري تشغيل الكاميرا أو يمكنك اختيار العميل من القائمة أدناه
                  </p>
                </div>
              )}

              {/* Viewfinder Target Overlays */}
              <div className="absolute inset-8 border-2 border-emerald-400/80 rounded-2xl pointer-events-none animate-pulse flex items-center justify-center">
                <span className="w-full h-0.5 bg-emerald-400/50 absolute shadow-[0_0_8px_#34d399]" />
              </div>
            </div>

            {/* Quick Fast-Picker from seeded customers */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-white/60 block">
                اختر عميلاً سريعاً للتجربة الفورية:
              </span>
              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
                {customers.slice(0, 6).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCustomer(c)}
                    className={`p-2 rounded-xl border text-start text-xs transition flex items-center justify-between ${
                      selectedCustomer?.id === c.id
                        ? "bg-emerald-500/20 border-emerald-400/50 text-white"
                        : "bg-white/5 border-white/5 hover:bg-white/10 text-white/80"
                    }`}
                  >
                    <div className="truncate">
                      <span className="font-bold block truncate">{c.name}</span>
                      <span className="text-[10px] text-white/50 font-mono">
                        #{c.memberCode}
                      </span>
                    </div>
                    {c.loyaltyType === "CASHBACK" ? (
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-400/20 px-1.5 py-0.5 rounded">
                        كاش باك
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                        {c.stamps}/{stampsRequired}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Manual Search Mode */}
        {activeTab === "manual" && (
          <form onSubmit={handleSearchSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/70 block">
                {t.merchant.manualLookup}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.merchant.searchPlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/40 text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute left-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1 hover:bg-emerald-400 disabled:opacity-50"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>بحث وطبع</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Status Feedback Message */}
        {message && (
          <div
            className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
              message.type === "success"
                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/15 border border-rose-500/30 text-rose-300"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="leading-snug">{message.text}</span>
          </div>
        )}

        {/* Selected Customer Card & Dual POS Controls */}
        {selectedCustomer && (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-white">
                    {selectedCustomer.name}
                  </h4>
                  {isCashback ? (
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
                      <Coins className="w-3 h-3" />
                      <span>{t.merchant.badgeCashback} ({cashbackRate}%)</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                      <Gift className="w-3 h-3" />
                      <span>{t.merchant.badgeStamps}</span>
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-white/50 font-mono">
                  #{selectedCustomer.memberCode} • {selectedCustomer.phone}
                </span>
              </div>

              {loyaltyMode === "BOTH" && (
                <button
                  type="button"
                  onClick={handleSwitchType}
                  disabled={loading}
                  className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-semibold text-slate-300 flex items-center gap-1 transition"
                  title="تحويل نظام العميل"
                >
                  <ArrowRightLeft className="w-3 h-3 text-emerald-400" />
                  <span>تبديل</span>
                </button>
              )}
            </div>

            {/* IF CUSTOMER HAS STAMPS */}
            {!isCashback && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/70">الأختام المجمّعة:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {selectedCustomer.stamps} / {stampsRequired}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleStampOrRedeem("STAMP")}
                    className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t.merchant.addStampBtn}</span>
                  </button>

                  <button
                    type="button"
                    disabled={loading || selectedCustomer.stamps < stampsRequired}
                    onClick={() => handleStampOrRedeem("REDEEM")}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-30 ${
                      selectedCustomer.stamps >= stampsRequired
                        ? "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/20 animate-pulse"
                        : "bg-white/5 text-white/50 border border-white/10"
                    }`}
                  >
                    <Gift className="w-4 h-4" />
                    <span>{t.merchant.redeemRewardBtn}</span>
                  </button>
                </div>
              </div>
            )}

            {/* IF CUSTOMER HAS CASHBACK (2-Tab POS Action Box) */}
            {isCashback && (
              <div className="space-y-3">
                {/* Available Balance Display */}
                <div className="p-3 rounded-xl bg-black/40 border border-amber-400/30 flex items-center justify-between">
                  <span className="text-xs text-white/70">
                    {t.merchant.currentBalance}
                  </span>
                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="text-xl font-extrabold text-amber-300">
                      {Number(selectedCustomer.cashbackBalance || 0).toFixed(2)}
                    </span>
                    <span className="text-xs text-amber-200/90">{currency}</span>
                  </div>
                </div>

                {/* Sub-tabs: Earn vs Redeem */}
                <div className="grid grid-cols-2 gap-1 p-1 bg-black/30 rounded-xl border border-white/5 text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setPosTab("earn")}
                    className={`py-1.5 rounded-lg transition ${
                      posTab === "earn"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    {t.merchant.earnCashbackTab}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosTab("redeem")}
                    className={`py-1.5 rounded-lg transition ${
                      posTab === "redeem"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    {t.merchant.redeemCashbackTab}
                  </button>
                </div>

                {/* Tab A: Add Cashback */}
                {posTab === "earn" && (
                  <div className="space-y-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] text-white/70 block">
                        {t.merchant.billAmountLabel.replace("{currency}", currency)}
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        value={billAmount}
                        onChange={(e) => setBillAmount(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Quick Pills */}
                    <div className="flex items-center gap-1.5">
                      {["50", "100", "150", "200", "300"].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setBillAmount(val)}
                          className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-mono text-white/80 border border-white/5 transition"
                        >
                          {val}
                        </button>
                      ))}
                    </div>

                    {/* Calculation Preview */}
                    <p className="text-[11px] text-emerald-300/90 leading-tight">
                      {t.merchant.calculatePreview
                        .replace("{amount}", String(calculatedEarned))
                        .replace("{currency}", currency)
                        .replace("{rate}", String(cashbackRate))}
                    </p>

                    <button
                      type="button"
                      disabled={loading || calculatedEarned <= 0}
                      onClick={handleCashbackEarn}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50 shadow-md shadow-emerald-500/20"
                    >
                      <Plus className="w-4 h-4" />
                      <span>
                        {t.merchant.confirmEarnBtn
                          .replace("{amount}", String(calculatedEarned))
                          .replace("{currency}", currency)}
                      </span>
                    </button>
                  </div>
                )}

                {/* Tab B: Redeem Cashback */}
                {posTab === "redeem" && (
                  <div className="space-y-2.5">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] text-white/70 block">
                          {t.merchant.redeemAmountLabel.replace(
                            "{currency}",
                            currency
                          )}
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setRedeemAmount(
                              String(selectedCustomer.cashbackBalance || 0)
                            )
                          }
                          className="text-[10px] text-amber-300 underline hover:text-amber-200"
                        >
                          {t.merchant.redeemFullBtn
                            .replace(
                              "{amount}",
                              String(
                                Number(
                                  selectedCustomer.cashbackBalance || 0
                                ).toFixed(2)
                              )
                            )
                            .replace("{currency}", currency)}
                        </button>
                      </div>
                      <input
                        type="number"
                        min="1"
                        max={selectedCustomer.cashbackBalance || 0}
                        step="any"
                        value={redeemAmount}
                        onChange={(e) => setRedeemAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-white/60 block">
                        قيمة الفاتورة الإجمالية (اختياري لحساب الباقي):
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={redeemBillTotal}
                        onChange={(e) => setRedeemBillTotal(e.target.value)}
                        placeholder="100"
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none"
                      />
                    </div>

                    {parsedBillTotal > 0 && (
                      <p className="text-[11px] text-slate-300 font-medium">
                        {t.merchant.remainingToPay
                          .replace("{amount}", remainingCashToPay.toFixed(2))
                          .replace("{currency}", currency)}
                      </p>
                    )}

                    <button
                      type="button"
                      disabled={
                        loading ||
                        parsedRedeem <= 0 ||
                        parsedRedeem > (selectedCustomer.cashbackBalance || 0)
                      }
                      onClick={handleCashbackRedeem}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50 shadow-md shadow-amber-500/20"
                    >
                      <Coins className="w-4 h-4" />
                      <span>
                        {t.merchant.confirmRedeemBtn
                          .replace("{amount}", String(parsedRedeem))
                          .replace("{currency}", currency)}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
