"use client";

import React, { useState } from "react";
import { X, Coins, Check, Zap, ArrowLeft } from "lucide-react";
import { TOPUP_PACKAGES } from "@/lib/constants";

interface TopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchant: {
    id: string;
    name: string;
    credits: number;
  };
  onSuccess: (newCredits: number) => void;
}

export default function TopupModal({
  isOpen,
  onClose,
  merchant,
  onSuccess,
}: TopupModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(1200);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (amountToTopup: number) => {
    if (amountToTopup <= 0) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/merchants/${merchant.id}/topup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountToTopup }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "فشل شحن الرصيد");
      }

      const data = await res.json();
      onSuccess(data.credits);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("وقع خطأ غير متوقع أثناء الشحن");
      }
    } finally {
      setLoading(false);
    }
  };

  const finalAmount = customAmount ? parseInt(customAmount, 10) || 0 : selectedAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0F172A] border border-white/10 rounded-3xl shadow-2xl p-6 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Coins className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-lg text-white">شحن رصيد الكريدي</h3>
              <p className="text-xs text-white/60">{merchant.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance */}
        <div className="my-4 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <span className="text-xs text-white/70">الرصيد الحالي للمحل:</span>
          <span className="text-base font-bold text-amber-400 font-mono">
            {merchant.credits.toLocaleString()} كريدي
          </span>
        </div>

        {/* Package Options */}
        <div className="space-y-2.5 my-4">
          <label className="text-xs font-semibold text-white/80 block">
            اختر باقة الشحن:
          </label>
          <div className="grid grid-cols-1 gap-2.5">
            {TOPUP_PACKAGES.map((pkg) => (
              <button
                key={pkg.credits}
                type="button"
                onClick={() => {
                  setSelectedAmount(pkg.credits);
                  setCustomAmount("");
                }}
                className={`p-3.5 rounded-2xl border text-right transition flex items-center justify-between ${
                  selectedAmount === pkg.credits && !customAmount
                    ? "bg-amber-500/15 border-amber-500/50 text-white shadow-lg shadow-amber-500/10"
                    : "bg-white/5 border-white/10 hover:bg-white/10 text-white/80"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedAmount === pkg.credits && !customAmount
                        ? "border-amber-400 bg-amber-400"
                        : "border-white/30"
                    }`}
                  >
                    {selectedAmount === pkg.credits && !customAmount && (
                      <Check className="w-3 h-3 text-black stroke-[3]" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-sm block">{pkg.label}</span>
                    <span className="text-[11px] text-white/60">
                      تكفي لـ {pkg.credits} إشعار ورادار
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {pkg.popular && (
                    <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md">
                      الأكثر طلباً
                    </span>
                  )}
                  <span className="text-sm font-bold text-amber-400 font-mono">
                    {pkg.price} درهم
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div className="pt-2">
            <label className="text-xs text-white/70 mb-1 block">
              أو حدد رصيد مخصص:
            </label>
            <div className="relative">
              <input
                type="number"
                min="50"
                step="50"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="مثلاً: 2500"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition"
              />
              <span className="absolute left-3 top-2.5 text-xs text-white/50">
                كريدي
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            disabled={loading || finalAmount <= 0}
            onClick={() => handleSubmit(finalAmount)}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
          >
            {loading ? (
              <span>جاري الشحن...</span>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>تأكيد شحن +{finalAmount.toLocaleString()} كريدي</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 font-semibold text-sm transition"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

