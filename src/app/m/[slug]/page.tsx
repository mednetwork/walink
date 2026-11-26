import React from "react";
import { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { AlertTriangle } from "lucide-react";
import prisma from "@/lib/prisma";
import { getStoreSessionFromCookies } from "@/lib/auth";
import {
  filterBranchesForSession,
  resolveEffectiveBranches,
} from "@/lib/branches";
import {
  computeMerchantMetrics,
  scopeMetricsToBranch,
} from "@/lib/metrics";
import { formatBillingMonth } from "@/lib/pricing";
import MerchantDashboardClient from "@/components/MerchantDashboardClient";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#075E54",
};

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
    manifest: `/api/m/${slug}/manifest`,
    appleWebApp: {
      capable: true,
      title: merchant.name,
      statusBarStyle: "black-translucent",
    },
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
        take: 25,
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
      <div className="min-h-screen bg-[#FAF7F2] text-[#173E30] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#FFFDF7] p-8 rounded-3xl text-center space-y-4 border border-[#DCE0D4] shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-[#173E30]">المحل غير متاح</h1>
          <p className="text-xs text-[#5F655D] leading-relaxed">
            عذراً، هذا المحل التجاري غير مفعل أو أن الرابط غير صحيح.
          </p>
        </div>
      </div>
    );
  }

  const now = new Date();

  // Resolve store session from HttpOnly signed cookie (Zero PIN leakage in SSR)
  const session = await getStoreSessionFromCookies(cookies(), slug);
  const effectiveBranches = resolveEffectiveBranches(merchant);
  const hasBranchPins = effectiveBranches.some((b) =>
    Boolean(b.pinCode && String(b.pinCode).trim())
  );
  const { branches: scopedBranches, matchedBranch } = filterBranchesForSession(
    effectiveBranches,
    session
  );

  const isSessionValid =
    Boolean(session) &&
    (session?.role !== "BRANCH_STAFF" || Boolean(matchedBranch));

  const sessionRole =
    isSessionValid && session ? session.role : ("OWNER" as const);

  const currentBillingMonth = formatBillingMonth(now);

  // Authoritative server-side metrics & billing point aggregation executed in parallel (only when authenticated)
  const [allTransactionsForMetrics, pointUsageAgg] = isSessionValid
    ? await Promise.all([
        prisma.transaction.findMany({
          where: { merchantId: merchant.id },
          select: {
            id: true,
            customerId: true,
            type: true,
            branchName: true,
            staffName: true,
            note: true,
            createdAt: true,
          },
        }),
        sessionRole === "OWNER"
          ? prisma.pointUsage.aggregate({
              where: {
                merchantId: merchant.id,
                billingMonth: currentBillingMonth,
              },
              _sum: { points: true },
            })
          : Promise.resolve(null),
      ])
    : [[], null];

  const computedMetrics = isSessionValid
    ? computeMerchantMetrics({
        customers: merchant.customers,
        transactions: allTransactionsForMetrics,
        branches: effectiveBranches,
        stampsRequired: merchant.stampsRequired,
        now,
      })
    : {
        totalVisits: 0,
        returningCustomers: 0,
        totalRewards: 0,
        weeklyVisits: [],
        audienceCounts: { all: 0, quiet: 0, near: 0, vip: 0 },
        byBranch: {},
      };

  const finalMetrics =
    isSessionValid && session?.role === "BRANCH_STAFF" && matchedBranch
      ? scopeMetricsToBranch(computedMetrics, matchedBranch, now)
      : computedMetrics;

  const monthlyPointsUsed = pointUsageAgg?._sum.points ?? 0;

  // Serialize dates for Client Component (never send raw owner PIN or unauthorized data)
  const serializedMerchant = {
    id: merchant.id,
    name: merchant.name,
    slug: merchant.slug,
    niche: merchant.niche,
    city: merchant.city,
    pinCode: "",
    hasBranchPins,
    primaryColor: merchant.primaryColor,
    bgGradient: merchant.bgGradient,
    stampsRequired: merchant.stampsRequired,
    rewardName: merchant.rewardName,
    customerPrefix: merchant.customerPrefix,
    plan: merchant.plan,
    maxBranches: merchant.maxBranches ?? (merchant.plan === "MULTI" ? 3 : 1),
    credits: merchant.credits,
    monthlyPointsUsed,
    loyaltyMode: merchant.loyaltyMode,
    cashbackRate: merchant.cashbackRate,
    welcomeCashback: merchant.welcomeCashback,
    minCashbackRedeem: merchant.minCashbackRedeem,
    currency: merchant.currency,
    latitude: merchant.latitude ?? 33.5731,
    longitude: merchant.longitude ?? -7.5898,
    googleMapsUrl: merchant.googleMapsUrl || "",
    radarMessage: merchant.radarMessage || "أنت بالقرب منا! تفضل بزيارتنا وبطاقتك جاهزة.",
    promoTemplates: isSessionValid ? merchant.promoTemplates || "[]" : "[]",
    branches: isSessionValid ? JSON.stringify(scopedBranches) : "[]",
    staffMembers: "[]",
    autoWinback: merchant.autoWinback,
    autoReview: merchant.autoReview,
    autoRadar: merchant.autoRadar,
    autoNearReward: merchant.autoNearReward,
  };

  const serializedCustomers = isSessionValid
    ? merchant.customers.map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        memberCode: c.memberCode,
        passSerial: c.passSerial,
        loyaltyType:
          c.loyaltyType === "CASHBACK"
            ? ("CASHBACK" as const)
            : ("STAMPS" as const),
        stamps: c.stamps,
        cashbackBalance: c.cashbackBalance,
        totalCashbackEarned: c.totalCashbackEarned,
        totalSpent: c.totalSpent,
        totalVisits: c.totalVisits,
        rewardsRedeemed: c.rewardsRedeemed,
        securityPin: c.securityPin || c.memberCode,
        failedPinAttempts: c.failedPinAttempts || 0,
        pinLockedUntil: c.pinLockedUntil ? c.pinLockedUntil.toISOString() : null,
        lastVisitAt: c.lastVisitAt.toISOString(),
      }))
    : [];

  const scopedRawTransactions =
    isSessionValid && session?.role === "BRANCH_STAFF" && matchedBranch
      ? merchant.transactions.filter(
          (tx) =>
            tx.branchName &&
            tx.branchName.trim() === matchedBranch.name.trim()
        )
      : merchant.transactions;

  const serializedTransactions = isSessionValid
    ? scopedRawTransactions.map((tx) => ({
        id: tx.id,
        type: tx.type,
        stampsDelta: tx.stampsDelta,
        branchName: tx.branchName || null,
        note: tx.note,
        createdAt: tx.createdAt.toISOString(),
        customer: {
          id: tx.customer.id,
          name: tx.customer.name,
          memberCode: tx.customer.memberCode,
          phone: tx.customer.phone,
        },
      }))
    : [];

  const serializedCampaigns =
    isSessionValid && session?.role === "OWNER"
      ? merchant.campaigns.map((camp) => ({
          id: camp.id,
          title: camp.title,
          message: camp.message,
          audience: camp.audience,
          sentCount: camp.sentCount,
          creditsUsed: camp.creditsUsed,
          returnedCount: camp.returnedCount,
          createdAt: camp.createdAt.toISOString(),
        }))
      : [];

  return (
    <MerchantDashboardClient
      initialMerchant={serializedMerchant}
      initialAuthSession={{
        authenticated: isSessionValid,
        role: sessionRole,
        branch: matchedBranch,
        staffName: isSessionValid ? session?.staffName || null : null,
      }}
      initialCustomers={serializedCustomers}
      initialTransactions={serializedTransactions}
      initialCampaigns={serializedCampaigns}
      initialMetrics={finalMetrics}
    />
  );
}
