import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Store, AlertTriangle, ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";
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
  const merchant = await prisma.merchant.findUnique({
    where: { slug },
    select: { name: true, city: true, rewardName: true },
  });

  if (!merchant) {
    return {
      title: "المحل غير موجود | Walink",
    };
  }

  return {
    title: `كارط الوفاء - ${merchant.name} (${merchant.city}) | Walink`,
    description: `سجل دابا فـ بطاقة الوفاء ديال ${merchant.name} وخود مكافأة ${merchant.rewardName}. بدون أي تطبيق!`,
  };
}

export default async function CustomerJoinPage({ params }: JoinPageProps) {
  const { slug } = params;

  const merchant = await prisma.merchant.findUnique({
    where: { slug },
    select: {
      name: true,
      slug: true,
      niche: true,
      city: true,
      logoIcon: true,
      primaryColor: true,
      bgGradient: true,
      stampsRequired: true,
      rewardName: true,
      customerPrefix: true,
      isActive: true,
    },
  });

  if (!merchant || !merchant.isActive) {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md glass-panel p-8 rounded-3xl text-center space-y-4 border border-white/10">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-white">المحل غير متاح حالياً</h1>
          <p className="text-xs text-white/60 leading-relaxed">
            عذراً، هذا المحل التجاري غير مفعل أو أن الرابط غير صحيح.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة للرئيسية</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <JoinFormClient merchant={merchant} />;
}
