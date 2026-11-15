import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Store, ArrowRight, ShieldCheck, QrCode, Sparkles, Clock, Smartphone } from "lucide-react";
import prisma from "@/lib/prisma";

interface MerchantPageProps {
  params: {
    slug: string;
  };
}

export default async function MerchantDashboardPlaceholderPage({
  params,
}: MerchantPageProps) {
  const { slug } = params;

  const merchant = await prisma.merchant.findUnique({
    where: { slug },
    include: {
      _count: {
        select: {
          customers: true,
          transactions: true,
        },
      },
    },
  });

  if (!merchant) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white p-4 sm:p-8 flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      <div className="max-w-2xl mx-auto w-full space-y-6 pt-12">
        {/* Top bar link */}
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
        >
          <ArrowRight className="w-4 h-4" />
          <span>الرجوع إلى لوحة السوبر أدمن</span>
        </Link>

        {/* Merchant Card */}
        <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6 text-center">
          <div
            className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center text-2xl font-bold shadow-xl"
            style={{ background: merchant.bgGradient || merchant.primaryColor }}
          >
            {merchant.name.slice(0, 2)}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">{merchant.name}</h1>
            <p className="text-xs text-emerald-400 font-mono mt-1">
              /{merchant.slug} • {merchant.city}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 text-right">
            <div>
              <span className="text-[11px] text-white/50 block">المكافأة:</span>
              <span className="text-sm font-bold text-amber-300">
                {merchant.rewardName}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-white/50 block">الطوابع:</span>
              <span className="text-sm font-bold text-white">
                {merchant.stampsRequired} طوابع
              </span>
            </div>
            <div>
              <span className="text-[11px] text-white/50 block">الزبائن المسجلين:</span>
              <span className="text-sm font-mono font-bold text-white">
                {merchant._count.customers} زبون
              </span>
            </div>
            <div>
              <span className="text-[11px] text-white/50 block">رصيد الكريدي:</span>
              <span className="text-sm font-mono font-bold text-amber-400">
                {merchant.credits} كريدي
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-right space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Clock className="w-4 h-4" />
              <span>المرحلة 3: لوحة التاجر السريعة (Phase 3 Merchant Terminal)</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              سيتم بناء الماسح السريع عبر الكاميرا ورقم الـ PIN، وطبع الطوابع الفوري بنقرة واحدة،
              وتتبع الإحصائيات اليومية في المرحلة الثالثة.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-4">
            <Link
              href={`/join/${merchant.slug}`}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition"
            >
              معاينة شاشة انضمام الزبون
            </Link>
            <Link
              href="/admin"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
            >
              لوحة التحكم المركزية
            </Link>
          </div>
        </div>
      </div>

      <footer className="py-6 text-center text-xs text-white/40">
        walink.ma • منصة بطاقات الوفاء الذكية بالمغرب
      </footer>
    </div>
  );
}

