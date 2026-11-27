import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { QrCode, Sparkles, Lock } from "lucide-react";
import prisma from "@/lib/prisma";
import { getCachedStandByCode } from "@/lib/cache";

export const dynamic = "force-dynamic";

interface StandPageProps {
  params: {
    code: string;
  };
}

export async function generateMetadata({
  params,
}: StandPageProps): Promise<Metadata> {
  const normalizedCode = decodeURIComponent(params.code || "").trim().toUpperCase();
  const stand = await getCachedStandByCode(normalizedCode);

  if (stand?.merchantName && stand.merchantIsActive) {
    return {
      title: `بطاقة الولاء - ${stand.merchantName} | Walink`,
      description: `سجّل الآن في بطاقة الولاء الرقمية الخاصة بـ ${stand.merchantName}.`,
    };
  }

  return {
    title: `ستاند الكاونتر الرقمي (${normalizedCode}) | Walink`,
    description: "بطاقة ستاند الوفاء الذكية الجاهزة للتفعيل.",
  };
}

export default async function StandRedirectPage({ params }: StandPageProps) {
  const normalizedCode = decodeURIComponent(params.code || "").trim().toUpperCase();

  if (!normalizedCode) {
    redirect("/");
  }

  const stand = await getCachedStandByCode(normalizedCode);

  if (stand && stand.merchantSlug && stand.merchantIsActive) {
    // Non-blocking scan telemetry so customer redirect latency stays minimal
    prisma.qrStand
      .update({
        where: { code: normalizedCode },
        data: {
          scanCount: { increment: 1 },
          lastScannedAt: new Date(),
        },
      })
      .catch((err) => console.warn("[QrStand] scan telemetry error:", err));

    redirect(`/join/${encodeURIComponent(stand.merchantSlug)}`);
  }

  const isRegistered = Boolean(stand);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#EFEAE4] text-[#161514] flex flex-col justify-between p-4 sm:p-6 selection:bg-[#F85B04] selection:text-white"
    >
      <div className="my-auto w-full max-w-[430px] mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-[#161514]/10 shadow-sm text-center space-y-5">
        <div className="relative w-16 h-16 mx-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-mark.png"
            alt="Digital Loyalty Pass"
            width={64}
            height={64}
            className="w-16 h-16 rounded-2xl object-contain shadow-[0_4px_0_#C14703]"
          />
          <span className="absolute -bottom-1.5 -end-1.5 w-7 h-7 rounded-xl bg-[#161514] text-white flex items-center justify-center border-2 border-white shadow-sm">
            <QrCode className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
        </div>

        <div className="space-y-2">
          <div className="font-script inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F85B04]/10 border border-[#F85B04]/25 text-[#DA5004] text-base font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {isRegistered
                ? "جاهز للتفعيل عند التاجر"
                : "رمز الستاند غير مسجل بعد"}
            </span>
          </div>

          <h1 className="text-xl font-extrabold text-[#161514]">
            {isRegistered
              ? "ستاند الكاونتر الرقمي جاهز للربط"
              : "تعذر العثور على هذا الستاند"}
          </h1>

          <p className="text-xs text-[#161514]/65 leading-relaxed">
            {isRegistered
              ? "هذا الستاند مهيأ لبطاقات الولاء الرقمية على Apple Wallet و Google Wallet. بمجرد ربطه بالمتجر سيوجه الزبائن تلقائياً لصفحة التسجيل."
              : "يرجى التأكد من صحة رمز الستاند المطبوع أو مسح الكود بشكل واضح."}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#EFEAE4] border border-[#161514]/10 space-y-1">
          <span className="text-[11px] font-semibold text-[#161514]/65 block">
            الرقم التسلسلي للستاند
          </span>
          <span
            dir="ltr"
            className="text-xl font-mono font-extrabold tracking-widest text-[#DA5004] tabular-nums block"
          >
            {normalizedCode}
          </span>
        </div>

        <p className="text-[11px] text-[#161514]/60 leading-relaxed">
          {isRegistered
            ? "لمسؤولي المبيعات: قم بربط هذا الكود بمتجر العميل من لوحة الإدارة ليصبح نشطاً فوراً دون إعادة طباعة."
            : "رمز التعريف الممسوح غير موجود في قاعدة البيانات الحالية."}
        </p>
      </div>

      <footer className="py-4 text-center space-y-1.5 text-[11px] text-[#161514]/60 font-medium">
        <div className="flex items-center justify-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-[#F85B04]" />
          <span>نظام الولاء الذكي • Apple Wallet &amp; Google Wallet</span>
        </div>
      </footer>
    </div>
  );
}
