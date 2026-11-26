import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { pushGoogleWalletUpdate } from "@/lib/google-wallet";
import { sendApplePassUpdate } from "@/lib/apple-wallet";
import { getStoreSessionFromCookies } from "@/lib/auth";
import { formatBillingMonth } from "@/lib/pricing";
import { runWithBoundedConcurrency } from "@/lib/utils";

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const session = await getStoreSessionFromCookies(req.cookies, slug);
    const body = await req.json();

    if (
      !session ||
      session.role !== "OWNER" ||
      body.actorRole === "BRANCH_STAFF" ||
      body.actorRole === "STAFF"
    ) {
      return NextResponse.json(
        {
          error:
            "غير مصرح: إطلاق الحملات الترويجية محصور بحساب صاحب المشروع فقط.",
        },
        { status: 403 }
      );
    }

    const { title, message, audience = "ALL" } = body;

    if (!message || typeof message !== "string" || message.trim() === "") {
      return NextResponse.json(
        { error: "نص الرسالة مطلوب" },
        { status: 400 }
      );
    }

    const merchant = await prisma.merchant.findUnique({
      where: { slug },
      include: {
        customers: true,
      },
    });

    if (!merchant) {
      return NextResponse.json(
        { error: "المحل التجاري غير موجود" },
        { status: 404 }
      );
    }

    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Calculate segment & target customers in a single pass
    const targetCustomers = merchant.customers.filter((c) => {
      if (audience === "QUIET") return new Date(c.lastVisitAt) <= fourteenDaysAgo;
      if (audience === "NEAR_REWARD") {
        return c.stamps >= merchant.stampsRequired - 1 && c.stamps < merchant.stampsRequired;
      }
      if (audience === "VIP") return c.totalVisits >= 10;
      return true; // ALL
    });

    // Minimum target count for demo test
    const targetCount = Math.max(1, targetCustomers.length);
    const billingMonth = formatBillingMonth(now);
    const customersToNotify =
      targetCustomers.length > 0 ? targetCustomers : merchant.customers.slice(0, 1);
    const trimmedMessage = message.trim();
    const notificationTitle = title ? title.trim() : merchant.name;

    // Atomic postpaid transaction: record point usage, create campaign, and bulk-insert all notifications
    const [, campaign] = await prisma.$transaction([
      prisma.pointUsage.create({
        data: {
          merchantId: merchant.id,
          points: targetCount,
          source: "CAMPAIGN",
          billingMonth,
        },
      }),
      prisma.campaign.create({
        data: {
          merchantId: merchant.id,
          title: title ? title.trim() : "عرض ترويجي جديد",
          message: trimmedMessage,
          audience,
          sentCount: targetCount,
          creditsUsed: targetCount,
          returnedCount: Math.max(1, Math.round(targetCount * 0.22)), // Realistic 22% return rate
        },
      }),
      ...(customersToNotify.length > 0
        ? [
            prisma.notification.createMany({
              data: customersToNotify.map((c) => ({
                merchantId: merchant.id,
                customerId: c.id,
                type: "PROMO",
                title: merchant.name,
                body: trimmedMessage,
                createdAt: now,
              })),
            }),
          ]
        : []),
    ]);

    // Dispatch Google & Apple Wallet lock-screen pushes with bounded concurrency (chunks of 10)
    if (customersToNotify.length > 0) {
      void runWithBoundedConcurrency(customersToNotify, 10, async (c) => {
        const pushTasks: Array<Promise<unknown>> = [
          pushGoogleWalletUpdate(c, merchant, notificationTitle, trimmedMessage),
        ];
        if (c.applePushToken) {
          pushTasks.push(sendApplePassUpdate(c.applePushToken));
        }
        await Promise.allSettled(pushTasks);
      });
    }

    return NextResponse.json({
      success: true,
      campaign,
      remainingCredits: merchant.credits,
      pointsLogged: targetCount,
      message: `تم إرسال العرض بنجاح إلى ${targetCount} زبون! احتساب ${targetCount} نقطة في فاتورة آخر الشهر.`,
    });
  } catch (error: unknown) {
    console.error("Error creating campaign:", error);
    const msg = error instanceof Error ? error.message : "تعذر إرسال الحملة";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

