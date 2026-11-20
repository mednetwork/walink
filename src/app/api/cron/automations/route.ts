import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { pushGoogleWalletUpdate } from "@/lib/google-wallet";

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

    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    for (const merchant of merchants) {
      let merchantWinbacks = 0;
      let merchantNearRewards = 0;
      let merchantCreditsUsed = 0;

      // -------------------------------------------------------------
      // 1. 15-Day Win-Back Engine (autoWinback)
      // -------------------------------------------------------------
      if (merchant.autoWinback) {
        let quietCustomers = merchant.customers.filter(
          (c) => new Date(c.lastVisitAt) <= fourteenDaysAgo
        );

        // If forceDemo is requested and no natural inactive customers exist, take the oldest visit customer
        if (quietCustomers.length === 0 && forceDemo && merchant.customers.length > 0) {
          const sorted = [...merchant.customers].sort(
            (a, b) => new Date(a.lastVisitAt).getTime() - new Date(b.lastVisitAt).getTime()
          );
          quietCustomers = [sorted[0]];
        }

        for (const customer of quietCustomers) {
          // Check if merchant has available credits
          const currentMerchant = await prisma.merchant.findUnique({
            where: { id: merchant.id },
            select: { credits: true },
          });

          if (!currentMerchant || currentMerchant.credits < 1) {
            break; // No credits left for win-back broadcast
          }

          // Create Notification
          const notif = await prisma.notification.create({
            data: {
              merchantId: merchant.id,
              customerId: customer.id,
              type: "WINBACK",
              title: "توحشناك! 🎁",
              body: `توحشناك ${merchant.customerPrefix} ${customer.name}! هادي كثر من 15 يوم ما بانتيش عندنا في ${merchant.name}. دوز هاد السيمانة وعندك طابع هدية 🎁`,
              actionUrl: `/pass/${customer.passSerial}`,
            },
          });

          // Push to Google Wallet
          pushGoogleWalletUpdate(
            customer,
            merchant,
            notif.title,
            notif.body
          ).catch(() => {});

          // Deduct 1 credit
          await prisma.merchant.update({
            where: { id: merchant.id },
            data: { credits: { decrement: 1 } },
          });

          merchantWinbacks++;
          merchantCreditsUsed++;
        }

        if (merchantWinbacks > 0) {
          await prisma.campaign.create({
            data: {
              merchantId: merchant.id,
              title: "أوتوماتيك: استرجاع الزبناء الغابرين (Win-Back)",
              message: `تم إرسال دعوة استرجاع إلى ${merchantWinbacks} زبون غائب منذ أكثر من 14 يوماً.`,
              audience: "QUIET",
              sentCount: merchantWinbacks,
              creditsUsed: merchantWinbacks,
            },
          });
        }
      }

      // -------------------------------------------------------------
      // 2. Near-Reward Nudge Engine (autoNearReward) - Free 0 Credits
      // -------------------------------------------------------------
      if (merchant.autoNearReward) {
        let nearCustomers = merchant.customers.filter(
          (c) => c.stamps === merchant.stampsRequired - 1
        );

        if (nearCustomers.length === 0 && forceDemo && merchant.customers.length > 0) {
          // If in demo mode and no customer is 1 stamp away, pick the first
          nearCustomers = [merchant.customers[0]];
        }

        for (const customer of nearCustomers) {
          await prisma.notification.create({
            data: {
              merchantId: merchant.id,
              customerId: customer.id,
              type: "NEAR_REWARD",
              title: "باقي ليك غير طابع واحد! ☕",
              body: `باقي ليك غير طابع واحد على ${merchant.rewardName} فـ ${merchant.name}! دوز كمل الكارط ديالك اليوم.`,
              actionUrl: `/pass/${customer.passSerial}`,
            },
          });

          merchantNearRewards++;
        }
      }

      totalWinbacks += merchantWinbacks;
      totalNearRewards += merchantNearRewards;
      totalCreditsDeducted += merchantCreditsUsed;

      executionLog.push({
        merchantName: merchant.name,
        merchantSlug: merchant.slug,
        winbacks: merchantWinbacks,
        nearRewards: merchantNearRewards,
        creditsDeducted: merchantCreditsUsed,
      });
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

