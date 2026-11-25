import type { StoredBranchItem } from "@/lib/branches";

export interface WeeklyVisitDay {
  dateKey: string; // YYYY-MM-DD
  label: string;
  visits: number;
  isToday: boolean;
}

export interface BranchLiveMetric {
  branchId: string;
  branchName: string;
  visits: number;
  returningCustomers: number;
  rewards: number;
  weeklyVisits: WeeklyVisitDay[];
}

export interface ComputedMerchantMetrics {
  totalVisits: number;
  returningCustomers: number;
  totalRewards: number;
  weeklyVisits: WeeklyVisitDay[];
  audienceCounts: {
    all: number;
    quiet: number;
    near: number;
    vip: number;
  };
  byBranch: Record<string, BranchLiveMetric>;
}

export interface MetricCustomerRow {
  id: string;
  stamps: number;
  totalVisits: number;
  rewardsRedeemed: number;
  lastVisitAt: Date;
}

export interface MetricTransactionRow {
  id: string;
  customerId: string;
  type: string;
  branchName: string | null;
  staffName: string | null;
  note: string | null;
  createdAt: Date;
}

const ARABIC_SHORT_DAYS = ["أحد", "إثن", "ثلا", "أرب", "خمي", "جمع", "سبت"];

function formatUtcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Determines whether a transaction represents an actual physical counter visit
 * (STAMP_ADDED or CASHBACK_EARNED), excluding onboarding CARD_CREATED and
 * automated referral bonus credits.
 */
export function isPhysicalCounterVisit(tx: {
  type: string;
  staffName?: string | null;
  note?: string | null;
}): boolean {
  if (tx.type !== "STAMP_ADDED" && tx.type !== "CASHBACK_EARNED") {
    return false;
  }
  if (tx.staffName === "النظام") {
    return false;
  }
  const lowerNote = (tx.note || "").toLowerCase();
  if (
    lowerNote.includes("مكافأة إحالة") ||
    lowerNote.includes("مكافأة زيارة وتفعيل صديقك") ||
    lowerNote.includes("referral")
  ) {
    return false;
  }
  return true;
}

export function isRewardRedemptionTx(tx: { type: string }): boolean {
  return tx.type === "REWARD_REDEEMED" || tx.type === "CASHBACK_REDEEMED";
}

function buildEmptyWeek(now: Date): WeeklyVisitDay[] {
  const days: WeeklyVisitDay[] = [];
  for (let offset = 6; offset >= 0; offset--) {
    const d = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - offset)
    );
    days.push({
      dateKey: formatUtcDateKey(d),
      label: ARABIC_SHORT_DAYS[d.getUTCDay()],
      visits: 0,
      isToday: offset === 0,
    });
  }
  return days;
}

/**
 * Authoritative server-side metrics calculator for both global store view and
 * isolated multi-branch dashboards. Never attributes null-branch transactions to
 * a specific branch, preventing zero-visit branches from showing phantom visits.
 */
export function computeMerchantMetrics(params: {
  customers: MetricCustomerRow[];
  transactions: MetricTransactionRow[];
  branches: StoredBranchItem[];
  stampsRequired: number;
  now?: Date;
}): ComputedMerchantMetrics {
  const { customers, transactions, branches, stampsRequired, now = new Date() } = params;
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  let quietCount = 0;
  let nearCount = 0;
  let vipCount = 0;

  for (const c of customers) {
    if (new Date(c.lastVisitAt) <= fourteenDaysAgo) quietCount++;
    if (c.stamps === stampsRequired - 1) nearCount++;
    if (c.totalVisits >= 10) vipCount++;
  }

  const globalWeekly = buildEmptyWeek(now);
  const globalWeekIndex = new Map<string, WeeklyVisitDay>(
    globalWeekly.map((d) => [d.dateKey, d])
  );

  const globalReturningSet = new Set<string>();
  let totalVisits = 0;
  let totalRewards = 0;

  // Prepare per-branch accumulators keyed by normalized trimmed branch name
  const branchAccumulators = new Map<
    string,
    {
      canonicalName: string;
      branchId: string;
      visits: number;
      rewards: number;
      returningCustomers: Set<string>;
      weekly: WeeklyVisitDay[];
      weekIndex: Map<string, WeeklyVisitDay>;
    }
  >();

  for (const b of branches) {
    const trimmed = b.name.trim();
    if (!trimmed || branchAccumulators.has(trimmed)) continue;
    const weekly = buildEmptyWeek(now);
    branchAccumulators.set(trimmed, {
      canonicalName: b.name,
      branchId: b.id,
      visits: 0,
      rewards: 0,
      returningCustomers: new Set<string>(),
      weekly,
      weekIndex: new Map(weekly.map((d) => [d.dateKey, d])),
    });
  }

  for (const tx of transactions) {
    const physicalVisit = isPhysicalCounterVisit(tx);
    const rewardTx = isRewardRedemptionTx(tx);
    const txBranchKey = tx.branchName ? tx.branchName.trim() : "";
    const branchAcc = txBranchKey ? branchAccumulators.get(txBranchKey) : undefined;
    const txDateKey = formatUtcDateKey(new Date(tx.createdAt));

    if (physicalVisit) {
      totalVisits += 1;
      globalReturningSet.add(tx.customerId);
      const gDay = globalWeekIndex.get(txDateKey);
      if (gDay) gDay.visits += 1;

      if (branchAcc) {
        branchAcc.visits += 1;
        branchAcc.returningCustomers.add(tx.customerId);
        const bDay = branchAcc.weekIndex.get(txDateKey);
        if (bDay) bDay.visits += 1;
      }
    }

    if (rewardTx) {
      totalRewards += 1;
      if (branchAcc) {
        branchAcc.rewards += 1;
      }
    }
  }

  const byBranch: Record<string, BranchLiveMetric> = {};
  branchAccumulators.forEach((acc) => {
    byBranch[acc.canonicalName] = {
      branchId: acc.branchId,
      branchName: acc.canonicalName,
      visits: acc.visits,
      returningCustomers: acc.returningCustomers.size,
      rewards: acc.rewards,
      weeklyVisits: acc.weekly,
    };
  });

  return {
    totalVisits,
    returningCustomers: globalReturningSet.size,
    totalRewards,
    weeklyVisits: globalWeekly,
    audienceCounts: {
      all: customers.length,
      quiet: quietCount,
      near: nearCount,
      vip: vipCount,
    },
    byBranch,
  };
}

/**
 * Scope ComputedMerchantMetrics strictly to a single branch when serving a
 * BRANCH_STAFF session.
 */
export function scopeMetricsToBranch(
  metrics: ComputedMerchantMetrics,
  branch: StoredBranchItem,
  now: Date = new Date()
): ComputedMerchantMetrics {
  const bMetric = metrics.byBranch[branch.name] || {
    branchId: branch.id,
    branchName: branch.name,
    visits: 0,
    returningCustomers: 0,
    rewards: 0,
    weeklyVisits: buildEmptyWeek(now),
  };

  return {
    totalVisits: bMetric.visits,
    returningCustomers: bMetric.returningCustomers,
    totalRewards: bMetric.rewards,
    weeklyVisits: bMetric.weeklyVisits,
    audienceCounts: metrics.audienceCounts,
    byBranch: {
      [branch.name]: bMetric,
    },
  };
}
