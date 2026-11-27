"use client";

import React, { useState } from "react";
import { X, Coins, Check, Zap, ArrowLeft } from "lucide-react";
import { TOPUP_PACKAGES, CREDIT_PRICE_MAD } from "@/lib/constants";

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
  const [selectedAmount, setSelectedAmount] = useState<number>(1000);
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
      <div className="relative w-full max-w-md bg-white border border-[#161514]/10 rounded-3xl shadow-2xl p-6 text-[#161514]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#161514]/10">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#F85B04]/10 text-[#F85B04] border border-[#F85B04]/25 shadow-sm">
              <Coins className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-lg text-[#161514]">شحن رصيد الكريدي</h3>
              <p className="text-xs text-[#161514]/65">{merchant.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-[#EFEAE4] text-[#161514]/65 hover:text-[#161514] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unified Rate Badge */}
        <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-amber-800">
            <Zap className="w-4 h-4 text-amber-600 fill-amber-600" />
            <span>سعر موحد:</span>
          </div>
          <span className="font-mono font-bold text-[11px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-lg shadow-sm">
            1 كريدي = 0.10 درهم (10 = 1 DH)
          </span>
        </div>

        {/* Current Balance */}
        <div className="my-3 p-4 rounded-2xl bg-[#EFEAE4] border border-[#161514]/10 flex items-center justify-between">
          <span className="text-xs text-[#161514]/65 font-semibold">الرصيد الحالي للمحل:</span>
          <div className="text-right">
            <span className="text-base font-bold text-[#DA5004] font-mono tabular-nums block">
              {merchant.credits.toLocaleString()} كريدي
            </span>
            <span className="text-[10px] text-[#161514]/60 font-mono tabular-nums font-semibold">
              ≈ {(merchant.credits * CREDIT_PRICE_MAD).toFixed(1)} DH
            </span>
          </div>
        </div>

        {/* Package Options */}
        <div className="space-y-2.5 my-4">
          <label className="text-xs font-semibold text-[#161514] block">
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
                className={`p-3.5 min-h-[44px] rounded-2xl border text-right transition flex items-center justify-between ${
                  selectedAmount === pkg.credits && !customAmount
                    ? "bg-[#F85B04]/10 border-[#F85B04]/50 text-[#161514] shadow-sm ring-1 ring-[#F85B04]/40 font-semibold"
                    : "bg-[#EFEAE4] border-[#161514]/10 hover:bg-[#EFEAE4]/80 text-[#161514]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedAmount === pkg.credits && !customAmount
                        ? "border-[#F85B04] bg-[#F85B04]"
                        : "border-[#161514]/25 bg-white"
                    }`}
                  >
                    {selectedAmount === pkg.credits && !customAmount && (
                      <Check className="w-3 h-3 text-white stroke-[3]" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-sm block text-[#161514]">{pkg.label}</span>
                    <span className="text-[11px] text-[#161514]/65">
                      {pkg.credits.toLocaleString()} عملية أو إشعار
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {pkg.popular && (
                    <span className="text-[10px] font-bold bg-[#161514] text-white px-2 py-0.5 rounded-md">
                      الأكثر طلباً
                    </span>
                  )}
                  <span className="text-sm font-bold text-[#DA5004] font-mono tabular-nums">
                    {pkg.price} درهم
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div className="pt-2">
            <label className="text-xs text-[#161514]/65 mb-1 block font-semibold">
              أو حدد رصيد مخصص (1 كريدي = 0.1 درهم):
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
                className="w-full min-h-[44px] bg-[#EFEAE4] border border-[#161514]/15 rounded-xl px-4 py-2.5 text-base text-[#161514] focus:outline-none focus:border-[#F85B04] focus:bg-white transition"
              />
              <span className="absolute left-3 top-3 text-xs text-[#161514]/60 font-semibold">
                كريدي
              </span>
            </div>
            {finalAmount > 0 && (
              <div className="mt-2 p-2.5 rounded-xl bg-[#F85B04]/10 border border-[#F85B04]/25 text-xs flex items-center justify-between text-[#161514] font-semibold animate-in fade-in">
                <span>المبلغ المستحق:</span>
                <span className="font-mono font-bold text-[#DA5004] text-sm tabular-nums">
                  {(finalAmount * CREDIT_PRICE_MAD).toFixed(1)} درهم
                </span>
              </div>
            )}
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
            className="flex-1 min-h-[44px] py-3 rounded-xl bg-[#F85B04] hover:bg-[#E25102] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_3px_0_#C14703] transition disabled:opacity-50"
          >
            {loading ? (
              <span>جاري الشحن...</span>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>
                  تأكيد شحن +{finalAmount.toLocaleString()} كريدي (
                  {(finalAmount * CREDIT_PRICE_MAD).toFixed(1)} درهم)
                </span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] py-3 px-4 rounded-xl bg-[#EFEAE4] hover:bg-[#E5DFD7] text-[#161514] border border-[#161514]/15 font-semibold text-sm transition"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

