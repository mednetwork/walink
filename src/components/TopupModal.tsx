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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-[#E9EDEF] rounded-3xl shadow-2xl p-6 text-[#111B21]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E9EDEF]">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-sm">
              <Coins className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-lg text-[#111B21]">شحن رصيد الكريدي</h3>
              <p className="text-xs text-[#54656F]">{merchant.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#F0F2F5] text-[#54656F] hover:text-[#111B21] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance */}
        <div className="my-4 p-4 rounded-2xl bg-[#F0F2F5] border border-[#E9EDEF] flex items-center justify-between">
          <span className="text-xs text-[#54656F] font-semibold">الرصيد الحالي للمحل:</span>
          <span className="text-base font-bold text-amber-700 font-mono">
            {merchant.credits.toLocaleString()} كريدي
          </span>
        </div>

        {/* Package Options */}
        <div className="space-y-2.5 my-4">
          <label className="text-xs font-semibold text-[#111B21] block">
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
                    ? "bg-amber-50 border-amber-300 text-amber-950 shadow-sm ring-1 ring-amber-300 font-semibold"
                    : "bg-[#F0F2F5] border-[#E9EDEF] hover:bg-[#E9EDEF] text-[#111B21]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedAmount === pkg.credits && !customAmount
                        ? "border-amber-500 bg-amber-500"
                        : "border-[#D1D7DB] bg-white"
                    }`}
                  >
                    {selectedAmount === pkg.credits && !customAmount && (
                      <Check className="w-3 h-3 text-white stroke-[3]" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-sm block text-[#111B21]">{pkg.label}</span>
                    <span className="text-[11px] text-[#54656F]">
                      تكفي لـ {pkg.credits} إشعار ورادار
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {pkg.popular && (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-md">
                      الأكثر طلباً
                    </span>
                  )}
                  <span className="text-sm font-bold text-amber-700 font-mono">
                    {pkg.price} درهم
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div className="pt-2">
            <label className="text-xs text-[#54656F] mb-1 block font-semibold">
              أو حدد رصيد مخصص:
            </label>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min="50"
                step="50"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="مثلاً: 2500"
                className="w-full bg-[#F0F2F5] border border-[#D1D7DB] rounded-xl px-4 py-2.5 text-sm text-[#111B21] focus:outline-none focus:border-amber-500 focus:bg-white transition"
              />
              <span className="absolute left-3 top-2.5 text-xs text-[#54656F] font-semibold">
                كريدي
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            disabled={loading || finalAmount <= 0}
            onClick={() => handleSubmit(finalAmount)}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition disabled:opacity-50"
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
            className="py-3 px-4 rounded-xl bg-[#F0F2F5] hover:bg-[#E9EDEF] text-[#54656F] border border-[#D1D7DB] font-semibold text-sm transition"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

