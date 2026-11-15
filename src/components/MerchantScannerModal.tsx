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
} from "lucide-react";
import { soundEngine } from "@/lib/sound";

export interface CustomerSummary {
  id: string;
  name: string;
  phone: string;
  memberCode: string;
  passSerial: string;
  stamps: number;
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
  customers: CustomerSummary[];
  onActionComplete: (updatedCustomer: CustomerSummary, message: string) => void;
}

export default function MerchantScannerModal({
  isOpen,
  onClose,
  slug,
  rewardName,
  stampsRequired,
  customers,
  onActionComplete,
}: MerchantScannerModalProps) {
  const [activeTab, setActiveTab] = useState<"camera" | "manual">("camera");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

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
          console.warn("Camera access denied or unavailable, fallback to manual mode:", err);
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
        body: JSON.stringify({ identifier: searchQuery.trim(), action: "STAMP" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "تعذر العثور على الزبون");
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

  const isRewardReady = selectedCustomer ? selectedCustomer.stamps >= stampsRequired : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0F172A] border border-white/10 rounded-3xl shadow-2xl p-5 text-white my-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Camera className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base text-white">ماسح الكارط وطبع الطوابع</h3>
              <p className="text-[11px] text-white/50">سكاني الرمز أو اختر كود الزبون</p>
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
            onClick={() => setActiveTab("camera")}
            className={`py-2 rounded-xl font-semibold transition ${
              activeTab === "camera"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-white/70 hover:text-white"
            }`}
          >
            كاميرا الـ QR
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={`py-2 rounded-xl font-semibold transition ${
              activeTab === "manual"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-white/70 hover:text-white"
            }`}
          >
            إدخال يدوي / هاتف
          </button>
        </div>

        {/* Tab 1: Camera Scanner Viewfinder */}
        {activeTab === "camera" && (
          <div className="space-y-3">
            <div className="relative w-full h-48 sm:h-52 bg-black rounded-2xl overflow-hidden border-2 border-emerald-500/30 flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Scanning Laser Line Animation */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-36 h-36 border-2 border-emerald-400/80 rounded-2xl relative">
                  <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse top-1/2"></div>
                </div>
                <span className="text-[10px] text-emerald-300 font-medium bg-black/60 px-2 py-0.5 rounded-full mt-2">
                  وجّه الكاميرا نحو رمز QR الزبون
                </span>
              </div>

              {!cameraActive && (
                <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-4 text-center">
                  <Camera className="w-8 h-8 text-white/40 mb-2" />
                  <p className="text-xs text-white/70">
                    الكاميرا غير مفعلة فـ المتصفح.
                    <br />
                    استعمل الأزرار التجريبية أو الإدخال اليدوي.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Manual Input */}
        {activeTab === "manual" && (
          <form onSubmit={handleSearchSubmit} className="space-y-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="اكتب كود العضوية # (مثلاً 4821) أو رقم الهاتف..."
                aria-label="كود العضوية أو رقم الهاتف"
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={loading || !searchQuery.trim()}
                className="absolute left-2 top-2 p-1.5 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition disabled:opacity-40"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* Quick Select Demo Customers Strip */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-white/60">
            <span>كليان فـ المحل دابا (ضغطة سريعة للتجربة):</span>
            <Users className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {customers.slice(0, 6).map((c) => {
              const isSelected = selectedCustomer?.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectCustomer(c)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs whitespace-nowrap border flex items-center gap-1 transition ${
                    isSelected
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400 font-bold"
                      : "bg-white/5 border-white/10 hover:bg-white/10 text-white/80"
                  }`}
                >
                  <span>{c.name.split(" ")[0]}</span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    ({c.stamps}/{stampsRequired})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
              message.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                : "bg-red-500/10 border border-red-500/30 text-red-400"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="leading-tight">{message.text}</span>
          </div>
        )}

        {/* Selected Customer Stamp / Redeem Action Box */}
        {selectedCustomer && (
          <div className="p-4 rounded-3xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white">
                  {selectedCustomer.name}
                </h4>
                <span className="text-[11px] text-white/50 font-mono">
                  عضوية #{selectedCustomer.memberCode} • {selectedCustomer.totalVisits} زيارة
                </span>
              </div>

              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  isRewardReady
                    ? "bg-amber-400 text-slate-950 animate-bounce"
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                }`}
              >
                {selectedCustomer.stamps} / {stampsRequired} طوابع
              </span>
            </div>

            {/* Stamp Circles Visual */}
            <div className="flex items-center justify-center gap-1.5 py-1">
              {Array.from({ length: stampsRequired }).map((_, idx) => {
                const isCollected = idx < selectedCustomer.stamps;
                const isGift = idx === stampsRequired - 1;
                return (
                  <div
                    key={idx}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all ${
                      isCollected
                        ? isGift
                          ? "bg-amber-400 text-black shadow-md ring-1 ring-amber-300"
                          : "bg-emerald-500 text-black shadow-md"
                        : "bg-white/5 border border-white/10 text-white/40"
                    }`}
                  >
                    {isCollected ? (
                      isGift ? (
                        <Gift className="w-3.5 h-3.5" />
                      ) : (
                        "✓"
                      )
                    ) : isGift ? (
                      <Gift className="w-3 h-3 text-white/30" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {/* Add Stamp Button */}
              <button
                type="button"
                disabled={loading}
                onClick={() => handleStampOrRedeem("STAMP")}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition disabled:opacity-50"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ زيد طابع جديد</span>
              </button>

              {/* Redeem Reward Button */}
              <button
                type="button"
                disabled={loading}
                onClick={() => handleStampOrRedeem("REDEEM")}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                  isRewardReady
                    ? "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-500/30 scale-[1.02]"
                    : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
                }`}
              >
                <Gift className="w-4 h-4" />
                <span>سلّم الكادو</span>
              </button>
            </div>

            {/* Test Customer Pass Link */}
            <div className="pt-1 text-center">
              <Link
                href={`/pass/${selectedCustomer.passSerial}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline font-medium"
              >
                <span>فتح كارط {selectedCustomer.name} فـ نافذة جديدة للمعاينة الحية</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
