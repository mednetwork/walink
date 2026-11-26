import { NextRequest, NextResponse } from "next/server";
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

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const session = await getStoreSessionFromCookies(req.cookies, slug);

    if (!session) {
      return NextResponse.json(
        { error: "غير مصرح بالوصول، يرجى تسجيل الدخول برمز PIN" },
        { status: 401 }
      );
    }

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

    if (!merchant) {
      return NextResponse.json(
        { error: "المحل التجاري غير موجود" },
        { status: 404 }
      );
    }

    const now = new Date();
    const effectiveBranches = resolveEffectiveBranches(merchant);
    const { branches: scopedBranches, matchedBranch } = filterBranchesForSession(
      effectiveBranches,
      session
    );

    const currentBillingMonth = formatBillingMonth(now);
    const [allTransactionsForMetrics, pointAgg] = await Promise.all([
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
      session.role === "OWNER"
        ? prisma.pointUsage.aggregate({
            where: {
              merchantId: merchant.id,
              billingMonth: currentBillingMonth,
            },
            _sum: { points: true },
          })
        : Promise.resolve(null),
    ]);

    const computedMetrics = computeMerchantMetrics({
      customers: merchant.customers,
      transactions: allTransactionsForMetrics,
      branches: effectiveBranches,
      stampsRequired: merchant.stampsRequired,
      now,
    });

    const finalMetrics =
      session.role === "BRANCH_STAFF" && matchedBranch
        ? scopeMetricsToBranch(computedMetrics, matchedBranch, now)
        : computedMetrics;

    const scopedTransactions =
      session.role === "BRANCH_STAFF" && matchedBranch
        ? merchant.transactions.filter(
            (tx) => tx.branchName && tx.branchName.trim() === matchedBranch.name.trim()
          )
        : merchant.transactions;

    const monthlyPointsUsed = pointAgg?._sum.points ?? 0;

    return NextResponse.json({
      merchant: {
        id: merchant.id,
        name: merchant.name,
        slug: merchant.slug,
        niche: merchant.niche,
        city: merchant.city,
        phone: merchant.phone,
        pinCode: "",
        logoIcon: merchant.logoIcon,
        primaryColor: merchant.primaryColor,
        bgGradient: merchant.bgGradient,
        stampsRequired: merchant.stampsRequired,
        rewardName: merchant.rewardName,
        customerPrefix: merchant.customerPrefix,
        loyaltyMode: merchant.loyaltyMode,
        cashbackRate: merchant.cashbackRate,
        welcomeCashback: merchant.welcomeCashback,
        minCashbackRedeem: merchant.minCashbackRedeem,
        currency: merchant.currency,
        latitude: merchant.latitude,
        longitude: merchant.longitude,
        radarMessage: merchant.radarMessage,
        googleMapsUrl: merchant.googleMapsUrl,
        promoTemplates: merchant.promoTemplates || "[]",
        plan: merchant.plan,
        maxBranches: merchant.maxBranches ?? (merchant.plan === "MULTI" ? 3 : 1),
        branches: JSON.stringify(scopedBranches),
        credits: merchant.credits,
        monthlyPointsUsed,
        autoWinback: merchant.autoWinback,
        autoReview: merchant.autoReview,
        autoRadar: merchant.autoRadar,
        autoNearReward: merchant.autoNearReward,
        allowMultiStamps: Boolean(merchant.allowMultiStamps),
        isActive: merchant.isActive,
      },
      customers: merchant.customers,
      transactions: scopedTransactions,
      campaigns: session.role === "OWNER" ? merchant.campaigns : [],
      metrics: finalMetrics,
    });
  } catch (error: unknown) {
    console.error("Error fetching merchant mobile data:", error);
    const msg = error instanceof Error ? error.message : "تعذر جلب بيانات المحل";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

