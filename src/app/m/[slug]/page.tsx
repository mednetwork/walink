import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Store, AlertTriangle, ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";
import MerchantDashboardClient from "@/components/MerchantDashboardClient";

interface MerchantPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: MerchantPageProps): Promise<Metadata> {
  const { slug } = params;
  const merchant = await prisma.merchant.findUnique({
    where: { slug },
    select: { name: true, city: true },
  });

  if (!merchant) {
    return {
      title: "المحل غير موجود | Walink",
    };
  }

  return {
    title: `لوحة التاجر - ${merchant.name} (${merchant.city}) | Walink`,
    description: `لوحة التحكم السريعة للتاجر، ماسح الكاميرا لطبع الطوابع وإرسال العروض الترويجية.`,
  };
}

export default async function MerchantDashboardPage({ params }: MerchantPageProps) {
  const { slug } = params;

  const merchant = await prisma.merchant.findUnique({
    where: { slug },
    include: {
      customers: {
        orderBy: { lastVisitAt: "desc" },
      },
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 15,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              memberCode: true,
              passSerial: true,
            },
          },
        },
      },
      campaigns: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!merchant || !merchant.isActive) {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md glass-panel p-8 rounded-3xl text-center space-y-4 border border-white/10">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-white">المحل غير متاح</h1>
          <p className="text-xs text-white/60 leading-relaxed">
            عذراً، هذا المحل التجاري غير مفعل أو أن الرابط غير صحيح.
          </p>
          <div className="pt-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة للوحة السوبر أدمن</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  let totalVisits = 0;
  let returningCustomers = 0;
  let totalRewards = 0;
  let quietCount = 0;
  let nearCount = 0;
  let vipCount = 0;

  for (const c of merchant.customers) {
    totalVisits += c.totalVisits;
    totalRewards += c.rewardsRedeemed;

    if (c.totalVisits > 1) returningCustomers++;
    if (new Date(c.lastVisitAt) <= fourteenDaysAgo) quietCount++;
    if (c.stamps === merchant.stampsRequired - 1) nearCount++;
    if (c.totalVisits >= 10) vipCount++;
  }

  // Serialize dates for Client Component
  const serializedMerchant = {
    id: merchant.id,
    name: merchant.name,
    slug: merchant.slug,
    niche: merchant.niche,
    city: merchant.city,
    pinCode: merchant.pinCode,
    primaryColor: merchant.primaryColor,
    bgGradient: merchant.bgGradient,
    stampsRequired: merchant.stampsRequired,
    rewardName: merchant.rewardName,
    customerPrefix: merchant.customerPrefix,
    plan: merchant.plan,
    credits: merchant.credits,
    loyaltyMode: merchant.loyaltyMode,
    cashbackRate: merchant.cashbackRate,
    welcomeCashback: merchant.welcomeCashback,
    minCashbackRedeem: merchant.minCashbackRedeem,
    currency: merchant.currency,
    autoWinback: merchant.autoWinback,
    autoBirthday: merchant.autoBirthday,
    autoReview: merchant.autoReview,
    autoRadar: merchant.autoRadar,
    autoNearReward: merchant.autoNearReward,
  };

  const serializedCustomers = merchant.customers.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    memberCode: c.memberCode,
    passSerial: c.passSerial,
    loyaltyType: c.loyaltyType === "CASHBACK" ? ("CASHBACK" as const) : ("STAMPS" as const),
    stamps: c.stamps,
    cashbackBalance: c.cashbackBalance,
    totalCashbackEarned: c.totalCashbackEarned,
    totalSpent: c.totalSpent,
    totalVisits: c.totalVisits,
    rewardsRedeemed: c.rewardsRedeemed,
    lastVisitAt: c.lastVisitAt.toISOString(),
  }));

  const serializedTransactions = merchant.transactions.map((tx) => ({
    id: tx.id,
    type: tx.type,
    stampsDelta: tx.stampsDelta,
    note: tx.note,
    createdAt: tx.createdAt.toISOString(),
    customer: {
      id: tx.customer.id,
      name: tx.customer.name,
      memberCode: tx.customer.memberCode,
      phone: tx.customer.phone,
    },
  }));

  const serializedCampaigns = merchant.campaigns.map((camp) => ({
    id: camp.id,
    title: camp.title,
    message: camp.message,
    audience: camp.audience,
    sentCount: camp.sentCount,
    creditsUsed: camp.creditsUsed,
    returnedCount: camp.returnedCount,
    createdAt: camp.createdAt.toISOString(),
  }));

  return (
    <MerchantDashboardClient
      initialMerchant={serializedMerchant}
      initialCustomers={serializedCustomers}
      initialTransactions={serializedTransactions}
      initialCampaigns={serializedCampaigns}
      initialMetrics={{
        totalVisits,
        returningCustomers,
        totalRewards,
        audienceCounts: {
          all: merchant.customers.length,
          quiet: quietCount,
          near: nearCount,
          vip: vipCount,
        },
      }}
    />
  );
}
