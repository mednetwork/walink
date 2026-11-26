import prisma from "@/lib/prisma";
import {
  INSTALLATION_FEE_MAD,
  computeMonthlySubscriptionFee,
  computePointsFee,
  formatBillingMonth,
  normalizeBillingMonth,
  normalizeMerchantPlan,
} from "@/lib/pricing";

export interface BillingRowDto {
  merchantId: string;
  slug: string;
  name: string;
  city: string;
  phone: string | null;
  isActive: boolean;
  month: string;
  createdMonth: string;
  isFirstMonth: boolean;
  plan: string;
  maxBranches: number;
  subscriptionFee: number;
  installationFee: number;
  pointsUsed: number;
  pointsFee: number;
  totalAmount: number;
  status: "PAID" | "UNPAID";
  paidAt: string | null;
  notes: string | null;
}

export interface BillingSummaryDto {
  totalBilled: number;
  totalPaid: number;
  totalUnpaid: number;
  totalPointsUsed: number;
  paidCount: number;
  unpaidCount: number;
}

/**
 * Computes billing month summary across all eligible merchants for the requested month (YYYY-MM).
 */
export async function buildBillingRows(rawMonth?: string | null): Promise<{
  month: string;
  rows: BillingRowDto[];
  summary: BillingSummaryDto;
}> {
  const month = normalizeBillingMonth(rawMonth);

  const [merchants, pointGroups, existingInvoices] = await Promise.all([
    prisma.merchant.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        name: true,
        city: true,
        phone: true,
        plan: true,
        maxBranches: true,
        isActive: true,
        createdAt: true,
      },
    }),
    prisma.pointUsage.groupBy({
      by: ["merchantId"],
      where: { billingMonth: month },
      _sum: { points: true },
    }),
    prisma.merchantInvoice.findMany({
      where: { month },
    }),
  ]);

  const pointsByMerchant = new Map<string, number>();
  for (const grp of pointGroups) {
    pointsByMerchant.set(grp.merchantId, grp._sum.points ?? 0);
  }

  const invoiceByMerchant = new Map(
    existingInvoices.map((inv) => [inv.merchantId, inv])
  );

  const rows: BillingRowDto[] = [];

  for (const m of merchants) {
    const createdMonth = formatBillingMonth(m.createdAt);
    if (createdMonth > month) {
      continue;
    }

    const isFirstMonth = createdMonth === month;
    const savedInv = invoiceByMerchant.get(m.id);

    if (savedInv && savedInv.status === "PAID") {
      rows.push({
        merchantId: m.id,
        slug: m.slug,
        name: m.name,
        city: m.city,
        phone: m.phone,
        isActive: m.isActive,
        month,
        createdMonth,
        isFirstMonth,
        plan: savedInv.planSnapshot,
        maxBranches: savedInv.branchesSnapshot,
        subscriptionFee: savedInv.subscriptionFee,
        installationFee: savedInv.installationFee,
        pointsUsed: savedInv.pointsUsed,
        pointsFee: savedInv.pointsFee,
        totalAmount: savedInv.totalAmount,
        status: "PAID",
        paidAt: savedInv.paidAt ? savedInv.paidAt.toISOString() : null,
        notes: savedInv.notes || null,
      });
      continue;
    }

    const safeBranches = Math.max(1, m.maxBranches || 1);
    const normalizedPlan = normalizeMerchantPlan(m.plan, safeBranches);
    const subscriptionFee = computeMonthlySubscriptionFee(normalizedPlan, safeBranches);
    const installationFee =
      savedInv !== undefined
        ? savedInv.installationFee
        : isFirstMonth
        ? INSTALLATION_FEE_MAD
        : 0;
    const pointsUsed = pointsByMerchant.get(m.id) ?? 0;
    const pointsFee = computePointsFee(pointsUsed);
    const totalAmount = Number(
      (subscriptionFee + installationFee + pointsFee).toFixed(2)
    );

    rows.push({
      merchantId: m.id,
      slug: m.slug,
      name: m.name,
      city: m.city,
      phone: m.phone,
      isActive: m.isActive,
      month,
      createdMonth,
      isFirstMonth,
      plan: normalizedPlan,
      maxBranches: normalizedPlan === "MULTI" ? Math.max(2, safeBranches) : 1,
      subscriptionFee,
      installationFee,
      pointsUsed,
      pointsFee,
      totalAmount,
      status: "UNPAID",
      paidAt: null,
      notes: savedInv?.notes || null,
    });
  }

  let totalBilled = 0;
  let totalPaid = 0;
  let totalUnpaid = 0;
  let totalPointsUsed = 0;
  let paidCount = 0;
  let unpaidCount = 0;

  for (const r of rows) {
    totalBilled += r.totalAmount;
    totalPointsUsed += r.pointsUsed;
    if (r.status === "PAID") {
      totalPaid += r.totalAmount;
      paidCount++;
    } else {
      totalUnpaid += r.totalAmount;
      unpaidCount++;
    }
  }

  return {
    month,
    rows,
    summary: {
      totalBilled: Number(totalBilled.toFixed(2)),
      totalPaid: Number(totalPaid.toFixed(2)),
      totalUnpaid: Number(totalUnpaid.toFixed(2)),
      totalPointsUsed,
      paidCount,
      unpaidCount,
    },
  };
}
