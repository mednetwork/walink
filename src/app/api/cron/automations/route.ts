import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  dispatchBatchLockScreenPushes,
  type UnifiedPushJob,
} from "@/lib/push-dispatcher";
import { formatBillingMonth } from "@/lib/pricing";
import { chunkArray } from "@/lib/utils";

const BULK_INSERT_CHUNK_SIZE = 250;

export async function GET(req: NextRequest) {
  return handleCron(req);
}

export async function POST(req: NextRequest) {
  return handleCron(req);
}

async function handleCron(req: NextRequest) {
  try {
    let merchantId: string | undefined;
    let forceDemo = false;

    if (req.method === "POST") {
      try {
        const body = await req.json();
        merchantId = body.merchantId;
        forceDemo = Boolean(body.forceDemo);
      } catch {
        // empty body ok
      }
    } else {
      const { searchParams } = new URL(req.url);
      merchantId = searchParams.get("merchantId") || undefined;
      forceDemo = searchParams.get("forceDemo") === "true";
    }

    const whereClause: { isActive: boolean; id?: string } = { isActive: true };
    if (merchantId) {
      whereClause.id = merchantId;
    }

    const merchants = await prisma.merchant.findMany({
      where: whereClause,
      include: {
        customers: true,
      },
    });

    const executionLog: Array<{
      merchantName: string;
      merchantSlug: string;
      winbacks: number;
      nearRewards: number;
      creditsDeducted: number;
    }> = [];

    let totalWinbacks = 0;
    let totalNearRewards = 0;
    let totalCreditsDeducted = 0;

    const now = new Date();
    const billingMonth = formatBillingMonth(now);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const notificationsToCreate: Array<{
      merchantId: string;
      customerId: string;
      type: string;
      title: string;
      body: string;
      actionUrl: string;
    }> = [];

    const pointUsagesToCreate: Array<{
      merchantId: string;
      points: number;
      source: string;
      billingMonth: string;
    }> = [];

    const campaignsToCreate: Array<{
      merchantId: string;
      title: string;
      message: string;
      audience: string;
      sentCount: number;
      creditsUsed: number;
    }> = [];

    const walletPushJobs: UnifiedPushJob[] = [];
    const notifiedCustomerIds = new Set<string>();

    for (const merchant of merchants) {
      let merchantWinbacks = 0;
      let merchantNearRewards = 0;

      // -------------------------------------------------------------
      // 1. 15-Day Win-Back Engine (autoWinback)
      // -------------------------------------------------------------
      if (merchant.autoWinback) {
        let quietCustomers = merchant.customers.filter(
          (c) => new Date(c.lastVisitAt) <= fourteenDaysAgo
        );

        // If forceDemo is requested and no natural inactive customers exist, pick oldest visitor
        if (quietCustomers.length === 0 && forceDemo && merchant.customers.length > 0) {
          const sorted = [...merchant.customers].sort(
            (a, b) => new Date(a.lastVisitAt).getTime() - new Date(b.lastVisitAt).getTime()
          );
          quietCustomers = [sorted[0]];
        }

        for (const customer of quietCustomers) {
          const notifTitle = "توحشناك! 🎁";
          const notifBody = `توحشناك ${merchant.customerPrefix} ${customer.name}! هادي كثر من 15 يوم ما بانتيش عندنا في ${merchant.name}. دوز هاد السيمانة وعندك طابع هدية 🎁`;

          notificationsToCreate.push({
            merchantId: merchant.id,
            customerId: customer.id,
            type: "WINBACK",
            title: notifTitle,
            body: notifBody,
            actionUrl: `/pass/${customer.passSerial}`,
          });

          notifiedCustomerIds.add(customer.id);
          walletPushJobs.push({
            customer,
            merchant,
            title: notifTitle,
            body: notifBody,
            tag: `winback-${merchant.id}`,
          });

          merchantWinbacks++;
        }

        if (merchantWinbacks > 0) {
          pointUsagesToCreate.push({
            merchantId: merchant.id,
            points: merchantWinbacks,
            source: "WINBACK",
            billingMonth,
          });

          campaignsToCreate.push({
            merchantId: merchant.id,
            title: "أوتوماتيك: استرجاع الزبناء الغابرين (Win-Back)",
            message: `تم إرسال دعوة استرجاع إلى ${merchantWinbacks} زبون غائب منذ أكثر من 14 يوماً.`,
            audience: "QUIET",
            sentCount: merchantWinbacks,
            creditsUsed: merchantWinbacks,
          });
        }
      }

      // -------------------------------------------------------------
      // 2. Near-Reward Nudge Engine (autoNearReward) - Free 0 Credits
      // -------------------------------------------------------------
      if (merchant.autoNearReward) {
        let nearCustomers = merchant.customers.filter(
          (c) =>
            c.stamps >= merchant.stampsRequired - 1 &&
            c.stamps < merchant.stampsRequired
        );

        if (nearCustomers.length === 0 && forceDemo && merchant.customers.length > 0) {
          nearCustomers = [merchant.customers[0]];
        }

        for (const customer of nearCustomers) {
          const nearTitle = `${merchant.name} • باقي ليك غير طابع واحد! ☕`;
          const nearBody = `باقي ليك غير طابع واحد على ${merchant.rewardName} فـ ${merchant.name}! دوز كمل الكارط ديالك اليوم.`;
          notificationsToCreate.push({
            merchantId: merchant.id,
            customerId: customer.id,
            type: "NEAR_REWARD",
            title: nearTitle,
            body: nearBody,
            actionUrl: `/pass/${customer.passSerial}`,
          });

          notifiedCustomerIds.add(customer.id);
          walletPushJobs.push({
            customer,
            merchant,
            title: nearTitle,
            body: nearBody,
            tag: `near-${merchant.id}`,
          });

          merchantNearRewards++;
        }
      }

      totalWinbacks += merchantWinbacks;
      totalNearRewards += merchantNearRewards;
      totalCreditsDeducted += merchantWinbacks;

      executionLog.push({
        merchantName: merchant.name,
        merchantSlug: merchant.slug,
        winbacks: merchantWinbacks,
        nearRewards: merchantNearRewards,
        creditsDeducted: merchantWinbacks,
      });
    }

    // Batch-persist all DB records in chunked transactions instead of 2N sequential queries
    if (
      notificationsToCreate.length > 0 ||
      pointUsagesToCreate.length > 0 ||
      campaignsToCreate.length > 0
    ) {
      const updatedCustomerIdList = Array.from(notifiedCustomerIds);
      await prisma.$transaction(async (tx) => {
        for (const notifChunk of chunkArray(notificationsToCreate, BULK_INSERT_CHUNK_SIZE)) {
          await tx.notification.createMany({ data: notifChunk });
        }
        for (const idChunk of chunkArray(updatedCustomerIdList, BULK_INSERT_CHUNK_SIZE)) {
          await tx.customer.updateMany({
            where: { id: { in: idChunk } },
            data: { updatedAt: now },
          });
        }
        if (pointUsagesToCreate.length > 0) {
          await tx.pointUsage.createMany({ data: pointUsagesToCreate });
        }
        if (campaignsToCreate.length > 0) {
          await tx.campaign.createMany({ data: campaignsToCreate });
        }
      });
    }

    // Dispatch Google Wallet, Apple Wallet APNs & Web Push strictly post-commit
    if (walletPushJobs.length > 0) {
      await dispatchBatchLockScreenPushes(walletPushJobs, 10);
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      merchantsProcessed: merchants.length,
      stats: {
        winbacksSent: totalWinbacks,
        nearRewardsSent: totalNearRewards,
        totalNotifications: totalWinbacks + totalNearRewards,
        creditsDeducted: totalCreditsDeducted,
      },
      log: executionLog,
    });
  } catch (error: unknown) {
    console.error("Cron automation error:", error);
    const msg = error instanceof Error ? error.message : "خطأ أثناء تشغيل محرك الأتمتة";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
