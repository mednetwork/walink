import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Store,
  Users,
  Smartphone,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  Layers,
  Database,
  QrCode,
  Radio,
  CheckCircle2,
  Clock,
  Gift,
} from "lucide-react";
import prisma from "@/lib/prisma";

export const revalidate = 0;

export default async function HomePage() {
  const merchantsCount = await prisma.merchant.count();
  const customersCount = await prisma.customer.count();
  const transactionsCount = await prisma.transaction.count();

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Background Glow Highlights */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px]" />
        <div className="absolute top-1/3 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[128px]" />
        <div className="absolute -bottom-20 right-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-[128px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-[#0B0F17]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight">
                walink<span className="text-emerald-400">.ma</span>
              </span>
              <span className="text-[10px] text-white/50 block -mt-0.5">
                والينك المغرب • بطاقات الوفاء الذكية
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
            >
              <span>دخول لوحة الإدارة</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-12 sm:py-16 text-center space-y-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>المرحلة الثانية مكتملة بنجاح • Phase 2 Customer Pass & Onboarding Live</span>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            منصة بطاقات الوفاء الذكية
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
              للمحلات التجارية في المغرب 🇲🇦
            </span>
          </h1>
          <p className="text-sm sm:text-base text-white/70 leading-relaxed">
            محفظة Apple Wallet و Google Wallet و Web Pass بدون أي تطبيق. مدمجة برادار
            الاقتراب 100 متر، أتمتة مراجعات خرائط Google، ورنات Apple Wallet الحقيقية.
          </p>
        </div>

        {/* Live Database Metrics Pill */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
            <Store className="w-4 h-4 text-emerald-400" />
            <span>المحلات المسجلة:</span>
            <strong className="font-mono text-white text-sm">{merchantsCount}</strong>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span>البطاقات المفعلة:</span>
            <strong className="font-mono text-white text-sm">{customersCount}</strong>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-400" />
            <span>الزيارات والطوابع:</span>
            <strong className="font-mono text-white text-sm">{transactionsCount}</strong>
          </div>
        </div>

        {/* Developer Launchpad Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 text-right">
          {/* Box 1: Super Admin */}
          <Link
            href="/admin"
            className="glass-panel glass-card-hover p-5 rounded-3xl block group border-emerald-500/20"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-sm text-white flex items-center justify-between">
              <span>لوحة الإدارة</span>
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-400 group-hover:-translate-x-1 transition-transform" />
            </h2>
            <p className="text-[11px] text-white/60 mt-1 leading-relaxed">
              إدارة المحلات وشحن الكريدي ومعاينة الستاند الذكي.
            </p>
            <span className="mt-3 inline-block font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg">
              /admin
            </span>
          </Link>

          {/* Box 2: Customer Onboarding */}
          <Link
            href="/join/cafe-atlas"
            className="glass-panel glass-card-hover p-5 rounded-3xl block group border-blue-500/20"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Smartphone className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-sm text-white flex items-center justify-between">
              <span>انضمام الزبون (NFC/QR)</span>
              <ArrowLeft className="w-3.5 h-3.5 text-blue-400 group-hover:-translate-x-1 transition-transform" />
            </h2>
            <p className="text-[11px] text-white/60 mt-1 leading-relaxed">
              تسجيل في 5 ثوانٍ مع طابع ترحيبي مجاني كادو 🎁.
            </p>
            <span className="mt-3 inline-block font-mono text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg">
              /join/cafe-atlas
            </span>
          </Link>

          {/* Box 3: Live Customer Pass Hub */}
          <Link
            href="/pass/pass-atlas-4821"
            className="glass-panel glass-card-hover p-5 rounded-3xl block group border-purple-500/20"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Gift className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-sm text-white flex items-center justify-between">
              <span>الكارط الحية (ليلى التازي)</span>
              <ArrowLeft className="w-3.5 h-3.5 text-purple-400 group-hover:-translate-x-1 transition-transform" />
            </h2>
            <p className="text-[11px] text-white/60 mt-1 leading-relaxed">
              رنة Apple Wallet، رادار 100m، ورمز QR للمسح.
            </p>
            <span className="mt-3 inline-block font-mono text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-lg">
              /pass/pass-atlas-4821
            </span>
          </Link>

          {/* Box 4: Merchant Portal Placeholder */}
          <Link
            href="/m/cafe-atlas"
            className="glass-panel glass-card-hover p-5 rounded-3xl block group border-amber-500/20"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-sm text-white flex items-center justify-between">
              <span>بوابة التاجر</span>
              <ArrowLeft className="w-3.5 h-3.5 text-amber-400 group-hover:-translate-x-1 transition-transform" />
            </h2>
            <p className="text-[11px] text-white/60 mt-1 leading-relaxed">
              ماسح الكاميرا السريع وطبع الطوابع (المرحلة 3).
            </p>
            <span className="mt-3 inline-block font-mono text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg">
              /m/cafe-atlas
            </span>
          </Link>
        </div>

        {/* 5-Phase Roadmap Status */}
        <div className="glass-panel p-6 rounded-3xl text-right max-w-3xl mx-auto space-y-4">
          <h2 className="font-bold text-sm text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>خارطة طريق بناء Walink عبر 5 مراحل (5-Phase Roadmap)</span>
          </h2>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">
                  المرحلة 1: المعمارية الأساسية، قاعدة البيانات، وبذور المغرب، ولوحة السوبر أدمن
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-md">
                مكتملة ✓
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">
                  المرحلة 2: تدفق انضمام الزبون (/join/[slug])، الكارط الحية (/pass/[serial])، رادار 100m، ومحرك Apple Wallet
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-md">
                مكتملة الآن ✓
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-white/60">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-white/40" />
                <span>المرحلة 3: لوحة التاجر السريعة (/m/[slug]) والماسح بالكاميرا / PIN</span>
              </div>
              <span className="text-[10px] text-white/40">المرحلة القادمة</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-white/60">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-white/40" />
                <span>المرحلة 4: محرك الرادار Geofencing (100m) وأتمتة استرجاع الزبائن الغابرين</span>
              </div>
              <span className="text-[10px] text-white/40">قادمة</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-white/60">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-white/40" />
                <span>المرحلة 5: الصفحة التسويقية الرئيسية، حاسبة الأرباح، وربط الدفع</span>
              </div>
              <span className="text-[10px] text-white/40">قادمة</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-6 text-center text-xs text-white/40">
        <p>والينك (walink.ma) • صُنع بكل فخر للأعمال المحلية في المغرب 🇲🇦</p>
      </footer>
    </div>
  );
}
