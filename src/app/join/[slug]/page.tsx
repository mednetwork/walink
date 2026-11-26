import React from "react";
import { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import { getCachedMerchantPublicBySlug } from "@/lib/cache";
import JoinFormClient from "@/components/JoinFormClient";

interface JoinPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: JoinPageProps): Promise<Metadata> {
  const { slug } = params;
  const merchant = await getCachedMerchantPublicBySlug(slug);

  if (!merchant) {
    return {
      title: "المحل غير موجود | Walink",
    };
  }

  return {
    title: `بطاقة الولاء - ${merchant.name} (${merchant.city}) | Walink`,
    description: `سجّل الآن في بطاقة الولاء الخاصة بـ ${merchant.name} واحصل على مكافأة ${merchant.rewardName}. بدون تطبيق!`,
  };
}

export default async function CustomerJoinPage({ params }: JoinPageProps) {
  const { slug } = params;

  const merchant = await getCachedMerchantPublicBySlug(slug);

  if (!merchant || !merchant.isActive) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-[#173E30] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#FFFDF7] p-8 rounded-3xl text-center space-y-4 border border-[#DCE0D4] shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-[#173E30]">المحل غير متاح حالياً</h1>
          <p className="text-xs text-[#5F655D] leading-relaxed">
            عذراً، هذا المحل التجاري غير مفعل أو أن الرابط غير صحيح.
          </p>
        </div>
      </div>
    );
  }

  return <JoinFormClient merchant={merchant} />;
}
