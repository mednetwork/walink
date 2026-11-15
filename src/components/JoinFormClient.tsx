"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Smartphone,
  Gift,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Lock,
} from "lucide-react";
import WalletPassPreview from "@/components/WalletPassPreview";
import { isValidMoroccanPhone } from "@/lib/utils";

interface JoinFormMerchant {
  name: string;
  slug: string;
  niche: string;
  city: string;
  logoIcon: string;
  primaryColor: string;
  bgGradient: string;
  stampsRequired: number;
  rewardName: string;
  customerPrefix: string;
}

interface JoinFormClientProps {
  merchant: JoinFormMerchant;
}

export default function JoinFormClient({ merchant }: JoinFormClientProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("عافاك كتب الاسم ديالك");
      return;
    }

    if (!isValidMoroccanPhone(phone)) {
      setError("رقم الهاتف خاصو يكون رقم مغربي صحيح (مثلاً: 0612345678 أو 0712345678)");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/join/${merchant.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone, birthday }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "تعذر تفعيل الكارط");
      }

      // Smooth transition to Customer Live Pass
      router.push(`/pass/${data.passSerial}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("وقع خطأ غير متوقع، عاود المحاولة");
      }
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen flex flex-col justify-between p-4 sm:p-6 text-white selection:bg-emerald-500 selection:text-black">
      <div className="space-y-6 pt-4">
        {/* Top Header Badge */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{merchant.city} • بطاقة الوفاء الرقمية</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            خود كارط الوفاء ديال <span className="text-emerald-400">{merchant.name}</span> فـ 5 ثواني
          </h1>
          <p className="text-xs text-white/70 max-w-xs mx-auto">
            بلا تيليشارجيمون وبلا أبليكاسيون! تسجّل دابا وخود أول طابع هدية ترحيبية 🎁
          </p>
        </div>

        {/* Live As-You-Type Card Preview */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-amber-500/20 to-emerald-500/20 rounded-[32px] blur-md opacity-75 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative">
            <WalletPassPreview
              name={merchant.name}
              niche={merchant.niche}
              primaryColor={merchant.primaryColor}
              bgGradient={merchant.bgGradient}
              stamps={1}
              stampsRequired={merchant.stampsRequired}
              rewardName={merchant.rewardName}
              memberCode={name.trim() ? "واجد" : "••••"}
              compact={true}
            />
          </div>
        </div>

        {/* Welcome Stamp Callout */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Gift className="w-5 h-5 animate-bounce" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-white block">طابع ترحيبي مجاني كيتسناك!</span>
            <span className="text-white/60 text-[11px]">
              غير تفتح الكارط غادي تاخد أول طابع فابور مع مكافأة: {merchant.rewardName}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4 glass-panel p-6 rounded-3xl border border-white/10">
          <div>
            <label htmlFor="customer-name" className="text-xs font-semibold text-white/90 mb-1.5 block">
              الاسم ديالك *
            </label>
            <input
              id="customer-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلاً: كريم أو فاطمة الزهراء"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label htmlFor="customer-phone" className="text-xs font-semibold text-white/90 mb-1.5 block">
              رقم التيليفون *
            </label>
            <input
              id="customer-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="06 12 34 56 78"
              dir="ltr"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-mono text-white placeholder-white/30 text-left focus:outline-none focus:border-emerald-500 transition"
            />
            <span className="text-[10px] text-white/40 block mt-1">
              الرقم ديالك كيبقى سري ومحمي 🔒 باش ترجع طوابعك إيلا بدّلتي التيليفون.
            </span>
          </div>

          <div>
            <label htmlFor="customer-birthday" className="text-xs font-semibold text-white/90 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>تاريخ عيد ميلادك (اختياري — باش يوصلك كادو 🎂)</span>
            </label>
            <input
              id="customer-birthday"
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full bg-[#111827] border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white/80 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <span>جاري تفعيل الكارط...</span>
            ) : (
              <>
                <Smartphone className="w-5 h-5" />
                <span>احفظ الكارط فـ تيليفوني دابا</span>
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-white/50 leading-relaxed pt-1">
            مسجّل من قبل؟ غير كتب نمرتك وغادي ترجع ليك الكارط ديالك بطوابعها.
          </p>
        </form>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-[11px] text-white/40">
        walink.ma • بطاقات الوفاء الذكية بالمغرب 🇲🇦
      </footer>
    </div>
  );
}

