import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertCircle, ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";
import CustomerPassHubClient from "@/components/CustomerPassHubClient";

interface PassPageProps {
  params: {
    serial: string;
  };
}

export async function generateMetadata({
  params,
}: PassPageProps): Promise<Metadata> {
  const { serial } = params;

  const customer = await prisma.customer.findUnique({
    where: { passSerial: serial },
    select: {
      name: true,
      memberCode: true,
      merchant: {
        select: { name: true, city: true, rewardName: true },
      },
    },
  });

  if (!customer) {
    return {
      title: "بطاقة الوفاء غير موجودة | Walink",
    };
  }

  return {
    title: `بطاقة ${customer.name} - ${customer.merchant.name} (${customer.merchant.city}) | Walink`,
    description: `بطاقة الوفاء الرقمية الخاصة بـ ${customer.name} في ${customer.merchant.name}. كود العضوية #${customer.memberCode}.`,
    manifest: `/api/pass/${serial}/manifest`,
    appleWebApp: {
      capable: true,
      title: customer.merchant.name,
      statusBarStyle: "black-translucent",
    },
  };
}

export default async function CustomerPassPage({ params }: PassPageProps) {
  const { serial } = params;

  const customer = await prisma.customer.findUnique({
    where: { passSerial: serial },
    include: {
      merchant: true,
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!customer) {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md glass-panel p-8 rounded-3xl text-center space-y-4 border border-white/10">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 mx-auto flex items-center justify-center">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-white">بطاقة الوفاء غير موجودة</h1>
          <p className="text-xs text-white/60 leading-relaxed">
            تعذر العثور على بطاقة الوفاء المطلوبة. تأكد من صحة الرابط أو قم بالتسجيل من جديد.
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

  // Fetch latest campaign for this merchant created on or after customer joined
  const latestCampaign = await prisma.campaign.findFirst({
    where: {
      merchantId: customer.merchantId,
      createdAt: { gte: customer.createdAt },
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch latest notifications for this customer or merchant broadcast created on or after customer joined
  const notifications = await prisma.notification.findMany({
    where: {
      merchantId: customer.merchantId,
      OR: [
        { customerId: customer.id },
        { customerId: null, createdAt: { gte: customer.createdAt } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Serialize dates for Client Component
  const serializedCustomer = {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    memberCode: customer.memberCode,
    passSerial: customer.passSerial,
    loyaltyType: customer.loyaltyType === "CASHBACK" ? ("CASHBACK" as const) : ("STAMPS" as const),
    stamps: customer.stamps,
    cashbackBalance: customer.cashbackBalance,
    totalCashbackEarned: customer.totalCashbackEarned,
    totalSpent: customer.totalSpent,
    totalVisits: customer.totalVisits,
    rewardsRedeemed: customer.rewardsRedeemed,
    createdAt: customer.createdAt.toISOString(),
    lastVisitAt: customer.lastVisitAt.toISOString(),
    walletType: customer.walletType,
    pushSubscription: customer.pushSubscription,
    isActivated: customer.isActivated ?? true,
    referredByCode: customer.referredByCode,
    securityPin: customer.securityPin || customer.memberCode,
  };

  const serializedMerchant = {
    id: customer.merchant.id,
    name: customer.merchant.name,
    slug: customer.merchant.slug,
    niche: customer.merchant.niche,
    city: customer.merchant.city,
    primaryColor: customer.merchant.primaryColor,
    bgGradient: customer.merchant.bgGradient,
    stampsRequired: customer.merchant.stampsRequired,
    rewardName: customer.merchant.rewardName,
    customerPrefix: customer.merchant.customerPrefix,
    loyaltyMode: customer.merchant.loyaltyMode,
    cashbackRate: customer.merchant.cashbackRate,
    welcomeCashback: customer.merchant.welcomeCashback,
    minCashbackRedeem: customer.merchant.minCashbackRedeem,
    currency: customer.merchant.currency,
    latitude: customer.merchant.latitude,
    longitude: customer.merchant.longitude,
    radarMessage: customer.merchant.radarMessage,
    googleMapsUrl: customer.merchant.googleMapsUrl,
    autoReview: customer.merchant.autoReview,
    autoRadar: customer.merchant.autoRadar,
    autoWinback: customer.merchant.autoWinback,
  };

  const serializedTransactions = customer.transactions.map((tx) => ({
    id: tx.id,
    type: tx.type,
    stampsDelta: tx.stampsDelta,
    billAmount: tx.billAmount,
    cashbackDelta: tx.cashbackDelta,
    note: tx.note,
    createdAt: tx.createdAt.toISOString(),
  }));

  const serializedCampaign = latestCampaign
    ? {
        id: latestCampaign.id,
        title: latestCampaign.title,
        message: latestCampaign.message,
        createdAt: latestCampaign.createdAt.toISOString(),
      }
    : null;

  const serializedNotifications = notifications.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    actionUrl: n.actionUrl,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <CustomerPassHubClient
      initialCustomer={serializedCustomer}
      initialMerchant={serializedMerchant}
      initialTransactions={serializedTransactions}
      initialCampaign={serializedCampaign}
      initialNotifications={serializedNotifications}
    />
  );
}

