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
      className="min-h-screen bg-[#FAF7F2] text-[#173E30] flex flex-col justify-between p-4 sm:p-6 selection:bg-[#008069] selection:text-white"
    >
      <div className="my-auto w-full max-w-[430px] mx-auto bg-[#FFFDF7] rounded-3xl p-6 sm:p-8 border border-[#DCE0D4] shadow-sm text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00A884] to-[#008069] text-white mx-auto flex items-center justify-center shadow-md shadow-[#008069]/20">
          <QrCode className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F5E9] border border-[#A7F3D0] text-[#008069] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {isRegistered
                ? "جاهز للتفعيل عند التاجر"
                : "رمز الستاند غير مسجل بعد"}
            </span>
          </div>

          <h1 className="text-xl font-extrabold text-[#173E30]">
            {isRegistered
              ? "ستاند الكاونتر الرقمي جاهز للربط"
              : "تعذر العثور على هذا الستاند"}
          </h1>

          <p className="text-xs text-[#5F655D] leading-relaxed">
            {isRegistered
              ? "هذا الستاند مهيأ لبطاقات الولاء الرقمية على Apple Wallet و Google Wallet. بمجرد ربطه بالمتجر سيوجه الزبائن تلقائياً لصفحة التسجيل."
              : "يرجى التأكد من صحة رمز الستاند المطبوع أو مسح الكود بشكل واضح."}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#DCE0D4] space-y-1">
          <span className="text-[11px] font-semibold text-[#5F655D] block">
            الرقم التسلسلي للستاند
          </span>
          <span
            dir="ltr"
            className="text-xl font-mono font-extrabold tracking-widest text-[#008069] block"
          >
            {normalizedCode}
          </span>
        </div>

        <p className="text-[11px] text-[#5F655D] leading-relaxed">
          {isRegistered
            ? "لمسؤولي المبيعات: قم بربط هذا الكود بمتجر العميل من لوحة الإدارة ليصبح نشطاً فوراً دون إعادة طباعة."
            : "رمز التعريف الممسوح غير موجود في قاعدة البيانات الحالية."}
        </p>
      </div>

      <footer className="py-4 text-center space-y-1.5 text-[11px] text-[#5F655D] font-medium">
        <div className="flex items-center justify-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-[#008069]" />
          <span>نظام الولاء الذكي • Apple Wallet &amp; Google Wallet</span>
        </div>
      </footer>
    </div>
  );
}
