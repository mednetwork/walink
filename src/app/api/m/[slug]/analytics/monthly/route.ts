import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export interface BranchMonthlyStat {
  branchName: string;
  city?: string;
  isMain: boolean;
  visits: number;
  visitsShare: number;
  rewardsRedeemed: number;
  billAmount: number;
  cashbackDistributed: number;
}

export interface MonthAnalyticsSummary {
  monthKey: string; // YYYY-MM
  year: number;
  monthNumber: number; // 1-12
  isCurrentMonth: boolean;
  combined: {
    totalVisits: number;
    newCustomers: number;
    rewardsRedeemed: number;
    totalBillAmount: number;
    cashbackDistributed: number;
    growthVsPrevMonth: number; // % vs previous calendar month
  };
  branches: BranchMonthlyStat[];
}

export interface MonthlyAnalyticsResponse {
  success: boolean;
  isMultiBranch: boolean;
  merchant: {
    id: string;
    name: string;
    slug: string;
    currency: string;
    loyaltyMode: string;
  };
  branches: Array<{
    id: string;
    name: string;
    city?: string;
    isMain: boolean;
  }>;
  months: MonthAnalyticsSummary[];
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const merchant = await prisma.merchant.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        plan: true,
        currency: true,
        loyaltyMode: true,
        branches: true,
        createdAt: true,
      },
    });

    if (!merchant) {
      return NextResponse.json(
        { error: "المتجر غير موجود" },
        { status: 404 }
      );
    }

    // 1. Resolve Configured Branches & Default Main Branch
    interface RawBranch {
      id?: string;
      name?: string;
      city?: string;
      isMain?: boolean;
    }

    let parsedBranches: RawBranch[] = [];
    if (merchant.branches) {
      try {
        const parsed = JSON.parse(merchant.branches);
        if (Array.isArray(parsed)) parsedBranches = parsed;
      } catch {
        parsedBranches = [];
      }
    }

    const defaultMainBranchName = `الفرع الرئيسي (${merchant.city || "الدار البيضاء"})`;
    const resolvedBranches: Array<{
      id: string;
      name: string;
      city?: string;
      isMain: boolean;
    }> = [];

    if (parsedBranches.length > 0) {
      for (const b of parsedBranches) {
        if (b.name && b.name.trim()) {
          resolvedBranches.push({
            id: b.id || `br_${resolvedBranches.length}`,
            name: b.name.trim(),
            city: b.city || merchant.city || "",
            isMain: Boolean(b.isMain || resolvedBranches.length === 0),
          });
        }
      }
    }

    if (resolvedBranches.length === 0) {
      resolvedBranches.push({
        id: "br_main",
        name: defaultMainBranchName,
        city: merchant.city || "",
        isMain: true,
      });
    }

    // Ensure at least one branch is marked isMain
    if (!resolvedBranches.some((b) => b.isMain)) {
      resolvedBranches[0].isMain = true;
    }

    const mainBranch = resolvedBranches.find((b) => b.isMain) || resolvedBranches[0];
    const isMultiBranch = merchant.plan === "MULTI" && resolvedBranches.length > 1;

    // 2. Generate Calendar Month Timeline (at least 6-12 months, ordered newest first)
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const currentMonth = now.getUTCMonth(); // 0-indexed

    // Check oldest activity to determine start month
    const oldestTx = await prisma.transaction.findFirst({
      where: { merchantId: merchant.id },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    });

    let monthsToGenerate = 6;
    if (oldestTx?.createdAt) {
      const oldestYear = oldestTx.createdAt.getUTCFullYear();
      const oldestMonth = oldestTx.createdAt.getUTCMonth();
      const diffMonths = (currentYear - oldestYear) * 12 + (currentMonth - oldestMonth) + 1;
      monthsToGenerate = Math.max(6, Math.min(24, diffMonths));
    }

    const monthKeys: string[] = [];
    for (let i = 0; i < monthsToGenerate; i++) {
      const d = new Date(Date.UTC(currentYear, currentMonth - i, 1));
      const y = d.getUTCFullYear();
      const m = d.getUTCMonth() + 1;
      monthKeys.push(`${y}-${m < 10 ? `0${m}` : m}`);
    }

    const earliestMonthKey = monthKeys[monthKeys.length - 1];
    const [eYear, eMonth] = earliestMonthKey.split("-").map(Number);
    const startDate = new Date(Date.UTC(eYear, eMonth - 1, 1, 0, 0, 0, 0));

    // 3. Query Transactions & Customers within the timeline
    const [transactions, customers] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          merchantId: merchant.id,
          createdAt: { gte: startDate },
        },
        select: {
          id: true,
          type: true,
          stampsDelta: true,
          billAmount: true,
          cashbackDelta: true,
          branchName: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.customer.findMany({
        where: {
          merchantId: merchant.id,
          createdAt: { gte: startDate },
        },
        select: {
          id: true,
          createdAt: true,
        },
      }),
    ]);

    // 4. Data Bucket Structures
    interface MonthBucket {
      visits: number;
      newCustomers: number;
      rewards: number;
      billAmount: number;
      cashbackDistributed: number;
      branchMap: Map<
        string,
        {
          visits: number;
          rewards: number;
          billAmount: number;
          cashbackDistributed: number;
        }
      >;
    }

    const buckets = new Map<string, MonthBucket>();

    for (const key of monthKeys) {
      const bMap = new Map();
      for (const b of resolvedBranches) {
        bMap.set(b.name, {
          visits: 0,
          rewards: 0,
          billAmount: 0,
          cashbackDistributed: 0,
        });
      }
      buckets.set(key, {
        visits: 0,
        newCustomers: 0,
        rewards: 0,
        billAmount: 0,
        cashbackDistributed: 0,
        branchMap: bMap,
      });
    }

    // Process Customers (New customer signups per month)
    for (const c of customers) {
      const key = c.createdAt.toISOString().slice(0, 7);
      const bucket = buckets.get(key);
      if (bucket) {
        bucket.newCustomers += 1;
      }
    }

    // Process Transactions
    for (const tx of transactions) {
      const key = tx.createdAt.toISOString().slice(0, 7);
      const bucket = buckets.get(key);
      if (!bucket) continue;

      const isVisit = tx.type === "STAMP_ADDED" || tx.type === "CASHBACK_EARNED";
      const isReward = tx.type === "REWARD_REDEEMED" || tx.type === "CASHBACK_REDEEMED";
      const bill = tx.billAmount ? Number(tx.billAmount) : 0;
      const cashbackDist = tx.cashbackDelta && tx.cashbackDelta > 0 ? Number(tx.cashbackDelta) : 0;

      if (isVisit) bucket.visits += 1;
      if (isReward) bucket.rewards += 1;
      bucket.billAmount += bill;
      bucket.cashbackDistributed += cashbackDist;

      // CRITICAL DETAIL 1: Multi-Branch Attribution Fallback
      // When branchName is null, empty, or unassigned, attribute strictly to the Main Branch
      let targetBranchName = mainBranch.name;
      if (tx.branchName && tx.branchName.trim()) {
        const trimmed = tx.branchName.trim();
        if (bucket.branchMap.has(trimmed)) {
          targetBranchName = trimmed;
        }
      }

      const branchStat = bucket.branchMap.get(targetBranchName);
      if (branchStat) {
        if (isVisit) branchStat.visits += 1;
        if (isReward) branchStat.rewards += 1;
        branchStat.billAmount += bill;
        branchStat.cashbackDistributed += cashbackDist;
      }
    }

    // 5. Construct Final Month Summaries & Compute Safe Growth Rate
    const currentMonthKey = `${currentYear}-${currentMonth + 1 < 10 ? `0${currentMonth + 1}` : currentMonth + 1}`;
    const months: MonthAnalyticsSummary[] = [];

    for (let i = 0; i < monthKeys.length; i++) {
      const key = monthKeys[i];
      const bucket = buckets.get(key);
      if (!bucket) continue;
      const [y, m] = key.split("-").map(Number);

      // Safe growth comparison vs previous calendar month (which is at index i + 1)
      let growthVsPrevMonth = 0;
      if (i + 1 < monthKeys.length) {
        const prevKey = monthKeys[i + 1];
        const prevBucket = buckets.get(prevKey);
        if (prevBucket) {
          const prevVisits = prevBucket.visits;
          const currVisits = bucket.visits;
          if (prevVisits > 0) {
            growthVsPrevMonth = Math.round(((currVisits - prevVisits) / prevVisits) * 100);
          } else if (currVisits > 0) {
            growthVsPrevMonth = 100;
          } else {
            growthVsPrevMonth = 0;
          }
        }
      }

      // Format branch breakdown for this month
      const branchStats: BranchMonthlyStat[] = resolvedBranches.map((b) => {
        const stat = bucket.branchMap.get(b.name) || {
          visits: 0,
          rewards: 0,
          billAmount: 0,
          cashbackDistributed: 0,
        };
        const visitsShare =
          bucket.visits > 0
            ? Math.round((stat.visits / bucket.visits) * 1000) / 10
            : resolvedBranches.length > 0 && b.isMain
            ? 100
            : 0;

        return {
          branchName: b.name,
          city: b.city,
          isMain: b.isMain,
          visits: stat.visits,
          visitsShare,
          rewardsRedeemed: stat.rewards,
          billAmount: Math.round(stat.billAmount * 100) / 100,
          cashbackDistributed: Math.round(stat.cashbackDistributed * 100) / 100,
        };
      });

      months.push({
        monthKey: key,
        year: y,
        monthNumber: m,
        isCurrentMonth: key === currentMonthKey,
        combined: {
          totalVisits: bucket.visits,
          newCustomers: bucket.newCustomers,
          rewardsRedeemed: bucket.rewards,
          totalBillAmount: Math.round(bucket.billAmount * 100) / 100,
          cashbackDistributed: Math.round(bucket.cashbackDistributed * 100) / 100,
          growthVsPrevMonth,
        },
        branches: branchStats,
      });
    }

    const responseData: MonthlyAnalyticsResponse = {
      success: true,
      isMultiBranch,
      merchant: {
        id: merchant.id,
        name: merchant.name,
        slug: merchant.slug,
        currency: merchant.currency || "DH",
        loyaltyMode: merchant.loyaltyMode || "STAMPS",
      },
      branches: resolvedBranches,
      months,
    };

    return NextResponse.json(responseData);
  } catch (err: unknown) {
    console.error("[Monthly Analytics API Error]:", err);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب التحليلات الشهرية" },
      { status: 500 }
    );
  }
}
