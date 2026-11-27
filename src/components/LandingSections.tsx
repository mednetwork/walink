"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Building2,
  Check,
  ChevronDown,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Stamp,
  Star,
  UserCheck,
  X,
  Zap,
} from "lucide-react";
import type { TranslationDictionary } from "@/lib/i18n/translations";

interface LandingSectionsProps {
  t: TranslationDictionary;
  locale: "ar" | "fr" | "es";
  dir: "rtl" | "ltr";
  roiCount: number;
  setRoiCount: (val: number) => void;
  roiSpend: number;
  setRoiSpend: (val: number) => void;
  onOpenModal: (plan: "starter" | "growth" | "multi") => void;
}

export function WaveDivider({
  fill,
  flip = false,
}: {
  fill: string;
  flip?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={`relative leading-[0] ${flip ? "-mb-px" : "-mt-px"}`}
    >
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="block h-[48px] w-full md:h-[96px]"
        style={flip ? { transform: "scale(-1, 1)" } : undefined}
      >
        <path
          fill={fill}
          d="M0,64 C240,128 480,16 720,48 C960,80 1200,128 1440,72 L1440,120 L0,120 Z"
        />
      </svg>
    </div>
  );
}

export default function LandingSections({
  t,
  locale,
  dir,
  roiCount,
  setRoiCount,
  roiSpend,
  setRoiSpend,
  onOpenModal,
}: LandingSectionsProps) {
  const [roiEnrollment, setRoiEnrollment] = useState<number>(40);
  const [roiExtraVisits, setRoiExtraVisits] = useState<number>(2);
  const [branchCount, setBranchCount] = useState<number>(2);

  const l = t.landing;
  const isRtl = dir === "rtl";
  const CtaArrow = isRtl ? ArrowLeft : ArrowRight;

  // Transparent ROI computation benchmarked against 199 DH/month Growth Plan
  const enrolledCustomers = Math.round(roiCount * 30 * (roiEnrollment / 100));
  const monthlyGain = Math.round(enrolledCustomers * 0.28 * roiExtraVisits * roiSpend);
  const yearlyGain = monthlyGain * 12;
  const walinkMonthlyCost = 199;
  const netMonthlyProfit = Math.max(0, monthlyGain - walinkMonthlyCost);
  const multiBranchPrice = 199 + (branchCount - 1) * 100;

  const faqItems = [
    { q: t.faq.q1, a: t.faq.a1 },
    { q: t.faq.q2, a: t.faq.a2 },
    { q: t.faq.q3, a: t.faq.a3 },
    { q: t.faq.q4, a: t.faq.a4 },
    { q: t.faq.q5, a: t.faq.a5 },
    { q: t.faq.q6, a: t.faq.a6 },
    { q: l.faq7Q, a: l.faq7A },
    { q: l.faq8Q, a: l.faq8A },
  ];

  return (
    <>
      {/* 3. Pain vs Solution Section (#why) */}
      <section className="py-16 md:py-24" id="why">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-base font-extrabold text-[#DA5004]">{l.painEyebrow}</p>
            <h2 className="mt-2 text-3xl font-extrabold uppercase leading-tight tracking-tight text-[#161514] sm:text-5xl">
              {l.painTitle}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#161514]/65 sm:text-lg">
              {l.painSubtitle}
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-2 lg:gap-6">
            {/* Before Walink Card (Clean White) */}
            <div className="rounded-[2rem] border border-[#161514]/10 bg-white p-7 sm:p-9">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#EFEAE4] px-3.5 py-1.5 text-xs font-extrabold text-[#161514]/70">
                <X className="h-4 w-4 text-[#DA5004]" aria-hidden="true" />
                <span>{l.beforeTitle}</span>
              </div>
              <ul className="mt-6 space-y-4">
                {[l.before1, l.before2, l.before3, l.before4].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-base leading-relaxed text-[#161514]/75">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#161514]/5 text-[#161514]/45">
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* After With Walink Card (Deep Dark Ink) */}
            <div className="rounded-[2rem] bg-[#161514] p-7 text-white shadow-float sm:p-9">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#F85B04] px-3.5 py-1.5 text-xs font-extrabold text-white">
                <Check className="h-4 w-4" aria-hidden="true" />
                <span>{l.afterTitle}</span>
              </div>
              <ul className="mt-6 space-y-4">
                {[l.after1, l.after2, l.after3, l.after4].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-base leading-relaxed text-white/90">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F85B04]/20 text-[#FA7F3B]">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive ROI Calculator Section (#roi) */}
      <section className="py-16 md:py-24" id="roi">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-base font-extrabold text-[#DA5004]">{l.roiEyebrow}</p>
            <h2 className="mt-2 text-3xl font-extrabold uppercase leading-tight tracking-tight text-[#161514] sm:text-5xl">
              {l.roiTitle}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#161514]/65 sm:text-lg">
              {l.roiSubtitle}
            </p>
          </div>

          <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-12">
            {/* Sliders Card */}
            <div className="flex flex-col justify-between space-y-6 rounded-[2rem] border border-[#161514]/10 bg-white p-7 sm:p-9 lg:col-span-7">
              <div className="space-y-6">
                {/* Daily Clients */}
                <div>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <label htmlFor="roi-clients" className="text-sm font-bold text-[#161514]">
                      {l.roiClientsLabel}
                    </label>
                    <span className="rounded-xl bg-[#EFEAE4] px-3 py-1 text-base font-extrabold tabular-nums text-[#DA5004]">
                      {roiCount}
                    </span>
                  </div>
                  <input
                    id="roi-clients"
                    type="range"
                    min={5}
                    max={80}
                    step={1}
                    value={roiCount}
                    onChange={(e) => setRoiCount(Number(e.target.value))}
                    className="fidelix-range"
                  />
                </div>

                {/* Average Ticket */}
                <div>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <label htmlFor="roi-ticket" className="text-sm font-bold text-[#161514]">
                      {l.roiTicketLabel}
                    </label>
                    <span className="rounded-xl bg-[#EFEAE4] px-3 py-1 text-base font-extrabold tabular-nums text-[#DA5004]">
                      {roiSpend} DH
                    </span>
                  </div>
                  <input
                    id="roi-ticket"
                    type="range"
                    min={15}
                    max={350}
                    step={5}
                    value={roiSpend}
                    onChange={(e) => setRoiSpend(Number(e.target.value))}
                    className="fidelix-range"
                  />
                </div>

                {/* Enrollment Rate */}
                <div>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <label htmlFor="roi-enroll" className="text-sm font-bold text-[#161514]">
                      {l.roiRetentionLabel}
                    </label>
                    <span className="rounded-xl bg-[#EFEAE4] px-3 py-1 text-base font-extrabold tabular-nums text-[#DA5004]">
                      {roiEnrollment}%
                    </span>
                  </div>
                  <input
                    id="roi-enroll"
                    type="range"
                    min={20}
                    max={75}
                    step={5}
                    value={roiEnrollment}
                    onChange={(e) => setRoiEnrollment(Number(e.target.value))}
                    className="fidelix-range"
                  />
                </div>

                {/* Monthly Extra Visits */}
                <div>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <label htmlFor="roi-visits" className="text-sm font-bold text-[#161514]">
                      {l.roiLiftLabel}
                    </label>
                    <span className="rounded-xl bg-[#EFEAE4] px-3 py-1 text-base font-extrabold tabular-nums text-[#DA5004]">
                      +{roiExtraVisits}
                    </span>
                  </div>
                  <input
                    id="roi-visits"
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={roiExtraVisits}
                    onChange={(e) => setRoiExtraVisits(Number(e.target.value))}
                    className="fidelix-range"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#EFEAE4] px-4 py-3 text-xs font-bold text-[#161514]/75">
                <span>💡 {t.compare.costSavingsCallout}</span>
              </div>
            </div>

            {/* Dark ROI Results Card */}
            <div className="flex flex-col justify-between rounded-[2rem] bg-[#161514] p-7 text-white shadow-float sm:p-9 lg:col-span-5">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F85B04]/20 px-3 py-1 text-xs font-extrabold text-[#FA7F3B]">
                  <Zap className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{l.roiPaybackTag}</span>
                </span>

                <div className="mt-6">
                  <p className="text-sm font-medium text-white/65">{l.roiMonthlyGain}</p>
                  <p className="mt-1 text-4xl font-extrabold tabular-nums tracking-tight text-white sm:text-5xl">
                    +{monthlyGain.toLocaleString("en-US")}{" "}
                    <span className="text-xl text-[#FA7F3B]">DH</span>
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 border-t border-white/10 pt-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/65">{l.roiYearlyGain}</span>
                    <span className="font-extrabold tabular-nums text-white">
                      +{yearlyGain.toLocaleString("en-US")} DH
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-2 text-sm">
                    <div>
                      <span className="block text-white/65">{l.roiCostLabel}</span>
                      <span className="text-[11px] text-white/45">{l.roiCostSub}</span>
                    </div>
                    <span className="shrink-0 font-bold tabular-nums text-white/80">
                      199 DH
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 pt-3 text-base">
                    <span className="font-bold text-[#FA7F3B]">{l.roiNetMonthly}</span>
                    <span className="text-xl font-extrabold tabular-nums text-[#FA7F3B]">
                      +{netMonthlyProfit.toLocaleString("en-US")} DH
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenModal("growth")}
                className="shadow-coral-sticker mt-8 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#F85B04] px-6 py-3.5 text-base font-extrabold text-white transition hover:bg-[#E25102]"
              >
                <span>{l.roiCta}</span>
                <CtaArrow className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Mid Orange Value Band (Waves Top & Bottom) */}
      <div className="relative">
        <WaveDivider fill="#F85B04" flip />
        <section className="bg-[#F85B04] py-14 text-white md:py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <div className="max-w-3xl">
              <p className="text-base font-extrabold text-white/85">{l.midEyebrow}</p>
              <h2 className="mt-2 text-3xl font-extrabold uppercase leading-tight tracking-tight sm:text-5xl">
                {l.midTitle}
              </h2>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <div className="rounded-[2rem] bg-white/10 p-6 backdrop-blur-sm border border-white/15 sm:p-8">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#F85B04]">
                  <Bell className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-xl font-extrabold">{l.midPoint1Title}</h3>
                <p className="mt-2 text-base leading-relaxed text-white/85">
                  {l.midPoint1Desc}
                </p>
              </div>

              <div className="rounded-[2rem] bg-white/10 p-6 backdrop-blur-sm border border-white/15 sm:p-8">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#161514] text-white">
                  <MessageCircle className="h-5 w-5 text-[#FA7F3B]" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-xl font-extrabold">{l.midPoint2Title}</h3>
                <p className="mt-2 text-base leading-relaxed text-white/85">
                  {l.midPoint2Desc}
                </p>
              </div>
            </div>
          </div>
        </section>
        <WaveDivider fill="#EFEAE4" />
      </div>

      {/* 6. 3-Column Feature Showcase (#features - Matching section[6] Fidelix structure & typography) */}
      <section className="py-16 md:py-24" id="features">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-base font-extrabold text-[#DA5004]">{l.colEyebrow}</p>
            <h2 className="mt-2 text-3xl font-extrabold uppercase leading-tight tracking-tight text-[#161514] sm:text-5xl">
              {l.colTitle}
            </h2>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-3 lg:gap-5">
            {/* Column 1: Lock-Screen Notifications & Wallet */}
            <div className="h-full rounded-[2rem] border border-[#161514]/5 bg-white p-6 md:p-7">
              <p className="text-xl font-bold text-[#DA5004]">{l.col1Kicker}</p>
              <h3 className="mt-1 text-2xl font-extrabold uppercase leading-tight tracking-tight text-[#161514] sm:text-3xl">
                {l.col1Heading}
              </h3>
              <ul className="mt-5">
                {[
                  { Icon: Smartphone, title: l.col1Item1Title, desc: l.col1Item1Desc },
                  { Icon: Bell, title: l.col1Item2Title, desc: l.col1Item2Desc },
                  { Icon: MapPin, title: l.col1Item3Title, desc: l.col1Item3Desc },
                  { Icon: RefreshCw, title: l.col1Item4Title, desc: l.col1Item4Desc },
                ].map(({ Icon, title, desc }, idx) => (
                  <li
                    key={idx}
                    className="flex gap-4 border-t border-[#161514]/[0.07] py-4"
                  >
                    <Icon
                      className="mt-0.5 h-5 w-5 shrink-0 text-[#F85B04]"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-bold leading-snug text-[#161514]">{title}</p>
                      <p className="mt-1 text-[15px] leading-relaxed text-[#161514]/60">
                        {desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Counter Experience */}
            <div className="h-full rounded-[2rem] border border-[#161514]/5 bg-white p-6 md:p-7">
              <p className="text-xl font-bold text-[#DA5004]">{l.col2Kicker}</p>
              <h3 className="mt-1 text-2xl font-extrabold uppercase leading-tight tracking-tight text-[#161514] sm:text-3xl">
                {l.col2Heading}
              </h3>
              <ul className="mt-5">
                {[
                  { Icon: QrCode, title: l.col2Item1Title, desc: l.col2Item1Desc },
                  { Icon: Stamp, title: l.col2Item2Title, desc: l.col2Item2Desc },
                  { Icon: Sparkles, title: l.col2Item3Title, desc: l.col2Item3Desc },
                  { Icon: Star, title: l.col2Item4Title, desc: l.col2Item4Desc },
                ].map(({ Icon, title, desc }, idx) => (
                  <li
                    key={idx}
                    className="flex gap-4 border-t border-[#161514]/[0.07] py-4"
                  >
                    <Icon
                      className="mt-0.5 h-5 w-5 shrink-0 text-[#F85B04]"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-bold leading-snug text-[#161514]">{title}</p>
                      <p className="mt-1 text-[15px] leading-relaxed text-[#161514]/60">
                        {desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Merchant Control */}
            <div className="h-full rounded-[2rem] border border-[#161514]/5 bg-white p-6 md:p-7">
              <p className="text-xl font-bold text-[#DA5004]">{l.col3Kicker}</p>
              <h3 className="mt-1 text-2xl font-extrabold uppercase leading-tight tracking-tight text-[#161514] sm:text-3xl">
                {l.col3Heading}
              </h3>
              <ul className="mt-5">
                {[
                  { Icon: LayoutDashboard, title: l.col3Item1Title, desc: l.col3Item1Desc },
                  { Icon: UserCheck, title: l.col3Item2Title, desc: l.col3Item2Desc },
                  { Icon: Building2, title: l.col3Item3Title, desc: l.col3Item3Desc },
                  { Icon: MessageCircle, title: l.col3Item4Title, desc: l.col3Item4Desc },
                ].map(({ Icon, title, desc }, idx) => (
                  <li
                    key={idx}
                    className="flex gap-4 border-t border-[#161514]/[0.07] py-4"
                  >
                    <Icon
                      className="mt-0.5 h-5 w-5 shrink-0 text-[#F85B04]"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-bold leading-snug text-[#161514]">{title}</p>
                      <p className="mt-1 text-[15px] leading-relaxed text-[#161514]/60">
                        {desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. 3 Steps Section (#steps) */}
      <section className="py-12 md:py-20" id="steps">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-base font-extrabold text-[#DA5004]">{l.stepsEyebrow}</p>
            <h2 className="mt-2 text-3xl font-extrabold uppercase leading-tight tracking-tight text-[#161514] sm:text-5xl">
              {l.stepsTitle}
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { num: "01", title: l.step1Title, desc: l.step1Desc },
              { num: "02", title: l.step2Title, desc: l.step2Desc },
              { num: "03", title: l.step3Title, desc: l.step3Desc },
            ].map((step) => (
              <div
                key={step.num}
                className="rounded-[2rem] border border-[#161514]/5 bg-white p-7"
              >
                <span className="text-4xl font-extrabold tabular-nums text-[#F85B04]">
                  {step.num}
                </span>
                <h3 className="mt-4 text-xl font-extrabold text-[#161514]">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#161514]/65">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Dark Ink Retention Stats Band */}
      <div className="relative">
        <WaveDivider fill="#161514" flip />
        <section className="bg-[#161514] py-16 text-white md:py-24">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-base font-extrabold text-[#FA7F3B]">{l.statsEyebrow}</p>
              <h2 className="mt-2 text-3xl font-extrabold uppercase leading-tight tracking-tight sm:text-5xl">
                {l.statsTitle}
              </h2>
              <p className="mt-4 text-base text-white/65 sm:text-lg">{l.statsSubtitle}</p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { val: l.stat1Val, label: l.stat1Label, source: l.stat1Source },
                { val: l.stat2Val, label: l.stat2Label, source: l.stat2Source },
                { val: l.stat3Val, label: l.stat3Label, source: l.stat3Source },
                { val: l.stat4Val, label: l.stat4Label, source: l.stat4Source },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6"
                >
                  <p className="text-4xl font-extrabold tabular-nums text-[#F85B04]">
                    {stat.val}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-white/85">{stat.label}</p>
                  <p className="mt-4 text-xs font-semibold text-white/45">{stat.source}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <WaveDivider fill="#EFEAE4" />
      </div>

      {/* 9. Merchant Testimonials (3 + 2 Grid) */}
      <section className="py-16 md:py-24" id="testimonials">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-base font-extrabold text-[#DA5004]">{l.testiEyebrow}</p>
            <h2 className="mt-2 text-3xl font-extrabold uppercase leading-tight tracking-tight text-[#161514] sm:text-5xl">
              {l.testiTitle}
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { q: l.testi1Quote, a: l.testi1Author, r: l.testi1Role },
              { q: l.testi2Quote, a: l.testi2Author, r: l.testi2Role },
              { q: l.testi3Quote, a: l.testi3Author, r: l.testi3Role },
            ].map((item, idx) => (
              <blockquote
                key={idx}
                className="flex flex-col justify-between rounded-[2rem] border border-[#161514]/5 bg-white p-6 sm:p-7"
              >
                <p className="text-base leading-relaxed text-[#161514]/80">
                  “{item.q}”
                </p>
                <footer className="mt-5 border-t border-[#161514]/[0.07] pt-4">
                  <p className="font-extrabold text-[#161514]">{item.a}</p>
                  <p className="text-xs font-semibold text-[#DA5004]">{item.r}</p>
                </footer>
              </blockquote>
            ))}
          </div>

          <div className="mx-auto mt-5 grid max-w-4xl gap-5 md:grid-cols-2">
            {[
              { q: l.testi4Quote, a: l.testi4Author, r: l.testi4Role },
              { q: l.testi5Quote, a: l.testi5Author, r: l.testi5Role },
            ].map((item, idx) => (
              <blockquote
                key={idx}
                className="flex flex-col justify-between rounded-[2rem] border border-[#161514]/5 bg-white p-6 sm:p-7"
              >
                <p className="text-base leading-relaxed text-[#161514]/80">
                  “{item.q}”
                </p>
                <footer className="mt-5 border-t border-[#161514]/[0.07] pt-4">
                  <p className="font-extrabold text-[#161514]">{item.a}</p>
                  <p className="text-xs font-semibold text-[#DA5004]">{item.r}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Real Walink Monthly Pricing (#pricing) */}
      <section className="py-16 md:py-24" id="pricing">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-base font-extrabold text-[#DA5004]">{l.pricingEyebrow}</p>
            <h2 className="mt-2 text-3xl font-extrabold uppercase leading-tight tracking-tight text-[#161514] sm:text-5xl">
              {t.pricing.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#161514]/65 sm:text-lg">
              {l.pricingSetupTag}
            </p>
          </div>

          <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
            {/* Starter Plan: 149 DH/mo */}
            <div className="flex flex-col justify-between rounded-[2rem] border border-[#161514]/10 bg-white p-7 sm:p-8">
              <div>
                <h3 className="text-xl font-extrabold text-[#161514]">
                  {t.pricing.starterTitle}
                </h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold tabular-nums text-[#161514]">
                    149
                  </span>
                  <span className="text-sm font-bold text-[#161514]/60">
                    {l.pricingUnit}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#161514]/65">
                  {t.pricing.starterDesc}
                </p>

                <ul className="mt-6 space-y-3 border-t border-[#161514]/10 pt-6 text-sm">
                  <li className="flex items-start gap-2.5 text-[#161514]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#F85B04]" aria-hidden="true" />
                    <span>{t.pricing.featureStand}</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-[#161514]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#F85B04]" aria-hidden="true" />
                    <span>{t.pricing.featureCards}</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-[#161514]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#F85B04]" aria-hidden="true" />
                    <span>{t.pricing.featureCredits500}</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-[#161514]/45 line-through">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-[#161514]/35" aria-hidden="true" />
                    <span>{t.pricing.featureRadar}</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-[#161514]/45 line-through">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-[#161514]/35" aria-hidden="true" />
                    <span>{t.pricing.featureReviews}</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => onOpenModal("starter")}
                className="mt-8 inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-[#161514] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#2A2826]"
              >
                {t.pricing.orderStarterBtn}
              </button>
            </div>

            {/* Highlighted Growth Plan: 199 DH/mo (Full Coral Card) */}
            <div className="relative flex flex-col justify-between rounded-[2rem] bg-[#F85B04] p-7 text-white shadow-float sm:p-8">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xl font-extrabold text-white">
                    {t.pricing.growthTitle}
                  </h3>
                  <span className="shadow-sticker rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[#161514]">
                    {t.pricing.popularBadge}
                  </span>
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold tabular-nums text-white">
                    199
                  </span>
                  <span className="text-sm font-bold text-white/80">
                    {l.pricingUnit}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/90">
                  {t.pricing.growthDesc}
                </p>

                <ul className="mt-6 space-y-3 border-t border-white/20 pt-6 text-sm">
                  {[
                    t.pricing.featureRadar,
                    t.pricing.featureReviews,
                    t.engines.winbackTitle,
                    t.pricing.featureCredits1000,
                    t.pricing.featureStand,
                  ].map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-white">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-white" aria-hidden="true" />
                      <span className="font-medium">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => onOpenModal("growth")}
                className="shadow-sticker mt-8 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#161514] px-5 py-3.5 text-base font-extrabold text-white transition hover:bg-[#2A2826]"
              >
                <span>{t.pricing.orderGrowthBtn}</span>
                <CtaArrow className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Interactive Multi-Branch Plan: 199 + (branches - 1) * 100 DH/mo */}
            <div className="flex flex-col justify-between rounded-[2rem] border border-[#161514]/10 bg-white p-7 sm:p-8">
              <div>
                <h3 className="text-xl font-extrabold text-[#161514]">
                  {t.pricing.multiTitle}
                </h3>

                {/* Interactive Branch Counter (- / +) */}
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#EFEAE4] px-3.5 py-2.5">
                  <span className="text-xs font-extrabold text-[#161514]">
                    {l.pricingBranchCountLabel}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBranchCount((prev) => Math.max(2, prev - 1))}
                      aria-label={locale === "fr" ? "Diminuer succursales" : locale === "es" ? "Reducir sucursales" : "إنقاص الفروع"}
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#161514] shadow-sm transition hover:bg-[#161514] hover:text-white"
                    >
                      <Minus className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <span className="min-w-[2.2rem] text-center text-lg font-extrabold tabular-nums text-[#DA5004]">
                      {branchCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setBranchCount((prev) => Math.min(20, prev + 1))}
                      aria-label={locale === "fr" ? "Ajouter succursale" : locale === "es" ? "Añadir sucursal" : "إضافة فرع"}
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#161514] shadow-sm transition hover:bg-[#161514] hover:text-white"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold tabular-nums text-[#161514]">
                    {multiBranchPrice}
                  </span>
                  <span className="text-sm font-bold text-[#161514]/60">
                    {l.pricingUnit}
                  </span>
                </div>
                <p className="mt-2 text-xs font-bold text-[#DA5004]">
                  {l.pricingBranchCalcNote}
                </p>

                <ul className="mt-6 space-y-3 border-t border-[#161514]/10 pt-6 text-sm">
                  <li className="flex items-start gap-2.5 text-[#161514]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#F85B04]" aria-hidden="true" />
                    <span>{t.pricing.featureMultiBranches}</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-[#161514]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#F85B04]" aria-hidden="true" />
                    <span>{t.pricing.featureDedicatedSupport}</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-[#161514]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#F85B04]" aria-hidden="true" />
                    <span>{t.pricing.featureRadar}</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => onOpenModal("multi")}
                className="mt-8 inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-[#161514] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#2A2826]"
              >
                {t.pricing.orderMultiBtn}
              </button>
            </div>
          </div>

          {/* 50/50 Payment & Guarantees Cards */}
          <div className="mt-8 grid gap-5 md:grid-cols-2" id="payment">
            <div className="flex items-start gap-4 rounded-[2rem] border border-[#161514]/10 bg-white p-6 sm:p-7">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F85B04]/10 text-[#F85B04]">
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#161514]">
                  {t.payment.termsTitle}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#161514]/70">
                  {t.payment.termsDesc}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-[2rem] border border-[#161514]/10 bg-white p-6 sm:p-7">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#161514] text-[#FA7F3B]">
                <Star className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#161514]">
                  {t.payment.guaranteeTitle}
                </h3>
                <ul className="mt-2 space-y-1.5 text-sm text-[#161514]/75">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-[#F85B04]" aria-hidden="true" />
                    <span>{t.payment.g1}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-[#F85B04]" aria-hidden="true" />
                    <span>{t.payment.g2}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-[#F85B04]" aria-hidden="true" />
                    <span>{t.payment.g3}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FAQ Accordion (#faq) */}
      <section className="py-16 md:py-24" id="faq">
        <div className="mx-auto max-w-3xl px-5 sm:px-6">
          <div className="text-center">
            <p className="text-base font-extrabold text-[#DA5004]">{l.faqEyebrow}</p>
            <h2 className="mt-2 text-3xl font-extrabold uppercase leading-tight tracking-tight text-[#161514] sm:text-5xl">
              {t.faq.title}
            </h2>
          </div>

          <div className="mt-10 space-y-3">
            {faqItems.map((item, idx) => (
              <details
                key={idx}
                open={idx === 0}
                className="group rounded-[1.5rem] border border-[#161514]/10 bg-white px-6 py-4 transition"
              >
                <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 font-bold text-[#161514]">
                  <span className="text-base">{item.q}</span>
                  <ChevronDown
                    className="h-5 w-5 shrink-0 text-[#F85B04] transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="mt-3 border-t border-[#161514]/[0.06] pt-3 text-[15px] leading-relaxed text-[#161514]/70">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 12. Final Coral CTA Wave Band */}
      <div className="relative">
        <WaveDivider fill="#F85B04" flip />
        <section className="bg-[#F85B04] py-16 text-center text-white md:py-24">
          <div className="mx-auto max-w-3xl px-5 sm:px-6">
            <h2 className="text-3xl font-extrabold uppercase leading-tight tracking-tight sm:text-5xl">
              {t.finalCta.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/90 sm:text-lg">
              {t.finalCta.desc}
            </p>
            <div className="mt-8 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => onOpenModal("growth")}
                className="shadow-sticker inline-flex min-h-[54px] items-center justify-center gap-2 rounded-2xl bg-[#161514] px-8 py-4 text-base font-extrabold text-white transition hover:bg-[#2A2826]"
              >
                <span>{t.finalCta.btn}</span>
                <CtaArrow className="h-5 w-5" aria-hidden="true" />
              </button>
              <p className="text-xs font-bold text-white/80">{l.finalBtnSub}</p>
            </div>
          </div>
        </section>
        <WaveDivider fill="#161514" />
      </div>
    </>
  );
}
